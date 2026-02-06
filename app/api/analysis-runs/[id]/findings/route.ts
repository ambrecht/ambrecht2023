import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/server/apiProxy';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  return proxyRequest({
    method: 'GET',
    path: `/analysis-runs/${params.id}/findings`,
    query: request.nextUrl.searchParams,
    cache: 'no-store',
    requireApiKey: true,
    context: { route: 'analysis-runs.findings', run_id: params.id },
  });
}
