'use client';

import React, { useEffect, useState, useRef, FormEvent } from 'react';
import ReactDOM from 'react-dom';

// Generiert eine eindeutige Kennung für den aktuellen Client
function generateWriterId(): string {
  return 'writer-' + Math.random().toString(36).substring(2, 15);
}

export default function TypewriterPage() {
  // Zustand für den aktuell angezeigten Text
  const [typedText, setTypedText] = useState('');
  // Archiv der finalisierten Sessiontexte
  const [history, setHistory] = useState<string[]>([]);
  // Status, ob die Seite im Vollbildmodus angezeigt wird
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Master-/Slave-Status (Master darf schreiben, Slave nur lesen)
  const [isMaster, setIsMaster] = useState(false);
  // Eindeutige Kennung des Clients (wird auch durch PIN überschrieben)
  const [writerId, setWriterId] = useState<string>('');
  // PIN-Eingabe (zur Master-Aktivierung)
  const [pinInput, setPinInput] = useState('');
  // Zustand für den Close-Button im Vollbildmodus (sichtbar bei Mausbewegung)
  const [showClose, setShowClose] = useState(false);
  // Referenz, um asynchrone Inkonsistenzen zu vermeiden
  const typedTextRef = useRef(typedText);
  const isFinalizedRef = useRef(false);
  // Container für das Vollbild-Overlay (Portal)
  const [fullscreenContainer, setFullscreenContainer] =
    useState<HTMLElement | null>(null);
  // Timeout für das automatische Ausblenden des Close-Buttons
  const closeTimeoutRef = useRef<number>();

  // Beim Mount: Writer-ID generieren oder aus localStorage abrufen
  useEffect(() => {
    let id = localStorage.getItem('writerId');
    if (!id) {
      id = generateWriterId();
      localStorage.setItem('writerId', id);
    }
    setWriterId(id);
  }, []);

  // Falls der Benutzer die korrekte PIN eingibt, überschreiben wir die Writer-ID
  function handlePinSubmit(e: FormEvent) {
    e.preventDefault();
    if (pinInput === '4418') {
      localStorage.setItem('writerId', '4418');
      setWriterId('4418');
    }
    setPinInput('');
  }

  // Vollbild-Container anlegen
  useEffect(() => {
    const container = document.createElement('div');
    container.id = 'typewriter-fullscreen-overlay';
    document.body.appendChild(container);
    setFullscreenContainer(container);
    return () => {
      document.body.removeChild(container);
    };
  }, []);

  // Immer aktuelle Text-Referenz aktualisieren
  useEffect(() => {
    typedTextRef.current = typedText;
  }, [typedText]);

  // Historie der finalisierten Sessions laden
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

  // Master-/Slave-Status und aktueller Text abrufen
  useEffect(() => {
    if (!writerId) return; // Warten, bis writerId verfügbar ist
    const fetchLockStatus = async () => {
      try {
        // POST-Aufruf an den /api/lock-Endpunkt mit writerId
        const res = await fetch('/api/lock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ writerId }),
        });
        const data = await res.json();
        if (data.role === 'master') {
          setIsMaster(true);
        } else {
          setIsMaster(false);
          if (data.masterText !== undefined) {
            setTypedText(data.masterText);
          }
        }
      } catch (error) {
        console.error('Fehler beim Abrufen des Lock-Status:', error);
      }
    };
    // Initiale Abfrage und anschließendes Polling alle 3 Sekunden
    fetchLockStatus();
    const intervalId = setInterval(fetchLockStatus, 3000);
    return () => clearInterval(intervalId);
  }, [writerId]);

  // Tastatureingaben erfassen (nur, wenn Master)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isMaster) {
        // Bei Slave-Clients unterdrücken wir jegliche Eingaben
        e.preventDefault();
        return;
      }
      // Blockieren von Enter, Backspace und Pfeiltasten
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
      // Nur druckbare Zeichen werden hinzugefügt
      if (e.key.length === 1) {
        e.preventDefault();
        const newText = typedTextRef.current + e.key;
        setTypedText(newText);
        // Senden der aktualisierten Eingabe an den /api/typing-Endpunkt
        fetch('/api/typing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: newText, writerId }),
        }).catch((err) => console.error('Fehler beim Senden des Textes:', err));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMaster, writerId]);

  // Session finalisieren (nur einmal, wenn Text vorhanden)
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

  // Aktuellen Text löschen und Finalisierungsflag zurücksetzen
  function deleteCurrentText() {
    setTypedText('');
    isFinalizedRef.current = false;
  }

  // Finalisierung beim Schließen oder Neuladen der Seite
  useEffect(() => {
    const handleBeforeUnload = () => {
      finalizeSession();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Finalisierung bei Inaktivität (z. B. wenn die Seite in den Hintergrund wechselt)
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

  // Umschalten des Vollbildmodus
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

  // Mausbewegungen im Vollbildmodus: Close-Button einblenden
  function handleFullscreenMouseMove() {
    setShowClose(true);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = window.setTimeout(() => {
      setShowClose(false);
    }, 2000);
  }

  // Löschen eines Archiv-Eintrags (lokal; API-Aufruf optional)
  function deleteEntry(index: number) {
    setHistory((prev) => prev.filter((_, i) => i !== index));
    // Optional: API-Aufruf, um den Eintrag auch serverseitig zu löschen.
    // fetch('/api/delete-entry', { method: 'POST', body: JSON.stringify({ index }) });
  }

  // Typographiestil – serifenbetont und groß, sowohl im Standard- als auch im Vollbildmodus
  const typewriterTextClasses =
    'whitespace-pre-wrap break-words font-serif text-5xl md:text-6xl leading-relaxed';

  // Vollbild-Darstellung via Portal: Hier werden sämtliche Options-Elemente ausgeblendet;
  // einzig der Text wird angezeigt und ein Close-Button erscheint nur bei Mausbewegung.
  if (isFullscreen && fullscreenContainer) {
    return ReactDOM.createPortal(
      <div
        className="fixed inset-0 z-[9999] bg-white text-black font-serif flex flex-col overflow-auto"
        onMouseMove={handleFullscreenMouseMove}
      >
        {showClose && (
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 px-4 py-2 text-lg bg-gray-100 rounded opacity-100 transition-opacity duration-300"
          >
            Schließen
          </button>
        )}
        <div className="flex-grow flex flex-col items-center justify-center px-4 pb-4">
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
      <header className="p-4 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
        <h1 className="text-4xl md:text-5xl font-bold">
          Meine Schreibmaschine
        </h1>
        <div className="flex items-center space-x-2">
          {/* PIN-Eingabefeld zur Master-Aktivierung, falls noch nicht Master */}
          {writerId !== '4418' && (
            <form onSubmit={handlePinSubmit} className="flex space-x-1">
              <input
                type="password"
                placeholder="PIN eingeben"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="px-2 py-1 border rounded"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-blue-100 rounded hover:bg-blue-200"
              >
                Aktivieren
              </button>
            </form>
          )}
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
          <button
            onClick={toggleFullscreen}
            className="px-4 py-2 text-lg bg-gray-100 rounded hover:bg-gray-200"
          >
            Vollbild
          </button>
          <button
            onClick={deleteCurrentText}
            className="px-4 py-2 text-lg bg-red-100 rounded hover:bg-red-200"
          >
            Text löschen
          </button>
        </div>
      </header>
      {/* Hauptbereich */}
      <div className="flex-grow flex flex-col px-4 pb-4">
        {/* Eingabebereich */}
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
          {!isMaster && (
            <p className="mt-2 text-xl text-red-600 text-center">
              Sie haben Schreibrechte nicht – im Slave-Modus sehen Sie nur den
              Master-Text.
            </p>
          )}
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
