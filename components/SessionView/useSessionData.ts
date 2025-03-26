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
          credentials: 'include', // Falls Cookies verwendet werden
          cache: 'no-store',
        },
      );

      if (!response.ok) {
        console.error('Fehler beim Laden der Sessions:', response.statusText);
        return;
      }

      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error('Netzwerkfehler beim Laden der Sessions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initiales Laden der Daten beim ersten Rendern
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Periodisches Aktualisieren alle 5 Sekunden
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSessions();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  // Manuelles Neuladen der Daten, beispielsweise nach einer Änderung
  const refreshSessions = () => {
    fetchSessions();
  };

  return {
    sessions,
    refreshSessions,
    isLoading,
  };
}
