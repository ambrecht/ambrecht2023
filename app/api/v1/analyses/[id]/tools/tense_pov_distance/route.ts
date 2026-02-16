import { proxyRequest } from '@/lib/server/apiProxy';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  return proxyRequest({
    method: 'GET',
    path: `/analyses/${params.id}/tools/tense_pov_distance`,
    cache: 'no-store',
    requireApiKey: true,
    context: { route: 'nlp.tools.tense_pov_distance', analysis_id: params.id },
  });
}
