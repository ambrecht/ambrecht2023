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
    <ul className="space-y-3">
      {sessions.map((session) => {
        const isActive = session.id === selectedId;
        const teaser = session.text.length > 120
          ? `${session.text.slice(0, 120)}…`
          : session.text;

        return (
          <li key={session.id}>
            <button
              onClick={() => onSelect(session)}
              className={`w-full text-left rounded-xl border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                isActive
                  ? 'border-amber-400/70 bg-amber-50 text-amber-900'
                  : 'border-gray-200 bg-white/80 text-gray-900 hover:border-gray-300 hover:bg-white'
              }`}
            >
              <div className="px-4 py-3">
                <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                  <span className="tracking-wide">Session #{session.id}</span>
                  <time dateTime={session.created_at} className="text-[11px]">
                    {new Date(session.created_at).toLocaleDateString()}
                  </time>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-gray-800 line-clamp-3">
                  {teaser}
                </p>
                <div className="mt-2 text-[11px] text-gray-500">
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
