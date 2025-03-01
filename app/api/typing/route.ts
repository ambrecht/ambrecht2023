import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

const LOCK_KEY = 'typewriter_lock';

export async function POST(request: NextRequest) {
  try {
    const { text, writerId } = await request.json();

    // Prüfung, ob der anfragende Benutzer den Lock besitzt.
    const currentLock = await redis.get(LOCK_KEY);
    if (currentLock !== writerId) {
      return NextResponse.json(
        { error: 'Sie besitzen nicht den Lock.' },
        { status: 403 },
      );
    }

    // Speichern des aktuellen Textes.
    await redis.set('current_text', text);
    // Verlängerung des Locks.
    await redis.expire(LOCK_KEY, 300);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Typing Fehler:', error);
    return NextResponse.json(
      { error: 'Interner Fehler beim Schreiben.' },
      { status: 500 },
    );
  }
}
