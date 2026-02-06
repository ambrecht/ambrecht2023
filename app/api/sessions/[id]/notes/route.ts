import { NextRequest, NextResponse } from 'next/server';
import { proxyRequest } from '@/lib/server/apiProxy';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const start = request.nextUrl.searchParams.get('start');
  const end = request.nextUrl.searchParams.get('end');
  if (start === null || end === null) {
    return NextResponse.json(
      {
        success: false,
        error: 'validation_error',
        message: 'start and end are required',
      },
      { status: 400 },
    );
  }

  return proxyRequest({
    method: 'GET',
    path: `/sessions/${params.id}/notes`,
    query: request.nextUrl.searchParams,
    cache: 'no-store',
    requireApiKey: true,
    context: { route: 'sessions.notes.list', session_id: params.id },
  });
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  let payload:
    | { start_offset?: unknown; end_offset?: unknown; note?: unknown }
    | null = null;
  try {
    payload = (await request.json()) as {
      start_offset?: unknown;
      end_offset?: unknown;
      note?: unknown;
    };
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'validation_error',
        message: 'Invalid JSON body.',
      },
      { status: 400 },
    );
  }

  const note =
    typeof payload?.note === 'string' ? payload.note.trim() : '';
  const startOffset =
    typeof payload?.start_offset === 'number' ? payload.start_offset : NaN;
  const endOffset =
    typeof payload?.end_offset === 'number' ? payload.end_offset : NaN;

  if (!note || !Number.isFinite(startOffset) || !Number.isFinite(endOffset)) {
    return NextResponse.json(
      {
        success: false,
        error: 'validation_error',
        message: 'start_offset, end_offset, and note are required',
      },
      { status: 400 },
    );
  }

  return proxyRequest({
    method: 'POST',
    path: `/sessions/${params.id}/notes`,
    body: JSON.stringify({
      start_offset: startOffset,
      end_offset: endOffset,
      note,
    }),
    requireApiKey: true,
    context: { route: 'sessions.notes.create', session_id: params.id },
  });
}
