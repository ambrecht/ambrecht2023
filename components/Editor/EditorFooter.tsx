'use client';
/**
 * Fußbereich des Editors, zeigt Timer, Wortzähler und
 * den Button zum Beenden/Speichern.
 */

import React from 'react';

interface EditorFooterProps {
  timer: number;
  wordCount: number;
  onSaveSession: () => void;
}

export default function EditorFooter({
  timer,
  wordCount,
  onSaveSession,
}: EditorFooterProps) {
  // Timer im hh:mm:ss-Format
  const formattedTime = new Date(timer * 1000).toISOString().substr(11, 8);

  return (
    <footer className="flex justify-between items-center p-4 bg-gray-100">
      <span className="text-gray-600">Dauer: {formattedTime}</span>
      <span className="text-gray-600">Wörter: {wordCount}</span>
      <button
        onClick={onSaveSession}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Session beenden und speichern
      </button>
    </footer>
  );
}
