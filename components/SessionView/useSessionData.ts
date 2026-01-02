'use client';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import type { Session, SessionPagination } from './types';

const DEFAULT_API_BASE_URL = '/api';
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, '');
const API_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
};
if (process.env.NEXT_PUBLIC_API_KEY) {
  API_HEADERS['x-api-key'] = process.env.NEXT_PUBLIC_API_KEY;
}

type SessionsResponse = {
  success: boolean;
  data?: Session[];
  pagination?: SessionPagination;
  error?: string;
  message?: string;
};

type CreateSessionResponse = {
  success: boolean;
  data?: Session;
  error?: string;
  message?: string;
};

type UseSessionDataOptions = {
  pageSize?: number;
  prefetchDelayMs?: number;
  autoPrefetch?: boolean;
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

  const [sessions, setSessions] = useState<Session[]>([]);
  const [pagination, setPagination] = useState<SessionPagination>(() => ({
    limit: pageSize,
    offset: 0,
    total: 0,
  }));
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const abortRef = useRef<AbortController | null>(null);
  const prefetchTimerRef = useRef<number | null>(null);

  const byIdRef = useRef<Map<number, Session>>(new Map());
  const paginationRef = useRef<SessionPagination>({
    limit: pageSize,
    offset: 0,
    total: 0,
  });
  const sessionsCountRef = useRef(0);
  const autoPrefetchRef = useRef(autoPrefetch);
  const loadingRef = useRef(false);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  useEffect(() => {
    sessionsCountRef.current = sessions.length;
  }, [sessions.length]);

  useEffect(() => {
    autoPrefetchRef.current = autoPrefetch;
  }, [autoPrefetch]);

  const mergeSessions = useCallback(
    (incoming: Session[], append: boolean) => {
      if (!append) {
        byIdRef.current = new Map();
      }
      for (const session of incoming) {
        byIdRef.current.set(session.id, session);
      }
      const merged = Array.from(byIdRef.current.values());
      sessionsCountRef.current = merged.length;
      startTransition(() => {
        setSessions(merged);
      });
      return merged.length;
    },
    [startTransition],
  );

  const fetchPage = useCallback(
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
        const data = json.data;

        if (!response.ok || !json.success || !Array.isArray(data)) {
          throw new Error(
            json.message || json.error || 'Sessions konnten nicht geladen werden.',
          );
        }

        const nextPagination: SessionPagination = {
          limit: json.pagination?.limit ?? pageSize,
          offset: json.pagination?.offset ?? offsetToLoad,
          total: json.pagination?.total ?? offsetToLoad + data.length,
        };

        paginationRef.current = nextPagination;
        startTransition(() => {
          setPagination(nextPagination);
        });

        mergeSessions(data, append);
        return { ok: true as const, count: data.length, pagination: nextPagination };
      } catch (err) {
        if ((err as { name?: string }).name === 'AbortError') {
          return { ok: false as const, aborted: true as const };
        }
        const message =
          err instanceof Error
            ? err.message
            : 'Unbekannter Fehler beim Laden der Sessions.';
        if (!silent) {
          setError(message);
        }
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

    prefetchTimerRef.current = window.setTimeout(async () => {
      if (!autoPrefetchRef.current) return;
      if (loadingRef.current || loadingMoreRef.current) {
        schedulePrefetchTick();
        return;
      }
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        schedulePrefetchTick();
        return;
      }
      const total = paginationRef.current.total;
      const loaded = sessionsCountRef.current;
      if (!total || loaded >= total) return;

      const nextOffset =
        paginationRef.current.offset + paginationRef.current.limit;
      await fetchPage(nextOffset, true, true);
      schedulePrefetchTick();
    }, prefetchDelayMs);
  }, [fetchPage, prefetchDelayMs, stopPrefetch]);

  const startPrefetchAll = useCallback(() => {
    if (!autoPrefetchRef.current) return;
    const total = paginationRef.current.total;
    if (!total) return;
    if (sessionsCountRef.current >= total) return;
    schedulePrefetchTick();
  }, [schedulePrefetchTick]);

  const refreshSessions = useCallback(async () => {
    stopPrefetch();
    byIdRef.current = new Map();
    sessionsCountRef.current = 0;

    const freshPagination = { limit: pageSize, offset: 0, total: 0 };
    paginationRef.current = freshPagination;

    setSessions([]);
    setPagination(freshPagination);
    return fetchPage(0, false);
  }, [fetchPage, pageSize, stopPrefetch]);

  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore) return;
    const total = paginationRef.current.total;
    if (total && sessionsCountRef.current >= total) return;
    stopPrefetch();
    const nextOffset =
      paginationRef.current.offset + paginationRef.current.limit;
    return fetchPage(nextOffset, true);
  }, [fetchPage, isLoading, isLoadingMore, stopPrefetch]);

  const createSession = useCallback(
    async (text: string) => {
      const payload = text.trim();

      if (!payload) {
        setError('Text darf nicht leer sein.');
        return { success: false as const };
      }

      setIsCreating(true);
      setError(null);

      try {
        const response = await fetch(buildApiUrl('/sessions'), {
          method: 'POST',
          headers: API_HEADERS,
          body: JSON.stringify({ text: payload }),
        });

        const json = (await response.json()) as CreateSessionResponse;

        if (!response.ok || !json.success || !json.data) {
          throw new Error(
            json.message || json.error || 'Session konnte nicht angelegt werden.',
          );
        }

        const createdSession = json.data;
        const nextMap = new Map<number, Session>();
        nextMap.set(createdSession.id, createdSession);
        byIdRef.current.forEach((value, key) => {
          if (key !== createdSession.id) {
            nextMap.set(key, value);
          }
        });
        byIdRef.current = nextMap;

        const merged = Array.from(nextMap.values());
        sessionsCountRef.current = merged.length;
        startTransition(() => {
          setSessions(merged);
        });

        setPagination((prev) => {
          const next = {
            limit: prev.limit ?? pageSize,
            offset: prev.offset ?? 0,
            total: (prev.total ?? 0) + 1,
          };
          paginationRef.current = next;
          return next;
        });

        return { success: true as const, session: createdSession };
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unbekannter Fehler beim Anlegen der Session.';
        setError(message);
        return { success: false as const, error: message };
      } finally {
        setIsCreating(false);
      }
    },
    [pageSize, startTransition],
  );

  const ensureAllLoaded = useCallback(async () => {
    stopPrefetch();
    while (true) {
      const total = paginationRef.current.total;
      const loaded = sessionsCountRef.current;
      if (!total || loaded >= total) break;
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        break;
      }
      const nextOffset =
        paginationRef.current.offset + paginationRef.current.limit;
      const result = await fetchPage(nextOffset, true, true);
      if (!result.ok) break;
    }
  }, [fetchPage, stopPrefetch]);

  useEffect(() => {
    void refreshSessions();
  }, [refreshSessions]);

  useEffect(() => {
    if (!autoPrefetch) {
      stopPrefetch();
      return;
    }
    if (isLoading || isLoadingMore) return;
    if (!pagination.total) return;
    if (sessions.length >= pagination.total) return;

    startPrefetchAll();
    return stopPrefetch;
  }, [
    autoPrefetch,
    isLoading,
    isLoadingMore,
    pagination.total,
    sessions.length,
    startPrefetchAll,
    stopPrefetch,
  ]);

  const hasMore =
    pagination.total > 0 ? sessions.length < pagination.total : false;

  return {
    sessions,
    pagination,
    hasMore,
    isLoading,
    isLoadingMore,
    isCreating,
    isPending,
    error,
    refreshSessions,
    loadMore,
    startPrefetchAll,
    stopPrefetch,
    ensureAllLoaded,
    createSession,
  };
}
