'use client';
/**
 * Diese Seite stellt den Editor bereit und zeigt ihn an.
 * Wir gehen davon aus, dass der Nutzer per /editor-Route
 * zu dieser Seite navigiert.
 */

import React from 'react';
import Editor from '@/components/Editor';
import { SessionProvider } from '@/lib/context/SessionContext';

export default function EditorPage() {
  return (
    <SessionProvider>
      <Editor />
    </SessionProvider>
  );
}
