/**
 * @file line-break-config.ts
 * @description Konfigurationsdatei für den Zeilenumbruch
 */

import type { LineBreakConfig } from "../types"

/**
 * Standardkonfiguration für den Zeilenumbruch
 * Setzt die maximale Anzahl von Zeichen pro Zeile auf 56
 */
export const defaultLineBreakConfig: LineBreakConfig = {
  maxCharsPerLine: 56,
  incompleteWordAction: "move", // Nur Wortverschiebung als Option
}

