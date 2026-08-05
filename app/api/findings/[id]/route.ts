import { proxyRequest } from '@/lib/server/apiProxy';

export const runtime = 'nodejs';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = await request.text();
  return proxyRequest({
    method: 'PATCH',
    path: `/findings/${params.id}`,
    body,
    requireApiKey: true,
    context: { route: 'findings.update', finding_id: params.id },
  });
}
