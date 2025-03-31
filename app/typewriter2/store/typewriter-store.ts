/**
 * @file typewriter-store.ts
 * @description Zustandsverwaltung für die Typewriter-Anwendung mit Zustand
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { type LineBreakConfig, type TypewriterState, DEFAULT_LINE_BREAK_CONFIG } from "../types"
import { reformatText } from "../utils/line-break-utils"

/**
 * Erstellt und exportiert den Typewriter-Store mit Zustand.
 * Der Store verwendet das persist-Middleware, um den Zustand im localStorage zu speichern.
 */
export const useTypewriterStore = create(
  persist<TypewriterState>(
    (set, get) => ({
      // Initialzustand
      lines: [],
      activeLine: "",
      maxCharsPerLine: DEFAULT_LINE_BREAK_CONFIG.maxCharsPerLine,
      letterCount: 0,
      wordCount: 0,
      pageCount: 0,
      lineBreakConfig: DEFAULT_LINE_BREAK_CONFIG,
      fontSize: 24,
      darkMode: false,

      /**
       * Setzt die aktive Zeile und aktualisiert die Statistiken.
       *
       * @param text - Der neue Text für die aktive Zeile
       */
      setActiveLine: (text: string) =>
        set((state) => {
          // Berechne die Statistiken basierend auf dem gesamten Text
          const fullText = [...state.lines, text].join(" ")
          const wordCount = fullText.trim().split(/\s+/).filter(Boolean).length
          const letterCount = fullText.replace(/\s+/g, "").length
          const pageCount = Math.floor(fullText.length / 1600)

          return { activeLine: text, wordCount, letterCount, pageCount }
        }),

      /**
       * Fügt die aktive Zeile zum Stack hinzu und setzt die aktive Zeile zurück.
       */
      addLineToStack: () =>
        set((state) => {
          // Wenn die aktive Zeile leer ist, ändere nichts
          if (!state.activeLine.trim()) return state

          // Füge die aktive Zeile zum Stack hinzu und setze sie zurück
          const newLines = [...state.lines, state.activeLine]
          return { lines: newLines, activeLine: "" }
        }),

      /**
       * Aktualisiert die Konfiguration für den Zeilenumbruch und formatiert den Text neu.
       *
       * @param config - Die neue Konfiguration für den Zeilenumbruch
       */
      updateLineBreakConfig: (config: Partial<LineBreakConfig>) =>
        set((state) => {
          // Prüfe, ob sich die Konfiguration tatsächlich ändert
          const hasChanges = Object.entries(config).some(
            ([key, value]) => state.lineBreakConfig[key as keyof LineBreakConfig] !== value,
          )

          // Wenn keine Änderungen vorliegen, gib den aktuellen Zustand zurück
          if (!hasChanges) return state

          // Erstelle eine neue Konfiguration mit den neuen Werten
          const newConfig: LineBreakConfig = {
            ...state.lineBreakConfig,
            ...config,
          }

          // Formatiere den Text neu mit der neuen Konfiguration
          const newLines = reformatText(state.lines, newConfig)

          return {
            lineBreakConfig: newConfig,
            maxCharsPerLine: newConfig.maxCharsPerLine,
            lines: newLines,
          }
        }),

      /**
       * Setzt die Schriftgröße.
       *
       * @param size - Die neue Schriftgröße in Pixeln
       */
      setFontSize: (size: number) => set(() => ({ fontSize: size })),

      /**
       * Schaltet den Nachtmodus um.
       */
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      /**
       * Löscht die aktuelle Eingabe.
       */
      clearCurrentInput: () => set(() => ({ activeLine: "" })),

      /**
       * Setzt die Sitzung zurück, indem alle Zeilen und Statistiken zurückgesetzt werden.
       */
      resetSession: () =>
        set(() => ({
          lines: [],
          activeLine: "",
          wordCount: 0,
          letterCount: 0,
          pageCount: 0,
        })),
    }),
    {
      // Konfiguration für das persist-Middleware
      name: "typewriter-storage",
    },
  ),
)

