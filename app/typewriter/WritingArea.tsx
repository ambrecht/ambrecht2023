"use client"

// WritingArea.tsx
import type React from "react"
import type { ChangeEvent, KeyboardEvent } from "react"
import { breakTextIntoLines } from "./lineBreakLogic"
import { defaultLineBreakConfig, type LineBreakConfig } from "./lineBreakConfig"

interface WritingAreaProps {
  lines: string[]
  activeLine: string
  setActiveLine: (line: string) => void
  addLineToStack: () => void
  maxCharsPerLine: number
  fontSize: number
  hiddenInputRef: React.RefObject<HTMLInputElement | null>
  showCursor: boolean
  // Optionale Konfiguration für den Zeilenumbruch
  lineBreakConfig?: LineBreakConfig
}

/**
 * Die Komponente WritingArea rendert den Bereich zum Schreiben.
 * Sie zeigt bereits verfasste Zeilen sowie die aktive Zeile mit einem blinkenden Cursor an.
 * Die Zeilenaufteilung erfolgt anhand der extern ausgelagerten Logik in lineBreakLogic.ts.
 *
 * @component
 * @param {WritingAreaProps} props - Die Eigenschaften der Komponente.
 */
const WritingArea: React.FC<WritingAreaProps> = ({
  lines,
  activeLine,
  setActiveLine,
  addLineToStack,
  maxCharsPerLine,
  fontSize,
  hiddenInputRef,
  showCursor,
  lineBreakConfig = defaultLineBreakConfig,
}) => {
  /**
   * Verarbeitet Änderungen im versteckten Eingabefeld.
   * Der eingegebene Text wird an die Funktion breakTextIntoLines übergeben,
   * welche den Text anhand der konfigurierten Parameter in Zeilen aufteilt.
   * Ergibt sich ein Umbruch, so werden die fertigen Zeilen dem Stapel hinzugefügt.
   *
   * @param {ChangeEvent<HTMLInputElement>} e - Das Änderungsevent des Eingabefeldes.
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    const brokenLines = breakTextIntoLines(newValue, lineBreakConfig)

    if (brokenLines.length > 1) {
      // Alle Segmente bis auf das letzte werden sofort als abgeschlossene Zeile abgelegt
      brokenLines.slice(0, -1).forEach((segment) => {
        setActiveLine(segment)
        addLineToStack()
      })
      // Das letzte Segment verbleibt als aktive Zeile
      setActiveLine(brokenLines[brokenLines.length - 1])
    } else {
      setActiveLine(newValue)
    }
  }

  /**
   * Bei Betätigung der Eingabetaste wird die aktuelle Zeile in den Zeilenstapel übernommen.
   *
   * @param {KeyboardEvent<HTMLInputElement>} e - Das Tastaturereignis.
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addLineToStack()
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <div
        className="flex-1 overflow-y-auto px-6 pt-6 pb-2 select-none"
        style={{ fontSize: "16px", lineHeight: "1.6" }}
        id="typewriter-content"
      >
        <div className="min-h-full flex flex-col justify-end">
          {lines.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap break-words mb-2 font-serif text-gray-800">
              {line}
            </div>
          ))}
        </div>
      </div>
      <div
        className="sticky bottom-0 bg-[#f3efe9] p-4 font-serif border-t border-[#e0dcd3]"
        style={{ height: `${fontSize * 2.2}px` }}
      >
        <div className="relative">
          <div
            className="whitespace-pre-wrap break-words absolute top-0 left-0 pointer-events-none text-gray-800 overflow-hidden"
            style={{ fontSize: `${fontSize}px`, lineHeight: "1.4" }}
          >
            {activeLine}
            <span
              className={`inline-block w-[0.5em] h-[1.2em] ml-[1px] align-middle ${
                showCursor ? "bg-[#222]" : "bg-transparent"
              }`}
              style={{ transform: "translateY(-0.1em)" }}
            />
          </div>
          <input
            ref={hiddenInputRef}
            type="text"
            value={activeLine}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-transparent caret-transparent outline-none whitespace-nowrap overflow-hidden"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: "1.4",
              fontFamily: "serif",
              height: `${fontSize * 1.4}px`, // Feste Höhe basierend auf der Schriftgröße
            }}
            autoFocus
          />
        </div>
        <div className="absolute bottom-0 left-0 h-1 bg-[#e2dfda] w-full">
          <div
            className="h-full bg-[#bbb] transition-all duration-75"
            style={{
              width: `${(activeLine.length / maxCharsPerLine) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default WritingArea

