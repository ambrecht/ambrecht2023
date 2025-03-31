/**
 * @file typewriter-store.ts
 * @description Zustandsverwaltung für die Typewriter-Anwendung mit Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LineBreakConfig, TypewriterState } from '../types';
import { defaultLineBreakConfig } from '../config/line-break-config';
import { reformatText } from '../utils/line-break-utils';

/**
 * Erstellt und exportiert den Typewriter-Store mit Zustand.
 * Der Store verwendet das persist-Middleware, um den Zustand im localStorage zu speichern.
 */
export const useTypewriterStore = create(
  persist<TypewriterState>(
    (set, get) => ({
      // Initialzustand
      lines: [],
      activeLine: '',
      maxCharsPerLine: defaultLineBreakConfig.maxCharsPerLine,
      letterCount: 0,
      wordCount: 0,
      pageCount: 0,
      lineBreakConfig: defaultLineBreakConfig,

      /**
       * Setzt die aktive Zeile und aktualisiert die Statistiken.
       *
       * @param text - Der neue Text für die aktive Zeile
       */
      setActiveLine: (text: string) =>
        set((state) => {
          // Berechne die Statistiken basierend auf dem gesamten Text
          const fullText = [...state.lines, text].join(' ');
          const wordCount = fullText.trim().split(/\s+/).filter(Boolean).length;
          const letterCount = fullText.replace(/\s+/g, '').length;
          const pageCount = Math.floor(fullText.length / 1600);

          return { activeLine: text, wordCount, letterCount, pageCount };
        }),

      /**
       * Fügt die aktive Zeile zum Stack hinzu und setzt die aktive Zeile zurück.
       */
      addLineToStack: () =>
        set((state) => {
          // Wenn die aktive Zeile leer ist, ändere nichts
          if (!state.activeLine.trim()) return state;

          // Füge die aktive Zeile zum Stack hinzu und setze sie zurück
          const newLines = [...state.lines, state.activeLine];
          return { lines: newLines, activeLine: '' };
        }),

      /**
       * Setzt die maximale Anzahl von Zeichen pro Zeile und formatiert den Text neu.
       *
       * @param value - Die neue maximale Anzahl von Zeichen pro Zeile
       */
      setMaxCharsPerLine: (value: number) =>
        set((state) => {
          // Erstelle eine neue Konfiguration mit dem neuen Wert
          const newConfig: LineBreakConfig = {
            ...state.lineBreakConfig,
            maxCharsPerLine: value,
          };

          // Formatiere den Text neu mit der neuen Konfiguration
          const newLines = reformatText(state.lines, newConfig);

          return {
            maxCharsPerLine: value,
            lineBreakConfig: newConfig,
            lines: newLines,
          };
        }),

      /**
       * Setzt die Sitzung zurück, indem alle Zeilen und Statistiken zurückgesetzt werden.
       */
      resetSession: () =>
        set(() => ({
          lines: [],
          activeLine: '',
          wordCount: 0,
          letterCount: 0,
          pageCount: 0,
        })),
    }),
    {
      // Konfiguration für das persist-Middleware
      name: 'typewriter-storage',
    },
  ),
);
