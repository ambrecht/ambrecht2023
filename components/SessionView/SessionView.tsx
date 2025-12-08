'use client';
import React from 'react';
import { useSessionData } from './useSessionData';
import { SessionItem } from './SessionItem';

export function SessionView() {
  const {
    sessions,
    pagination,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    refreshSessions,
    loadMore,
  } = useSessionData();

  return (
    <main className="min-h-screen bg-[#0b0a09] text-[#f7f4ed]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-[#cbbfb0] font-semibold">
              Archiv
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold text-[#fdfbf7] leading-tight">
              Sessions als Blogposts
            </h1>
            <p className="text-sm text-[#d6c9ba] mt-1">
              Alle Sessions untereinander, zum Lesen wie Artikel.
            </p>
          </div>
          <button
            onClick={refreshSessions}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-[#3a3129] px-3 py-2 text-sm text-[#f7f4ed] hover:bg-[#191511] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9b18a] disabled:opacity-50"
          >
            {isLoading ? 'Aktualisiere...' : 'Neu laden'}
          </button>
        </header>

        {error && (
          <div className="mb-6 rounded-lg border border-red-900/60 bg-red-950/60 text-red-100 px-4 py-3">
            Fehler: {error}
          </div>
        )}

        <section className="space-y-0">
          {isLoading && sessions.length === 0 ? (
            <p className="text-[#d6c9ba]">Lade Sessions...</p>
          ) : (
            sessions.map((session) => (
              <SessionItem key={session.id} session={session} />
            ))
          )}
        </section>

        <div className="mt-10 flex items-center justify-between text-sm text-[#d6c9ba]">
          <span>
            {pagination.total
              ? `${sessions.length} von ${pagination.total} Eintraegen`
              : `${sessions.length} Eintraege`}
          </span>
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="inline-flex items-center gap-2 rounded-lg border border-[#3a3129] px-3 py-2 text-sm text-[#f7f4ed] hover:bg-[#191511] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9b18a] disabled:opacity-50"
            >
              {isLoadingMore ? 'Lade mehr...' : 'Weitere Sessions laden'}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
