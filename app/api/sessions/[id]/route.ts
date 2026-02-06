import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/server/apiProxy';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await request.text();
  return proxyRequest({
    method: 'PATCH',
    path: `/sessions/${params.id}`,
    body,
    requireApiKey: true,
    context: { route: 'sessions.update', session_id: params.id },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  return proxyRequest({
    method: 'GET',
    path: `/sessions/${params.id}`,
    cache: 'no-store',
    requireApiKey: true,
    context: { route: 'sessions.get', session_id: params.id },
  });
}
