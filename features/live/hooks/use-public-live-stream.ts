'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';

import {
  parseNamedLiveEvent,
  type ConnectionStatus,
  type PublicLiveState,
  type ValidatedLiveEvent,
} from '../lib/contract';
import { reduceLiveState } from '../lib/reducer';

type AppliedLiveEvent = {
  type: ValidatedLiveEvent['type'];
  key: string;
};

type StreamState = {
  broadcastState: PublicLiveState;
  connectionStatus: ConnectionStatus;
  error: string | null;
  lastAppliedEvent: AppliedLiveEvent | null;
};

type StreamAction =
  | {
      type: 'connection';
      status: ConnectionStatus;
      error?: string | null;
    }
  | {
      type: 'event';
      event: ValidatedLiveEvent;
    };

const eventKey = (event: ValidatedLiveEvent) => {
  if (event.type === 'live.snapshot') {
    const snapshot = event.snapshot;
    return snapshot.status === 'live'
      ? `${event.type}:${snapshot.broadcastId}:${snapshot.sequence}`
      : `${event.type}:offline:${snapshot.nextLiveAt ?? 'none'}`;
  }

  if (event.type === 'live.started') {
    return `${event.type}:${event.snapshot.broadcastId}:${event.snapshot.sequence}`;
  }

  if (event.type === 'viewer.count') {
    return `${event.type}:${event.count}`;
  }

  if (event.type === 'reaction.updated') {
    return `${event.type}:${event.broadcastId}:${event.lineId}:${event.count}`;
  }

  if (event.type === 'live.schedule.updated') {
    return `${event.type}:${event.scheduledAt ?? 'none'}`;
  }

  return `${event.type}:${event.broadcastId}:${event.sequence}`;
};

function streamReducer(state: StreamState, action: StreamAction): StreamState {
  if (action.type === 'connection') {
    return {
      ...state,
      connectionStatus: action.status,
      error: action.error ?? null,
    };
  }

  const nextBroadcastState = reduceLiveState(state.broadcastState, action.event);
  if (nextBroadcastState === state.broadcastState) {
    return state;
  }

  return {
    ...state,
    broadcastState: nextBroadcastState,
    error: null,
    lastAppliedEvent: {
      type: action.event.type,
      key: eventKey(action.event),
    },
  };
}

export function usePublicLiveStream({
  initialState,
  initialConnectionStatus,
  initialError,
  streamUrl,
}: {
  initialState: PublicLiveState;
  initialConnectionStatus: ConnectionStatus;
  initialError: string | null;
  streamUrl: string;
}) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const initialRef = useRef({
    initialState,
    initialConnectionStatus,
    initialError,
  });

  const [state, dispatch] = useReducer(streamReducer, undefined, () => ({
    broadcastState: initialRef.current.initialState,
    connectionStatus: initialRef.current.initialConnectionStatus,
    error: initialRef.current.initialError,
    lastAppliedEvent: null,
  }));

  const applyLiveEvent = useCallback((event: ValidatedLiveEvent) => {
    dispatch({ type: 'event', event });
  }, []);

  useEffect(() => {
    let disposed = false;
    const source = new EventSource(streamUrl);
    eventSourceRef.current = source;

    dispatch({ type: 'connection', status: 'connecting' });

    source.onopen = () => {
      if (!disposed) {
        dispatch({ type: 'connection', status: 'connected' });
      }
    };

    const registerNamedEvent = (eventType: ValidatedLiveEvent['type']) => {
      source.addEventListener(eventType, (event) => {
        if (disposed || !(event instanceof MessageEvent)) return;

        try {
          dispatch({
            type: 'event',
            event: parseNamedLiveEvent(eventType, event.data),
          });
        } catch (error) {
          dispatch({
            type: 'connection',
            status: 'error',
            error:
              error instanceof Error
                ? error.message
                : 'Live-Event konnte nicht validiert werden.',
          });
        }
      });
    };

    registerNamedEvent('live.snapshot');
    registerNamedEvent('live.started');
    registerNamedEvent('draft.updated');
    registerNamedEvent('line.committed');
    registerNamedEvent('live.ended');
    registerNamedEvent('live.schedule.updated');
    registerNamedEvent('viewer.count');
    registerNamedEvent('reaction.updated');
    registerNamedEvent('interaction.opened');
    registerNamedEvent('interaction.closed');

    source.onerror = () => {
      if (disposed) return;

      dispatch({
        type: 'connection',
        status:
          source.readyState === EventSource.CLOSED ? 'error' : 'reconnecting',
        error:
          source.readyState === EventSource.CLOSED
            ? 'Live-Stream wurde geschlossen.'
            : null,
      });
    };

    return () => {
      disposed = true;
      source.close();
      eventSourceRef.current = null;
    };
  }, [streamUrl]);

  return {
    ...state,
    applyLiveEvent,
  };
}
