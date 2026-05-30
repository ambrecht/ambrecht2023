import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'session_view_auth';

const getAuthSecret = () =>
  process.env.SESSION_AUTH_SECRET ||
  process.env.SESSION_AUTH_PASSWORD ||
  '';

const isApiRequest = (pathname: string) => pathname.startsWith('/api/');

const toBase64Url = (bytes: ArrayBuffer) => {
  const array = new Uint8Array(bytes);
  let binary = '';

  for (let index = 0; index < array.length; index += 1) {
    binary += String.fromCharCode(array[index]);
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
};

const fromBase64Url = (value: string) => {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(
    Math.ceil(value.length / 4) * 4,
    '=',
  );
  return atob(padded);
};

const sign = async (payload: string, secret: string) => {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payload),
  );
  return toBase64Url(signature);
};

const isValidToken = async (token: string | undefined, secret: string) => {
  if (!token) return false;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;

  try {
    const expectedSignature = await sign(payload, secret);
    if (signature !== expectedSignature) return false;

    const parsed = JSON.parse(fromBase64Url(payload)) as { exp?: number };
    return typeof parsed.exp === 'number' && parsed.exp > Date.now();
  } catch {
    return false;
  }
};

const redirectToLogin = (request: NextRequest) => {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/session/login';
  loginUrl.search = '';
  loginUrl.searchParams.set(
    'next',
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(loginUrl);
};

const unauthorizedApiResponse = () =>
  NextResponse.json(
    {
      success: false,
      error: 'unauthorized',
      message: 'Login erforderlich.',
    },
    { status: 401 },
  );

const missingConfigResponse = (request: NextRequest) => {
  if (isApiRequest(request.nextUrl.pathname)) {
    return NextResponse.json(
      {
        success: false,
        error: 'missing_session_auth_password',
        message: 'SESSION_AUTH_PASSWORD fehlt.',
      },
      { status: 503 },
    );
  }

  return new NextResponse('SESSION_AUTH_PASSWORD fehlt.', { status: 503 });
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/session/login' || pathname.startsWith('/api/session-auth')) {
    return NextResponse.next();
  }

  const secret = getAuthSecret();
  if (!secret) {
    return missingConfigResponse(request);
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (await isValidToken(token, secret)) {
    return NextResponse.next();
  }

  return isApiRequest(pathname) ? unauthorizedApiResponse() : redirectToLogin(request);
}

export const config = {
  matcher: [
    '/session/:path*',
    '/api/sessions/:path*',
    '/api/documents/:path*',
    '/api/notes/:path*',
    '/api/analysis-runs/:path*',
    '/api/v1/:path*',
  ],
};
