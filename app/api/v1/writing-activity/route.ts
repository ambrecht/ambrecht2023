import { NextRequest } from 'next/server';

import { proxyRequest } from '@/lib/server/apiProxy';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  return proxyRequest({
    method: 'GET',
    path: '/writing-activity',
    query: request.nextUrl.searchParams,
    cache: 'no-store',
    requireApiKey: true,
    target: 'typewriter',
    timeoutMs: 8000,
    context: { route: 'writing-activity' },
  });
}
