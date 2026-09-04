import { z } from 'zod';

export interface LiveLine {
  id: string;
  sequence: number;
  text: string;
  publishedAt: string;
  heartCount: number;
}

export type LiveInteractionKind =
  | 'pressure'
  | 'prediction'
  | 'belief'
  | 'decision';

export type LiveInteractionOption = {
  id: string;
  label: string;
};

export type LiveInteractionResult = {
  optionId: string;
  count: number;
};

export type LiveInteraction = {
  id: string;
  broadcastId: string;
  kind: LiveInteractionKind;
  question: string;
  options: LiveInteractionOption[];
  status: 'open' | 'closed';
  openedSequence: number;
  closedSequence: number | null;
  finalResults: LiveInteractionResult[] | null;
  openedAt: string | null;
  closedAt: string | null;
};

export type PublicLiveState =
  | {
      status: 'offline';
      nextLiveAt: string | null;
    }
  | {
      status: 'live';
      broadcastId: string;
      sequence: number;
      startedAt: string;
      viewerCount: number;
      lines: readonly LiveLine[];
      activeDraft: string;
      interactions: readonly LiveInteraction[];
      nextLiveAt: string | null;
    };

export type ConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

export type FollowMode = 'live' | 'history';

export const LiveLineSchema = z.object({
  id: z.string().min(1),
  sequence: z.number().int().nonnegative().default(0),
  text: z.string(),
  publishedAt: z.string().min(1),
  heartCount: z.number().int().nonnegative(),
});

export const LiveInteractionKindSchema = z.enum([
  'pressure',
  'prediction',
  'belief',
  'decision',
]);

export const LiveInteractionOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
});

export const LiveInteractionResultSchema = z.object({
  optionId: z.string().min(1),
  count: z.number().int().nonnegative(),
});

export const LiveInteractionSchema = z.object({
  id: z.string().min(1),
  broadcastId: z.string().min(1),
  kind: LiveInteractionKindSchema,
  question: z.string().min(1),
  options: z.array(LiveInteractionOptionSchema).min(1),
  status: z.enum(['open', 'closed']),
  openedSequence: z.number().int().nonnegative(),
  closedSequence: z.number().int().nonnegative().nullable(),
  finalResults: z.array(LiveInteractionResultSchema).nullable(),
  openedAt: z.string().min(1).nullable(),
  closedAt: z.string().min(1).nullable(),
});

export const OfflineSnapshotSchema = z.object({
  status: z.literal('offline'),
  nextLiveAt: z.string().min(1).nullable().default(null),
});

export const LiveSnapshotSchema = z.object({
  status: z.literal('live'),
  broadcastId: z.string().min(1),
  sequence: z.number().int().nonnegative(),
  startedAt: z.string().min(1),
  viewerCount: z.number().int().nonnegative(),
  lines: z.array(LiveLineSchema),
  activeDraft: z.string(),
  interactions: z.array(LiveInteractionSchema).default([]),
  nextLiveAt: z.string().min(1).nullable().default(null),
});

export const PublicLiveSnapshotSchema = z.discriminatedUnion('status', [
  OfflineSnapshotSchema,
  LiveSnapshotSchema,
]);

export const PublicLiveSnapshotResponseSchema = z.object({
  success: z.literal(true),
  data: PublicLiveSnapshotSchema,
});

export const LiveStartedEventSchema = LiveSnapshotSchema;

export const DraftUpdatedEventSchema = z.object({
  broadcastId: z.string().min(1),
  sequence: z.number().int().nonnegative(),
  text: z.string(),
});

export const LineCommittedEventSchema = z.object({
  broadcastId: z.string().min(1),
  sequence: z.number().int().nonnegative(),
  line: LiveLineSchema,
});

export const LiveEndedEventSchema = z.object({
  broadcastId: z.string().min(1),
  sequence: z.number().int().nonnegative(),
});

export const ViewerCountEventSchema = z.object({
  count: z.number().int().nonnegative(),
});

export const ReactionUpdatedEventSchema = z.object({
  broadcastId: z.string().min(1),
  lineId: z.string().min(1),
  reaction: z.literal('heart'),
  count: z.number().int().nonnegative(),
});

export const InteractionOpenedEventSchema = z.object({
  broadcastId: z.string().min(1),
  sequence: z.number().int().nonnegative(),
  interaction: z.object({
    id: z.string().min(1),
    kind: LiveInteractionKindSchema,
    question: z.string().min(1),
    options: z.array(LiveInteractionOptionSchema).min(1),
  }),
});

export const InteractionClosedEventSchema = z.object({
  broadcastId: z.string().min(1),
  sequence: z.number().int().nonnegative(),
  interactionId: z.string().min(1),
  results: z.array(LiveInteractionResultSchema),
  total: z.number().int().nonnegative(),
});

export const LiveScheduleUpdatedEventSchema = z.object({
  scheduledAt: z.string().min(1).nullable(),
});

export type ValidatedLiveEvent =
  | {
      type: 'live.snapshot';
      snapshot: PublicLiveState;
    }
  | {
      type: 'live.started';
      snapshot: Extract<PublicLiveState, { status: 'live' }>;
    }
  | {
      type: 'draft.updated';
      broadcastId: string;
      sequence: number;
      text: string;
    }
  | {
      type: 'line.committed';
      broadcastId: string;
      sequence: number;
      line: LiveLine;
    }
  | {
      type: 'live.ended';
      broadcastId: string;
      sequence: number;
    }
  | {
      type: 'viewer.count';
      count: number;
    }
  | {
      type: 'reaction.updated';
      broadcastId: string;
      lineId: string;
      reaction: 'heart';
      count: number;
    }
  | {
      type: 'interaction.opened';
      broadcastId: string;
      sequence: number;
      interaction: {
        id: string;
        kind: LiveInteractionKind;
        question: string;
        options: LiveInteractionOption[];
      };
    }
  | {
      type: 'interaction.closed';
      broadcastId: string;
      sequence: number;
      interactionId: string;
      results: LiveInteractionResult[];
      total: number;
    }
  | {
      type: 'live.schedule.updated';
      scheduledAt: string | null;
    };

export const parseNamedLiveEvent = (
  type: ValidatedLiveEvent['type'],
  data: string,
): ValidatedLiveEvent => {
  const payload = JSON.parse(data) as unknown;

  if (type === 'live.snapshot') {
    return {
      type,
      snapshot: PublicLiveSnapshotSchema.parse(payload),
    };
  }

  if (type === 'live.started') {
    return {
      type,
      snapshot: LiveStartedEventSchema.parse(payload),
    };
  }

  if (type === 'draft.updated') {
    return {
      type,
      ...DraftUpdatedEventSchema.parse(payload),
    };
  }

  if (type === 'line.committed') {
    return {
      type,
      ...LineCommittedEventSchema.parse(payload),
    };
  }

  if (type === 'live.ended') {
    return {
      type,
      ...LiveEndedEventSchema.parse(payload),
    };
  }

  if (type === 'viewer.count') {
    return {
      type,
      ...ViewerCountEventSchema.parse(payload),
    };
  }

  if (type === 'live.schedule.updated') {
    return {
      type,
      ...LiveScheduleUpdatedEventSchema.parse(payload),
    };
  }

  if (type === 'interaction.opened') {
    return {
      type,
      ...InteractionOpenedEventSchema.parse(payload),
    };
  }

  if (type === 'interaction.closed') {
    return {
      type,
      ...InteractionClosedEventSchema.parse(payload),
    };
  }

  return {
    type,
    ...ReactionUpdatedEventSchema.parse(payload),
  };
};
