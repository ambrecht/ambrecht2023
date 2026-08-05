import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/server/apiProxy';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  return proxyRequest({
    method: 'GET',
    path: '/sessions/writing-overview',
    query: request.nextUrl.searchParams,
    cache: 'no-store',
    requireApiKey: true,
    context: { route: 'sessions.writing-overview' },
  });
}
