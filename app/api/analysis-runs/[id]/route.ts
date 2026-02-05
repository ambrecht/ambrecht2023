import { NextResponse } from 'next/server';
import { typewriterFetch } from '@/lib/server/typewriter';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const upstream = await typewriterFetch(`/api/v1/analysis-runs/${params.id}`, {
    method: 'GET',
  });

  const data = await upstream.json().catch(() => null);
  return NextResponse.json(data ?? null, { status: upstream.status });
}
