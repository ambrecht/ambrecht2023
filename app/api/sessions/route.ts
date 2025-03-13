import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/client';

export async function GET(req: NextRequest) {
  try {
    const result = await query(
      `SELECT id, text, created_at, letter_count, word_count 
       FROM sessions
       ORDER BY created_at DESC`,
    );

    const response = NextResponse.json(result.rows);
    // CORS-Header für Android-Kompatibilität
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Cache-Control', 'no-store, max-age=0');

    return response;
  } catch (error: any) {
    console.error('Error fetching sessions:', error.message);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 },
    );
  }
}
