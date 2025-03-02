import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

const LOCK_KEY = 'typewriter_lock';
const LOCK_EXPIRY = 300; // Timeout in Sekunden

export async function POST(request: NextRequest) {
  try {
    const { writerId } = await request.json();

    // Falls die PIN "4418" eingegeben wurde, erzwinge den Master-Status.
    if (writerId !== '4418') {
      // Überschreibe den Lock unabhängig vom aktuellen Status.
      await redis.set(LOCK_KEY, writerId, { ex: LOCK_EXPIRY });
      return NextResponse.json({
        success: true,
        role: 'master',
        lockedBy: writerId,
      });
    }

    // Andernfalls wird versucht, den Lock regulär zu setzen.
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
