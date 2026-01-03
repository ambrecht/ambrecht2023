'use client';
import React from 'react';
import type { Session } from './types';

interface SessionListProps {
  sessions: Session[];
  selectedId?: number;
  onSelect: (session: Session) => void;
}

export function SessionList({ sessions, selectedId, onSelect }: SessionListProps) {
  if (sessions.length === 0) {
    return <p className="text-gray-400">Keine Sessions gefunden.</p>;
  }

  return (
    <ul className="space-y-1">
      {sessions.map((session) => {
        const isActive = session.id === selectedId;
        const title = session.title?.trim() || `Session #${session.id}`;
        const teaser =
          session.text.length > 120 ? `${session.text.slice(0, 120)}…` : session.text;

        return (
          <li key={session.id}>
            <button
              onClick={() => onSelect(session)}
              className={`w-full text-left rounded-md transition-all duration-120 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                isActive
                  ? 'bg-amber-100/70 text-amber-900'
                  : 'bg-transparent text-amber-50 hover:bg-amber-50/10'
              }`}
            >
              <div className="px-3 py-2">
                <div className="flex items-center justify-between text-[12px] text-amber-200/90">
                  <span className="font-medium">{title}</span>
                  <time dateTime={session.created_at}>
                    {new Date(session.created_at).toLocaleDateString()}
                  </time>
                </div>
                <p className="mt-1 text-[14px] leading-[1.55] text-amber-50 line-clamp-2">
                  {teaser}
                </p>
                <div className="mt-1 text-[11px] text-amber-200/70">
                  {session.word_count} Wörter · {session.char_count} Zeichen
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
