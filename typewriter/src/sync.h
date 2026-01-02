#ifndef SYNC_H
#define SYNC_H

#include "typewriter_api.h"
#include "session_store.h"

typedef struct {
    int page_limit;
} sync_config_t;

int perform_sync(http_client_t *client, session_store_t *store, const sync_config_t *cfg);

#endif // SYNC_H
