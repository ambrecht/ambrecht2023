/**
 * @file writing-area.tsx
 * @description Komponente für den Schreibbereich der Typewriter-Anwendung.
 * Der Bereich wird in zwei Unterkomponenten aufgeteilt:
 * - LineStack: Fester, scrollbarer Container für bereits geschriebene Zeilen.
 * - ActiveWritingLine: Aktiver Eingabebereich, der stets am unteren Rand sichtbar ist.
 */

'use client';

import React, { ChangeEvent, KeyboardEvent } from 'react';
import { breakTextIntoLines } from '../utils/line-break-utils';
import { DEFAULT_LINE_BREAK_CONFIG, type WritingAreaProps } from '../types';
import LineStack from './LineStack';
import ActiveWritingLine from './ActiveWritingLine';

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
  darkMode,
}) => {
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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLineToStack();
    }
  };

  return (
    <div className="flex flex-col relative" style={{ height: '100vh' }}>
      <LineStack lines={lines} darkMode={darkMode} />
      <ActiveWritingLine
        activeLine={activeLine}
        setActiveLine={(text) => {
          // Simuliere handleChange, um die Zeilenaufteilung beizubehalten
          const eventLike = {
            target: { value: text },
          } as ChangeEvent<HTMLInputElement>;
          handleChange(eventLike);
        }}
        addLineToStack={addLineToStack}
        maxCharsPerLine={maxCharsPerLine}
        fontSize={fontSize}
        hiddenInputRef={hiddenInputRef}
        showCursor={showCursor}
        darkMode={darkMode}
      />
    </div>
  );
};

export default WritingArea;
