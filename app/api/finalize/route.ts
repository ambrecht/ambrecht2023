import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const { typedText } = await request.json();

    if (typedText === undefined) {
      return NextResponse.json(
        { message: 'Kein Text übergeben.' },
        { status: 400 },
      );
    }

    // Archivierung des finalen Textes.
    await redis.rpush('typewriter:history', typedText);
    // Löschen des aktuellen Textes.
    await redis.del('current_text');
    // Freigeben des Locks.
    await redis.del('typewriter_lock');

    return NextResponse.json(
      { message: 'Session finalisiert.' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Fehler beim Finalisieren:', error);
    return NextResponse.json(
      { message: 'Fehler beim Finalisieren.' },
      { status: 500 },
    );
  }
}
