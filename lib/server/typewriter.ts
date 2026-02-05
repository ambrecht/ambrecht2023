import { z } from 'zod';

const TypewriterEnvSchema = z.object({
  TYPEWRITER_API_BASE_URL: z.string().url(),
  TYPEWRITER_API_KEY: z.string().min(1),
});

const DEFAULT_TYPEWRITER_API_BASE_URL = 'https://api.ambrecht.de';

function getEnv() {
  const parsed = TypewriterEnvSchema.safeParse({
    TYPEWRITER_API_BASE_URL:
      process.env.TYPEWRITER_API_BASE_URL ||
      process.env.EXTERNAL_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      DEFAULT_TYPEWRITER_API_BASE_URL,
    TYPEWRITER_API_KEY:
      process.env.TYPEWRITER_API_KEY ||
      process.env.API_KEY ||
      process.env.NEXT_PUBLIC_API_KEY,
  });
  if (!parsed.success) {
    throw new Error('Missing env: TYPEWRITER_API_BASE_URL and/or TYPEWRITER_API_KEY');
  }
  return parsed.data;
}

export async function typewriterFetch(
  path: string,
  init: RequestInit & { cache?: RequestCache } = {},
) {
  const { TYPEWRITER_API_BASE_URL, TYPEWRITER_API_KEY } = getEnv();

  const url = new URL(path, TYPEWRITER_API_BASE_URL);
  const headers = new Headers(init.headers);

  headers.set('x-api-key', TYPEWRITER_API_KEY);
  if (!headers.has('content-type') && init.body) {
    headers.set('content-type', 'application/json');
  }

  return fetch(url, {
    ...init,
    headers,
    cache: init.cache ?? 'no-store',
  });
}

export const LiveSessionCreateResponseSchema = z.object({
  sessionId: z.string().uuid(),
  created_at: z.string(),
  existed: z.boolean(),
  token: z.string(),
});

export const LiveSessionEventSchema = z.object({
  content: z.string(),
  created_at: z.string(),
});
