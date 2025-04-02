/**
 * @file ActiveWritingLine.tsx
 * @description Komponente für die aktive Schreibkopfzeile mit Eingabefeld, Cursor und Fortschrittsbalken.
 */

'use client';

import React, { ChangeEvent, KeyboardEvent } from 'react';

interface ActiveWritingLineProps {
  activeLine: string;
  setActiveLine: (line: string) => void;
  addLineToStack: () => void;
  maxCharsPerLine: number;
  fontSize: number;
  hiddenInputRef: React.RefObject<HTMLInputElement | null>;
  showCursor: boolean;
  darkMode: boolean;
}

const ActiveWritingLine: React.FC<ActiveWritingLineProps> = ({
  activeLine,
  setActiveLine,
  addLineToStack,
  maxCharsPerLine,
  fontSize,
  hiddenInputRef,
  showCursor,
  darkMode,
}) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setActiveLine(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLineToStack();
    }
  };

  return (
    <div className="sticky bottom-0" style={{ height: `${fontSize * 2.2}px` }}>
      <div
        className={`p-4 font-serif border-t ${
          darkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-[#f3efe9] border-[#e0dcd3]'
        } relative`}
        style={{ height: '100%' }}
      >
        {/* Sichtbarer Text mit blinkendem Cursor */}
        <div
          className={`whitespace-pre-wrap break-words absolute top-0 left-0 pointer-events-none overflow-hidden ${
            darkMode ? 'text-gray-200' : 'text-gray-800'
          }`}
          style={{ fontSize: `${fontSize}px`, lineHeight: '1.4' }}
          aria-hidden="true"
        >
          {activeLine}
          <span
            className={`inline-block w-[0.5em] h-[1.2em] ml-[1px] align-middle ${
              showCursor
                ? darkMode
                  ? 'bg-gray-200'
                  : 'bg-[#222]'
                : 'bg-transparent'
            }`}
            style={{ transform: 'translateY(-0.1em)' }}
          />
        </div>
        {/* Verstecktes Eingabefeld */}
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
        {/* Fortschrittsbalken */}
        <div
          className={`absolute bottom-0 left-0 h-1 ${
            darkMode ? 'bg-gray-700' : 'bg-[#e2dfda]'
          } w-full`}
        >
          <div
            className={`h-full ${
              darkMode ? 'bg-gray-500' : 'bg-[#bbb]'
            } transition-all duration-75`}
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

export default ActiveWritingLine;
