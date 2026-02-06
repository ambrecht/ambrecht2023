import { proxyRequest } from '@/lib/server/apiProxy';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  ctx: { params: { id: string } },
) {
  const { id } = ctx.params;

  return proxyRequest({
    method: 'GET',
    path: `/live-sessions/${id}/history`,
    cache: 'no-store',
    requireApiKey: false,
    context: { route: 'live-sessions.history', session_id: id },
  });
}
