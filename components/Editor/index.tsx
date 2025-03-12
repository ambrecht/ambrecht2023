'use client';

import React, { useRef } from 'react';
import { useSession } from '@/lib/context/SessionContext';
import { useEditorLogic } from '@/hooks/useEditorLogic';

import EditorHeader from './EditorHeader';
import EditorTextarea from './EditorTextarea';
import EditorFooter from './EditorFooter';

export default function Editor() {
  const { state } = useSession();

  // Beachten Sie hier: HTMLTextAreaElement | null
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);

  // Custom Hook mit kompletter Editor-Logik
  const {
    isFullscreen,
    timer,
    wordCount,
    handleChange,
    handleSaveSession,
    toggleFullscreen,
  } = useEditorLogic({ textareaRef, editorRef });

  return (
    <div
      ref={editorRef}
      className="flex flex-col h-screen bg-gray-50 font-serif p-6"
    >
      <EditorHeader
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      <EditorTextarea
        textareaRef={textareaRef}
        value={state.content}
        onChange={handleChange}
      />

      <EditorFooter
        timer={timer}
        wordCount={wordCount}
        onSaveSession={handleSaveSession}
      />
    </div>
  );
}
