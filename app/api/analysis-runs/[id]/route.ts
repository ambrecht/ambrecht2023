import { proxyRequest } from '@/lib/server/apiProxy';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  return proxyRequest({
    method: 'GET',
    path: `/analysis-runs/${params.id}`,
    cache: 'no-store',
    requireApiKey: true,
    context: { route: 'analysis-runs.get', run_id: params.id },
  });
}
