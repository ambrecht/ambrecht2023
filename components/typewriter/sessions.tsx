'use client';

import React, { useState, useEffect } from 'react';

/**
 * Typdefinition für eine Schreib-Session.
 */
interface Session {
  id: number;
  text: string;
  created_at: string;
  letter_count: number;
  word_count: number;
}

/**
 * Komponente zur Anzeige und Verwaltung bisheriger Schreib-Sessions.
 *
 * Die Sessions werden von der API abgerufen, nach Erstellungsdatum (neueste zuerst)
 * sortiert und mit Erstelldatum, Wort- und Buchstabenzahl angezeigt.
 * Für Sessions, die älter als 24 Stunden sind, wird ein Lösch-Button eingeblendet.
 * Nach erfolgreichem Speichern einer neuen Session wird diese Komponente automatisch
 * aktualisiert, um den aktuellen Stand ohne Neuladen anzuzeigen.
 *
 * @returns Die gerenderte Liste der Sessions.
 */
export default function SessionList() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = () => {
    console.debug('Fetching sessions from /api/sessions ...');
    fetch('/api/sessions')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.debug('Fetched sessions:', data);
        // Sortieren nach Erstellungsdatum, neueste zuerst
        const sortedSessions = data.sort(
          (a: Session, b: Session) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        setSessions(sortedSessions);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching sessions:', err);
        setError('Fehler beim Laden der Sessions.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSessions();

    const handleSessionSaved = (event: CustomEvent) => {
      // Nach dem Speichern der Session neu laden
      fetchSessions();
    };

    window.addEventListener(
      'sessionSaved',
      handleSessionSaved as EventListener,
    );

    return () => {
      window.removeEventListener(
        'sessionSaved',
        handleSessionSaved as EventListener,
      );
    };
  }, []);

  /**
   * Löscht eine Session anhand ihrer ID, sofern sie älter als 24 Stunden ist.
   *
   * @param id Die ID der zu löschenden Session.
   */
  const handleDelete = async (id: number) => {
    console.debug(`Attempting to delete session with id: ${id}`);
    try {
      const response = await fetch(`/api/session/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Löschung fehlgeschlagen');
      }
      console.debug(`Session with id ${id} successfully deleted.`);
      setSessions((prev) => prev.filter((session) => session.id !== id));
    } catch (err: any) {
      console.error(`Error deleting session with id ${id}:`, err.message);
      console.log(`Fehler beim Löschen der Session: ${err.message}`);
    }
  };

  /**
   * Prüft, ob eine Session älter als 24 Stunden ist.
   *
   * @param createdAt Das Erstellungsdatum der Session.
   * @returns True, wenn die Session älter als 24 Stunden ist.
   */
  const isOlderThan24Hours = (createdAt: string): boolean => {
    const sessionDate = new Date(createdAt);
    const now = new Date();
    const diff = now.getTime() - sessionDate.getTime();
    return diff > 24 * 60 * 60 * 1000;
  };

  if (loading) return <p className="text-center mt-4">Lade Sessions...</p>;
  if (error) return <p className="text-center mt-4 text-red-600">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Bisherige Schreib-Sessions</h2>
      {sessions.length === 0 ? (
        <p>Keine Sessions gefunden.</p>
      ) : (
        sessions.map((session) => (
          <div
            key={session.id}
            className="bg-white shadow rounded p-4 mb-4 flex flex-col"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-medium">
                  Erstellt:{' '}
                  {new Date(session.created_at).toLocaleString('de-DE', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </p>
                <p className="text-sm text-gray-600">
                  Wörter: {session.word_count} | Buchstaben:{' '}
                  {session.letter_count}
                </p>
              </div>
              {isOlderThan24Hours(session.created_at) && (
                <button
                  onClick={() => handleDelete(session.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  Löschen
                </button>
              )}
            </div>
            <div className="mt-2">
              <p className="text-gray-800">{session.text}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
