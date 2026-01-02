CFLAGS ?= -O2 -Wall -Wextra -std=c99
LIBS := $(shell pkg-config --libs libcurl sqlite3) -lcjson
INCS := $(shell pkg-config --cflags libcurl sqlite3)

SRC := src/http_client.c src/typewriter_api.c src/session_store.c src/sync.c src/main.c
OBJ := $(SRC:.c=.o)

all: typewriter

typewriter: $(OBJ)
	$(CC) $(CFLAGS) -o $@ $(OBJ) $(LIBS)

%.o: %.c
	$(CC) $(CFLAGS) $(INCS) -c $< -o $@

clean:
	rm -f $(OBJ) typewriter

.PHONY: all clean
