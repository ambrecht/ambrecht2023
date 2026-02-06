import { proxyRequest } from '@/lib/server/apiProxy';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  return proxyRequest({
    method: 'GET',
    path: `/documents/${params.id}`,
    cache: 'no-store',
    requireApiKey: true,
    context: { route: 'documents.get', document_id: params.id },
  });
}
