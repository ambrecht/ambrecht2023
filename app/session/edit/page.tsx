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
} from 'lucide-react';

import type { Finding, Note, Session } from '@/lib/api/types';
import {
  createEdit,
  createNote,
  deleteNote,
  getDocumentVersions,
  getNotes,
  getSession,
  updateNote,
} from '@/lib/api/typewriterClient';
import {
  analyzeNlpVersion,
  createNlpDocument,
  createNlpDocumentVersion,
  getNlpAdverbTool,
  getNlpDescriptionTool,
  getNlpKwic,
  getNlpTensePovTool,
  getNlpVersion,
  runRemoveAdverbsAction,
} from '@/lib/api/nlpClient';

import type { Block, BlockType, SessionVersion } from '@/lib/session-editor/types';
import {
  computeBlockStats,
  computeMovedBlocks,
  findAllMatches,
  parseTextToBlocks,
  replaceAllInText,
  serializeBlocksToText,
  updateBlockOrder,
} from '@/lib/session-editor/blocks';
import {
  BlockEditor,
  type InlineFindingSpan,
} from '@/components/session-editor/BlockEditor';
import {
  getVersionStoreKey,
  loadLocalVersionMap,
  saveLocalVersion,
} from '@/lib/session-editor/versionStore';

type WorkshopPresetId =
  | 'spelling'
  | 'style_tighten'
  | 'consistency_pov_tense'
  | 'repetitions_kwic'
  | 'dramaturgy';

type WorkshopCategory = 'adverb' | 'description' | 'tense_pov' | 'kwic';

type WorkshopPreset = {
  id: WorkshopPresetId;
  label: string;
  enabled: boolean;
  goal: string;
  description: string;
  categories: WorkshopCategory[];
  needsTerm?: boolean;
  supportsAdverbAction?: boolean;
  nextSteps: string[];
};

const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  paragraph: 'Absatz',
  dialog: 'Dialog',
  heading: 'Überschrift',
  free: 'Freitext',
};

const WORKSHOP_PRESETS: WorkshopPreset[] = [
  {
    id: 'spelling',
    label: 'Rechtschreibung',
    enabled: false,
    goal: 'Kommt bald.',
    description: 'Orthografie-Checks folgen im nächsten Schritt.',
    categories: [],
    nextSteps: [],
  },
  {
    id: 'style_tighten',
    label: 'Stil - Straffen',
    enabled: true,
    goal: 'Macht Sätze klarer und direkter.',
    description:
      'Ein Modus = ein Auftrag: Adverbien und beschreibende Stellen gezielt prüfen.',
    categories: ['adverb', 'description'],
    supportsAdverbAction: true,
    nextSteps: [
      'Review Adverbien',
      'Review Beschreibungen',
      'Optional straffen (Vorschau)',
      'Als Version speichern',
    ],
  },
  {
    id: 'consistency_pov_tense',
    label: 'Konsistenz - POV/Tempus',
    enabled: true,
    goal: 'Findet Sprünge in Perspektive und Tempus.',
    description:
      'Ein Modus = ein Auftrag: Satz für Satz auf POV- und Tempus-Konsistenz prüfen.',
    categories: ['tense_pov'],
    nextSteps: ['Sprünge durchgehen', 'Anpassen', 'Als Version speichern'],
  },
  {
    id: 'repetitions_kwic',
    label: 'Wiederholungen - Begriffe',
    enabled: true,
    goal: 'Zeigt Treffer eines Begriffs im Kontext.',
    description:
      'Ein Modus = ein Auftrag: Begriff eingeben und Fundstellen nacheinander prüfen.',
    categories: ['kwic'],
    needsTerm: true,
    nextSteps: ['Begriff eingeben', 'Treffer reviewen', 'Optional umstellen/straffen'],
  },
  {
    id: 'dramaturgy',
    label: 'Dramaturgie',
    enabled: false,
    goal: 'Kommt bald.',
    description: 'Dramaturgie-Werkzeuge folgen.',
    categories: [],
    nextSteps: [],
  },
];

const CATEGORY_STYLE: Record<
  WorkshopCategory,
  {
    label: string;
    badge: string;
    markClass: string;
    dotClass: string;
    underlineClass: string;
  }
> = {
  adverb: {
    label: 'Adverbien',
    badge: 'ADV',
    markClass: 'bg-[#6f2f39]/80 text-[#fff1f3]',
    dotClass: 'bg-[#d46a7a]',
    underlineClass:
      'underline decoration-[#d46a7a] decoration-2 decoration-dotted underline-offset-2',
  },
  description: {
    label: 'Beschreibungen',
    badge: 'DESC',
    markClass: 'bg-[#6b4c1d]/80 text-[#fff6dc]',
    dotClass: 'bg-[#f0b35d]',
    underlineClass:
      'underline decoration-[#f0b35d] decoration-2 decoration-dashed underline-offset-2',
  },
  tense_pov: {
    label: 'POV/Tempus',
    badge: 'POV',
    markClass: 'bg-[#174b4b]/85 text-[#defefe]',
    dotClass: 'bg-[#63c7c2]',
    underlineClass:
      'underline decoration-[#63c7c2] decoration-2 decoration-wavy underline-offset-2',
  },
  kwic: {
    label: 'Begriffe',
    badge: 'KWIC',
    markClass: 'bg-[#2f3f69]/85 text-[#eef3ff]',
    dotClass: 'bg-[#89a6ff]',
    underlineClass:
      'underline decoration-[#89a6ff] decoration-2 decoration-solid underline-offset-2',
  },
};

const FINDING_HINTS: Record<WorkshopCategory, string> = {
  adverb:
    'Adverb entfernen macht den Satz oft pointierter - prüfe, ob ein stärkeres Verb reicht.',
  description: 'Prüfe, ob diese Stelle Handlung trägt oder gekürzt werden kann.',
  tense_pov:
    'Hier weicht der Satz vom dominanten Muster ab - prüfe, ob der Sprung gewollt ist.',
  kwic: 'Prüfe, ob die Wiederholung rhythmisch oder redundant wirkt.',
};

type DiffLine = { type: 'equal' | 'insert' | 'delete'; text: string };

type EditorMode = 'text' | 'blocks';

type EditorSnapshot = {
  text: string;
  blocks: Block[];
  blocksSynced: boolean;
  parkedIds: string[];
};

type BlockMatch = {
  blockId: string;
  start: number;
  end: number;
  blockIndex: number;
  matchIndex: number;
};

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

const getParkedStoreKey = (session: Session | null) => {
  if (!session) return null;
  return `session-editor-parked:${session.document_id ?? session.id}:${session.id}`;
};

const loadParkedIds = (storeKey: string | null) => {
  if (!storeKey || typeof window === 'undefined') return new Set<string>();
  try {
    const raw = window.localStorage.getItem(storeKey);
    if (!raw) return new Set<string>();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set<string>();
    return new Set(
      parsed.filter((item): item is string => typeof item === 'string' && item.length > 0),
    );
  } catch {
    return new Set<string>();
  }
};

const formatDateTime = (value?: string) => {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('de-DE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const saveParkedIds = (storeKey: string | null, ids: Set<string>) => {
  if (!storeKey || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storeKey, JSON.stringify(Array.from(ids)));
  } catch {
    // ignore persistence issues
  }
};

export default function SessionEditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeParam = searchParams.get('active');
  const activeId = activeParam ? Number(activeParam) : NaN;

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const blockRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [session, setSession] = useState<Session | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editorMode, setEditorMode] = useState<EditorMode>('blocks');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [parkedBlockIds, setParkedBlockIds] = useState<Set<string>>(new Set());
  const [blocksSynced, setBlocksSynced] = useState(true);
  const [selectedBlockIds, setSelectedBlockIds] = useState<Set<string>>(
    new Set(),
  );
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);
  const [localVersions, setLocalVersions] = useState<
    Record<string, SessionVersion>
  >({});
  const [replaceSelectionOnly, setReplaceSelectionOnly] = useState(false);
  const [activeBlockMatch, setActiveBlockMatch] = useState<{
    blockId: string;
    start: number;
    end: number;
  } | null>(null);

  const [versions, setVersions] = useState<Session[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);

  const [history, setHistory] = useState<EditorSnapshot[]>([]);
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

  const [workshopPreset, setWorkshopPreset] = useState<WorkshopPresetId | ''>('');
  const [kwicTerm, setKwicTerm] = useState('');
  const [nlpDocumentId, setNlpDocumentId] = useState<number | null>(null);
  const [scanMeta, setScanMeta] = useState<{
    documentId: number;
    versionId: number;
    analysisId: number;
    scannedText: string;
    scannedAt: string;
    preset: WorkshopPresetId;
    kwicTerm?: string;
  } | null>(null);

  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [analysisStale, setAnalysisStale] = useState(false);
  const [findingToggles, setFindingToggles] = useState<Record<string, boolean>>(
    {},
  );
  const [ignoredFindingIds, setIgnoredFindingIds] = useState<Set<number>>(
    new Set(),
  );
  const [activeFindingIndex, setActiveFindingIndex] = useState(0);
  const [previewAction, setPreviewAction] = useState<{
    open: boolean;
    loading: boolean;
    saving: boolean;
    error: string | null;
    diff: string;
    afterText: string;
    nlpVersionId: number | null;
  }>({
    open: false,
    loading: false,
    saving: false,
    error: null,
    diff: '',
    afterText: '',
    nlpVersionId: null,
  });

  const [activeTab, setActiveTab] = useState<
    'versions' | 'notes' | 'analysis' | 'diff'
  >('analysis');
  const [diffA, setDiffA] = useState<number | null>(null);
  const [diffB, setDiffB] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reviewStarted, setReviewStarted] = useState(false);
  const [findingListOpen, setFindingListOpen] = useState(false);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);
  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);

  const resetHistory = useCallback((snapshot: EditorSnapshot) => {
    setHistory([snapshot]);
    setHistoryIndex(0);
    historyRef.current = [snapshot];
    historyIndexRef.current = 0;
  }, []);

  const pushHistory = useCallback((snapshot: EditorSnapshot) => {
    const next = historyRef.current.slice(0, historyIndexRef.current + 1);
    next.push(snapshot);
    historyRef.current = next;
    historyIndexRef.current = next.length - 1;
    setHistory(next);
    setHistoryIndex(next.length - 1);
  }, []);

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

  const loadSession = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSession(id);
        setSession(data);
        const rawText = data.text ?? '';
        const storeKey = getVersionStoreKey(data);
        const localMap = loadLocalVersionMap(storeKey);
        setLocalVersions(localMap);
        const localVersion = localMap[String(data.id)];
        const nextBlocks =
          localVersion && localVersion.rawText === rawText
            ? localVersion.blocks
            : parseTextToBlocks(rawText);
        const parkedStoreKey = getParkedStoreKey(data);
        const restoredParked = loadParkedIds(parkedStoreKey);
        const validIds = new Set(nextBlocks.map((block) => block.id));
        const nextParked = new Set<string>();
        restoredParked.forEach((id) => {
          if (validIds.has(id)) {
            nextParked.add(id);
          }
        });
        suppressHistoryRef.current = true;
        setText(rawText);
        setBlocks(nextBlocks);
        setParkedBlockIds(nextParked);
        setBlocksSynced(true);
        setSelectedBlockIds(new Set());
        setExpandedBlockId(null);
        resetHistory({
          text: rawText,
          blocks: nextBlocks,
          blocksSynced: true,
          parkedIds: Array.from(nextParked),
        });
        setFindings([]);
        setScanMeta(null);
        setNlpDocumentId(null);
        setAnalysisStale(false);
        setFindingToggles({});
        setIgnoredFindingIds(new Set());
        setActiveFindingIndex(0);
        setReviewStarted(false);
        setFindingListOpen(false);
        setDrawerOpen(false);
        setPreviewAction({
          open: false,
          loading: false,
          saving: false,
          error: null,
          diff: '',
          afterText: '',
          nlpVersionId: null,
        });
        await Promise.all([loadVersions(data), loadNotes(data, rawText)]);
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

  useEffect(() => {
    if (!activeParam) return;
    if (Number.isNaN(activeId)) {
      setError('Ungültige Session-ID in der URL.');
      return;
    }
    void loadSession(activeId);
  }, [activeId, activeParam, loadSession]);

  useEffect(() => {
    if (!scanMeta) return;
    if (text !== scanMeta.scannedText) {
      setAnalysisStale(true);
      return;
    }
    setAnalysisStale(false);
  }, [scanMeta, text]);

  useEffect(() => {
    if (!scanMeta) return;
    const presetMismatch =
      scanMeta.preset !== workshopPreset ||
      (
      scanMeta.preset === 'repetitions_kwic' &&
      (scanMeta.kwicTerm ?? '') !== kwicTerm.trim()
      );
    if (presetMismatch) {
      setAnalysisStale(true);
      return;
    }
    if (text === scanMeta.scannedText) {
      setAnalysisStale(false);
    }
  }, [kwicTerm, scanMeta, text, workshopPreset]);

  useEffect(() => {
    if (editorMode === 'blocks') {
      setSelection(null);
      setActiveTab((prev) => (prev === 'diff' ? prev : 'analysis'));
    }
  }, [editorMode]);

  useEffect(() => {
    if (selectedBlockIds.size === 0) return;
    const existing = new Set(blocks.map((block) => block.id));
    setSelectedBlockIds((prev) => {
      const next = new Set<string>();
      prev.forEach((id) => {
        if (existing.has(id)) {
          next.add(id);
        }
      });
      return next;
    });
  }, [blocks, selectedBlockIds.size]);

  useEffect(() => {
    if (parkedBlockIds.size === 0) return;
    const existing = new Set(blocks.map((block) => block.id));
    let changed = false;
    const next = new Set<string>();
    parkedBlockIds.forEach((id) => {
      if (existing.has(id)) {
        next.add(id);
      } else {
        changed = true;
      }
    });
    if (changed) {
      setParkedBlockIds(next);
    }
  }, [blocks, parkedBlockIds]);

  useEffect(() => {
    if (!expandedBlockId) return;
    if (!blocks.some((block) => block.id === expandedBlockId)) {
      setExpandedBlockId(null);
    }
  }, [blocks, expandedBlockId]);

  useEffect(() => {
    const key = getParkedStoreKey(session);
    saveParkedIds(key, parkedBlockIds);
  }, [parkedBlockIds, session]);

  useEffect(() => {
    setMatchIndex(0);
    setActiveBlockMatch(null);
  }, [findQuery, caseSensitive, editorMode]);

  const wordCount = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).filter(Boolean).length;
  }, [text]);

  const activeBlocks = useMemo(
    () => blocks.filter((block) => !parkedBlockIds.has(block.id)),
    [blocks, parkedBlockIds],
  );
  const serializableActiveBlocks = useMemo(
    () => activeBlocks.filter((block) => block.text.trim().length > 0),
    [activeBlocks],
  );
  const activeBlockRanges = useMemo(() => {
    const ranges: Array<{ block: Block; start: number; end: number }> = [];
    let cursor = 0;
    serializableActiveBlocks.forEach((block, index) => {
      const start = cursor;
      const end = start + block.text.length;
      ranges.push({ block, start, end });
      const next = serializableActiveBlocks[index + 1];
      if (!next) return;
      const sameParagraph =
        (block.paragraphId ?? '') === (next.paragraphId ?? '');
      cursor = end + (sameParagraph ? 1 : 2);
    });
    return ranges;
  }, [serializableActiveBlocks]);

  const textMatchPositions = useMemo(() => {
    if (editorMode !== 'text' || !findQuery) return [];
    return findAllMatches(text, findQuery, caseSensitive);
  }, [caseSensitive, editorMode, findQuery, text]);

  const blockMatchGroups = useMemo(() => {
    if (editorMode !== 'blocks' || !findQuery)
      return [] as { block: Block; index: number; positions: number[] }[];
    return activeBlocks
      .map((block, index) => {
        const positions = findAllMatches(block.text, findQuery, caseSensitive);
        if (positions.length === 0) return null;
        return { block, index, positions };
      })
      .filter(
        (group): group is { block: Block; index: number; positions: number[] } =>
          Boolean(group),
      );
  }, [activeBlocks, caseSensitive, editorMode, findQuery]);

  const flatBlockMatches = useMemo(() => {
    const result: BlockMatch[] = [];
    blockMatchGroups.forEach((group) => {
      group.positions.forEach((start, matchIdx) => {
        result.push({
          blockId: group.block.id,
          start,
          end: start + findQuery.length,
          blockIndex: group.index,
          matchIndex: matchIdx,
        });
      });
    });
    return result;
  }, [blockMatchGroups, findQuery.length]);

  const blockMatchCounts = useMemo(() => {
    const map: Record<string, number> = {};
    blockMatchGroups.forEach((group) => {
      map[group.block.id] = group.positions.length;
    });
    return map;
  }, [blockMatchGroups]);

  const selectedPreset = useMemo(
    () => WORKSHOP_PRESETS.find((preset) => preset.id === workshopPreset) ?? null,
    [workshopPreset],
  );

  useEffect(() => {
    if (!selectedPreset) {
      setFindingToggles({});
      return;
    }
    const next: Record<string, boolean> = {};
    selectedPreset.categories.forEach((category) => {
      next[category] = true;
    });
    setFindingToggles(next);
  }, [selectedPreset]);

  const visibleFindings = useMemo(() => {
    const filteredByIgnore = findings.filter(
      (finding) => !ignoredFindingIds.has(finding.id),
    );
    const relevantCategories = new Set(selectedPreset?.categories ?? []);
    const presetFiltered =
      relevantCategories.size > 0
        ? filteredByIgnore.filter((finding) =>
            relevantCategories.has(finding.finding_type as WorkshopCategory),
          )
        : filteredByIgnore;

    const enabledTypes = Object.keys(findingToggles).filter(
      (key) => findingToggles[key],
    );
    if (Object.keys(findingToggles).length === 0) return presetFiltered;
    if (enabledTypes.length === 0) return [];
    return presetFiltered.filter((finding) => findingToggles[finding.finding_type]);
  }, [findingToggles, findings, ignoredFindingIds, selectedPreset]);

  const ignoredFindings = useMemo(
    () => findings.filter((finding) => ignoredFindingIds.has(finding.id)),
    [findings, ignoredFindingIds],
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    findings.forEach((finding) => {
      if (ignoredFindingIds.has(finding.id)) return;
      counts[finding.finding_type] = (counts[finding.finding_type] ?? 0) + 1;
    });
    return counts;
  }, [findings, ignoredFindingIds]);

  const findingStyles = useMemo(() => {
    const map: Record<
      string,
      {
        label: string;
        badge: string;
        dotClass: string;
        markClass: string;
        underlineClass: string;
      }
    > = {};
    (Object.keys(CATEGORY_STYLE) as WorkshopCategory[]).forEach((category) => {
      map[category] = CATEGORY_STYLE[category];
    });
    return map;
  }, []);

  const findingSpansByBlock = useMemo(() => {
    const mapped: Record<string, InlineFindingSpan[]> = {};
    visibleFindings.forEach((finding) => {
      activeBlockRanges.forEach(({ block, start, end }) => {
        if (finding.start_offset >= end || finding.end_offset <= start) return;
        const localStart = Math.max(0, finding.start_offset - start);
        const localEnd = Math.min(block.text.length, finding.end_offset - start);
        if (localEnd <= localStart) return;
        const token = block.text.slice(localStart, localEnd);
        const entry: InlineFindingSpan = {
          findingId: finding.id,
          findingType: finding.finding_type,
          severity: finding.severity,
          start: localStart,
          end: localEnd,
          explanation: finding.explanation,
          token,
        };
        const list = mapped[block.id] ?? [];
        list.push(entry);
        mapped[block.id] = list;
      });
    });

    Object.values(mapped).forEach((entries) => {
      entries.sort((a, b) => a.start - b.start);
    });

    return mapped;
  }, [activeBlockRanges, visibleFindings]);

  const findingCountsByBlock = useMemo(() => {
    const counts: Record<string, Record<string, number>> = {};
    Object.entries(findingSpansByBlock).forEach(([blockId, spans]) => {
      const bucket: Record<string, number> = {};
      spans.forEach((span) => {
        bucket[span.findingType] = (bucket[span.findingType] ?? 0) + 1;
      });
      counts[blockId] = bucket;
    });
    return counts;
  }, [findingSpansByBlock]);

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

  const blockDiff = useMemo(() => {
    if (activeTab !== 'diff') return null;
    if (!diffA || !diffB) return null;
    const leftVersion = localVersions[String(diffA)];
    const rightVersion = localVersions[String(diffB)];
    if (!leftVersion || !rightVersion) return null;
    return computeMovedBlocks(leftVersion.blocks, rightVersion.blocks);
  }, [activeTab, diffA, diffB, localVersions]);

  const commitTextChange = useCallback(
    (nextText: string) => {
      setText(nextText);
      setBlocksSynced(false);
      if (suppressHistoryRef.current) {
        suppressHistoryRef.current = false;
        return;
      }
      pushHistory({
        text: nextText,
        blocks,
        blocksSynced: false,
        parkedIds: Array.from(parkedBlockIds),
      });
    },
    [blocks, parkedBlockIds, pushHistory],
  );

  const commitBlocksChange = useCallback(
    (nextBlocks: Block[], nextParkedIds?: Set<string>) => {
      const ordered = updateBlockOrder(nextBlocks);
      const candidateParked = nextParkedIds ?? parkedBlockIds;
      const validIds = new Set(ordered.map((block) => block.id));
      const sanitizedParked = new Set<string>();
      candidateParked.forEach((id) => {
        if (validIds.has(id)) {
          sanitizedParked.add(id);
        }
      });
      const activeOnly = ordered.filter(
        (block) => !sanitizedParked.has(block.id),
      );
      const nextText = serializeBlocksToText(activeOnly);
      setBlocks(ordered);
      setParkedBlockIds(sanitizedParked);
      setText(nextText);
      setBlocksSynced(true);
      if (suppressHistoryRef.current) {
        suppressHistoryRef.current = false;
        return;
      }
      pushHistory({
        text: nextText,
        blocks: ordered,
        blocksSynced: true,
        parkedIds: Array.from(sanitizedParked),
      });
    },
    [parkedBlockIds, pushHistory],
  );

  const handleModeChange = useCallback(
    (nextMode: EditorMode) => {
      if (nextMode === editorMode) return;
      if (nextMode === 'blocks' && !blocksSynced) {
        const nextBlocks = parseTextToBlocks(text, blocks);
        setBlocks(nextBlocks);
        setParkedBlockIds(new Set());
        setBlocksSynced(true);
        setExpandedBlockId(null);
      }
      setEditorMode(nextMode);
      setMatchIndex(0);
      setActiveBlockMatch(null);
    },
    [blocks, blocksSynced, editorMode, text],
  );

  const handleTextChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const next = event.target.value;
      commitTextChange(next);
    },
    [commitTextChange],
  );

  const applySnapshot = useCallback(
    (snapshot: EditorSnapshot) => {
      let nextBlocks = snapshot.blocks;
      let nextBlocksSynced = snapshot.blocksSynced;
      let nextParked = new Set(snapshot.parkedIds ?? []);
      if (editorMode === 'blocks' && !snapshot.blocksSynced) {
        nextBlocks = parseTextToBlocks(snapshot.text, snapshot.blocks);
        nextBlocksSynced = true;
        nextParked = new Set();
      }
      const validIds = new Set(nextBlocks.map((block) => block.id));
      const sanitizedParked = new Set<string>();
      nextParked.forEach((id) => {
        if (validIds.has(id)) {
          sanitizedParked.add(id);
        }
      });
      setText(snapshot.text);
      setBlocks(nextBlocks);
      setParkedBlockIds(sanitizedParked);
      setBlocksSynced(nextBlocksSynced);
    },
    [editorMode],
  );

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    const nextIndex = historyIndexRef.current - 1;
    const nextSnapshot = historyRef.current[nextIndex];
    applySnapshot(nextSnapshot);
    setHistoryIndex(nextIndex);
  }, [applySnapshot]);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    const nextIndex = historyIndexRef.current + 1;
    const nextSnapshot = historyRef.current[nextIndex];
    applySnapshot(nextSnapshot);
    setHistoryIndex(nextIndex);
  }, [applySnapshot]);

  const handleSave = useCallback(async () => {
    if (!session) return;
    setSaving(true);
    setError(null);
    try {
      const created = await createEdit(session.id, text);
      const savedText = created.text ?? '';
      const alignedBlocks = parseTextToBlocks(savedText, blocks);
      const versionPayload: SessionVersion = {
        id: String(created.id),
        sessionId: String(created.id),
        createdAt: created.created_at,
        rawText: savedText,
        blocks: alignedBlocks,
        hints: [],
      };
      const storeKey = getVersionStoreKey(created);
      saveLocalVersion(storeKey, versionPayload);
      setLocalVersions((prev) => ({ ...prev, [versionPayload.id]: versionPayload }));

      setSession(created);
      suppressHistoryRef.current = true;
      setText(savedText);
      setBlocks(alignedBlocks);
      setParkedBlockIds(new Set());
      setBlocksSynced(true);
      setSelectedBlockIds(new Set());
      setExpandedBlockId(null);
      resetHistory({
        text: savedText,
        blocks: alignedBlocks,
        blocksSynced: true,
        parkedIds: [],
      });
      setFindings([]);
      setScanMeta(null);
      setAnalysisStale(false);
      setFindingToggles({});
      setIgnoredFindingIds(new Set());
      setActiveFindingIndex(0);
      setReviewStarted(false);
      setFindingListOpen(false);
      setNotes([]);
      if (!Number.isNaN(created.id)) {
        router.replace(`/session/edit?active=${created.id}`);
      }
      await Promise.all([loadVersions(created), loadNotes(created, savedText)]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Speichern der Version fehlgeschlagen.',
      );
    } finally {
      setSaving(false);
      suppressHistoryRef.current = false;
    }
  }, [
    blocks,
    loadNotes,
    loadVersions,
    resetHistory,
    router,
    session,
    text,
  ]);

  const handleTextFindNext = useCallback(() => {
    if (!textMatchPositions.length) return;
    const nextIndex = matchIndex % textMatchPositions.length;
    const start = textMatchPositions[nextIndex];
    const end = start + findQuery.length;
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(start, end);
    }
    setMatchIndex((prev) => (prev + 1) % textMatchPositions.length);
  }, [findQuery.length, matchIndex, textMatchPositions]);

  const scrollToBlock = useCallback((blockId: string) => {
    const node = blockRefs.current[blockId];
    if (!node) return;
    node.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const handleBlockFindNext = useCallback(() => {
    if (!flatBlockMatches.length) return;
    const nextIndex = matchIndex % flatBlockMatches.length;
    const match = flatBlockMatches[nextIndex];
    setExpandedBlockId(match.blockId);
    setSelectedBlockIds(new Set([match.blockId]));
    setActiveBlockMatch({
      blockId: match.blockId,
      start: match.start,
      end: match.end,
    });
    scrollToBlock(match.blockId);
    setMatchIndex((prev) => (prev + 1) % flatBlockMatches.length);
  }, [flatBlockMatches, matchIndex, scrollToBlock]);

  const handleFindNext = useCallback(() => {
    if (editorMode === 'blocks') {
      handleBlockFindNext();
      return;
    }
    handleTextFindNext();
  }, [editorMode, handleBlockFindNext, handleTextFindNext]);

  const handleTextReplace = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea || !findQuery) return;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const selected = text.slice(start, end);
    const needle = caseSensitive ? findQuery : findQuery.toLowerCase();
    const hay = caseSensitive ? selected : selected.toLowerCase();

    if (selected && hay === needle) {
      const next = `${text.slice(0, start)}${replaceQuery}${text.slice(end)}`;
      commitTextChange(next);
      const cursor = start + replaceQuery.length;
      textarea.setSelectionRange(cursor, cursor);
      return;
    }
    handleTextFindNext();
  }, [
    caseSensitive,
    commitTextChange,
    findQuery,
    handleTextFindNext,
    replaceQuery,
    text,
  ]);

  const handleBlockReplace = useCallback(() => {
    if (!findQuery || flatBlockMatches.length === 0) return;
    const target =
      activeBlockMatch ?? flatBlockMatches[matchIndex % flatBlockMatches.length];
    if (!target) return;
    const blockIndex = blocks.findIndex((block) => block.id === target.blockId);
    if (blockIndex === -1) return;
    if (parkedBlockIds.has(target.blockId)) return;
    const block = blocks[blockIndex];
    const nextText = `${block.text.slice(0, target.start)}${replaceQuery}${block.text.slice(target.end)}`;
    const nextBlocks = [...blocks];
    nextBlocks[blockIndex] = {
      ...block,
      text: nextText,
      stats: computeBlockStats(nextText),
    };
    commitBlocksChange(nextBlocks);
    setActiveBlockMatch({
      blockId: block.id,
      start: target.start,
      end: target.start + replaceQuery.length,
    });
    setMatchIndex((prev) => (prev + 1) % Math.max(flatBlockMatches.length, 1));
  }, [
    activeBlockMatch,
    blocks,
    commitBlocksChange,
    findQuery,
    flatBlockMatches,
    matchIndex,
    parkedBlockIds,
    replaceQuery,
  ]);

  const handleReplace = useCallback(() => {
    if (editorMode === 'blocks') {
      handleBlockReplace();
      return;
    }
    handleTextReplace();
  }, [editorMode, handleBlockReplace, handleTextReplace]);

  const handleTextReplaceAll = useCallback(() => {
    if (!findQuery) return;
    const result = replaceAllInText(text, findQuery, replaceQuery, caseSensitive);
    if (result.count === 0) return;
    commitTextChange(result.text);
  }, [caseSensitive, commitTextChange, findQuery, replaceQuery, text]);

  const handleBlockReplaceAll = useCallback(() => {
    if (!findQuery) return;
    const activeIdSet = new Set(activeBlocks.map((block) => block.id));
    const scopeIds =
      replaceSelectionOnly && selectedBlockIds.size > 0
        ? new Set(
            Array.from(selectedBlockIds).filter((blockId) => activeIdSet.has(blockId)),
          )
        : null;
    let changed = false;
    const nextBlocks = blocks.map((block) => {
      if (parkedBlockIds.has(block.id)) return block;
      if (scopeIds && !scopeIds.has(block.id)) return block;
      const result = replaceAllInText(
        block.text,
        findQuery,
        replaceQuery,
        caseSensitive,
      );
      if (result.count === 0) return block;
      changed = true;
      return {
        ...block,
        text: result.text,
        stats: computeBlockStats(result.text),
      };
    });
    if (!changed) return;
    commitBlocksChange(nextBlocks);
    setMatchIndex(0);
    setActiveBlockMatch(null);
  }, [
    activeBlocks,
    blocks,
    caseSensitive,
    commitBlocksChange,
    findQuery,
    parkedBlockIds,
    replaceQuery,
    replaceSelectionOnly,
    selectedBlockIds,
  ]);

  const handleReplaceAll = useCallback(() => {
    if (editorMode === 'blocks') {
      handleBlockReplaceAll();
      return;
    }
    handleTextReplaceAll();
  }, [editorMode, handleBlockReplaceAll, handleTextReplaceAll]);

  const handleSelection = useCallback(() => {
    if (editorMode !== 'text') return;
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    if (start === end) {
      setSelection(null);
      return;
    }
    setSelection({ start, end });
  }, [editorMode]);

  const handleAddNote = useCallback(async () => {
    if (!session || !selection || editorMode !== 'text') return;
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
  }, [editorMode, loadNotes, noteDraft, selection, session, text]);

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

  const handleJumpToRange = useCallback((start: number, end: number) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setEditorMode('text');
      requestAnimationFrame(() => {
        const nextTextarea = textareaRef.current;
        if (nextTextarea) {
          nextTextarea.focus();
          nextTextarea.setSelectionRange(start, end);
        }
      });
      return;
    }
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
  }, []);

  const handleRunAnalysis = useCallback(async () => {
    if (!session) return;
    const preset = WORKSHOP_PRESETS.find((entry) => entry.id === workshopPreset);
    if (!preset || !preset.enabled) {
      setAnalysisError('Bitte zuerst ein aktives Werkstatt-Preset wählen.');
      return;
    }
    if (preset.needsTerm && !kwicTerm.trim()) {
      setAnalysisError('Für dieses Preset bitte einen Begriff eingeben.');
      return;
    }

    setAnalysisLoading(true);
    setAnalysisError(null);
    setActiveTab('analysis');
    try {
      const sourceText = text.trim();
      if (!sourceText) {
        throw new Error('Leerer Text kann nicht gescannt werden.');
      }

      let documentId = nlpDocumentId;
      let versionId: number;

      if (!documentId) {
        const created = await createNlpDocument(sourceText);
        documentId = created.document_id;
        versionId = created.version_id;
        setNlpDocumentId(created.document_id);
      } else {
        try {
          const createdVersion = await createNlpDocumentVersion(documentId, sourceText);
          versionId = createdVersion.version_id;
        } catch (versionError) {
          const message =
            versionError instanceof Error ? versionError.message : String(versionError);
          if (!message.includes('404')) {
            throw versionError;
          }
          const recreated = await createNlpDocument(sourceText);
          documentId = recreated.document_id;
          versionId = recreated.version_id;
          setNlpDocumentId(recreated.document_id);
        }
      }

      const analysis = await analyzeNlpVersion(versionId);
      const mappedFindings: Finding[] = [];
      let syntheticId = 1;

      if (preset.id === 'style_tighten') {
        const [adverbResponse, descriptionResponse] = await Promise.all([
          getNlpAdverbTool(analysis.analysis_id),
          getNlpDescriptionTool(analysis.analysis_id),
        ]);
        adverbResponse.items.forEach((item) => {
          mappedFindings.push({
            id: syntheticId,
            analysis_run_id: analysis.analysis_id,
            session_id: session.id,
            finding_type: 'adverb',
            severity: 'warn',
            start_offset: item.start,
            end_offset: item.end,
            explanation: FINDING_HINTS.adverb,
            metrics: {
              token: item.text,
              kind: item.kind,
              finding_id: item.finding_id,
            },
          });
          syntheticId += 1;
        });
        descriptionResponse.items.forEach((item) => {
          mappedFindings.push({
            id: syntheticId,
            analysis_run_id: analysis.analysis_id,
            session_id: session.id,
            finding_type: 'description',
            severity: 'info',
            start_offset: item.start,
            end_offset: item.end,
            explanation: FINDING_HINTS.description,
            metrics: {
              token: item.text,
              kind: item.kind,
              sentence_i: item.sentence_i,
              finding_id: item.finding_id,
            },
          });
          syntheticId += 1;
        });
      }

      if (preset.id === 'consistency_pov_tense') {
        const tenseResponse = await getNlpTensePovTool(analysis.analysis_id);
        tenseResponse.markers.forEach((marker) => {
          mappedFindings.push({
            id: syntheticId,
            analysis_run_id: analysis.analysis_id,
            session_id: session.id,
            finding_type: 'tense_pov',
            severity: 'warn',
            start_offset: marker.start,
            end_offset: marker.end,
            explanation: FINDING_HINTS.tense_pov,
            metrics: {
              sentence_i: marker.sentence_i,
              sentence_tense: marker.sentence_tense,
              sentence_pov: marker.sentence_pov,
              reasons: marker.reasons,
              finding_id: marker.finding_id,
            },
          });
          syntheticId += 1;
        });
      }

      if (preset.id === 'repetitions_kwic') {
        const term = kwicTerm.trim();
        const kwicResponse = await getNlpKwic(analysis.analysis_id, term);
        kwicResponse.matches.forEach((match) => {
          mappedFindings.push({
            id: syntheticId,
            analysis_run_id: analysis.analysis_id,
            session_id: session.id,
            finding_type: 'kwic',
            severity: 'info',
            start_offset: match.start,
            end_offset: match.end,
            explanation: FINDING_HINTS.kwic,
            metrics: {
              sentence_i: match.sentence_i,
              left: match.left,
              match: match.match,
              right: match.right,
              term,
            },
          });
          syntheticId += 1;
        });
      }

      setScanMeta({
        documentId,
        versionId,
        analysisId: analysis.analysis_id,
        scannedText: text,
        scannedAt: new Date().toISOString(),
        preset: preset.id,
        kwicTerm: preset.needsTerm ? kwicTerm.trim() : undefined,
      });
      setAnalysisStale(false);
      setFindings(mappedFindings);
      setIgnoredFindingIds(new Set());
      setActiveFindingIndex(0);
      setReviewStarted(false);
      setFindingListOpen(false);
      setDrawerOpen(true);
      const nextToggles: Record<string, boolean> = {};
      preset.categories.forEach((category) => {
        nextToggles[category] = true;
      });
      setFindingToggles(nextToggles);
    } catch (err) {
      setAnalysisError(
        err instanceof Error ? err.message : 'Hinweise konnten nicht erstellt werden.',
      );
    } finally {
      setAnalysisLoading(false);
    }
  }, [kwicTerm, nlpDocumentId, session, text, workshopPreset]);

  useEffect(() => {
    if (visibleFindings.length === 0) {
      setActiveFindingIndex(0);
      setReviewStarted(false);
      return;
    }
    setActiveFindingIndex((prev) => Math.min(prev, visibleFindings.length - 1));
  }, [visibleFindings]);

  const activeReviewFinding =
    visibleFindings.length > 0 ? visibleFindings[activeFindingIndex] : null;

  const jumpToFinding = useCallback(
    (finding: Finding) => {
      setActiveTab('analysis');
      if (editorMode === 'blocks') {
        let target: Block | null = null;
        let localStart = 0;
        let localEnd = 0;
        for (const range of activeBlockRanges) {
          const { block, start, end } = range;
          if (finding.start_offset < end && finding.end_offset > start) {
            target = block;
            localStart = Math.max(0, finding.start_offset - start);
            localEnd = Math.min(block.text.length, finding.end_offset - start);
            break;
          }
        }
        if (target) {
          setExpandedBlockId(target.id);
          setSelectedBlockIds(new Set([target.id]));
          setActiveBlockMatch({
            blockId: target.id,
            start: localStart,
            end: Math.max(localStart, localEnd),
          });
          scrollToBlock(target.id);
          return;
        }
      }
      handleJumpToRange(finding.start_offset, finding.end_offset);
    },
    [activeBlockRanges, editorMode, handleJumpToRange, scrollToBlock],
  );

  const handlePrevFinding = useCallback(() => {
    if (visibleFindings.length === 0) return;
    setActiveFindingIndex((prev) => {
      const next = prev <= 0 ? visibleFindings.length - 1 : prev - 1;
      const finding = visibleFindings[next];
      if (finding) {
        jumpToFinding(finding);
      }
      return next;
    });
  }, [jumpToFinding, visibleFindings]);

  const handleNextFinding = useCallback(() => {
    if (visibleFindings.length === 0) return;
    setActiveFindingIndex((prev) => {
      const next = prev >= visibleFindings.length - 1 ? 0 : prev + 1;
      const finding = visibleFindings[next];
      if (finding) {
        jumpToFinding(finding);
      }
      return next;
    });
  }, [jumpToFinding, visibleFindings]);

  const handleIgnoreFinding = useCallback((findingId: number) => {
    setIgnoredFindingIds((prev) => {
      const next = new Set(prev);
      next.add(findingId);
      return next;
    });
  }, []);

  const handleRestoreIgnoredFinding = useCallback((findingId: number) => {
    setIgnoredFindingIds((prev) => {
      const next = new Set(prev);
      next.delete(findingId);
      return next;
    });
  }, []);

  const handleOpenAdverbPreview = useCallback(async () => {
    if (!scanMeta) return;
    if (analysisStale) {
      setAnalysisError('Bitte zuerst erneut scannen, damit die Vorschau aktuell ist.');
      return;
    }
    setPreviewAction({
      open: true,
      loading: true,
      saving: false,
      error: null,
      diff: '',
      afterText: '',
      nlpVersionId: null,
    });
    try {
      const action = await runRemoveAdverbsAction(scanMeta.versionId, {
        voice_lock: false,
        no_new_facts: false,
      });
      const resultVersion = await getNlpVersion(action.new_version_id);
      setPreviewAction({
        open: true,
        loading: false,
        saving: false,
        error: null,
        diff: action.diff,
        afterText: resultVersion.text,
        nlpVersionId: action.new_version_id,
      });
    } catch (err) {
      setPreviewAction((prev) => ({
        ...prev,
        loading: false,
        error:
          err instanceof Error
            ? err.message
            : 'Vorschau konnte nicht geladen werden.',
      }));
    }
  }, [analysisStale, scanMeta]);

  const handleInlinePreviewRequest = useCallback(
    (_findingId: number) => {
      void handleOpenAdverbPreview();
    },
    [handleOpenAdverbPreview],
  );

  const closePreview = useCallback(() => {
    setPreviewAction({
      open: false,
      loading: false,
      saving: false,
      error: null,
      diff: '',
      afterText: '',
      nlpVersionId: null,
    });
  }, []);

  const handleSavePreviewAsVersion = useCallback(async () => {
    if (!previewAction.afterText || !session) return;
    setPreviewAction((prev) => ({ ...prev, saving: true, error: null }));
    try {
      const created = await createEdit(session.id, previewAction.afterText);
      const savedText = created.text ?? '';
      const alignedBlocks = parseTextToBlocks(savedText, blocks);
      const versionPayload: SessionVersion = {
        id: String(created.id),
        sessionId: String(created.id),
        createdAt: created.created_at,
        rawText: savedText,
        blocks: alignedBlocks,
        hints: [],
      };
      const storeKey = getVersionStoreKey(created);
      saveLocalVersion(storeKey, versionPayload);
      setLocalVersions((prev) => ({ ...prev, [versionPayload.id]: versionPayload }));

      setSession(created);
      suppressHistoryRef.current = true;
      setText(savedText);
      setBlocks(alignedBlocks);
      setParkedBlockIds(new Set());
      setBlocksSynced(true);
      setSelectedBlockIds(new Set());
      setExpandedBlockId(null);
      resetHistory({
        text: savedText,
        blocks: alignedBlocks,
        blocksSynced: true,
        parkedIds: [],
      });
      setFindings([]);
      setScanMeta(null);
      setAnalysisStale(false);
      setFindingToggles({});
      setIgnoredFindingIds(new Set());
      setReviewStarted(false);
      setFindingListOpen(false);
      setNotes([]);
      closePreview();
      if (!Number.isNaN(created.id)) {
        router.replace(`/session/edit?active=${created.id}`);
      }
      await Promise.all([loadVersions(created), loadNotes(created, savedText)]);
    } catch (err) {
      setPreviewAction((prev) => ({
        ...prev,
        saving: false,
        error:
          err instanceof Error
            ? err.message
            : 'Neue Version aus Vorschau konnte nicht gespeichert werden.',
      }));
    } finally {
      suppressHistoryRef.current = false;
    }
  }, [
    blocks,
    closePreview,
    loadNotes,
    loadVersions,
    previewAction.afterText,
    resetHistory,
    router,
    session,
  ]);

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

  const totalMatches =
    editorMode === 'blocks' ? flatBlockMatches.length : textMatchPositions.length;
  const hasScanResults = findings.length > 0;
  const chipsEnabled = hasScanResults && !analysisLoading;

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
            <div className="inline-flex overflow-hidden rounded-lg border border-[#2f2822]">
              <button
                type="button"
                onClick={() => handleModeChange('text')}
                className={`px-3 py-2 text-sm ${
                  editorMode === 'text'
                    ? 'bg-[#211a13] text-[#f7f4ed]'
                    : 'bg-[#120f0c] text-[#cbbfb0]'
                }`}
              >
                Fließtext
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('blocks')}
                className={`px-3 py-2 text-sm ${
                  editorMode === 'blocks'
                    ? 'bg-[#211a13] text-[#f7f4ed]'
                    : 'bg-[#120f0c] text-[#cbbfb0]'
                }`}
              >
                Bausteine
              </button>
            </div>
            <div className="min-w-[220px]">
              <select
                value={workshopPreset}
                onChange={(event) =>
                  setWorkshopPreset(event.target.value as WorkshopPresetId | '')
                }
                disabled={editorMode !== 'blocks'}
                className="w-full rounded-lg border border-[#2f2822] bg-[#0f0c0a] px-3 py-2 text-xs text-[#f7f4ed] disabled:opacity-40"
              >
                <option value="">Werkstatt-Preset wählen...</option>
                {WORKSHOP_PRESETS.map((preset) => (
                  <option
                    key={preset.id}
                    value={preset.id}
                    disabled={!preset.enabled}
                  >
                    {preset.enabled
                      ? preset.label
                      : `${preset.label} (kommt bald)`}
                  </option>
                ))}
              </select>
            </div>
            {workshopPreset === 'repetitions_kwic' && (
              <input
                value={kwicTerm}
                onChange={(event) => setKwicTerm(event.target.value)}
                placeholder="Begriff..."
                className="w-40 rounded-lg border border-[#2f2822] bg-[#0f0c0a] px-3 py-2 text-xs text-[#f7f4ed] focus:outline-none"
              />
            )}
            <button
              type="button"
              onClick={handleRunAnalysis}
              disabled={
                analysisLoading ||
                editorMode !== 'blocks' ||
                !workshopPreset ||
                !WORKSHOP_PRESETS.find((preset) => preset.id === workshopPreset)
                  ?.enabled
              }
              className="inline-flex items-center gap-2 rounded-lg border border-[#3a3129] bg-[#2b2218] px-3 py-2 text-xs font-semibold text-[#f7f4ed] hover:bg-[#33281d] disabled:opacity-40"
            >
              <Sparkles size={13} />
              {analysisLoading ? 'Scan läuft...' : analysisStale ? 'Erneut scannen' : 'Scan starten'}
            </button>
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
              onClick={() => setDrawerOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-lg border border-[#2f2822] bg-[#18130f] px-3 py-2 text-sm text-[#f7f4ed] hover:bg-[#211a13]"
            >
              <ClipboardList size={16} />
              {drawerOpen ? 'Drawer schließen' : 'Drawer öffnen'}
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

        <div className="flex flex-col gap-6 xl:flex-row">
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
                <span>Bausteine: {activeBlocks.length}</span>
                {parkedBlockIds.size > 0 && <span>Ablage: {parkedBlockIds.size}</span>}
              </div>
            </div>

            <div className="rounded-2xl border border-[#2f2822] bg-[#120f0c] p-4">
              {editorMode === 'blocks' && (
                <div className="mb-3 rounded-xl border border-[#2f2822] bg-[#0f0c0a] px-3 py-2.5">
                  <div className="flex items-center justify-between text-xs text-[#cbbfb0]">
                    <span>Brille</span>
                    {analysisStale && (
                      <span className="rounded-full border border-[#5f4a31] bg-[#2f2316] px-2 py-0.5 text-[10px] text-[#f7d9a6]">
                        Scan empfohlen
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {selectedPreset?.categories.map((category) => {
                      const enabled = findingToggles[category] ?? false;
                      const disabled = !chipsEnabled;
                      return (
                        <div key={`chip-${category}`} className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() =>
                              setFindingToggles((prev) => ({
                                ...prev,
                                [category]: !enabled,
                              }))
                            }
                            className={`rounded-full border px-2 py-1 text-[11px] disabled:opacity-40 ${
                              enabled
                                ? 'border-[#5c4a34] bg-[#2f2316] text-[#f7d9a6]'
                                : 'border-[#2f2822] bg-[#18130f] text-[#f7f4ed]'
                            }`}
                          >
                            {CATEGORY_STYLE[category].badge} ({categoryCounts[category] ?? 0})
                          </button>
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => {
                              const next: Record<string, boolean> = {};
                              selectedPreset.categories.forEach((entry) => {
                                next[entry] = entry === category;
                              });
                              setFindingToggles(next);
                            }}
                            className="rounded-full border border-[#2f2822] bg-[#18130f] px-2 py-1 text-[10px] text-[#f7f4ed] disabled:opacity-40"
                          >
                            Solo
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {!chipsEnabled && (
                    <div className="mt-2 text-[11px] text-[#cbbfb0]">
                      Noch kein Scan - starte Werkzeuge.
                    </div>
                  )}
                </div>
              )}

              {editorMode === 'text' ? (
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={handleTextChange}
                  onSelect={handleSelection}
                  placeholder={loading ? 'Lade Session...' : 'Text bearbeiten'}
                  className="min-h-[360px] w-full resize-y rounded-lg border border-[#2f2822] bg-[#0f0c0a] p-4 text-sm leading-relaxed text-[#f7f4ed] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9b18a]"
                  spellCheck
                />
              ) : (
                <BlockEditor
                  blocks={blocks}
                  parkedIds={parkedBlockIds}
                  onChange={commitBlocksChange}
                  selectedIds={selectedBlockIds}
                  onSelectedIdsChange={setSelectedBlockIds}
                  expandedBlockId={expandedBlockId}
                  onExpandedBlockIdChange={setExpandedBlockId}
                  activeMatchBlockId={activeBlockMatch?.blockId ?? null}
                  activeFindingId={activeReviewFinding?.id ?? null}
                  matchCounts={blockMatchCounts}
                  findingSpansByBlock={analysisStale ? {} : findingSpansByBlock}
                  findingCountsByBlock={findingCountsByBlock}
                  findingStyles={findingStyles}
                  analysisStale={analysisStale}
                  allowInlinePreviewAction={Boolean(
                    selectedPreset?.supportsAdverbAction,
                  )}
                  onRequestPreview={handleInlinePreviewRequest}
                  onIgnoreFinding={handleIgnoreFinding}
                  blockRefs={blockRefs}
                />
              )}
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
                {editorMode === 'blocks' && (
                  <label className="inline-flex items-center gap-2 text-xs text-[#cbbfb0]">
                    <input
                      type="checkbox"
                      checked={replaceSelectionOnly}
                      onChange={(event) =>
                        setReplaceSelectionOnly(event.target.checked)
                      }
                    />
                    Nur Auswahl ersetzen
                  </label>
                )}
                <span className="text-xs text-[#cbbfb0]">{totalMatches} Treffer</span>
              </div>

              {editorMode === 'blocks' && findQuery && (
                <div className="rounded-lg border border-[#2f2822] bg-[#0f0c0a] p-3 text-xs text-[#d6c9ba] space-y-2 max-h-[220px] overflow-auto">
                  {blockMatchGroups.length === 0 ? (
                    <p className="text-[11px] text-[#cbbfb0]">
                      Keine Treffer in Bausteinen.
                    </p>
                  ) : (
                    blockMatchGroups.map((group) => (
                      <button
                        key={`block-match-${group.block.id}`}
                        type="button"
                        onClick={() => {
                          const firstHit = group.positions[0];
                          setActiveBlockMatch({
                            blockId: group.block.id,
                            start: firstHit,
                            end: firstHit + findQuery.length,
                          });
                          scrollToBlock(group.block.id);
                        }}
                        className="w-full text-left rounded-md border border-[#2f2822] bg-[#120f0c] px-3 py-2 hover:bg-[#191511]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">
                            Block #{group.index + 1} ·{' '}
                            {BLOCK_TYPE_LABELS[group.block.type]}
                          </span>
                          <span className="text-[11px] text-[#cbbfb0]">
                            {group.positions.length} Treffer
                          </span>
                        </div>
                        <div className="mt-1 text-[11px] text-[#cbbfb0]">
                          {buildSnippet(
                            group.block.text,
                            group.positions[0],
                            group.positions[0] + findQuery.length,
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </section>

          <aside
            className={`w-full shrink-0 transition-all duration-200 ${
              drawerOpen ? 'xl:w-[360px]' : 'xl:w-[76px]'
            }`}
          >
            <div className="overflow-hidden rounded-2xl border border-[#2f2822] bg-[#120f0c]">
              <div className="flex flex-row items-center gap-1 border-b border-[#2f2822] p-2 xl:flex-col xl:items-stretch">
                <button
                  type="button"
                  onClick={() => setDrawerOpen((prev) => !prev)}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-[#2f2822] bg-[#18130f] px-2 text-xs text-[#f7f4ed] hover:bg-[#211a13]"
                >
                  {drawerOpen ? '<<' : '>>'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(true);
                    setActiveTab('analysis');
                  }}
                  className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-2 text-xs ${
                    activeTab === 'analysis'
                      ? 'border-[#c9b18a] bg-[#211a13] text-[#f7f4ed]'
                      : 'border-[#2f2822] bg-[#120f0c] text-[#cbbfb0]'
                  }`}
                  title="Hinweise"
                >
                  <Sparkles size={14} />
                  {drawerOpen && <span>Hinweise</span>}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(true);
                    setActiveTab('notes');
                  }}
                  className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-2 text-xs ${
                    activeTab === 'notes'
                      ? 'border-[#c9b18a] bg-[#211a13] text-[#f7f4ed]'
                      : 'border-[#2f2822] bg-[#120f0c] text-[#cbbfb0]'
                  }`}
                  title="Notizen"
                >
                  <ClipboardList size={14} />
                  {drawerOpen && <span>Notizen</span>}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(true);
                    setActiveTab('versions');
                  }}
                  className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-2 text-xs ${
                    activeTab === 'versions'
                      ? 'border-[#c9b18a] bg-[#211a13] text-[#f7f4ed]'
                      : 'border-[#2f2822] bg-[#120f0c] text-[#cbbfb0]'
                  }`}
                  title="Versionen"
                >
                  <RefreshCcw size={14} />
                  {drawerOpen && <span>Versionen</span>}
                </button>
              </div>

              {drawerOpen ? (
                <div className="max-h-[70vh] space-y-4 overflow-auto p-4 xl:max-h-[calc(100vh-10rem)]">

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
                          <span className="font-semibold">Version #{version.id}</span>
                          <span>{formatDate(version.created_at)}</span>
                        </div>
                        <div className="mt-1 text-[11px] text-[#cbbfb0]">
                          {version.word_count ?? 0} Wörter ·{' '}
                          {version.char_count ?? 0} Zeichen
                        </div>
                        {localVersions[String(version.id)] && (
                          <div className="mt-1 text-[10px] text-[#cbbfb0]">
                            <span className="rounded-full border border-[#4a3d2b] bg-[#2b2218] px-2 py-0.5 text-[9px] uppercase tracking-wide text-[#f7f4ed]">
                              Bausteine
                            </span>
                          </div>
                        )}
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
                {editorMode === 'blocks' && (
                  <div className="rounded-lg border border-[#4a3d2b] bg-[#2b2218] px-3 py-2 text-[11px] text-[#f7f4ed]">
                    Notizen lassen sich nur im Fließtext-Modus anlegen.
                  </div>
                )}
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
                    disabled={!selection || !noteDraft.trim() || editorMode !== 'text'}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#2f2822] bg-[#18130f] px-3 py-2 text-xs text-[#f7f4ed] hover:bg-[#211a13] disabled:opacity-40"
                  >
                    Notiz speichern
                  </button>
                  {!selection && editorMode === 'text' && (
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
                              onChange={(event) =>
                                setEditingNoteText(event.target.value)
                              }
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
              <div className="space-y-3">
                <div className="rounded-lg border border-[#2f2822] bg-[#0f0c0a] p-3 text-[11px] text-[#d6c9ba] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#f7f4ed]">Hinweise</span>
                    <button
                      type="button"
                      onClick={handleRunAnalysis}
                      disabled={analysisLoading || !session || !workshopPreset}
                      className="inline-flex items-center gap-2 rounded-md border border-[#2f2822] bg-[#18130f] px-2 py-1 text-[11px] text-[#f7f4ed] hover:bg-[#211a13] disabled:opacity-40"
                    >
                      <Sparkles size={12} />
                      {analysisLoading
                        ? 'Scan läuft...'
                        : analysisStale
                          ? 'Erneut scannen'
                          : 'Scan starten'}
                    </button>
                  </div>

                  {!selectedPreset ? (
                    <div className="text-[#cbbfb0]">
                      Noch kein Preset aktiv. Wähle ein Preset und starte den Scan.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-[#f7f4ed]">{selectedPreset.label}</div>
                      <div>
                        Scan: {scanMeta ? formatDateTime(scanMeta.scannedAt) : 'Noch kein Scan'}
                      </div>
                      <div>
                        Status:{' '}
                        {scanMeta ? (analysisStale ? 'veraltet' : 'frisch') : 'ausstehend'}
                      </div>
                      <div>
                        Aktiv: {visibleFindings.length} · Ignoriert: {ignoredFindings.length}
                      </div>
                    </div>
                  )}

                  {analysisError && (
                    <div className="rounded border border-red-900/60 bg-red-950/60 px-2 py-1 text-red-100">
                      {analysisError}
                    </div>
                  )}
                </div>

                {findings.length === 0 ? (
                  <div className="rounded-lg border border-[#2f2822] bg-[#0f0c0a] px-3 py-3 text-xs text-[#cbbfb0]">
                    Noch kein Scan - starte Werkzeuge.
                  </div>
                ) : visibleFindings.length === 0 ? (
                  <div className="rounded-lg border border-[#2f2822] bg-[#0f0c0a] px-3 py-3 text-xs text-[#cbbfb0]">
                    Keine aktiven Hinweise sichtbar. Passe die Brille-Chips an.
                  </div>
                ) : !reviewStarted ? (
                  <div className="rounded-lg border border-[#3a3129] bg-[#1a140f] p-3 text-[12px] text-[#e6d8c8] space-y-2">
                    <div className="font-semibold text-[#f7f4ed]">
                      {visibleFindings.length} Hinweise bereit
                    </div>
                    <div>
                      Review läuft linear: immer ein Hinweis, klare Aktionen, kein
                      Kartenlärm.
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setReviewStarted(true);
                        setActiveFindingIndex(0);
                        const firstFinding = visibleFindings[0];
                        if (firstFinding) {
                          jumpToFinding(firstFinding);
                        }
                      }}
                      className="rounded-md border border-[#3a3129] bg-[#2b2218] px-2 py-1 text-[11px] text-[#f7f4ed]"
                    >
                      Review starten
                    </button>
                  </div>
                ) : activeReviewFinding ? (
                  <div className="rounded-lg border border-[#3a3129] bg-[#1a140f] p-3 text-[12px] text-[#e6d8c8] space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[#f7f4ed]">
                        Review {activeFindingIndex + 1}/{visibleFindings.length}
                      </span>
                      <span className="rounded-full border border-[#4a3d2b] bg-[#2b2218] px-2 py-0.5 text-[10px] text-[#f7d8b1]">
                        {CATEGORY_STYLE[
                          activeReviewFinding.finding_type as WorkshopCategory
                        ]?.badge ?? activeReviewFinding.finding_type}
                      </span>
                    </div>

                    <div className="rounded-md border border-[#2f2822] bg-[#0f0c0a] px-2 py-2 text-[#cbbfb0]">
                      {buildSnippet(
                        text,
                        activeReviewFinding.start_offset,
                        activeReviewFinding.end_offset,
                      )}
                    </div>

                    <div>
                      {activeReviewFinding.explanation ??
                        FINDING_HINTS[
                          activeReviewFinding.finding_type as WorkshopCategory
                        ] ??
                        'Prüfe diese Stelle im Kontext.'}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePrevFinding}
                        className="rounded-md border border-[#2f2822] bg-[#18130f] px-2 py-1 text-[11px] text-[#f7f4ed]"
                      >
                        Vorheriger
                      </button>
                      <button
                        type="button"
                        onClick={handleNextFinding}
                        className="rounded-md border border-[#2f2822] bg-[#18130f] px-2 py-1 text-[11px] text-[#f7f4ed]"
                      >
                        Nächster
                      </button>
                      <button
                        type="button"
                        onClick={() => jumpToFinding(activeReviewFinding)}
                        className="rounded-md border border-[#2f2822] bg-[#18130f] px-2 py-1 text-[11px] text-[#f7f4ed]"
                      >
                        Zur Stelle
                      </button>
                      <button
                        type="button"
                        onClick={() => handleIgnoreFinding(activeReviewFinding.id)}
                        className="rounded-md border border-[#2f2822] bg-[#18130f] px-2 py-1 text-[11px] text-[#f7f4ed]"
                      >
                        Ignorieren
                      </button>
                      {selectedPreset?.supportsAdverbAction && (
                        <button
                          type="button"
                          onClick={handleOpenAdverbPreview}
                          disabled={analysisStale || analysisLoading}
                          className="rounded-md border border-[#3a3129] bg-[#2b2218] px-2 py-1 text-[11px] text-[#f7f4ed] disabled:opacity-40"
                        >
                          Vorschau...
                        </button>
                      )}
                    </div>
                  </div>
                ) : null}

                {findings.length > 0 && (
                  <details
                    open={findingListOpen}
                    onToggle={(event) => setFindingListOpen(event.currentTarget.open)}
                    className="rounded-lg border border-[#2f2822] bg-[#0f0c0a] p-3"
                  >
                    <summary className="cursor-pointer text-[11px] text-[#cbbfb0]">
                      Liste anzeigen
                    </summary>
                    <div className="mt-2 max-h-[220px] space-y-2 overflow-auto text-[11px] text-[#d6c9ba]">
                      {visibleFindings.map((finding, index) => (
                        <button
                          key={`review-list-${finding.id}`}
                          type="button"
                          onClick={() => {
                            setReviewStarted(true);
                            setActiveFindingIndex(index);
                            jumpToFinding(finding);
                          }}
                          className={`w-full rounded-md border px-2 py-2 text-left ${
                            index === activeFindingIndex
                              ? 'border-[#c9b18a] bg-[#201911]'
                              : 'border-[#2f2822] bg-[#120f0c]'
                          }`}
                        >
                          {buildSnippet(text, finding.start_offset, finding.end_offset)}
                        </button>
                      ))}
                    </div>
                  </details>
                )}

                {ignoredFindings.length > 0 && (
                  <div className="rounded-lg border border-[#3a3129] bg-[#17120e] p-3 text-[11px] text-[#d8c8b8] space-y-2">
                    <div className="font-semibold text-[#f7f4ed]">
                      Ignoriert ({ignoredFindings.length})
                    </div>
                    <div className="max-h-[120px] overflow-auto space-y-1">
                      {ignoredFindings.map((finding) => (
                        <div
                          key={`ignored-${finding.id}`}
                          className="flex items-center justify-between gap-2 rounded border border-[#2f2822] bg-[#0f0c0a] px-2 py-1"
                        >
                          <span className="line-clamp-1">
                            {buildSnippet(
                              text,
                              finding.start_offset,
                              finding.end_offset,
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRestoreIgnoredFinding(finding.id)}
                            className="rounded border border-[#2f2822] bg-[#18130f] px-2 py-0.5 text-[10px] text-[#f7f4ed]"
                          >
                            Zurückholen
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
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
                        setDiffA(
                          event.target.value ? Number(event.target.value) : null,
                        )
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
                        setDiffB(
                          event.target.value ? Number(event.target.value) : null,
                        )
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
                {blockDiff && blockDiff.length > 0 && (
                  <div className="rounded-lg border border-[#2f2822] bg-[#0f0c0a] p-3">
                    <div className="text-[11px] text-[#cbbfb0] mb-2">
                      Baustein-Bewegungen (heuristisch)
                    </div>
                    <ul className="space-y-2 text-[11px] text-[#d6c9ba]">
                      {blockDiff.slice(0, 8).map((item, idx) => (
                        <li
                          key={`${item.hash}-${idx}`}
                          className="rounded-md border border-[#2f2822] bg-[#120f0c] px-2 py-2"
                        >
                          <div className="flex items-center justify-between">
                            <span>
                              #{item.from + 1} → #{item.to + 1}
                            </span>
                            <span className="text-[10px] text-[#cbbfb0]">Move</span>
                          </div>
                          {item.preview && (
                            <div className="mt-1 text-[#cbbfb0]">{item.preview}</div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
                </div>
              ) : (
                <div className="p-3 text-[11px] text-[#cbbfb0]">
                  Drawer geschlossen - öffne rechts für Hinweise, Notizen und Versionen.
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {previewAction.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-3xl rounded-2xl border border-[#2f2822] bg-[#120f0c] p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#f7f4ed]">
                Adverbien straffen – Vorschau
              </h3>
              <button
                type="button"
                onClick={closePreview}
                className="rounded border border-[#2f2822] bg-[#18130f] px-2 py-1 text-xs text-[#f7f4ed]"
              >
                Schließen
              </button>
            </div>

            {previewAction.loading ? (
              <div className="rounded-lg border border-[#2f2822] bg-[#0f0c0a] p-4 text-sm text-[#cbbfb0]">
                Lade Vorschau...
              </div>
            ) : previewAction.error ? (
              <div className="rounded-lg border border-red-900/60 bg-red-950/60 px-3 py-2 text-sm text-red-100">
                {previewAction.error}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg border border-[#2f2822] bg-[#0f0c0a] p-3">
                  <div className="text-[11px] text-[#cbbfb0] mb-2">Diff</div>
                  <pre className="max-h-[240px] overflow-auto whitespace-pre-wrap text-[11px] leading-relaxed text-[#f7f4ed]">
                    {previewAction.diff || 'Kein Diff verfügbar.'}
                  </pre>
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closePreview}
                disabled={previewAction.saving}
                className="rounded border border-[#2f2822] bg-[#18130f] px-3 py-2 text-sm text-[#f7f4ed] disabled:opacity-40"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleSavePreviewAsVersion}
                disabled={
                  previewAction.loading ||
                  previewAction.saving ||
                  !previewAction.afterText
                }
                className="inline-flex items-center gap-2 rounded border border-[#3a3129] bg-[#2b2218] px-3 py-2 text-sm font-semibold text-[#f7f4ed] disabled:opacity-40"
              >
                {previewAction.saving ? 'Speichere...' : 'Als neue Version speichern'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

