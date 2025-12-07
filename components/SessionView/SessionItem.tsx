'use client';
import React from 'react';
import type { Session } from './types';

interface SessionItemProps {
  session: Session;
}

export function SessionItem({ session }: SessionItemProps) {
  const { id, text, created_at, letter_count, word_count, char_count } = session;

  return (
    <div className="border border-gray-600 p-4 rounded text-gray-200 bg-black">
      <div className="text-sm text-gray-400">
        ID: {id} - Erstellt am: {new Date(created_at).toLocaleString()}
      </div>
      <p className="mt-2 whitespace-pre-wrap">{text}</p>
      <p className="text-xs text-gray-500 mt-1">
        {word_count} Woerter - {char_count} Zeichen - {letter_count} Buchstaben
      </p>
    </div>
  );
}
