#ifndef TYPEWRITER_API_H
#define TYPEWRITER_API_H

#include "http_client.h"
#include <stddef.h>

typedef struct {
    int id;
    char *text;
    char *created_at;
    int word_count;
    int char_count;
    int letter_count;
} session_t;

typedef struct {
    int limit;
    int offset;
    int total;
} pagination_t;

int api_list_sessions_page(http_client_t *client, int limit, int offset, session_t **out_sessions, size_t *out_len, pagination_t *out_pagination);
int api_get_session(http_client_t *client, int id, session_t *out_session);
int api_get_last_session(http_client_t *client, session_t *out_session);

void session_free(session_t *s);
void sessions_free(session_t *arr, size_t len);

#endif // TYPEWRITER_API_H
