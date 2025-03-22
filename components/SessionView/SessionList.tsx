'use client';
import React from 'react';
import { SessionItem } from './SessionItem';

export interface ISession {
  id: number;
  text: string;
  created_at: string;
  letter_count: number;
  word_count: number;
}

interface SessionListProps {
  sessions: ISession[];
  onSessionChange: () => void;
}

export function SessionList({ sessions, onSessionChange }: SessionListProps) {
  if (sessions.length === 0) {
    // In einer dunklen Umgebung dezente farbliche Abhebung
    return (
      <p className="text-gray-300">Es sind derzeit keine Sessions vorhanden.</p>
    );
  }

  return (
    <ul className="space-y-4">
      {sessions.map((session) => (
        <li key={session.id}>
          <SessionItem session={session} onSessionChange={onSessionChange} />
        </li>
      ))}
    </ul>
  );
}
