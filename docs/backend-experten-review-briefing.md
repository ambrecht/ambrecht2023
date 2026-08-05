# Briefing fuer Backend-Review: Typewriter / Session-Editor API

Stand: 2026-08-05  
Zielgruppe: Backend-Architekt:in / Senior Backend Engineer / PostgreSQL- und API-Reviewer  
System: Typewriter API auf Hetzner, Node.js/Express/TypeScript/PostgreSQL

## 1. Ziel des Reviews

Wir moechten unsere bestehende Typewriter-/Session-Editor-API fachlich bewerten lassen und konkrete Verbesserungsvorschlaege erhalten.

Im Fokus stehen:

- API-Design und Endpoint-Schnitt
- Datenmodell und Migrationen
- PostgreSQL-Performance und Indexierung
- Persistenzstrategie fuer Schreib-Historie, Versionen, Diffs, Blocks und Findings
- Robustheit bei grossen Texten und vielen Versionen
- Betrieb auf Hetzner, Deployment, Prozessmanagement und Monitoring
- Sicherheit, Auth, Rate-Limits und Datenintegritaet
- Vorbereitung auf spaetere NLP-/Writer-Workflows

Das Review soll nicht nur einzelne Bugs finden, sondern vor allem beantworten:

1. Ist die Architektur langfristig tragfaehig?
2. Welche Teile sollten wir sofort verbessern, bevor das Frontend stark darauf aufsetzt?
3. Wo entstehen technische Schulden oder Performance-Risiken?
4. Welche API-Vertraege sollten wir stabilisieren oder anders schneiden?
5. Wie koennen wir das Backend besser betreiben, testen und beobachten?

## 2. Produktkontext

Die Anwendung ist ein Schreib-/Session-Editor. Nutzer:innen schreiben laengere Prosatexte, speichern Versionen, analysieren Texte, markieren Findings und sollen eine GitHub-artige Schreibaktivitaet sehen.

Wichtige UI-Bereiche:

- Session-Editor mit Text und Block-/Absatzstruktur
- Versionen pro Dokument/Session
- Schreibaktivitaet als Heatmap: "Wann du geschrieben hast"
- Dokumentbezogene Schreibuebersicht
- Blame-/Provenance-Ansicht: Wann entstand ein Absatz/Block?
- Analyse-/Workshop-Modus mit Findings
- Finding-Status: ignoriert, akzeptiert, geloest
- NLP-Action-Workflows, z. B. "Adverbien entfernen"

Das Frontend hatte bisher viel Logik im Browser:

- Textsegmentierung
- lokale Block-Snapshots
- lokale Diffs
- lokale Version-History in `localStorage`
- clientseitiges Mapping von NLP-Tool-Antworten in Findings
- synthetische Finding-IDs
- lokale Ignored-Finding-IDs

Ziel der Backend-Erweiterung war, persistente und browseruebergreifend stabile Daten bereitzustellen.

## 3. Tech-Stack

Backend:

- Node.js 18 auf Hetzner
- Express
- TypeScript
- PostgreSQL 16
- `pg`
- `node-pg-migrate`
- `zod`
- `ws` fuer LiveSession WebSockets
- PM2 fuer den aktiven Produktionsprozess

Deployment:

- Server: Hetzner
- Pfad: `/opt/typewriter-api`
- Aktiver Prozess: PM2 root process `typewriter-api`
- Script: `/opt/typewriter-api/dist/server.js`
- Port: `3001`
- Nginx laeuft auf `80`/`443`, konkrete Hostname-/Proxy-Konfiguration sollte noch separat geprueft werden

Wichtig: Es gab vorher mehrere konkurrierende Starter:

- `typewriter-api.service` via systemd
- PM2 root process
- PM2 process unter `typewriter-user`

Im Deploy wurde aufgeraeumt:

- systemd-Service `typewriter-api.service` wurde deaktiviert/gestoppt, weil er dauerhaft wegen `EADDRINUSE :3001` crashte.
- alter `typewriter-user` PM2-Prozess wurde geloescht, weil er lange im Restart-Loop lief.
- aktiv ist aktuell nur der root-PM2-Prozess.

## 4. Aktueller API-Basispfad und Auth

Basispfad:

```http
/api/v1
```

Auth:

```http
x-api-key: <API_KEY>
```

Alle `/api/v1/...` Endpunkte sind API-Key-geschuetzt, ausser public LiveSession-Routen.

Health:

```http
GET /api/health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2026-08-05T15:52:20.383Z"
}
```

## 5. Bestehende Hauptmodule

Code-Struktur:

```text
src/modules/typewriter
src/modules/documents
src/modules/analysis
src/modules/livesession
src/modules/notes
src/modules/fragments
src/modules/collections
```

Schichtmodell:

```text
routes -> controller -> service -> repository -> PostgreSQL
```

Wichtige Dateien fuer das Review:

```text
src/app.ts
src/db.ts
src/modules/typewriter/typewriter.routes.ts
src/modules/typewriter/typewriter.controller.ts
src/modules/typewriter/typewriter.service.ts
src/modules/typewriter/typewriter.repository.ts
src/modules/typewriter/typewriter.schemas.ts
src/modules/documents/documents.routes.ts
src/modules/documents/documents.controller.ts
src/modules/documents/documents.service.ts
src/modules/documents/documents.repository.ts
src/modules/documents/documents.schemas.ts
src/modules/analysis/analysis.routes.ts
src/modules/analysis/analysis.controller.ts
src/modules/analysis/analysis.service.ts
src/modules/analysis/analysis.repository.ts
src/modules/analysis/analysis.schemas.ts
src/utils/textAnalysis.ts
db/migrations/014_documents_analysis_notes.js
db/migrations/017_session_backend_editor.js
```

## 6. Wichtige bestehende Tabellen vor der Erweiterung

### `sessions`

Zentrale Tabelle fuer Texte und Versionen.

Wichtige Spalten:

- `id`
- `text`
- `created_at`
- `updated_at`
- `word_count`
- `char_count`
- `letter_count`
- `parent_id`
- `document_id`
- `title`
- `status`
- `tags`
- `deleted_at`

Modell:

- Root-Sessions haben `parent_id IS NULL`.
- Versionen/Edits zeigen ueber `parent_id` auf die Root-Session.
- `document_id` verbindet Root und Versionen mit `documents`.

Bekannte Besonderheit:

- Es existiert eine Unique-Logik ueber normalisierte Texte (`ux_sessions_normhash_pg`), gleichzeitig sollen Edits mit gleichem Text neue Versionen erzeugen koennen. Bitte pruefen, ob die aktuelle Insert-Strategie langfristig konsistent ist.

### `documents`

Container fuer Versionen.

Wichtige Spalten:

- `id`
- `root_session_id`
- `created_at`

Wichtig:

- Es gibt einen partiellen Unique-Index auf `root_session_id`, wenn nicht null.
- Server-Hotfix: SQL nutzt `ON CONFLICT (root_session_id) WHERE root_session_id IS NOT NULL`.

### `analysis_runs`

Analyse-Run pro Version.

Vorhanden und erweitert.

### `analysis_findings`

Findings pro Analyse-Run.

Vorhanden und erweitert.

## 7. Neue Migration: `017_session_backend_editor`

Die neue Migration erweitert die API fuer Session-Editor-Backend-Logik.

Neue Tabellen:

### `session_blocks`

Persistiert Block-Snapshots pro gespeicherter Session-Version.

Spalten:

- `id`
- `session_id`
- `document_id`
- `block_id`
- `block_order`
- `block_type`
- `text`
- `labels`
- `paragraph_id`
- `words`
- `chars`
- `metadata`
- `created_at`

Constraint:

```sql
UNIQUE (session_id, block_id)
```

Index:

```sql
idx_session_blocks_session_order ON session_blocks (session_id, block_order)
```

Review-Fragen:

- Ist `block_id text` ausreichend oder sollte `uuid` erzwungen werden?
- Sollte `block_order` global eindeutig pro Session sein?
- Brauchen wir Offset-Spalten pro Block?
- Sollte `text` pro Block normalisiert werden oder exakt aus dem Editor kommen?
- Ist `metadata jsonb` sinnvoll oder zu offen?

### `session_parked_blocks`

Speichert geparkte Block-IDs pro Session-Version.

Spalten:

- `session_id`
- `block_id`
- `block_order`

Primary Key:

```sql
(session_id, block_id)
```

Review-Fragen:

- Sollte geparkter Block-Text ebenfalls persistiert werden?
- Sind geparkte Blocks Version-State oder Draft-State?

### `writing_events`

Persistiert Schreibereignisse und Deltas.

Spalten:

- `id`
- `document_id`
- `session_id`
- `version_id`
- `event_type`
- `created_at`
- `words_before`
- `words_after`
- `inserted_words`
- `deleted_words`
- `char_delta`
- `duration_ms`
- `metadata`

`event_type` wird derzeit als `text` gespeichert.

Aktuelle Werte im Code:

- `save`
- `edit`
- `action`
- `live_input`

Review-Fragen:

- Sollte `event_type` ein Enum oder Check Constraint werden?
- Sind `inserted_words`/`deleted_words` auf Basis der aktuellen Delta-Berechnung sinnvoll genug?
- Sollten Deltas auf Token-Ebene genauer gespeichert werden?
- Sollte es separate Eventtypen fuer manuell/NLP/Import geben?
- Wie sollten LiveSession-Events integriert werden?

### `document_text_spans`

Persistiert Blame-/Provenance-Spans pro Version.

Spalten:

- `id`
- `document_id`
- `version_id`
- `block_id`
- `start_offset`
- `end_offset`
- `text_hash`
- `authored_at`
- `last_touched_at`
- `origin_version_id`
- `status`
- `preview`
- `created_at`

Status:

- `active`
- `deleted`
- `moved`

Review-Fragen:

- Ist die Hash-basierte Wiedererkennung von Block-Text robust genug?
- Wie sollte man moved/deleted Spans korrekt modellieren?
- Sollte Blame auf Wort-/Tokenebene statt Blockebene erfolgen?
- Wie verhindern wir falsche `authored_at`-Zuordnung bei identischen Absatztexten?
- Sollte `text_hash` SHA-256 bleiben oder reicht md5/pgcrypto?

### `session_action_runs`

Persistiert Backend-/NLP-Actions.

Spalten:

- `id`
- `session_id`
- `source_version_id`
- `action_type`
- `nlp_new_version_id`
- `constraints`
- `diff`
- `after_text`
- `created_session_id`
- `created_at`

Review-Fragen:

- Ist `after_text` in dieser Tabelle sinnvoll oder redundant zur erzeugten Session-Version?
- Sollte `diff` als JSONB-Struktur statt beliebiger JSON gespeichert werden?
- Wie sollte ein Rollback/Retry-Modell fuer Actions aussehen?

### Erweiterungen an `analysis_runs`

Neue Spalten:

- `preset`
- `text_hash`
- `nlp_document_id`
- `nlp_version_id`
- `nlp_analysis_id`

Review-Fragen:

- Ist `analysis_runs` der richtige Ort fuer Workshop-Runs?
- Sollten Workshop-Runs eigene Tabelle bekommen?
- Ist `config_hash` aktuell deterministisch genug, wenn JSONB-Text serialisiert wird?

### Erweiterungen an `analysis_findings`

Neue Spalten:

- `status`
- `source`
- `source_finding_id`

Status:

- `open`
- `ignored`
- `resolved`
- `accepted`

Review-Fragen:

- Sollte Status-History versioniert werden?
- Braucht es `updated_at`, `resolved_at`, `resolved_by`?
- Reicht `source_finding_id text`?

## 8. Neue Hilfsschicht: `src/utils/textAnalysis.ts`

Diese Datei enthaelt aktuell:

- `hashText(text)` mit SHA-256
- `countWords(text)`
- `countLetters(text)`
- `textStats(text)`
- `normalizeBlocks(text, blocks?)`
- `computeWordDelta(before, after)`
- `computeLineDiff(left, right, maxCells = 500_000)`

Aktuelle Implementierung ist bewusst einfach und deterministisch.

Review-Fragen:

- Ist die Wortzaehlung ausreichend fuer Deutsch/Prosa?
- Sollte Satz-/Wortsegmentierung ueber ICU, Intl, Postgres oder spezialisierte Libraries laufen?
- Ist LCS-Line-Diff im Backend so okay oder sollte eine Diff-Library verwendet werden?
- Sollte `maxCells` konfigurierbar sein?
- Wie koennen wir Diffs cachen?

## 9. Neue und relevante Endpoints

### 9.1 Globale Schreibaktivitaet fuer Dashboard

```http
GET /api/v1/sessions/writing-overview?days=365
```

Zweck:

Dieser Endpoint ist fuer die globale Dashboard-Kachel "Wann du geschrieben hast". Er aggregiert alle aktiven Root-Sessions im Zeitraum und gibt nur frontendfertige Daten aus.

Auth:

```http
x-api-key: <API_KEY>
```

Query:

- `days`: optional, integer, 1 bis 730, Default 365

Aktuelle Berechnung:

- Zeitraum: `CURRENT_DATE - (days - 1)` bis `CURRENT_DATE`
- Basis: `sessions`
- Filter: `parent_id IS NULL`, `deleted_at IS NULL`
- `words`: Summe `word_count` aktiver Root-Sessions im Zeitraum
- `active_days`: Anzahl Tage mit mindestens einer Root-Session
- `streak_days`: rueckwaerts von heute gezaehlte aufeinanderfolgende Tage mit mindestens einer Session
- `sessions.written`: Root-Sessions im Zeitraum
- `sessions.total`: alle aktiven Root-Sessions
- `days`: vollstaendige Liste aller Tage im Zeitraum
- `level`: 0 bis 4, relativ zum Maximum an Woertern in diesem Zeitraum

Response-Beispiel aus Produktion:

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

Frontend-Mapping:

- `stats.words` -> "Woerter"
- `stats.active_days` -> "Aktive Tage"
- `stats.streak_days` -> "Serie"
- `stats.sessions.written` und `stats.sessions.total` -> "Sessions 355 von 504"
- `days` -> Heatmap-Kacheln
- `days[].level` -> Farbintensitaet
- `days[].sessions` und `days[].words` -> Tooltip

Review-Fragen:

- Sollte die globale Heatmap wirklich Root-Sessions zaehlen oder alle Versionen/Edits?
- Sollte `words` aktive aktuelle Woerter, neu geschriebene Woerter oder Netto-Zuwachs sein?
- Ist `level` relativ zum Zeitraum sinnvoll oder sollten feste Schwellenwerte verwendet werden?
- Sollte der Endpoint Wochenlayout-/weekday-Daten direkt liefern?
- Sollte Zeitzone konfigurierbar sein? Aktuell ist DB/Server-nahe Tageslogik via `CURRENT_DATE`.
- Wie gehen wir mit importierten Alt-Sessions um?

### 9.2 Session-Version speichern mit Block-Snapshot

```http
POST /api/v1/sessions/{session_id}/edits
```

Minimal:

```json
{
  "text": "..."
}
```

Empfohlen:

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
    }
  ],
  "parked_block_ids": []
}
```

Beim Speichern erzeugt das Backend:

- neue Session-Version
- Block-Snapshot
- Parked-Block-IDs
- Writing-Event
- Text-Spans fuer Blame

Review-Fragen:

- Sollte `event_type` vom Client gesetzt werden duerfen?
- Wie verhindern wir manipulierte Wortzahlen/Blockstats aus dem Client?
- Sollte das Backend Blocks selbst kanonisch segmentieren statt Client-Blocks zu uebernehmen?

### 9.3 Dokument-Versionen mit Blocks

```http
GET /api/v1/documents/{document_id}/versions?include=blocks
```

Liefert Versionen inklusive optionaler Block-Snapshots.

Review-Fragen:

- Sollte `include=blocks` paginiert/separat geladen werden?
- Wie gross koennen Responses bei vielen grossen Versionen werden?
- Braucht es `include=text=false` oder Preview-only-Varianten?

### 9.4 Dokumentbezogene Schreibuebersicht

```http
GET /api/v1/documents/{document_id}/writing-overview?from=...&to=...
```

Basis:

- `writing_events`

Response enthaelt:

- totals
- days

Review-Fragen:

- Sollte Altbestand aus `sessions` als Fallback einbezogen werden?
- Wie sollten Action-Versionen gewichtet werden?

### 9.5 Dokumentbezogene Timeline

```http
GET /api/v1/documents/{document_id}/writing-timeline?group_by=day
```

`group_by`:

- `day`
- `week`
- `month`

Review-Fragen:

- Sollte Gruppierung mit ISO-Wochen inklusive `week_start` erfolgen?
- Sollte Response direkt chartfertige Labels enthalten?

### 9.6 Blame / Provenance

```http
GET /api/v1/documents/{document_id}/blame?version_id={version_id}&mode=block
```

Response:

```json
{
  "success": true,
  "data": {
    "document_id": 12,
    "version_id": 456,
    "mode": "block",
    "spans": [
      {
        "block_id": "uuid",
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

Review-Fragen:

- Wie sollte Blame bei Textverschiebung, Copy/Paste und kleinen Aenderungen funktionieren?
- Reicht Block-Level fuer UX?
- Sollte es Batch-Endpoint fuer mehrere Versionen geben?

### 9.7 Server-Diff

Line-Diff:

```http
GET /api/v1/documents/{document_id}/diff?left={version_id_a}&right={version_id_b}&mode=line
```

Block-Moves:

```http
GET /api/v1/documents/{document_id}/diff?left={version_id_a}&right={version_id_b}&mode=block
```

Review-Fragen:

- Sollte Diff-Ergebnis gecacht werden?
- Brauchen wir word-level statt line-level?
- Wie handhaben wir sehr grosse Texte?
- Sollte Diff als eigene Tabelle persistiert werden?

### 9.8 Workshop-Runs

```http
POST /api/v1/sessions/{session_id}/workshop-runs
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

Aktueller Stand:

- Run wird persistiert.
- Findings werden persistiert.
- IDs sind DB-stabil.
- Der aktuelle Runner ist lokal/deterministisch und noch nicht die volle externe NLP-Orchestrierung.

Review-Fragen:

- Sollte `text` im Request erlaubt sein oder sollte immer eine gespeicherte Version analysiert werden?
- Wie verhindern wir Analyse von Text, der nicht zur Session-Version passt?
- Sollte `text_hash` gegen aktuelle Session validiert werden?
- Wie sollte Deduplizierung nach Text+Preset+Config funktionieren?

### 9.9 Workshop-Runs laden

```http
GET /api/v1/workshop-runs/{run_id}
GET /api/v1/workshop-runs/{run_id}/findings?start=0&end=10000&types=adverb,kwic
```

Review-Fragen:

- Sollte `GET /workshop-runs/{run_id}` Findings optional includen?
- Sind Offset-Filter ausreichend fuer virtuelle Editor-Viewports?

### 9.10 Finding-Status

```http
PATCH /api/v1/findings/{finding_id}
```

Request:

```json
{
  "status": "ignored"
}
```

Review-Fragen:

- Braucht es Status-Audit-Log?
- Sollte Status an Version/TextHash gebunden sein?
- Was passiert, wenn sich Offsets nach Textaenderung verschieben?

### 9.11 Remove-Adverbs Action

```http
POST /api/v1/sessions/{session_id}/actions/remove-adverbs
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

Aktueller Stand:

- Backend erzeugt `after_text`.
- Backend kann neue Session-Version speichern.
- Action wird in `session_action_runs` protokolliert.
- Die eigentliche Entfernung ist aktuell eine einfache Regex-basierte lokale Aktion und Platzhalter fuer spaetere NLP-Action.

Review-Fragen:

- Sollte diese Action derzeit als MVP markiert oder versteckt werden?
- Wie sollte ein echter NLP-Action-Workflow entworfen werden?
- Braucht es async Job-Status statt synchroner Response?

## 10. Aktuelle Deployment- und Betriebsbeobachtungen

Produktionsserver:

- Node.js 18.20.8
- PM2 root process online
- Port 3001
- Health lokal erfolgreich

Beim Deployment beobachtet:

- `npm ci` meldet 18 Vulnerabilities.
- Einige transitive Dependencies warnen wegen Node Engine `20 || >=22`, Server laeuft aber Node 18.
- `node-pg-migrate` meldet viele `Can't determine timestamp for ...`, wegen legacy Migration-Namen.
- Migration `017` musste angepasst werden, weil `CREATE INDEX CONCURRENTLY` trotz `pgm.noTransaction()` in einem Transaktionsblock fehlschlug.
- Deshalb nutzt `017` jetzt normale `CREATE INDEX IF NOT EXISTS`.

Review-Fragen:

- Sollten wir Node 20/22 auf dem Server einfuehren?
- Sollten wir Migration-Namen normalisieren?
- Ist `--no-check-order` akzeptabel oder Risiko?
- Sollte PM2 als root vermieden werden?
- Wuerde systemd-only oder Docker besser passen?
- Wie sollte ein sauberer CI/CD-Prozess aussehen?

## 11. Tests und Qualitaet

Lokal:

- `npm run build` erfolgreich.
- `npm test` scheiterte in der lokalen Umgebung an Postgres-Authentifizierung fuer Benutzer `postgres`.
- Reine Service-Test-Suites liefen teilweise durch.

Produktions-Smokes:

- Health 200
- Authentifizierter Sessions-Call 200
- Dokument-Overview 200
- Dokument-Blame 200
- Globales `/sessions/writing-overview?days=365` 200

Review-Fragen:

- Wie sollte eine robuste Testdatenbank fuer E2E aussehen?
- Welche Tests fehlen fuer neue Endpoints?
- Sollten Repository-Tests mit Testcontainers laufen?
- Welche Contract-Tests fuer Frontend/API-Vertraege sind sinnvoll?

## 12. Bekannte Risiken / Unsicherheiten

### 12.1 Altbestand

Alte Sessions haben keine:

- `writing_events`
- `document_text_spans`
- `session_blocks`

Globale Heatmap nutzt daher aktuell `sessions` als Altbestand-Fallback. Dokumentbezogene Schreibuebersicht nutzt `writing_events` und ist fuer alte Dokumente leer oder unvollstaendig.

Frage:

- Sollten wir Backfill-Jobs bauen?

### 12.2 Zeitlogik / Zeitzonen

Aktuell:

- Globale Heatmap nutzt DB `CURRENT_DATE`.
- Server-Zeitzone/DB-Zeitzone sollte geprueft werden.
- User-Zeitzonen gibt es nicht.

Frage:

- Sollen Endpoints `timezone` akzeptieren?

### 12.3 Wortzaehlung

Aktuell:

- DB-Trigger zaehlt Worte via Regex.
- `textAnalysis.ts` zaehlt via `/\S+/g`.

Frage:

- Sollten alle Wortzahlen aus einer einzigen kanonischen Quelle kommen?

### 12.4 Textnormalisierung

Sessions werden per Trigger normalisiert.

Frage:

- Ist das fuer Prosa/Editor richtig, oder verlieren wir relevante Zeilenumbrueche/Whitespace?

### 12.5 Stable IDs und Offsets

Findings und Blocks nutzen Offsets im Text.

Frage:

- Wie stabil sind Offsets ueber Normalisierung, Unicode, CRLF/LF, Emoji, deutsche Anfuehrungszeichen?

### 12.6 Skalierung

Moegliche Problemfelder:

- grosse Texte
- viele Versionen
- grosse Diff-Matrizen
- viele Findings
- grosse JSONB-Metadaten
- `include=blocks` bei vielen Versionen

Frage:

- Welche Limits und Pagination sollten eingefuehrt werden?

## 13. Konkrete Review-Aufgaben

Bitte die API in folgenden Schritten bewerten:

1. Datenmodell pruefen
   - Tabellen, Constraints, Normalisierung, JSONB-Einsatz, Indexierung

2. Endpoint-Design pruefen
   - Pfade, Query-Parameter, Response-Formate, Kompatibilitaet, Naming

3. Schreib-Historie pruefen
   - Ist `writing_events` ausreichend?
   - Ist die globale Heatmap korrekt definiert?
   - Wie sollte Dokument-History berechnet/backfilled werden?

4. Block-/Blame-Modell pruefen
   - Wie sollte Provenance robust modelliert werden?
   - Ist Block-Level genug?

5. Analyse-/Finding-Modell pruefen
   - `analysis_runs` vs `workshop_runs`
   - Statuspersistenz
   - Deduplizierung
   - Offset-Stabilitaet

6. Performance pruefen
   - Query-Plans fuer globale Overview
   - Query-Plans fuer Dokument-Versionen
   - Indexbedarf
   - Grenzen fuer Diffs und Includes

7. Betrieb pruefen
   - PM2/root vs systemd/Docker
   - Node-Version
   - Migration-Workflow
   - Backups
   - Monitoring/Logs

8. Sicherheit pruefen
   - API-Key-Modell
   - Rate-Limits
   - CORS
   - Public LiveSession-Routen
   - Secret-Handling

9. Teststrategie vorschlagen
   - Unit
   - Integration
   - E2E
   - Contract-Tests
   - Migration Tests

10. Roadmap empfehlen
    - Was sofort fixen?
    - Was vor Frontend-Integration stabilisieren?
    - Was kann spaeter?

## 14. Wunschformat fuer Feedback

Bitte Feedback priorisieren:

### Kritisch

Risiken, die Datenverlust, Sicherheitsprobleme, kaputte Deployments oder falsche Produktdaten verursachen koennen.

### Hoch

Architektur-/Datenmodellentscheidungen, die bald teuer werden koennen.

### Mittel

Verbesserungen fuer Wartbarkeit, Performance oder API-Klarheit.

### Niedrig

Nice-to-have, Stil, Cleanup.

Zu jedem Punkt bitte wenn moeglich:

- betroffene Datei/Endpoint/Tabelle
- Problem
- Risiko
- konkrete Empfehlung
- Aufwand grob: S/M/L

## 15. Wichtigste Fragen auf einen Blick

1. Ist `GET /api/v1/sessions/writing-overview?days=365` fachlich korrekt fuer die globale Schreibaktivitaet, oder sollten wir Edits/Versionen statt Root-Sessions zaehlen?
2. Sollten wir Altbestand in `writing_events` und `document_text_spans` backfillen?
3. Ist das aktuelle Block-/Blame-Modell robust genug?
4. Sollte `workshop-runs` eine eigene Tabelle bekommen statt `analysis_runs` zu erweitern?
5. Wie sollten Finding-Status und Offset-Stabilitaet langfristig geloest werden?
6. Ist die aktuelle Migration- und Deployment-Praxis sicher genug?
7. Sollten wir Node 20/22 und einen sauberen systemd- oder Docker-Betrieb einfuehren?
8. Welche Indizes fehlen fuer erwartete Nutzung?
9. Welche API-Responses sind zu gross oder zu unklar?
10. Welche Tests muessen vor weiterer Frontend-Arbeit zwingend existieren?

