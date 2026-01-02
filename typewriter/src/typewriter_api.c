#include "typewriter_api.h"
#include <cjson/cJSON.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static int parse_session(cJSON *item, session_t *out) {
    if (!cJSON_IsObject(item)) return -1;
    cJSON *id = cJSON_GetObjectItem(item, "id");
    cJSON *text = cJSON_GetObjectItem(item, "text");
    cJSON *created_at = cJSON_GetObjectItem(item, "created_at");
    cJSON *wc = cJSON_GetObjectItem(item, "word_count");
    cJSON *cc = cJSON_GetObjectItem(item, "char_count");
    cJSON *lc = cJSON_GetObjectItem(item, "letter_count");
    if (!cJSON_IsNumber(id) || !cJSON_IsString(text) || !cJSON_IsString(created_at) ||
        !cJSON_IsNumber(wc) || !cJSON_IsNumber(cc) || !cJSON_IsNumber(lc)) {
        return -1;
    }
    out->id = id->valueint;
    out->text = strdup(text->valuestring);
    out->created_at = strdup(created_at->valuestring);
    out->word_count = wc->valueint;
    out->char_count = cc->valueint;
    out->letter_count = lc->valueint;
    return 0;
}

void session_free(session_t *s) {
    if (!s) return;
    free(s->text);
    free(s->created_at);
    memset(s, 0, sizeof(*s));
}

void sessions_free(session_t *arr, size_t len) {
    if (!arr) return;
    for (size_t i = 0; i < len; i++) {
        session_free(&arr[i]);
    }
    free(arr);
}

static int parse_response_sessions(const char *json, session_t **out_sessions, size_t *out_len, pagination_t *out_pg) {
    cJSON *root = cJSON_Parse(json);
    if (!root) return -1;
    int rc = -1;
    cJSON *success = cJSON_GetObjectItem(root, "success");
    if (!cJSON_IsBool(success) || !cJSON_IsTrue(success)) goto end;
    cJSON *data = cJSON_GetObjectItem(root, "data");
    cJSON *pagination = cJSON_GetObjectItem(root, "pagination");
    if (!cJSON_IsArray(data) || !cJSON_IsObject(pagination)) goto end;

    size_t len = cJSON_GetArraySize(data);
    session_t *arr = calloc(len, sizeof(session_t));
    if (!arr) goto end;

    for (size_t i = 0; i < len; i++) {
        cJSON *item = cJSON_GetArrayItem(data, (int)i);
        if (parse_session(item, &arr[i]) != 0) {
            sessions_free(arr, len);
            goto end;
        }
    }

    if (out_pg) {
        cJSON *limit = cJSON_GetObjectItem(pagination, "limit");
        cJSON *offset = cJSON_GetObjectItem(pagination, "offset");
        cJSON *total = cJSON_GetObjectItem(pagination, "total");
        out_pg->limit = cJSON_IsNumber(limit) ? limit->valueint : 0;
        out_pg->offset = cJSON_IsNumber(offset) ? offset->valueint : 0;
        out_pg->total = cJSON_IsNumber(total) ? total->valueint : 0;
    }

    *out_sessions = arr;
    *out_len = len;
    rc = 0;
end:
    cJSON_Delete(root);
    return rc;
}

static int parse_response_session(const char *json, session_t *out_session) {
    cJSON *root = cJSON_Parse(json);
    if (!root) return -1;
    int rc = -1;
    cJSON *success = cJSON_GetObjectItem(root, "success");
    cJSON *data = cJSON_GetObjectItem(root, "data");
    if (!cJSON_IsBool(success) || !cJSON_IsTrue(success) || !cJSON_IsObject(data)) goto end;
    rc = parse_session(data, out_session);
end:
    cJSON_Delete(root);
    return rc;
}

int api_list_sessions_page(http_client_t *client, int limit, int offset, session_t **out_sessions, size_t *out_len, pagination_t *out_pagination) {
    char query[128];
    snprintf(query, sizeof(query), "limit=%d&offset=%d", limit, offset);

    http_buffer_t buf = {0};
    long status = 0;
    int rc = http_get(client, "/api/v1/sessions", query, &buf, &status);
    if (rc != 0 || status != 200) {
        http_buffer_free(&buf);
        return -1;
    }
    rc = parse_response_sessions(buf.data, out_sessions, out_len, out_pagination);
    http_buffer_free(&buf);
    return rc;
}

int api_get_session(http_client_t *client, int id, session_t *out_session) {
    char path[64];
    snprintf(path, sizeof(path), "/api/v1/sessions/%d", id);
    http_buffer_t buf = {0};
    long status = 0;
    int rc = http_get(client, path, NULL, &buf, &status);
    if (rc != 0 || status != 200) {
        http_buffer_free(&buf);
        return -1;
    }
    rc = parse_response_session(buf.data, out_session);
    http_buffer_free(&buf);
    return rc;
}

int api_get_last_session(http_client_t *client, session_t *out_session) {
    http_buffer_t buf = {0};
    long status = 0;
    int rc = http_get(client, "/api/v1/sessions/last", NULL, &buf, &status);
    if (rc != 0 || status != 200) {
        http_buffer_free(&buf);
        return -1;
    }
    rc = parse_response_session(buf.data, out_session);
    http_buffer_free(&buf);
    return rc;
}
