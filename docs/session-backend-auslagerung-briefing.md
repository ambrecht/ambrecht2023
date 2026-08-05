# Briefing: Auslagerung von Session-Editor-Logik ins Backend

## Kontext

Im Frontend unter `app/session/edit/page.tsx` läuft aktuell ein großer Teil der Session-Editor-Logik im Browser. Das betrifft nicht nur UI-Zustand, sondern auch Textsegmentierung, Block-Serialisierung, Diff-Berechnung, Finding-Mapping und NLP-Orchestrierung. Das bestehende API-Setup leitet bereits viele Routen an das Hetzner/API-Backend weiter:

- Typewriter-/SQL-Backend über `/api/...`, z. B. Sessions, Documents, Notes, Analysis-Runs.
- Writer-/NLP-Backend über `/api/v1/...`, z. B. Documents, Versions, Analyses, Tools, Actions.

Ziel der Auslagerung ist nicht, jede kleine Editor-Interaktion serverseitig zu machen. Ausgelagert werden sollten vor allem Funktionen, die Persistenz, reproduzierbare Analyseergebnisse, stabile IDs, große Texte oder versionsübergreifende Berechnungen betreffen.

## Hohe Priorität: ins Backend auslagern

### 0. "Wann wurde was geschrieben?" als GitHub-artige Schreib-Historie

Das wichtigste Auslagerungsthema ist die zeitliche Herkunft des Textes: Welche Wörter, Absätze oder Blöcke wurden wann geschrieben, geändert oder gelöscht? Diese Übersicht sollte ähnlich wie GitHub funktionieren:

- Contribution-Graph pro Tag/Woche/Monat.
- Timeline der Schreibsessions.
- Versionen mit Wort-/Zeichen-Deltas.
- Blame-Ansicht pro Absatz/Block/Zeile: wann entstand dieser Textbereich?
- Aktivitätsübersicht: Schreibdauer, Schreibtempo, Netto-Zuwachs, Änderungen, Löschungen.

Aktuell kann der Client nur aus `created_at`, `updated_at`, lokalen Versionen, Live-Session-History und Text-Diffs ableiten, wann etwas entstanden sein könnte. Das ist für eine belastbare Übersicht zu ungenau und nicht browserübergreifend stabil.

Warum ins Backend:

- Nur das Backend sieht alle gespeicherten Versionen, Live-Events und SQL-Zeitstempel vollständig.
- Die Berechnung braucht persistente Snapshots und Deltas, nicht nur den aktuellen Text im Browser.
- Eine GitHub-artige Übersicht muss reload-, geräte- und nutzerunabhängig sein.
- Diffs über viele Versionen sind rechenintensiv und sollten gecacht werden.
- Die Darstellung braucht stabile IDs für Textbereiche, Versionen und Schreibereignisse.

Backend sollte beim Speichern jeder Version ein Delta zur Parent-Version berechnen und speichern:

- hinzugefügte Textbereiche
- gelöschte Textbereiche
- geänderte Textbereiche
- unveränderte Textbereiche mit ursprünglichem `authored_at`
- Wort-/Zeichen-Deltas
- optional Schreibdauer, wenn Live-Events vorhanden sind

Vorschlag Datenmodell:

```sql
document_versions
- id
- document_id
- parent_id
- session_id
- created_at
- text_hash
- word_count
- char_count
- inserted_words
- deleted_words
- changed_words

document_text_spans
- id
- document_id
- version_id
- block_id
- start_offset
- end_offset
- text_hash
- authored_at
- last_touched_at
- origin_version_id
- status -- active | deleted | moved

writing_events
- id
- document_id
- session_id
- version_id
- event_type -- live_input | save | edit | action
- created_at
- words_before
- words_after
- inserted_words
- deleted_words
- char_delta
- duration_ms
```

Vorschlag Endpoints:

```http
GET /documents/{document_id}/writing-overview?from=2026-01-01&to=2026-12-31
GET /documents/{document_id}/writing-timeline?group_by=day
GET /documents/{document_id}/blame?version_id={session_id}&mode=block
GET /documents/{document_id}/versions/{session_id}/writing-delta
```

Response für die Übersicht:

```json
{
  "document_id": 12,
  "range": {
    "from": "2026-01-01",
    "to": "2026-12-31"
  },
  "totals": {
    "active_words": 42100,
    "inserted_words": 58300,
    "deleted_words": 16200,
    "writing_days": 48,
    "estimated_minutes": 1320
  },
  "days": [
    {
      "date": "2026-08-05",
      "versions": 4,
      "inserted_words": 870,
      "deleted_words": 120,
      "net_words": 750,
      "sessions": 2
    }
  ]
}
```

Response für eine Blame-/Provenance-Ansicht:

```json
{
  "document_id": 12,
  "version_id": 456,
  "mode": "block",
  "spans": [
    {
      "block_id": "uuid",
      "start_offset": 0,
      "end_offset": 148,
      "authored_at": "2026-08-05T14:21:00Z",
      "last_touched_at": "2026-08-05T16:03:00Z",
      "origin_version_id": 123,
      "preview": "Erster Absatz ..."
    }
  ]
}
```

Akzeptanzkriterien für diese Funktion:

- Die Übersicht funktioniert ohne `localStorage`.
- Pro Tag kann angezeigt werden, wie viele Wörter brutto geschrieben, gelöscht und netto behalten wurden.
- Für den aktuellen Text kann pro Block/Absatz angezeigt werden, wann er ursprünglich geschrieben wurde.
- Versionen, die durch NLP-Actions entstehen, werden als eigene Event-Typen markiert und nicht als manuelles Schreiben gezählt.
- Live-Session-Events aus `/live-sessions/{id}/history` werden, falls vorhanden, in die Schreibdauer und Zwischenstände einbezogen.

### 1. Analyse-Orchestrierung pro Session/Preset

Aktuell im Frontend:

- `handleRunAnalysis` erstellt oder aktualisiert ein NLP-Dokument.
- startet `analyzeNlpVersion`.
- ruft je nach Preset mehrere NLP-Tools auf:
  - `getNlpAdverbTool`
  - `getNlpDescriptionTool`
  - `getNlpTensePovTool`
  - `getNlpKwic`
- mappt alle Tool-Antworten clientseitig in `Finding[]`.
- vergibt synthetische Finding-IDs ab `1`.

Warum ins Backend:

- Findings brauchen stabile IDs, nicht synthetische Browser-IDs.
- Ergebnisse sollten in SQL persistiert und später wieder abrufbar sein.
- Gleicher Text + gleiche Config sollte reproduzierbar sein.
- Backend kann Analyse-Runs deduplizieren, cachen und mit `engine_version`/`config_hash` versionieren.
- Der Client sollte nicht wissen müssen, welche NLP-Tools für welches Preset parallel laufen.

Vorschlag Endpoint:

```http
POST /sessions/{session_id}/workshop-runs
```

Request:

```json
{
  "preset": "style_tighten",
  "text": "...",
  "lang": "de",
  "options": {
    "kwic_term": null
  }
}
```

Response:

```json
{
  "success": true,
  "data": {
    "run_id": 123,
    "session_id": 456,
    "document_id": 789,
    "version_id": 1011,
    "analysis_id": 1213,
    "preset": "style_tighten",
    "engine_version": "writer-mvp-...",
    "config_hash": "...",
    "scanned_at": "2026-08-05T...",
    "text_hash": "...",
    "findings": [
      {
        "id": 1,
        "finding_type": "adverb",
        "severity": "warn",
        "start_offset": 10,
        "end_offset": 15,
        "explanation": "Adverb entfernen macht den Satz oft pointierter ...",
        "metrics": {
          "token": "schnell",
          "kind": "adverb",
          "source_finding_id": 999
        }
      }
    ]
  }
}
```

Zusätzlich sinnvoll:

- `GET /sessions/{session_id}/workshop-runs?limit=...`
- `GET /workshop-runs/{run_id}`
- `GET /workshop-runs/{run_id}/findings?start=0&end=...&types=adverb,description`
- `PATCH /findings/{finding_id}` für Status wie `ignored`, `resolved`, `accepted`.

### 2. Persistente Findings statt clientseitigem Mapping

Aktuell baut der Client Findings aus NLP-Tool-Antworten. Die eigentliche `Finding`-Struktur ist bereits in `lib/api/types.ts` vorhanden und passt gut zur SQL-Persistenz:

- `analysis_run_id`
- `session_id`
- `finding_type`
- `severity`
- `start_offset`
- `end_offset`
- `explanation`
- `metrics`

Empfehlung:

- Backend speichert Findings pro Analysis-/Workshop-Run.
- Backend normalisiert Tool-spezifische Felder in `metrics`.
- Backend liefert eine einheitliche Finding-Liste an das Frontend.
- `ignoredFindingIds` sollte nicht nur lokal im React-State leben, sondern serverseitig persistiert werden.

Minimaler DB-Ausbau:

- `findings.status`: `open | ignored | resolved | accepted`
- `findings.source`: z. B. `adverbs`, `descriptions`, `tense_pov_distance`, `kwic`
- `findings.source_finding_id`: ID aus dem NLP-Service, falls vorhanden
- `analysis_runs.preset`
- `analysis_runs.text_hash`
- `analysis_runs.nlp_document_id`
- `analysis_runs.nlp_version_id`
- `analysis_runs.nlp_analysis_id`

### 3. Block-Snapshot und Block-Metadaten pro Version

Aktuell liegt ein Teil der Block-Versionierung in `localStorage` über `lib/session-editor/versionStore.ts`. Dadurch sind Block-IDs, Labels und Block-Zuordnung nur auf einem Gerät/Browser zuverlässig verfügbar.

Aus dem Frontend betroffen:

- `parseTextToBlocks`
- `serializeBlocksToText`
- `computeBlockStats`
- lokale `SessionVersion.blocks`
- geparkte Block-IDs
- Block-Labels
- `computeMovedBlocks` für Versionsvergleich

Empfehlung:

Beim Speichern einer Session-Version sollte das Backend optional einen Block-Snapshot entgegennehmen und persistieren:

```http
POST /sessions/{session_id}/edits
```

Request-Erweiterung:

```json
{
  "text": "...",
  "blocks": [
    {
      "id": "uuid",
      "order": 0,
      "type": "paragraph",
      "text": "Erster Satz.",
      "labels": [],
      "paragraph_id": "p-1",
      "stats": {
        "words": 2,
        "chars": 12
      }
    }
  ],
  "parked_block_ids": []
}
```

Response-Erweiterung:

```json
{
  "id": 123,
  "text": "...",
  "word_count": 100,
  "char_count": 700,
  "letter_count": 580,
  "blocks": [...]
}
```

Warum:

- Block-Struktur bleibt über Browser und Geräte hinweg erhalten.
- Version-Diffs können zuverlässig Block-Bewegungen anzeigen.
- Labels und geparkte Blöcke gehen nicht verloren.
- Backend kann später blockbasierte Analyse- oder Review-Funktionen anbieten.

### 4. Text- und Version-Statistiken

Aktuell berechnet der Client Wortzahlen und Block-Stats selbst:

- `wordCount` in `app/session/edit/page.tsx`
- `computeBlockStats` in `lib/session-editor/blocks.ts`
- Session-Typen enthalten bereits `word_count`, `char_count`, `letter_count`.

Empfehlung:

Backend sollte beim Erstellen jeder Session-Version kanonische Statistiken berechnen:

- `word_count`
- `char_count`
- `letter_count`
- optional: `paragraph_count`, `sentence_count`, `block_count`
- optional pro Block: `words`, `chars`

Der Client darf diese Werte für Sofortfeedback weiter lokal berechnen, aber die gespeicherten Werte sollten aus dem Backend kommen.

### 5. Versions-Diff und Move-Erkennung für gespeicherte Versionen

Aktuell im Frontend:

- `computeLineDiff` in `app/session/edit/page.tsx`
- `computeMovedBlocks` in `lib/session-editor/blocks.ts`

Warum ins Backend:

- Diff-Berechnung kann bei großen Texten teuer werden.
- Der Client bricht bei `aLines.length * bLines.length > 500000` ab.
- Backend kann Diffs cachen und zusammen mit Versionen bereitstellen.
- Mit persistierten Block-Snapshots kann Move-Erkennung genauer werden.

Vorschlag Endpoint:

```http
GET /documents/{document_id}/diff?left={session_id}&right={session_id}&mode=line
GET /documents/{document_id}/diff?left={session_id}&right={session_id}&mode=block
```

Response für Line-Diff:

```json
{
  "too_large": false,
  "lines": [
    { "type": "equal", "text": "..." },
    { "type": "delete", "text": "..." },
    { "type": "insert", "text": "..." }
  ]
}
```

Response für Block-Moves:

```json
{
  "moved_blocks": [
    {
      "block_id": "uuid",
      "from": 3,
      "to": 8,
      "preview": "..."
    }
  ]
}
```

### 6. NLP-Actions als Backend-Workflow speichern

Aktuell:

- Frontend ruft `runRemoveAdverbsAction(versionId)` auf.
- holt danach per `getNlpVersion(action.new_version_id)` den neuen Text.
- speichert diesen Text manuell wieder via `createEdit`.

Empfehlung:

Backend sollte daraus einen atomaren Workflow machen:

```http
POST /sessions/{session_id}/actions/remove-adverbs
```

Request:

```json
{
  "source_version_id": 1011,
  "constraints": {
    "voice_lock": false,
    "no_new_facts": false
  },
  "save_as_session_version": true
}
```

Response:

```json
{
  "action_id": 55,
  "nlp_new_version_id": 2022,
  "diff": "...",
  "after_text": "...",
  "created_session": {
    "id": 789,
    "parent_id": 456,
    "document_id": 12
  }
}
```

Warum:

- Kein doppelter Roundtrip Client -> NLP -> Client -> Typewriter.
- Backend kann nachvollziehen, welche Action welche Session-Version erzeugt hat.
- Fehlerbehandlung und Rollback werden einfacher.

## Mittlere Priorität: optional auslagern

### 7. Textsegmentierung in Blöcke

Aktuell:

- `parseTextToBlocks` normalisiert Zeilenumbrüche.
- trennt Absätze per Leerzeilen.
- trennt Sätze per `Intl.Segmenter('de', { granularity: 'sentence' })` oder Regex-Fallback.
- versucht bestehende Block-IDs anhand gleicher Texte und Paragraph-IDs wiederzuverwenden.

Empfehlung:

Langfristig sollte das Backend eine kanonische Segmentierung anbieten:

```http
POST /text/segment
```

Request:

```json
{
  "text": "...",
  "lang": "de",
  "previous_blocks": [...]
}
```

Response:

```json
{
  "blocks": [...]
}
```

Begründung:

- Einheitliche Satzsegmentierung unabhängig vom Browser.
- Besser testbar mit deutschen Abkürzungen, Dialogen, Ellipsen, Anführungszeichen.
- Grundlage für stabile Offsets zwischen Text, Blocks und Findings.

Wichtig: Für flüssige Editor-Interaktionen kann der Client weiterhin lokal segmentieren. Backend-Segmentierung sollte aber die kanonische Version beim Speichern/Analysieren sein.

### 8. KWIC und Wiederholungsanalyse erweitern

Aktuell gibt es bereits `GET /analyses/{id}/tools/kwic?term=...`.

Backend-Erweiterung:

- automatische Kandidaten für Wiederholungen liefern, nicht nur manuell eingegebenen Begriff.
- n-Gramme, Lemmas, Häufigkeit je Kapitel/Absatz, Distanz zwischen Vorkommen.
- Stopword-Filter für Deutsch.

Möglicher Endpoint:

```http
GET /analyses/{analysis_id}/tools/repetitions?min_count=3&window=500
```

## Im Client lassen

Diese Funktionen sollten vorerst im Frontend bleiben, weil sie direkte UI-Interaktion sind und keine zentrale Persistenz brauchen:

- Undo/Redo-History während der Bearbeitung.
- Auswahlzustände: `selectedBlockIds`, `expandedBlockId`, `activeBlockMatch`.
- Scroll-/Textarea-Jump-Logik.
- Filter/Toggles der sichtbaren Findings, solange Statusänderungen nicht persistent sein müssen.
- Sofortiges lokales Suchen und Ersetzen im aktuell geöffneten Text.
- Lokales Parken von Blöcken als temporärer Draft-Zustand, solange es nicht versioniert werden soll.

Wichtig: Wenn geparkte Blöcke produktiv Teil des Workflows werden, sollten sie zusammen mit dem Block-Snapshot gespeichert werden.

## Empfohlene Umsetzung in Phasen

### Phase 0: Schreib-Historie, Deltas und Blame

Diese Phase sollte vorgezogen werden. Ohne serverseitige Schreib-Historie bleiben spätere Version-, Diff- und Blame-Ansichten nur aus dem Client geraten.

- Beim Speichern jeder Version Delta zur Parent-Version berechnen.
- `writing_events` und `document_text_spans` persistieren.
- `GET /documents/{id}/writing-overview` für Contribution-Graph und Kennzahlen.
- `GET /documents/{id}/blame` für "wann wurde dieser Block/Absatz geschrieben?".
- NLP-/Automation-Versionen als `event_type=action` markieren.

### Phase 1: Persistente Workshop-Runs und Findings

- Neuen Backend-Endpunkt `POST /sessions/{session_id}/workshop-runs`.
- Backend orchestriert NLP-Document/Version/Analysis/Tools.
- Backend speichert `analysis_run` und `findings`.
- Frontend ersetzt clientseitiges Finding-Mapping durch einen einzelnen API-Call.
- Finding-Status `ignored` persistieren.

### Phase 2: Block-Snapshots bei Session-Versionen

- `POST /sessions/{session_id}/edits` erweitert um `blocks` und `parked_block_ids`.
- `GET /sessions/{id}` liefert gespeicherte Blocks zurück.
- `GET /documents/{id}/versions` liefert optional Block-Metadaten oder einen Include-Parameter:

```http
GET /documents/{id}/versions?include=blocks
```

### Phase 3: Server-Diff und Action-Workflows

- `GET /documents/{document_id}/diff`.
- `POST /sessions/{session_id}/actions/remove-adverbs`.
- Diff-/Action-Ergebnisse speichern und wieder abrufbar machen.

### Phase 4: Kanonische Segmentierung und erweiterte Wiederholungsanalyse

- `POST /text/segment`.
- `GET /analyses/{analysis_id}/tools/repetitions`.
- Testkorpus für deutsche Prosa/Dialoge aufbauen.

## Akzeptanzkriterien

- GitHub-artige Schreibübersicht pro Dokument ist serverseitig abrufbar.
- Pro aktuellem Block/Absatz ist `authored_at` und `last_touched_at` bekannt.
- Wort-Deltas pro Tag und Version werden serverseitig berechnet.
- Ein Workshop-Scan liefert stabile, persistierte Finding-IDs.
- Derselbe Scan ist über `GET /workshop-runs/{id}` erneut abrufbar.
- Ignorierte Findings bleiben nach Reload/Browserwechsel erhalten.
- Eine gespeicherte Version verliert keine Block-Labels oder Block-IDs.
- Diff zwischen zwei gespeicherten Versionen funktioniert ohne lokale `localStorage`-Daten.
- NLP-Action `remove_adverbs` kann eine neue Session-Version erzeugen, ohne dass der Client den Zwischentext manuell speichern muss.

## Hinweise für die Frontend-Anpassung

Nach Backend-Umsetzung kann `app/session/edit/page.tsx` deutlich schlanker werden:

- `handleRunAnalysis` ruft nur noch `POST /sessions/{id}/workshop-runs`.
- `mappedFindings` und `syntheticId` entfallen.
- `scanMeta` kommt aus dem Backend.
- `ignoredFindingIds` wird durch Finding-Status ersetzt.
- `localStorage`-Versionen werden durch serverseitige Block-Snapshots ersetzt.
- `computeLineDiff` und `computeMovedBlocks` werden optional nur noch als Fallback genutzt.
