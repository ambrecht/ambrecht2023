'use client';

import React, { useEffect, useState } from 'react';

export default function SessionList() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [error, setError] = useState('');

  // Initiales Laden der Sessions + Event-Listener für Aktualisierung
  useEffect(() => {
    const fetchSessions = () => {
      fetch(`/api/sessions?t=${Date.now()}`) // Cache-Busting
        .then((res) => {
          if (!res.ok) throw new Error('Fehler beim Laden');
          return res.json();
        })
        .then((data) => setSessions(data))
        .catch((err) => setError(err.message));
    };

    fetchSessions();

    // Event-Listener für manuelles Speichern
    const handleSessionSaved = () => fetchSessions();
    window.addEventListener('sessionSaved', handleSessionSaved);

    return () => {
      window.removeEventListener('sessionSaved', handleSessionSaved);
    };
  }, []);

  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-4 text-gray-800">
        Gespeicherte Sessions
      </h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {sessions.length === 0 ? (
        <div className="text-gray-500">Keine Sessions gefunden.</div>
      ) : (
        sessions.map((session) => (
          <div
            key={session.id}
            className="mb-3 p-3 bg-gray-50 rounded border border-gray-200"
          >
            <div className="text-sm text-gray-600">
              {new Date(session.created_at).toLocaleString()}
            </div>
            <div className="mt-1 text-gray-800">{session.text}</div>
            <div className="mt-1 text-xs text-gray-500">
              {session.word_count} Wörter · {session.letter_count} Zeichen
            </div>
          </div>
        ))
      )}
    </div>
  );
}
