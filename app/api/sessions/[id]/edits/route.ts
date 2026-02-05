import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const EXTERNAL_API_BASE_URL =
  process.env.EXTERNAL_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://api.ambrecht.de/api/v1';

const API_KEY = process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY || '';

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const sessionId = params.id;
  const upstreamUrl = `${EXTERNAL_API_BASE_URL.replace(/\/$/, '')}/sessions/${sessionId}/edits`;

  if (!API_KEY) {
    return NextResponse.json(
      { success: false, error: 'missing_api_key', message: 'API key fehlt.' },
      { status: 500 },
    );
  }

  let payload: { text?: unknown } | null = null;
  try {
    payload = (await request.json()) as { text?: unknown };
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

  const text = typeof payload?.text === 'string' ? payload.text : '';
  if (!text || text.trim().length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: 'validation_error',
        message: 'text is required',
      },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({ text }),
    });

    const headers = new Headers(upstream.headers);
    headers.delete('set-cookie');

    const buffer = await upstream.arrayBuffer();
    return new Response(buffer, {
      status: upstream.status,
      headers,
    });
  } catch (err) {
    console.error('sessions.edits proxy error', {
      session_id: sessionId,
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
