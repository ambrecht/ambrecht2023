'use client';

import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';

export default function TypewriterPage() {
  // Aktuell eingegebener Text
  const [typedText, setTypedText] = useState('');
  // Archiv
  const [history, setHistory] = useState<string[]>([]);
  // Vollbildmodus an/aus
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Referenzen zur Vermeidung von asynchronen Inkonsistenzen
  const typedTextRef = useRef(typedText);
  const isFinalizedRef = useRef(false);

  // Separater Container für das Portal (Vollbild-Overlay)
  const [fullscreenContainer, setFullscreenContainer] =
    useState<HTMLElement | null>(null);

  // Beim Mount: Portal-Container anlegen
  useEffect(() => {
    const container = document.createElement('div');
    container.id = 'typewriter-fullscreen-overlay';
    document.body.appendChild(container);
    setFullscreenContainer(container);

    return () => {
      document.body.removeChild(container);
    };
  }, []);

  // Aktuellen Text stets in der Ref aktualisieren
  useEffect(() => {
    typedTextRef.current = typedText;
  }, [typedText]);

  // Historie laden
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch('/api/read-history');
        if (res.ok) {
          const data = await res.json();
          setHistory(data.sessions || []);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Historie:', error);
      }
    }
    loadHistory();
  }, []);

  // Tastatureingaben erfassen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Blockiert Enter, Backspace, Pfeiltasten
      if (
        e.key === 'Enter' ||
        e.key === 'Backspace' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown'
      ) {
        e.preventDefault();
        return;
      }
      // Nur druckbare Zeichen einfügen
      if (e.key.length === 1) {
        e.preventDefault();
        setTypedText((prev) => prev + e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Speichern / Finalisieren
  async function finalizeSession() {
    if (isFinalizedRef.current) return;
    isFinalizedRef.current = true;

    const currentText = typedTextRef.current;
    if (!currentText.trim()) return;

    const payload = JSON.stringify({
      typedText: currentText,
      timestamp: new Date().toISOString(),
    });
    const blob = new Blob([payload], { type: 'application/json' });
    navigator.sendBeacon('/api/finalize', blob);
  }

  // Funktion zum Löschen des aktuellen Texts der Session
  function deleteCurrentText() {
    setTypedText('');
    isFinalizedRef.current = false;
  }

  // Vor Schließen/Neuladen
  useEffect(() => {
    const handleBeforeUnload = () => {
      finalizeSession();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Finalisierung nach Inaktivität (Seite im Hintergrund)
  useEffect(() => {
    let timeoutId: number;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        timeoutId = window.setTimeout(() => {
          finalizeSession();
        }, 2000);
      } else {
        clearTimeout(timeoutId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(timeoutId);
    };
  }, []);

  // Vollbildmodus an/aus
  function toggleFullscreen() {
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
  }

  // Funktion, um einen Archiv-Eintrag zu löschen
  function deleteEntry(index: number) {
    // Entfernt den Eintrag aus dem lokalen Zustand
    setHistory((prevHistory) => prevHistory.filter((_, i) => i !== index));

    // Optional: Hier kann ein API-Aufruf erfolgen, um den Eintrag auch serverseitig zu löschen.
    // fetch('/api/delete-entry', { method: 'POST', body: JSON.stringify({ index }) });
  }

  // Typographiestil: serifenbetont und groß – sowohl in Vollbild als auch in Standard
  const typewriterTextClasses =
    'whitespace-pre-wrap break-words font-serif text-5xl md:text-6xl leading-relaxed';

  // Vollbild-Darstellung (Portal)
  if (isFullscreen && fullscreenContainer) {
    return ReactDOM.createPortal(
      <div className="fixed inset-0 z-[9999] bg-white text-black font-serif flex flex-col overflow-auto">
        <div className="p-4 flex justify-end space-x-2">
          <button
            onClick={deleteCurrentText}
            className="px-4 py-2 text-lg bg-red-100 rounded hover:bg-red-200"
          >
            Text löschen
          </button>
          <button
            onClick={toggleFullscreen}
            className="px-4 py-2 text-lg bg-gray-100 rounded hover:bg-gray-200"
          >
            Vollbild verlassen
          </button>
        </div>
        <div className="flex-grow flex flex-col items-center justify-start px-4 pb-4">
          <div className="w-full max-w-4xl min-h-[80vh] flex flex-col p-4 shadow-md">
            <div className={typewriterTextClasses}>
              {typedText}
              <span className="blinking-cursor">|</span>
            </div>
          </div>
        </div>
      </div>,
      fullscreenContainer,
    );
  }

  // Standarddarstellung
  return (
    <main className="w-full min-h-screen bg-white text-black font-serif flex flex-col">
      {/* Kopfbereich */}
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-4xl md:text-5xl font-bold">
          Meine Schreibmaschine
        </h1>
        <div className="flex space-x-2">
          {/* Speichern-Knopf */}
          <button
            onClick={finalizeSession}
            className="px-4 py-2 text-lg bg-gray-100 rounded hover:bg-gray-200 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 576 512"
              className="w-5 h-5 mr-2 fill-current"
            >
              <path d="M434.66 0H32A32 32 0 0 0 0 32v448a32 32 0 0 0 32 32h512a32 32 0 0 0 32-32V90.51a32 32 0 0 0-9.38-22.62l-68.51-68.49A32 32 0 0 0 475.49 0H448v96a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V0h234.66zM384 0v96a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V0zm32 448H160V320h256z"></path>
            </svg>
            Speichern
          </button>
          {/* Vollbild-Knopf */}
          <button
            onClick={toggleFullscreen}
            className="px-4 py-2 text-lg bg-gray-100 rounded hover:bg-gray-200"
          >
            Vollbild
          </button>
          {/* Löschen des aktuellen Texts */}
          <button
            onClick={deleteCurrentText}
            className="px-4 py-2 text-lg bg-red-100 rounded hover:bg-red-200"
          >
            Text löschen
          </button>
        </div>
      </header>

      {/* Hauptbereich (Eingabefeld und Archiv) */}
      <div className="flex-grow flex flex-col px-4 pb-4">
        {/* Eingabefeld */}
        <section className="mb-6 flex-grow flex flex-col">
          <div className="flex-grow w-full max-w-4xl mx-auto p-4 shadow-md overflow-auto">
            <div className={typewriterTextClasses}>
              {typedText}
              <span className="blinking-cursor">|</span>
            </div>
          </div>
          <p className="mt-2 text-lg text-gray-700 text-center">
            Enter, Backspace und Pfeiltasten sind blockiert – wie bei einer
            echten Schreibmaschine.
          </p>
        </section>

        {/* Archiv */}
        <section className="w-full max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold mb-2">Archiv</h2>
          {history.length === 0 ? (
            <p className="text-gray-700 text-lg">
              Keine früheren Einträge vorhanden.
            </p>
          ) : (
            history.map((entry, idx) => {
              let parsed;
              try {
                parsed = JSON.parse(entry);
              } catch {
                parsed = { text: entry, timestamp: '' };
              }
              return (
                <div key={idx} className="mb-4 px-4 py-3 shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-2xl">
                      Session #{idx + 1}{' '}
                      {parsed.timestamp &&
                        `(${new Date(parsed.timestamp).toLocaleString()})`}
                    </h3>
                    <button
                      onClick={() => deleteEntry(idx)}
                      className="px-3 py-1 text-sm bg-red-100 rounded hover:bg-red-200"
                    >
                      Löschen
                    </button>
                  </div>
                  <div className="whitespace-pre-wrap break-words font-serif text-xl md:text-2xl leading-relaxed">
                    {parsed.text}
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}
