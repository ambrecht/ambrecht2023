# API TODO (intern)

## Muss (vor Prod-Launch)
- [ ] ENV/Vault: API_KEY sicher hinterlegen (keine Defaults in Prod); DB-Creds nur via ENV/Secrets.
- [ ] Datenbank: Migrationsablauf dokumentieren/ausführen (001/002, Trigger/Indizes); sicherstellen, dass Prod-DB Schema zu Code passt.
- [ ] Tests: E2E in realer Test-DB lauffähig machen (TEST_DATABASE_URL bereitstellen, DB-Creds korrekt); `npm test` muss grün laufen.
- [ ] Logging: Prüfen, dass in Production-Mode keine sensiblen Daten (API-Keys) geloggt werden; Log-Sink definieren.
- [ ] Rate-Limit/CORS: Grenzen/Origins für Prod festlegen (nicht nur Defaults); ggf. API-Key-basiertes Throttling erwägen.
- [ ] Healthcheck/Monitoring: /api/health als LB-Check nutzen und im README dokumentieren; Basis-Monitoring (Logs, DB-Erreichbarkeit) klären.
- [ ] Deployment-Prozess: Startbefehle (build/start), Env-Vars und Migrationsschritte schriftlich festhalten.

## Nice-to-have (nach Prod-Launch)
- [ ] OpenAPI (src/docs/openapi.yaml) über Swagger-UI/Redoc bereitstellen.
- [ ] Prometheus-/Metrics-Hook oder JSON-Lines-Logs für zentrale Auswertung einführen.
- [ ] Bessere Env-Trennung (dev/test/prod) und CI-Workflow (Lint/Tests/Migrations-Check).
- [ ] Docker-/Compose-Setup erstellen/verbessern und im README dokumentieren.
- [ ] API-Key durch echtes User-/Tenant-Modell ersetzen; feinere Rate-Limits pro Key/User.
- [ ] WebSocket-Client-Beispiele und Retry/Backoff-Doku ergänzen.
- [x] Cursor-basierte Pagination fuer FTS-Suche umgesetzt (/api/v1/sessions/search); Liste bleibt offset-basiert.
- [ ] Rollback/Recovery-Runbook für DB/Trigger dokumentieren.
