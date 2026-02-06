import { proxyRequest } from '@/lib/server/apiProxy';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.text();

  return proxyRequest({
    method: 'POST',
    path: '/live-sessions',
    body,
    requireApiKey: false,
    context: { route: 'live-sessions.create' },
  });
}
