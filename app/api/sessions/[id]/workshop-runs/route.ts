import { proxyRequest } from '@/lib/server/apiProxy';

export const runtime = 'nodejs';

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = await request.text();
  return proxyRequest({
    method: 'POST',
    path: `/sessions/${params.id}/workshop-runs`,
    body,
    requireApiKey: true,
    context: { route: 'sessions.workshop-runs.create', session_id: params.id },
  });
}
