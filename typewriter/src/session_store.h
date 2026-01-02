#ifndef SESSION_STORE_H
#define SESSION_STORE_H

#include "typewriter_api.h"
#include <sqlite3.h>
#include <stddef.h>

typedef struct {
    sqlite3 *db;
} session_store_t;

typedef struct {
    int count;
    char last_created_at[64];
    long long db_size_bytes;
} store_stats_t;

int session_store_open(session_store_t *store, const char *path);
void session_store_close(session_store_t *store);
int session_store_init_schema(session_store_t *store);
int session_store_upsert(session_store_t *store, const session_t *s);
int session_store_get(session_store_t *store, int id, session_t *out);
int session_store_search(session_store_t *store, const char *query, int limit);
int session_store_stats(session_store_t *store, store_stats_t *out);

#endif // SESSION_STORE_H
