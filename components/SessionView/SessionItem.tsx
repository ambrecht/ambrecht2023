'use client';
import React from 'react';
import type { Session } from './types';

interface SessionItemProps {
  session: Session;
}

export function SessionItem({ session }: SessionItemProps) {
  const { id, text, created_at, letter_count, word_count, char_count } = session;

  return (
    <article className="max-w-[72ch] mx-auto">
      <header className="flex items-center justify-between text-[12px] text-amber-900/70 font-medium">
        <span className="tracking-wide">Session #{id}</span>
        <time dateTime={created_at}>{new Date(created_at).toLocaleString()}</time>
      </header>

      <p
        className="mt-6 whitespace-pre-wrap text-[19px] md:text-[20px] leading-[1.75] text-amber-950 font-serif"
        style={{ fontFeatureSettings: '"liga","kern"' }}
      >
        {text}
      </p>

      <footer className="mt-5 text-[12px] text-amber-900/70 flex gap-3 flex-wrap">
        <span>{word_count} Wörter</span>
        <span aria-hidden="true">·</span>
        <span>{char_count} Zeichen</span>
        <span aria-hidden="true">·</span>
        <span>{letter_count} Buchstaben</span>
      </footer>
    </article>
  );
}
