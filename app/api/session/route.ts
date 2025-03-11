import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/client';
import { validateSessionContent } from '@/lib/validation';

/**
 * API-Route zum Speichern einer Schreib-Session.
 *
 * Erwartet einen JSON-Body mit dem Schlüssel `content`.
 * Validiert den Inhalt und berechnet Buchstaben- und Wortanzahl.
 * Speichert in die Tabelle `sessions` (Spalten: text, letter_count, word_count).
 *
 * @param req Die eingehende Anfrage.
 * @returns JSON mit der ID und dem Erstellungszeitpunkt der Session.
 */
export async function POST(req: NextRequest) {
  console.debug('Received POST request to /api/session');

  // Request-Body einlesen
  const { content } = await req.json();
  console.debug('Request body:', { content });

  // Inhalt validieren
  if (!validateSessionContent(content)) {
    console.debug('Invalid content format:', content);
    return NextResponse.json(
      { error: 'Invalid content format' },
      { status: 400 },
    );
  }

  // Berechnung der Buchstaben- und Wortanzahl
  const letterCount = content.length;
  const wordCount = content.trim().split(/\s+/).length;
  console.debug('Computed letterCount:', letterCount, 'wordCount:', wordCount);

  try {
    console.debug('Inserting session into database...');
    const result = await query(
      `INSERT INTO sessions (text, letter_count, word_count)
       VALUES ($1, $2, $3)
       RETURNING id, created_at`,
      [content, letterCount, wordCount],
    );
    console.debug('Session inserted successfully:', result.rows[0]);
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Database Error:', error.message);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 },
    );
  }
}
