import { proxyRequest } from '@/lib/server/apiProxy';

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = await request.text();
  return proxyRequest({
    target: 'writer',
    method: 'POST',
    path: `/documents/${params.id}/versions`,
    body,
    requireApiKey: true,
    context: { route: 'nlp.documents.versions.create', document_id: params.id },
  });
}
