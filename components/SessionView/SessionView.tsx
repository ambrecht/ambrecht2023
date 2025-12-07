'use client';
import React from 'react';
import { SessionList } from './SessionList';
import { useSessionData } from './useSessionData';

export function SessionView() {
  const {
    sessions,
    pagination,
    isLoading,
    error,
    refreshSessions,
  } = useSessionData();

  return (
    <div className="rounded-2xl bg-neutral-950 text-gray-100 border border-gray-800 p-6 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
            Archiv
          </p>
          <h2 className="text-3xl font-semibold leading-tight">
            Bestehende Sessions
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Lesemodus – Text wird nur angezeigt.
          </p>
        </div>
        <button
          onClick={refreshSessions}
          disabled={isLoading}
          className="px-3 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 disabled:opacity-50"
        >
          {isLoading ? 'Aktualisiere...' : 'Neu laden'}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded border border-red-700 bg-red-950 text-red-200 p-3">
          Fehler: {error}
        </div>
      )}

      {isLoading && sessions.length === 0 ? (
        <p className="mt-6 text-gray-400">Lade Sessions...</p>
      ) : (
        <div className="mt-6">
          <SessionList sessions={sessions} />
        </div>
      )}

      <div className="mt-6 text-xs text-gray-500">
        {pagination.total
          ? `${sessions.length} von ${pagination.total} Einträgen geladen`
          : `${sessions.length} Einträge geladen`}
      </div>
    </div>
  );
}
