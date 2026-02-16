import { proxyRequest } from '@/lib/server/apiProxy';

export async function POST(request: Request) {
  const body = await request.text();
  return proxyRequest({
    method: 'POST',
    path: '/documents',
    body,
    requireApiKey: true,
    context: { route: 'nlp.documents.create' },
  });
}
