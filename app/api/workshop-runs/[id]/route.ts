import { proxyRequest } from '@/lib/server/apiProxy';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  return proxyRequest({
    method: 'GET',
    path: `/workshop-runs/${params.id}`,
    cache: 'no-store',
    requireApiKey: true,
    context: { route: 'workshop-runs.get', run_id: params.id },
  });
}
