# 42703 missing column bei /api/v1/sessions

## Symptom
- GET /api/v1/sessions liefert HTTP 500.
- Postgres meldet code 42703 (missing column).

## Root Cause
- Der Sessions-Query in `src/modules/typewriter/typewriter.repository.ts` (getSessionsPaged)
  selektiert Spalten wie `title`, `status`, `tags`, `updated_at`, `parent_id`, `letter_count`.
- In der produktiven DB waren die Schema-Erweiterungen aus Migrationen 004/005/006 nicht ausgerollt.
- Dadurch fehlt mindestens `sessions.title` (erste Spalte im SELECT) und Postgres wirft 42703.

## Fix
- Migrationen nachziehen:
  - `DATABASE_URL` setzen und `npm run db:migrate` ausfuehren.
  - Falls benoetigt: Migrationen 004/005/006 in `db/migrations` pruefen.
- Danach Service neu starten und /api/v1/sessions pruefen.

## Rollout-Schritte (prod)
1. PM2 Service kurz stoppen (oder Readonly Wartungsfenster).
2. Migrationen wie oben ausfuehren (Achtung: `pg_trgm` Extension benoetigt passende Rechte).
3. Service wieder starten.
4. Smoke-Test: `curl -i /api/v1/sessions?limit=5&offset=0`.

## Praevention
- Runbook strikt befolgen: neue Migrationen vor jedem Deploy ausrollen.
- Optional: CI/CD Schritt, der offene Migrationen gegen die DB prueft.
- Optional: Startup-Check im Service, der fehlende Spalten klar loggt.
