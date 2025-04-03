/**
 * @file control-bar.tsx
 * @description Komponente für die Kontrollleiste der Typewriter-Anwendung
 */

"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AlignLeft, FileText, Fullscreen, Settings } from "lucide-react"
import SaveButton from "./save-button"
import Button from "./button"
import LineBreakSettingsPanel from "./line-break-settings-panel"
import HelpButton from "./help-button"
import type { ControlBarProps } from "../types"
import { useTypewriterStore } from "../store/typewriter-store"
// Importiere die CopyButton-Komponente
import CopyButton from "./copy-button"

/**
 * Die Komponente ControlBar rendert die obere Bedienleiste, welche Statistiken,
 * einen Speichern-Button, den Button zum Aktivieren des Vollbildmodus und
 * das Einstellungspanel umfasst.
 *
 * @component
 * @param props - Die Eigenschaften der Komponente
 */
const ControlBar: React.FC<ControlBarProps> = ({ wordCount, pageCount, toggleFullscreen, hiddenInputRef }) => {
  const {
    fontSize,
    setFontSize,
    lineBreakConfig,
    updateLineBreakConfig,
    darkMode,
    toggleDarkMode,
    clearCurrentInput,
    clearAllLines,
  } = useTypewriterStore()

  const [isAndroid, setIsAndroid] = useState(false)
  const [isCompactView, setIsCompactView] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Erkennen, ob es sich um ein Android-Gerät handelt und ob der Bildschirm klein ist
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = window.navigator.userAgent.toLowerCase()
      setIsAndroid(/android/.test(userAgent))

      const checkScreenSize = () => {
        setIsCompactView(window.innerWidth < 640)
      }

      checkScreenSize()
      window.addEventListener("resize", checkScreenSize)

      return () => {
        window.removeEventListener("resize", checkScreenSize)
      }
    }
  }, [])

  // Öffnet die Einstellungen in einem Modal auf kleinen Bildschirmen
  const handleSettingsClick = () => {
    setShowSettings(true)
  }

  // Schließt die Einstellungen
  const handleCloseSettings = () => {
    setShowSettings(false)
  }

  return (
    <>
      <div
        className={`flex flex-wrap gap-2 sm:gap-4 items-center justify-between p-2 sm:p-3 ${
          darkMode ? "text-gray-200 bg-gray-900" : "text-[#222] bg-[#f3efe9]"
        } text-sm`}
      >
        {/* Statistiken - auf kleinen Bildschirmen kompakter */}
        <div className="flex items-center gap-2 sm:gap-6">
          <div className="flex items-center gap-1 sm:gap-2">
            <AlignLeft className={`h-4 w-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
            <span className="whitespace-nowrap">{isCompactView ? wordCount : `Wörter: ${wordCount}`}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <FileText className={`h-4 w-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
            <span className="whitespace-nowrap">{isCompactView ? pageCount : `Seiten: ${pageCount}`}</span>
          </div>
        </div>

        {/* Steuerelemente - auf kleinen Bildschirmen kompakter */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Auf kleinen Bildschirmen nur die wichtigsten Buttons anzeigen */}
          {!isCompactView && <SaveButton />}

          {!isCompactView && <CopyButton darkMode={darkMode} />}

          <Button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault()
              toggleFullscreen()
              setTimeout(() => hiddenInputRef.current?.focus(), 100)
            }}
            className={`${
              darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-[#d3d0cb] hover:bg-[#c4c1bc] text-[#222]"
            } flex items-center gap-1 transition-colors duration-200`}
            aria-label="Vollbildmodus aktivieren"
          >
            <Fullscreen className="h-4 w-4" />
            {!isCompactView && "Vollbild"}
          </Button>

          <HelpButton darkMode={darkMode} />

          {/* Auf kleinen Bildschirmen einen separaten Einstellungs-Button anzeigen */}
          {isCompactView ? (
            <Button
              onClick={handleSettingsClick}
              className={`${
                darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-[#d3d0cb] hover:bg-[#c4c1bc] text-[#222]"
              } flex items-center gap-1 transition-colors duration-200`}
              aria-label="Einstellungen öffnen"
            >
              <Settings className="h-4 w-4" />
            </Button>
          ) : (
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
          )}
        </div>
      </div>

      {/* Modal für Einstellungen auf kleinen Bildschirmen */}
      {isCompactView && showSettings && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={handleCloseSettings}
        >
          <div
            className={`w-full max-w-sm rounded-lg ${darkMode ? "bg-gray-800" : "bg-white"} p-4`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className={`font-bold ${darkMode ? "text-gray-200" : "text-gray-800"}`}>Einstellungen</h3>
              <button
                onClick={handleCloseSettings}
                className={`${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-800"}`}
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <LineBreakSettingsPanel
                fontSize={fontSize}
                setFontSize={setFontSize}
                lineBreakConfig={lineBreakConfig}
                updateLineBreakConfig={updateLineBreakConfig}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                clearCurrentInput={clearCurrentInput}
                clearAllLines={clearAllLines}
                isModal={true}
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleCloseSettings}
                className={`${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                    : "bg-[#d3d0cb] hover:bg-[#c4c1bc] text-[#222]"
                }`}
              >
                Schließen
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ControlBar

