'use client';
/**
 * Kopfbereich des Editors, zeigt den Vollbild-Button an.
 */

import React from 'react';

interface EditorHeaderProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export default function EditorHeader({
  isFullscreen,
  onToggleFullscreen,
}: EditorHeaderProps) {
  return (
    <header className="flex justify-between items-center mb-4">
      <button
        onClick={onToggleFullscreen}
        className="px-3 py-1 bg-indigo-600 text-white rounded"
      >
        {isFullscreen ? 'Vollbild verlassen' : 'Vollbild'}
      </button>
    </header>
  );
}
