'use client';
import React from 'react';
import { SessionItem } from './SessionItem';
import type { Session } from './types';

interface SessionListProps {
  sessions: Session[];
}

export function SessionList({ sessions }: SessionListProps) {
  if (sessions.length === 0) {
    return <p className="text-gray-300">Keine Sessions gefunden.</p>;
  }

  return (
    <ul className="space-y-4">
      {sessions.map((session) => (
        <li key={session.id}>
          <SessionItem session={session} />
        </li>
      ))}
    </ul>
  );
}
