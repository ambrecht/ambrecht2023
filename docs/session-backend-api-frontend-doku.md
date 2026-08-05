# Session-Editor Backend-API: Frontend-Integrationsdoku

Stand: 2026-08-05  
Backend: Hetzner Typewriter API, `/api/v1`

## Kurzfassung

Die Session-Editor-Logik wurde im Backend erweitert, damit das Frontend nicht mehr alles aus `localStorage`, Browser-Diffs und clientseitigem NLP-Mapping rekonstruieren muss.

Neu im Backend sind:

- Schreib-Historie pro Dokument ueber `writing_events`
- Blame-/Provenance-Daten pro Textblock ueber `document_text_spans`
- persistente Block-Snapshots pro Session-Version
- persistente Workshop-Runs und Findings
- persistenter Finding-Status: `open`, `ignored`, `resolved`, `accepted`
- serverseitige Diffs fuer gespeicherte Versionen
- serverseitiger Action-Workflow fuer `remove-adverbs`

Wichtig: Alte bestehende Versionen haben noch keine vollstaendigen Blame-Spans und Block-Snapshots. Diese Daten entstehen ab jetzt beim Speichern neuer Versionen ueber `POST /sessions/{id}/edits`.

## Deployment-Status

Die neue API ist auf dem Hetzner-Server deployed.

Verifiziert wurden:

- `GET /api/health` -> `200`
- `GET /api/v1/sessions?limit=1` mit API-Key -> `200`
- `GET /api/v1/documents/{id}/writing-overview` -> `200`
- `GET /api/v1/documents/{id}/blame` -> `200`

Die Migration `017_session_backend_editor` ist ausgefuehrt.

## Auth

Alle hier genannten `/api/v1/...` Endpoints brauchen wie bisher den Header:

```http
x-api-key: <API_KEY>
```

Ausnahme bleiben die bereits vorhandenen public Live-Session-Routen.

## 1. Session-Version speichern mit Block-Snapshot

### Endpoint

```http
POST /api/v1/sessions/{session_id}/edits
```

### Zweck

Dieser Endpoint speichert eine neue Version. Neu ist: Das Frontend kann beim Speichern die aktuelle Block-Struktur mitschicken. Das Backend persistiert daraus:

- kanonische Version-Statistiken
- Schreibevent mit Wort-/Zeichendelta
- Block-Snapshot
- geparkte Block-IDs
- Blame-Spans fuer die aktuelle Version

### Request, minimal kompatibel

Bestehende Clients funktionieren weiter:

```json
{
  "text": "Der vollstaendige Text ..."
}
```

### Request, empfohlen fuer den neuen Editor

```json
{
  "text": "Erster Absatz.\n\nZweiter Absatz.",
  "event_type": "edit",
  "blocks": [
    {
      "id": "block-uuid-1",
      "order": 0,
      "type": "paragraph",
      "text": "Erster Absatz.",
      "labels": ["intro"],
      "paragraph_id": "p-1",
      "stats": {
        "words": 2,
        "chars": 14
      }
    },
    {
      "id": "block-uuid-2",
      "order": 1,
      "type": "paragraph",
      "text": "Zweiter Absatz.",
      "labels": [],
      "paragraph_id": "p-2",
      "stats": {
        "words": 2,
        "chars": 15
      }
    }
  ],
  "parked_block_ids": []
}
```

### `event_type`

Erlaubte Werte:

- `edit`: normale manuelle Bearbeitung, Default
- `save`: explizites Speichern
- `action`: automatisch erzeugte Version durch Backend-/NLP-Action
- `live_input`: Live-Input-Event

Das Frontend sollte bei normalen Speichervorgaengen `edit` oder `save` senden. Fuer NLP-Actions sollte das Frontend den Action-Endpoint verwenden, nicht selbst `event_type=action` setzen.

### Response

```json
{
  "success": true,
  "message": "Bearbeitung gespeichert",
  "data": {
    "id": 123,
    "title": null,
    "status": "draft",
    "tags": [],
    "text": "Erster Absatz.\n\nZweiter Absatz.",
    "created_at": "2026-08-05T15:51:00.000Z",
    "updated_at": "2026-08-05T15:51:00.000Z",
    "word_count": 4,
    "char_count": 31,
    "letter_count": 27,
    "parent_id": 100,
    "document_id": 12,
    "blocks": [
      {
        "id": "block-uuid-1",
        "order": 0,
        "type": "paragraph",
        "text": "Erster Absatz.",
        "labels": ["intro"],
        "paragraph_id": "p-1",
        "stats": {
          "words": 2,
          "chars": 14
        },
        "metadata": {}
      }
    ],
    "parked_block_ids": []
  }
}
```

### Frontend-Anpassung

In `app/session/edit/page.tsx` sollte beim Speichern nicht nur `text`, sondern auch `blocks` und `parked_block_ids` gesendet werden.

Clientseitige Funktionen wie `parseTextToBlocks`, `serializeBlocksToText` und `computeBlockStats` koennen weiter fuer Live-Editor-Feedback genutzt werden. Die gespeicherte Wahrheit kommt aber nach dem Save aus der API-Response.

## 2. Dokument-Versionen mit Blocks laden

### Endpoint

```http
GET /api/v1/documents/{document_id}/versions?include=blocks
```

### Zweck

Laedt gespeicherte Versionen eines Dokuments. Mit `include=blocks` liefert das Backend pro Version die persistierten Block-Snapshots und geparkten Block-IDs.

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "text": "...",
      "created_at": "2026-08-05T15:51:00.000Z",
      "word_count": 120,
      "char_count": 820,
      "letter_count": 700,
      "parent_id": 100,
      "document_id": 12,
      "blocks": [],
      "parked_block_ids": []
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 4
  }
}
```

### Frontend-Anpassung

`localStorage`-basierte Versionen aus `lib/session-editor/versionStore.ts` sollten schrittweise durch diese Server-Versionen ersetzt werden.

Empfehlung:

- Beim Oeffnen einer Session erst Server-Versionen laden.
- Wenn `blocks` vorhanden sind, diese als kanonischen Snapshot nutzen.
- Wenn `blocks` fehlen, lokal aus `text` segmentieren. Das betrifft vor allem Altbestand.

## 3. Schreibuebersicht / Contribution Graph

### Globaler Endpoint fuer die Dashboard-Heatmap

Fuer die globale Ansicht "Wann du geschrieben hast" gibt es einen frontendfertigen Endpoint:

```http
GET /api/v1/sessions/writing-overview?days=365
```

Dieser Endpoint ist nicht dokumentbezogen, sondern aggregiert alle aktiven Root-Sessions im Zeitraum. Er ist fuer die Dashboard-Kachel gedacht und liefert nur Daten, die das Frontend direkt rendern muss.

Response:

```json
{
  "success": true,
  "data": {
    "range": {
      "from": "2025-08-06",
      "to": "2026-08-05",
      "days": 365
    },
    "stats": {
      "words": 86583,
      "active_days": 132,
      "streak_days": 8,
      "sessions": {
        "written": 355,
        "total": 504
      }
    },
    "days": [
      {
        "date": "2025-08-06",
        "words": 0,
        "sessions": 0,
        "level": 0
      },
      {
        "date": "2026-08-05",
        "words": 683,
        "sessions": 3,
        "level": 1
      }
    ],
    "legend": {
      "min_level": 0,
      "max_level": 4
    }
  }
}
```

Mapping fuer die UI:

- `stats.words` -> "Woerter"
- `stats.active_days` -> "Aktive Tage"
- `stats.streak_days` -> "Serie"
- `stats.sessions.written` und `stats.sessions.total` -> "Sessions 355 von 504"
- `days` -> Heatmap-Kacheln
- `days[].level` -> Farbintensitaet von 0 bis 4
- `days[].sessions` -> Tooltip/Detail: wie viele Sessions an diesem Tag geschrieben wurden
- `days[].words` -> Tooltip/Detail: wie viele Woerter an diesem Tag geschrieben wurden

Hinweis: Der Endpoint fuellt alle Tage im Zeitraum auf. Tage ohne Aktivitaet kommen mit `words=0`, `sessions=0`, `level=0`.

### Dokumentbezogener Endpoint

### Endpoint

```http
GET /api/v1/documents/{document_id}/writing-overview?from=2026-01-01T00:00:00.000Z&to=2026-12-31T23:59:59.999Z
```

`from` und `to` sind optional, muessen aber ISO-Datetimes mit Offset sein, wenn sie gesetzt werden.

### Zweck

Liefert Tagesdaten fuer eine GitHub-artige Schreibuebersicht:

- brutto geschriebene Woerter
- geloeschte Woerter
- netto behaltene Woerter
- Anzahl Versionen
- Anzahl Sessions
- geschaetzte Schreibzeit, falls Daten vorhanden sind

Actions werden in den manuellen Wortzahlen nicht mitgezaehlt.

### Response

```json
{
  "success": true,
  "data": {
    "document_id": 12,
    "range": {
      "from": "2026-01-01T00:00:00.000Z",
      "to": "2026-12-31T23:59:59.999Z"
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
        "sessions": 2,
        "estimated_minutes": 0
      }
    ]
  }
}
```

### Frontend-Anpassung

Der Contribution Graph sollte nicht mehr aus `localStorage`, `created_at` und lokalen Diffs geraten werden. Stattdessen:

- `writing-overview` fuer Jahr/Monat/Zeitraum laden.
- `days[].inserted_words`, `deleted_words`, `net_words` direkt rendern.
- Bei Altbestand kann `days` leer sein, bis neue Versionen gespeichert werden.

## 4. Schreib-Timeline

### Endpoint

```http
GET /api/v1/documents/{document_id}/writing-timeline?group_by=day
```

Optionale Query-Parameter:

- `group_by`: `day`, `week`, `month`
- `from`: ISO-Datetime mit Offset
- `to`: ISO-Datetime mit Offset

### Response

```json
{
  "success": true,
  "data": {
    "document_id": 12,
    "group_by": "day",
    "items": [
      {
        "date": "2026-08-05",
        "versions": 4,
        "inserted_words": 870,
        "deleted_words": 120,
        "net_words": 750,
        "sessions": 2,
        "estimated_minutes": 0
      }
    ]
  }
}
```

### Frontend-Anpassung

Fuer Timeline-Ansichten bitte diesen Endpoint verwenden statt lokale Version-History zu gruppieren.

## 5. Blame / Provenance pro Block

### Endpoint

```http
GET /api/v1/documents/{document_id}/blame?version_id={version_id}&mode=block
```

Query-Parameter:

- `version_id`: optional. Wenn leer, nimmt das Backend die neueste Version des Dokuments.
- `mode`: aktuell `block`, `paragraph`, `line`. Der Backend-Datenbestand ist derzeit block-orientiert.

### Response

```json
{
  "success": true,
  "data": {
    "document_id": 12,
    "version_id": 456,
    "mode": "block",
    "spans": [
      {
        "block_id": "block-uuid-1",
        "start_offset": 0,
        "end_offset": 148,
        "authored_at": "2026-08-05T14:21:00.000Z",
        "last_touched_at": "2026-08-05T16:03:00.000Z",
        "origin_version_id": 123,
        "preview": "Erster Absatz ..."
      }
    ]
  }
}
```

### Frontend-Anpassung

Fuer eine Blame-Ansicht:

- Session-Version laden.
- `blame` fuer die Version laden.
- Spans anhand `block_id` den sichtbaren Blocks zuordnen.
- `authored_at` als Entstehungszeit anzeigen.
- `last_touched_at` als letzte Aenderung anzeigen.

Fallback:

- Wenn `spans` leer ist, handelt es sich wahrscheinlich um Altbestand oder eine Version ohne gespeicherten Block-Snapshot. Dann UI leer/neutral anzeigen, nicht aus lokaler History "raten".

## 6. Server-Diff zwischen Versionen

### Endpoint Line-Diff

```http
GET /api/v1/documents/{document_id}/diff?left={version_id_a}&right={version_id_b}&mode=line
```

### Response

```json
{
  "success": true,
  "data": {
    "too_large": false,
    "lines": [
      { "type": "equal", "text": "Unveraenderte Zeile" },
      { "type": "delete", "text": "Alte Zeile" },
      { "type": "insert", "text": "Neue Zeile" }
    ]
  }
}
```

### Endpoint Block-Moves

```http
GET /api/v1/documents/{document_id}/diff?left={version_id_a}&right={version_id_b}&mode=block
```

### Response

```json
{
  "success": true,
  "data": {
    "moved_blocks": [
      {
        "block_id": "block-uuid-1",
        "from": 3,
        "to": 8,
        "preview": "Textanfang ..."
      }
    ]
  }
}
```

### Frontend-Anpassung

`computeLineDiff` und `computeMovedBlocks` im Client sollten nur noch Fallbacks sein.

Empfehlung:

- Fuer gespeicherte Versionen zuerst Backend-Diff nutzen.
- Nur fuer ungespeicherte Draft-Vergleiche lokal diffen.
- Bei `mode=block` funktioniert Move-Erkennung nur gut, wenn beide Versionen mit Block-Snapshots gespeichert wurden.

## 7. Workshop-Runs / Analyse-Orchestrierung

### Endpoint

```http
POST /api/v1/sessions/{session_id}/workshop-runs
```

### Zweck

Das Frontend soll nicht mehr mehrere NLP-Tools selbst orchestrieren und Findings clientseitig mappen. Stattdessen ruft es einen Workshop-Run auf und bekommt persistierte Findings mit stabilen IDs zurueck.

Aktueller Stand im Backend:

- Run wird in `analysis_runs` gespeichert.
- Findings werden in `analysis_findings` gespeichert.
- IDs sind DB-IDs und damit reload-stabil.
- Derselbe Run kann ueber `GET /workshop-runs/{run_id}` und `GET /workshop-runs/{run_id}/findings` erneut geladen werden.
- Der derzeitige Backend-Runner erzeugt deterministische lokale Findings fuer Adverb-/KWIC-Faelle. Die Struktur ist so gelegt, dass echte NLP-Service-Toolcalls spaeter hinter demselben Endpoint ersetzt werden koennen.

### Request

```json
{
  "preset": "style_tighten",
  "text": "Der Text, der analysiert werden soll ...",
  "lang": "de",
  "options": {
    "kwic_term": null
  }
}
```

### Response

```json
{
  "success": true,
  "data": {
    "id": 123,
    "run_id": 123,
    "session_id": 456,
    "version_id": 456,
    "analysis_id": 123,
    "preset": "style_tighten",
    "engine_version": "writer-local-de-v1",
    "config": {
      "preset": "style_tighten",
      "lang": "de",
      "options": {
        "kwic_term": null
      }
    },
    "config_hash": "...",
    "text_hash": "...",
    "scanned_at": "2026-08-05T15:51:00.000Z",
    "created_at": "2026-08-05T15:51:00.000Z",
    "completed_at": "2026-08-05T15:51:00.000Z",
    "findings": [
      {
        "id": 999,
        "analysis_run_id": 123,
        "session_id": 456,
        "finding_type": "adverb",
        "severity": "warn",
        "start_offset": 10,
        "end_offset": 18,
        "explanation": "Adverb pruefen: Streichen oder durch ein praeziseres Verb ersetzen.",
        "metrics": {
          "token": "ploetzlich",
          "source": "local_workshop"
        },
        "status": "open",
        "source": "adverbs",
        "source_finding_id": "adverbs:10:ploetzlich"
      }
    ]
  }
}
```

### Frontend-Anpassung

`handleRunAnalysis` sollte vereinfacht werden:

Alt:

- NLP-Dokument erstellen/aktualisieren
- NLP-Version analysieren
- mehrere Tools parallel aufrufen
- Tool-Antworten in `Finding[]` mappen
- synthetische IDs ab `1` vergeben

Neu:

- `POST /sessions/{session_id}/workshop-runs` aufrufen
- `data.findings` direkt in den Editor-State uebernehmen
- `data.run_id`, `engine_version`, `config_hash`, `scanned_at`, `text_hash` fuer Scan-Metadaten verwenden
- keine synthetischen Finding-IDs mehr erzeugen

## 8. Workshop-Runs erneut laden

### Run-Metadaten

```http
GET /api/v1/workshop-runs/{run_id}
```

### Findings im Viewport

```http
GET /api/v1/workshop-runs/{run_id}/findings?start=0&end=10000&types=adverb,kwic
```

Query-Parameter:

- `start`: Startoffset, Pflicht
- `end`: Endoffset, Pflicht
- `types`: optionale kommaseparierte Liste

### Response Findings

```json
{
  "success": true,
  "data": [
    {
      "id": 999,
      "analysis_run_id": 123,
      "session_id": 456,
      "finding_type": "adverb",
      "severity": "warn",
      "start_offset": 10,
      "end_offset": 18,
      "explanation": "...",
      "metrics": {},
      "status": "open",
      "source": "adverbs"
    }
  ]
}
```

### Frontend-Anpassung

Fuer lange Texte kann das Frontend Findings viewport-basiert laden statt immer alle Findings im Speicher zu halten.

## 9. Finding-Status persistieren

### Endpoint

```http
PATCH /api/v1/findings/{finding_id}
```

### Request

```json
{
  "status": "ignored"
}
```

Erlaubte Werte:

- `open`
- `ignored`
- `resolved`
- `accepted`

### Response

```json
{
  "success": true,
  "data": {
    "id": 999,
    "analysis_run_id": 123,
    "session_id": 456,
    "finding_type": "adverb",
    "severity": "warn",
    "start_offset": 10,
    "end_offset": 18,
    "explanation": "...",
    "metrics": {},
    "status": "ignored",
    "source": "adverbs"
  }
}
```

### Frontend-Anpassung

`ignoredFindingIds` sollte nicht mehr nur lokal im React-State oder `localStorage` leben.

Empfehlung:

- Beim Ignorieren: `PATCH /findings/{id}` mit `{ "status": "ignored" }`.
- Beim Wiederanzeigen: `PATCH /findings/{id}` mit `{ "status": "open" }`.
- UI filtert anhand `finding.status`.
- Nach Reload kommen ignorierte Findings weiterhin als `status=ignored` vom Server.

## 10. Remove-Adverbs als Backend-Action

### Endpoint

```http
POST /api/v1/sessions/{session_id}/actions/remove-adverbs
```

### Zweck

Das Frontend soll nicht mehr:

1. NLP-Action starten
2. neue NLP-Version laden
3. Text clientseitig holen
4. Text wieder ueber `createEdit` speichern

Stattdessen macht das Backend den Workflow in einem Call und speichert auf Wunsch direkt eine neue Session-Version.

### Request

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

### Response

```json
{
  "success": true,
  "data": {
    "action_id": 55,
    "nlp_new_version_id": null,
    "diff": {
      "too_large": false,
      "lines": []
    },
    "after_text": "Text nach der Action ...",
    "created_session": {
      "id": 789,
      "parent_id": 456,
      "document_id": 12
    }
  }
}
```

### Frontend-Anpassung

Alt:

- `runRemoveAdverbsAction(versionId)`
- `getNlpVersion(action.new_version_id)`
- `createEdit(newText)`

Neu:

- `POST /sessions/{session_id}/actions/remove-adverbs`
- Wenn `created_session` gesetzt ist: neue Version in Versionsliste aufnehmen oder Versionen neu laden.
- `after_text` kann direkt im Editor angezeigt werden.
- `diff` kann fuer Vorschau/Review genutzt werden.

## 11. Was im Frontend vorerst bleiben soll

Diese Dinge bleiben weiterhin Client-State, weil sie direkte UI-Interaktion sind:

- Undo/Redo waehrend der aktiven Bearbeitung
- `selectedBlockIds`
- `expandedBlockId`
- `activeBlockMatch`
- Scroll-/Textarea-Jump-Logik
- Sofortiges lokales Suchen/Ersetzen im ungespeicherten Text
- lokale Live-Segmentierung fuer fluessiges Tippen

Wichtig: Sobald eine Version gespeichert wird, sollte die API-Response wieder als gespeicherte Wahrheit gelten.

## 12. Empfohlene Frontend-Migrationsreihenfolge

### Schritt 1: Saves erweitern

`POST /sessions/{id}/edits` so erweitern, dass `blocks` und `parked_block_ids` mitgesendet werden.

Das ist die wichtigste Umstellung, weil erst dadurch kuenftige Blame-, Diff- und Block-Move-Daten entstehen.

### Schritt 2: Server-Versionen mit Blocks laden

Beim Session-Start:

- `GET /sessions/{id}` fuer aktuelle Session
- `GET /documents/{document_id}/versions?include=blocks` fuer Versionen und Block-Snapshots

Fallback fuer alte Versionen ohne Blocks:

- lokal aus Text segmentieren

### Schritt 3: Workshop-Runs umstellen

`handleRunAnalysis` auf `POST /sessions/{id}/workshop-runs` reduzieren.

Entfernen oder deaktivieren:

- synthetische Finding-ID-Vergabe
- clientseitiges Mapping mehrerer NLP-Tool-Antworten
- lokales `ignoredFindingIds` als alleinige Wahrheit

### Schritt 4: Finding-Status serverseitig machen

Ignorieren/Akzeptieren/Aufloesen ueber `PATCH /findings/{id}`.

### Schritt 5: Writing Overview und Blame integrieren

Neue Views koennen direkt aus:

- `writing-overview`
- `writing-timeline`
- `blame`

gebaut werden.

### Schritt 6: Diffs und Actions umstellen

Gespeicherte Versionsvergleiche ueber `/documents/{id}/diff`.

`remove-adverbs` ueber Backend-Action-Endpoint.

## 13. TypeScript-Hinweise fuer Frontend-Typen

Vorschlag fuer neue/erweiterte Typen:

```ts
type FindingStatus = 'open' | 'ignored' | 'resolved' | 'accepted';

type EditorBlockSnapshot = {
  id: string;
  order: number;
  type: 'paragraph' | 'sentence' | string;
  text: string;
  labels: string[];
  paragraph_id?: string | null;
  stats?: {
    words?: number;
    chars?: number;
  };
};

type PersistedFinding = {
  id: number;
  analysis_run_id: number;
  session_id: number;
  finding_type: string;
  severity: 'info' | 'warn';
  start_offset: number;
  end_offset: number;
  explanation: string | null;
  metrics: Record<string, unknown> | null;
  status: FindingStatus;
  source?: string;
  source_finding_id?: string;
};

type WorkshopRunResponse = {
  id: number;
  run_id: number;
  session_id: number;
  version_id: number;
  analysis_id: number;
  preset: string;
  engine_version: string;
  config_hash: string;
  text_hash: string;
  scanned_at: string;
  findings: PersistedFinding[];
};
```

## 14. Bekannte Einschraenkungen

- Altbestand hat keine historischen `writing_events` oder `document_text_spans`. Diese Daten entstehen fuer neue Saves.
- `blame.spans` kann fuer alte Versionen leer sein.
- Block-Move-Diff ist nur aussagekraeftig, wenn beide Versionen mit Block-Snapshots gespeichert wurden.
- Der Workshop-Run ist API-seitig persistent, nutzt aktuell aber einen lokalen deterministischen Runner statt vollstaendiger externer NLP-Orchestrierung. Die Response-Struktur bleibt fuer spaetere echte NLP-Anbindung gleich.
- `estimated_minutes` ist nur aussagekraeftig, wenn Live-Session-Events oder Duration-Metadaten einbezogen werden. Aktuell kann der Wert `0` sein.

## 15. Schnelltest fuer Frontend-Integration

1. Neue Version mit Blocks speichern:

```http
POST /api/v1/sessions/{id}/edits
```

2. Danach pruefen:

```http
GET /api/v1/documents/{document_id}/versions?include=blocks
GET /api/v1/documents/{document_id}/blame?version_id={new_version_id}
GET /api/v1/documents/{document_id}/writing-overview
```

3. Workshop-Run testen:

```http
POST /api/v1/sessions/{new_version_id}/workshop-runs
```

4. Finding ignorieren:

```http
PATCH /api/v1/findings/{finding_id}
```

mit:

```json
{
  "status": "ignored"
}
```

Wenn diese vier Schritte funktionieren, ist die neue Backend-Strecke fuer den Editor korrekt angebunden.
