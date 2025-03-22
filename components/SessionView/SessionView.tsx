'use client';
import React from 'react';
import { SessionList } from './SessionList';
import { useSessionData } from './useSessionData';

/**
 * Haupt-Komponente, die alle Sessions lädt und anzeigt.
 * Sie aktualisiert sich automatisch, wenn neue Sessions hinzukommen.
 */
export function SessionView() {
  // Benutzen eines eigenen Hooks, der Daten lädt und live aktualisiert.
  const { sessions, refreshSessions } = useSessionData();

  return (
    <div className="p-4 border border-gray-300 rounded">
      <h2 className="text-2xl font-bold mb-4">Sessions verwalten</h2>
      <SessionList sessions={sessions} onSessionChange={refreshSessions} />
    </div>
  );
}
