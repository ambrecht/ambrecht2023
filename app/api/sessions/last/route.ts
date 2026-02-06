import { proxyRequest } from '@/lib/server/apiProxy';

export const runtime = 'nodejs';

export async function GET() {
  return proxyRequest({
    method: 'GET',
    path: '/sessions/last',
    cache: 'no-store',
    requireApiKey: true,
    context: { route: 'sessions.last' },
  });
}
