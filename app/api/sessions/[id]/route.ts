import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/client';

/**
 * API-Route zum Löschen einer Schreib-Session.
 *
 * Löscht die Session mit der angegebenen ID, sofern sie älter als 24 Stunden ist.
 *
 * @param req Die eingehende Anfrage.
 * @param params URL-Parameter, insbesondere die Session-ID.
 * @returns JSON-Objekt mit Erfolgsmeldung oder Fehler.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = params;
  console.debug(`Received DELETE request for session id: ${id}`);

  try {
    // Abrufen der Session, um das Erstellungsdatum zu prüfen
    const sessionResult = await query(
      `SELECT created_at FROM sessions WHERE id = $1`,
      [id],
    );
    if (sessionResult.rowCount === 0) {
      console.debug(`Session with id ${id} not found.`);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    const session = sessionResult.rows[0];
    const createdAt = new Date(session.created_at);
    const now = new Date();
    const diff = now.getTime() - createdAt.getTime();
    console.debug(`Session age (ms): ${diff}`);
    if (diff < 24 * 60 * 60 * 1000) {
      console.debug(
        `Session id ${id} is less than 24 hours old and cannot be deleted.`,
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
    await query(`DELETE FROM sessions WHERE id = $1`, [id]);
    console.debug(`Session id ${id} successfully deleted.`);
    return NextResponse.json({ message: 'Session deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting session:', error.message);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 },
    );
  }
}
