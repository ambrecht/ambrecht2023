/**
 * @file page.tsx
 * @description Hauptseite der Typewriter-Anwendung
 */

"use client"

import { useEffect, useRef, useState } from "react"
import { useTypewriterStore } from "./store/typewriter-store"
import WritingArea from "./components/writing-area"
import ControlBar from "./components/control-bar"
import FullscreenExitButton from "./components/fullscreen-exit-button"
import LineBreakSettingsPanel from "./components/line-break-settings-panel"
import HelpButton from "./components/help-button"
import { calculateOptimalLineLength } from "./utils/line-break-utils"

/**
 * Erstellt eine debounced-Version einer Funktion, die erst nach einer bestimmten
 * Wartezeit ausgeführt wird, nachdem sie zuletzt aufgerufen wurde.
 *
 * @param func - Die zu debounce-nde Funktion
 * @param wait - Die Wartezeit in Millisekunden
 * @returns Eine debounced-Version der Funktion
 */
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * Die Hauptkomponente der Typewriter-Anwendung.
 * Sie orchestriert alle Unterkomponenten und verwaltet den globalen Zustand.
 *
 * @returns Die gerenderte Typewriter-Anwendung
 */
export default function TypewriterPage() {
  // Hole den Zustand aus dem Store
  const {
    lines,
    activeLine,
    setActiveLine,
    addLineToStack,
    maxCharsPerLine,
    resetSession,
    wordCount,
    pageCount,
    lineBreakConfig,
    fontSize,
    setFontSize,
    updateLineBreakConfig,
    darkMode,
    toggleDarkMode,
    clearCurrentInput,
    clearAllLines,
  } = useTypewriterStore()

  // Referenzen für DOM-Elemente
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const hiddenInputRef = useRef<HTMLInputElement>(null)

  // Lokaler Zustand
  const [showCursor, setShowCursor] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)

  // Erkennen, ob es sich um ein Android-Gerät handelt
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = window.navigator.userAgent.toLowerCase()
      setIsAndroid(/android/.test(userAgent))
    }
  }, [])

  // Setze die Sitzung zurück, wenn die Komponente geladen wird
  useEffect(() => {
    resetSession()
  }, [resetSession])

  // Blinken des Cursors
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 530)
    return () => clearInterval(cursorInterval)
  }, [])

  // Fokussiere das Eingabefeld beim Laden und bei Klicks
  useEffect(() => {
    const focusInput = () => {
      if (hiddenInputRef.current) {
        hiddenInputRef.current.focus()
      }
    }

    // Sofort fokussieren
    focusInput()

    // Bei Klicks fokussieren
    const handleClick = () => focusInput()
    document.addEventListener("click", handleClick)

    // Bei Vollbildänderungen fokussieren
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
      focusInput()
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)

    // Bereinige die Event-Handler beim Unmount
    return () => {
      document.removeEventListener("click", handleClick)
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Automatische Berechnung der Zeilenlänge
  useEffect(() => {
    if (!lineBreakConfig.autoMaxChars || !contentRef.current) return

    // Erstelle eine debounced-Version der Funktion zur Aktualisierung der maximalen Zeichenanzahl
    const updateMaxChars = debounce(() => {
      if (!contentRef.current) return

      const containerWidth = contentRef.current.clientWidth || 800
      const optimalLineLength = calculateOptimalLineLength(containerWidth, fontSize)

      if (optimalLineLength !== lineBreakConfig.maxCharsPerLine) {
        updateLineBreakConfig({ maxCharsPerLine: optimalLineLength })
      }
    }, 100) // 100ms Verzögerung, um zu häufige Aktualisierungen zu vermeiden

    // Initial berechnen mit einer Verzögerung, um sicherzustellen, dass das Layout stabil ist
    const initialTimer = setTimeout(() => {
      updateMaxChars()
    }, 200)

    // Bei Größenänderungen neu berechnen
    let resizeObserver: ResizeObserver | null = null

    try {
      resizeObserver = new ResizeObserver(() => {
        updateMaxChars()
      })

      resizeObserver.observe(contentRef.current)
    } catch (error) {
      console.error("ResizeObserver error:", error)
    }

    // Bereinige den Observer und Timer beim Unmount
    return () => {
      if (initialTimer) clearTimeout(initialTimer)

      if (resizeObserver) {
        try {
          if (contentRef.current) {
            resizeObserver.unobserve(contentRef.current)
          }
          resizeObserver.disconnect()
        } catch (error) {
          console.error("Error cleaning up ResizeObserver:", error)
        }
      }
    }
  }, [lineBreakConfig.autoMaxChars, fontSize, updateLineBreakConfig])

  /**
   * Wechselt zwischen Vollbild- und normalem Modus
   */
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch((err) => console.error("Fullscreen error:", err))
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => console.error("Exit fullscreen error:", err))
    }
  }

  // Füge spezielle Klassen für Android hinzu
  const androidClasses = isAndroid ? "android-typewriter" : ""

  return (
    <div
      ref={containerRef}
      className={`min-h-screen flex flex-col ${
        darkMode ? "bg-gray-900 text-gray-200" : (isFullscreen ? "bg-[#f8f5f0]" : "bg-[#f3efe9]") + " text-gray-900"
      } transition-colors duration-300 ${androidClasses}`}
    >
      <header
        className={`border-b ${
          darkMode ? "border-gray-700" : isFullscreen ? "border-[#e0dcd3]" : "border-[#d3d0cb]"
        } transition-colors duration-300`}
      >
        {!isFullscreen ? (
          <ControlBar
            wordCount={wordCount}
            pageCount={pageCount}
            toggleFullscreen={toggleFullscreen}
            hiddenInputRef={hiddenInputRef}
          />
        ) : (
          <div
            className={`flex items-center justify-between p-3 ${
              darkMode ? "bg-gray-900 text-gray-200" : "bg-[#f3efe9] text-gray-900"
            }`}
          >
            <div className="flex items-center gap-4">
              <FullscreenExitButton toggleFullscreen={toggleFullscreen} hiddenInputRef={hiddenInputRef} />
              <div className="text-sm font-medium">
                Wörter: {wordCount} | Seiten: {pageCount}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <HelpButton darkMode={darkMode} />
              <LineBreakSettingsPanel
                fontSize={fontSize}
                setFontSize={setFontSize}
                lineBreakConfig={lineBreakConfig}
                updateLineBreakConfig={updateLineBreakConfig}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                clearCurrentInput={clearCurrentInput}
                clearAllLines={clearAllLines}
              />
            </div>
          </div>
        )}
      </header>
      <main className={`flex-1 flex flex-col p-4 md:p-6 lg:p-8 ${darkMode ? "bg-gray-900" : ""}`}>
        <section
          ref={contentRef}
          className={`flex-1 flex flex-col ${
            darkMode ? "bg-gray-800 shadow-xl" : (isFullscreen ? "bg-white" : "bg-[#fcfcfa]") + " shadow-md"
          } rounded-lg overflow-hidden transition-colors duration-300`}
        >
          <WritingArea
            lines={lines}
            activeLine={activeLine}
            setActiveLine={setActiveLine}
            addLineToStack={addLineToStack}
            maxCharsPerLine={maxCharsPerLine}
            fontSize={fontSize}
            hiddenInputRef={hiddenInputRef}
            showCursor={showCursor}
            lineBreakConfig={lineBreakConfig}
            darkMode={darkMode}
          />
        </section>
      </main>
      <footer
        className={`p-3 border-t ${
          darkMode ? "border-gray-700 text-gray-400 bg-gray-900" : "border-[#d3d0cb] text-gray-600"
        } text-center text-sm`}
      >
        Typing Machine Application — Moderne Umsetzung des klassischen Schreibmaschinengefühls
      </footer>
    </div>
  )
}

