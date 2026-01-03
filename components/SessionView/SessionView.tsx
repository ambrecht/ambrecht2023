'use client';
import React, { useDeferredValue, useMemo, useState } from 'react';
import { Search, Filter, MoreHorizontal } from 'lucide-react';
import { useSessionData } from './useSessionData';
import { SessionItem } from './SessionItem';
import type { Session } from './types';

export function SessionView() {
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const isSearching = search.trim().length > 0;
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'words' | 'letters'>(
    'newest',
  );
  const {
    sessions,
    pagination,
    searchPage,
    isLoading,
    isLoadingMore,
    isPending,
    isUpdating,
    hasMore,
    error,
    refreshSessions,
    loadMore,
    updateSession,
  } = useSessionData({
    pageSize: 50,
    prefetchDelayMs: 1200,
    autoPrefetch: !isSearching,
    searchQuery: deferredSearch,
  });

  const filtered = useMemo(() => {
    const sorted = [...sessions].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'words':
          return (b.word_count ?? 0) - (a.word_count ?? 0);
        case 'letters':
          return (b.letter_count ?? 0) - (a.letter_count ?? 0);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return sorted;
  }, [sessions, sortBy]);

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
              Schnell filtern, kopieren oder bearbeiten – mit optionaler Text-Analyse
              pro Session.
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
                {searchPage.total
                  ? ` (${sessions.length}/${searchPage.total})`
                  : pagination.total
                  ? ` (${sessions.length}/${pagination.total})`
                  : ''}
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
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="rounded-lg border border-[#2f2822] bg-[#120f0c] px-3 py-2 focus:outline-none"
              >
                <option value="newest">Neueste zuerst</option>
                <option value="oldest">Älteste zuerst</option>
                <option value="words">Nach Wörteranzahl</option>
                <option value="letters">Nach Buchstaben</option>
              </select>
            </div>
          </div>
        </header>

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
              ? searchPage.total
                ? `${sessions.length} von ${searchPage.total} Treffern`
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
