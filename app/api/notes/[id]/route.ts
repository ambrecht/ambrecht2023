import { NextResponse } from 'next/server';
import { typewriterFetch } from '@/lib/server/typewriter';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = await request.text();
  const upstream = await typewriterFetch(`/api/v1/notes/${params.id}`, {
    method: 'PATCH',
    body,
  });

  const data = await upstream.json().catch(() => null);
  return NextResponse.json(data ?? null, { status: upstream.status });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const upstream = await typewriterFetch(`/api/v1/notes/${params.id}`, {
    method: 'DELETE',
  });

  if (upstream.status === 204) {
    return new Response(null, { status: upstream.status });
  }

  const data = await upstream.json().catch(() => null);
  return NextResponse.json(data ?? null, { status: upstream.status });
}
