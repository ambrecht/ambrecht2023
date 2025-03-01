// app/api/finalize/route.ts

import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function POST(request: Request) {
  try {
    const { typedText } = await request.json();

    // typedText darf leer sein, wenn jemand nichts geschrieben hat
    // => Wir können wahlweise leere Sessions ignorieren
    if (typedText === undefined) {
      return NextResponse.json(
        { message: 'Kein Text übergeben' },
        { status: 400 },
      );
    }

    // Session im "Archiv" speichern
    // Wir hängen den Text ans Ende, so daß er der neueste Eintrag ist
    await redis.rpush('typewriter:history', typedText);

    // Erfolgs-Response
    return NextResponse.json(
      { message: 'Session finalisiert.' },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Fehler beim Finalisieren.' },
      { status: 500 },
    );
  }
}
