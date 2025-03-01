// app/api/read-history/route.ts

import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET() {
  try {
    // Wir lesen die gesamte Liste: 0 -1 => von erstem bis letztem Element
    // Die Liste-Einträge sind jeweils ein finaler Sessiontext
    const sessions = await redis.lrange<string>('typewriter:history', 0, -1);

    // Falls noch nichts da ist, kommt ein leeres Array zurück
    return NextResponse.json({ sessions: sessions || [] }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Fehler beim Laden der History.' },
      { status: 500 },
    );
  }
}
