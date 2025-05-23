/**
 * @file writing-area.tsx
 * @description Komponente für den Schreibbereich der Typewriter-Anwendung
 */

"use client"

import type React from "react"
import type { ChangeEvent, KeyboardEvent } from "react"
import { breakTextIntoLines } from "../utils/line-break-utils"
import { DEFAULT_LINE_BREAK_CONFIG, type WritingAreaProps } from "../types"

// Importiere useRef, useEffect und useState
import { useRef, useEffect, useState } from "react"

/**
 * Die Komponente WritingArea rendert den Bereich zum Schreiben.
 * Sie zeigt bereits verfasste Zeilen sowie die aktive Zeile mit einem blinkenden Cursor an.
 * Die Zeilenaufteilung erfolgt anhand der extern ausgelagerten Logik in line-break-utils.ts.
 *
 * @component
 * @param props - Die Eigenschaften der Komponente
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
  lineBreakConfig = DEFAULT_LINE_BREAK_CONFIG,
  darkMode,
}) => {
  // Referenz für den Container der geschriebenen Zeilen
  const linesContainerRef = useRef<HTMLDivElement>(null)
  const activeLineRef = useRef<HTMLDivElement>(null)
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
  const [containerHeight, setContainerHeight] = useState<number | null>(null)

  // Erkennen, ob die Tastatur sichtbar ist (für Android)
  useEffect(() => {
    if (typeof window === "undefined") return

    const checkKeyboard = () => {
      // Auf Android ist die Tastatur sichtbar, wenn die Fensterhöhe deutlich kleiner ist als die Bildschirmhöhe
      const windowHeight = window.innerHeight
      const screenHeight = window.screen.height
      const threshold = screenHeight * 0.15 // 15% Schwellenwert für Tastaturerkennung

      const newIsKeyboardVisible = windowHeight < screenHeight - threshold
      setIsKeyboardVisible(newIsKeyboardVisible)

      // Speichere die Containerhöhe, wenn die Tastatur nicht sichtbar ist
      if (!newIsKeyboardVisible && linesContainerRef.current) {
        setContainerHeight(linesContainerRef.current.clientHeight)
      }
    }

    // Prüfe initial und bei Größenänderungen
    checkKeyboard()
    window.addEventListener("resize", checkKeyboard)

    return () => {
      window.removeEventListener("resize", checkKeyboard)
    }
  }, [])

  // Automatisches Scrollen zum Ende, wenn neue Zeilen hinzugefügt werden
  useEffect(() => {
    if (linesContainerRef.current) {
      // Verwende requestAnimationFrame für flüssigeres Scrollen
      requestAnimationFrame(() => {
        if (linesContainerRef.current) {
          linesContainerRef.current.scrollTop = linesContainerRef.current.scrollHeight
        }
      })
    }
  }, [lines])

  // Automatisches Scrollen, wenn sich die aktive Zeile ändert
  useEffect(() => {
    if (linesContainerRef.current && activeLineRef.current) {
      // Verwende requestAnimationFrame für flüssigeres Scrollen
      requestAnimationFrame(() => {
        if (linesContainerRef.current) {
          linesContainerRef.current.scrollTop = linesContainerRef.current.scrollHeight
        }
      })
    }
  }, [activeLine])

  // Fokussiere das Eingabefeld, wenn die Tastatur erscheint oder verschwindet
  useEffect(() => {
    if (hiddenInputRef.current) {
      // Kurze Verzögerung, um sicherzustellen, dass das Layout stabil ist
      const timer = setTimeout(() => {
        hiddenInputRef.current?.focus()
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [isKeyboardVisible])

  // Passe die Höhe des Containers an, wenn die Tastatur erscheint (für Android)
  useEffect(() => {
    if (isKeyboardVisible && containerHeight && linesContainerRef.current) {
      // Wenn die Tastatur sichtbar ist, stelle sicher, dass der Container seine Höhe behält
      linesContainerRef.current.style.height = `${containerHeight}px`
    } else if (linesContainerRef.current) {
      // Wenn die Tastatur nicht sichtbar ist, setze die Höhe zurück
      linesContainerRef.current.style.height = ""
    }
  }, [isKeyboardVisible, containerHeight])

  /**
   * Verarbeitet Änderungen im versteckten Eingabefeld.
   * Der eingegebene Text wird an die Funktion breakTextIntoLines übergeben,
   * welche den Text anhand der konfigurierten Parameter in Zeilen aufteilt.
   * Ergibt sich ein Umbruch, so werden die fertigen Zeilen dem Stapel hinzugefügt.
   *
   * @param e - Das Änderungsevent des Eingabefeldes
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
   * @param e - Das Tastaturereignis
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addLineToStack()
    }
  }

  // Verhindere, dass der Benutzer manuell vom aktiven Schreibbereich wegscrollt
  const handleScroll = () => {
    if (linesContainerRef.current && activeLineRef.current) {
      const containerRect = linesContainerRef.current.getBoundingClientRect()
      const activeLineRect = activeLineRef.current.getBoundingClientRect()

      // Wenn die aktive Zeile nicht sichtbar ist, scrolle zu ihr
      if (activeLineRect.bottom > containerRect.bottom || activeLineRect.top < containerRect.top) {
        requestAnimationFrame(() => {
          if (linesContainerRef.current) {
            linesContainerRef.current.scrollTop = linesContainerRef.current.scrollHeight
          }
        })
      }
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Bereich für bereits geschriebene Zeilen */}
      <div
        ref={linesContainerRef}
        className={`flex-1 overflow-y-auto px-6 pt-6 pb-2 select-none ${
          darkMode ? "bg-gray-900 text-gray-200" : "bg-[#fcfcfa] text-gray-800"
        }`}
        style={{ fontSize: "16px", lineHeight: "1.6" }}
        id="typewriter-content"
        aria-live="polite"
        onScroll={handleScroll}
      >
        <div className="min-h-full flex flex-col justify-end">
          {lines.map((line, i) => (
            <div
              key={i}
              className={`whitespace-pre-wrap break-words mb-2 font-serif ${
                darkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* Bereich für die aktive Zeile mit Cursor */}
      <div
        ref={activeLineRef}
        className={`sticky bottom-0 p-4 font-serif border-t z-10 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-[#f3efe9] border-[#e0dcd3]"
        }`}
        style={{
          height: `${fontSize * 2.2}px`,
          // Füge einen Schatten hinzu, um die Trennung zu verstärken
          boxShadow: darkMode ? "0 -4px 6px -1px rgba(0, 0, 0, 0.3)" : "0 -4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="relative">
          {/* Sichtbarer Text mit Cursor */}
          <div
            className={`whitespace-pre-wrap break-words absolute top-0 left-0 pointer-events-none overflow-hidden ${
              darkMode ? "text-gray-200" : "text-gray-800"
            }`}
            style={{ fontSize: `${fontSize}px`, lineHeight: "1.4" }}
            aria-hidden="true"
          >
            {activeLine}
            <span
              className={`inline-block w-[0.5em] h-[1.2em] ml-[1px] align-middle ${
                showCursor ? (darkMode ? "bg-gray-200" : "bg-[#222]") : "bg-transparent"
              }`}
              style={{ transform: "translateY(-0.1em)" }}
            />
          </div>

          {/* Verstecktes Eingabefeld für die Tastatureingabe */}
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
            aria-label="Typewriter Eingabefeld"
          />
        </div>

        {/* Fortschrittsbalken für die Zeilenlänge */}
        <div className={`absolute bottom-0 left-0 h-1 ${darkMode ? "bg-gray-700" : "bg-[#e2dfda]"} w-full`}>
          <div
            className={`h-full ${darkMode ? "bg-gray-500" : "bg-[#bbb]"} transition-all duration-75`}
            style={{
              width: `${(activeLine.length / maxCharsPerLine) * 100}%`,
            }}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={maxCharsPerLine}
            aria-valuenow={activeLine.length}
          />
        </div>
      </div>
    </div>
  )
}

export default WritingArea

