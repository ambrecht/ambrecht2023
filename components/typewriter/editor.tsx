'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSession } from '@/lib/context/SessionContext';
import { validateSessionContent } from '@/lib/validation';
import { createPortal } from 'react-dom';

export default function Editor() {
  const { state, dispatch } = useSession();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>(
    'medium',
  );
  const [timer, setTimer] = useState(0);
  const [wordCount, setWordCount] = useState(0);

  // Timer starten, aktualisiert jede Sekunde
  useEffect(() => {
    const interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Automatische Speicherung beim Tab-Wechsel oder Schließen des Tabs
  useEffect(() => {
    const handleSave = async () => {
      if (validateSessionContent(state.content)) {
        await fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: state.content }),
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') handleSave();
    };

    window.addEventListener('beforeunload', handleSave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleSave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state.content]);

  // Regelmäßige Speicherung im localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem('sessionContent', state.content);
    }, 5000); // Alle 5 Sekunden speichern

    return () => clearInterval(interval);
  }, [state.content]);

  // Wortzähler aktualisieren
  useEffect(() => {
    const words = state.content.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, [state.content]);

  // Handler für Änderungen im Textfeld
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      dispatch({ type: 'SET_CONTENT', payload: newContent });

      // Sicherstellen, dass Cursor immer sichtbar bleibt
      const textarea = textareaRef.current;
      if (textarea) {
        const cursorPosition = textarea.selectionStart;
        const textBeforeCursor = newContent.substring(0, cursorPosition);
        const currentLine = textBeforeCursor.split('\n').length;

        const lineHeight =
          parseInt(window.getComputedStyle(textarea).lineHeight, 10) || 24;
        const cursorYPosition = (currentLine - 1) * lineHeight;

        if (cursorYPosition < textarea.scrollTop) {
          textarea.scrollTop = cursorYPosition;
        } else if (
          cursorYPosition >
          textarea.scrollTop + textarea.clientHeight - lineHeight
        ) {
          textarea.scrollTop =
            cursorYPosition - textarea.clientHeight + lineHeight;
        }
      }
    },
    [dispatch],
  );

  // Speichern und Zurücksetzen der Session bei Knopfdruck
  const handleSaveSession = useCallback(async () => {
    if (!validateSessionContent(state.content)) {
      alert('Sessioninhalt zu kurz; wird nicht gespeichert.');
      return;
    }
    try {
      await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: state.content }),
      });
      dispatch({ type: 'SET_CONTENT', payload: '' });
      alert('Session erfolgreich gespeichert.');
      setTimer(0);
    } catch (error) {
      alert('Fehler beim Speichern der Session.');
    }
  }, [state.content, dispatch]);

  // Vollbildmodus umschalten
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
    textareaRef.current?.focus();
  }, []);

  // Formatierung für Timer
  const formattedTime = new Date(timer * 1000).toISOString().substr(11, 8);

  const fontSizeClasses = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-5xl',
  };

  // Editor-Komponente
  const editorContent = (
    <div className="flex flex-col h-screen bg-gray-50 font-serif p-6">
      <header className="flex justify-between items-center mb-4">
        <button
          onClick={toggleFullscreen}
          className="px-3 py-1 bg-indigo-600 text-white rounded"
        >
          {isFullscreen ? 'Vollbild verlassen' : 'Vollbild'}
        </button>
        <div className="space-x-2">
          {(['small', 'medium', 'large'] as const).map((size) => (
            <button
              key={size}
              onClick={() => setFontSize(size)}
              className={`px-4 py-2 rounded ${
                fontSize === size ? 'bg-indigo-600 text-white' : 'bg-gray-300'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </header>
      <main className="flex-grow overflow-auto">
        <textarea
          ref={textareaRef}
          value={state.content}
          onChange={handleChange}
          className={`w-full h-full p-4 font-serif ${fontSizeClasses[fontSize]} border-none focus:outline-none resize-none`}
          placeholder="Beginnen Sie zu schreiben..."
          autoFocus
        />
      </main>
      <footer className="flex justify-between items-center p-4 bg-gray-100">
        <span className="text-gray-600">Dauer: {formattedTime}</span>
        <span className="text-gray-600">Wörter: {wordCount}</span>
        <button
          onClick={handleSaveSession}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Session beenden und speichern
        </button>
      </footer>
    </div>
  );

  // Verwende React Portals für den Vollbildmodus
  return isFullscreen
    ? createPortal(editorContent, document.body)
    : editorContent;
}
