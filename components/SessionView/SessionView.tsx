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

  return (
    <main className="min-h-screen bg-[#0f0d0a] text-amber-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-amber-500/70 font-semibold">
              Lesesaal
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold text-amber-50 leading-tight">
              Bestehende Sessions
            </h1>
            <p className="text-sm text-amber-200/80 mt-1">
              Ruhe, Raum und Lesbarkeit – keine Eingriffe, nur betrachten.
            </p>
          </div>
          <button
            onClick={refreshSessions}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-amber-300/40 px-3 py-2 text-sm text-amber-100 hover:bg-amber-100/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-50"
          >
            {isLoading ? 'Aktualisiere…' : 'Neu laden'}
          </button>
        </header>

        {error && (
          <div className="mb-6 rounded-lg border border-red-600/60 bg-red-900/40 text-red-100 px-4 py-3">
            Fehler: {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-8 lg:items-start">
          <section className="order-1 rounded-3xl bg-amber-50 text-amber-950 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.6)] px-6 sm:px-8 py-10">
            {isLoading && sessions.length === 0 ? (
              <p className="text-amber-800">Lade Sessions…</p>
            ) : selectedSession ? (
              <SessionItem session={selectedSession} />
            ) : (
              <p className="text-amber-800">Keine Session ausgewählt.</p>
            )}
          </section>

          <aside className="order-2 lg:order-none space-y-3">
            <div className="rounded-xl border border-amber-100/25 bg-amber-50/5 backdrop-blur-sm p-4">
              <div className="flex items-center justify-between text-xs text-amber-100/80">
                <span>Inhaltsverzeichnis</span>
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
