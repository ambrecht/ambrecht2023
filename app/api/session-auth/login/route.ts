import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'session_view_auth';
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

const getAuthPassword = () => process.env.SESSION_AUTH_PASSWORD || '';
const getAuthSecret = () =>
  process.env.SESSION_AUTH_SECRET ||
  process.env.SESSION_AUTH_PASSWORD ||
  '';

const toBase64Url = (value: string | ArrayBuffer) => {
  const bytes =
    typeof value === 'string'
      ? new TextEncoder().encode(value)
      : new Uint8Array(value);

  return Buffer.from(bytes)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
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

const createToken = async () => {
  const secret = getAuthSecret();
  const payload = toBase64Url(
    JSON.stringify({
      exp: Date.now() + SESSION_DURATION_SECONDS * 1000,
    }),
  );
  const signature = await sign(payload, secret);
  return `${payload}.${signature}`;
};

export async function POST(request: NextRequest) {
  const configuredPassword = getAuthPassword();
  if (!configuredPassword) {
    return NextResponse.json(
      {
        success: false,
        error: 'missing_session_auth_password',
        message: 'SESSION_AUTH_PASSWORD fehlt.',
      },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    password?: string;
  } | null;

  if (!body?.password || body.password !== configuredPassword) {
    return NextResponse.json(
      {
        success: false,
        error: 'invalid_password',
        message: 'Passwort ist falsch.',
      },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: COOKIE_NAME,
    value: await createToken(),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  });

  return response;
}
