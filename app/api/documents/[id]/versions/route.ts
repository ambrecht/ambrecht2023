import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/server/apiProxy';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  return proxyRequest({
    method: 'GET',
    path: `/documents/${params.id}/versions`,
    query: request.nextUrl.searchParams,
    cache: 'no-store',
    requireApiKey: true,
    context: { route: 'documents.versions', document_id: params.id },
  });
}
