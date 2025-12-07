'use client';
import React, { useEffect, useState } from 'react';
import { useSessionData } from './useSessionData';
import { SessionItem } from './SessionItem';
import type { Session } from './types';

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
    <main className="min-h-screen bg-[#f4f0e9] text-[#1f150f]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-[#7a6a5a] font-semibold">
              Archiv
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold text-[#120c08] leading-tight">
              Sessions als Blogposts
            </h1>
            <p className="text-sm text-[#6f6458] mt-1">
              Alle Sessions untereinander, zum Lesen wie Artikel.
            </p>
          </div>
          <button
            onClick={refreshSessions}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-[#c1b5a6] px-3 py-2 text-sm text-[#1f150f] hover:bg-[#e9e2d9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9b18a] disabled:opacity-50"
          >
            {isLoading ? 'Aktualisiere…' : 'Neu laden'}
          </button>
        </header>

        {error && (
          <div className="mb-6 rounded-lg border border-red-600/40 bg-red-50 text-red-700 px-4 py-3">
            Fehler: {error}
          </div>
        )}

        <section className="space-y-0">
          {isLoading && sessions.length === 0 ? (
            <p className="text-[#4b4035]">Lade Sessions…</p>
          ) : (
            sessions.map((session) => (
              <SessionItem key={session.id} session={session} />
            ))
          )}
        </section>

        <div className="mt-10 flex items-center justify-between text-sm text-[#5f5347]">
          <span>
            {pagination.total
              ? `${sessions.length} von ${pagination.total} Einträgen`
              : `${sessions.length} Einträge`}
          </span>
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="inline-flex items-center gap-2 rounded-lg border border-[#c1b5a6] px-3 py-2 text-sm text-[#1f150f] hover:bg-[#e9e2d9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9b18a] disabled:opacity-50"
            >
              {isLoadingMore ? 'Lade mehr…' : 'Weitere Sessions laden'}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
