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

export async function GET() {
  if (!API_KEY) return missingApiKey();

  const upstreamUrl = `${EXTERNAL_API_BASE_URL.replace(/\/$/, '')}/sessions/last`;

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
    console.error('sessions.last proxy error', {
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
