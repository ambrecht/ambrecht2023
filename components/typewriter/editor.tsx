'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useSession } from '@/lib/context/SessionContext';
import { validateSessionContent } from '@/lib/validation';

export default function Editor() {
  const { state, dispatch } = useSession();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>(
    'medium',
  );
  const [fullscreenContainer, setFullscreenContainer] =
    useState<HTMLElement | null>(null);

  // Schriftgrößen-Klassen
  const fontSizeClasses = {
    small: 'text-xl',
    medium: 'text-2xl',
    large: 'text-3xl',
  };

  /**
   * Verhindert bekannte Tasten wie Backspace oder Enter.
   * Auf manchen Android-Geräten greift das nicht zu 100 %;
   * dort fängt handleChange (s.u.) den Rest ab.
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Hier können ggf. weitere Tasten blockiert werden, z. B. Pfeiltasten.
      if (e.key === 'Backspace' || e.key === 'Enter') {
        e.preventDefault();
      }
    },
    [],
  );

  /**
   * Ermittelt den Text, der ins <textarea> geschrieben wurde.
   * Prüft, ob nur ein einzelnes Zeichen angehängt wurde. Ist das nicht der Fall
   * oder war das Zeichen ein Zeilenumbruch, wird die Änderung verworfen
   * (Revert auf alten Zustand).
   */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const oldContent = state.content;
      const newContent = e.target.value;

      // Falls gar keine Änderung erfolgte, nichts tun.
      if (newContent === oldContent) return;

      // Prüfen, ob GENAU EIN Zeichen angehängt wurde.
      // Bedingung: newContent fängt mit oldContent an, plus 1 Zeichen.
      if (
        newContent.length === oldContent.length + 1 &&
        newContent.startsWith(oldContent)
      ) {
        const appendedChar = newContent[newContent.length - 1];
        // Keine Zeilenumbrüche erlauben
        if (appendedChar === '\n' || appendedChar === '\r') {
          // Rückgängig machen
          e.target.value = oldContent;
          return;
        }
        // Falls alles in Ordnung ist, übernehmen wir den neuen Wert
        dispatch({ type: 'SET_CONTENT', payload: newContent });
      } else {
        // Wenn mehr als ein Zeichen eingefügt wurde, Backspace gedrückt
        // oder irgendwo im Text geändert wurde, verwerfen wir.
        e.target.value = oldContent;
      }
    },
    [dispatch, state.content],
  );

  // Sitzung speichern
  const handleSaveSession = useCallback(async () => {
    if (!validateSessionContent(state.content)) {
      alert('Sessioninhalt zu kurz; wird nicht gespeichert.');
      return;
    }
    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: state.content }),
      });
      await response.json();
      alert('Session erfolgreich gespeichert.');
    } catch (error) {
      console.error('Fehler beim Speichern der Session:', error);
      alert('Fehler beim Speichern der Session.');
    }
  }, [state.content]);

  // Portal-Container für Vollbildmodus anlegen
  useEffect(() => {
    const container = document.createElement('div');
    container.id = 'editor-fullscreen-overlay';
    document.body.appendChild(container);
    setFullscreenContainer(container);

    return () => {
      document.body.removeChild(container);
    };
  }, []);

  // Vollbildmodus umschalten
  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  // Vollbildmodus-Ansicht
  if (isFullscreen && fullscreenContainer) {
    return ReactDOM.createPortal(
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
        <div className="p-4 flex justify-end space-x-2">
          <button
            onClick={toggleFullscreen}
            className="px-4 py-2 text-lg bg-gray-100 rounded hover:bg-gray-200"
          >
            Vollbild verlassen
          </button>
        </div>
        <div className="flex-grow flex items-center justify-center p-4">
          <textarea
            ref={textareaRef}
            value={state.content}
            onKeyDown={handleKeyDown}
            onChange={handleChange}
            className={`w-full h-full p-6 ${fontSizeClasses[fontSize]} text-gray-800 bg-white border-none focus:outline-none resize-none`}
            placeholder="Beginnen Sie zu schreiben..."
            autoFocus
          />
        </div>
      </div>,
      fullscreenContainer,
    );
  }

  // Standarddarstellung
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-8 font-serif">
      <div className="w-full max-w-4xl flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-4">
          <button
            onClick={toggleFullscreen}
            className="px-4 py-2 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            Vollbild
          </button>
          <div className="flex space-x-2">
            <button
              onClick={() => setFontSize('small')}
              className={`px-4 py-2 text-sm ${
                fontSize === 'small' ? 'bg-indigo-600' : 'bg-gray-300'
              } text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300`}
            >
              Klein
            </button>
            <button
              onClick={() => setFontSize('medium')}
              className={`px-4 py-2 text-sm ${
                fontSize === 'medium' ? 'bg-indigo-600' : 'bg-gray-300'
              } text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300`}
            >
              Mittel
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-4 py-2 text-sm ${
                fontSize === 'large' ? 'bg-indigo-600' : 'bg-gray-300'
              } text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300`}
            >
              Groß
            </button>
          </div>
        </div>
        <textarea
          ref={textareaRef}
          value={state.content}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          className={`w-full h-96 p-6 ${fontSizeClasses[fontSize]} text-gray-800 bg-white border border-gray-300 rounded-lg shadow-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300`}
          placeholder="Beginnen Sie zu schreiben..."
          autoFocus
        />
        <button
          onClick={handleSaveSession}
          className="mt-4 px-8 py-3 text-xl text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          Session beenden und speichern
        </button>
      </div>
    </div>
  );
}
