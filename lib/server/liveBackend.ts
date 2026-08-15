import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  ApiErrorResponseSchema,
  type ApiErrorResponse,
} from '@/lib/live/types';

const DEFAULT_TYPEWRITER_API_BASE = 'https://api.ambrecht.de';

const LiveBackendEnvSchema = z.object({
  TYPEWRITER_API_BASE: z.string().url(),
  TYPEWRITER_API_KEY: z.string().min(1),
});

const getLiveBackendEnv = () =>
  LiveBackendEnvSchema.parse({
    TYPEWRITER_API_BASE:
      process.env.TYPEWRITER_API_BASE ||
      process.env.TYPEWRITER_API_BASE_URL ||
      process.env.EXTERNAL_API_BASE_URL ||
      DEFAULT_TYPEWRITER_API_BASE,
    TYPEWRITER_API_KEY: process.env.TYPEWRITER_API_KEY || process.env.API_KEY,
  });

const buildBackendUrl = (path: string) => {
  const { TYPEWRITER_API_BASE } = getLiveBackendEnv();
  const base = new URL(TYPEWRITER_API_BASE);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const withoutApiPrefix = normalizedPath.replace(/^\/api\/v1(?=\/|$)/, '');
  const basePath = base.pathname.replace(/\/$/, '');
  const nextPath = basePath.endsWith('/api/v1')
    ? `${basePath}${withoutApiPrefix}`
    : `${basePath}/api/v1${withoutApiPrefix}`;

  base.pathname = nextPath.replace(/\/{2,}/g, '/');
  return base;
};

const toFallbackError = (status: number): ApiErrorResponse => {
  if (status === 401) {
    return {
      success: false,
      error: 'unauthorized',
      message: 'Live-Backend hat den Writer-Key abgelehnt.',
    };
  }
  if (status === 403) {
    return {
      success: false,
      error: 'forbidden',
      message: 'Live-Backend hat den Writer-Zugriff verweigert.',
    };
  }
  if (status === 404) {
    return {
      success: false,
      error: 'session_not_found',
      message: 'Live-Session nicht gefunden.',
    };
  }
  if (status === 409) {
    return {
      success: false,
      error: 'session_ended',
      message: 'Live-Session ist beendet.',
    };
  }
  if (status === 413) {
    return {
      success: false,
      error: 'payload_too_large',
      message: 'Live-Payload ist zu gross.',
    };
  }
  if (status === 429) {
    return {
      success: false,
      error: 'rate_limited',
      message: 'Live-Backend nimmt gerade zu viele Anfragen entgegen.',
    };
  }

  return {
    success: false,
    error: status >= 500 ? 'backend_error' : 'internal_error',
    message: 'Live-Backend-Anfrage ist fehlgeschlagen.',
  };
};

const parseJson = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
};

export function liveRouteErrorResponse(error: unknown) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: 'invalid_event',
        message: 'Live-Anfrage entspricht nicht dem Backendvertrag.',
        details: error.flatten(),
      },
      { status: 400 },
    );
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json(
      {
        success: false,
        error: 'invalid_event',
        message: 'Live-Anfrage enthaelt kein gueltiges JSON.',
      },
      { status: 400 },
    );
  }

  console.error('live route error', error);
  return NextResponse.json(
    {
      success: false,
      error: 'internal_error',
      message: 'Live-Anfrage konnte nicht verarbeitet werden.',
    },
    { status: 500 },
  );
}

export async function parseJsonRequest<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<T> {
  const text = await request.text();
  const payload = text.trim().length > 0 ? (JSON.parse(text) as unknown) : {};
  return schema.parse(payload);
}

export async function postLiveBackend<T>(
  path: string,
  body: unknown,
  responseSchema: z.ZodType<T>,
  successStatus = 200,
) {
  const { TYPEWRITER_API_KEY } = getLiveBackendEnv();
  const url = buildBackendUrl(path);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': TYPEWRITER_API_KEY,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const json = await parseJson(response);

  if (!response.ok) {
    const parsedError = ApiErrorResponseSchema.safeParse(json);
    return NextResponse.json(
      parsedError.success ? parsedError.data : toFallbackError(response.status),
      { status: response.status },
    );
  }

  const parsed = responseSchema.parse(json);
  return NextResponse.json(parsed, { status: successStatus });
}
