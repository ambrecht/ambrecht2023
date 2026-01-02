#include "session_store.h"
#include <sqlite3.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

int session_store_open(session_store_t *store, const char *path) {
    if (sqlite3_open(path, &store->db) != SQLITE_OK) {
        fprintf(stderr, "Could not open database: %s\n", sqlite3_errmsg(store->db));
        return -1;
    }
    sqlite3_exec(store->db, "PRAGMA journal_mode=WAL;", NULL, NULL, NULL);
    return 0;
}

void session_store_close(session_store_t *store) {
    if (!store || !store->db) return;
    sqlite3_close(store->db);
    store->db = NULL;
}

int session_store_init_schema(session_store_t *store) {
    const char *sql =
        "CREATE TABLE IF NOT EXISTS sessions ("
        "id INTEGER PRIMARY KEY,"
        "created_at TEXT NOT NULL,"
        "word_count INTEGER NOT NULL,"
        "char_count INTEGER NOT NULL,"
        "letter_count INTEGER NOT NULL,"
        "text TEXT NOT NULL,"
        "text_hash TEXT,"
        "synced_at TEXT NOT NULL"
        ");"
        "CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);"
        "CREATE VIRTUAL TABLE IF NOT EXISTS sessions_fts USING fts5(text, content='');";
    char *errmsg = NULL;
    if (sqlite3_exec(store->db, sql, NULL, NULL, &errmsg) != SQLITE_OK) {
        fprintf(stderr, "DB schema error: %s\n", errmsg);
        sqlite3_free(errmsg);
        return -1;
    }
    return 0;
}

static int update_fts(sqlite3 *db, int id, const char *text) {
    const char *del_sql = "DELETE FROM sessions_fts WHERE rowid = ?";
    const char *ins_sql = "INSERT INTO sessions_fts(rowid, text) VALUES(?, ?)";
    sqlite3_stmt *stmt = NULL;
    if (sqlite3_prepare_v2(db, del_sql, -1, &stmt, NULL) != SQLITE_OK) return -1;
    sqlite3_bind_int(stmt, 1, id);
    sqlite3_step(stmt);
    sqlite3_finalize(stmt);

    if (sqlite3_prepare_v2(db, ins_sql, -1, &stmt, NULL) != SQLITE_OK) return -1;
    sqlite3_bind_int(stmt, 1, id);
    sqlite3_bind_text(stmt, 2, text, -1, SQLITE_STATIC);
    int rc = sqlite3_step(stmt) == SQLITE_DONE ? 0 : -1;
    sqlite3_finalize(stmt);
    return rc;
}

static void now_iso(char *buf, size_t len) {
    time_t t = time(NULL);
    struct tm tm;
    gmtime_r(&t, &tm);
    strftime(buf, len, "%Y-%m-%dT%H:%M:%SZ", &tm);
}

int session_store_upsert(session_store_t *store, const session_t *s) {
    const char *sql =
        "INSERT INTO sessions (id, created_at, word_count, char_count, letter_count, text, synced_at) "
        "VALUES (?, ?, ?, ?, ?, ?, ?) "
        "ON CONFLICT(id) DO UPDATE SET "
        "created_at=excluded.created_at,"
        "word_count=excluded.word_count,"
        "char_count=excluded.char_count,"
        "letter_count=excluded.letter_count,"
        "text=excluded.text,"
        "synced_at=excluded.synced_at;";
    sqlite3_stmt *stmt = NULL;
    if (sqlite3_prepare_v2(store->db, sql, -1, &stmt, NULL) != SQLITE_OK) return -1;
    char synced_at[32];
    now_iso(synced_at, sizeof(synced_at));
    sqlite3_bind_int(stmt, 1, s->id);
    sqlite3_bind_text(stmt, 2, s->created_at, -1, SQLITE_STATIC);
    sqlite3_bind_int(stmt, 3, s->word_count);
    sqlite3_bind_int(stmt, 4, s->char_count);
    sqlite3_bind_int(stmt, 5, s->letter_count);
    sqlite3_bind_text(stmt, 6, s->text, -1, SQLITE_STATIC);
    sqlite3_bind_text(stmt, 7, synced_at, -1, SQLITE_STATIC);
    int rc = sqlite3_step(stmt) == SQLITE_DONE ? 0 : -1;
    sqlite3_finalize(stmt);
    if (rc != 0) return rc;
    return update_fts(store->db, s->id, s->text);
}

int session_store_get(session_store_t *store, int id, session_t *out) {
    const char *sql =
        "SELECT id, text, created_at, word_count, char_count, letter_count FROM sessions WHERE id = ?";
    sqlite3_stmt *stmt = NULL;
    if (sqlite3_prepare_v2(store->db, sql, -1, &stmt, NULL) != SQLITE_OK) return -1;
    sqlite3_bind_int(stmt, 1, id);
    int rc = -1;
    if (sqlite3_step(stmt) == SQLITE_ROW) {
        out->id = sqlite3_column_int(stmt, 0);
        out->text = strdup((const char *)sqlite3_column_text(stmt, 1));
        out->created_at = strdup((const char *)sqlite3_column_text(stmt, 2));
        out->word_count = sqlite3_column_int(stmt, 3);
        out->char_count = sqlite3_column_int(stmt, 4);
        out->letter_count = sqlite3_column_int(stmt, 5);
        rc = 0;
    }
    sqlite3_finalize(stmt);
    return rc;
}

int session_store_search(session_store_t *store, const char *query, int limit) {
    const char *sql =
        "SELECT s.id, snippet(sessions_fts, 0, '[', ']', '…', 10) AS snip, s.created_at, s.word_count "
        "FROM sessions_fts JOIN sessions s ON s.id = sessions_fts.rowid "
        "WHERE sessions_fts MATCH ? "
        "ORDER BY rank "
        "LIMIT ?;";
    sqlite3_stmt *stmt = NULL;
    if (sqlite3_prepare_v2(store->db, sql, -1, &stmt, NULL) != SQLITE_OK) return -1;
    sqlite3_bind_text(stmt, 1, query, -1, SQLITE_TRANSIENT);
    sqlite3_bind_int(stmt, 2, limit);
    printf("FTS Ergebnisse:\n");
    while (sqlite3_step(stmt) == SQLITE_ROW) {
        int id = sqlite3_column_int(stmt, 0);
        const unsigned char *snip = sqlite3_column_text(stmt, 1);
        const unsigned char *created_at = sqlite3_column_text(stmt, 2);
        int wc = sqlite3_column_int(stmt, 3);
        printf("- #%d (%s) [%d Wörter]\n  %s\n", id, created_at, wc, snip ? (const char *)snip : "");
    }
    sqlite3_finalize(stmt);
    return 0;
}

int session_store_stats(session_store_t *store, store_stats_t *out) {
    const char *sql = "SELECT COUNT(*), COALESCE(MAX(created_at), ''), "
                      "(SELECT total_bytes FROM pragma_page_count() JOIN pragma_page_size());";
    sqlite3_stmt *stmt = NULL;
    if (sqlite3_prepare_v2(store->db, sql, -1, &stmt, NULL) != SQLITE_OK) return -1;
    int rc = -1;
    if (sqlite3_step(stmt) == SQLITE_ROW) {
        out->count = sqlite3_column_int(stmt, 0);
        const unsigned char *last = sqlite3_column_text(stmt, 1);
        strncpy(out->last_created_at, last ? (const char *)last : "", sizeof(out->last_created_at) - 1);
        out->last_created_at[sizeof(out->last_created_at) - 1] = '\0';
        out->db_size_bytes = sqlite3_column_int64(stmt, 2);
        rc = 0;
    }
    sqlite3_finalize(stmt);
    return rc;
}
