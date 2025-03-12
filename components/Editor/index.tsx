'use client';

import React, { useRef, useState } from 'react';
import { useSession } from '@/lib/context/SessionContext';
import { useEditorLogic } from '@/hooks/useEditorLogic';

import EditorHeader from './EditorHeader';
import EditorTextarea from './EditorTextarea';
import EditorFooter from './EditorFooter';

export default function Editor() {
  const { state } = useSession();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);

  const {
    isFullscreen,
    timer,
    wordCount,
    handleChange,
    handleSaveSession,
    toggleFullscreen,
  } = useEditorLogic({ textareaRef, editorRef });

  // Zustand zur Steuerung der Schriftgröße
  const [fontSize, setFontSize] = useState('text-xl');

  const handleSetSmallFont = () => {
    setFontSize('text-sm');
  };

  const handleSetVeryLargeFont = () => {
    setFontSize('text-xl');
  };

  const handleSetMegaLargeFont = () => {
    setFontSize('text-5xl');
  };

  return (
    <div
      ref={editorRef}
      className="flex flex-col h-screen bg-gray-50 font-serif p-6"
    >
      <EditorHeader
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Buttons zur Schriftgrößenwahl */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={handleSetSmallFont}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Kleiner Font
        </button>
        <button
          onClick={handleSetVeryLargeFont}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Sehr Großer Font
        </button>
        <button
          onClick={handleSetMegaLargeFont}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Mega Großer Font
        </button>
      </div>

      <EditorTextarea
        textareaRef={textareaRef}
        value={state.content}
        onChange={handleChange}
        fontSize={fontSize}
      />

      <EditorFooter
        timer={timer}
        wordCount={wordCount}
        onSaveSession={handleSaveSession}
      />
    </div>
  );
}
