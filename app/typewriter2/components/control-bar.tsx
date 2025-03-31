'use client';

/**
 * @file control-bar.tsx
 * @description Komponente für die Kontrollleiste der Typewriter-Anwendung
 */

import React from 'react';
import { AlignLeft, FileText, Fullscreen } from 'lucide-react';
import SaveButton from './save-button';
import Button from './button';
import LineBreakSettingsPanel from './line-break-settings-panel';
import HelpButton from './help-button';
import type { ControlBarProps } from '../types';
import { useTypewriterStore } from '../store/typewriter-store';

/**
 * Die Komponente ControlBar rendert die obere Bedienleiste, welche Statistiken,
 * einen Speichern-Button, den Button zum Aktivieren des Vollbildmodus und
 * das Einstellungspanel umfasst.
 *
 * @component
 * @param props - Die Eigenschaften der Komponente
 */
const ControlBar: React.FC<ControlBarProps> = ({
  wordCount,
  pageCount,
  toggleFullscreen,
  hiddenInputRef,
}) => {
  const {
    fontSize,
    setFontSize,
    lineBreakConfig,
    updateLineBreakConfig,
    darkMode,
    toggleDarkMode,
    clearCurrentInput,
  } = useTypewriterStore();

  return (
    <div
      className={`flex flex-wrap gap-4 items-center justify-between p-3 ${
        darkMode ? 'text-gray-200 bg-gray-900' : 'text-[#222] bg-[#f3efe9]'
      } text-sm`}
    >
      {/* Statistiken */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <AlignLeft
            className={`h-4 w-4 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          />
          <span>Wörter: {wordCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText
            className={`h-4 w-4 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          />
          <span>Seiten (A4): {pageCount}</span>
        </div>
      </div>

      {/* Steuerelemente */}
      <div className="flex items-center gap-4">
        <SaveButton />
        <Button
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            toggleFullscreen();
            setTimeout(() => hiddenInputRef.current?.focus(), 100);
          }}
          className={`${
            darkMode
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
              : 'bg-[#d3d0cb] hover:bg-[#c4c1bc] text-[#222]'
          } flex items-center gap-1 transition-colors duration-200`}
          aria-label="Vollbildmodus aktivieren"
        >
          <Fullscreen className="h-4 w-4" />
          Vollbild
        </Button>
        <HelpButton darkMode={darkMode} />
        <LineBreakSettingsPanel
          fontSize={fontSize}
          setFontSize={setFontSize}
          lineBreakConfig={lineBreakConfig}
          updateLineBreakConfig={updateLineBreakConfig}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          clearCurrentInput={clearCurrentInput}
        />
      </div>
    </div>
  );
};

export default ControlBar;
