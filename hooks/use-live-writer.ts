'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  ApiErrorResponseSchema,
  AppendLiveEventResponseSchema,
  CreateLiveSessionResponseSchema,
  type ApiErrorResponse,
  type AppendLiveEventRequest,
} from '@/lib/live/types';

type LiveWriterStatus =
  | 'idle'
  | 'starting'
  | 'live'
  | 'ending'
  | 'ended'
  | 'error';

type LiveWriterError = {
  code: ApiErrorResponse['error'] | 'network_error' | 'invalid_payload';
  message: string;
  transient: boolean;
};

const DRAFT_FLUSH_MS = 80;

const toWriterError = async (response: Response): Promise<LiveWriterError> => {
  const text = await response.text();
  let json: unknown = null;
  try {
    json = text ? (JSON.parse(text) as unknown) : null;
  } catch {
    json = null;
  }

  const parsed = ApiErrorResponseSchema.safeParse(json);
  const code = parsed.success
    ? parsed.data.error
    : response.status >= 500
      ? 'backend_error'
      : 'internal_error';

  return {
    code,
    message: parsed.success
      ? parsed.data.message
      : 'Live-Writer-Anfrage fehlgeschlagen.',
    transient:
      code === 'backend_error' ||
      code === 'rate_limited' ||
      response.status >= 500,
  };
};

const parseSuccessJson = async <T,>(response: Response, schema: { parse: (value: unknown) => T }) => {
  const json = (await response.json()) as unknown;
  return schema.parse(json);
};

export function useLiveWriter() {
  const [status, setStatus] = useState<LiveWriterStatus>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<LiveWriterError | null>(null);

  const sessionIdRef = useRef<string | null>(null);
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDraftRef = useRef<string | null>(null);
  const lastSentDraftRef = useRef<string | null>(null);
  const acceptingWritesRef = useRef(false);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  const clearDraftTimer = useCallback(() => {
    if (draftTimerRef.current) {
      clearTimeout(draftTimerRef.current);
      draftTimerRef.current = null;
    }
  }, []);

  const enqueue = useCallback((operation: () => Promise<void>) => {
    const run = queueRef.current.then(operation, operation);
    queueRef.current = run.catch(() => undefined);
    return run;
  }, []);

  const appendEvent = useCallback(async (event: AppendLiveEventRequest) => {
    const activeSessionId = sessionIdRef.current;
    if (!activeSessionId) return;

    let response: Response;
    try {
      response = await fetch(`/api/live/${activeSessionId}/events`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch {
      const networkError: LiveWriterError = {
        code: 'network_error',
        message: 'Live-Backend ist nicht erreichbar.',
        transient: true,
      };
      setError(networkError);
      setStatus('error');
      throw networkError;
    }

    if (!response.ok) {
      const writerError = await toWriterError(response);
      setError(writerError);
      setStatus(writerError.code === 'session_ended' ? 'ended' : 'error');
      throw writerError;
    }

    await parseSuccessJson(response, AppendLiveEventResponseSchema);
    setError(null);
    setStatus('live');
  }, []);

  const flushPendingDraft = useCallback(async () => {
    const draft = pendingDraftRef.current;
    pendingDraftRef.current = null;

    if (draft === null || draft === lastSentDraftRef.current) {
      return;
    }

    await appendEvent({ type: 'draft.updated', text: draft });
    lastSentDraftRef.current = draft;
  }, [appendEvent]);

  const start = useCallback(async () => {
    setStatus('starting');
    setError(null);

    const response = await fetch('/api/live/create', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const writerError = await toWriterError(response);
      setError(writerError);
      setStatus('error');
      throw writerError;
    }

    const parsed = await parseSuccessJson(response, CreateLiveSessionResponseSchema);
    acceptingWritesRef.current = true;
    sessionIdRef.current = parsed.data.sessionId;
    setSessionId(parsed.data.sessionId);
    setStatus('live');
    return parsed.data.sessionId;
  }, []);

  const updateDraft = useCallback(
    (text: string) => {
      if (!acceptingWritesRef.current || !sessionIdRef.current) return;

      pendingDraftRef.current = text;
      clearDraftTimer();
      draftTimerRef.current = setTimeout(() => {
        void enqueue(flushPendingDraft);
      }, DRAFT_FLUSH_MS);
    },
    [clearDraftTimer, enqueue, flushPendingDraft],
  );

  const commitLine = useCallback(
    async (text: string) => {
      if (!acceptingWritesRef.current || !sessionIdRef.current) return;

      clearDraftTimer();
      pendingDraftRef.current = null;
      await enqueue(async () => {
        await appendEvent({ type: 'line.committed', text });
        lastSentDraftRef.current = null;
      });
    },
    [appendEvent, clearDraftTimer, enqueue],
  );

  const end = useCallback(
    async (currentDraft?: string) => {
      if (!sessionIdRef.current || status === 'ended') return;

      acceptingWritesRef.current = false;
      clearDraftTimer();

      if (
        typeof currentDraft === 'string' &&
        currentDraft !== lastSentDraftRef.current
      ) {
        pendingDraftRef.current = currentDraft;
      }

      setStatus('ending');
      await enqueue(flushPendingDraft);
      await enqueue(async () => {
        const activeSessionId = sessionIdRef.current;
        if (!activeSessionId) return;

        const response = await fetch(`/api/live/${activeSessionId}/end`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          const writerError = await toWriterError(response);
          setError(writerError);
          setStatus(writerError.code === 'session_ended' ? 'ended' : 'error');
          throw writerError;
        }

        await parseSuccessJson(response, AppendLiveEventResponseSchema);
        setStatus('ended');
        setError(null);
      });
    },
    [clearDraftTimer, enqueue, flushPendingDraft, status],
  );

  const getShareUrl = useCallback(() => {
    const activeSessionId = sessionIdRef.current;
    if (!activeSessionId || typeof window === 'undefined') return null;
    return `${window.location.origin}/live/${activeSessionId}`;
  }, []);

  useEffect(() => {
    return () => {
      clearDraftTimer();
    };
  }, [clearDraftTimer]);

  return {
    status,
    sessionId,
    error,
    start,
    updateDraft,
    commitLine,
    end,
    getShareUrl,
  };
}
