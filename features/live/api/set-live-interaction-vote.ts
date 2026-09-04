import { z } from 'zod';

import { buildTypewriterApiUrl } from '@/lib/live/api';

export type SetLiveInteractionVoteInput = {
  interactionId: string;
  participantId: string;
  optionId: string;
};

export type SetLiveInteractionVoteResult = {
  interactionId: string;
  optionId: string;
  accepted: boolean;
};

export class LiveInteractionVoteError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string | null,
  ) {
    super(message);
    this.name = 'LiveInteractionVoteError';
  }
}

const SetLiveInteractionVoteResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    interactionId: z.string().min(1),
    optionId: z.string().min(1),
    accepted: z.boolean(),
  }),
});

function extractErrorCode(payload: unknown) {
  if (!payload || typeof payload !== 'object') return null;

  const record = payload as Record<string, unknown>;
  const candidates = [record.error, record.code, record.message];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.length > 0) {
      return candidate;
    }
  }

  return null;
}

export async function setLiveInteractionVote({
  interactionId,
  participantId,
  optionId,
}: SetLiveInteractionVoteInput): Promise<SetLiveInteractionVoteResult> {
  const response = await fetch(
    buildTypewriterApiUrl(`/live/interactions/${interactionId}/vote`),
    {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        participantId,
        optionId,
      }),
      cache: 'no-store',
    },
  );

  const json = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    throw new LiveInteractionVoteError(
      `Abstimmung fehlgeschlagen (${response.status}).`,
      response.status,
      extractErrorCode(json),
    );
  }

  return SetLiveInteractionVoteResponseSchema.parse(json).data;
}
