import { z } from 'zod';

import { AppendLiveEventResponseSchema, LiveSessionIdSchema } from '@/lib/live/types';
import {
  liveRouteErrorResponse,
  parseJsonRequest,
  postLiveBackend,
} from '@/lib/server/liveBackend';

export const runtime = 'nodejs';

const LegacyInputSchema = z.object({
  text: z.string().max(10_000),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const sessionId = LiveSessionIdSchema.parse(params.id);
    const body = await parseJsonRequest(request, LegacyInputSchema);

    return postLiveBackend(
      `/live-sessions/${sessionId}/input`,
      body,
      AppendLiveEventResponseSchema,
    );
  } catch (error) {
    return liveRouteErrorResponse(error);
  }
}
