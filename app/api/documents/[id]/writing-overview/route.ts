import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/server/apiProxy';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  return proxyRequest({
    method: 'GET',
    path: `/documents/${params.id}/writing-overview`,
    query: request.nextUrl.searchParams,
    cache: 'no-store',
    requireApiKey: true,
    context: { route: 'documents.writing-overview', document_id: params.id },
  });
}
