# Frontend-Backend Abgleich (Typewriter API)

## Ziel
Diese Datei dient als Referenz fuer die Abstimmung zwischen Frontend und Backend (HTTP + WebSocket). Sie beschreibt die aktuell bereitgestellten Routen, Authentifizierung und Beispiel-Payloads.

## Basis
- HTTP Base URL: `http://127.0.0.1:3001`
- Primaerer Prefix: `/api/v1`
- Legacy Prefix (uebergangsweise): `/api`

## Authentifizierung (x-api-key)
- Alle `/api/v1/sessions*` sowie Legacy `/api/typewriter/*` und `/api/livesession/*` Routen verlangen den Header `x-api-key`.
- Ausnahmen: `GET /api/health` sowie alle `/api/v1/live-sessions/*` sind ohne Auth erreichbar.
- Bei fehlendem/ungueltigem Key kommt `401`.

Beispiel-Fehlerantwort:
```json
{
  "error": "Unauthorized",
  "message": "Ungueltiger API-Schluessel"
}
```
Hinweis: Die Runtime liefert die Fehlermeldung mit deutschen Umlauten; im Frontend bitte nicht auf exakte Zeichenketten pruefen.

## Standard-Fehlerschema (neue API)
Die neuen `/api/v1/*` Routen liefern Fehler im Format:
```json
{
  "success": false,
  "error": "<code>",
  "message": "<human message>",
  "details": { "...": "optional" }
}
```

## Live-Sessions (neue API)

### POST /api/v1/live-sessions
Legt immer eine neue Live-Session an.

Request:
```json
{}
```

Response (201):
```json
{
  "success": true,
  "data": {
    "sessionId": "<uuid>",
    "created_at": "<iso>"
  }
}
```

Hinweis: Keine Passphrase/Token und keine Auth mehr erforderlich.

### POST /api/v1/live-sessions/{id}/input
Fuegt Text-Events hinzu.

Request:
```json
{ "text": "<string>" }
```

Response:
```json
{
  "success": true,
  "data": { "eventId": 123, "created_at": "<iso>" }
}
```

Moegliche Fehler:
- `400` bei ungueltiger/fehlender Session-ID (invalid_session_id)
- `404` wenn Session nicht existiert
- `400` bei ungueltigem Payload

### GET /api/v1/live-sessions/{id}/history
Liefert die Event-History.

Response:
```json
{
  "success": true,
  "data": [
    { "content": "<string>", "created_at": "<iso>" }
  ]
}
```
Moegliche Fehler:
- `400` bei ungueltiger/fehlender Session-ID (invalid_session_id)

### WS /api/v1/live-sessions/{id}/stream
WebSocket-Stream fuer Live-Events (public, read-only).

- URL: `ws://<host>/api/v1/live-sessions/{id}/stream`
- Keine Auth/Token erforderlich (Viewer-Link ist public).
- Event Payload:
```json
{ "content": "<string>", "timestamp": "<iso>" }
```

## Repro-Checklist (LiveSessions)
1) Create session
```bash
curl -s -X POST "<BASE_URL>/api/v1/live-sessions" \
  -H "Content-Type: application/json" \
  -d '{}'
```

2) History (valid id)
```bash
curl -s "<BASE_URL>/api/v1/live-sessions/<SESSION_ID>/history"
```

3) History (invalid id -> 400 invalid_session_id)
```bash
curl -i "<BASE_URL>/api/v1/live-sessions/undefined/history"
```

4) WebSocket (public)
```bash
wscat -c "<WS_URL>/api/v1/live-sessions/<SESSION_ID>/stream"
```

## Typewriter Sessions (neue API)

### POST /api/v1/sessions
Request:
```json
{ "text": "<string>" }
```

Response (201):
```json
{
  "success": true,
  "data": {
    "id": 123,
    "parent_id": null,
    "title": null,
    "status": "draft",
    "tags": [],
    "text": "<string>",
    "created_at": "<iso>",
    "updated_at": "<iso>",
    "word_count": 1,
    "char_count": 4,
    "letter_count": 4
  }
}
```

### GET /api/v1/sessions
Query: `?limit=<int>&offset=<int>`

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "parent_id": null,
      "title": null,
      "status": "draft",
      "tags": [],
      "text": "...",
      "created_at": "<iso>",
      "updated_at": "<iso>",
      "word_count": 10,
      "char_count": 50,
      "letter_count": 45
    }
  ],
  "pagination": { "limit": 100, "offset": 0, "total": 1 }
}
```

### GET /api/v1/sessions/search
Serverseitige Suche mit Cursor-Pagination (Preview-Only).

Query (Beispiele): `?q=<string>&limit=50&cursor=<opaque>&sort=relevance|created_at|id&order=desc|asc&from=<iso>&to=<iso>&min_words=&max_words=`

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "created_at": "<iso>",
      "word_count": 10,
      "char_count": 50,
      "letter_count": 45,
      "text_preview": "erste 400 Zeichen ...",
      "highlights": ["...<mark>treffer</mark>..."],
      "rank": 0.42
    }
  ],
  "pagination": { "limit": 50, "next_cursor": "..." },
  "meta": { "took_ms": 12 }
}
```

Hinweise:
- `q` ist Pflicht (max 200 Zeichen), Full-Text via Postgres.
- `limit` default 50, max 200. Cursor ist opaque und bindet `sort`/`order`.
- Sortierung: `relevance` (default) | `created_at` | `id`, jeweils `order=desc|asc`.
- Filter: `from`/`to` (ISO Timestamp, filtert `created_at`), `min_words`/`max_words`.
- Payload nutzt `SessionListItem` (kein Volltext, `text_preview` <= 400 Zeichen, optional Highlights/Rank). Volltext bei Bedarf ueber `GET /api/v1/sessions/{id}` nachladen.

### GET /api/v1/sessions/search_page
Substring-Suche mit page/pageSize oder Cursor (title/text/tags).

Query (Beispiele):
- Page: `?q=<string>&page=1&pageSize=50&sort=created_at|id&order=desc|asc`
- Cursor: `?q=<string>&cursor=<opaque>&limit=50&sort=created_at|id&order=desc|asc`

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": null,
      "status": "draft",
      "tags": [],
      "created_at": "<iso>",
      "updated_at": "<iso>",
      "word_count": 10,
      "char_count": 50,
      "letter_count": 45,
      "text_preview": "erste 400 Zeichen ...",
      "parent_id": null
    }
  ],
  "pagination": { "page": 1, "pageSize": 50, "total": 1 },
  "meta": { "took_ms": 12 }
}
```

Cursor-Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": null,
      "status": "draft",
      "tags": [],
      "created_at": "<iso>",
      "updated_at": "<iso>",
      "word_count": 10,
      "char_count": 50,
      "letter_count": 45,
      "text_preview": "erste 400 Zeichen ...",
      "parent_id": null
    }
  ],
  "pagination": { "limit": 50, "next_cursor": "..." },
  "meta": { "took_ms": 12 }
}
```

### GET /api/v1/sessions/last
Response identisch zum Einzel-Objekt von `POST /api/v1/sessions`.

### GET /api/v1/sessions/{id}
Response identisch zum Einzel-Objekt von `POST /api/v1/sessions`.

### POST /api/v1/sessions/{id}/edits
Legt eine Bearbeitung als neue Session an (parent_id verweist auf die Ursprungssession).

Request:
```json
{ "text": "<string>" }
```

Response (201): identisch zu `POST /api/v1/sessions`.

### PATCH /api/v1/sessions/{id}
Teil-Update fuer Session-Metadaten.

Request (Beispiel):
```json
{ "title": "Titel", "status": "draft", "tags": ["tag1", "tag2"] }
```

Response (200): identisch zu `POST /api/v1/sessions`.

## Legacy Endpoints (uebergangsweise aktiv)
- `POST /api/livesession/create` -> `{ sessionId, passphrase }`
- `POST /api/livesession/{id}/input`
- `GET  /api/livesession/{id}/history`
- `POST /api/typewriter/save`
- `GET  /api/typewriter/all?limit=&offset=`
- `GET  /api/typewriter/last`

## Health Check
- `GET /api/health` -> `{ "status": "ok", "timestamp": "<iso>" }` (ohne Auth)

## Frontend Hinweise
- Fuer Typewriter-Requests (`/api/v1/sessions*`, Legacy `/api/typewriter/*`, `/api/livesession/*`) den Header `x-api-key` setzen.
- Live-Sessions unter `/api/v1/live-sessions/*` sind public (kein API-Key).
- `Content-Type: application/json` senden.
- Bei `401` (fehlender/ungueltiger Key) UI-seitig klare Fehlermeldung anzeigen.
- CORS Origins kommen aus `CORS_ORIGINS` (comma-separated) in der Runtime-Config.
