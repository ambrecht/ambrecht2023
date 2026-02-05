# API-Uebersicht (kurz)

## Zweck
- Backend-API fuer zwei Domaenen:
  - Typewriter: Texte als Sessions speichern und einfache Metriken bereitstellen.
  - Livesession: Live-Session per HTTP verwalten und per PostgreSQL LISTEN/NOTIFY + WebSocket streamen.
- Kein Frontend, keine Nutzerkonten: Typewriter-Schreibzugriff ueber API-Key (HTTP); LiveSessions sind public (create/input/history/WS).

## Endpoints
### Typewriter (`/api/v1/sessions`)
- `POST /api/v1/sessions` - Text-Sitzung anlegen.
- `GET /api/v1/sessions` - Sessions paginiert auflisten.
- `GET /api/v1/sessions/search` - FTS-Suche (Cursor-Pagination).
- `GET /api/v1/sessions/search_page` - Substring-Suche (page/pageSize oder Cursor).
- `GET /api/v1/sessions/{id}` - Session per ID abrufen.
- `POST /api/v1/sessions/{id}/edits` - Bearbeitung als neue Session anlegen.
- `PATCH /api/v1/sessions/{id}` - Session-Felder aktualisieren.
- `GET /api/v1/sessions/last` - letzte Session abrufen.

### Livesession (`/api/v1/live-sessions`)
- `POST /api/v1/live-sessions` - Live-Session anlegen (immer neu); Antwort enthaelt `success` + `data.sessionId/created_at`.
- `POST /api/v1/live-sessions/{id}/input` - Text-Events in eine Live-Session schreiben (public; Antwort enthaelt eventId/created_at).
- `GET /api/v1/live-sessions/{id}/history` - Events/History abrufen (public).
- ID-Validierung: ungueltige/fehlende UUID -> 400 `invalid_session_id`.
- **WebSocket**: `/api/v1/live-sessions/{id}/stream` - Streaming der Events (public, kein Token).

### Health
- `GET /api/health` ohne Auth.

## Authentifizierung
- HTTP: Header `x-api-key` (Wert = `API_KEY` aus ENV) fuer Typewriter-Endpunkte unter `/api/v1/sessions` (und Legacy `/api/typewriter`).
- Public: Alle `/api/v1/live-sessions/*` Endpunkte und WebSocket-Stream sind ohne Auth erreichbar.

## Persistenz (vereinfacht)
- `sessions`: gespeicherte Texte + Zaehler (word_count, char_count, letter_count); Trigger/Query setzen letter_count, Service faellt nur bei NULL zurueck.
- `livesession`: Live-Sessions (`session_id`, `created_at`).
- `livesession_event`: Events zu einer Live-Session; PG NOTIFY auf Channel `livesession_<sessionId>` mit Payload Event-ID fuer Streaming.

## Nicht-Ziele
- Kein User-Management, keine Rollen/Rechte jenseits API-Key fuer Typewriter-Schreibzugriffe.
- Kein Frontend, nur Backend-API.
- Keine komplexen Mehrmandanten- oder Audit-Features.
