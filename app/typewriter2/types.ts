/**
 * @file types.ts
 * @description Zentrale Typdefinitionen für die Typewriter-Anwendung
 */

import React from 'react';

/**
 * Konfiguration für den Zeilenumbruch
 */
export interface LineBreakConfig {
  /** Maximale Anzahl von Zeichen pro Zeile (Standard: 56) */
  maxCharsPerLine: number;
  /** Automatische Berechnung der Zeilenlänge basierend auf dem Viewport */
  autoMaxChars: boolean;
}

/**
 * Standardkonfiguration für den Zeilenumbruch
 */
export const DEFAULT_LINE_BREAK_CONFIG: LineBreakConfig = {
  maxCharsPerLine: 56,
  autoMaxChars: false,
};

/**
 * Props für die WritingArea-Komponente
 */
export interface WritingAreaProps {
  /** Array von bereits geschriebenen Zeilen */
  lines: string[];
  /** Aktuell aktive Zeile, die bearbeitet wird */
  activeLine: string;
  /** Funktion zum Setzen der aktiven Zeile */
  setActiveLine: (line: string) => void;
  /** Funktion zum Hinzufügen der aktiven Zeile zum Stack */
  addLineToStack: () => void;
  /** Maximale Anzahl von Zeichen pro Zeile */
  maxCharsPerLine: number;
  /** Schriftgröße in Pixeln */
  fontSize: number;
  /** Referenz zum versteckten Eingabefeld */
  hiddenInputRef: React.RefObject<HTMLInputElement | null>;
  /** Gibt an, ob der Cursor angezeigt werden soll */
  showCursor: boolean;
  /** Konfiguration für den Zeilenumbruch */
  lineBreakConfig?: LineBreakConfig;
  /** Gibt an, ob der Nachtmodus aktiviert ist */
  darkMode: boolean;
}

/**
 * Props für die ControlBar-Komponente
 */
export interface ControlBarProps {
  /** Anzahl der Wörter im Text */
  wordCount: number;
  /** Anzahl der Seiten im Text */
  pageCount: number;
  /** Funktion zum Umschalten des Vollbildmodus */
  toggleFullscreen: () => void;
  /** Referenz zum versteckten Eingabefeld */
  hiddenInputRef: React.RefObject<HTMLInputElement | null>;
}

/**
 * Props für die FullscreenExitButton-Komponente
 */
export interface FullscreenExitButtonProps {
  /** Funktion zum Umschalten des Vollbildmodus */
  toggleFullscreen: () => void;
  /** Referenz zum versteckten Eingabefeld */
  hiddenInputRef: React.RefObject<HTMLInputElement | null>;
}

/**
 * Props für die LineBreakSettingsPanel-Komponente
 */
export interface LineBreakSettingsPanelProps {
  /** Schriftgröße in Pixeln */
  fontSize: number;
  /** Funktion zum Setzen der Schriftgröße */
  setFontSize: (size: number) => void;
  /** Konfiguration für den Zeilenumbruch */
  lineBreakConfig: LineBreakConfig;
  /** Funktion zum Aktualisieren der Konfiguration */
  updateLineBreakConfig: (config: Partial<LineBreakConfig>) => void;
  /** Gibt an, ob der Nachtmodus aktiviert ist */
  darkMode: boolean;
  /** Funktion zum Umschalten des Nachtmodus */
  toggleDarkMode: () => void;
  /** Funktion zum Löschen der aktuellen Eingabe */
  clearCurrentInput: () => void;
}

/**
 * Props für die HelpButton-Komponente
 */
export interface HelpButtonProps {
  /** Gibt an, ob der Nachtmodus aktiviert ist */
  darkMode: boolean;
}

/**
 * Zustand der Typewriter-Anwendung
 */
export interface TypewriterState {
  /** Array von bereits geschriebenen Zeilen */
  lines: string[];
  /** Aktuell aktive Zeile, die bearbeitet wird */
  activeLine: string;
  /** Maximale Anzahl von Zeichen pro Zeile */
  maxCharsPerLine: number;
  /** Anzahl der Wörter im Text */
  wordCount: number;
  /** Anzahl der Seiten im Text */
  pageCount: number;
  /** Anzahl der Buchstaben im Text */
  letterCount: number;
  /** Konfiguration für den Zeilenumbruch */
  lineBreakConfig: LineBreakConfig;
  /** Schriftgröße in Pixeln */
  fontSize: number;
  /** Gibt an, ob der Nachtmodus aktiviert ist */
  darkMode: boolean;
  /** Funktion zum Setzen der aktiven Zeile */
  setActiveLine: (text: string) => void;
  /** Funktion zum Hinzufügen der aktiven Zeile zum Stack */
  addLineToStack: () => void;
  /** Funktion zum Aktualisieren der Konfiguration */
  updateLineBreakConfig: (config: Partial<LineBreakConfig>) => void;
  /** Funktion zum Setzen der Schriftgröße */
  setFontSize: (size: number) => void;
  /** Funktion zum Umschalten des Nachtmodus */
  toggleDarkMode: () => void;
  /** Funktion zum Löschen der aktuellen Eingabe */
  clearCurrentInput: () => void;
  /** Funktion zum Zurücksetzen der Sitzung */
  resetSession: () => void;
}

/**
 * Ergebnis der Zeilenumbruchoperation
 */
export interface LineBreakResult {
  /** Text, der in die aktuelle Zeile passt */
  line: string;
  /** Restlicher Text, der in die nächste Zeile verschoben wird */
  remainder: string;
}
