# API Source of Truth

## Contract
- Source of truth for proxy coverage and smoke tests: `docs/openapi.yaml`.
- Root-level `openapi.yaml` is outdated and should not be used for tooling.

## Auth Policy Overrides
Even if the OpenAPI security flags are inconsistent, apply the internal policy:
- **Require `x-api-key`** for all `/api/v1/sessions*`, `/api/v1/documents*`,
  `/api/v1/sessions/*/analysis-runs`, `/api/v1/analysis-runs*`, `/api/v1/notes*`.
- **No `x-api-key`** for HTTP `/api/v1/live-sessions*` endpoints.

## Exclusions
- WebSocket stream `/api/v1/live-sessions/{id}/stream` is **not** part of HTTP proxy coverage.
- `/api/health` is out of scope for proxy coverage unless explicitly added.

## Coverage List
- Required proxy coverage list lives in `config/api-proxy-required.json`.
