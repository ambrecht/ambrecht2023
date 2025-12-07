'use client';
import { useState, useEffect, useCallback } from 'react';
import type { Session, SessionPagination } from './types';

// Default: interner Proxy (/api/sessions) vermeidet CORS im Browser.
const DEFAULT_API_BASE_URL = '/api';
const API_BASE_URL = DEFAULT_API_BASE_URL.replace(/\/$/, '');
const API_HEADERS = {
  'Content-Type': 'application/json',
  'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
};
const DEFAULT_LIMIT = 20;

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

const buildApiUrl = (
  path: string,
  query?: Record<string, string | number>,
) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const queryString =
    query && Object.keys(query).length > 0
      ? `?${new URLSearchParams(
          Object.entries(query).map(([key, value]) => [key, String(value)]),
        ).toString()}`
      : '';
  return `${API_BASE_URL}${normalizedPath}${queryString}`;
};

export function useSessionData(limit = DEFAULT_LIMIT) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [pagination, setPagination] = useState<SessionPagination>({
    limit,
    offset: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(
    async (offsetToLoad = 0, append = false) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const response = await fetch(
          buildApiUrl('/sessions', {
            limit,
            offset: offsetToLoad,
          }),
          {
            method: 'GET',
            headers: API_HEADERS,
            cache: 'no-store',
          },
        );

        const json = (await response.json()) as SessionsResponse;
        const data = json.data;

        if (!response.ok || !json.success || !Array.isArray(data)) {
          throw new Error(
            json.message || json.error || 'Sessions konnten nicht geladen werden.',
          );
        }

        setSessions((prev) => (append ? [...prev, ...data] : data));

        const fallbackTotal = append
          ? offsetToLoad + data.length
          : data.length;

        setPagination({
          limit: json.pagination?.limit ?? limit,
          offset: json.pagination?.offset ?? offsetToLoad,
          total: json.pagination?.total ?? fallbackTotal,
        });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unbekannter Fehler beim Laden der Sessions.';
        setError(message);
      } finally {
        if (append) {
          setIsLoadingMore(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [limit],
  );

  const refreshSessions = useCallback(
    () => fetchSessions(0, false),
    [fetchSessions],
  );

  const loadMore = useCallback(() => {
    const nextOffset = pagination.offset + pagination.limit;
    if (isLoadingMore || isLoading) return;
    return fetchSessions(nextOffset, true);
  }, [
    fetchSessions,
    isLoading,
    isLoadingMore,
    pagination.limit,
    pagination.offset,
  ]);

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

        setSessions((prev) => [createdSession, ...prev]);
        setPagination((prev) => ({
          limit: prev.limit ?? limit,
          offset: 0,
          total: (prev.total ?? 0) + 1,
        }));

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
    [limit],
  );

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const hasMore =
    pagination.total > 0
      ? pagination.offset + pagination.limit < pagination.total
      : false;

  return {
    sessions,
    pagination,
    isLoading,
    isLoadingMore,
    isCreating,
    error,
    refreshSessions,
    loadMore,
    hasMore,
    createSession,
  };
}
