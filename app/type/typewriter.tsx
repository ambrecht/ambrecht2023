'use client';

import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTypewriterStore } from './store';
import SaveButton from './saveButton';

import {
  Fullscreen,
  FullscreenIcon as FullscreenExit,
  FileText,
  AlignLeft,
} from 'lucide-react';

// Einfacher Button
function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={`px-4 py-2 rounded ${props.className}`}>
      {props.children}
    </button>
  );
}

// Einfaches Input-Feld
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} className={`p-2 border rounded ${props.className}`} />
  );
}

export default function Typewriter() {
  const {
    lines,
    activeLine,
    wordCount,
    pageCount,
    maxCharsPerLine,
    setActiveLine,
    addLineToStack,
    setMaxCharsPerLine,
    resetSession,
  } = useTypewriterStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(24);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Letzte Zeitmessung für Tastenanschläge (falls benötigt)
  const lastKeyTimeRef = useRef<number>(0);

  // Sitzung zurücksetzen beim Laden
  useEffect(() => {
    resetSession();
  }, [resetSession]);

  // maxCharsPerLine dynamisch anpassen
  useEffect(() => {
    const updateMaxChars = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      // geschätzte Breite eines Zeichens in einer Serif-Schrift
      const charWidth = fontSize * 0.6;
      const newMaxChars = Math.floor((containerWidth * 0.95) / charWidth);
      setMaxCharsPerLine(newMaxChars);
    };

    updateMaxChars();

    const resizeObserver = new ResizeObserver(updateMaxChars);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [fontSize, setMaxCharsPerLine]);

  // Fokus auf das unsichtbare Input-Feld halten
  useEffect(() => {
    const focusInput = () => {
      setTimeout(() => hiddenInputRef.current?.focus(), 10);
    };

    focusInput();

    const handleClick = () => {
      focusInput();
    };

    document.addEventListener('click', handleClick);

    // Vollbild-Wechsel abfangen
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      focusInput();
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Vollbild an- und ausschalten
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

  // Automatisch nach unten scrollen, damit die neueste Zeile sichtbar bleibt
  useEffect(() => {
    const scrollToBottom = () => {
      const content = document.getElementById('typewriter-content');
      if (content) {
        content.scrollTop = content.scrollHeight;
      }
    };

    scrollToBottom();
  }, [lines.length]);

  // Blinkender Cursor
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${
        isFullscreen
          ? 'fixed inset-0 z-50'
          : 'mx-auto max-w-[700px] h-full w-full'
      } flex flex-col bg-[#f9f6f1] text-[#222] font-serif`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Bedienleiste - nur sichtbar, wenn nicht im Vollbild */}
      {!isFullscreen && (
        <div className="flex flex-wrap gap-4 items-center justify-between p-3 bg-[#f3efe9] text-[#222] text-sm border-b border-[#ccc]">
          <div className="flex items-center gap-2">
            <AlignLeft className="h-4 w-4" />
            <span>Wörter: {wordCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Seiten (A4): {pageCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="fontSize" className="text-xs">
              Schriftgröße:
            </label>
            <Input
              id="fontSize"
              type="number"
              min={24}
              max={50}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="bg-[#ebe8e3] w-16 text-[#222] text-xs h-8"
            />
          </div>
          <SaveButton />
          <Button
            onClick={(e) => {
              e.preventDefault();
              toggleFullscreen();
              setTimeout(() => hiddenInputRef.current?.focus(), 100);
            }}
            className="bg-[#d3d0cb] hover:bg-[#c4c1bc] text-[#222]"
          >
            <Fullscreen className="h-4 w-4 mr-1" />
            Vollbild
          </Button>
        </div>
      )}

      {/* Schreibbereich mit fixierter Eingabezeile am unteren Rand */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Scrollbarer Bereich für bereits getippte Zeilen */}
        <div
          className="flex-1 overflow-y-auto px-6 pt-6 pb-2 select-none"
          style={{ fontSize: '16px', lineHeight: '1.6' }}
          id="typewriter-content"
        >
          <div className="min-h-full flex flex-col justify-end">
            {lines.map((line, i) => (
              <div key={i} className="whitespace-pre-wrap break-words mb-2">
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* Sichtbares Eingabefeld am unteren Rand */}
        <div className="sticky bottom-0 bg-[#f3efe9] p-4 font-serif border-t border-[#ccc]">
          <div className="relative">
            {/* Anzeige der aktiven Zeile mit Cursor */}
            <div
              className="whitespace-pre-wrap break-words absolute top-0 left-0 pointer-events-none"
              style={{ fontSize: `${fontSize}px`, lineHeight: '1.4' }}
            >
              {activeLine}
              <span
                className={`inline-block w-[0.5em] h-[1.2em] ml-[1px] align-middle ${
                  showCursor ? 'bg-[#222]' : 'bg-transparent'
                }`}
                style={{
                  transform: 'translateY(-0.1em)',
                }}
              />
            </div>

            {/* Tatsächliches Input-Feld für die Eingabe */}
            <input
              ref={hiddenInputRef}
              type="text"
              value={activeLine}
              onChange={(e) => {
                setActiveLine(e.target.value);

                // Zeilenumbruch, falls die Zeile zu lang wird
                if (e.target.value.length > maxCharsPerLine) {
                  const lastSpaceIndex = e.target.value.lastIndexOf(' ');
                  if (
                    lastSpaceIndex > 0 &&
                    lastSpaceIndex > maxCharsPerLine * 0.7
                  ) {
                    // An einem Leerzeichen umbrechen
                    const lineToAdd = e.target.value.substring(
                      0,
                      lastSpaceIndex,
                    );
                    const remaining = e.target.value.substring(
                      lastSpaceIndex + 1,
                    );

                    useTypewriterStore.setState((state) => ({
                      lines: [...state.lines, lineToAdd],
                    }));
                    setActiveLine(remaining);
                  }
                }
              }}
              onKeyDown={(e) => {
                // Bei Enter die Zeile abschicken
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addLineToStack();
                }
              }}
              className="w-full bg-transparent text-transparent caret-transparent outline-none"
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: '1.4',
                fontFamily: 'serif',
              }}
              autoFocus
            />
          </div>

          {/* Fortschrittsbalken */}
          <div className="absolute bottom-0 left-0 h-1 bg-[#e2dfda] w-full">
            <div
              className="h-full bg-[#bbb] transition-all duration-75"
              style={{
                width: `${(activeLine.length / maxCharsPerLine) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Vollbild verlassen, nur sichtbar im Vollbild */}
      {isFullscreen && (
        <div className="absolute top-2 right-2 z-50">
          <Button
            onClick={(e) => {
              e.preventDefault();
              toggleFullscreen();
              setTimeout(() => hiddenInputRef.current?.focus(), 100);
            }}
            className="bg-[#d3d0cb] hover:bg-[#c4c1bc] text-[#222]"
          >
            <FullscreenExit className="h-4 w-4 mr-1" />
            Vollbild verlassen
          </Button>
        </div>
      )}
    </div>
  );
}
