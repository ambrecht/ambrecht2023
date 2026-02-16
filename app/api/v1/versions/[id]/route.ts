import { proxyRequest } from '@/lib/server/apiProxy';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  return proxyRequest({
    method: 'GET',
    path: `/versions/${params.id}`,
    cache: 'no-store',
    requireApiKey: true,
    context: { route: 'nlp.versions.get', version_id: params.id },
  });
}
