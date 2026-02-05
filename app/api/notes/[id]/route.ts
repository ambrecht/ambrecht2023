import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const EXTERNAL_API_BASE_URL =
  process.env.EXTERNAL_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://api.ambrecht.de/api/v1';

const API_KEY = process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY || '';

const missingApiKey = () =>
  NextResponse.json(
    { success: false, error: 'missing_api_key', message: 'API key fehlt.' },
    { status: 500 },
  );

export async function PATCH(
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

  const upstreamUrl = `${EXTERNAL_API_BASE_URL.replace(/\/$/, '')}/notes/${params.id}`;

  try {
    const upstream = await fetch(upstreamUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify(payload ?? {}),
    });

    const headers = new Headers(upstream.headers);
    headers.delete('set-cookie');

    const buffer = await upstream.arrayBuffer();
    return new Response(buffer, {
      status: upstream.status,
      headers,
    });
  } catch (err) {
    console.error('notes.patch proxy error', {
      note_id: params.id,
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

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  if (!API_KEY) return missingApiKey();

  const upstreamUrl = `${EXTERNAL_API_BASE_URL.replace(/\/$/, '')}/notes/${params.id}`;

  try {
    const upstream = await fetch(upstreamUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
    });

    if (upstream.status === 204) {
      return new Response(null, { status: upstream.status });
    }

    const headers = new Headers(upstream.headers);
    headers.delete('set-cookie');

    const buffer = await upstream.arrayBuffer();
    return new Response(buffer, {
      status: upstream.status,
      headers,
    });
  } catch (err) {
    console.error('notes.delete proxy error', {
      note_id: params.id,
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
