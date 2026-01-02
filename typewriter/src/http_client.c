#include "http_client.h"
#include <curl/curl.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

static size_t write_cb(void *contents, size_t size, size_t nmemb, void *userp) {
    size_t realsize = size * nmemb;
    http_buffer_t *mem = (http_buffer_t *)userp;
    char *ptr = realloc(mem->data, mem->len + realsize + 1);
    if (!ptr) return 0;
    mem->data = ptr;
    memcpy(&(mem->data[mem->len]), contents, realsize);
    mem->len += realsize;
    mem->data[mem->len] = 0;
    return realsize;
}

int http_client_init(http_client_t *client, const char *base_url, const char *api_key) {
    if (!client || !base_url) return -1;
    memset(client, 0, sizeof(*client));
    client->base_url = strdup(base_url);
    client->api_key = api_key ? strdup(api_key) : NULL;
    client->timeout_ms = 15000;
    client->retries = 3;
    return 0;
}

void http_client_cleanup(http_client_t *client) {
    if (!client) return;
    free(client->base_url);
    free(client->api_key);
}

static void backoff_sleep(int attempt) {
    int ms = 100 * (1 << attempt);
    struct timespec req = {ms / 1000, (ms % 1000) * 1000000};
    nanosleep(&req, NULL);
}

int http_get(http_client_t *client, const char *path, const char *query, http_buffer_t *out_body, long *status_code) {
    if (!client || !path || !out_body) return -1;
    CURL *curl = curl_easy_init();
    if (!curl) return -1;

    char url[2048];
    if (query && strlen(query) > 0)
        snprintf(url, sizeof(url), "%s%s?%s", client->base_url, path, query);
    else
        snprintf(url, sizeof(url), "%s%s", client->base_url, path);

    struct curl_slist *headers = NULL;
    if (client->api_key && strlen(client->api_key) > 0) {
        char header[256];
        snprintf(header, sizeof(header), "x-api-key: %s", client->api_key);
        headers = curl_slist_append(headers, header);
    }
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    curl_easy_setopt(curl, CURLOPT_URL, url);
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, write_cb);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, out_body);
    curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
    curl_easy_setopt(curl, CURLOPT_CONNECTTIMEOUT_MS, client->timeout_ms);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT_MS, client->timeout_ms);

    int attempt = 0;
    CURLcode res;
    do {
        out_body->data = NULL;
        out_body->len = 0;
        res = curl_easy_perform(curl);
        if (res == CURLE_OK) break;
        attempt++;
        if (attempt < client->retries) backoff_sleep(attempt);
    } while (attempt < client->retries);

    if (res != CURLE_OK) {
        curl_slist_free_all(headers);
        curl_easy_cleanup(curl);
        return -1;
    }

    if (status_code) curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, status_code);

    curl_slist_free_all(headers);
    curl_easy_cleanup(curl);
    return 0;
}

void http_buffer_free(http_buffer_t *buf) {
    if (!buf) return;
    free(buf->data);
    buf->data = NULL;
    buf->len = 0;
}
