import { proxyRequest } from '@/lib/server/apiProxy';

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = await request.text();
  return proxyRequest({
    target: 'writer',
    method: 'POST',
    path: `/versions/${params.id}/actions/remove_adverbs`,
    body,
    requireApiKey: true,
    context: { route: 'nlp.actions.remove_adverbs', version_id: params.id },
  });
}
