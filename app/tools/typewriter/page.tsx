'use client';

import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';

export default function TypewriterPage() {
  // Zustand für den aktuell getippten Text ("Blatt")
  const [typedText, setTypedText] = useState('');
  // Zustand für die archivierten Sessions (Historie)
  const [history, setHistory] = useState<string[]>([]);
  // Zustand, ob der Vollbildmodus aktiviert ist
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Ref, um stets den aktuellen Text auch in asynchronen Aufrufen verfügbar zu haben
  const typedTextRef = useRef(typedText);
  useEffect(() => {
    typedTextRef.current = typedText;
  }, [typedText]);
  // Ref zur Vermeidung mehrfacher Finalisierungen derselben Session
  const isFinalizedRef = useRef(false);
  // Zustand für den Container, in dem der Vollbild-Overlay via Portal gerendert wird
  const [fullscreenContainer, setFullscreenContainer] =
    useState<HTMLElement | null>(null);

  // Beim Mounten: Erzeuge ein Container-Div im document.body für das Portal,
  // sodass der Vollbildmodus sämtliche Layout-Komponenten überlagert.
  useEffect(() => {
    const container = document.createElement('div');
    container.id = 'fullscreen-overlay';
    document.body.appendChild(container);
    setFullscreenContainer(container);
    return () => {
      document.body.removeChild(container);
    };
  }, []);

  // Laden der archivierten Sessions aus der API
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

  // Erfassen von Tastatureingaben:
  // Unterdrückt unerwünschte Tasten (Enter, Backspace, Pfeiltasten) und
  // sammelt alle druckbaren Zeichen, um den aktuellen Text zu aktualisieren.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      if (e.key.length === 1) {
        e.preventDefault();
        setTypedText((prev) => prev + e.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Funktion zur Finalisierung der Session:
  // Hier wird der aktuelle Text (samt Zeitstempel) mittels navigator.sendBeacon
  // an den Server übermittelt. Durch den Lock (isFinalizedRef) wird ein doppeltes
  // Speichern verhindert.
  async function finalizeSession() {
    if (isFinalizedRef.current) return; // Bereits finalisiert? → Beenden.
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

  // Finalisierung beim Schließen oder Neuladen der Seite (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = () => {
      finalizeSession();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Finalisierung, wenn die Seite für mehr als zwei Sekunden den Fokus verliert,
  // etwa wenn ein neuer Tab geöffnet wird oder die Seite in den Hintergrund tritt.
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

  // Umschalten des Vollbildmodus:
  // Beim Aktivieren wird ein Request an das gesamte Dokument gestellt,
  // beim Deaktivieren wird der Vollbildmodus wieder verlassen.
  const toggleFullscreen = () => {
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
  };

  // Darstellung im Vollbildmodus:
  // Wird ein Container für das Portal erzeugt, wird der gesamte Viewport überdeckt.
  // Ein kleiner Button in der oberen rechten Ecke ermöglicht das Verlassen des Modus.
  if (isFullscreen && fullscreenContainer) {
    return ReactDOM.createPortal(
      <div className="fixed top-0 left-0 w-full h-full bg-white z-50 flex flex-col">
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 p-2 border border-gray-400 rounded hover:bg-gray-200 text-sm"
        >
          Vollbild verlassen
        </button>
        <div className="flex-grow flex items-center justify-center">
          <div className="w-full max-w-3xl p-4">
            <div className="text-3xl whitespace-pre-wrap leading-loose">
              {typedText}
            </div>
          </div>
        </div>
      </div>,
      fullscreenContainer,
    );
  }

  // Darstellung im Normalmodus:
  // Zeigt das aktuelle "Blatt" (den getippten Text) sowie das Archiv früherer Sessions.
  return (
    <main className="flex flex-col items-center w-full min-h-screen bg-white text-black px-4 py-6 font-serif">
      <div className="w-full max-w-3xl mb-4 flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl font-bold">
          Klassische Schreibmaschine
        </h1>
        <button
          onClick={toggleFullscreen}
          className="p-2 border border-gray-400 rounded hover:bg-gray-200"
        >
          Vollbild
        </button>
      </div>
      <div className="w-full max-w-3xl mb-8 p-4 border border-gray-400">
        <h2 className="text-xl md:text-2xl font-semibold mb-2">
          Aktuelles Blatt
        </h2>
        <div className="text-2xl md:text-3xl whitespace-pre-wrap min-h-[150px] leading-loose">
          {typedText}
        </div>
        <p className="mt-2 text-gray-500 text-sm">
          (Kein Löschen oder Enter möglich. Das Blatt bleibt bestehen, bis die
          Seite geschlossen, neu geladen oder ein neuer Tab geöffnet wird.)
        </p>
      </div>
      <section className="w-full max-w-3xl p-4 border border-gray-800 bg-gray-100">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">
          Archiv früherer Sessions
        </h2>
        {history.length === 0 ? (
          <p className="text-gray-600">Bisher keine Einträge.</p>
        ) : (
          history.map((entry, idx) => {
            let parsed;
            try {
              parsed = JSON.parse(entry);
            } catch {
              parsed = { text: entry, timestamp: '' };
            }
            return (
              <div key={idx} className="mb-6">
                <h3 className="text-lg md:text-xl font-bold text-gray-700">
                  Session #{idx + 1}{' '}
                  {parsed.timestamp &&
                    `(${new Date(parsed.timestamp).toLocaleString()})`}
                </h3>
                <div className="bg-white p-4 border border-gray-300 text-base md:text-lg whitespace-pre-wrap break-words mt-2">
                  {parsed.text}
                </div>
              </div>
            );
          })
        )}
      </section>
    </main>
  );
}
