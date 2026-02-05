
'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Undo2,
  Redo2,
  Search,
  Replace,
  RefreshCcw,
  ClipboardList,
  Sparkles,
  GitCompare,
} from 'lucide-react';

import type { AnalysisRun, Finding, Note, Session } from '@/lib/api/types';
import {
  createAnalysisRun,
  createEdit,
  createNote,
  deleteNote,
  getDocumentVersions,
  getFindings,
  getNotes,
  getSession,
  updateNote,
} from '@/lib/api/typewriterClient';

const ANALYSIS_ENGINE_VERSION = 'deterministic-v1';
const ANALYSIS_CONFIG: Record<string, unknown> = {};

type DiffLine = { type: 'equal' | 'insert' | 'delete'; text: string };

const formatDate = (value?: string) => {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium' }).format(
      new Date(value),
    );
  } catch {
    return value;
  }
};

const buildSnippet = (text: string, start: number, end: number, pad = 18) => {
  const safeStart = Math.max(0, start - pad);
  const safeEnd = Math.min(text.length, end + pad);
  return text.slice(safeStart, safeEnd).replace(/\s+/g, ' ').trim();
};

const buildHighlightSegments = (text: string, findings: Finding[]) => {
  if (!text || findings.length === 0) {
    return [{ text, finding: null as Finding | null }];
  }

  const sorted = [...findings]
    .filter((f) => f.start_offset < f.end_offset)
    .sort((a, b) => a.start_offset - b.start_offset);

  const segments: { text: string; finding: Finding | null }[] = [];
  let cursor = 0;

  for (const finding of sorted) {
    const start = Math.max(cursor, finding.start_offset);
    const end = Math.max(start, finding.end_offset);
    if (start > cursor) {
      segments.push({ text: text.slice(cursor, start), finding: null });
    }
    if (end > cursor) {
      segments.push({ text: text.slice(start, end), finding });
      cursor = end;
    }
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), finding: null });
  }

  return segments;
};

const computeLineDiff = (a: string, b: string) => {
  const aLines = a.split('\n');
  const bLines = b.split('\n');

  if (aLines.length * bLines.length > 500000) {
    return { tooLarge: true as const, lines: [] as DiffLine[] };
  }

  const dp: number[][] = Array.from({ length: aLines.length + 1 }, () =>
    Array(bLines.length + 1).fill(0),
  );

  for (let i = aLines.length - 1; i >= 0; i -= 1) {
    for (let j = bLines.length - 1; j >= 0; j -= 1) {
      if (aLines[i] === bLines[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const lines: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < aLines.length && j < bLines.length) {
    if (aLines[i] === bLines[j]) {
      lines.push({ type: 'equal', text: aLines[i] });
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      lines.push({ type: 'delete', text: aLines[i] });
      i += 1;
    } else {
      lines.push({ type: 'insert', text: bLines[j] });
      j += 1;
    }
  }

  while (i < aLines.length) {
    lines.push({ type: 'delete', text: aLines[i] });
    i += 1;
  }
  while (j < bLines.length) {
    lines.push({ type: 'insert', text: bLines[j] });
    j += 1;
  }

  return { tooLarge: false as const, lines };
};

export default function SessionEditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeParam = searchParams.get('active');
  const activeId = activeParam ? Number(activeParam) : NaN;

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [session, setSession] = useState<Session | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [versions, setVersions] = useState<Session[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);

  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const suppressHistoryRef = useRef(false);
  const historyRef = useRef(history);
  const historyIndexRef = useRef(historyIndex);

  const [findQuery, setFindQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [matchIndex, setMatchIndex] = useState(0);

  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(
    null,
  );

  const [analysisRun, setAnalysisRun] = useState<AnalysisRun | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [analysisStale, setAnalysisStale] = useState(false);
  const [findingToggles, setFindingToggles] = useState<Record<string, boolean>>(
    {},
  );

  const [activeTab, setActiveTab] = useState<'versions' | 'notes' | 'analysis' | 'diff'>(
    'versions',
  );
  const [diffA, setDiffA] = useState<number | null>(null);
  const [diffB, setDiffB] = useState<number | null>(null);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);
  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);

  const resetHistory = useCallback((value: string) => {
    setHistory([value]);
    setHistoryIndex(0);
    historyRef.current = [value];
    historyIndexRef.current = 0;
  }, []);

  const pushHistory = useCallback((value: string) => {
    const next = historyRef.current.slice(0, historyIndexRef.current + 1);
    next.push(value);
    historyRef.current = next;
    historyIndexRef.current = next.length - 1;
    setHistory(next);
    setHistoryIndex(next.length - 1);
  }, []);

  const loadSession = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSession(id);
        setSession(data);
        suppressHistoryRef.current = true;
        setText(data.text ?? '');
        resetHistory(data.text ?? '');
        setFindings([]);
        setAnalysisRun(null);
        setAnalysisStale(false);
        setFindingToggles({});
        await Promise.all([loadVersions(data), loadNotes(data, data.text ?? '')]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Session konnte nicht geladen werden.',
        );
      } finally {
        setLoading(false);
        suppressHistoryRef.current = false;
      }
    },
    [loadNotes, loadVersions, resetHistory],
  );

  const loadVersions = useCallback(async (baseSession: Session) => {
    setVersionsLoading(true);
    try {
      if (baseSession.document_id) {
        const response = await getDocumentVersions(baseSession.document_id, 200, 0);
        const ordered = [...response.data].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        setVersions(ordered);
        if (ordered.length > 1) {
          setDiffA(ordered[0].id);
          setDiffB(ordered[1].id);
        } else {
          setDiffA(ordered[0]?.id ?? null);
          setDiffB(null);
        }
        return;
      }

      const chain: Session[] = [baseSession];
      let cursor = baseSession.parent_id;
      let guard = 0;
      while (cursor && guard < 20) {
        // eslint-disable-next-line no-await-in-loop
        const parent = await getSession(cursor);
        chain.push(parent);
        cursor = parent.parent_id ?? null;
        guard += 1;
      }
      setVersions(chain);
      if (chain.length > 1) {
        setDiffA(chain[0].id);
        setDiffB(chain[1].id);
      } else {
        setDiffA(chain[0]?.id ?? null);
        setDiffB(null);
      }
    } catch (err) {
      console.error('Versionen konnten nicht geladen werden', err);
    } finally {
      setVersionsLoading(false);
    }
  }, []);

  const loadNotes = useCallback(async (baseSession: Session, activeText: string) => {
    setNotesLoading(true);
    try {
      // Offsets are JS string indices (UTF-16). This matches textarea selection offsets.
      const data = await getNotes(baseSession.id, 0, activeText.length);
      setNotes(data);
    } catch (err) {
      console.error('Notizen konnten nicht geladen werden', err);
    } finally {
      setNotesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!activeParam) return;
    if (Number.isNaN(activeId)) {
      setError('Ungültige Session-ID in der URL.');
      return;
    }
    void loadSession(activeId);
  }, [activeId, activeParam, loadSession]);

  useEffect(() => {
    if (!session) return;
    const dirty = text !== (session.text ?? '');
    if (analysisRun && dirty) {
      setAnalysisStale(true);
    }
  }, [analysisRun, session, text]);

  const wordCount = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).filter(Boolean).length;
  }, [text]);

  const matchPositions = useMemo(() => {
    if (!findQuery) return [];
    const needle = caseSensitive ? findQuery : findQuery.toLowerCase();
    if (!needle) return [];
    const haystack = caseSensitive ? text : text.toLowerCase();
    const result: number[] = [];
    let idx = 0;
    while (idx <= haystack.length) {
      const hit = haystack.indexOf(needle, idx);
      if (hit === -1) break;
      result.push(hit);
      idx = hit + Math.max(needle.length, 1);
    }
    return result;
  }, [caseSensitive, findQuery, text]);

  const visibleFindings = useMemo(() => {
    const enabledTypes = Object.keys(findingToggles).filter(
      (key) => findingToggles[key],
    );
    if (Object.keys(findingToggles).length === 0) return findings;
    if (enabledTypes.length === 0) return [];
    return findings.filter((finding) => findingToggles[finding.finding_type]);
  }, [findingToggles, findings]);

  const highlightedSegments = useMemo(
    () => buildHighlightSegments(text, visibleFindings),
    [text, visibleFindings],
  );

  const diffData = useMemo(() => {
    if (activeTab !== 'diff') return null;
    const left = versions.find((v) => v.id === diffA);
    const right = versions.find((v) => v.id === diffB);
    if (!left || !right) return null;
    return {
      left,
      right,
      diff: computeLineDiff(left.text ?? '', right.text ?? ''),
    };
  }, [activeTab, diffA, diffB, versions]);

  const handleTextChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const next = event.target.value;
      setText(next);
      if (suppressHistoryRef.current) {
        suppressHistoryRef.current = false;
        return;
      }
      pushHistory(next);
    },
    [pushHistory],
  );

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    const nextIndex = historyIndexRef.current - 1;
    const nextValue = historyRef.current[nextIndex];
    suppressHistoryRef.current = true;
    setText(nextValue);
    setHistoryIndex(nextIndex);
  }, []);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    const nextIndex = historyIndexRef.current + 1;
    const nextValue = historyRef.current[nextIndex];
    suppressHistoryRef.current = true;
    setText(nextValue);
    setHistoryIndex(nextIndex);
  }, []);

  const handleSave = useCallback(async () => {
    if (!session) return;
    setSaving(true);
    setError(null);
    try {
      const created = await createEdit(session.id, text);
      setSession(created);
      suppressHistoryRef.current = true;
      setText(created.text ?? '');
      resetHistory(created.text ?? '');
      setFindings([]);
      setAnalysisRun(null);
      setAnalysisStale(false);
      setFindingToggles({});
      setNotes([]);
      if (!Number.isNaN(created.id)) {
        router.replace(`/session/edit?active=${created.id}`);
      }
      await Promise.all([loadVersions(created), loadNotes(created, created.text ?? '')]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Speichern der Version fehlgeschlagen.',
      );
    } finally {
      setSaving(false);
      suppressHistoryRef.current = false;
    }
  }, [loadNotes, loadVersions, resetHistory, router, session, text]);

  const handleFindNext = useCallback(() => {
    if (!matchPositions.length) return;
    const nextIndex = matchIndex % matchPositions.length;
    const start = matchPositions[nextIndex];
    const end = start + findQuery.length;
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(start, end);
    }
    setMatchIndex((prev) => (prev + 1) % matchPositions.length);
  }, [findQuery.length, matchIndex, matchPositions]);

  const handleReplace = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea || !findQuery) return;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const selected = text.slice(start, end);
    const needle = caseSensitive ? findQuery : findQuery.toLowerCase();
    const hay = caseSensitive ? selected : selected.toLowerCase();

    if (selected && hay === needle) {
      const next = `${text.slice(0, start)}${replaceQuery}${text.slice(end)}`;
      setText(next);
      pushHistory(next);
      const cursor = start + replaceQuery.length;
      textarea.setSelectionRange(cursor, cursor);
      return;
    }
    handleFindNext();
  }, [caseSensitive, findQuery, handleFindNext, pushHistory, replaceQuery, text]);

  const handleReplaceAll = useCallback(() => {
    if (!findQuery) return;
    const needle = caseSensitive ? findQuery : findQuery.toLowerCase();
    const source = caseSensitive ? text : text.toLowerCase();
    if (!needle || !source.includes(needle)) return;
    let next = '';
    let idx = 0;
    while (idx < source.length) {
      const hit = source.indexOf(needle, idx);
      if (hit === -1) {
        next += text.slice(idx);
        break;
      }
      next += text.slice(idx, hit) + replaceQuery;
      idx = hit + needle.length;
    }
    setText(next);
    pushHistory(next);
  }, [caseSensitive, findQuery, pushHistory, replaceQuery, text]);

  const handleSelection = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    if (start === end) {
      setSelection(null);
      return;
    }
    setSelection({ start, end });
  }, []);

  const handleAddNote = useCallback(async () => {
    if (!session || !selection) return;
    const note = noteDraft.trim();
    if (!note) return;
    try {
      await createNote(session.id, {
        start_offset: selection.start,
        end_offset: selection.end,
        note,
      });
      setNoteDraft('');
      await loadNotes(session, text);
    } catch (err) {
      console.error('Notiz konnte nicht gespeichert werden', err);
    }
  }, [loadNotes, noteDraft, selection, session, text]);

  const handleUpdateNote = useCallback(
    async (noteId: number) => {
      const note = editingNoteText.trim();
      if (!note) return;
      try {
        await updateNote(noteId, { note });
        setEditingNoteId(null);
        setEditingNoteText('');
        if (session) {
          await loadNotes(session, text);
        }
      } catch (err) {
        console.error('Notiz konnte nicht aktualisiert werden', err);
      }
    },
    [editingNoteText, loadNotes, session, text],
  );

  const handleDeleteNote = useCallback(
    async (noteId: number) => {
      try {
        await deleteNote(noteId);
        if (session) {
          await loadNotes(session, text);
        }
      } catch (err) {
        console.error('Notiz konnte nicht gelöscht werden', err);
      }
    },
    [loadNotes, session, text],
  );

  const handleJumpToRange = useCallback(
    (start: number, end: number) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(start, end);
      requestAnimationFrame(() => {
        const styles = window.getComputedStyle(textarea);
        const fontSize = Number.parseFloat(styles.fontSize || '16');
        const parsedLineHeight = Number.parseFloat(styles.lineHeight || '');
        const lineHeight = Number.isFinite(parsedLineHeight)
          ? parsedLineHeight
          : Math.round(fontSize * 1.5);
        const paddingTop = Number.parseFloat(styles.paddingTop || '0') || 0;
        const before = textarea.value.slice(0, start);
        const lineCount = (before.match(/\n/g) || []).length;
        const target = lineCount * lineHeight + paddingTop;
        const nextScrollTop = Math.max(0, target - textarea.clientHeight / 3);
        textarea.scrollTop = nextScrollTop;
        textarea.scrollIntoView({ block: 'center' });
      });
    },
    [],
  );

  const handleRunAnalysis = useCallback(async () => {
    if (!session) return;
    setAnalysisLoading(true);
    setAnalysisError(null);
    try {
      const run = await createAnalysisRun(
        session.id,
        ANALYSIS_ENGINE_VERSION,
        ANALYSIS_CONFIG,
      );
      setAnalysisRun(run);
      setAnalysisStale(false);
      const data = await getFindings(run.id, 0, text.length);
      setFindings(data);
      const nextToggles: Record<string, boolean> = {};
      data.forEach((finding) => {
        nextToggles[finding.finding_type] = true;
      });
      setFindingToggles(nextToggles);
    } catch (err) {
      setAnalysisError(
        err instanceof Error ? err.message : 'Hinweise konnten nicht erstellt werden.',
      );
    } finally {
      setAnalysisLoading(false);
    }
  }, [session, text.length]);

  if (!activeParam) {
    return (
      <main className="min-h-screen bg-[#0b0a09] text-[#f7f4ed]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
          <div className="rounded-2xl border border-[#2f2822] bg-[#120f0c] p-8 text-center">
            <h1 className="text-2xl font-semibold text-[#fdfbf7]">
              Keine Session ausgewählt
            </h1>
            <p className="mt-2 text-sm text-[#cbbfb0]">
              Bitte öffne eine Session aus dem Archiv.
            </p>
            <Link
              href="/session"
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#2f2822] bg-[#18130f] px-3 py-2 text-sm font-semibold text-[#f7f4ed] hover:bg-[#211a13]"
            >
              <ArrowLeft size={16} /> Zur Übersicht
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0a09] text-[#f7f4ed]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="space-y-2">
            <Link
              href="/session"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#cbbfb0] font-semibold"
            >
              <ArrowLeft size={14} /> Zur Übersicht
            </Link>
            <h1 className="text-3xl sm:text-4xl font-semibold text-[#fdfbf7]">
              Session Editor
            </h1>
            <p className="text-sm text-[#d6c9ba] max-w-3xl">
              Hinweise sind heuristisch und optional. Speichern erzeugt immer eine neue
              Version.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="inline-flex items-center gap-2 rounded-lg border border-[#2f2822] bg-[#18130f] px-3 py-2 text-sm text-[#f7f4ed] hover:bg-[#211a13] disabled:opacity-40"
            >
              <Undo2 size={16} /> Undo
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="inline-flex items-center gap-2 rounded-lg border border-[#2f2822] bg-[#18130f] px-3 py-2 text-sm text-[#f7f4ed] hover:bg-[#211a13] disabled:opacity-40"
            >
              <Redo2 size={16} /> Redo
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="inline-flex items-center gap-2 rounded-lg border border-[#3a3129] bg-[#221b13] px-4 py-2 text-sm font-semibold text-[#f7f4ed] hover:bg-[#2b2218] disabled:opacity-40"
            >
              <Save size={16} /> {saving ? 'Speichere...' : 'Neue Version speichern'}
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-lg border border-red-900/60 bg-red-950/60 text-red-100 px-4 py-3">
            Fehler: {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <section className="space-y-4">
            <div className="rounded-2xl border border-[#2f2822] bg-[#120f0c] p-4">
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#cbbfb0]">
                <span>
                  Session-ID:{' '}
                  <span className="text-[#f7f4ed] font-semibold">
                    {session?.id ?? '—'}
                  </span>
                </span>
                <span>Erstellt: {formatDate(session?.created_at)}</span>
                <span>Aktualisiert: {formatDate(session?.updated_at)}</span>
                <span>Wörter: {wordCount}</span>
                <span>Zeichen: {text.length}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#2f2822] bg-[#120f0c] p-4">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleTextChange}
                onSelect={handleSelection}
                placeholder={loading ? 'Lade Session...' : 'Text bearbeiten'}
                className="min-h-[360px] w-full resize-y rounded-lg border border-[#2f2822] bg-[#0f0c0a] p-4 text-sm leading-relaxed text-[#f7f4ed] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9b18a]"
                spellCheck
              />
            </div>

            <div className="rounded-2xl border border-[#2f2822] bg-[#120f0c] p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#cbbfb0]">
                <Search size={14} /> Find/Replace
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={findQuery}
                  onChange={(event) => {
                    setFindQuery(event.target.value);
                    setMatchIndex(0);
                  }}
                  placeholder="Suchen..."
                  className="flex-1 rounded-lg border border-[#2f2822] bg-[#0f0c0a] px-3 py-2 text-sm text-[#f7f4ed] focus:outline-none"
                />
                <input
                  value={replaceQuery}
                  onChange={(event) => setReplaceQuery(event.target.value)}
                  placeholder="Ersetzen durch..."
                  className="flex-1 rounded-lg border border-[#2f2822] bg-[#0f0c0a] px-3 py-2 text-sm text-[#f7f4ed] focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleFindNext}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#2f2822] bg-[#18130f] px-3 py-2 text-xs text-[#f7f4ed] hover:bg-[#211a13]"
                >
                  <Search size={14} /> Nächstes
                </button>
                <button
                  type="button"
                  onClick={handleReplace}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#2f2822] bg-[#18130f] px-3 py-2 text-xs text-[#f7f4ed] hover:bg-[#211a13]"
                >
                  <Replace size={14} /> Ersetzen
                </button>
                <button
                  type="button"
                  onClick={handleReplaceAll}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#2f2822] bg-[#18130f] px-3 py-2 text-xs text-[#f7f4ed] hover:bg-[#211a13]"
                >
                  <Replace size={14} /> Alle ersetzen
                </button>
                <label className="ml-auto inline-flex items-center gap-2 text-xs text-[#cbbfb0]">
                  <input
                    type="checkbox"
                    checked={caseSensitive}
                    onChange={(event) => setCaseSensitive(event.target.checked)}
                  />
                  Groß/Kleinschreibung
                </label>
                <span className="text-xs text-[#cbbfb0]">
                  {matchPositions.length} Treffer
                </span>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('versions')}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                  activeTab === 'versions'
                    ? 'border-[#c9b18a] bg-[#211a13]'
                    : 'border-[#2f2822] bg-[#120f0c]'
                }`}
              >
                <ClipboardList size={14} /> Versionen
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                  activeTab === 'notes'
                    ? 'border-[#c9b18a] bg-[#211a13]'
                    : 'border-[#2f2822] bg-[#120f0c]'
                }`}
              >
                <ClipboardList size={14} /> Notizen
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('analysis')}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                  activeTab === 'analysis'
                    ? 'border-[#c9b18a] bg-[#211a13]'
                    : 'border-[#2f2822] bg-[#120f0c]'
                }`}
              >
                <Sparkles size={14} /> Hinweise
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('diff')}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                  activeTab === 'diff'
                    ? 'border-[#c9b18a] bg-[#211a13]'
                    : 'border-[#2f2822] bg-[#120f0c]'
                }`}
              >
                <GitCompare size={14} /> Diff
              </button>
            </div>

            {activeTab === 'versions' && (
              <div className="rounded-2xl border border-[#2f2822] bg-[#120f0c] p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-[#cbbfb0]">
                  <span>Versionen</span>
                  <button
                    type="button"
                    onClick={() => session && loadVersions(session)}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#2f2822] bg-[#18130f] px-2 py-1 text-[11px] text-[#f7f4ed] hover:bg-[#211a13]"
                  >
                    <RefreshCcw size={12} /> Neu laden
                  </button>
                </div>
                {versionsLoading ? (
                  <p className="text-xs text-[#cbbfb0]">Lade Versionen...</p>
                ) : versions.length === 0 ? (
                  <p className="text-xs text-[#cbbfb0]">Keine Versionen vorhanden.</p>
                ) : (
                  <ul className="space-y-2 text-xs text-[#d6c9ba]">
                    {versions.map((version) => (
                      <li
                        key={version.id}
                        className={`rounded-lg border px-3 py-2 ${
                          version.id === session?.id
                            ? 'border-[#c9b18a] bg-[#211a13]'
                            : 'border-[#2f2822] bg-[#0f0c0a]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">
                            Version #{version.id}
                          </span>
                          <span>{formatDate(version.created_at)}</span>
                        </div>
                        <div className="mt-1 text-[11px] text-[#cbbfb0]">
                          {version.word_count ?? 0} Wörter ·{' '}
                          {version.char_count ?? 0} Zeichen
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/session/edit?active=${version.id}`)
                            }
                            className="rounded-lg border border-[#2f2822] bg-[#18130f] px-2 py-1 text-[11px] text-[#f7f4ed] hover:bg-[#211a13]"
                          >
                            Öffnen
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="rounded-2xl border border-[#2f2822] bg-[#120f0c] p-4 space-y-4">
                <div className="text-xs text-[#cbbfb0]">
                  Notizen (offset-basiert, Auswahl im Editor)
                </div>
                <div className="space-y-2">
                  <textarea
                    value={noteDraft}
                    onChange={(event) => setNoteDraft(event.target.value)}
                    placeholder="Neue Notiz..."
                    className="w-full rounded-lg border border-[#2f2822] bg-[#0f0c0a] p-2 text-xs text-[#f7f4ed] focus:outline-none"
                    rows={3}
                  />
                  <button
                    type="button"
                    onClick={handleAddNote}
                    disabled={!selection || !noteDraft.trim()}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#2f2822] bg-[#18130f] px-3 py-2 text-xs text-[#f7f4ed] hover:bg-[#211a13] disabled:opacity-40"
                  >
                    Notiz speichern
                  </button>
                  {!selection && (
                    <p className="text-[11px] text-[#cbbfb0]">
                      Tipp: Text im Editor markieren, um Start/Ende zu setzen.
                    </p>
                  )}
                </div>
                {notesLoading ? (
                  <p className="text-xs text-[#cbbfb0]">Lade Notizen...</p>
                ) : notes.length === 0 ? (
                  <p className="text-xs text-[#cbbfb0]">Keine Notizen vorhanden.</p>
                ) : (
                  <ul className="space-y-3 text-xs text-[#d6c9ba]">
                    {notes.map((note) => (
                      <li
                        key={note.id}
                        className="rounded-lg border border-[#2f2822] bg-[#0f0c0a] px-3 py-2 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-[#cbbfb0]">
                            {note.start_offset}–{note.end_offset}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleJumpToRange(note.start_offset, note.end_offset)
                            }
                            className="text-[11px] text-[#f7f4ed] underline"
                          >
                            Springen
                          </button>
                        </div>
                        <div className="text-[11px] text-[#cbbfb0]">
                          {buildSnippet(text, note.start_offset, note.end_offset)}
                        </div>
                        {editingNoteId === note.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editingNoteText}
                              onChange={(event) => setEditingNoteText(event.target.value)}
                              className="w-full rounded-lg border border-[#2f2822] bg-[#0f0c0a] p-2 text-xs text-[#f7f4ed]"
                              rows={3}
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleUpdateNote(note.id)}
                                className="rounded-lg border border-[#2f2822] bg-[#18130f] px-2 py-1 text-[11px] text-[#f7f4ed] hover:bg-[#211a13]"
                              >
                                Update
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingNoteId(null);
                                  setEditingNoteText('');
                                }}
                                className="rounded-lg border border-[#2f2822] bg-[#18130f] px-2 py-1 text-[11px] text-[#f7f4ed] hover:bg-[#211a13]"
                              >
                                Abbrechen
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-[#f7f4ed]">{note.note}</div>
                        )}
                        <div className="flex items-center gap-2">
                          {editingNoteId !== note.id && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingNoteId(note.id);
                                setEditingNoteText(note.note);
                              }}
                              className="rounded-lg border border-[#2f2822] bg-[#18130f] px-2 py-1 text-[11px] text-[#f7f4ed] hover:bg-[#211a13]"
                            >
                              Bearbeiten
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteNote(note.id)}
                            className="rounded-lg border border-[#2f2822] bg-[#18130f] px-2 py-1 text-[11px] text-[#f7f4ed] hover:bg-[#211a13]"
                          >
                            Löschen
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="rounded-2xl border border-[#2f2822] bg-[#120f0c] p-4 space-y-4">
                <div className="flex items-center justify-between text-xs text-[#cbbfb0]">
                  <span>Textdiagnose (Hinweise)</span>
                  <button
                    type="button"
                    onClick={handleRunAnalysis}
                    disabled={analysisLoading || !session}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#2f2822] bg-[#18130f] px-2 py-1 text-[11px] text-[#f7f4ed] hover:bg-[#211a13] disabled:opacity-40"
                  >
                    <Sparkles size={12} />{' '}
                    {analysisLoading
                      ? 'Erstelle Hinweise...'
                      : 'Hinweise aktualisieren'}
                  </button>
                </div>
                {analysisStale && (
                  <div className="rounded-lg border border-[#4a3d2b] bg-[#2b2218] px-3 py-2 text-[11px] text-[#f7f4ed]">
                    Hinweise veraltet – Text wurde geändert. Bitte neu starten.
                  </div>
                )}
                {analysisError && (
                  <div className="rounded-lg border border-red-900/60 bg-red-950/60 text-red-100 px-3 py-2 text-[11px]">
                    {analysisError}
                  </div>
                )}
                {findings.length === 0 ? (
                  <p className="text-xs text-[#cbbfb0]">
                    Noch keine Hinweise. Hinweise aktualisieren, um Ergebnisse zu sehen.
                  </p>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2 text-[11px] text-[#cbbfb0]">
                      {Object.keys(findingToggles).map((type) => (
                        <label
                          key={type}
                          className="inline-flex items-center gap-2 rounded-full border border-[#2f2822] px-3 py-1"
                        >
                          <input
                            type="checkbox"
                            checked={findingToggles[type]}
                            onChange={(event) =>
                              setFindingToggles((prev) => ({
                                ...prev,
                                [type]: event.target.checked,
                              }))
                            }
                          />
                          <span>{type}</span>
                          <span className="rounded-full border border-[#4a3d2b] bg-[#2b2218] px-2 py-0.5 text-[9px] uppercase tracking-wide text-[#f7f4ed]">
                            Heuristik
                          </span>
                        </label>
                      ))}
                    </div>
                    <div className="rounded-lg border border-[#2f2822] bg-[#0f0c0a] p-3 text-[11px] text-[#d6c9ba] space-y-2 max-h-[240px] overflow-auto">
                      {visibleFindings.map((finding) => (
                        <button
                          key={finding.id}
                          type="button"
                          onClick={() =>
                            handleJumpToRange(
                              finding.start_offset,
                              finding.end_offset,
                            )
                          }
                          className="w-full text-left rounded-md border border-[#2f2822] bg-[#120f0c] px-2 py-2 hover:bg-[#191511]"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">
                                {finding.finding_type}
                              </span>
                              <span className="rounded-full border border-[#4a3d2b] bg-[#2b2218] px-2 py-0.5 text-[9px] uppercase tracking-wide text-[#f7f4ed]">
                                Heuristik
                              </span>
                            </div>
                            <span
                              className={`text-[10px] uppercase ${
                                finding.severity === 'warn'
                                  ? 'text-[#f6c177]'
                                  : 'text-[#a6da95]'
                              }`}
                            >
                              {finding.severity}
                            </span>
                          </div>
                          <div className="mt-1 text-[#cbbfb0]">
                            {buildSnippet(
                              text,
                              finding.start_offset,
                              finding.end_offset,
                            )}
                          </div>
                          {finding.explanation && (
                            <div className="mt-1 text-[#f7f4ed]">
                              {finding.explanation}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="rounded-lg border border-[#2f2822] bg-[#0f0c0a] p-3">
                      <div className="text-[11px] text-[#cbbfb0] mb-2">
                        Vorschau (Inline-Hinweise)
                      </div>
                      <div className="max-h-[220px] overflow-auto text-xs leading-relaxed text-[#f7f4ed]">
                        {highlightedSegments.map((segment, idx) =>
                          segment.finding ? (
                            <mark
                              key={`${segment.finding.id}-${idx}`}
                              className={`rounded-sm px-0.5 ${
                                segment.finding.severity === 'warn'
                                  ? 'bg-[#5a3e1b] text-[#fef4d1]'
                                  : 'bg-[#204f2b] text-[#f6ffe5]'
                              }`}
                            >
                              {segment.text}
                            </mark>
                          ) : (
                            <span key={`plain-${idx}`}>{segment.text}</span>
                          ),
                        )}
                      </div>
                    </div>
                    <div className="rounded-lg border border-[#2f2822] bg-[#0f0c0a] p-3">
                      <div className="text-[11px] text-[#cbbfb0] mb-2">
                        Minimap (Hinweise)
                      </div>
                      <div className="relative h-24 rounded bg-[#120f0c]">
                        {visibleFindings.map((finding) => {
                          const top =
                            text.length > 0
                              ? (finding.start_offset / text.length) * 100
                              : 0;
                          return (
                            <span
                              key={`minimap-${finding.id}`}
                              className={`absolute left-0 right-0 h-1 ${
                                finding.severity === 'warn'
                                  ? 'bg-[#f6c177]'
                                  : 'bg-[#a6da95]'
                              }`}
                              style={{ top: `${top}%` }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'diff' && (
              <div className="rounded-2xl border border-[#2f2822] bg-[#120f0c] p-4 space-y-4">
                <div className="text-xs text-[#cbbfb0]">
                  Diff zwischen zwei Versionen
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[11px] text-[#cbbfb0]">
                    Version A
                    <select
                      value={diffA ?? ''}
                      onChange={(event) =>
                        setDiffA(event.target.value ? Number(event.target.value) : null)
                      }
                      className="mt-1 w-full rounded-lg border border-[#2f2822] bg-[#0f0c0a] px-2 py-1 text-xs text-[#f7f4ed]"
                    >
                      <option value="">Auswählen...</option>
                      {versions.map((version) => (
                        <option key={`diff-a-${version.id}`} value={version.id}>
                          #{version.id} · {formatDate(version.created_at)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-[11px] text-[#cbbfb0]">
                    Version B
                    <select
                      value={diffB ?? ''}
                      onChange={(event) =>
                        setDiffB(event.target.value ? Number(event.target.value) : null)
                      }
                      className="mt-1 w-full rounded-lg border border-[#2f2822] bg-[#0f0c0a] px-2 py-1 text-xs text-[#f7f4ed]"
                    >
                      <option value="">Auswählen...</option>
                      {versions.map((version) => (
                        <option key={`diff-b-${version.id}`} value={version.id}>
                          #{version.id} · {formatDate(version.created_at)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {!diffData ? (
                  <p className="text-xs text-[#cbbfb0]">
                    Wähle zwei Versionen für den Vergleich.
                  </p>
                ) : diffData.diff.tooLarge ? (
                  <p className="text-xs text-[#cbbfb0]">
                    Diff zu groß – bitte kürzere Versionen auswählen.
                  </p>
                ) : (
                  <div className="max-h-[320px] overflow-auto rounded-lg border border-[#2f2822] bg-[#0f0c0a] px-3 py-2 text-[11px] leading-relaxed text-[#f7f4ed]">
                    {diffData.diff.lines.map((line, idx) => (
                      <div
                        key={`${line.type}-${idx}`}
                        className={`whitespace-pre-wrap ${
                          line.type === 'insert'
                            ? 'text-[#a6da95]'
                            : line.type === 'delete'
                              ? 'text-[#f6c177]'
                              : 'text-[#f7f4ed]'
                        }`}
                      >
                        {line.type === 'insert'
                          ? `+ ${line.text}`
                          : line.type === 'delete'
                            ? `- ${line.text}`
                            : `  ${line.text}`}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
