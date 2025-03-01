import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const target = searchParams.get('target'); // Erlaubte Werte: 'history' oder 'session'
    const identifier = searchParams.get('id'); // Entweder ein Index/Wert oder eine Session-ID

    if (!target || !identifier) {
      return NextResponse.json(
        { error: 'Fehlende Parameter: target und id sind erforderlich.' },
        { status: 400 },
      );
    }

    if (target === 'history') {
      // Löschen eines Archiv-Eintrags mittels LREM.
      const removedCount = await redis.lrem(
        'typewriter:history',
        1,
        identifier,
      );
      return NextResponse.json({ removedCount }, { status: 200 });
    } else if (target === 'session') {
      // Löschen eines Session-Schlüssels (z. B. "typewriter:<sessionId>")
      const key = `typewriter:${identifier}`;
      const result = await redis.del(key);
      return NextResponse.json({ deletedKeys: result }, { status: 200 });
    } else {
      return NextResponse.json(
        { error: 'Ungültiger target-Parameter.' },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error('Fehler beim Löschen:', error);
    return NextResponse.json(
      { error: 'Interner Fehler beim Löschen.' },
      { status: 500 },
    );
  }
}
