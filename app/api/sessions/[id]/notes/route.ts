import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const EXTERNAL_API_BASE_URL =
  process.env.EXTERNAL_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://api.ambrecht.de/api/v1';

const API_KEY = process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY || '';

const buildUpstreamUrl = (sessionId: string, searchParams?: URLSearchParams) => {
  const qs = searchParams?.toString() ?? '';
  const base = EXTERNAL_API_BASE_URL.replace(/\/$/, '');
  return `${base}/sessions/${sessionId}/notes${qs ? `?${qs}` : ''}`;
};

const missingApiKey = () =>
  NextResponse.json(
    { success: false, error: 'missing_api_key', message: 'API key fehlt.' },
    { status: 500 },
  );

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!API_KEY) return missingApiKey();

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

  const upstreamUrl = buildUpstreamUrl(params.id, request.nextUrl.searchParams);

  try {
    const upstream = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      cache: 'no-store',
    });

    const headers = new Headers(upstream.headers);
    headers.delete('set-cookie');

    const buffer = await upstream.arrayBuffer();
    return new Response(buffer, {
      status: upstream.status,
      headers,
    });
  } catch (err) {
    console.error('sessions.notes proxy error', {
      session_id: params.id,
      upstream_url: upstreamUrl,
      error: err instanceof Error ? err.message : String(err),
    });
    const message =
      err instanceof Error
        ? err.message
        : 'Unerwarteter Fehler beim Weiterleiten der Anfrage.';
    return NextResponse.json(
      { success: false, error: 'internal_error', message },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  if (!API_KEY) return missingApiKey();

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

  const upstreamUrl = buildUpstreamUrl(params.id);

  try {
    const upstream = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({
        start_offset: startOffset,
        end_offset: endOffset,
        note,
      }),
    });

    const headers = new Headers(upstream.headers);
    headers.delete('set-cookie');

    const buffer = await upstream.arrayBuffer();
    return new Response(buffer, {
      status: upstream.status,
      headers,
    });
  } catch (err) {
    console.error('sessions.notes proxy error', {
      session_id: params.id,
      upstream_url: upstreamUrl,
      error: err instanceof Error ? err.message : String(err),
    });
    const message =
      err instanceof Error
        ? err.message
        : 'Unerwarteter Fehler beim Weiterleiten der Anfrage.';
    return NextResponse.json(
      { success: false, error: 'internal_error', message },
      { status: 500 },
    );
  }
}
