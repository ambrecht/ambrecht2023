import { z } from 'zod';

export type LiveEventType =
  | 'draft.updated'
  | 'line.committed'
  | 'session.ended';

export interface DraftUpdatedEvent {
  id: string;
  sessionId: string;
  sequence: number;
  type: 'draft.updated';
  text: string;
  createdAt: string;
}

export interface LineCommittedEvent {
  id: string;
  sessionId: string;
  sequence: number;
  type: 'line.committed';
  text: string;
  createdAt: string;
}

export interface SessionEndedEvent {
  id: string;
  sessionId: string;
  sequence: number;
  type: 'session.ended';
  text?: never;
  createdAt: string;
}

export type LiveEvent =
  | DraftUpdatedEvent
  | LineCommittedEvent
  | SessionEndedEvent;

export type AppendLiveEventRequest =
  | {
      type: 'draft.updated';
      text: string;
    }
  | {
      type: 'line.committed';
      text: string;
    }
  | {
      type: 'session.ended';
      text?: never;
    };

export interface CreateLiveSessionResponse {
  success: true;
  data: {
    sessionId: string;
    createdAt: string;
  };
}

export interface AppendLiveEventResponse {
  success: true;
  data: LiveEvent;
}

export interface LiveHistoryResponse {
  success: true;
  data: LiveEvent[];
}

export interface ApiErrorResponse {
  success: false;
  error:
    | 'invalid_session_id'
    | 'session_not_found'
    | 'session_ended'
    | 'unauthorized'
    | 'forbidden'
    | 'invalid_event'
    | 'invalid_query'
    | 'payload_too_large'
    | 'rate_limited'
    | 'backend_error'
    | 'internal_error';
  message: string;
  details?: unknown;
}

const liveEventBaseSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  sequence: z.number().int().positive(),
  createdAt: z.string().min(1),
});

export const DraftUpdatedEventSchema = liveEventBaseSchema.extend({
  type: z.literal('draft.updated'),
  text: z.string(),
});

export const LineCommittedEventSchema = liveEventBaseSchema.extend({
  type: z.literal('line.committed'),
  text: z.string(),
});

export const SessionEndedEventSchema = liveEventBaseSchema.extend({
  type: z.literal('session.ended'),
  text: z.never().optional(),
});

export const LiveEventSchema = z.discriminatedUnion('type', [
  DraftUpdatedEventSchema,
  LineCommittedEventSchema,
  SessionEndedEventSchema,
]);

export const AppendLiveEventRequestSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('draft.updated'),
    text: z.string().max(10_000),
  }),
  z.object({
    type: z.literal('line.committed'),
    text: z.string().max(10_000),
  }),
  z.object({
    type: z.literal('session.ended'),
    text: z.never().optional(),
  }),
]);

export const CreateLiveSessionResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    sessionId: z.string().uuid(),
    createdAt: z.string().min(1),
  }),
});

export const AppendLiveEventResponseSchema = z.object({
  success: z.literal(true),
  data: LiveEventSchema,
});

export const LiveHistoryResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(LiveEventSchema),
});

export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.enum([
    'invalid_session_id',
    'session_not_found',
    'session_ended',
    'unauthorized',
    'forbidden',
    'invalid_event',
    'invalid_query',
    'payload_too_large',
    'rate_limited',
    'backend_error',
    'internal_error',
  ]),
  message: z.string(),
  details: z.unknown().optional(),
});

export const EmptyObjectSchema = z.object({}).strict();

export const LiveSessionIdSchema = z.string().uuid();

export type LiveLine = {
  id: string;
  text: string;
  sequence: number;
  createdAt: string;
};

export type LiveDraft = {
  text: string;
  sequence: number;
  createdAt: string;
};

export interface LiveDocumentState {
  committedLines: readonly LiveLine[];
  activeDraft: LiveDraft | null;
  lastSequence: number;
  ended: boolean;
}

export const initialLiveDocumentState: LiveDocumentState = {
  committedLines: [],
  activeDraft: null,
  lastSequence: 0,
  ended: false,
};

export function applyLiveEvent(
  state: LiveDocumentState,
  event: LiveEvent,
): LiveDocumentState {
  if (event.sequence <= state.lastSequence) {
    return state;
  }

  if (event.type === 'draft.updated') {
    return {
      ...state,
      activeDraft: {
        text: event.text,
        sequence: event.sequence,
        createdAt: event.createdAt,
      },
      lastSequence: event.sequence,
    };
  }

  if (event.type === 'line.committed') {
    return {
      ...state,
      committedLines: [
        ...state.committedLines,
        {
          id: event.id,
          text: event.text,
          sequence: event.sequence,
          createdAt: event.createdAt,
        },
      ],
      activeDraft: null,
      lastSequence: event.sequence,
    };
  }

  return {
    ...state,
    ended: true,
    lastSequence: event.sequence,
  };
}

export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return ApiErrorResponseSchema.safeParse(value).success;
}
