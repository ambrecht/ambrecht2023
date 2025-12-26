'use client';

import React, { useMemo, useState } from 'react';
import { Copy, Edit3, MoreHorizontal, Sparkles } from 'lucide-react';
import type { Session } from './types';

interface SessionItemProps {
  session: Session;
}

type WordClass = 'verb' | 'noun' | 'adverb' | 'none';

const classifyWord = (word: string): WordClass => {
  const cleaned = word.replace(/[.,;:!?()"„“«»]/g, '');
  if (!cleaned || cleaned.length <= 2) return 'none';

  const lower = cleaned.toLowerCase();

  const looksLikeVerb =
    lower.endsWith('en') ||
    lower.endsWith('ern') ||
    lower.endsWith('eln') ||
    lower.endsWith('ieren');

  const looksLikeAdverb = lower.endsWith('lich') || lower.endsWith('weise');
  const looksLikeNoun = /^[A-ZÄÖÜ]/.test(cleaned);

  if (looksLikeVerb) return 'verb';
  if (looksLikeAdverb) return 'adverb';
  if (looksLikeNoun) return 'noun';
  return 'none';
};

const buildTags = (text: string) => {
  const words = text.split(/\s+/).slice(0, 50);
  const tags = new Set<string>();
  words.forEach((w) => {
    const cleaned = w.replace(/[.,;:!?()"„“«»]/g, '');
    if (/^[A-ZÄÖÜ]/.test(cleaned) && cleaned.length > 3) {
      tags.add(cleaned);
    }
  });
  if (tags.size === 0) tags.add('Notiz');
  return Array.from(tags).slice(0, 3);
};

const computeAnalysis = (text: string) => {
  const tokens = text.split(/\s+/);
  return tokens.reduce(
    (acc, token) => {
      const cls = classifyWord(token);
      if (cls === 'verb') acc.verbs += 1;
      if (cls === 'noun') acc.nouns += 1;
      if (cls === 'adverb') acc.adverbs += 1;
      return acc;
    },
    { verbs: 0, nouns: 0, adverbs: 0 },
  );
};

export function SessionItem({ session }: SessionItemProps) {
  const { id, text, created_at, letter_count, word_count, char_count } = session;
  const paragraphs = text.trim().length ? text.trim().split(/\n{2,}/) : [];
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [copied, setCopied] = useState(false);

  const tags = useMemo(() => buildTags(text), [text]);
  const analysis = useMemo(() => computeAnalysis(text), [text]);
  const readingTime = Math.max(1, Math.round((word_count ?? 0) / 180));
  const status = word_count > 400 ? 'Überarbeitet' : 'Roh';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Konnte nicht kopieren', err);
    }
  };

  const handleEdit = () => {
    // Hook up to the editor route if available
    window.location.href = `/session?active=${id}`;
  };

  const renderParagraph = (para: string, idx: number) => {
    if (!showAnalysis) {
      return (
        <p key={idx} className="whitespace-pre-wrap">
          {para}
        </p>
      );
    }

    const tokens = para.split(/(\s+)/);
    return (
      <p key={idx} className="whitespace-pre-wrap">
        {tokens.map((token, tokenIdx) => {
          const cls = classifyWord(token);
          if (cls === 'none') return <React.Fragment key={tokenIdx}>{token}</React.Fragment>;
          const className =
            cls === 'verb'
              ? 'analysis-verb'
              : cls === 'noun'
                ? 'analysis-noun'
                : 'analysis-adverb';
          return (
            <span key={tokenIdx} className={className}>
              {token}
            </span>
          );
        })}
      </p>
    );
  };

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-[#2f2822] bg-[#120f0c]/80 p-6 shadow-lg shadow-black/20 hover:-translate-y-1 hover:shadow-black/30 transition-all duration-200">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#fdfbf7] leading-tight">
              Session #{id}
            </h2>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#1c1814] px-3 py-1 text-xs uppercase tracking-wide text-[#d6c9ba]">
              {status}
            </span>
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border border-[#2f2822] px-2.5 py-1 text-[11px] text-[#e8ded2] bg-[#17130f]"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="text-sm text-[#cbbfb0] flex flex-wrap gap-3">
            <time dateTime={created_at}>
              {new Date(created_at).toLocaleDateString()}
            </time>
            <span aria-hidden="true">·</span>
            <span>{word_count} Wörter</span>
            <span aria-hidden="true">·</span>
            <span>{char_count} Zeichen</span>
            <span aria-hidden="true">·</span>
            <span>{letter_count} Buchstaben</span>
            <span aria-hidden="true">·</span>
            <span>{readingTime} min Lesezeit</span>
          </div>
        </div>
        <div className="flex items-center gap-2 opacity-70 group-hover:opacity-100 sm:self-start">
          <button
            onClick={handleEdit}
            className="inline-flex items-center gap-1 rounded-lg border border-[#2f2822] bg-[#18130f] px-3 py-2 text-xs font-semibold text-[#f7f4ed] hover:bg-[#211a13]"
          >
            <Edit3 size={14} /> Bearbeiten
          </button>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-lg border border-[#2f2822] bg-[#18130f] px-3 py-2 text-xs font-semibold text-[#f7f4ed] hover:bg-[#211a13]"
          >
            <Copy size={14} /> {copied ? 'Kopiert' : 'Kopieren'}
          </button>
          <button
            type="button"
            className="inline-flex items-center rounded-lg border border-[#2f2822] bg-[#18130f] px-2 py-2 text-xs font-semibold text-[#f7f4ed] hover:bg-[#211a13]"
            aria-label="Mehr Aktionen"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </header>

      <div className="mt-4 flex items-center gap-3 text-xs text-[#d6c9ba]">
        <span className="inline-flex items-center gap-1 rounded-full bg-[#18130f] px-2.5 py-1 border border-[#2f2822]">
          <Sparkles size={14} /> Analyse: Verben {analysis.verbs} · Nomen {analysis.nouns} · Adverbien {analysis.adverbs}
        </span>
        <button
          onClick={() => setShowAnalysis((v) => !v)}
          className="text-[11px] uppercase tracking-wide rounded-full border border-[#2f2822] px-3 py-1 hover:bg-[#18130f]"
        >
          {showAnalysis ? 'Markierungen aus' : 'Markierungen an'}
        </button>
      </div>

      <div
        className="mt-6 space-y-4 text-[18px] md:text-[19px] leading-[1.75] text-[#f7f4ed] font-serif"
        style={{ fontFeatureSettings: '"liga","kern"' }}
      >
        {paragraphs.length > 0
          ? paragraphs.map((para, idx) => renderParagraph(para, idx))
          : renderParagraph(text, 0)}
      </div>
    </article>
  );
}
