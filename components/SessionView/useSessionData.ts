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

const normalizeSession = (entry: SessionPayload): Session => {
  const preview = entry.preview ?? entry.text_preview ?? entry.text ?? '';
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
          buildApiUrl('/sessions', {
            page_size: pageSize,
            page_token: pageToken ?? undefined,
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
        const nextPagination: SessionPagination = {
          ...json.pagination,
          page_size: json.pagination?.page_size ?? json.pagination?.limit ?? pageSize,
          has_more: json.pagination?.has_more ?? Boolean(json.pagination?.next_page_token),
          next_page_token: json.pagination?.next_page_token ?? null,
          total: json.pagination?.total,
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
      if (!pagination.has_more || !pagination.next_page_token) return;

      await fetchListPage(pagination.next_page_token, true, true);
      schedulePrefetchTick();
    }, prefetchDelayMs);
  }, [autoPrefetch, fetchListPage, pagination.has_more, pagination.next_page_token, prefetchDelayMs, stopPrefetch]);

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
    setPagination({ page_size: pageSize, has_more: false, next_page_token: null });
    return fetchListPage(null, false);
  }, [fetchListPage, fetchSearchPage, pageSize, searchQuery, stopPrefetch, startTransition]);

  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore) return;
    stopPrefetch();

    if (modeRef.current === 'search') {
      if (!searchPage.next_cursor) return;
      return fetchSearchPage(searchPage.next_cursor, true);
    }

    if (!pagination.has_more || !pagination.next_page_token) return;
    return fetchListPage(pagination.next_page_token, true);
  }, [
    fetchListPage,
    fetchSearchPage,
    isLoading,
    isLoadingMore,
    pagination.has_more,
    pagination.next_page_token,
    searchPage.next_cursor,
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
    if (!pagination.has_more || !pagination.next_page_token) return;

    schedulePrefetchTick();
    return stopPrefetch;
  }, [
    autoPrefetch,
    isLoading,
    isLoadingMore,
    pagination.has_more,
    pagination.next_page_token,
    schedulePrefetchTick,
    stopPrefetch,
  ]);

  const hasMore =
    modeRef.current === 'search'
      ? Boolean(searchPage.next_cursor)
      : Boolean(pagination.has_more && pagination.next_page_token);

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
