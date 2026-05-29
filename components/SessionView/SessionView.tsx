'use client';
import React, {
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
  useRef,
  useEffect,
} from 'react';

import { FilePlus2, Filter, MoreHorizontal, Search, X } from 'lucide-react';
import { useSessionData } from './useSessionData';
import { SessionItem } from './SessionItem';
import type { Session } from './types';

export function SessionView() {
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const isSearching = search.trim().length > 0;
  const [sortBy, setSortBy] = useState<
    'newest' | 'oldest' | 'words' | 'letters' | 'random'
  >('newest');
  const [randomSeed, setRandomSeed] = useState(() => Date.now());
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');
  const [newTags, setNewTags] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const randomKeyRef = useRef(new Map<number, number>());

  useEffect(() => {
    randomKeyRef.current.clear();
  }, [randomSeed]);

  const getRandomKey = useCallback(
    (id: number) => {
      const map = randomKeyRef.current;
      const existing = map.get(id);
      if (existing != null) return existing;

      const key = (Math.random() + (randomSeed % 1000000) / 1000000) % 1;
      map.set(id, key);
      return key;
    },
    [randomSeed],
  );
  const {
    sessions,
    pagination,
    searchPage,
    isLoading,
    isLoadingMore,
    isCreating,
    isPending,
    isUpdating,
    hasMore,
    error,
    refreshSessions,
    loadMore,
    createSession,
    updateSession,
  } = useSessionData({
    pageSize: 50,
    prefetchDelayMs: 1200,
    autoPrefetch: !isSearching,
    searchQuery: deferredSearch,
  });

  const filtered = useMemo(() => {
    if (sortBy === 'random') {
      const alive = new Set(sessions.map((s) => s.id));
      randomKeyRef.current.forEach((_, id) => {
        if (!alive.has(id)) randomKeyRef.current.delete(id);
      });

      return [...sessions].sort(
        (a, b) => getRandomKey(a.id) - getRandomKey(b.id),
      );
    }

    const sorted = [...sessions].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case 'words':
          return (b.word_count ?? 0) - (a.word_count ?? 0);
        case 'letters':
          return (b.letter_count ?? 0) - (a.letter_count ?? 0);
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });

    return sorted;
  }, [getRandomKey, sessions, sortBy]);

  const resetCreateForm = () => {
    setNewTitle('');
    setNewText('');
    setNewTags('');
    setCreateError(null);
  };

  const handleCreateSession = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = newText.trim();
    if (!text) {
      setCreateError('Bitte erst einen Sessiontext schreiben.');
      return;
    }

    const tags = newTags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    const result = await createSession({
      text,
      title: newTitle.trim() || undefined,
      status: 'draft',
      tags,
    });

    if (!result.success) {
      setCreateError(result.error ?? 'Session konnte nicht erstellt werden.');
      return;
    }

    resetCreateForm();
    if (search.trim()) {
      setSearch('');
    }
  };

  return (
    <main className="min-h-screen bg-[#0b0a09] text-[#f7f4ed]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
          <div className="space-y-2">
            <p className="text-xs tracking-[0.25em] uppercase text-[#cbbfb0] font-semibold">
              Archiv
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold text-[#fdfbf7] leading-tight">
              Sessions als Blogposts
            </h1>
            <p className="text-sm text-[#d6c9ba] max-w-3xl">
              Schnell filtern, kopieren oder bearbeiten – mit optionaler
              Text-Analyse pro Session.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:min-w-[280px]">
            <div className="relative flex items-center gap-2 rounded-lg border border-[#2f2822] bg-[#120f0c] px-3 py-2">
              <Search size={18} className="text-[#cbbfb0]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Suchen (Titel, Text, Tags)"
                className="bg-transparent outline-none text-sm placeholder:text-[#6f6259] flex-1"
              />
            </div>
            {deferredSearch.trim() && (
              <p className="text-xs text-[#cbbfb0]">
                Suche laedt...
                {searchPage.next_cursor
                  ? ` (${sessions.length}+ Treffer...)`
                  : ` (${sessions.length} Treffer)`}
                {isPending ? ' - aktualisiere' : ''}
              </p>
            )}
            <div className="flex items-center gap-2 justify-end text-sm text-[#d6c9ba]">
              <Filter size={16} />
              <label htmlFor="sort" className="sr-only">
                Sortierung
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => {
                  const next = e.target.value as typeof sortBy;
                  setSortBy(next);
                  if (next === 'random') {
                    randomKeyRef.current.clear();
                    setRandomSeed(Date.now());
                  }
                }}
                className="rounded-lg border border-[#2f2822] bg-[#120f0c] px-3 py-2 focus:outline-none"
              >
                <option value="newest">Neueste zuerst</option>
                <option value="oldest">Älteste zuerst</option>
                <option value="words">Nach Wörteranzahl</option>
                <option value="letters">Nach Buchstaben</option>
                <option value="random">Zufall</option>
              </select>
              {sortBy === 'random' && (
                <button
                  type="button"
                  onClick={() => {
                    randomKeyRef.current.clear();
                    setRandomSeed(Date.now());
                  }}
                  className="rounded-lg border border-[#2f2822] bg-[#120f0c] px-3 py-2 hover:bg-[#191511]"
                >
                  Neu mischen
                </button>
              )}
            </div>
          </div>
        </header>

        <form
          onSubmit={handleCreateSession}
          className="mb-8 rounded-lg border border-[#2f2822] bg-[#100d0a] p-4"
        >
          <div className="flex flex-col gap-3">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
              <label className="sr-only" htmlFor="new-session-title">
                Titel
              </label>
              <input
                id="new-session-title"
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                placeholder="Neuer Sessiontitel"
                className="min-h-10 rounded-lg border border-[#2f2822] bg-[#18130f] px-3 text-sm text-[#fdfbf7] outline-none placeholder:text-[#6f6259] focus-visible:ring-2 focus-visible:ring-[#c9b18a]"
              />
              <label className="sr-only" htmlFor="new-session-tags">
                Tags
              </label>
              <input
                id="new-session-tags"
                value={newTags}
                onChange={(event) => setNewTags(event.target.value)}
                placeholder="Tags, durch Komma getrennt"
                className="min-h-10 rounded-lg border border-[#2f2822] bg-[#18130f] px-3 text-sm text-[#fdfbf7] outline-none placeholder:text-[#6f6259] focus-visible:ring-2 focus-visible:ring-[#c9b18a]"
              />
            </div>
            <label className="sr-only" htmlFor="new-session-text">
              Sessiontext
            </label>
            <textarea
              id="new-session-text"
              value={newText}
              onChange={(event) => {
                setNewText(event.target.value);
                if (createError) setCreateError(null);
              }}
              placeholder="Neue Session schreiben..."
              rows={4}
              className="min-h-[120px] resize-y rounded-lg border border-[#2f2822] bg-[#18130f] px-3 py-3 font-serif text-[18px] leading-[1.75] text-[#fdfbf7] outline-none placeholder:text-[#6f6259] focus-visible:ring-2 focus-visible:ring-[#c9b18a] md:text-[19px]"
              style={{ fontFeatureSettings: '"liga","kern"' }}
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-h-5 text-sm">
                {createError && <span className="text-red-300">{createError}</span>}
              </div>
              <div className="flex items-center gap-2 self-end">
                {(newTitle || newText || newTags) && (
                  <button
                    type="button"
                    onClick={resetCreateForm}
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#2f2822] px-3 text-sm text-[#f7f4ed] hover:bg-[#191511] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9b18a]"
                  >
                    <X size={16} />
                    Leeren
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isCreating || !newText.trim()}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#6f5431] bg-[#c9b18a] px-4 text-sm font-semibold text-[#120f0c] hover:bg-[#dbc397] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f7f4ed] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FilePlus2 size={16} />
                  {isCreating ? 'Erstelle...' : 'Session erstellen'}
                </button>
              </div>
            </div>
          </div>
        </form>

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={refreshSessions}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-[#3a3129] px-3 py-2 text-sm text-[#f7f4ed] hover:bg-[#191511] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9b18a] disabled:opacity-50"
          >
            {isLoading ? 'Aktualisiere...' : 'Neu laden'}
          </button>
          {error && (
            <span className="text-sm text-red-300 bg-red-950/60 border border-red-900/60 px-3 py-2 rounded-lg">
              {error}
            </span>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-900/60 bg-red-950/60 text-red-100 px-4 py-3">
            Fehler: {error}
          </div>
        )}

        <section className="space-y-4">
          {isLoading && sessions.length === 0 ? (
            <p className="text-[#d6c9ba]">Lade Sessions...</p>
          ) : filtered.length === 0 ? (
            <p className="text-[#d6c9ba]">Keine Sessions gefunden.</p>
          ) : (
            filtered.map((session: Session) => (
              <SessionItem
                key={session.id}
                session={session}
                onUpdate={updateSession}
                disableActions={isUpdating}
              />
            ))
          )}
        </section>

        <div className="mt-10 flex items-center justify-between text-sm text-[#d6c9ba]">
          <span>
            {deferredSearch.trim()
              ? searchPage.next_cursor
                ? `${sessions.length}+ Treffer`
                : `${sessions.length} Treffer`
              : pagination.total
                ? `${sessions.length} von ${pagination.total} Eintraegen`
                : `${sessions.length} Eintraege`}
          </span>
          <div className="flex items-center gap-3">
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="inline-flex items-center gap-2 rounded-lg border border-[#3a3129] px-3 py-2 text-sm text-[#f7f4ed] hover:bg-[#191511] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9b18a] disabled:opacity-50"
              >
                {isLoadingMore ? 'Lade mehr...' : 'Weitere Sessions laden'}
              </button>
            )}
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-[#2f2822] px-3 py-2 text-sm text-[#f7f4ed] hover:bg-[#191511]"
              type="button"
              aria-label="Weitere Optionen"
            >
              <MoreHorizontal size={16} />
              Mehr
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
