# Briefing fuer Backend-Review: Live-Funktion der Typewriter API

Stand: 2026-08-06  
Zielgruppe: Backend-Architekt:in / Realtime-, PostgreSQL- und WebSocket-Reviewer  
Scope: Nur die Live-Funktion der API, nicht Session-Archiv, Dokumente, Analyse oder Editor-Versionierung

## 1. Ziel des Reviews

Bitte bewerte die aktuelle Live-Funktion der Typewriter API und gib konkrete Verbesserungsvorschlaege.

Uns interessiert vor allem:

- Ist der aktuelle Realtime-Ansatz mit PostgreSQL `LISTEN/NOTIFY` und WebSocket tragfaehig?
- Sind API-Design, Authentifizierung und Rate-Limits fuer eine produktive Live-Funktion ausreichend?
- Wo entstehen Risiken bei vielen gleichzeitigen Zuschauer:innen oder vielen Live-Events?
- Welche Datenmodell-, Index- oder Retention-Aenderungen sollten wir frueh umsetzen?
- Welche Fehlerfaelle fehlen im aktuellen Gateway?
- Wie sollte die Live-Funktion beobachtet, getestet und betrieben werden?
- Welche Verbesserungen sind P0/P1/P2?

## 2. Produktkontext

Die Live-Funktion dient dazu, Text-Events einer laufenden Live-Session in Echtzeit an Clients zu verteilen.

Aktueller Flow:

```text
Client erstellt Live-Session
-> Client schreibt Text-Events per HTTP
-> Backend persistiert Events in PostgreSQL
-> DB-Trigger sendet NOTIFY auf livesession_<sessionId>
-> Node WebSocket-Gateway empfaengt NOTIFY
-> Gateway liest Event aus DB
-> Gateway broadcastet Event an WebSocket-Clients derselben Session
```

Die Funktion ist aktuell eher als public Live-Viewer-Link gedacht. Laut bestehender Doku sind alle `/api/v1/live-sessions/*` Endpunkte public, also ohne `x-api-key`.

## 3. Relevante Code-Dateien

API:

- `src/modules/livesession/livesession.routes.ts`
- `src/modules/livesession/livesession.controller.ts`
- `src/modules/livesession/livesession.service.ts`
- `src/modules/livesession/livesession.repository.ts`
- `src/modules/livesession/livesession.gateway.ts`
- `src/modules/livesession/livesession.schemas.ts`

App/Server:

- `src/app.ts`
- `src/server.ts`
- `src/config.ts`

Datenbank:

- `db/migrations/001_init.js`
- `db/migrations/003_livesession_passphrase_hash_notify_indexes.js`
- `db/migrations/007_livesession_public.js`
- `db/migrations/010_sessions_trigger_optimize.js`
- `db/migrations/011_livesession_event_created_at_index.js`
- `db/functions/livesession_event_notify.sql`
- `db/functions/livesession_event_biu_normalize.sql`
- `db/scripts/prune-livesession-events.js`

Doku/Tests:

- `src/docs/frontend-backend-abgleich.md`
- `src/docs/runbook_production.md`
- `test/livesession.e2e.test.ts`
- `test/livesession.service.test.ts`

## 4. HTTP API

### POST `/api/v1/live-sessions`

Legt aktuell immer eine neue Live-Session an.

Request:

```json
{}
```

Response:

```json
{
  "success": true,
  "data": {
    "sessionId": "<uuid>",
    "created_at": "<iso>"
  }
}
```

Implementierung:

- Controller validiert mit leerem `createLiveSessionSchema`.
- Service erzeugt `uuidv4()`.
- Repository schreibt in Tabelle `livesession`.
- Service ruft danach `registerSessionListener(row.session_id)` auf.

### POST `/api/v1/live-sessions/:id/input`

Fuegt ein Text-Event zu einer Live-Session hinzu.

Request:

```json
{
  "text": "..."
}
```

Response:

```json
{
  "success": true,
  "data": {
    "eventId": 123,
    "created_at": "<iso>"
  }
}
```

Aktuelle Validierung:

- `id` muss UUID sein.
- `text` muss String mit mindestens einem Zeichen sein.
- Kein explizites Maximum fuer Textgroesse im Live-Payload, allerdings global `express.json({ limit: '1mb' })`.

Fehler:

- `400 invalid_session_id`
- `400 invalid_payload`
- `404 session_not_found`

### GET `/api/v1/live-sessions/:id/history`

Liefert Event-History fuer eine Live-Session.

Response:

```json
{
  "success": true,
  "data": [
    {
      "content": "...",
      "created_at": "<iso>"
    }
  ]
}
```

Aktuell:

- Sortierung: `ORDER BY id`
- Kein Cursor, kein Limit, keine Pagination
- Public
- Separates Rate-Limit in Route: 120 Requests pro Minute

Bitte bewerten, ob History ohne Pagination ein Risiko ist.

## 5. WebSocket API

### WS `/api/v1/live-sessions/:id/stream`

Read-only WebSocket-Stream fuer Live-Events.

Payload an Clients:

```json
{
  "content": "...",
  "timestamp": "<iso>"
}
```

Gateway:

- Nutzt `ws` mit `new WebSocketServer({ noServer: true })`.
- Haengt am HTTP `upgrade` Event.
- Erwartet exakt Pfad `/api/v1/live-sessions/:id/stream`.
- Extrahiert `sessionId` aus URL-Segmenten.
- Fuehrt IP-basiertes Rate-Limit fuer Upgrades aus.
- Setzt `ws.sessionId = sessionId`.
- Sendet Ping alle 30 Sekunden und terminiert tote Verbindungen.
- Broadcastet nur an Clients mit gleicher `sessionId`.

Aktuelles Upgrade-Rate-Limit:

- `WS_RATE_LIMIT_WINDOW_MS`
- `WS_RATE_LIMIT_MAX`
- In-Memory `Map<string, { count, resetAt }>`

Offene Punkte:

- Das Upgrade prueft nach aktuellem Code nicht, ob die `sessionId` wirklich in `livesession` existiert.
- Es gibt keine Auth oder signierte Viewer-Tickets.
- Rate-Limit ist nur pro Node-Prozess im Speicher.
- Es gibt keine explizite Maximalanzahl gleichzeitiger WS-Clients pro Session/IP.
- Es gibt keine Message-Groessenbegrenzung fuer ausgehende Events ausser der HTTP-Body-Grenze beim Input.

## 6. Datenmodell

### Tabelle `livesession`

Aus Migration:

```sql
CREATE TABLE IF NOT EXISTS livesession (
  session_id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

Historie:

- Es gab frueher `passphrase`/`passphrase_hash`.
- Migration `007_livesession_public.js` macht diese Felder optional beziehungsweise public nutzbar.

### Tabelle `livesession_event`

```sql
CREATE TABLE IF NOT EXISTS livesession_event (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID REFERENCES livesession(session_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

Indizes:

```sql
CREATE INDEX IF NOT EXISTS idx_livesession_event_session_id_id
ON livesession_event (session_id, id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_livesession_event_created_at
ON livesession_event (created_at);
```

Bitte bewerten:

- Reicht `(session_id, id)` fuer History und Event-Lookup?
- Brauchen wir `(session_id, created_at, id)`?
- Sollte History cursorbasiert ueber `id > after_event_id` laufen?
- Sollte `created_at` `NOT NULL DEFAULT now()` hart garantiert sein?
- Sollte `content` ein Groessenlimit auf DB- oder API-Ebene haben?

## 7. Trigger und NOTIFY

### Notify-Trigger

`db/functions/livesession_event_notify.sql`:

```sql
PERFORM pg_notify(
  'livesession_' || NEW.session_id::text,
  NEW.id::text
);
```

Trigger:

```sql
CREATE TRIGGER livesession_event_notify
AFTER INSERT ON livesession_event
FOR EACH ROW EXECUTE FUNCTION livesession_event_notify_fn();
```

Gateway-Verarbeitung:

- Node lauscht auf Channel `livesession_<sessionId>`.
- Payload ist nur Event-ID.
- Bei Notification liest Node:

```sql
SELECT content, created_at
FROM livesession_event
WHERE id = $1
```

- Danach Broadcast an passende WS-Clients.

Bitte bewerten:

- Ist Event-ID als NOTIFY Payload gut oder sollte Payload direkt Inhalt enthalten?
- Wie kritisch ist das erneute DB-Read pro Event?
- Was passiert bei NOTIFY-Verlust, DB-Reconnect oder Gateway-Neustart?
- Brauchen Clients eine `last_event_id`/Replay-Strategie?
- Sollte WebSocket Payload ebenfalls `eventId` enthalten?

### Normalize-Trigger

`db/functions/livesession_event_biu_normalize.sql`:

```sql
NEW.content := normalize_text_pg(NEW.content);
```

Bitte besonders bewerten:

- Darf Live-Text auf dem Write-Pfad normalisiert werden?
- Ist `normalize_text_pg` fuer Live-Input fachlich gewollt?
- Besteht Risiko, dass Leerzeichen, Zeilenumbrueche oder Unicode veraendert werden?
- Soll Live-Event-Text bytegetreu gespeichert werden wie eingegeben?

## 8. Authentifizierung und Sicherheit

Aktueller Stand:

- `src/middleware/auth.ts` nimmt `/live-sessions` vom API-Key aus.
- Runbook sagt: alle `/api/v1/live-sessions/*` und WS sind public.
- Legacy `/api/livesession/*` ist API-Key-geschuetzt.

Risiken:

- Jeder kann Live-Sessions erstellen.
- Jeder mit Session-UUID kann schreiben.
- Jeder mit Session-UUID kann History lesen und WebSocket abonnieren.
- Keine Rollen: Writer vs Viewer.
- Keine Einmal-Tokens oder Ablaufzeiten.
- Kein Abuse-Schutz fuer viele POST-Events ausser globalem API-Rate-Limit.

Bitte bewerten:

- Sollten Live-Sessions public bleiben?
- Brauchen wir getrennte Tokens fuer `write`, `read/history`, `stream`?
- Sollten Viewer-Links signiert und zeitlich begrenzt sein?
- Soll `POST /input` API-Key oder Writer-Token verlangen?
- Wie sollten CORS/Origin-Checks fuer WS aussehen?
- Welche Rate-Limits sind fuer Create/Input/History/WS sinnvoll?

## 9. Betrieb und Skalierung

Aktueller Betrieb:

- Node/Express auf Port 3001.
- PM2 Prozess `typewriter-api`.
- Nginx proxyt `/ws/livesession` und REST an Node. Aktuelle neue WS-Doku nennt `/api/v1/live-sessions/:id/stream`; bitte pruefen, ob Nginx-Upgrade fuer diesen Pfad sicher korrekt ist.
- PostgreSQL lokal/remote ueber `DATABASE_URL` oder PG-ENV.

Skalierungsgrenzen:

- `LISTEN` auf einem Channel pro bestehender Live-Session.
- Beim Gateway-Start:

```sql
SELECT session_id FROM livesession
```

und dann `LISTEN` fuer jede Session.

- Neue Sessions registrieren via `registerSessionListener`.
- In-Memory WS-Clients nur im aktuellen Node-Prozess.
- In-Memory Rate-Limit nur im aktuellen Node-Prozess.

Bitte bewerten:

- Ist ein Channel pro Live-Session sinnvoll bei vielen Sessions?
- Waere ein globaler Channel `livesession_events` mit JSON Payload besser?
- Wie viele `LISTEN`-Channels sind praktikabel?
- Was passiert beim Betrieb mehrerer Node-Prozesse/Instanzen?
- Sollte Broadcasting ueber Redis Pub/Sub, NATS, Postgres global Channel oder WebSocket-Service laufen?
- Wie sollte Reconnect/Backoff fuer den PG-Listener implementiert werden?

## 10. Retention und Datenmenge

Es gibt ein Script:

```bash
npm run db:prune:livesession-events
```

ENV:

- `LIVESESSION_RETENTION_DAYS`, Default 7
- `LIVESESSION_RETENTION_BATCH`, Default 5000
- `LIVESESSION_RETENTION_MAX_BATCHES`, Default 0

Script:

- Loescht alte `livesession_event`-Zeilen batchweise anhand `created_at`.
- Nutzt `DATABASE_URL`.

Bitte bewerten:

- Sollten auch alte `livesession`-Rows geloescht werden, wenn keine Events mehr existieren?
- Brauchen wir eine Session-Status-Spalte wie `active`, `ended`, `expired`?
- Soll es ein explizites `POST /api/v1/live-sessions/:id/end` geben?
- Welche Retention ist fachlich sinnvoll?
- Brauchen wir Partitionierung fuer `livesession_event`, falls Live-Events stark wachsen?

## 11. Aktuelle Tests

Vorhanden:

- `test/livesession.service.test.ts`
- `test/livesession.e2e.test.ts`

Abgedeckt laut Testnamen:

- `POST /api/v1/live-sessions` erzeugt Session.
- Leeres/fehlendes Text-Payload wird validiert.
- `POST /:id/input` akzeptiert Text-Event.
- `POST /:id/input` liefert 404 fuer falsche Session.
- `GET /:id/history` liefert Events in Reihenfolge.
- Service ruft Repository und Gateway-Registrierung.

Bitte fehlende Tests bewerten:

- WebSocket-End-to-End mit realem NOTIFY.
- Client bekommt Event nach `POST /input`.
- Mehrere Clients derselben Session bekommen Event.
- Clients anderer Session bekommen Event nicht.
- Ungueltiger WS-Pfad wird sauber abgelehnt.
- Ungueltige/nicht existente Session-ID im WS-Pfad.
- WS-Rate-Limit.
- PG-Listener-Reconnect.
- History-Pagination bei vielen Events.
- Payload-Groessenlimit.
- Unicode/Texttreue im Live-Content.

## 12. Bekannte Auffaelligkeiten und Fragen

### 12.1 Mehrere Notify-Trigger moeglich

Im `db/schema.sql` sind mehrere LiveSession-Notify-Funktionen/Trigger sichtbar:

- `f_notify_livesession`
- `livesession_event_notify_fn`
- `notify_livesession_event`
- Trigger `livesession_event_notify`
- Trigger `livesession_event_trigger`
- Trigger `trg_notify_livesession`

Bitte pruefen, ob in der echten DB mehrere Trigger parallel aktiv sind. Falls ja, koennte ein Insert mehrere NOTIFYs ausloesen und Events doppelt broadcasten.

Frage:

- Welche Trigger sind tatsaechlich in Produktion aktiv?
- Sollten alte Trigger/Funktionen bereinigt werden?

### 12.2 `registerSessionListener` ohne Reconnect-Konzept

Wenn `pgListener` endet, loggt der Code nur:

```text
pgListener ended -- consider reconnect/backoff
```

Frage:

- Wie sollte ein robustes Reconnect/Resubscribe-Konzept aussehen?
- Was passiert mit Events waehrend der Listener offline ist?

### 12.3 WebSocket existiert auch fuer nicht existente Sessions

Beim Upgrade wird nur der Pfad validiert, nicht die Existenz der Session.

Frage:

- Sollte WS-Connect fuer unbekannte Session-IDs mit 404 abgelehnt werden?
- Oder darf man vor Create schon abonnieren?

### 12.4 History ohne Pagination

`GET /history` liefert alle Events.

Frage:

- Sollte History standardmaessig `limit`, `after_event_id` oder `since` bekommen?
- Soll Initial-Sync ueber History laufen und Live-Updates danach ueber WS?

### 12.5 Payload-Schema zu minimal

Aktuell Event:

```json
{ "content": "...", "timestamp": "..." }
```

Frage:

- Sollte Payload `eventId`, `sessionId`, `created_at`, `type`, `sequence` enthalten?
- Brauchen wir Idempotency-Key oder clientseitige Event-ID fuer Wiederholungen?

## 13. Konkrete Bitte an den Experten

Bitte gib uns eine priorisierte Rueckmeldung:

### P0: Sofort vor weiterer Frontend-Integration

- Welche Sicherheits- oder Datenintegritaetsrisiken muessen sofort weg?
- Muessen public Endpunkte eingeschraenkt werden?
- Muss History paginiert werden?
- Muessen doppelte DB-Trigger entfernt werden?
- Muss WS-Connect Session-Existenz pruefen?
- Muss Live-Content bytegetreu statt normalisiert gespeichert werden?

### P1: Naechste Stabilisierung

- Empfohlenes Token-/Rechte-Modell fuer Writer/Viewer.
- Reconnect/Replay-Strategie fuer WebSocket.
- Event-Payload-Vertrag.
- Observability-Metriken.
- Lasttests und Grenzwerte.

### P2: Skalierung

- Alternative zu einem `LISTEN`-Channel pro Session.
- Betrieb mit mehreren Node-Instanzen.
- Redis/NATS/Postgres global channel/Queue-Optionen.
- Partitionierung/Retention fuer sehr viele Events.

## 14. Gewuenschte Antwortform

Bitte antworte moeglichst konkret mit:

- Findings nach Severity.
- Betroffene Datei/Komponente.
- Risiko.
- Empfehlung.
- Beispiel-SQL oder Beispiel-Code, falls sinnvoll.
- Einschaetzung: Muss sofort umgesetzt werden oder kann warten?

Besonders hilfreich waere eine kurze Zielarchitektur fuer:

```text
Live-Session erstellen
-> Writer authentifiziert Events
-> Viewer subscriben sicher
-> History/Replay mit Cursor
-> WS reconnectet robust
-> Betrieb mit mehreren Node-Prozessen moeglich
```
