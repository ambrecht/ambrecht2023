import {
  AppendLiveEventResponseSchema,
  EmptyObjectSchema,
  LiveSessionIdSchema,
} from '@/lib/live/types';
import {
  liveRouteErrorResponse,
  parseJsonRequest,
  postLiveBackend,
} from '@/lib/server/liveBackend';

export const runtime = 'nodejs';

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } },
) {
  try {
    const sessionId = LiveSessionIdSchema.parse(params.sessionId);
    await parseJsonRequest(request, EmptyObjectSchema);

    return postLiveBackend(
      `/live-sessions/${sessionId}/end`,
      {},
      AppendLiveEventResponseSchema,
    );
  } catch (error) {
    return liveRouteErrorResponse(error);
  }
}
