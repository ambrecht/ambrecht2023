# Typewriter CLI (C99)

Minimal CLI + library to sync sessions from the Typewriter API into SQLite (with FTS5), and query them locally.

## Build

Dependencies: `libcurl`, `sqlite3` (with FTS5 enabled), `cJSON`, `pkg-config`, `gcc` or `clang`.

```bash
cd typewriter
make
```

This produces the `typewriter` binary.

## Usage

Environment (optional):
```bash
export TYPEWRITER_BASE_URL=http://localhost:3001
export TYPEWRITER_API_KEY=your_key_here
```

Commands:
- Sync all sessions (paginated, default limit 200):
  ```bash
  ./typewriter sync --db ./sessions.db [--base-url URL] [--api-key KEY] [--limit N]
  ```
- Full‑text search (FTS5 MATCH):
  ```bash
  ./typewriter search --db ./sessions.db "query terms" [--limit N]
  ```
- Get a session from the local cache:
  ```bash
  ./typewriter get --db ./sessions.db <id>
  ```
- Stats:
  ```bash
  ./typewriter stats --db ./sessions.db
  ```

## Notes
- Sync uses server pagination (limit/offset) and upserts into SQLite; FTS index is updated per row.
- WAL mode is enabled for better write performance.
- HTTP requests include `x-api-key` when provided and use simple retries with backoff.
