#include "http_client.h"
#include "session_store.h"
#include "sync.h"
#include "typewriter_api.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static const char *env_or_default(const char *env, const char *def) {
    const char *v = getenv(env);
    return v && *v ? v : def;
}

static void usage(void) {
    printf("typewriter CLI\n");
    printf("Commands:\n");
    printf("  sync   --db PATH [--base-url URL] [--api-key KEY] [--limit N]\n");
    printf("  search --db PATH \"query\" [--limit N]\n");
    printf("  get    --db PATH <id>\n");
    printf("  stats  --db PATH\n");
}

static int parse_int(const char *s, int *out) {
    char *end = NULL;
    long v = strtol(s, &end, 10);
    if (!end || *end != '\0') return -1;
    *out = (int)v;
    return 0;
}

int main(int argc, char **argv) {
    if (argc < 2) {
        usage();
        return 1;
    }
    const char *cmd = argv[1];
    const char *db_path = "./sessions.db";
    const char *base_url = env_or_default("TYPEWRITER_BASE_URL", "http://localhost:3001");
    const char *api_key = getenv("TYPEWRITER_API_KEY");
    int limit = 20;

    for (int i = 2; i < argc; i++) {
        if (strcmp(argv[i], "--db") == 0 && i + 1 < argc) {
            db_path = argv[++i];
        } else if (strcmp(argv[i], "--base-url") == 0 && i + 1 < argc) {
            base_url = argv[++i];
        } else if (strcmp(argv[i], "--api-key") == 0 && i + 1 < argc) {
            api_key = argv[++i];
        } else if (strcmp(argv[i], "--limit") == 0 && i + 1 < argc) {
            parse_int(argv[++i], &limit);
        }
    }

    session_store_t store = {0};
    if (session_store_open(&store, db_path) != 0) return 1;
    if (session_store_init_schema(&store) != 0) return 1;

    if (strcmp(cmd, "sync") == 0) {
        http_client_t client;
        http_client_init(&client, base_url, api_key ? api_key : "");
        sync_config_t cfg = {.page_limit = limit};
        int rc = perform_sync(&client, &store, &cfg);
        http_client_cleanup(&client);
        session_store_close(&store);
        return rc == 0 ? 0 : 1;
    } else if (strcmp(cmd, "search") == 0) {
        if (argc < 3) {
            usage();
            return 1;
        }
        const char *query = argv[argc - 1];
        session_store_search(&store, query, limit);
        session_store_close(&store);
        return 0;
    } else if (strcmp(cmd, "get") == 0) {
        if (argc < 3) {
            usage();
            return 1;
        }
        int id = 0;
        parse_int(argv[argc - 1], &id);
        session_t s = {0};
        if (session_store_get(&store, id, &s) == 0) {
            printf("Session #%d (%s)\n%s\n", s.id, s.created_at, s.text);
            session_free(&s);
        } else {
            printf("Session not found in DB\n");
        }
        session_store_close(&store);
        return 0;
    } else if (strcmp(cmd, "stats") == 0) {
        store_stats_t stats = {0};
        if (session_store_stats(&store, &stats) == 0) {
            printf("Sessions: %d\nLast created_at: %s\nDB size: %lld bytes\n", stats.count,
                   stats.last_created_at, stats.db_size_bytes);
        }
        session_store_close(&store);
        return 0;
    }

    usage();
    session_store_close(&store);
    return 1;
}
