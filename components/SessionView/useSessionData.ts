'use client';
import { useState, useEffect, useCallback } from 'react';
import type { ISession } from './SessionList';

export function useSessionData() {
  const [sessions, setSessions] = useState<ISession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        'https://api.ambrecht.de/api/typewriter/all',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
          },
          credentials: 'include', // falls Cookies verwendet werden
          cache: 'no-store',
        },
      );

      if (!response.ok) {
        console.error('Fehler beim Laden der Sessions:', response.statusText);
        return;
      }

      const json = await response.json();
      if (json.success) {
        setSessions(json.data);
      } else {
        console.error('API meldet einen Fehler:', json);
      }
    } catch (error) {
      console.error('Netzwerkfehler beim Laden der Sessions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Erstes Laden der Daten beim Rendern
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Periodisches Aktualisieren der Sessions alle 5 Sekunden
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSessions();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  // Manuelles Neuladen der Sessions
  const refreshSessions = () => {
    fetchSessions();
  };

  return {
    sessions,
    refreshSessions,
    isLoading,
  };
}
