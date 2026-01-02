#include "sync.h"
#include <stdio.h>
#include <string.h>

static int known_session(session_store_t *store, int id) {
    session_t tmp = {0};
    int rc = session_store_get(store, id, &tmp);
    session_free(&tmp);
    return rc == 0;
}

int perform_sync(http_client_t *client, session_store_t *store, const sync_config_t *cfg) {
    int limit = cfg && cfg->page_limit > 0 ? cfg->page_limit : 200;
    if (limit > 1000) limit = 1000;

    int offset = 0;
    int total = 0;
    int page = 0;

    printf("Starte Sync...\n");
    while (1) {
        session_t *sessions = NULL;
        size_t len = 0;
        pagination_t pg = {0};
        if (api_list_sessions_page(client, limit, offset, &sessions, &len, &pg) != 0) {
            fprintf(stderr, "API Fehler bei offset %d\n", offset);
            return -1;
        }

        if (page == 0) total = pg.total;
        if (len == 0) {
            sessions_free(sessions, len);
            break;
        }

        sqlite3_exec(store->db, "BEGIN;", NULL, NULL, NULL);
        for (size_t i = 0; i < len; i++) {
            session_store_upsert(store, &sessions[i]);
        }
        sqlite3_exec(store->db, "COMMIT;", NULL, NULL, NULL);
        sessions_free(sessions, len);

        offset += (int)len;
        page++;
        printf("Page %d synced (%d/%d)\n", page, offset, total);
        if (offset >= total) break;
    }

    return 0;
}
