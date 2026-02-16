import { NextResponse } from 'next/server';

type ProxyContext = Record<string, unknown>;
type UpstreamTarget = 'typewriter' | 'writer';

type ProxyRequestOptions = {
  method: string;
  path: string;
  body?: string;
  query?: URLSearchParams;
  headers?: HeadersInit;
  cache?: RequestCache;
  requireApiKey?: boolean;
  target?: UpstreamTarget;
  context?: ProxyContext;
};

const TYPEWRITER_BASE_URL =
  process.env.EXTERNAL_API_BASE_URL ||
  process.env.TYPEWRITER_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://api.ambrecht.de';

const WRITER_BASE_URL =
  process.env.WRITER_MVP_API_BASE_URL ||
  process.env.WRITER_API_BASE_URL ||
  process.env.NEXT_PUBLIC_WRITER_API_BASE_URL ||
  'http://writer.ambrecht.de';

const TYPEWRITER_API_KEY =
  process.env.TYPEWRITER_API_KEY ||
  process.env.API_KEY ||
  process.env.NEXT_PUBLIC_API_KEY ||
  '';

const WRITER_API_KEY =
  process.env.WRITER_MVP_API_KEY ||
  process.env.WRITER_API_KEY ||
  process.env.NLP_API_KEY ||
  TYPEWRITER_API_KEY;

type UpstreamConfig = {
  apiKey: string;
  baseUrl: string;
  pathPrefix: '/api/v1' | '/v1';
};

const UPSTREAMS: Record<UpstreamTarget, UpstreamConfig> = {
  typewriter: {
    apiKey: TYPEWRITER_API_KEY,
    baseUrl: TYPEWRITER_BASE_URL,
    pathPrefix: '/api/v1',
  },
  writer: {
    apiKey: WRITER_API_KEY,
    baseUrl: WRITER_BASE_URL,
    pathPrefix: '/v1',
  },
};

const sanitizeHeaders = (headers: Headers) => {
  headers.delete('set-cookie');
  headers.delete('content-encoding');
  headers.delete('content-length');
  headers.delete('transfer-encoding');
  return headers;
};

const normalizePath = (path: string) => (path.startsWith('/') ? path : `/${path}`);

const stripKnownPrefix = (path: string) =>
  path
    .replace(/^\/api\/v1(?=\/|$)/, '')
    .replace(/^\/v1(?=\/|$)/, '');

const buildUpstreamUrl = (
  target: UpstreamTarget,
  path: string,
  query?: URLSearchParams,
) => {
  const { baseUrl, pathPrefix } = UPSTREAMS[target];
  const base = baseUrl.replace(/\/$/, '');
  const normalizedPath = normalizePath(path);
  const pathWithoutPrefix = normalizePath(stripKnownPrefix(normalizedPath));
  const baseHasPrefix = base.endsWith(pathPrefix);
  const pathWithPrefix = baseHasPrefix
    ? pathWithoutPrefix
    : `${pathPrefix}${pathWithoutPrefix}`;

  const qs = query?.toString() ?? '';
  return `${base}${pathWithPrefix}${qs ? `?${qs}` : ''}`;
};

const missingApiKeyResponse = (target: UpstreamTarget) =>
  NextResponse.json(
    {
      success: false,
      error: 'missing_api_key',
      message: `API key fehlt (${target}).`,
    },
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
  target = 'typewriter',
  context = {},
}: ProxyRequestOptions): Promise<Response> {
  const { apiKey } = UPSTREAMS[target];

  if (requireApiKey && !apiKey) {
    return missingApiKeyResponse(target);
  }

  const upstreamUrl = buildUpstreamUrl(target, path, query);
  const requestHeaders = new Headers(headers);

  if (requireApiKey) {
    requestHeaders.set('x-api-key', apiKey);
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
    return internalErrorResponse(error, {
      ...context,
      target,
      upstream_url: upstreamUrl,
    });
  }
}
