// app/api/read-text/route.ts

import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET(request: Request) {
  try {
    // URL und Query-Parameter extrahieren
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { message: 'Fehlende sessionId in Query.' },
        { status: 400 },
      );
    }

    // Aus Redis lesen
    const typedText = await redis.get<string>(`typewriter:${sessionId}`);

    // Wenn nichts vorhanden, geben wir einen leeren String zurück
    return NextResponse.json({ typedText: typedText ?? '' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Fehler beim Lesen aus Redis.' },
      { status: 500 },
    );
  }
}
