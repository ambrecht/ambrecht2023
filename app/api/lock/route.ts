import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

const LOCK_KEY = 'typewriter_lock';
const LOCK_EXPIRY = 300; // Timeout in Sekunden

export async function POST(request: NextRequest) {
  try {
    const { writerId } = await request.json();
    // Versuch, den Lock mittels NX-Option zu setzen.
    const lockSet = await redis.set(LOCK_KEY, writerId, {
      nx: true,
      ex: LOCK_EXPIRY,
    });

    if (lockSet) {
      return NextResponse.json({ success: true, lockedBy: writerId });
    } else {
      const currentLock = await redis.get(LOCK_KEY);
      return NextResponse.json({ success: false, lockedBy: currentLock });
    }
  } catch (err) {
    console.error('Lock Fehler:', err);
    return NextResponse.json(
      { error: 'Fehler beim Sperren.' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Erneuerung des Locks, sofern der anfragende Benutzer bereits Inhaber ist.
    const { writerId } = await request.json();
    const currentLock = await redis.get(LOCK_KEY);

    if (currentLock === writerId) {
      await redis.set(LOCK_KEY, writerId, {
        xx: true,
        ex: LOCK_EXPIRY,
      });
      return NextResponse.json({ success: true, message: 'Lock verlängert.' });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Sie besitzen nicht den Lock.',
      });
    }
  } catch (err) {
    console.error('Lock Erneuerung Fehler:', err);
    return NextResponse.json(
      { error: 'Lock konnte nicht erneuert werden.' },
      { status: 500 },
    );
  }
}
