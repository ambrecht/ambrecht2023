'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ChevronRight,
  Plus,
  Redo2,
  SlidersHorizontal,
  Undo2,
  X,
} from 'lucide-react';

import type { Session } from '@/lib/api/types';
import {
  createEdit,
  getDocumentVersions,
  getSession,
} from '@/lib/api/typewriterClient';

type EditorSnapshot = {
  text: string;
};

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

type TextRange = {
  start: number;
  end: number;
};

type WordHit = TextRange & {
  raw: string;
  normalized: string;
};

type WordSummary = {
  word: string;
  count: number;
  hits: TextRange[];
};

type SentenceInfo = TextRange & {
  text: string;
  words: number;
};

type ParagraphInfo = TextRange & {
  text: string;
  words: number;
};

type CheckAnalysis = {
  repetitions: WordSummary[];
  adverbs: WordSummary[];
  sentences: SentenceInfo[];
  paragraphs: ParagraphInfo[];
};

type ActiveCheck =
  | { type: 'word'; key: string; label: string; ranges: TextRange[] }
  | { type: 'sentence'; key: string; label: string; ranges: TextRange[] }
  | { type: 'paragraph'; key: string; label: string; ranges: TextRange[] };

const DEFAULT_ADVERB_WORDS = [
  'sehr',
  'wirklich',
  'eigentlich',
  'irgendwie',
  'plötzlich',
  'voellig',
  'völlig',
  'ziemlich',
  'vielleicht',
  'wahrscheinlich',
  'ueberhaupt',
  'überhaupt',
];

const ADVERB_STORE_KEY = 'session-editor-check-adverbs';
const WORD_RE = /[\p{L}\p{M}]+(?:[-'][\p{L}\p{M}]+)*/gu;

const countWords = (value: string) => {
  const matches = value.trim().match(/\S+/g);
  return matches ? matches.length : 0;
};

const normalizeWord = (value: string) =>
  value
    .toLocaleLowerCase('de-DE')
    .normalize('NFC')
    .replace(/[’']/g, '');

const pickOriginalText = (versions: Session[], fallback: string) => {
  if (versions.length === 0) return fallback;
  const ordered = [...versions].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  return ordered[0]?.text ?? fallback;
};

const tokenizeWords = (value: string): WordHit[] => {
  const hits: WordHit[] = [];
  Array.from(value.matchAll(WORD_RE)).forEach((match) => {
    const raw = match[0];
    const start = match.index ?? 0;
    const normalized = normalizeWord(raw);
    if (!normalized) return;
    hits.push({
      raw,
      normalized,
      start,
      end: start + raw.length,
    });
  });
  return hits;
};

const summarizeWords = (words: WordHit[]) => {
  const map = new Map<string, WordSummary>();
  words.forEach((word) => {
    const entry = map.get(word.normalized) ?? {
      word: word.normalized,
      count: 0,
      hits: [],
    };
    entry.count += 1;
    entry.hits.push({ start: word.start, end: word.end });
    map.set(word.normalized, entry);
  });

  return Array.from(map.values()).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.word.localeCompare(b.word, 'de');
  });
};

const splitSentences = (value: string): SentenceInfo[] => {
  const normalized = value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (!normalized.trim()) return [];

  const SegmenterCtor = (
    Intl as unknown as {
      Segmenter?: new (...args: unknown[]) => {
        segment: (input: string) => Iterable<{ segment: string; index: number }>;
      };
    }
  ).Segmenter;

  if (SegmenterCtor) {
    const segmenter = new SegmenterCtor('de', { granularity: 'sentence' });
    const sentences = Array.from(segmenter.segment(normalized))
      .map((entry) => {
        const leading = entry.segment.search(/\S/);
        if (leading < 0) return null;
        const trimmed = entry.segment.trim();
        const start = entry.index + leading;
        return {
          text: trimmed,
          start,
          end: start + trimmed.length,
          words: tokenizeWords(trimmed).length,
        };
      })
      .filter((entry): entry is SentenceInfo => Boolean(entry));
    if (sentences.length > 0) return sentences;
  }

  const sentences: SentenceInfo[] = [];
  const regex = /[^.!?\n]+(?:[.!?]+|$)/g;
  Array.from(normalized.matchAll(regex)).forEach((match) => {
    const raw = match[0];
    const base = match.index ?? 0;
    const leading = raw.search(/\S/);
    if (leading < 0) return;
    const trimmed = raw.trim();
    const start = base + leading;
    sentences.push({
      text: trimmed,
      start,
      end: start + trimmed.length,
      words: tokenizeWords(trimmed).length,
    });
  });
  return sentences;
};

const splitParagraphs = (value: string): ParagraphInfo[] => {
  const paragraphs: ParagraphInfo[] = [];
  const normalized = value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const regex = /\S[\s\S]*?(?=\n\s*\n|$)/g;

  Array.from(normalized.matchAll(regex)).forEach((match) => {
    const raw = match[0];
    const base = match.index ?? 0;
    const trimmedEnd = raw.search(/\s+$/);
    const text = trimmedEnd >= 0 ? raw.slice(0, trimmedEnd) : raw;
    if (!text.trim()) return;
    paragraphs.push({
      text,
      start: base,
      end: base + text.length,
      words: tokenizeWords(text).length,
    });
  });

  return paragraphs;
};

const buildAnalysis = (value: string, adverbWords: string[]): CheckAnalysis => {
  const words = tokenizeWords(value);
  const adverbSet = new Set(adverbWords.map(normalizeWord).filter(Boolean));
  return {
    repetitions: summarizeWords(words).filter((entry) => entry.count > 1).slice(0, 40),
    adverbs: summarizeWords(words.filter((word) => adverbSet.has(word.normalized))),
    sentences: splitSentences(value),
    paragraphs: splitParagraphs(value),
  };
};

const loadCustomAdverbs = () => {
  if (typeof window === 'undefined') return [] as string[];
  try {
    const raw = window.localStorage.getItem(ADVERB_STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  } catch {
    return [];
  }
};

const saveCustomAdverbs = (words: string[]) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ADVERB_STORE_KEY, JSON.stringify(words));
  } catch {
    // local preferences are optional
  }
};

const clampRange = (range: TextRange, max: number) => ({
  start: Math.max(0, Math.min(range.start, max)),
  end: Math.max(0, Math.min(range.end, max)),
});

const renderHighlightedText = (value: string, ranges: TextRange[]) => {
  if (ranges.length === 0) return value;
  const ordered = ranges
    .map((range) => clampRange(range, value.length))
    .filter((range) => range.end > range.start)
    .sort((a, b) => a.start - b.start);

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  ordered.forEach((range, index) => {
    if (range.start > cursor) {
      parts.push(value.slice(cursor, range.start));
    }
    parts.push(
      <mark
        key={`${range.start}-${range.end}-${index}`}
        className="rounded-[3px] bg-[#c9a55f]/30 text-[#f7f4ed] outline outline-1 outline-[#d7b46d]/45"
      >
        {value.slice(range.start, range.end)}
      </mark>,
    );
    cursor = Math.max(cursor, range.end);
  });
  if (cursor < value.length) {
    parts.push(value.slice(cursor));
  }
  return parts;
};

export default function SessionEditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeParam = searchParams?.get('active');
  const activeId = activeParam ? Number(activeParam) : NaN;

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const highlightRef = useRef<HTMLPreElement | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analysisTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedTextRef = useRef('');
  const sessionRef = useRef<Session | null>(null);
  const skipLoadForSessionIdRef = useRef<number | null>(null);
  const historyRef = useRef<EditorSnapshot[]>([]);
  const historyIndexRef = useRef(0);
  const compareSelectionRef = useRef<{ start: number; end: number; scrollTop: number } | null>(
    null,
  );

  const [session, setSession] = useState<Session | null>(null);
  const [text, setText] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [isComparingOriginal, setIsComparingOriginal] = useState(false);
  const [history, setHistory] = useState<EditorSnapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [checkOpen, setCheckOpen] = useState(false);
  const [activeCheck, setActiveCheck] = useState<ActiveCheck | null>(null);
  const [showAllRepetitions, setShowAllRepetitions] = useState(false);
  const [showAdverbList, setShowAdverbList] = useState(false);
  const [showSentenceList, setShowSentenceList] = useState(false);
  const [showParagraphList, setShowParagraphList] = useState(false);
  const [customAdverbs, setCustomAdverbs] = useState<string[]>([]);
  const [adverbDraft, setAdverbDraft] = useState('');
  const [analysis, setAnalysis] = useState<CheckAnalysis>(() =>
    buildAnalysis('', DEFAULT_ADVERB_WORDS),
  );

  const adverbWords = useMemo(
    () => Array.from(new Set([...DEFAULT_ADVERB_WORDS, ...customAdverbs].map(normalizeWord))).sort(),
    [customAdverbs],
  );

  useEffect(() => {
    setCustomAdverbs(loadCustomAdverbs());
  }, []);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);

  useEffect(() => {
    if (analysisTimerRef.current) {
      clearTimeout(analysisTimerRef.current);
    }
    analysisTimerRef.current = setTimeout(() => {
      setAnalysis(buildAnalysis(text, adverbWords));
    }, 220);
    return () => {
      if (analysisTimerRef.current) {
        clearTimeout(analysisTimerRef.current);
      }
    };
  }, [adverbWords, text]);

  useEffect(() => {
    if (!checkOpen) {
      setActiveCheck(null);
    }
  }, [checkOpen]);

  const resetHistory = useCallback((nextText: string) => {
    const nextHistory = [{ text: nextText }];
    historyRef.current = nextHistory;
    historyIndexRef.current = 0;
    setHistory(nextHistory);
    setHistoryIndex(0);
  }, []);

  const pushHistory = useCallback((nextText: string) => {
    const current = historyRef.current[historyIndexRef.current];
    if (current?.text === nextText) return;

    const nextHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    nextHistory.push({ text: nextText });
    historyRef.current = nextHistory;
    historyIndexRef.current = nextHistory.length - 1;
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  }, []);

  const loadOriginalText = useCallback(async (baseSession: Session) => {
    const fallbackText = baseSession.text ?? '';

    if (baseSession.document_id) {
      const response = await getDocumentVersions(baseSession.document_id, 200, 0, false);
      return pickOriginalText(response.data, fallbackText);
    }

    const chain: Session[] = [baseSession];
    let cursor = baseSession.parent_id;
    let guard = 0;
    while (cursor && guard < 50) {
      // eslint-disable-next-line no-await-in-loop
      const parent = await getSession(cursor);
      chain.push(parent);
      cursor = parent.parent_id ?? null;
      guard += 1;
    }

    return pickOriginalText(chain, fallbackText);
  }, []);

  const loadSession = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);
      setSaveState('idle');
      try {
        const data = await getSession(id);
        const rawText = data.text ?? '';
        const stableOriginal = await loadOriginalText(data);

        setSession(data);
        setText(rawText);
        setOriginalText(stableOriginal);
        setAnalysis(buildAnalysis(rawText, adverbWords));
        lastSavedTextRef.current = rawText;
        resetHistory(rawText);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Session konnte nicht geladen werden.',
        );
      } finally {
        setLoading(false);
      }
    },
    [adverbWords, loadOriginalText, resetHistory],
  );

  useEffect(() => {
    if (!activeParam) return;
    if (Number.isNaN(activeId)) {
      setError('Ungültige Session-ID in der URL.');
      return;
    }
    if (skipLoadForSessionIdRef.current === activeId) {
      skipLoadForSessionIdRef.current = null;
      return;
    }
    void loadSession(activeId);
  }, [activeId, activeParam, loadSession]);

  const persistText = useCallback(async (nextText: string) => {
    const activeSession = sessionRef.current;
    if (!activeSession || nextText === lastSavedTextRef.current) return;
    if (nextText.trim().length === 0) {
      setSaveState('error');
      setError('Leerer Text kann vom bestehenden Speicher-Endpunkt nicht gespeichert werden.');
      return;
    }

    setSaveState('saving');
    setError(null);
    try {
      const created = await createEdit(activeSession.id, nextText, {
        eventType: 'live_input',
      });
      const savedText = created.text ?? nextText;

      sessionRef.current = created;
      setSession(created);
      setText((current) => (current === nextText ? savedText : current));
      lastSavedTextRef.current = savedText;
      setSaveState('saved');

      if (!Number.isNaN(created.id) && created.id !== activeSession.id) {
        skipLoadForSessionIdRef.current = created.id;
        router.replace(`/session/edit?active=${created.id}`, { scroll: false });
      }
    } catch (err) {
      setSaveState('error');
      setError(err instanceof Error ? err.message : 'Änderung konnte nicht gespeichert werden.');
    }
  }, [router]);

  useEffect(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    if (!session || text === lastSavedTextRef.current) return;

    setSaveState('idle');
    saveTimerRef.current = setTimeout(() => {
      void persistText(text);
    }, 1200);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [persistText, session, text]);

  const handleTextChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const nextText = event.target.value;
      setText(nextText);
      pushHistory(nextText);
    },
    [pushHistory],
  );

  const applySnapshot = useCallback((snapshot: EditorSnapshot) => {
    setText(snapshot.text);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, []);

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    const nextIndex = historyIndexRef.current - 1;
    const snapshot = historyRef.current[nextIndex];
    if (!snapshot) return;
    historyIndexRef.current = nextIndex;
    setHistoryIndex(nextIndex);
    applySnapshot(snapshot);
  }, [applySnapshot]);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    const nextIndex = historyIndexRef.current + 1;
    const snapshot = historyRef.current[nextIndex];
    if (!snapshot) return;
    historyIndexRef.current = nextIndex;
    setHistoryIndex(nextIndex);
    applySnapshot(snapshot);
  }, [applySnapshot]);

  const rememberTextareaPosition = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    compareSelectionRef.current = {
      start: textarea.selectionStart ?? 0,
      end: textarea.selectionEnd ?? 0,
      scrollTop: textarea.scrollTop,
    };
  }, []);

  const showOriginal = useCallback(() => {
    rememberTextareaPosition();
    setIsComparingOriginal(true);
  }, [rememberTextareaPosition]);

  const showCurrent = useCallback(() => {
    setIsComparingOriginal(false);
  }, []);

  const syncHighlightScroll = useCallback(() => {
    if (highlightRef.current && textareaRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const jumpToRange = useCallback((range: TextRange) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const safe = clampRange(range, textarea.value.length);
    textarea.focus();
    textarea.setSelectionRange(safe.start, safe.end);
    const before = textarea.value.slice(0, safe.start);
    const line = before.split('\n').length - 1;
    const lineHeight = Number.parseFloat(window.getComputedStyle(textarea).lineHeight) || 32;
    textarea.scrollTop = Math.max(0, line * lineHeight - textarea.clientHeight / 3);
    syncHighlightScroll();
  }, [syncHighlightScroll]);

  const toggleCheck = useCallback(
    (next: ActiveCheck) => {
      setActiveCheck((current) => {
        if (current?.key === next.key) return null;
        requestAnimationFrame(() => {
          jumpToRange(next.ranges[0]);
        });
        return next;
      });
    },
    [jumpToRange],
  );

  const handleAddAdverb = useCallback(() => {
    const normalized = normalizeWord(adverbDraft.trim());
    if (!normalized) return;
    setCustomAdverbs((current) => {
      if (current.map(normalizeWord).includes(normalized)) return current;
      const next = [...current, normalized].sort((a, b) => a.localeCompare(b, 'de'));
      saveCustomAdverbs(next);
      return next;
    });
    setAdverbDraft('');
  }, [adverbDraft]);

  const handleRemoveCustomAdverb = useCallback((word: string) => {
    setCustomAdverbs((current) => {
      const next = current.filter((item) => normalizeWord(item) !== normalizeWord(word));
      saveCustomAdverbs(next);
      return next;
    });
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    const savedPosition = compareSelectionRef.current;
    if (!textarea || !savedPosition) return;

    const max = textarea.value.length;
    const start = Math.min(savedPosition.start, max);
    const end = Math.min(savedPosition.end, max);

    requestAnimationFrame(() => {
      textarea.scrollTop = savedPosition.scrollTop;
      textarea.setSelectionRange(start, end);
      syncHighlightScroll();
      if (!isComparingOriginal) {
        textarea.focus();
      }
    });
  }, [isComparingOriginal, syncHighlightScroll]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      if (analysisTimerRef.current) {
        clearTimeout(analysisTimerRef.current);
      }
    };
  }, []);

  const visibleText = isComparingOriginal ? originalText : text;
  const wordCount = useMemo(() => countWords(text), [text]);
  const canUndo = historyIndex > 0 && !isComparingOriginal;
  const canRedo = historyIndex < history.length - 1 && !isComparingOriginal;
  const highlightRanges = checkOpen && !isComparingOriginal && activeCheck ? activeCheck.ranges : [];
  const repeatedWords = showAllRepetitions
    ? analysis.repetitions
    : analysis.repetitions.slice(0, 5);
  const longestSentence = analysis.sentences.reduce(
    (longest, sentence) => Math.max(longest, sentence.words),
    0,
  );
  const averageSentence =
    analysis.sentences.length > 0
      ? analysis.sentences.reduce((sum, sentence) => sum + sentence.words, 0) /
        analysis.sentences.length
      : 0;
  const maxSentenceWords = Math.max(longestSentence, 1);
  const saveLabel =
    saveState === 'saving'
      ? 'Speichert...'
      : saveState === 'saved'
        ? 'Gespeichert'
        : saveState === 'error'
          ? 'Nicht gespeichert'
          : text !== lastSavedTextRef.current
            ? 'Ungespeichert'
            : 'Gespeichert';

  if (!activeParam) {
    return (
      <main className="min-h-screen bg-[#0b0a09] text-[#f7f4ed]">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <div className="border border-[#2f2822] bg-[#120f0c] p-8 text-center">
            <h1 className="text-2xl font-semibold text-[#fdfbf7]">
              Keine Session ausgewählt
            </h1>
            <p className="mt-2 text-sm text-[#cbbfb0]">
              Bitte öffne eine Session aus dem Archiv.
            </p>
            <Link
              href="/session"
              className="mt-6 inline-flex items-center gap-2 border border-[#2f2822] bg-[#18130f] px-3 py-2 text-sm font-semibold text-[#f7f4ed] hover:bg-[#211a13]"
            >
              <ArrowLeft size={16} /> Zurück
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0a09] text-[#f7f4ed]">
      <div className="mx-auto flex min-h-screen max-w-[1380px] flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="grid items-center gap-3 text-sm lg:grid-cols-[1fr_auto_1fr]">
          <Link
            href="/session"
            className="inline-flex h-10 w-fit items-center gap-2 px-1 text-[#cbbfb0] hover:text-[#f7f4ed] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d7b46d]"
          >
            <ArrowLeft size={17} /> Zurück
          </Link>

          <h1 className="hidden text-center text-xl font-semibold text-[#fdfbf7] lg:block">
            Überarbeiten
          </h1>

          <div className="flex items-center justify-start gap-1 sm:gap-2 lg:justify-end">
            <button
              type="button"
              onPointerDown={(event) => {
                event.preventDefault();
                showOriginal();
              }}
              onPointerUp={showCurrent}
              onPointerLeave={showCurrent}
              onPointerCancel={showCurrent}
              onKeyDown={(event) => {
                if (event.key === ' ' || event.key === 'Enter') {
                  event.preventDefault();
                  showOriginal();
                }
              }}
              onKeyUp={(event) => {
                if (event.key === ' ' || event.key === 'Enter') {
                  event.preventDefault();
                  showCurrent();
                }
              }}
              disabled={loading || originalText.length === 0}
              className={`h-10 px-3 text-sm text-[#f7f4ed] transition disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d7b46d] ${
                isComparingOriginal ? 'bg-[#2b2218]' : 'hover:bg-[#18130f]'
              }`}
            >
              Original
            </button>
            <button
              type="button"
              onClick={() => setCheckOpen((current) => !current)}
              aria-expanded={checkOpen}
              aria-controls="check-sidebar"
              className={`inline-flex h-10 items-center gap-2 border px-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d7b46d] ${
                checkOpen
                  ? 'border-[#d7b46d] bg-[#241b0f] text-[#f5cf82]'
                  : 'border-transparent text-[#f7f4ed] hover:bg-[#18130f]'
              }`}
            >
              <SlidersHorizontal size={16} /> Prüfen
            </button>
            <button
              type="button"
              onClick={handleUndo}
              disabled={!canUndo}
              title="Undo"
              className="inline-flex h-10 items-center gap-2 px-3 text-sm text-[#f7f4ed] hover:bg-[#18130f] disabled:opacity-35 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d7b46d]"
            >
              <Undo2 size={16} /> Undo
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={!canRedo}
              title="Redo"
              className="inline-flex h-10 items-center gap-2 px-3 text-sm text-[#f7f4ed] hover:bg-[#18130f] disabled:opacity-35 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d7b46d]"
            >
              <Redo2 size={16} /> Redo
            </button>
          </div>
        </header>

        {error && (
          <div className="mt-4 border border-red-900/60 bg-red-950/60 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        <div className="flex flex-1 flex-col gap-6 pt-8 lg:flex-row lg:pt-10">
          <section className="flex min-w-0 flex-1 flex-col">
            <h1 className="text-center text-xl font-semibold text-[#fdfbf7] lg:hidden">
              Überarbeiten
            </h1>

            <div className="relative mt-8 min-h-[62vh] flex-1 sm:mt-10 lg:mt-0">
              <pre
                ref={highlightRef}
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words border-0 bg-transparent px-0 py-0 font-serif text-[18px] leading-8 sm:text-[19px] sm:leading-9 ${
                  highlightRanges.length > 0 ? 'text-[#f7f4ed]' : 'text-transparent'
                }`}
              >
                {highlightRanges.length > 0
                  ? renderHighlightedText(visibleText, highlightRanges)
                  : visibleText}
              </pre>
              <textarea
                ref={textareaRef}
                value={visibleText}
                onChange={handleTextChange}
                onScroll={syncHighlightScroll}
                readOnly={loading || isComparingOriginal}
                placeholder={loading ? 'Lade Session...' : 'Text bearbeiten'}
                spellCheck
                className={`relative z-10 min-h-[62vh] w-full flex-1 resize-none border-0 bg-transparent px-0 py-0 font-serif text-[18px] leading-8 outline-none placeholder:text-[#6f665b] sm:text-[19px] sm:leading-9 ${
                  highlightRanges.length > 0
                    ? 'text-transparent caret-[#f5cf82] selection:bg-[#d7b46d]/35'
                    : 'text-[#f7f4ed]'
                }`}
              />
            </div>

            <div className="flex items-center justify-between gap-4 pb-5 pt-3 text-xs text-[#8f8578]">
              <div className="flex items-center gap-4">
                <span>{wordCount} Wörter</span>
              </div>
              <span>{saveLabel}</span>
            </div>
          </section>

          {checkOpen && (
            <aside
              id="check-sidebar"
              aria-label="Prüfen"
              className="w-full shrink-0 border-t border-[#2f2822] pt-4 lg:w-[340px] lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a79d91]">
                  Prüfen
                </h2>
                <button
                  type="button"
                  onClick={() => setCheckOpen(false)}
                  aria-label="Prüfen schließen"
                  className="p-2 text-[#cbbfb0] hover:text-[#f7f4ed] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d7b46d]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <section className="border border-[#2f2822] bg-[#11100e]/80">
                  <div className="border-b border-[#2f2822] px-3 py-3">
                    <h3 className="font-semibold text-[#f7f4ed]">1. Wiederholungen</h3>
                  </div>
                  <div className="py-2">
                    {repeatedWords.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-[#a79d91]">
                        Keine mehrfachen Wörter gefunden.
                      </p>
                    ) : (
                      repeatedWords.map((entry) => (
                        <button
                          key={entry.word}
                          type="button"
                          onClick={() =>
                            toggleCheck({
                              type: 'word',
                              key: `repeat:${entry.word}`,
                              label: entry.word,
                              ranges: entry.hits,
                            })
                          }
                          className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d7b46d] ${
                            activeCheck?.key === `repeat:${entry.word}`
                              ? 'bg-[#231b10] text-[#f5cf82]'
                              : 'text-[#f7f4ed] hover:bg-[#18130f]'
                          }`}
                        >
                          <span>{entry.word}</span>
                          <span className="inline-flex items-center gap-2 text-[#f5cf82]">
                            {entry.count}× <ChevronRight size={14} />
                          </span>
                        </button>
                      ))
                    )}
                    {analysis.repetitions.length > 5 && (
                      <button
                        type="button"
                        onClick={() => setShowAllRepetitions((current) => !current)}
                        className="flex w-full items-center justify-between border-t border-[#2f2822] px-3 py-2 text-left text-sm text-[#a79d91] hover:bg-[#18130f] hover:text-[#f7f4ed] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d7b46d]"
                      >
                        {showAllRepetitions ? 'Weniger anzeigen' : 'Weitere anzeigen'}
                        <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                </section>

                <section className="border border-[#2f2822] bg-[#11100e]/80">
                  <div className="flex items-center justify-between border-b border-[#2f2822] px-3 py-3">
                    <h3 className="font-semibold text-[#f7f4ed]">
                      2. Adverbien / Verstärker
                    </h3>
                    <span className="text-sm font-semibold text-[#f5cf82]">
                      {analysis.adverbs.reduce((sum, entry) => sum + entry.count, 0)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAdverbList((current) => !current)}
                    className="flex w-full items-center justify-between border-b border-[#2f2822] px-3 py-2 text-left text-sm text-[#cbbfb0] hover:bg-[#18130f] hover:text-[#f7f4ed] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d7b46d]"
                  >
                    Liste anzeigen
                    <ChevronRight size={14} />
                  </button>
                  {showAdverbList && (
                    <div className="py-2">
                      {analysis.adverbs.length === 0 ? (
                        <p className="px-3 py-2 text-sm text-[#a79d91]">
                          Keine Wörter aus der Beobachtungsliste gefunden.
                        </p>
                      ) : (
                        analysis.adverbs.map((entry) => (
                          <button
                            key={`adverb-${entry.word}`}
                            type="button"
                            onClick={() =>
                              toggleCheck({
                                type: 'word',
                                key: `adverb:${entry.word}`,
                                label: entry.word,
                                ranges: entry.hits,
                              })
                            }
                            className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d7b46d] ${
                              activeCheck?.key === `adverb:${entry.word}`
                                ? 'bg-[#231b10] text-[#f5cf82]'
                                : 'text-[#f7f4ed] hover:bg-[#18130f]'
                            }`}
                          >
                            <span>{entry.word}</span>
                            <span className="inline-flex items-center gap-2 text-[#f5cf82]">
                              {entry.count}× <ChevronRight size={14} />
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                  <details className="group border-t border-[#2f2822]">
                    <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-sm text-[#cbbfb0] hover:bg-[#18130f] hover:text-[#f7f4ed] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d7b46d]">
                      Eigene Wörter verwalten
                      <ChevronRight size={14} className="transition group-open:rotate-90" />
                    </summary>
                    <div className="space-y-3 px-3 pb-3 pt-1">
                      <div className="flex gap-2">
                        <input
                          value={adverbDraft}
                          onChange={(event) => setAdverbDraft(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              handleAddAdverb();
                            }
                          }}
                          aria-label="Eigenes Beobachtungswort"
                          className="min-w-0 flex-1 border border-[#2f2822] bg-[#0b0a09] px-2 py-1.5 text-sm text-[#f7f4ed] outline-none focus:ring-2 focus:ring-[#d7b46d]"
                        />
                        <button
                          type="button"
                          onClick={handleAddAdverb}
                          aria-label="Wort hinzufügen"
                          className="border border-[#2f2822] px-2 text-[#f7f4ed] hover:bg-[#18130f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d7b46d]"
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                      {customAdverbs.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {customAdverbs.map((word) => (
                            <button
                              key={`custom-${word}`}
                              type="button"
                              onClick={() => handleRemoveCustomAdverb(word)}
                              className="border border-[#2f2822] px-2 py-1 text-xs text-[#cbbfb0] hover:bg-[#18130f] hover:text-[#f7f4ed] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d7b46d]"
                            >
                              {word} entfernen
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </details>
                </section>

                <section className="border border-[#2f2822] bg-[#11100e]/80">
                  <div className="border-b border-[#2f2822] px-3 py-3">
                    <h3 className="font-semibold text-[#f7f4ed]">3. Sätze</h3>
                  </div>
                  <div className="space-y-1 px-3 py-3 text-sm text-[#cbbfb0]">
                    <div className="flex justify-between">
                      <span>Anzahl Sätze</span>
                      <span className="text-[#f5cf82]">{analysis.sentences.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Längster Satz</span>
                      <span className="text-[#f5cf82]">{longestSentence} Wörter</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Durchschnitt</span>
                      <span className="text-[#f5cf82]">
                        {averageSentence.toLocaleString('de-DE', {
                          maximumFractionDigits: 1,
                        })}{' '}
                        Wörter
                      </span>
                    </div>
                    {analysis.sentences.length > 0 && (
                      <div className="flex h-12 items-end gap-1 pt-3" aria-hidden="true">
                        {analysis.sentences.slice(0, 48).map((sentence, index) => (
                          <button
                            key={`bar-${sentence.start}-${index}`}
                            type="button"
                            onClick={() =>
                              toggleCheck({
                                type: 'sentence',
                                key: `sentence:${index}`,
                                label: `Satz ${index + 1}`,
                                ranges: [{ start: sentence.start, end: sentence.end }],
                              })
                            }
                            className={`min-w-[3px] flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d7b46d] ${
                              activeCheck?.key === `sentence:${index}`
                                ? 'bg-[#f5cf82]'
                                : 'bg-[#8f8578]'
                            }`}
                            style={{
                              height: `${Math.max(16, (sentence.words / maxSentenceWords) * 100)}%`,
                            }}
                            aria-label={`Satz ${index + 1}, ${sentence.words} Wörter`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSentenceList((current) => !current)}
                    className="flex w-full items-center justify-between border-t border-[#2f2822] px-3 py-2 text-left text-sm text-[#cbbfb0] hover:bg-[#18130f] hover:text-[#f7f4ed] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d7b46d]"
                  >
                    Satzliste anzeigen
                    <ChevronRight size={14} />
                  </button>
                  {showSentenceList && (
                    <div className="max-h-56 overflow-auto border-t border-[#2f2822] py-2">
                      {analysis.sentences.map((sentence, index) => (
                        <button
                          key={`sentence-${sentence.start}-${index}`}
                          type="button"
                          onClick={() =>
                            toggleCheck({
                              type: 'sentence',
                              key: `sentence:${index}`,
                              label: `Satz ${index + 1}`,
                              ranges: [{ start: sentence.start, end: sentence.end }],
                            })
                          }
                          className={`w-full px-3 py-2 text-left text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d7b46d] ${
                            activeCheck?.key === `sentence:${index}`
                              ? 'bg-[#231b10] text-[#f5cf82]'
                              : 'text-[#cbbfb0] hover:bg-[#18130f] hover:text-[#f7f4ed]'
                          }`}
                        >
                          <span className="block text-xs text-[#8f8578]">
                            Satz {index + 1} · {sentence.words} Wörter
                          </span>
                          <span className="line-clamp-2">{sentence.text}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </section>

                <section className="border border-[#2f2822] bg-[#11100e]/80">
                  <div className="flex items-center justify-between border-b border-[#2f2822] px-3 py-3">
                    <h3 className="font-semibold text-[#f7f4ed]">4. Absätze</h3>
                    <span className="text-sm font-semibold text-[#f5cf82]">
                      {analysis.paragraphs.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowParagraphList((current) => !current)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-[#cbbfb0] hover:bg-[#18130f] hover:text-[#f7f4ed] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d7b46d]"
                  >
                    Absatzübersicht anzeigen
                    <ChevronRight size={14} />
                  </button>
                  {showParagraphList && (
                    <div className="max-h-56 overflow-auto border-t border-[#2f2822] py-2">
                      {analysis.paragraphs.map((paragraph, index) => (
                        <button
                          key={`paragraph-${paragraph.start}-${index}`}
                          type="button"
                          onClick={() =>
                            toggleCheck({
                              type: 'paragraph',
                              key: `paragraph:${index}`,
                              label: `Absatz ${index + 1}`,
                              ranges: [{ start: paragraph.start, end: paragraph.end }],
                            })
                          }
                          className={`w-full px-3 py-2 text-left text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d7b46d] ${
                            activeCheck?.key === `paragraph:${index}`
                              ? 'bg-[#231b10] text-[#f5cf82]'
                              : 'text-[#cbbfb0] hover:bg-[#18130f] hover:text-[#f7f4ed]'
                          }`}
                        >
                          <span className="block text-xs text-[#8f8578]">
                            Absatz {index + 1} · {paragraph.words} Wörter
                          </span>
                          <span className="line-clamp-2">
                            {paragraph.text.replace(/\s+/g, ' ')}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}
