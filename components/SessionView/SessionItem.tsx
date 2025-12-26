'use client';

import React, { useMemo, useState } from 'react';
import { Copy, Edit3, MoreHorizontal, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Session } from './types';
import {
  buildTags,
  classifyWord,
  computeAnalysis,
  splitPreservingWhitespace,
  type WordClass,
} from '@/lib/textAnalysis';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

interface SessionItemProps {
  session: Session;
}

const classToSpan = (cls: WordClass) => {
  if (cls === 'verb') return 'analysis-verb';
  if (cls === 'noun') return 'analysis-noun';
  if (cls === 'adverb') return 'analysis-adverb';
  return '';
};

export function SessionItem({ session }: SessionItemProps) {
  const router = useRouter();
  const { id, text, created_at, letter_count, word_count, char_count } = session;
  const [showAnalysis, setShowAnalysis] = useState(false);
  const { copied, copy } = useCopyToClipboard(1500);

  const safeWordCount = word_count ?? 0;
  const safeCharCount = char_count ?? 0;
  const safeLetterCount = letter_count ?? 0;

  const paragraphs = useMemo(() => {
    const t = text.trim();
    if (!t) return [];
    return t.split(/\n{2,}/);
  }, [text]);

  const tags = useMemo(() => buildTags(text), [text]);
  const analysis = useMemo(() => computeAnalysis(text), [text]);
  const readingTime = Math.max(1, Math.round(safeWordCount / 180));
  const status = safeWordCount > 400 ? 'Überarbeitet' : 'Roh';

  // Cache classifications so we don't re-run classifyWord for identical tokens
  const classifier = useMemo(() => {
    const cache = new Map<string, WordClass>();
    return (token: string) => {
      const hit = cache.get(token);
      if (hit) return hit;
      const cls = classifyWord(token);
      cache.set(token, cls);
      return cls;
    };
  }, []);

  const handleEdit = () => {
    router.push(`/session?active=${encodeURIComponent(String(id))}`);
  };

  const handleCopy = async () => {
    try {
      await copy(text);
    } catch (err) {
      console.error('Konnte nicht kopieren', err);
    }
  };

  const renderParagraph = (para: string, idx: number) => {
    if (!showAnalysis) {
      return (
        <p key={`${id}-p-${idx}`} className="whitespace-pre-wrap">
          {para}
        </p>
      );
    }

    const tokens = splitPreservingWhitespace(para);
    return (
      <p key={`${id}-p-${idx}`} className="whitespace-pre-wrap">
        {tokens.map((token, tokenIdx) => {
          if (!token || !token.trim()) {
            return <React.Fragment key={tokenIdx}>{token}</React.Fragment>;
          }

          const cls = classifier(token);
          if (cls === 'none') {
            return <React.Fragment key={tokenIdx}>{token}</React.Fragment>;
          }

          return (
            <span key={tokenIdx} className={classToSpan(cls)}>
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
              {new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium' }).format(
                new Date(created_at),
              )}
            </time>
            <span aria-hidden="true">·</span>
            <span>{safeWordCount} Wörter</span>
            <span aria-hidden="true">·</span>
            <span>{safeCharCount} Zeichen</span>
            <span aria-hidden="true">·</span>
            <span>{safeLetterCount} Buchstaben</span>
            <span aria-hidden="true">·</span>
            <span>{readingTime} min Lesezeit</span>
          </div>
        </div>
        <div className="flex items-center gap-2 opacity-70 group-hover:opacity-100 sm:self-start">
          <button
            type="button"
            onClick={handleEdit}
            className="inline-flex items-center gap-1 rounded-lg border border-[#2f2822] bg-[#18130f] px-3 py-2 text-xs font-semibold text-[#f7f4ed] hover:bg-[#211a13]"
          >
            <Edit3 size={14} /> Bearbeiten
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-lg border border-[#2f2822] bg-[#18130f] px-3 py-2 text-xs font-semibold text-[#f7f4ed] hover:bg-[#211a13]"
          >
            <Copy size={14} /> {copied ? 'Kopiert' : 'Kopieren'}
          </button>
          <span className="sr-only" aria-live="polite">
            {copied ? 'In die Zwischenablage kopiert.' : ''}
          </span>
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
          <Sparkles size={14} /> Analyse: Verben {analysis.verbs} · Nomen {analysis.nouns} ·
          Adverbien {analysis.adverbs}
        </span>
        <button
          type="button"
          onClick={() => setShowAnalysis((v) => !v)}
          aria-pressed={showAnalysis}
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
