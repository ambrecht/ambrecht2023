'use client';

import React, { useEffect, useState } from 'react';

interface Session {
  id: string;
  text: string;
  created_at: string;
  letter_count: number;
  word_count: number;
}

export default function SessionList() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSessions = async () => {
    setLoading(true);
    try {
      // Stärkere Cache-Vermeidung
      const response = await fetch(`/api/sessions?nocache=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server-Fehler: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Geladene Sessions:', data);
      setSessions(data);
      setError('');
    } catch (err) {
      console.error('Fehler beim Laden der Sessions:', err);
      setError(
        `Fehler beim Laden: ${
          err instanceof Error ? err.message : 'Unbekannter Fehler'
        }`,
      );
    } finally {
      setLoading(false);
    }
  };

  // Initiales Laden der Sessions
  useEffect(() => {
    fetchSessions();

    // Event-Listener für manuelles Speichern
    const handleSessionSaved = () => {
      console.log('Session gespeichert Event erkannt, lade Sessions neu...');
      // Kurze Verzögerung, um sicherzustellen, dass der Server die Session gespeichert hat
      setTimeout(fetchSessions, 500);
    };

    window.addEventListener('sessionSaved', handleSessionSaved);

    return () => {
      window.removeEventListener('sessionSaved', handleSessionSaved);
    };
  }, []);

  // Polling für Android-Geräte (als Fallback)
  useEffect(() => {
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (isAndroid) {
      const intervalId = setInterval(fetchSessions, 10000); // Alle 10 Sekunden neu laden
      return () => clearInterval(intervalId);
    }
  }, []);

  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-4 text-gray-800">
        Gespeicherte Sessions
      </h2>

      {loading && <div className="text-gray-500 mb-2">Lade Sessions...</div>}
      {error && <div className="text-red-500 mb-2">{error}</div>}

      {!loading && sessions.length === 0 ? (
        <div className="text-gray-500">Keine Sessions gefunden.</div>
      ) : (
        sessions.map((session) => (
          <div
            key={session.id}
            className="mb-3 p-3 bg-gray-50 rounded border border-gray-200"
          >
            <div className="text-sm text-gray-600">
              {new Date(session.created_at).toLocaleString('de-DE')}
            </div>
            <div className="mt-1 text-gray-800 break-words">{session.text}</div>
            <div className="mt-1 text-xs text-gray-500">
              {session.word_count} Wörter · {session.letter_count} Zeichen
            </div>
          </div>
        ))
      )}

      {/* Manueller Reload-Button für Android */}
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => fetchSessions()}
      >
        Sessions neu laden
      </button>
    </div>
  );
}
