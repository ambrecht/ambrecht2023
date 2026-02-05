import { NextRequest, NextResponse } from 'next/server';
import { typewriterFetch } from '@/lib/server/typewriter';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const qs = request.nextUrl.searchParams.toString();
  const path = `/api/v1/analysis-runs/${params.id}/findings${qs ? `?${qs}` : ''}`;
  const upstream = await typewriterFetch(path, { method: 'GET' });

  const data = await upstream.json().catch(() => null);
  return NextResponse.json(data ?? null, { status: upstream.status });
}
