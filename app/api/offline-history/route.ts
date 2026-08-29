import { NextResponse } from 'next/server';

import { loadOfflineHistory } from '@/features/live/lib/offline-history';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await loadOfflineHistory();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Offline-History konnte nicht geladen werden.';

    return NextResponse.json(
      {
        success: false,
        error: 'offline_history_failed',
        message,
      },
      { status: 500 },
    );
  }
}
