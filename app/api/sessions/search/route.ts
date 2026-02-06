import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/server/apiProxy';

export async function GET(request: NextRequest) {
  return proxyRequest({
    method: 'GET',
    path: '/sessions/search',
    query: request.nextUrl.searchParams,
    cache: 'no-store',
    requireApiKey: true,
    context: { route: 'sessions.search' },
  });
}
