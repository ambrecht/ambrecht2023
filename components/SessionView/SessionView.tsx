'use client';
import React, { useState } from 'react';
import { SessionList } from './SessionList';
import { useSessionData } from './useSessionData';

export function SessionView() {
  const [newSessionText, setNewSessionText] = useState('');
  const {
    sessions,
    pagination,
    isLoading,
    isLoadingMore,
    isCreating,
    error,
    refreshSessions,
    loadMore,
    hasMore,
    createSession,
  } = useSessionData();

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await createSession(newSessionText);
    if (result.success) {
      setNewSessionText('');
    }
  };

  return (
    <div className="p-4 border border-gray-700 rounded bg-neutral-900 text-gray-100">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Sessions verwalten</h2>
        <button
          onClick={refreshSessions}
          disabled={isLoading}
          className="px-3 py-2 border border-gray-600 rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {isLoading ? 'Laedt...' : 'Neu laden'}
        </button>
      </div>

      <form
        onSubmit={handleCreate}
        className="mt-4 space-y-2 border border-gray-800 rounded p-3 bg-neutral-950"
      >
        <label className="block text-sm font-semibold text-gray-300">
          Neue Session (POST /api/v1/sessions)
        </label>
        <textarea
          className="w-full p-2 border border-gray-700 rounded bg-black text-gray-100"
          rows={4}
          placeholder="Text fuer die neue Session..."
          value={newSessionText}
          onChange={(e) => setNewSessionText(e.target.value)}
        />
        <div className="flex items-center justify-between gap-3">
          <button
            type="submit"
            disabled={isCreating || newSessionText.trim().length === 0}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded text-white disabled:opacity-50"
          >
            {isCreating ? 'Speichere...' : 'Session anlegen'}
          </button>
          <span className="text-xs text-gray-500">
            API-Key wird automatisch mitgesendet.
          </span>
        </div>
      </form>

      {error && (
        <div className="mt-3 rounded border border-red-700 bg-red-950 text-red-200 p-3">
          Fehler: {error}
        </div>
      )}

      {isLoading && sessions.length === 0 ? (
        <p className="mt-4 text-gray-400">Lade Sessions...</p>
      ) : (
        <div className="mt-4">
          <SessionList sessions={sessions} />
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
        <span>
          {pagination.total
            ? `${sessions.length} von ${pagination.total} geladen`
            : `${sessions.length} geladen`}
        </span>
        {hasMore && (
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="px-3 py-2 border border-gray-600 rounded hover:bg-gray-800 disabled:opacity-50"
          >
            {isLoadingMore ? 'Laedt...' : 'Mehr laden'}
          </button>
        )}
      </div>
    </div>
  );
}
