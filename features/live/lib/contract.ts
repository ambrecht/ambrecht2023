import { z } from 'zod';

export interface LiveLine {
  id: string;
  text: string;
  publishedAt: string;
  heartCount: number;
}

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
  text: z.string(),
  publishedAt: z.string().min(1),
  heartCount: z.number().int().nonnegative(),
});

export const OfflineSnapshotSchema = z.object({
  status: z.literal('offline'),
  nextLiveAt: z.string().min(1).nullable(),
});

export const LiveSnapshotSchema = z.object({
  status: z.literal('live'),
  broadcastId: z.string().min(1),
  sequence: z.number().int().nonnegative(),
  startedAt: z.string().min(1),
  viewerCount: z.number().int().nonnegative(),
  lines: z.array(LiveLineSchema),
  activeDraft: z.string(),
  nextLiveAt: z.string().min(1).nullable(),
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

  return {
    type,
    ...ReactionUpdatedEventSchema.parse(payload),
  };
};
