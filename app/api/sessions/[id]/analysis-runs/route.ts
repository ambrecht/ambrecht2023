import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/server/apiProxy';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  return proxyRequest({
    method: 'GET',
    path: `/sessions/${params.id}/analysis-runs`,
    query: request.nextUrl.searchParams,
    cache: 'no-store',
    requireApiKey: true,
    context: { route: 'analysis-runs.list', session_id: params.id },
  });
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = await request.text();
  return proxyRequest({
    method: 'POST',
    path: `/sessions/${params.id}/analysis-runs`,
    body,
    requireApiKey: true,
    context: { route: 'analysis-runs.create', session_id: params.id },
  });
}
