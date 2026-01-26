import { typewriterFetch } from '@/lib/server/typewriter';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  ctx: { params: { id: string } },
) {
  const { id } = ctx.params;

  const upstream = await typewriterFetch(`/api/v1/live-sessions/${id}/history`, {
    method: 'GET',
  });

  const headers = new Headers(upstream.headers);
  headers.delete('set-cookie');

  return new Response(await upstream.arrayBuffer(), {
    status: upstream.status,
    headers,
  });
}
