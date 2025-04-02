/**
 * @file writing-area.tsx
 * @description Komponente für den Schreibbereich der Typewriter-Anwendung
 */

'use client';

import React, { useEffect } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { breakTextIntoLines } from '../utils/line-break-utils';
import { DEFAULT_LINE_BREAK_CONFIG, type WritingAreaProps } from '../types';

/**
 * Die Komponente WritingArea rendert den Bereich zum Schreiben.
 * Sie zeigt bereits verfasste Zeilen sowie die aktive Zeile mit einem blinkenden Cursor an.
 * Die Zeilenaufteilung erfolgt anhand der extern ausgelagerten Logik in line-break-utils.ts.
 *
 * Besonderheiten:
 * - Der Bereich mit id="typewriter-content" hat immer eine feste Höhe.
 *   - Im normalen Modus: max. 50vh (große Bildschirme), max. 80vh (kleine Bildschirme)
 *   - Im Vollbildmodus: exakt 100vh abzüglich der Höhe der aktiven Zeile
 * - Wenn mehr Zeilen geschrieben wurden, als in den Container passen, erscheint ein Scrollbalken.
 * - Die aktive Zeile bleibt immer sichtbar und vom Scrollbereich unbeeinflusst.
 */
const WritingArea: React.FC<WritingAreaProps> = ({
  lines,
  activeLine,
  setActiveLine,
  addLineToStack,
  maxCharsPerLine,
  fontSize,
  hiddenInputRef,
  showCursor,
  lineBreakConfig = DEFAULT_LINE_BREAK_CONFIG,
}) => {
  /**
   * Verarbeitet Texteingaben im versteckten Eingabefeld.
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const brokenLines = breakTextIntoLines(newValue, lineBreakConfig);

    if (brokenLines.length > 1) {
      brokenLines.slice(0, -1).forEach((segment) => {
        setActiveLine(segment);
        addLineToStack();
      });
      setActiveLine(brokenLines[brokenLines.length - 1]);
    } else {
      setActiveLine(newValue);
    }
  };

  /**
   * Scrollt automatisch ans Ende des Zeilencontainers, wenn neue Zeilen hinzukommen.
   * Setzt außerdem die Höhe des Containers dynamisch anhand des Modus (Vollbild oder nicht).
   */
  useEffect(() => {
    const updateHeight = () => {
      const el = document.getElementById('typewriter-content');
      if (!el) return;

      const isFullscreen = !!document.fullscreenElement;
      const activeLineHeight = fontSize * 2.2;

      if (isFullscreen) {
        el.style.height = `calc(100vh - ${activeLineHeight}px)`;
        el.style.maxHeight = `calc(100vh - ${activeLineHeight}px)`;
      } else {
        const isMobile = window.innerWidth < 768;
        el.style.height = isMobile ? '80vh' : '50vh';
        el.style.maxHeight = isMobile ? '80vh' : '50vh';
      }

      // Scrollt bei neuen Zeilen automatisch nach unten
      el.scrollTop = el.scrollHeight;
    };

    document.addEventListener('fullscreenchange', updateHeight);
    window.addEventListener('resize', updateHeight);
    updateHeight();

    return () => {
      document.removeEventListener('fullscreenchange', updateHeight);
      window.removeEventListener('resize', updateHeight);
    };
  }, [lines, fontSize]);

  /**
   * Reagiert auf die Eingabetaste.
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLineToStack();
    }
  };

  return (
    <div className="max-h-screen flex-1 flex flex-col overflow-hidden relative">
      {/* Bereich für bereits geschriebene Zeilen */}
      <div
        id="typewriter-content"
        className="overflow-y-auto overflow-x-hidden px-6 pt-6 pb-2 select-none"
        style={{
          fontSize: '16px',
          lineHeight: '1.6',
          height: '40vh', // Fallback-Höhe, wird durch JS angepasst
          maxHeight: '80vh', // Fallback
          overscrollBehavior: 'contain',
        }}
        aria-live="polite"
      >
        <div className="min-h-full flex flex-col justify-end">
          {lines.map((line, i) => (
            <div
              key={i}
              className="whitespace-pre-wrap break-words mb-2 font-serif text-gray-800"
            >
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* Aktive Eingabezeile mit Cursor */}
      <div
        className="sticky bottom-0 bg-[#f3efe9] p-4 font-serif border-t border-[#e0dcd3]"
        style={{ height: `${fontSize * 2.2}px` }}
      >
        <div className="relative">
          {/* Sichtbarer Text mit Cursor */}
          <div
            className="whitespace-pre-wrap break-words absolute top-0 left-0 pointer-events-none text-gray-800 overflow-hidden"
            style={{ fontSize: `${fontSize}px`, lineHeight: '1.4' }}
            aria-hidden="true"
          >
            {activeLine}
            <span
              className={`inline-block w-[0.5em] h-[1.2em] ml-[1px] align-middle ${
                showCursor ? 'bg-[#222]' : 'bg-transparent'
              }`}
              style={{ transform: 'translateY(-0.1em)' }}
            />
          </div>

          {/* Unsichtbares Eingabefeld */}
          <input
            ref={hiddenInputRef}
            type="text"
            value={activeLine}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-transparent caret-transparent outline-none whitespace-nowrap overflow-hidden"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: '1.4',
              fontFamily: 'serif',
              height: `${fontSize * 1.4}px`,
            }}
            autoFocus
            aria-label="Typewriter Eingabefeld"
          />
        </div>

        {/* Fortschrittsbalken */}
        <div className="absolute bottom-0 left-0 h-1 bg-[#e2dfda] w-full">
          <div
            className="h-full bg-[#bbb] transition-all duration-75"
            style={{
              width: `${(activeLine.length / maxCharsPerLine) * 100}%`,
            }}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={maxCharsPerLine}
            aria-valuenow={activeLine.length}
          />
        </div>
      </div>
    </div>
  );
};

export default WritingArea;
