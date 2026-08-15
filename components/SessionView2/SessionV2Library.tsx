'use client';

import Link from 'next/link';
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Plus, Search, Shuffle, X } from 'lucide-react';

import { useSessionData } from '@/components/SessionView/useSessionData';
import type { Session } from '@/components/SessionView/types';
import {
  compactWhitespace,
  formatDateTime,
  getReadingMinutes,
  getSentenceCount,
  getSessionTitle,
  getTagKey,
  getWordCount,
  normalizeTagInput,
} from './sessionView2Utils';

type SortMode =
  | 'newest'
  | 'oldest'
  | 'longest'
  | 'shortest'
  | 'mostSentences'
  | 'fewestSentences'
  | 'random';

type UpdateResult = { success: boolean; error?: string };

const sortLabels: Record<SortMode, string> = {
  newest: 'Neueste zuerst',
  oldest: 'Aelteste zuerst',
  longest: 'Laengste zuerst',
  shortest: 'Kuerzeste zuerst',
  mostSentences: 'Meiste Saetze zuerst',
  fewestSentences: 'Wenigste Saetze zuerst',
  random: 'Mischen',
};

const isUpdateSuccess = (result: { success: boolean } | { success: boolean; error?: string }) =>
  result.success;

export function SessionV2Library() {
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [tagSearch, setTagSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortMode>('newest');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [randomSeed, setRandomSeed] = useState(() => Date.now());
  const [localTagVocabulary, setLocalTagVocabulary] = useState<string[]>([]);
  const randomOrderRef = useRef(new Map<number, number>());

  const {
    sessions,
    pagination,
    isLoading,
    isLoadingMore,
    isUpdating,
    deletingSessionIds,
    hasMore,
    error,
    loadMore,
    updateSession,
    deleteSession,
    refreshSessions,
  } = useSessionData({
    pageSize: 40,
    prefetchDelayMs: 80,
    autoPrefetch: false,
  });

  useEffect(() => {
    if (!hasMore || isLoading || isLoadingMore) return;
    const timer = window.setTimeout(() => {
      void loadMore();
    }, 40);
    return () => window.clearTimeout(timer);
  }, [hasMore, isLoading, isLoadingMore, loadMore, sessions.length]);

  useEffect(() => {
    randomOrderRef.current.clear();
  }, [randomSeed]);

  const archiveComplete =
    !hasMore &&
    !isLoading &&
    !isLoadingMore &&
    (pagination.total === undefined || sessions.length >= pagination.total);

  const tagVocabulary = useMemo(() => {
    const byKey = new Map<string, string>();
    for (const tag of localTagVocabulary) {
      const key = getTagKey(tag);
      if (key && !byKey.has(key)) byKey.set(key, tag);
    }
    for (const session of sessions) {
      for (const tag of session.tags ?? []) {
        const key = getTagKey(tag);
        if (key && !byKey.has(key)) byKey.set(key, tag.trim());
      }
    }
    return Array.from(byKey.values()).sort((a, b) => a.localeCompare(b, 'de'));
  }, [localTagVocabulary, sessions]);

  const findExistingTag = useCallback(
    (value: string) => {
      const key = getTagKey(value);
      return tagVocabulary.find((tag) => getTagKey(tag) === key) ?? null;
    },
    [tagVocabulary],
  );

  const getRandomOrder = useCallback(
    (id: number) => {
      const existing = randomOrderRef.current.get(id);
      if (existing != null) return existing;
      const key = (Math.sin(id * 9301 + randomSeed * 49297) + 1) / 2;
      randomOrderRef.current.set(id, key);
      return key;
    },
    [randomSeed],
  );

  const visibleSessions = useMemo(() => {
    const query = compactWhitespace(deferredSearch).toLocaleLowerCase('de-DE');
    const activeTagKey = activeTag ? getTagKey(activeTag) : null;

    const filtered = sessions.filter((session) => {
      if (activeTagKey) {
        const hasTag = (session.tags ?? []).some((tag) => getTagKey(tag) === activeTagKey);
        if (!hasTag) return false;
      }

      if (!query) return true;
      const haystack = [
        session.title ?? '',
        session.text ?? '',
        ...(session.tags ?? []),
      ]
        .join(' ')
        .toLocaleLowerCase('de-DE');
      return haystack.includes(query);
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'random') return getRandomOrder(a.id) - getRandomOrder(b.id);
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === 'longest') return getWordCount(b) - getWordCount(a);
      if (sortBy === 'shortest') return getWordCount(a) - getWordCount(b);
      if (sortBy === 'mostSentences') return getSentenceCount(b) - getSentenceCount(a);
      if (sortBy === 'fewestSentences') return getSentenceCount(a) - getSentenceCount(b);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [activeTag, deferredSearch, getRandomOrder, sessions, sortBy]);

  const tagChoices = useMemo(() => {
    const query = normalizeTagInput(tagSearch);
    if (!query) return tagVocabulary.slice(0, 18);
    return tagVocabulary.filter((tag) => getTagKey(tag).includes(query)).slice(0, 18);
  }, [tagSearch, tagVocabulary]);

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const session of sessions) {
      const seen = new Set<string>();
      for (const tag of session.tags ?? []) {
        const key = getTagKey(tag);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    return counts;
  }, [sessions]);

  const loadedLabel =
    pagination.total !== undefined
      ? archiveComplete
        ? `${sessions.length.toLocaleString('de-DE')} Sessions - vollstaendig`
        : `${sessions.length.toLocaleString('de-DE')} / ${pagination.total.toLocaleString(
            'de-DE',
          )} geladen ...`
      : archiveComplete
        ? `${sessions.length.toLocaleString('de-DE')} Sessions - vollstaendig`
        : `${sessions.length.toLocaleString('de-DE')} geladen ...`;
  const compactLoadedLabel =
    pagination.total !== undefined
      ? archiveComplete
        ? `${sessions.length.toLocaleString('de-DE')} vollst.`
        : `${sessions.length.toLocaleString('de-DE')}/${pagination.total.toLocaleString('de-DE')}`
      : `${sessions.length.toLocaleString('de-DE')}`;

  const disableGlobalOrdering = !archiveComplete;

  const handleSort = (nextSort: SortMode) => {
    if (disableGlobalOrdering) return;
    setSortBy(nextSort);
    setSortMenuOpen(false);
  };

  const handleShuffle = () => {
    if (disableGlobalOrdering) return;
    if (sortBy !== 'random') {
      setSortBy('random');
      setRandomSeed(Date.now());
      return;
    }
    setRandomSeed(Date.now());
  };

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setSortMenuOpen(false);
      setSearchOpen(false);
      setTagsOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  const handleTagUpdate = async (
    session: Session,
    nextTags: string[],
  ): Promise<UpdateResult> => {
    const result = await updateSession(session.id, { tags: nextTags });
    if (isUpdateSuccess(result)) {
      setLocalTagVocabulary((current) => {
        const byKey = new Map(current.map((tag) => [getTagKey(tag), tag]));
        for (const tag of nextTags) {
          const key = getTagKey(tag);
          if (key && !byKey.has(key)) byKey.set(key, tag);
        }
        return Array.from(byKey.values());
      });
      return { success: true };
    }
    return { success: false, error: 'error' in result ? result.error : undefined };
  };

  return (
    <section className="flex flex-1 flex-col">
      <div className="sticky top-0 z-30 border-b border-[#29241d] bg-[#0d0c0a]">
        <div className="mx-auto flex min-h-12 w-full max-w-6xl items-center gap-1 px-4 py-1.5 text-sm sm:gap-2 sm:px-6 lg:px-8">
          <div className="mr-auto hidden shrink-0 whitespace-nowrap text-xs text-[#8f8374] md:block">
            {loadedLabel}
          </div>
          <div className="mr-auto shrink-0 whitespace-nowrap text-xs text-[#8f8374] md:hidden">
            {compactLoadedLabel}
          </div>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setSortMenuOpen((value) => !value)}
              disabled={disableGlobalOrdering}
              aria-expanded={sortMenuOpen}
              className="inline-flex h-9 max-w-[7.5rem] items-center gap-1 rounded-md px-2 text-sm text-[#d8cec0] hover:bg-[#17130f] hover:text-[#f7f2e9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d8bd8b] disabled:cursor-wait disabled:opacity-50 sm:max-w-none sm:px-3"
            >
              <span className="truncate">
                {sortBy === 'random' ? 'Neueste zuerst' : sortLabels[sortBy]}
              </span>
              <ChevronDown size={15} />
            </button>
            {sortMenuOpen && !disableGlobalOrdering && (
              <div className="absolute right-0 top-10 z-40 w-64 border border-[#29241d] bg-[#100d0a] p-2 shadow-xl shadow-black/30">
                <SortGroup label="Zeit">
                  <SortButton active={sortBy === 'newest'} onClick={() => handleSort('newest')}>
                    Neueste zuerst
                  </SortButton>
                  <SortButton active={sortBy === 'oldest'} onClick={() => handleSort('oldest')}>
                    Aelteste zuerst
                  </SortButton>
                </SortGroup>
                <SortGroup label="Umfang">
                  <SortButton active={sortBy === 'longest'} onClick={() => handleSort('longest')}>
                    Laengste zuerst
                  </SortButton>
                  <SortButton active={sortBy === 'shortest'} onClick={() => handleSort('shortest')}>
                    Kuerzeste zuerst
                  </SortButton>
                  <SortButton
                    active={sortBy === 'mostSentences'}
                    onClick={() => handleSort('mostSentences')}
                  >
                    Meiste Saetze zuerst
                  </SortButton>
                  <SortButton
                    active={sortBy === 'fewestSentences'}
                    onClick={() => handleSort('fewestSentences')}
                  >
                    Wenigste Saetze zuerst
                  </SortButton>
                </SortGroup>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleShuffle}
            disabled={disableGlobalOrdering}
            className={`inline-flex h-9 shrink-0 items-center gap-1 rounded-md px-3 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f7f2e9] ${
              sortBy === 'random'
                ? 'bg-[#d8bd8b] text-[#16110b]'
                : 'bg-[#211b14] text-[#fdfaf3] hover:bg-[#2a2218]'
            } disabled:cursor-wait disabled:opacity-50`}
          >
            <Shuffle size={15} />
            <span className="hidden sm:inline">{sortBy === 'random' ? 'Neu mischen' : 'Mischen'}</span>
            <span className="sm:hidden">{sortBy === 'random' ? 'Neu' : 'Mix'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTagsOpen((value) => !value);
              setSearchOpen(false);
            }}
            aria-expanded={tagsOpen}
            className="inline-flex h-9 max-w-[8.5rem] shrink items-center gap-1 rounded-md px-2 text-sm text-[#d8cec0] hover:bg-[#17130f] hover:text-[#f7f2e9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d8bd8b] sm:max-w-none sm:px-3"
          >
            <span className="truncate">{activeTag ? `Tag: ${activeTag}` : 'Tags'}</span>
            <ChevronDown size={15} />
          </button>

          <button
            type="button"
            onClick={() => {
              setSearchOpen((value) => !value);
              setTagsOpen(false);
            }}
            aria-expanded={searchOpen}
            className="inline-flex h-9 shrink-0 items-center gap-1 rounded-md px-2 text-sm text-[#d8cec0] hover:bg-[#17130f] hover:text-[#f7f2e9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d8bd8b] sm:px-3"
          >
            <Search size={15} />
            <span className="hidden sm:inline">Suchen</span>
          </button>
        </div>

        {(searchOpen || tagsOpen || activeTag) && (
          <div className="border-t border-[#211c16] bg-[#0d0c0a]">
            <div className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
              {activeTag && !tagsOpen && (
                <button
                  type="button"
                  onClick={() => setActiveTag(null)}
                  className="rounded-md border border-[#29241d] px-2 py-1 text-xs text-[#d8bd8b] hover:bg-[#17130f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d8bd8b]"
                >
                  Tag: {activeTag} entfernen
                </button>
              )}

              {searchOpen && (
                <div className="flex max-w-xl items-center gap-2 border-b border-[#3a3128]">
                  <Search size={16} className="shrink-0 text-[#9c8f7f]" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    autoFocus
                    placeholder="Interne Suche filtern ..."
                    className="h-10 flex-1 bg-transparent text-sm text-[#fdfaf3] outline-none placeholder:text-[#756a5e]"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      aria-label="Suche leeren"
                      className="rounded-md p-2 text-[#9c8f7f] hover:bg-[#17130f] hover:text-[#f7f2e9]"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              )}

              {tagsOpen && (
                <div className="space-y-3">
                  <div className="flex max-w-xl items-center gap-2 border-b border-[#3a3128]">
                    <input
                      value={tagSearch}
                      onChange={(event) => setTagSearch(event.target.value)}
                      autoFocus
                      placeholder="Tags filtern ..."
                      className="h-10 flex-1 bg-transparent text-sm text-[#fdfaf3] outline-none placeholder:text-[#756a5e]"
                    />
                    {activeTag && (
                      <button
                        type="button"
                        onClick={() => setActiveTag(null)}
                        className="rounded-md px-2 py-1 text-xs text-[#d8bd8b] hover:bg-[#17130f]"
                      >
                        {activeTag} entfernen
                      </button>
                    )}
                  </div>
                  <div className="flex max-h-28 flex-wrap gap-2 overflow-auto">
                    {tagChoices.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setActiveTag(tag)}
                        className={`rounded-md border px-2 py-1 text-xs ${
                          activeTag && getTagKey(activeTag) === getTagKey(tag)
                            ? 'border-[#d8bd8b] bg-[#211b14] text-[#fdfaf3]'
                            : 'border-[#29241d] text-[#aa9e8d] hover:bg-[#17130f] hover:text-[#f7f2e9]'
                        }`}
                      >
                        {tag} {tagCounts.get(getTagKey(tag)) ?? 0}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mx-auto mt-8 w-full max-w-3xl border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-100">
          {error}
          <button
            type="button"
            onClick={() => void refreshSessions()}
            className="ml-3 underline underline-offset-4"
          >
            Erneut laden
          </button>
        </div>
      )}

      <div className="mx-auto w-full max-w-3xl">
        {isLoading && sessions.length === 0 ? (
          <p className="py-16 text-[#9c8f7f]">Archiv wird geladen...</p>
        ) : visibleSessions.length === 0 ? (
          <p className="py-16 text-[#9c8f7f]">Keine Sessions fuer diese Auswahl.</p>
        ) : (
          visibleSessions.map((session, index) => (
            <ArchiveSession
              key={session.id}
              session={session}
              isFirst={index === 0}
              tagVocabulary={tagVocabulary}
              findExistingTag={findExistingTag}
              onTagUpdate={handleTagUpdate}
              onTagFilter={setActiveTag}
              onDelete={deleteSession}
              isUpdating={isUpdating}
              isDeleting={deletingSessionIds.has(session.id)}
            />
          ))
        )}
      </div>
    </section>
  );
}

function SortGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[#29241d] py-2 last:border-b-0">
      <p className="px-2 pb-1 text-[11px] uppercase tracking-[0.16em] text-[#756a5e]">
        {label}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SortButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full rounded-md px-2 py-2 text-left text-sm ${
        active
          ? 'bg-[#211b14] text-[#fdfaf3]'
          : 'text-[#aa9e8d] hover:bg-[#17130f] hover:text-[#f7f2e9]'
      }`}
    >
      {children}
    </button>
  );
}

type ArchiveSessionProps = {
  session: Session;
  isFirst: boolean;
  tagVocabulary: string[];
  findExistingTag: (value: string) => string | null;
  onTagUpdate: (session: Session, nextTags: string[]) => Promise<UpdateResult>;
  onTagFilter: (tag: string) => void;
  onDelete: (id: number) => Promise<{ success: boolean; error?: string } | { success: boolean }>;
  isUpdating: boolean;
  isDeleting: boolean;
};

function ArchiveSession({
  session,
  isFirst,
  tagVocabulary,
  findExistingTag,
  onTagUpdate,
  onTagFilter,
  onDelete,
  isUpdating,
  isDeleting,
}: ArchiveSessionProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const title = session.title?.trim();
  const words = getWordCount(session);
  const sentences = getSentenceCount(session);
  const text = session.text ?? '';

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    const result = await onDelete(session.id);
    if (!result.success) setConfirmDelete(false);
  };

  return (
    <article
      id={`session-${session.id}`}
      data-session-id={session.id}
      className={`${isFirst ? 'pt-10' : 'border-t border-[#3a3128] pt-16'} pb-16`}
    >
      <header className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && (
              <h2 className="mb-3 text-2xl font-semibold leading-tight text-[#fdfaf3]">
                {title}
              </h2>
            )}
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-[#9c8f7f]">
              <time dateTime={session.created_at}>{formatDateTime(session.created_at)}</time>
              <span>{words.toLocaleString('de-DE')} Woerter</span>
              <span>{sentences.toLocaleString('de-DE')} Saetze</span>
              <span>{getReadingMinutes(session)} Min.</span>
              {session.version_count !== undefined && session.version_count > 1 && (
                <span>{session.version_count} Versionen</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[#8f8374]">
            {session.version_count !== undefined && session.version_count > 1 && (
              <Link
                href={`/session-v2/${session.id}`}
                className="underline-offset-4 hover:text-[#f7f2e9] hover:underline"
              >
                Versionen
              </Link>
            )}
            <Link
              href={`/session/edit?active=${session.id}`}
              className="underline-offset-4 hover:text-[#f7f2e9] hover:underline"
            >
              Bearbeiten
            </Link>
            <button
              type="button"
              onClick={() => setMoreOpen((value) => !value)}
              className="underline-offset-4 hover:text-[#f7f2e9] hover:underline"
            >
              ...
            </button>
          </div>
        </div>

        <div className="mt-5">
          <SessionTagEditor
            session={session}
            tagVocabulary={tagVocabulary}
            findExistingTag={findExistingTag}
            onTagUpdate={onTagUpdate}
            onTagFilter={onTagFilter}
            isUpdating={isUpdating}
          />
        </div>

        {moreOpen && (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#aa9e8d]">
            <button
              type="button"
              onClick={() => void navigator.clipboard?.writeText(text)}
              className="underline-offset-4 hover:text-[#f7f2e9] hover:underline"
            >
              Kopieren
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className={`underline-offset-4 hover:underline disabled:opacity-50 ${
                confirmDelete ? 'text-red-200' : ''
              }`}
            >
              {confirmDelete ? (isDeleting ? 'Loescht...' : 'Loeschen bestaetigen') : 'Loeschen'}
            </button>
          </div>
        )}
      </header>

      <div
        className="whitespace-pre-wrap font-serif text-[20px] leading-9 text-[#f1e8dc] sm:text-[22px] sm:leading-10"
        style={{ fontFeatureSettings: '"liga","kern"' }}
      >
        {text || 'Diese Session enthaelt keinen Text.'}
      </div>
    </article>
  );
}

type SessionTagEditorProps = {
  session: Session;
  tagVocabulary: string[];
  findExistingTag: (value: string) => string | null;
  onTagUpdate: (session: Session, nextTags: string[]) => Promise<UpdateResult>;
  onTagFilter: (tag: string) => void;
  isUpdating: boolean;
};

function SessionTagEditor({
  session,
  tagVocabulary,
  findExistingTag,
  onTagUpdate,
  onTagFilter,
  isUpdating,
}: SessionTagEditorProps) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const tags = useMemo(() => session.tags ?? [], [session.tags]);
  const tagKeys = useMemo(() => new Set(tags.map(getTagKey)), [tags]);
  const normalizedDraft = normalizeTagInput(draft);
  const existingTag = draft ? findExistingTag(draft) : null;
  const suggestions = useMemo(() => {
    if (!normalizedDraft) return tagVocabulary.filter((tag) => !tagKeys.has(getTagKey(tag))).slice(0, 8);
    return tagVocabulary
      .filter((tag) => getTagKey(tag).includes(normalizedDraft) && !tagKeys.has(getTagKey(tag)))
      .slice(0, 8);
  }, [normalizedDraft, tagKeys, tagVocabulary]);
  const canCreate =
    normalizedDraft.length > 0 &&
    !existingTag &&
    !Array.from(tagKeys).includes(getTagKey(normalizedDraft));

  const addTag = async (rawTag: string, isNew = false) => {
    const existing = findExistingTag(rawTag);
    const tag = existing ?? normalizeTagInput(rawTag);
    if (!tag) return;
    const key = getTagKey(tag);
    if (tagKeys.has(key)) {
      setFeedback('Tag bereits vorhanden');
      setDraft('');
      setAdding(false);
      return;
    }
    const nextTags = [...tags, tag];
    const result = await onTagUpdate(session, nextTags);
    if (result.success) {
      setFeedback(isNew && !existing ? 'Neuer Tag erstellt' : 'Tag hinzugefuegt');
      setDraft('');
      setAdding(false);
      window.setTimeout(() => setFeedback(null), 1600);
    } else {
      setFeedback(result.error ?? 'Tag konnte nicht gespeichert werden');
    }
  };

  return (
    <div className="text-sm">
      <div className="flex flex-wrap items-center gap-2">
        {tags.length === 0 && <span className="text-[#756a5e]">Keine Tags</span>}
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onTagFilter(tag)}
            className="rounded-md border border-[#29241d] px-2 py-1 text-xs text-[#d8cec0] hover:bg-[#17130f] hover:text-[#f7f2e9]"
          >
            {tag}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setAdding((value) => !value)}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[#d8bd8b] hover:bg-[#17130f]"
        >
          <Plus size={13} />
          Tag
        </button>
        {feedback && <span className="text-xs text-[#8fbc8f]">{feedback}</span>}
      </div>

      {adding && (
        <div className="mt-3 max-w-md border border-[#29241d] bg-[#100d0a] p-3">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            autoFocus
            placeholder="Tag suchen oder neu benennen"
            className="h-10 w-full border-b border-[#3a3128] bg-transparent text-sm text-[#fdfaf3] outline-none placeholder:text-[#756a5e]"
          />

          <div className="mt-3 space-y-3">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.16em] text-[#756a5e]">
                Bestehende Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.length === 0 ? (
                  <span className="text-xs text-[#756a5e]">Kein bestehender Tag gefunden.</span>
                ) : (
                  suggestions.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => void addTag(tag)}
                      disabled={isUpdating}
                      className="rounded-md border border-[#29241d] px-2 py-1 text-xs text-[#d8cec0] hover:bg-[#17130f] disabled:opacity-50"
                    >
                      {tag}
                    </button>
                  ))
                )}
              </div>
            </div>

            {canCreate && (
              <button
                type="button"
                onClick={() => void addTag(normalizedDraft, true)}
                disabled={isUpdating}
                className="inline-flex items-center gap-2 rounded-md border border-[#5b4630] px-2 py-1 text-xs text-[#f7f2e9] hover:bg-[#17130f] disabled:opacity-50"
              >
                <Check size={13} />
                Neuen Tag erstellen: {normalizedDraft}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
