import { NextResponse } from 'next/server';
import { proxyRequest } from '@/lib/server/apiProxy';

export const runtime = 'nodejs';

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const sessionId = params.id;

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

  return proxyRequest({
    method: 'POST',
    path: `/sessions/${sessionId}/edits`,
    body: JSON.stringify({ text }),
    requireApiKey: true,
    context: { route: 'sessions.edits', session_id: sessionId },
  });
}
