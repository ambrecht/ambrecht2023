// /api/lock/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

const LOCK_KEY = 'typewriter_lock';
const LOCK_EXPIRY = 300; // Timeout in Sekunden

// POST-Endpunkt: Versucht, den Lock zu setzen und gibt an, ob der Client Master oder Slave ist.
export async function POST(request: NextRequest) {
  try {
    const { writerId } = await request.json();
    // Versuchen, den Lock zu setzen, falls noch keiner existiert.
    const lockSet = await redis.set(LOCK_KEY, writerId, {
      nx: true,
      ex: LOCK_EXPIRY,
    });
    if (lockSet) {
      return NextResponse.json({
        success: true,
        role: 'master',
        lockedBy: writerId,
      });
    } else {
      const currentLock = await redis.get(LOCK_KEY);
      // Den aktuellen Master-Text abrufen, damit Slave-Clients synchronisiert werden.
      const masterText = await redis.get('current_text');
      return NextResponse.json({
        success: false,
        role: 'slave',
        lockedBy: currentLock,
        masterText,
      });
    }
  } catch (err) {
    console.error('Lock error:', err);
    return NextResponse.json(
      { error: 'Fehler beim Sperren.' },
      { status: 500 },
    );
  }
}

// GET-Endpunkt: Gibt den aktuellen Lock-Status samt Master-Text zurück.
export async function GET(request: NextRequest) {
  try {
    const currentLock = await redis.get(LOCK_KEY);
    const masterText = await redis.get('current_text');
    return NextResponse.json({ lockedBy: currentLock, masterText });
  } catch (err) {
    console.error('Lock GET error:', err);
    return NextResponse.json(
      { error: 'Lock-Status konnte nicht abgerufen werden.' },
      { status: 500 },
    );
  }
}
