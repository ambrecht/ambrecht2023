'use client';
import React from 'react';
import type { Session } from './types';

interface SessionItemProps {
  session: Session;
}

export function SessionItem({ session }: SessionItemProps) {
  const { id, text, created_at, letter_count, word_count, char_count } = session;

  return (
    <article className="rounded-xl border border-gray-800 bg-neutral-900/80 p-4 shadow-sm hover:border-gray-700 transition-colors">
      <header className="flex items-center justify-between text-xs text-gray-500">
        <span className="font-semibold text-gray-300">Session #{id}</span>
        <time dateTime={created_at}>{new Date(created_at).toLocaleString()}</time>
      </header>
      <p className="mt-3 whitespace-pre-wrap leading-relaxed text-lg text-gray-50">
        {text}
      </p>
      <footer className="mt-3 text-xs text-gray-500">
        {word_count} Wörter · {char_count} Zeichen · {letter_count} Buchstaben
      </footer>
    </article>
  );
}
