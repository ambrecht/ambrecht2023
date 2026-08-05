import { proxyRequest } from '@/lib/server/apiProxy';

export const runtime = 'nodejs';

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = await request.text();
  return proxyRequest({
    method: 'POST',
    path: `/sessions/${params.id}/actions/remove-adverbs`,
    body,
    requireApiKey: true,
    context: { route: 'sessions.actions.remove-adverbs', session_id: params.id },
  });
}
