// lineBreakLogic.ts
import { type LineBreakConfig, defaultLineBreakConfig } from "./lineBreakConfig"

/**
 * Teilt einen Eingabetext in zwei Teile: den Text, der in die aktuelle Zeile passt,
 * und den Rest, der in der nächsten Zeile fortgeführt werden soll.
 */
export function performLineBreak(
  text: string,
  config: LineBreakConfig = defaultLineBreakConfig,
): { line: string; remainder: string } {
  const { maxCharsPerLine } = config

  // Falls der Text bereits innerhalb der Grenze liegt, so erfolgt kein Umbruch.
  if (text.length <= maxCharsPerLine) {
    return { line: text, remainder: "" }
  }

  // Finde das letzte Leerzeichen vor dem Umbruchpunkt
  const lastSpace = text.lastIndexOf(" ", maxCharsPerLine)

  // Wenn ein Leerzeichen gefunden wurde und es nicht zu weit vom Ende entfernt ist
  if (lastSpace > Math.floor(maxCharsPerLine * 0.5)) {
    // Teile den Text am Leerzeichen
    const line = text.substring(0, lastSpace).trimEnd()
    const remainder = text.substring(lastSpace + 1)
    return { line, remainder }
  } else {
    // Wenn kein passendes Leerzeichen gefunden wurde, trenne bei maxCharsPerLine
    // Dies sollte selten vorkommen, da wir nur Wortverschiebung verwenden
    const line = text.substring(0, maxCharsPerLine)
    const remainder = text.substring(maxCharsPerLine).trimStart()
    return { line, remainder }
  }
}

/**
 * Führt den Umbruchvorgang mehrfach aus, sodass der gesamte Text in Zeilen
 * unterteilt wird, die der Konfiguration entsprechen.
 */
export function breakTextIntoLines(text: string, config: LineBreakConfig = defaultLineBreakConfig): string[] {
  let remainingText = text
  const lines: string[] = []

  while (remainingText.length > 0) {
    const { line, remainder } = performLineBreak(remainingText, config)
    lines.push(line)

    // Wenn kein Rest mehr oder keine Änderung erfolgt, breche die Schleife ab
    if (remainder === "" || remainder === remainingText) {
      if (remainder !== "") {
        lines.push(remainder)
      }
      break
    }

    remainingText = remainder
  }

  return lines
}

/**
 * Formatiert den gesamten Text neu basierend auf der aktuellen Konfiguration.
 */
export function reformatText(lines: string[], config: LineBreakConfig = defaultLineBreakConfig): string[] {
  // Kombiniere alle Zeilen zu einem Text
  const fullText = lines.join(" ").replace(/\s+/g, " ").trim()

  // Formatiere den Text neu mit der aktuellen Konfiguration
  return breakTextIntoLines(fullText, config)
}

