/**
 * @file LineStack.tsx
 * @description Komponente zur Darstellung des Zeilenstapels (alle geschriebenen Zeilen).
 */

'use client';

import React, { useEffect, useRef } from 'react';

interface LineStackProps {
  lines: string[];
  darkMode: boolean;
}

const PAPER_HEIGHT = 800; // Festes Papiermaß in Pixeln

const LineStack: React.FC<LineStackProps> = ({ lines, darkMode }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Automatisch zum Ende scrollen, wenn neue Zeilen hinzukommen
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto px-6 pt-6 pb-2 select-none ${
        darkMode ? 'bg-gray-900 text-gray-200' : 'bg-[#fcfcfa] text-gray-800'
      }`}
      style={{
        fontSize: '16px',
        lineHeight: '1.6',
        height: `${PAPER_HEIGHT}px`,
      }}
      id="typewriter-content"
      aria-live="polite"
    >
      <div className="min-h-full flex flex-col justify-end">
        {lines.map((line, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap break-words mb-2 font-serif ${
              darkMode ? 'text-gray-200' : 'text-gray-800'
            }`}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LineStack;
