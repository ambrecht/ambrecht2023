import { proxyRequest } from '@/lib/server/apiProxy';

export const runtime = 'nodejs';

export async function GET(
  req: Request,
  ctx: { params: { id: string } },
) {
  const { id } = ctx.params;
  const url = new URL(req.url);

  return proxyRequest({
    method: 'GET',
    path: `/live-sessions/${id}/history`,
    query: url.searchParams,
    cache: 'no-store',
    requireApiKey: false,
    context: { route: 'live-sessions.history', session_id: id },
  });
}
