import { EmptyObjectSchema, CreateLiveSessionResponseSchema } from '@/lib/live/types';
import {
  liveRouteErrorResponse,
  parseJsonRequest,
  postLiveBackend,
} from '@/lib/server/liveBackend';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    await parseJsonRequest(request, EmptyObjectSchema);
    return postLiveBackend(
      '/live-sessions',
      {},
      CreateLiveSessionResponseSchema,
      201,
    );
  } catch (error) {
    return liveRouteErrorResponse(error);
  }
}
