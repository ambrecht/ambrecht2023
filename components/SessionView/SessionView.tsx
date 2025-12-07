'use client';
import React, { useEffect, useState } from 'react';
import { SessionList } from './SessionList';
import { useSessionData } from './useSessionData';
import { SessionItem } from './SessionItem';
import type { Session } from './types';

export function SessionView() {
  const {
    sessions,
    pagination,
    isLoading,
    error,
    refreshSessions,
  } = useSessionData();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    if (sessions.length === 0) {
      setSelectedSession(null);
      return;
    }
    // Falls bisher nichts ausgewählt, wähle die jüngste (erste) Session.
    if (!selectedSession || !sessions.find((s) => s.id === selectedSession.id)) {
      setSelectedSession(sessions[0]);
    }
  }, [sessions, selectedSession]);

  const activeId = selectedSession?.id;
  const currentIndex = activeId
    ? sessions.findIndex((s) => s.id === activeId)
    : -1;
  const prevSession = currentIndex >= 0 && currentIndex < sessions.length - 1
    ? sessions[currentIndex + 1]
    : null;
  const nextSession = currentIndex > 0 ? sessions[currentIndex - 1] : null;

  return (
    <main className="min-h-screen bg-[#f4f0e9] text-[#1f150f]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-[#7a6a5a] font-semibold">
              Archiv &amp; Leseraum
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold text-[#120c08] leading-tight">
              Sessions als Blog
            </h1>
            <p className="text-sm text-[#6f6458] mt-1">
              Lesen im Fokus: Übersicht links, Blog-Artikel rechts.
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

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-10 lg:items-start">
          <section className="order-1 rounded-3xl bg-white/90 text-[#1f150f] border border-[#e5d9c9] px-6 sm:px-8 py-12 shadow-sm">
            {isLoading && sessions.length === 0 ? (
              <p className="text-[#4b4035]">Lade Sessions…</p>
            ) : selectedSession ? (
              <>
                <SessionItem session={selectedSession} />
                <div className="mt-10 flex flex-wrap items-center gap-3 text-sm text-[#52483c]">
                  <a
                    href="#archiv"
                    className="underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9b18a] rounded-sm px-1"
                  >
                    Zurück zum Archiv
                  </a>
                  {prevSession && (
                    <>
                      <span aria-hidden="true">•</span>
                      <button
                        onClick={() => setSelectedSession(prevSession)}
                        className="underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9b18a] rounded-sm px-1"
                      >
                        Vorherige Session
                      </button>
                    </>
                  )}
                  {nextSession && (
                    <>
                      <span aria-hidden="true">•</span>
                      <button
                        onClick={() => setSelectedSession(nextSession)}
                        className="underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9b18a] rounded-sm px-1"
                      >
                        Nächste Session
                      </button>
                    </>
                  )}
                </div>
              </>
            ) : (
              <p className="text-[#4b4035]">Keine Session ausgewählt.</p>
            )}
          </section>

          <aside className="order-2 lg:order-none space-y-3" id="archiv">
            <div className="rounded-xl border border-[#e5d9c9] bg-[#f8f4ed] p-4">
              <div className="flex items-center justify-between text-xs text-[#5f5347]">
                <span>Archiv</span>
                <span>
                  {pagination.total
                    ? `${sessions.length}/${pagination.total}`
                    : `${sessions.length}`}{" "}
                  Einträge
                </span>
              </div>
              <div className="mt-3 max-h-[70vh] overflow-y-auto pr-1">
                <SessionList
                  sessions={sessions}
                  selectedId={activeId}
                  onSelect={(session) => setSelectedSession(session)}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
