import { typewriterFetch } from '@/lib/server/typewriter';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.text();

  const upstream = await typewriterFetch('/api/v1/live-sessions', {
    method: 'POST',
    body,
  });

  const headers = new Headers(upstream.headers);
  headers.delete('set-cookie');

  return new Response(await upstream.arrayBuffer(), {
    status: upstream.status,
    headers,
  });
}
