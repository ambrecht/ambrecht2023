'use client';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import type { SearchPagination, Session, SessionPagination } from './types';

const DEFAULT_API_BASE_URL = '/api/v1';
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, '');
const API_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
};
if (process.env.NEXT_PUBLIC_API_KEY) {
  API_HEADERS['x-api-key'] = process.env.NEXT_PUBLIC_API_KEY;
}

type SessionsResponse =
  | {
      success: true;
      data: Session[];
      pagination: SessionPagination;
    }
  | {
      success: false;
      error?: string;
      message?: string;
    };

type SearchPageResponse =
  | {
      success: true;
      data: Session[];
      pagination: SearchPagination;
    }
  | {
      success: false;
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
    page: 1,
    pageSize,
    total: 0,
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
        if (!response.ok || !json.success) {
          throw new Error(
            json.error || json.message || 'Sessions konnten nicht geladen werden.',
          );
        }
        const nextPagination: SessionPagination = {
          limit: json.pagination?.limit ?? pageSize,
          offset: json.pagination?.offset ?? offsetToLoad,
          total: json.pagination?.total ?? offsetToLoad + json.data.length,
        };
        startTransition(() => setPagination(nextPagination));
        mergeSessions(json.data, append);
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
    async (page: number, append: boolean, silent = false) => {
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
          buildApiUrl('/sessions/search_page', {
            q: searchQuery,
            page,
            pageSize,
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
        if (!response.ok || !json.success) {
          throw new Error(
            json.error || json.message || 'Sessions konnten nicht geladen werden.',
          );
        }
        const nextPagination: SearchPagination = {
          page: json.pagination?.page ?? page,
          pageSize: json.pagination?.pageSize ?? pageSize,
          total: json.pagination?.total ?? json.data.length,
        };
        startTransition(() => setSearchPage(nextPagination));
        mergeSessions(json.data, append);
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
      setSearchPage({ page: 1, pageSize, total: 0 });
      return fetchSearchPage(1, false);
    }

    modeRef.current = 'list';
    setPagination({ limit: pageSize, offset: 0, total: 0 });
    return fetchListPage(0, false);
  }, [fetchListPage, fetchSearchPage, pageSize, searchQuery, stopPrefetch, startTransition]);

  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore) return;
    stopPrefetch();

    if (modeRef.current === 'search') {
      if (sessions.length >= searchPage.total) return;
      const nextPage = searchPage.page + 1;
      return fetchSearchPage(nextPage, true);
    }

    if (sessions.length >= pagination.total) return;
    const nextOffset = pagination.offset + pagination.limit;
    return fetchListPage(nextOffset, true);
  }, [fetchListPage, fetchSearchPage, isLoading, isLoadingMore, pagination.limit, pagination.offset, pagination.total, searchPage.page, searchPage.total, sessions.length, stopPrefetch]);

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
        const json = (await res.json()) as { success: boolean; data?: Session; error?: string; message?: string };
        if (!res.ok || !json.success || !json.data) {
          throw new Error(json.error || json.message || 'Update fehlgeschlagen.');
        }
        const existing = byIdRef.current.get(id);
        const merged: Session = { ...(existing ?? {} as Session), ...json.data };
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
      ? sessions.length < searchPage.total
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
