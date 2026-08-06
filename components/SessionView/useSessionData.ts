'use client';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import type {
  SearchPagination,
  Session,
  SessionPagination,
  SessionSearchMatch,
} from './types';

const DEFAULT_API_BASE_URL = '/api';
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, '');
const API_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
};

type SessionsResponse = {
  success: boolean;
  data?: Session[];
  pagination?: SessionPagination;
  error?: string;
  message?: string;
};

type SearchPageResponse = {
  success: boolean;
  data?: Array<SessionPayload | SessionSearchMatch>;
  pagination?: SearchPagination;
  error?: string;
  message?: string;
};

type UpdateSessionPayload = Partial<
  Pick<Session, 'title' | 'status' | 'tags'>
>;

type CreateSessionPayload = { text: string } &
  Partial<Pick<Session, 'title' | 'status' | 'tags'>>;

type UseSessionDataOptions = {
  pageSize?: number;
  prefetchDelayMs?: number;
  autoPrefetch?: boolean;
  searchQuery?: string;
};

type SessionPayload = Omit<Session, 'id'> & {
  id: number | string;
  text_preview?: string;
  tags?: string[];
};

const isSessionPayload = (
  entry: SessionPayload | SessionSearchMatch,
): entry is SessionPayload =>
  'id' in entry && ('created_at' in entry || 'text' in entry || 'preview' in entry);

const getSearchSessionId = (entry: SessionPayload | SessionSearchMatch) =>
  isSessionPayload(entry) ? entry.id : entry.session_id;

const normalizeSession = (entry: SessionPayload): Session => {
  const preview = entry.preview ?? entry.text_preview;
  return {
    ...entry,
    id: Number(entry.id),
    preview,
    text_preview: entry.text_preview ?? preview,
    text: entry.text,
    tags: entry.tags ?? [],
    status: entry.status ?? 'draft',
  };
};

const getNextListToken = (pagination?: SessionPagination | null) =>
  pagination?.next_page_token ??
  pagination?.nextPageToken ??
  pagination?.next_cursor ??
  pagination?.cursor ??
  null;

const getNextSearchToken = (pagination?: SearchPagination | null) =>
  pagination?.next_page_token ??
  pagination?.nextPageToken ??
  pagination?.next_cursor ??
  pagination?.cursor ??
  null;

const normalizeListPagination = (
  pagination: SessionPagination | undefined,
  pageSize: number,
  fallbackOffset: number,
  loadedCount: number,
): SessionPagination => {
  const nextToken = getNextListToken(pagination);
  const hasMore =
    pagination?.has_more ??
    pagination?.hasMore ??
    Boolean(nextToken);

  return {
    ...pagination,
    limit: pagination?.limit ?? pagination?.page_size ?? pagination?.pageSize ?? pageSize,
    page_size: pagination?.page_size ?? pagination?.pageSize ?? pagination?.limit ?? pageSize,
    offset: pagination?.offset ?? fallbackOffset,
    has_more: hasMore,
    next_page_token: nextToken,
    total: pagination?.total ?? (hasMore ? undefined : loadedCount),
  };
};

const buildApiUrl = (
  path: string,
  query?: Record<string, string | number | undefined>,
) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const params = new URLSearchParams();
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        params.set(key, String(value));
      }
    }
  }
  const queryString = params.toString();
  return `${API_BASE_URL}${normalizedPath}${queryString ? `?${queryString}` : ''}`;
};

export function useSessionData(options: UseSessionDataOptions = {}) {
  const pageSize = options.pageSize ?? 50;
  const prefetchDelayMs = options.prefetchDelayMs ?? 1200;
  const autoPrefetch = options.autoPrefetch ?? true;
  const searchQuery = options.searchQuery?.trim() ?? '';

  const [sessions, setSessions] = useState<Session[]>([]);
  const [pagination, setPagination] = useState<SessionPagination>(() => ({
    page_size: pageSize,
    has_more: false,
    next_page_token: null,
  }));
  const [searchPage, setSearchPage] = useState<SearchPagination>(() => ({
    limit: pageSize,
    cursor: null,
    next_cursor: null,
  }));

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingSessionIds, setDeletingSessionIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [error, setError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const abortRef = useRef<AbortController | null>(null);
  const prefetchTimerRef = useRef<number | null>(null);
  const byIdRef = useRef<Map<number, Session>>(new Map());
  const fullSessionsRef = useRef<Map<number, Session>>(new Map());
  const paginationRef = useRef<SessionPagination>({
    page_size: pageSize,
    has_more: false,
    next_page_token: null,
  });
  const loadingRef = useRef(false);
  const loadingMoreRef = useRef(false);
  const modeRef = useRef<'list' | 'search'>('list');
  const lastQueryRef = useRef(searchQuery);

  const mergeSessions = useCallback(
    (incoming: Session[], append: boolean, rememberFull = false) => {
      if (!append) {
        byIdRef.current = new Map();
      }
      for (const session of incoming) {
        byIdRef.current.set(session.id, session);
        if (rememberFull) {
          fullSessionsRef.current.set(session.id, session);
        }
      }
      const merged = Array.from(byIdRef.current.values());
      startTransition(() => setSessions(merged));
      return merged.length;
    },
    [startTransition],
  );

  const fetchListPage = useCallback(
    async (
      pageToken: string | null,
      append: boolean,
      silent = false,
      fallbackOffset?: number,
    ) => {
      if (!silent) {
        setError(null);
        if (append) {
          loadingMoreRef.current = true;
          setIsLoadingMore(true);
        } else {
          loadingRef.current = true;
          setIsLoading(true);
        }
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch(
          buildApiUrl('/sessions/full', {
            page_size: pageSize,
            page_token: pageToken ?? undefined,
            offset: pageToken ? undefined : fallbackOffset,
          }),
          {
            method: 'GET',
            headers: { Accept: 'application/json' },
            cache: 'no-store',
            signal: controller.signal,
          },
        );
        if (response.status === 304) {
          return { ok: true as const, unchanged: true as const };
        }
        const json = (await response.json()) as SessionsResponse;
        if (!response.ok || !json.success || !json.data) {
          const message =
            (!json.success && (json.error || json.message)) ||
            json.message ||
            'Sessions konnten nicht geladen werden.';
          throw new Error(message);
        }
        const normalized = json.data.map(normalizeSession);
        const loadedCount = mergeSessions(normalized, append, true);
        const nextPagination = normalizeListPagination(
          json.pagination,
          pageSize,
          fallbackOffset ?? 0,
          loadedCount,
        );
        paginationRef.current = nextPagination;
        startTransition(() => setPagination(nextPagination));
        return { ok: true as const, total: nextPagination.total };
      } catch (err) {
        if ((err as { name?: string }).name === 'AbortError') {
          return { ok: false as const, aborted: true as const };
        }
        const message =
          err instanceof Error
            ? err.message
            : 'Unbekannter Fehler beim Laden der Sessions.';
        if (!silent) setError(message);
        return { ok: false as const, message };
      } finally {
        if (!silent) {
          loadingRef.current = false;
          loadingMoreRef.current = false;
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [mergeSessions, pageSize, startTransition],
  );

  const fetchSessionById = useCallback(
    async (id: number, signal: AbortSignal) => {
      const cached = fullSessionsRef.current.get(id) ?? byIdRef.current.get(id);
      if (cached?.text !== undefined) return cached;

      const response = await fetch(buildApiUrl(`/sessions/${id}`), {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal,
      });
      const json = (await response.json()) as {
        success: boolean;
        data?: SessionPayload;
        error?: string;
        message?: string;
      };
      if (!response.ok || !json.success || !json.data) {
        throw new Error(
          json.error || json.message || `Session #${id} konnte nicht geladen werden.`,
        );
      }

      const session = normalizeSession(json.data);
      fullSessionsRef.current.set(session.id, session);
      return session;
    },
    [],
  );

  const fetchSearchPage = useCallback(
    async (pageToken: string | null, append: boolean, silent = false) => {
      if (!silent) {
        setError(null);
        if (append) {
          loadingMoreRef.current = true;
          setIsLoadingMore(true);
        } else {
          loadingRef.current = true;
          setIsLoading(true);
        }
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch(
          buildApiUrl('/sessions/search', {
            q: searchQuery,
            page_size: pageSize,
            page_token: pageToken ?? undefined,
            fields: 'text,title,tags',
          }),
          {
            method: 'GET',
            headers: API_HEADERS,
            cache: 'no-store',
            signal: controller.signal,
          },
        );
        const json = (await response.json()) as SearchPageResponse;
        if (!response.ok || !json.success || !json.data) {
          const message =
            (!json.success && (json.error || json.message)) ||
            json.message ||
            'Sessions konnten nicht geladen werden.';
          throw new Error(message);
        }
        const normalized = await Promise.all(
          json.data.map(async (entry) => {
            if (isSessionPayload(entry)) {
              const session = normalizeSession(entry);
              fullSessionsRef.current.set(session.id, session);
              return session;
            }

            return fetchSessionById(Number(getSearchSessionId(entry)), controller.signal);
          }),
        );
        const nextToken = getNextSearchToken(json.pagination);
        const hasMore =
          json.pagination?.has_more ?? json.pagination?.hasMore ?? Boolean(nextToken);
        const nextPagination: SearchPagination = {
          ...json.pagination,
          limit: json.pagination?.limit ?? json.pagination?.page_size ?? pageSize,
          page_size: json.pagination?.page_size ?? json.pagination?.limit ?? pageSize,
          cursor: pageToken ?? null,
          next_cursor: nextToken,
          next_page_token: nextToken,
          has_more: hasMore,
        };
        startTransition(() => setSearchPage(nextPagination));
        mergeSessions(normalized, append);
        return { ok: true as const, total: nextPagination.total };
      } catch (err) {
        if ((err as { name?: string }).name === 'AbortError') {
          return { ok: false as const, aborted: true as const };
        }
        const message =
          err instanceof Error
            ? err.message
            : 'Unbekannter Fehler beim Laden der Sessions.';
        if (!silent) setError(message);
        return { ok: false as const, message };
      } finally {
        if (!silent) {
          loadingRef.current = false;
          loadingMoreRef.current = false;
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [fetchSessionById, mergeSessions, pageSize, searchQuery, startTransition],
  );

  const stopPrefetch = useCallback(() => {
    if (prefetchTimerRef.current === null) return;
    if (typeof window !== 'undefined') {
      window.clearTimeout(prefetchTimerRef.current);
    }
    prefetchTimerRef.current = null;
  }, []);

  const schedulePrefetchTick = useCallback(() => {
    stopPrefetch();
    if (typeof window === 'undefined') return;
    if (modeRef.current !== 'list') return;

    prefetchTimerRef.current = window.setTimeout(async () => {
      if (!autoPrefetch) return;
      if (loadingRef.current || loadingMoreRef.current) {
        schedulePrefetchTick();
        return;
      }
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        schedulePrefetchTick();
        return;
      }
      const currentPagination = paginationRef.current;
      const canLoadMoreByTotal =
        currentPagination.total !== undefined &&
        byIdRef.current.size < currentPagination.total;
      if (
        !currentPagination.has_more &&
        !currentPagination.next_page_token &&
        !canLoadMoreByTotal
      ) {
        return;
      }

      await fetchListPage(
        currentPagination.next_page_token ?? null,
        true,
        true,
        byIdRef.current.size,
      );
      schedulePrefetchTick();
    }, prefetchDelayMs);
  }, [
    autoPrefetch,
    fetchListPage,
    prefetchDelayMs,
    stopPrefetch,
  ]);

  const refreshSessions = useCallback(async () => {
    stopPrefetch();
    byIdRef.current = new Map();
    startTransition(() => setSessions([]));

    if (searchQuery) {
      modeRef.current = 'search';
      setSearchPage({ limit: pageSize, cursor: null, next_cursor: null });
      return fetchSearchPage(null, false);
    }

    modeRef.current = 'list';
    const initialPagination = {
      page_size: pageSize,
      has_more: false,
      next_page_token: null,
    };
    paginationRef.current = initialPagination;
    setPagination(initialPagination);
    return fetchListPage(null, false);
  }, [fetchListPage, fetchSearchPage, pageSize, searchQuery, stopPrefetch, startTransition]);

  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore) return;
    stopPrefetch();

    if (modeRef.current === 'search') {
      const nextSearchToken = searchPage.next_page_token ?? searchPage.next_cursor;
      if (!nextSearchToken) return;
      return fetchSearchPage(nextSearchToken, true);
    }

    const canLoadMoreByTotal =
      pagination.total !== undefined && sessions.length < pagination.total;
    if (!pagination.has_more && !pagination.next_page_token && !canLoadMoreByTotal) {
      return;
    }
    return fetchListPage(
      pagination.next_page_token ?? null,
      true,
      false,
      sessions.length,
    );
  }, [
    fetchListPage,
    fetchSearchPage,
    isLoading,
    isLoadingMore,
    pagination.has_more,
    pagination.next_page_token,
    pagination.total,
    searchPage.next_page_token,
    searchPage.next_cursor,
    sessions.length,
    stopPrefetch,
  ]);

  const updateSession = useCallback(
    async (id: number, payload: UpdateSessionPayload) => {
      const body: Record<string, unknown> = {};
      if (payload.title !== undefined) body.title = payload.title;
      if (payload.status !== undefined) body.status = payload.status;
      if (payload.tags !== undefined) body.tags = payload.tags;
      if (Object.keys(body).length === 0) return { success: false as const };

      setIsUpdating(true);
      setError(null);
      try {
        const res = await fetch(buildApiUrl(`/sessions/${id}`), {
          method: 'PATCH',
          headers: API_HEADERS,
          body: JSON.stringify(body),
        });
        const json = (await res.json()) as {
          success: boolean;
          data?: Session;
          error?: string;
          message?: string;
        };
        if (!res.ok || !json.success || !json.data) {
          throw new Error(json.error || json.message || 'Update fehlgeschlagen.');
        }
        const updated = normalizeSession(json.data as SessionPayload);
        const existing = byIdRef.current.get(id);
        const merged: Session = { ...(existing ?? ({} as Session)), ...updated };
        byIdRef.current.set(id, merged);
        startTransition(() => setSessions(Array.from(byIdRef.current.values())));
        return { success: true as const, session: merged };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unbekannter Fehler beim Update.';
        setError(message);
        return { success: false as const, error: message };
      } finally {
        setIsUpdating(false);
      }
    },
    [startTransition],
  );

  const createSession = useCallback(
    async (payload: CreateSessionPayload) => {
      const text = payload.text.trim();
      if (!text) {
        return { success: false as const, error: 'Text darf nicht leer sein.' };
      }

      const body: Record<string, unknown> = { text };
      const title = payload.title?.trim();
      if (title) body.title = title;
      if (payload.status) body.status = payload.status;
      if (payload.tags) body.tags = payload.tags;

      setIsCreating(true);
      setError(null);
      try {
        const res = await fetch(buildApiUrl('/sessions'), {
          method: 'POST',
          headers: API_HEADERS,
          body: JSON.stringify(body),
        });
        const json = (await res.json()) as {
          success: boolean;
          data?: Session;
          error?: string;
          message?: string;
        };
        if (!res.ok || !json.success || !json.data) {
          throw new Error(
            json.error || json.message || 'Session konnte nicht erstellt werden.',
          );
        }
        const created = normalizeSession(json.data as SessionPayload);
        byIdRef.current.set(created.id, created);
        startTransition(() => {
          setSessions(Array.from(byIdRef.current.values()));
          setPagination((current) => ({
            ...current,
            total: current.total === undefined ? current.total : current.total + 1,
          }));
        });
        return { success: true as const, session: created };
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unbekannter Fehler beim Erstellen.';
        setError(message);
        return { success: false as const, error: message };
      } finally {
        setIsCreating(false);
      }
    },
    [startTransition],
  );

  const deleteSession = useCallback(
    async (id: number) => {
      setDeletingSessionIds((current) => new Set(current).add(id));
      setError(null);
      try {
        const res = await fetch(buildApiUrl(`/sessions/${id}`), {
          method: 'DELETE',
          headers: API_HEADERS,
          cache: 'no-store',
        });
        const json = res.status === 204 ? null : await res.json().catch(() => null);
        const success =
          res.ok &&
          (!json ||
            (typeof json === 'object' &&
              'success' in json &&
              (json as { success?: boolean }).success));

        if (!success) {
          const payload = json as
            | { error?: string; message?: string; success?: boolean }
            | null;
          throw new Error(
            payload?.error ||
              payload?.message ||
              'Session konnte nicht in den Papierkorb verschoben werden.',
          );
        }

        byIdRef.current.delete(id);
        startTransition(() => {
          setSessions(Array.from(byIdRef.current.values()));
          setPagination((current) => ({
            ...current,
            total:
              current.total === undefined
                ? current.total
                : Math.max(0, current.total - 1),
          }));
          setSearchPage((current) => ({
            ...current,
            total:
              current.total === undefined
                ? current.total
                : Math.max(0, current.total - 1),
          }));
        });
        return { success: true as const };
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unbekannter Fehler beim Verschieben in den Papierkorb.';
        setError(message);
        return { success: false as const, error: message };
      } finally {
        setDeletingSessionIds((current) => {
          const next = new Set(current);
          next.delete(id);
          return next;
        });
      }
    },
    [startTransition],
  );

  useEffect(() => {
    if (searchQuery === lastQueryRef.current) return;
    lastQueryRef.current = searchQuery;
    void refreshSessions();
  }, [refreshSessions, searchQuery]);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  useEffect(() => {
    void refreshSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (modeRef.current !== 'list') {
      stopPrefetch();
      return;
    }
    if (!autoPrefetch) return;
    if (isLoading || isLoadingMore) return;
    if (
      !pagination.has_more &&
      !pagination.next_page_token &&
      !(pagination.total !== undefined && sessions.length < pagination.total)
    ) {
      return;
    }

    schedulePrefetchTick();
    return stopPrefetch;
  }, [
    autoPrefetch,
    isLoading,
    isLoadingMore,
    pagination.has_more,
    pagination.next_page_token,
    pagination.total,
    schedulePrefetchTick,
    sessions.length,
    stopPrefetch,
  ]);

  const hasMore =
    modeRef.current === 'search'
      ? Boolean(
          searchPage.has_more ||
            searchPage.next_page_token ||
            searchPage.next_cursor,
        )
      : Boolean(
          pagination.has_more ||
            pagination.next_page_token ||
            (pagination.total !== undefined && sessions.length < pagination.total),
        );

  return {
    sessions,
    pagination,
    searchPage,
    hasMore,
    isLoading,
    isLoadingMore,
    isCreating,
    isUpdating,
    deletingSessionIds,
    isPending,
    error,
    refreshSessions,
    loadMore,
    createSession,
    updateSession,
    deleteSession,
  };
}
