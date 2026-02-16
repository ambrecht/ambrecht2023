import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/server/apiProxy';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  return proxyRequest({
    method: 'GET',
    path: `/analyses/${params.id}/tools/kwic`,
    query: request.nextUrl.searchParams,
    cache: 'no-store',
    requireApiKey: true,
    context: { route: 'nlp.tools.kwic', analysis_id: params.id },
  });
}
