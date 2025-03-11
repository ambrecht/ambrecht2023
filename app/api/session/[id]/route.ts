import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/client';

/**
 * API-Route zum Löschen einer Schreib-Session.
 *
 * Löscht die Session mit der angegebenen ID, sofern sie älter als 24 Stunden ist.
 *
 * @param req - Die eingehende Anfrage.
 * @param params - URL-Parameter, insbesondere die Session-ID.
 * @returns Ein JSON-Objekt mit einer Erfolgsmeldung oder einem Fehler.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  console.debug(`Received DELETE request for session id: ${params.id}`);

  try {
    // Abrufen der Session, um das Erstellungsdatum zu prüfen
    const sessionResult = await query(
      `SELECT created_at FROM sessions WHERE id = $1`,
      [params.id],
    );
    if (sessionResult.rowCount === 0) {
      console.debug(`Session with id ${params.id} not found.`);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = sessionResult.rows[0];
    const createdAt = new Date(session.created_at);
    const now = new Date();
    const diffMilliseconds = now.getTime() - createdAt.getTime();
    console.debug(`Session age (ms): ${diffMilliseconds}`);

    // Prüfen, ob die Session älter als 24 Stunden ist (24h = 86400000 ms)
    if (diffMilliseconds < 86400000) {
      console.debug(
        `Session with id ${params.id} is less than 24 hours old and cannot be deleted.`,
      );
      return NextResponse.json(
        {
          error:
            'Session cannot be deleted because it is less than 24 hours old.',
        },
        { status: 403 },
      );
    }

    // Löschen der Session
    await query(`DELETE FROM sessions WHERE id = $1`, [params.id]);
    console.debug(`Session with id ${params.id} successfully deleted.`);
    return NextResponse.json({ message: 'Session deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting session:', error.message);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 },
    );
  }
}
