'use client';
import React from 'react';
import type { Session } from './types';

interface SessionItemProps {
  session: Session;
}

export function SessionItem({ session }: SessionItemProps) {
  const { id, text, created_at, letter_count, word_count, char_count } = session;

  return (
    <article className="rounded-2xl border border-amber-100/60 bg-amber-50/70 p-6 shadow-[0_10px_40px_-30px_rgba(0,0,0,0.5)]">
      <header className="flex items-center justify-between text-sm text-amber-900/70 font-medium">
        <span className="tracking-wide">Session #{id}</span>
        <time dateTime={created_at} className="text-[12px]">
          {new Date(created_at).toLocaleString()}
        </time>
      </header>

      <p
        className="mt-6 whitespace-pre-wrap leading-[1.75] text-[19px] md:text-[20px] text-amber-950 font-serif"
        style={{ maxWidth: '72ch', fontFeatureSettings: '"liga","kern"' }}
      >
        {text}
      </p>

      <footer className="mt-6 text-xs text-amber-900/70 flex gap-3 flex-wrap">
        <span>{word_count} Wörter</span>
        <span aria-hidden="true">·</span>
        <span>{char_count} Zeichen</span>
        <span aria-hidden="true">·</span>
        <span>{letter_count} Buchstaben</span>
      </footer>
    </article>
  );
}
