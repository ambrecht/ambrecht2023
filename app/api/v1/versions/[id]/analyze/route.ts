import { proxyRequest } from '@/lib/server/apiProxy';

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  return proxyRequest({
    target: 'writer',
    method: 'POST',
    path: `/versions/${params.id}/analyze`,
    requireApiKey: true,
    context: { route: 'nlp.versions.analyze', version_id: params.id },
  });
}
