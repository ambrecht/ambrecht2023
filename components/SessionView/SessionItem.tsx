'use client';
import React from 'react';
import type { Session } from './types';

interface SessionItemProps {
  session: Session;
}

export function SessionItem({ session }: SessionItemProps) {
  const { id, text, created_at, letter_count, word_count, char_count } = session;
  const paragraphs = text.trim().length
    ? text.trim().split(/\n{2,}/)
    : [];

  return (
    <article className="max-w-[72ch] mx-auto py-10 border-b border-[#e5d9c9] last:border-b-0 last:pb-0">
      <header className="mb-3">
        <h2 className="text-3xl sm:text-4xl font-semibold text-[#120c08] leading-tight">
          Session #{id}
        </h2>
        <div className="mt-2 text-sm text-[#5b5147] flex flex-wrap gap-3">
          <time dateTime={created_at}>
            {new Date(created_at).toLocaleDateString()}
          </time>
          <span aria-hidden="true">·</span>
          <span>{word_count} Wörter</span>
          <span aria-hidden="true">·</span>
          <span>{char_count} Zeichen</span>
          <span aria-hidden="true">·</span>
          <span>{letter_count} Buchstaben</span>
        </div>
      </header>

      <div
        className="mt-6 space-y-6 text-[19px] md:text-[20px] leading-[1.75] text-[#1f150f] font-serif"
        style={{ fontFeatureSettings: '"liga","kern"' }}
      >
        {paragraphs.length > 0 ? (
          paragraphs.map((para, idx) => (
            <p key={idx} className="whitespace-pre-wrap">
              {para}
            </p>
          ))
        ) : (
          <p className="whitespace-pre-wrap">{text}</p>
        )}
      </div>
    </article>
  );
}
