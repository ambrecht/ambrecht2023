'use client';

import React from 'react';
import Editor from '@/components/Editor';
import { SessionProvider } from '@/lib/context/SessionContext';
import SessionList from '@/components/typewriter/sessions';

export default function EditorPage() {
  return (
    <SessionProvider>
      <div className="container mx-auto px-4 py-8">
        <Editor />
        <SessionList />
      </div>
    </SessionProvider>
  );
}
