import { NextRequest, NextResponse } from 'next/server';

const EXTERNAL_API_BASE_URL =
  process.env.EXTERNAL_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://api.ambrecht.de/api/v1';

const API_KEY = process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY || '';

const buildExternalUrl = (searchParams: URLSearchParams) => {
  const qs = searchParams.toString();
  const base = EXTERNAL_API_BASE_URL.replace(/\/$/, '');
  return `${base}/sessions/search_page${qs ? `?${qs}` : ''}`;
};

export async function GET(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { success: false, error: 'missing_api_key' },
      { status: 500 },
    );
  }

  const targetUrl = buildExternalUrl(request.nextUrl.searchParams);

  const response = await fetch(targetUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    cache: 'no-store',
  });

  const data = await response.json().catch(() => null);

  return NextResponse.json(data ?? null, { status: response.status });
}
