import { proxyRequest } from '@/lib/server/apiProxy';

export const runtime = 'nodejs';

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = await request.text();
  return proxyRequest({
    method: 'POST',
    path: `/live-sessions/${params.id}/input`,
    body,
    requireApiKey: false,
    context: { route: 'live-sessions.input', session_id: params.id },
  });
}
