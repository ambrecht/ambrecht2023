import { NextResponse } from 'next/server';

import { loadOfflineHistorySessionText } from '@/features/live/lib/offline-history';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);

  if (!Number.isFinite(id)) {
    return NextResponse.json(
      {
        success: false,
        error: 'invalid_session_id',
        message: 'Ungueltige Session-ID.',
      },
      { status: 400 },
    );
  }

  try {
    const data = await loadOfflineHistorySessionText(id);
    if (!data) {
      return NextResponse.json(
        {
          success: false,
          error: 'not_found',
          message: 'Session wurde nicht gefunden.',
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Session konnte nicht geladen werden.';

    return NextResponse.json(
      {
        success: false,
        error: 'session_load_failed',
        message,
      },
      { status: 500 },
    );
  }
}
