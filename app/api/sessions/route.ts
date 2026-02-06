import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/server/apiProxy';

export async function GET(request: NextRequest) {
  return proxyRequest({
    method: 'GET',
    path: '/sessions',
    query: request.nextUrl.searchParams,
    cache: 'no-store',
    requireApiKey: true,
    context: { route: 'sessions.list' },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  return proxyRequest({
    method: 'POST',
    path: '/sessions',
    body,
    requireApiKey: true,
    context: { route: 'sessions.create' },
  });
}
