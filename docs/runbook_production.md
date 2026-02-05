# Runbook Production – Typewriter API

## 1. Einleitung
- Dieses Runbook beschreibt Setup, Deploy, Betrieb und Troubleshooting der Typewriter API.
- Kernfunktion: Text-Sessions speichern/auslesen (Typewriter) und Live-Sessions über PostgreSQL LISTEN/NOTIFY + WebSocket streamen.
- HTTP-Versionierung unter `/api/v1`, WebSocket-Stream unter `/api/v1/live-sessions/{id}/stream`.
- Auth: HTTP per API-Key fuer Typewriter-Endpunkte; Live-Sessions (create/input/history/WS) sind public (kein Token).

## 2. Systemvoraussetzungen
- OS: Ubuntu/Debian-artiges Linux (Annahme).
- Erforderlich: Node.js (v18/v20 empfohlen), npm; PostgreSQL-Server (lokal oder extern), Git (falls per clone).
- Ressourcen: kleine VM reicht für Demo; Prod-Kapazität abhängig von Traffic/WS-Last.

## 3. Environment-Variablen
- `API_KEY` (Pflicht fuer Typewriter-Endpunkte, starker Wert fuer x-api-key).
- `PORT` (optional, Default 3001).
- `DATABASE_URL` oder `PG_HOST`, `PG_PORT`, `PG_DATABASE`, `PG_USER`, `PG_PASSWORD`.
- Hinweis: Das WS-Gateway nutzt `DATABASE_URL` oder Postgres-Env im PG-Format (`PGUSER`, `PGPASSWORD`, `PGHOST`, `PGPORT`, `PGDATABASE`). In Prod am besten `DATABASE_URL` setzen.
- `CORS_ORIGINS` (kommagetrennt erlaubte Origins).
- `WS_RATE_LIMIT_WINDOW_MS`, `WS_RATE_LIMIT_MAX` (optional, Rate-Limit fuer WebSocket-Upgrades).
- `NODE_ENV` (`production` für Prod).
- Empfehlung: Secrets über ENV/Vault, nicht ins Repo committen.

## 4. Initiales Setup (erste Installation)
1. Optional: System-User anlegen, z. B. `useradd -r -m typewriter`.
2. Code nach z. B. `/opt/typewriter-api` bringen (git clone oder rsync).
3. Ins Verzeichnis wechseln, `npm install`.
4. `.env` aus Beispiel ableiten und Variablen setzen (sichere Secrets!).
5. PostgreSQL: DB/User anlegen (z. B. `createdb typewriter`, `createuser ...`, Rechte vergeben).
6. Migrationen ausfuehren (node-pg-migrate):
   - `DATABASE_URL` setzen (DB-Creds via ENV/Secrets).
   - `npm run db:migrate` (laeuft `db/migrations` in Reihenfolge).
   - Vor jedem Deploy neue Migrationen ausrollen.
7. Build: `npm run build`.
8. Optional Tests: `npm test` (benötigt erreichbare Test-DB und `TEST_DATABASE_URL`).

## 4.1 Smoke-Checks vor Prod-Deploy
- `npm run db:migrate` (Staging/Prod).
- `npm test` (E2E gegen Test-DB).
- EXPLAIN-Checks fuer FTS/Substring-Search (Index-Nutzung verifizieren).

## 5. Start & Betrieb
### 5.1 Dev/Einfacher Start
- Entwicklung: `npm run dev` (ts-node).
- Produktion (manuell): `npm start` (nach `npm run build` → `node dist/server.js`).

### 5.2 systemd (Beispiel)
```
[Unit]
Description=Typewriter API
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/typewriter-api
ExecStart=/usr/bin/node /opt/typewriter-api/dist/server.js
EnvironmentFile=/opt/typewriter-api/.env
Restart=always
User=typewriter

[Install]
WantedBy=multi-user.target
```
- Aktivieren/Starten: `systemctl enable --now typewriter-api`.

### Healthcheck
- HTTP: `/api/health` (status: "ok"). Für LB/Monitoring verwenden.

## 6. Monitoring & Logging
- Logs: Request-Logs mit Request-ID, Fehler über zentralen Error-Handler, WS-Gateway-Logs, PG-LISTEN-Fehler.
- Prod-Empfehlung: Logs ins Journal/Datei; keine sensiblen Daten loggen (Passphrase/Hash/Tokens).
- Optional: JSON-Lines in Prod (bereits unterstützt), Integration in ELK/Loki möglich.

## 7. Sicherheitsaspekte
- API_KEY stark waehlen; Rotation planen (Typewriter).
- Keine Secrets in Git (.env nicht commiten).
- CORS_ORIGINS auf bekannte Frontends beschränken.
- Rate-Limit prüfen/anpassen (express-rate-limit); ggf. Key-basiertes Throttling.
- WS-Rate-Limit ist per Instance; bei Multi-Instance/Loadbalancer Shared-Store oder Sticky Sessions nutzen.

## 8. Datenbank & Migrationen
- Tabellen: `sessions` (Texte + word_count/char_count), `livesession` (session_id UUID, created_at), `livesession_event` (Events, FK zu livesession).
- Trigger/Notify: `livesession_event` NOTIFY `livesession_<sessionId>` mit Payload Event-ID (fuer WS-Gateway).
- Indizes: `sessions(created_at DESC)`, `livesession_event(session_id, id)` plus Search-Indizes.
- Retention: regelmaessig `npm run db:prune:livesession-events` (ENV: `LIVESESSION_RETENTION_*`).
- Migrationen: `npm run db:migrate` (node-pg-migrate, `db/migrations`).
- Rollback nur soweit sinnvoll: `npm run db:migrate:down` (dev-only, best-effort).

## 9. Troubleshooting (Kurz)
- 500-Fehler: Logs prüfen, DB-Erreichbarkeit/ENV checken.
- 42703 (missing column) bei /api/v1/sessions: Migrationen 004/005/006 pruefen.
- 401/403: x-api-key korrekt? (Typewriter-Endpunkte); Live-Sessions sind public.
- WS bricht sofort ab: Pfad `/api/v1/live-sessions/{id}/stream` pruefen, Host-Header/Proxy-Weitergabe und WS-Rate-Limits checken.
- Keine WS-Events: Trigger aktiv? NOTIFY-Kanal `livesession_<sessionId>`? PG-LISTEN verbunden?
- Tests schlagen fehl: TEST_DATABASE_URL/DB-Creds korrekt? Migrationen im Test-DB-Setup ausgeführt?

## 10. Zukunftserweiterungen (Ausblick)
- User-/Tenant-Modell statt globalem API-Key; feinere Rate-Limits.
- Metrics/Prometheus-Endpoint; zentrale Log-Aggregation.
- Swagger/Redoc-Auslieferung; Docker/Compose/K8s-Deployment.
- Cursor-Pagination für Sessions; WS-Client-Backoff/Retry-Doku; CI/CD mit Lint/Tests/Migrations-Check.
