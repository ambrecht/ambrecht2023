'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSession } from '@/lib/context/SessionContext';
import { validateSessionContent } from '@/lib/validation';
import { createPortal } from 'react-dom';

export default function Editor() {
  const { state, dispatch } = useSession();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timer, setTimer] = useState(0);
  const [wordCount, setWordCount] = useState(0);

  // Timer starten, der jede Sekunde aktualisiert wird.
  useEffect(() => {
    const interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Automatische Speicherung beim Tab-Wechsel oder Schließen des Tabs.
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
      if (document.visibilityState === 'hidden') {
        handleSave();
      }
    };

    window.addEventListener('beforeunload', handleSave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleSave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state.content]);

  // Regelmäßige Speicherung im localStorage alle 5 Sekunden.
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem('sessionContent', state.content);
    }, 5000);
    return () => clearInterval(interval);
  }, [state.content]);

  // Wortzähler aktualisieren.
  useEffect(() => {
    const words = state.content.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, [state.content]);

  // Aktualisierung des Vollbildmodus-Zustandes, wenn der Nutzer den Modus verlässt oder betritt.
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Handler für Änderungen im Textfeld. Dieser verhindert, dass bereits getippte Inhalte gelöscht werden.
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      if (newContent.length < state.content.length) {
        e.target.value = state.content;
        return;
      }
      dispatch({ type: 'SET_CONTENT', payload: newContent });

      // Sicherstellen, dass der Cursor stets im sichtbaren Bereich verbleibt.
      const textarea = textareaRef.current;
      if (textarea) {
        const cursorPosition = textarea.selectionStart;
        const textBeforeCursor = newContent.substring(0, cursorPosition);
        const currentLine = textBeforeCursor.split('\n').length;
        const computedStyle = window.getComputedStyle(textarea);
        const lineHeight = parseInt(computedStyle.lineHeight, 10) || 24;
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
    [state.content, dispatch],
  );

  // Speichern und Zurücksetzen der Session auf Knopfdruck.
  const handleSaveSession = useCallback(async () => {
    if (!validateSessionContent(state.content)) {
      console.log('Sessioninhalt zu kurz; wird nicht gespeichert.');
      return;
    }
    try {
      await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: state.content }),
      });
      dispatch({ type: 'SET_CONTENT', payload: '' });
      console.log('Session erfolgreich gespeichert.');
      setTimer(0);
    } catch (error) {
      console.log('Fehler beim Speichern der Session.');
    }
  }, [state.content, dispatch]);

  // Umschalten des Vollbildmodus. Bei Aktivierung wird der gesamte Dokumentinhalt in den Vollbildmodus versetzt.
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Fehler beim Aktivieren des Vollbildmodus:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error('Fehler beim Verlassen des Vollbildmodus:', err);
      });
    }
    // Den Fokus auf das Textfeld setzen.
    textareaRef.current?.focus();
  }, []);

  // Formatierung des Timers im hh:mm:ss-Format.
  const formattedTime = new Date(timer * 1000).toISOString().substr(11, 8);

  // Definition des Editor-Inhalts mit Header, Hauptbereich und Footer.
  const editorContent = (
    <div className="flex flex-col h-screen bg-gray-50 font-serif p-6">
      <header className="flex justify-between items-center mb-4">
        <button
          onClick={toggleFullscreen}
          className="px-3 py-1 bg-indigo-600 text-white rounded"
        >
          {isFullscreen ? 'Vollbild verlassen' : 'Vollbild'}
        </button>
      </header>
      <main className="flex-grow overflow-auto">
        <textarea
          ref={textareaRef}
          value={state.content}
          onChange={handleChange}
          className="w-full h-full p-4 font-serif text-xl leading-relaxed border-none focus:outline-none resize-none"
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

  // Rückgabe des Editor-Inhalts. Im Vollbildmodus wird hierzu ein React-Portal verwendet.
  return isFullscreen
    ? createPortal(editorContent, document.body)
    : editorContent;
}
