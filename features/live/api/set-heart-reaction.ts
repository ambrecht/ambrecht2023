import { z } from 'zod';

import { buildTypewriterApiUrl } from '@/lib/live/api';

export type SetHeartReactionInput = {
  broadcastId: string;
  lineId: string;
  viewerId: string;
  active: boolean;
};

export type SetHeartReactionResult = {
  broadcastId: string;
  lineId: string;
  reaction: 'heart';
  active: boolean;
  count: number;
};

const SetHeartReactionResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    broadcastId: z.string().min(1),
    lineId: z.string().min(1),
    reaction: z.literal('heart'),
    active: z.boolean(),
    count: z.number().int().nonnegative(),
  }),
});

export async function setHeartReaction({
  broadcastId,
  lineId,
  viewerId,
  active,
}: SetHeartReactionInput): Promise<SetHeartReactionResult> {
  const response = await fetch(
    buildTypewriterApiUrl('/live/reactions/heart'),
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        broadcastId,
        lineId,
        viewerId,
        active,
      }),
      cache: 'no-store',
    },
  );

  const json = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    throw new Error(`Heart-Reaktion fehlgeschlagen (${response.status}).`);
  }

  return SetHeartReactionResponseSchema.parse(json).data;
}
