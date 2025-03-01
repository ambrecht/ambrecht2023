// app/api/save-text/route.ts
import { NextResponse } from 'next/server';
import { redis } from '../../../lib/redis';
// Pfad anpassen je nach Ihrer Struktur.
// Evtl. besser: import { redis } from '@/lib/redis'

export async function POST(request: Request) {
  try {
    const { sessionId, typedText } = await request.json();
    if (!sessionId || !typedText) {
      return NextResponse.json(
        { message: 'Fehlender sessionId oder typedText' },
        { status: 400 },
      );
    }

    await redis.set(`typewriter:${sessionId}`, typedText);
    return NextResponse.json(
      { message: 'Text erfolgreich gespeichert.' },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Fehler beim Speichern in Upstash Redis.' },
      { status: 500 },
    );
  }
}
