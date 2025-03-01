// /api/typing/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

const LOCK_KEY = 'typewriter_lock';

export async function POST(request: NextRequest) {
  try {
    const { text, writerId } = await request.json();

    // Überprüfen, ob der anfragende Client den Master-Lock besitzt.
    const currentLock = await redis.get(LOCK_KEY);
    if (currentLock !== writerId) {
      // Falls nicht, wird der aktuelle Master-Text zurückgegeben.
      const masterText = await redis.get('current_text');
      return NextResponse.json(
        {
          error:
            'Nicht berechtigt zu schreiben. Sie sind als Slave angemeldet.',
          masterText,
        },
        { status: 403 },
      );
    }

    // Der Master darf den Text aktualisieren.
    await redis.set('current_text', text);
    // Den Lock verlängern, um den Master-Status beizubehalten.
    await redis.expire(LOCK_KEY, 300);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Typing error:', error);
    return NextResponse.json(
      { error: 'Interner Fehler beim Schreiben.' },
      { status: 500 },
    );
  }
}
