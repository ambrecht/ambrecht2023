import type React from "react"
/**
 * @file types.ts
 * @description Zentrale Typdefinitionen für die Typewriter-Anwendung
 */

/**
 * Konfiguration für den Zeilenumbruch
 */
export interface LineBreakConfig {
  /** Maximale Anzahl von Zeichen pro Zeile (Standard: 56) */
  maxCharsPerLine: number
}

/**
 * Standardkonfiguration für den Zeilenumbruch
 */
export const DEFAULT_LINE_BREAK_CONFIG: LineBreakConfig = {
  maxCharsPerLine: 56,
}

/**
 * Props für die WritingArea-Komponente
 */
export interface WritingAreaProps {
  /** Array von bereits geschriebenen Zeilen */
  lines: string[]
  /** Aktuell aktive Zeile, die bearbeitet wird */
  activeLine: string
  /** Funktion zum Setzen der aktiven Zeile */
  setActiveLine: (line: string) => void
  /** Funktion zum Hinzufügen der aktiven Zeile zum Stack */
  addLineToStack: () => void
  /** Maximale Anzahl von Zeichen pro Zeile */
  maxCharsPerLine: number
  /** Schriftgröße in Pixeln */
  fontSize: number
  /** Referenz zum versteckten Eingabefeld */
  hiddenInputRef: React.RefObject<HTMLInputElement | null>
  /** Gibt an, ob der Cursor angezeigt werden soll */
  showCursor: boolean
  /** Konfiguration für den Zeilenumbruch */
  lineBreakConfig?: LineBreakConfig
}

/**
 * Props für die ControlBar-Komponente
 */
export interface ControlBarProps {
  /** Anzahl der Wörter im Text */
  wordCount: number
  /** Anzahl der Seiten im Text */
  pageCount: number
  /** Schriftgröße in Pixeln */
  fontSize: number
  /** Funktion zum Setzen der Schriftgröße */
  setFontSize: (size: number) => void
  /** Funktion zum Umschalten des Vollbildmodus */
  toggleFullscreen: () => void
  /** Referenz zum versteckten Eingabefeld */
  hiddenInputRef: React.RefObject<HTMLInputElement | null>
}

/**
 * Props für die FullscreenExitButton-Komponente
 */
export interface FullscreenExitButtonProps {
  /** Funktion zum Umschalten des Vollbildmodus */
  toggleFullscreen: () => void
  /** Referenz zum versteckten Eingabefeld */
  hiddenInputRef: React.RefObject<HTMLInputElement | null>
}

/**
 * Props für die LineBreakSettingsPanel-Komponente
 */
export interface LineBreakSettingsPanelProps {
  /** Optionale Callback-Funktion, die aufgerufen wird, wenn die Konfiguration geändert wird */
  onConfigChange?: () => void
}

/**
 * Zustand der Typewriter-Anwendung
 */
export interface TypewriterState {
  /** Array von bereits geschriebenen Zeilen */
  lines: string[]
  /** Aktuell aktive Zeile, die bearbeitet wird */
  activeLine: string
  /** Maximale Anzahl von Zeichen pro Zeile */
  maxCharsPerLine: number
  /** Anzahl der Wörter im Text */
  wordCount: number
  /** Anzahl der Seiten im Text */
  pageCount: number
  /** Anzahl der Buchstaben im Text */
  letterCount: number
  /** Konfiguration für den Zeilenumbruch */
  lineBreakConfig: LineBreakConfig
  /** Funktion zum Setzen der aktiven Zeile */
  setActiveLine: (text: string) => void
  /** Funktion zum Hinzufügen der aktiven Zeile zum Stack */
  addLineToStack: () => void
  /** Funktion zum Setzen der maximalen Anzahl von Zeichen pro Zeile */
  setMaxCharsPerLine: (value: number) => void
  /** Funktion zum Zurücksetzen der Sitzung */
  resetSession: () => void
}

/**
 * Ergebnis der Zeilenumbruchoperation
 */
export interface LineBreakResult {
  /** Text, der in die aktuelle Zeile passt */
  line: string
  /** Restlicher Text, der in die nächste Zeile verschoben wird */
  remainder: string
}

