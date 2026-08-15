import {
  AppendLiveEventRequestSchema,
  AppendLiveEventResponseSchema,
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
    const body = await parseJsonRequest(request, AppendLiveEventRequestSchema);

    return postLiveBackend(
      `/live-sessions/${sessionId}/events`,
      body,
      AppendLiveEventResponseSchema,
    );
  } catch (error) {
    return liveRouteErrorResponse(error);
  }
}
