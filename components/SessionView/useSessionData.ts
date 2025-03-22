'use client';
import { useState, useEffect, useCallback } from 'react';
import type { ISession } from './SessionList';

/**
 * Einfacher Hook, der Sessions vom Server lädt und ein periodisches
 * Aktualisieren erlaubt (alle 5 Sekunden). Bei Bedarf kann man auch
 * WebSockets oder Server-Sent Events nutzen.
 */
export function useSessionData() {
  const [sessions, setSessions] = useState<ISession[]>([]);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/sessions', { cache: 'no-store' });
      if (!res.ok) {
        console.error('Fehler beim Laden der Sessions:', res.statusText);
        return;
      }
      const data = await res.json();
      setSessions(data);
    } catch (error) {
      console.error('Netzwerkfehler beim Laden der Sessions:', error);
    }
  }, []);

  // Laden beim ersten Rendern
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Wiederholtes Laden in Abständen von x Sekunden (z. B. 5s)
  // Alternativ kann man hier auf eine Live-Methode (WebSocket, SSE etc.) wechseln.
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSessions();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  // Manuelles Neu-Laden, wenn sich Sessions ändern (z. B. nach Löschung, Bearbeitung)
  const refreshSessions = () => {
    fetchSessions();
  };

  return {
    sessions,
    refreshSessions,
  };
}
