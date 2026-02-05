import { NextResponse } from 'next/server';
import { typewriterFetch } from '@/lib/server/typewriter';

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = await request.text();
  const upstream = await typewriterFetch(`/api/v1/sessions/${params.id}/edits`, {
    method: 'POST',
    body,
  });

  const data = await upstream.json().catch(() => null);
  return NextResponse.json(data ?? null, { status: upstream.status });
}
