/**
 * @file page.tsx
 * @description Hauptseite der Typewriter-Anwendung
 */

'use client';
import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTypewriterStore } from './store/typewriter-store';
import WritingArea from './components/writing-area';
import ControlBar from './components/control-bar';
import FullscreenExitButton from './components/fullscreen-exit-button';
import LineBreakSettingsPanel from './components/line-break-settings-panel';

/**
 * Die Hauptkomponente der Typewriter-Anwendung.
 * Sie orchestriert alle Unterkomponenten und verwaltet den globalen Zustand.
 *
 * @returns Die gerenderte Typewriter-Anwendung
 */
export default function TypewriterPage() {
  // Hole den Zustand aus dem Store
  const {
    lines,
    activeLine,
    setActiveLine,
    addLineToStack,
    maxCharsPerLine,
    resetSession,
    wordCount,
    pageCount,
    lineBreakConfig,
  } = useTypewriterStore();

  // Referenzen für DOM-Elemente
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Lokaler Zustand
  const [fontSize, setFontSize] = useState(24);
  const [showCursor, setShowCursor] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Setze die Sitzung zurück, wenn die Komponente geladen wird
  useEffect(() => {
    resetSession();
  }, [resetSession]);

  // Blinken des Cursors
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  // Fokussiere das Eingabefeld beim Laden und bei Klicks
  useEffect(() => {
    const focusInput = () => {
      if (hiddenInputRef.current) {
        hiddenInputRef.current.focus();
      }
    };

    // Sofort fokussieren
    focusInput();

    // Bei Klicks fokussieren
    const handleClick = () => focusInput();
    document.addEventListener('click', handleClick);

    // Bei Vollbildänderungen fokussieren
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      focusInput();
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Bereinige die Event-Handler beim Unmount
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  /**
   * Wechselt zwischen Vollbild- und normalem Modus
   */
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current
        .requestFullscreen()
        .catch((err) => console.error('Fullscreen error:', err));
    } else if (document.fullscreenElement) {
      document
        .exitFullscreen()
        .catch((err) => console.error('Exit fullscreen error:', err));
    }
  };

  return (
    <div
      ref={containerRef}
      className={`min-h-screen flex flex-col ${
        isFullscreen ? 'bg-[#f8f5f0]' : 'bg-[#f3efe9]'
      } text-gray-900 transition-colors duration-300`}
    >
      <header
        className={`border-b ${
          isFullscreen ? 'border-[#e0dcd3]' : 'border-[#d3d0cb]'
        } transition-colors duration-300`}
      >
        {!isFullscreen ? (
          <ControlBar
            wordCount={wordCount}
            pageCount={pageCount}
            fontSize={fontSize}
            setFontSize={setFontSize}
            toggleFullscreen={toggleFullscreen}
            hiddenInputRef={hiddenInputRef}
          />
        ) : (
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-4">
              <FullscreenExitButton
                toggleFullscreen={toggleFullscreen}
                hiddenInputRef={hiddenInputRef}
              />
              <div className="text-sm font-medium">
                Wörter: {wordCount} | Seiten: {pageCount}
              </div>
            </div>
            <LineBreakSettingsPanel />
          </div>
        )}
      </header>
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8">
        <section
          className={`flex-1 flex flex-col ${
            isFullscreen ? 'bg-white' : 'bg-[#fcfcfa]'
          } shadow-md rounded-lg overflow-hidden transition-colors duration-300`}
        >
          <WritingArea
            lines={lines}
            activeLine={activeLine}
            setActiveLine={setActiveLine}
            addLineToStack={addLineToStack}
            maxCharsPerLine={maxCharsPerLine}
            fontSize={fontSize}
            hiddenInputRef={hiddenInputRef}
            showCursor={showCursor}
            lineBreakConfig={lineBreakConfig}
          />
        </section>
      </main>
      <footer className="p-3 border-t border-[#d3d0cb] text-center text-sm text-gray-600">
        Typing Machine Application — Moderne Umsetzung des klassischen
        Schreibmaschinengefühls
      </footer>
    </div>
  );
}
