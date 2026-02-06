import { NextResponse } from 'next/server';

type ProxyContext = Record<string, unknown>;

type ProxyRequestOptions = {
  method: string;
  path: string;
  body?: string;
  query?: URLSearchParams;
  headers?: HeadersInit;
  cache?: RequestCache;
  requireApiKey?: boolean;
  context?: ProxyContext;
};

const RAW_BASE_URL =
  process.env.EXTERNAL_API_BASE_URL ||
  process.env.TYPEWRITER_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://api.ambrecht.de/api/v1';

const API_KEY =
  process.env.TYPEWRITER_API_KEY ||
  process.env.API_KEY ||
  process.env.NEXT_PUBLIC_API_KEY ||
  '';

const sanitizeHeaders = (headers: Headers) => {
  headers.delete('set-cookie');
  headers.delete('content-encoding');
  headers.delete('content-length');
  headers.delete('transfer-encoding');
  return headers;
};

const normalizePath = (path: string) => (path.startsWith('/') ? path : `/${path}`);

const buildUpstreamUrl = (path: string, query?: URLSearchParams) => {
  const base = RAW_BASE_URL.replace(/\/$/, '');
  let normalizedPath = normalizePath(path);

  if (normalizedPath.startsWith('/api/v1/')) {
    if (base.endsWith('/api/v1')) {
      normalizedPath = normalizedPath.replace(/^\/api\/v1/, '');
    }
  } else if (!base.endsWith('/api/v1')) {
    normalizedPath = `/api/v1${normalizedPath}`;
  }

  const qs = query?.toString() ?? '';
  return `${base}${normalizedPath}${qs ? `?${qs}` : ''}`;
};

const missingApiKeyResponse = () =>
  NextResponse.json(
    { success: false, error: 'missing_api_key', message: 'API key fehlt.' },
    { status: 500 },
  );

const internalErrorResponse = (error: unknown, context: ProxyContext) => {
  const message =
    error instanceof Error
      ? error.message
      : 'Unerwarteter Fehler beim Weiterleiten der Anfrage.';
  console.error('proxy error', {
    ...context,
    error: error instanceof Error ? error.message : String(error),
  });
  return NextResponse.json(
    { success: false, error: 'internal_error', message },
    { status: 500 },
  );
};

export async function proxyRequest({
  method,
  path,
  body,
  query,
  headers,
  cache,
  requireApiKey = true,
  context = {},
}: ProxyRequestOptions): Promise<Response> {
  if (requireApiKey && !API_KEY) {
    return missingApiKeyResponse();
  }

  const upstreamUrl = buildUpstreamUrl(path, query);
  const requestHeaders = new Headers(headers);

  if (requireApiKey) {
    requestHeaders.set('x-api-key', API_KEY);
  }
  if (body && !requestHeaders.has('content-type')) {
    requestHeaders.set('content-type', 'application/json');
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      method,
      headers: requestHeaders,
      body,
      cache,
    });

    const responseHeaders = sanitizeHeaders(new Headers(upstream.headers));

    if (upstream.status === 204) {
      return new Response(null, { status: upstream.status, headers: responseHeaders });
    }

    const buffer = await upstream.arrayBuffer();
    return new Response(buffer, { status: upstream.status, headers: responseHeaders });
  } catch (error) {
    return internalErrorResponse(error, { ...context, upstream_url: upstreamUrl });
  }
}
