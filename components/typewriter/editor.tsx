'use client';

import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useSession } from '@/lib/context/SessionContext';
import { validateSessionContent } from '@/lib/validation';

export default function Editor() {
  const { state, dispatch } = useSession();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>(
    'medium',
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Backspace') {
        e.preventDefault();
        return;
      }
      if (e.key.length === 1) {
        dispatch({ type: 'APPEND_CONTENT', payload: e.key });
      }
    },
    [dispatch],
  );

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
      const data = await response.json();
      alert('Session erfolgreich gespeichert.');
    } catch (error) {
      console.error('Fehler beim Speichern der Session:', error);
      alert('Fehler beim Speichern der Session.');
    }
  }, [state.content]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [state.content]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.content && validateSessionContent(state.content)) {
        const url = '/api/session';
        const data = JSON.stringify({ content: state.content });
        if (navigator.sendBeacon) {
          const blob = new Blob([data], { type: 'application/json' });
          navigator.sendBeacon(url, blob);
        }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [state.content]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const fontSizeClasses = {
    small: 'text-xl',
    medium: 'text-2xl',
    large: 'text-3xl',
  };

  return (
    <div
      className={`${
        isFullscreen ? 'fixed inset-0 bg-white z-50' : 'bg-gray-50 min-h-screen'
      } flex flex-col items-center justify-center p-8 font-serif`}
    >
      <div className="w-full max-w-4xl flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-4">
          <button
            onClick={toggleFullscreen}
            className="px-4 py-2 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {isFullscreen ? 'Vollbild beenden' : 'Vollbild'}
          </button>
          {isFullscreen && (
            <button
              onClick={toggleFullscreen}
              className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              X
            </button>
          )}
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
          onKeyDown={handleKeyPress}
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
