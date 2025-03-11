import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/client';

/**
 * API-Route zum Abrufen aller Schreib-Sessions.
 *
 * Ruft alle Sessions aus der Tabelle `sessions` ab und sortiert sie nach dem Erstellungsdatum (neueste zuerst).
 *
 * @param req Die eingehende Anfrage.
 * @returns JSON-Array mit allen Sessions.
 */
export async function GET(req: NextRequest) {
  console.debug('Received GET request to /api/sessions');
  try {
    const result = await query(
      `SELECT id, text, created_at, letter_count, word_count 
       FROM sessions
       ORDER BY created_at DESC`,
    );
    console.debug('Sessions fetched successfully:', result.rows);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching sessions:', error.message);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 },
    );
  }
}
