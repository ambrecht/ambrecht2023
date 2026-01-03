'use client';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import type { SearchPagination, Session, SessionPagination } from './types';

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
  data?: SessionPayload[];
  pagination?: SearchPagination;
  error?: string;
  message?: string;
};

type UpdateSessionPayload = Partial<
  Pick<Session, 'title' | 'status' | 'tags'>
>;

type UseSessionDataOptions = {
  pageSize?: number;
  prefetchDelayMs?: number;
  autoPrefetch?: boolean;
  searchQuery?: string;
};

type SessionPayload = Session & { text_preview?: string; tags?: string[] };

const normalizeSession = (entry: SessionPayload): Session => {
  return {
    ...entry,
    text: entry.text ?? entry.text_preview ?? '',
    tags: entry.tags ?? [],
    status: entry.status ?? 'draft',
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
    limit: pageSize,
    offset: 0,
    total: 0,
  }));
  const [searchPage, setSearchPage] = useState<SearchPagination>(() => ({
    limit: pageSize,
    cursor: null,
    next_cursor: null,
  }));

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const abortRef = useRef<AbortController | null>(null);
  const prefetchTimerRef = useRef<number | null>(null);
  const byIdRef = useRef<Map<number, Session>>(new Map());
  const loadingRef = useRef(false);
  const loadingMoreRef = useRef(false);
  const modeRef = useRef<'list' | 'search'>('list');
  const lastQueryRef = useRef(searchQuery);

  const mergeSessions = useCallback(
    (incoming: Session[], append: boolean) => {
      if (!append) {
        byIdRef.current = new Map();
      }
      for (const session of incoming) {
        byIdRef.current.set(session.id, session);
      }
      const merged = Array.from(byIdRef.current.values());
      startTransition(() => setSessions(merged));
      return merged.length;
    },
    [startTransition],
  );

  const fetchListPage = useCallback(
    async (offsetToLoad: number, append: boolean, silent = false) => {
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
          buildApiUrl('/sessions', {
            limit: pageSize,
            offset: offsetToLoad,
          }),
          {
            method: 'GET',
            headers: API_HEADERS,
            cache: 'no-store',
            signal: controller.signal,
          },
        );
        const json = (await response.json()) as SessionsResponse;
        if (!response.ok || !json.success || !json.data) {
          const message =
            (!json.success && (json.error || json.message)) ||
            json.message ||
            'Sessions konnten nicht geladen werden.';
          throw new Error(message);
        }
        const normalized = json.data.map(normalizeSession);
        const nextPagination: SessionPagination = {
          limit: json.pagination?.limit ?? pageSize,
          offset: json.pagination?.offset ?? offsetToLoad,
          total: json.pagination?.total ?? offsetToLoad + normalized.length,
        };
        startTransition(() => setPagination(nextPagination));
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
    [mergeSessions, pageSize, startTransition],
  );

  const fetchSearchPage = useCallback(
    async (cursor: string | null, append: boolean, silent = false) => {
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
            limit: pageSize,
            cursor: cursor ?? undefined,
            sort: 'created_at',
            order: 'desc',
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
        const normalized = json.data.map(normalizeSession);
        const nextPagination: SearchPagination = {
          limit: json.pagination?.limit ?? pageSize,
          cursor: cursor ?? null,
          next_cursor: json.pagination?.next_cursor ?? null,
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
    [mergeSessions, pageSize, searchQuery, startTransition],
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
      if (sessions.length >= pagination.total) return;

      const nextOffset = pagination.offset + pagination.limit;
      await fetchListPage(nextOffset, true, true);
      schedulePrefetchTick();
    }, prefetchDelayMs);
  }, [autoPrefetch, fetchListPage, pagination.limit, pagination.offset, pagination.total, prefetchDelayMs, sessions.length, stopPrefetch]);

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
    setPagination({ limit: pageSize, offset: 0, total: 0 });
    return fetchListPage(0, false);
  }, [fetchListPage, fetchSearchPage, pageSize, searchQuery, stopPrefetch, startTransition]);

  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore) return;
    stopPrefetch();

    if (modeRef.current === 'search') {
      if (!searchPage.next_cursor) return;
      return fetchSearchPage(searchPage.next_cursor, true);
    }

    if (sessions.length >= pagination.total) return;
    const nextOffset = pagination.offset + pagination.limit;
    return fetchListPage(nextOffset, true);
  }, [
    fetchListPage,
    fetchSearchPage,
    isLoading,
    isLoadingMore,
    pagination.limit,
    pagination.offset,
    pagination.total,
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

  useEffect(() => {
    if (searchQuery === lastQueryRef.current) return;
    lastQueryRef.current = searchQuery;
    void refreshSessions();
  }, [refreshSessions, searchQuery]);

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
    if (!pagination.total) return;
    if (sessions.length >= pagination.total) return;

    schedulePrefetchTick();
    return stopPrefetch;
  }, [
    autoPrefetch,
    isLoading,
    isLoadingMore,
    pagination.total,
    sessions.length,
    schedulePrefetchTick,
    stopPrefetch,
  ]);

  const hasMore =
    modeRef.current === 'search'
      ? Boolean(searchPage.next_cursor)
      : sessions.length < pagination.total;

  return {
    sessions,
    pagination,
    searchPage,
    hasMore,
    isLoading,
    isLoadingMore,
    isUpdating,
    isPending,
    error,
    refreshSessions,
    loadMore,
    updateSession,
  };
}
