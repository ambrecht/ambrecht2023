import { proxyRequest } from '@/lib/server/apiProxy';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  return proxyRequest({
    method: 'GET',
    path: `/analyses/${params.id}/tools/adverbs`,
    cache: 'no-store',
    requireApiKey: true,
    context: { route: 'nlp.tools.adverbs', analysis_id: params.id },
  });
}
