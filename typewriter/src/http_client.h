#ifndef HTTP_CLIENT_H
#define HTTP_CLIENT_H

#include <stddef.h>

typedef struct {
    char *base_url;
    char *api_key;
    long timeout_ms;
    int retries;
} http_client_t;

typedef struct {
    char *data;
    size_t len;
} http_buffer_t;

int http_client_init(http_client_t *client, const char *base_url, const char *api_key);
void http_client_cleanup(http_client_t *client);

int http_get(http_client_t *client, const char *path, const char *query, http_buffer_t *out_body, long *status_code);
void http_buffer_free(http_buffer_t *buf);

#endif // HTTP_CLIENT_H
