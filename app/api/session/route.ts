// app/api/session/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/client'; // Ihre DB-Client-Logik
import { validateSessionContent } from '@/lib/validation'; // ggf. vorhandene Validierung

/**
 * Einfache Levenshtein-Distanz-Funktion.
 * Misst, wie viele Einzeloperationen (Einfügen/Löschen/Ersetzen) nötig sind,
 * um Text A in Text B zu verwandeln.
 */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const lenA = a.length;
  const lenB = b.length;
  if (!lenA) return lenB;
  if (!lenB) return lenA;

  const matrix = Array.from({ length: lenB + 1 }, () =>
    new Array<number>(lenA + 1).fill(0),
  );

  for (let i = 0; i <= lenB; i++) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= lenA; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= lenB; i++) {
    for (let j = 1; j <= lenA; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // Löschen
        matrix[i][j - 1] + 1, // Einfügen
        matrix[i - 1][j - 1] + cost, // Ersetzen
      );
    }
  }
  return matrix[lenB][lenA];
}

/**
 * Ermittelt die prozentuale Abweichung zweier Texte anhand der Levenshtein-Distanz.
 */
function textDifferencePercent(a: string, b: string): number {
  if (!a && !b) return 0;
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  return maxLen ? (dist / maxLen) * 100 : 0;
}

/**
 * API-Route (POST) zum Speichern einer Schreib-Session.
 * Enthält eine 20%-Abweichungsprüfung, um Duplikate zu vermeiden.
 */
export async function POST(req: NextRequest) {
  console.debug('Received POST request to /api/session');

  // JSON parsen
  let data: { content?: string };
  try {
    data = await req.json();
  } catch (error) {
    console.error('Invalid JSON body:', error);
    return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
  }

  const content = data.content ?? '';
  console.debug('Request body content:', content);

  // Inhalt validieren
  if (!validateSessionContent(content)) {
    console.debug('Content did not pass validateSessionContent check.');
    return NextResponse.json(
      { error: 'Invalid content format' },
      { status: 400 },
    );
  }

  try {
    // 1) Letzte Session (ohne benutzerbezogene Unterscheidung) laden
    const lastSessionResult = await query(
      `
        SELECT id, text 
          FROM sessions
      ORDER BY created_at DESC
         LIMIT 1
      `,
      [],
    );

    // 2) Wenn es eine vorhandene Session gibt, Differenz vergleichen
    if ((lastSessionResult?.rowCount ?? 0) > 0) {
      const lastText = lastSessionResult.rows[0].text as string;
      const diffPercent = textDifferencePercent(lastText, content);
      console.debug(`Difference from last session: ${diffPercent.toFixed(2)}%`);

      if (diffPercent < 20) {
        console.debug('Text is too similar. Aborting Insert.');
        return NextResponse.json(
          { message: 'Session not inserted. Less than 20% difference.' },
          { status: 200 },
        );
      }
    }

    // 3) Wort- und Buchstabenanzahl bestimmen
    const letterCount = content.length;
    const wordCount = content.trim().split(/\s+/).length;

    // 4) Neue Session in DB speichern
    const result = await query(
      `
        INSERT INTO sessions (text, letter_count, word_count)
             VALUES ($1,    $2,           $3)
         RETURNING id, created_at
      `,
      [content, letterCount, wordCount],
    );

    const newSession = result.rows[0];
    console.debug('New session inserted:', newSession);

    // Erfolgsmeldung zurückgeben
    return NextResponse.json(newSession, { status: 201 });
  } catch (error: any) {
    console.error('Database error:', error.message);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 },
    );
  }
}
