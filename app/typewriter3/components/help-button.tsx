"use client"

/**
 * @file help-button.tsx
 * @description Komponente für den Hilfe-Button
 */

import type React from "react"
import { useState } from "react"
import { HelpCircle } from "lucide-react"
import type { HelpButtonProps } from "../types"

/**
 * Die Komponente HelpButton rendert einen Button mit einem Fragezeichen,
 * der bei Klick oder Hover eine Erklärung der App-Funktionen anzeigt.
 *
 * @component
 * @param props - Die Eigenschaften der Komponente
 */
const HelpButton: React.FC<HelpButtonProps> = ({ darkMode }) => {
  const [isOpen, setIsOpen] = useState(false)

  /**
   * Öffnet oder schließt das Hilfe-Panel
   */
  const toggleHelp = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="relative">
      {/* Hilfe-Button */}
      <button
        onClick={toggleHelp}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className={`p-2 rounded-full ${
          darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-[#e2dfda] hover:bg-[#d3d0cb]"
        } focus:outline-none transition-colors duration-200`}
        title="Hilfe"
        aria-label="Hilfe anzeigen"
        aria-expanded={isOpen}
        aria-controls="help-panel"
      >
        <HelpCircle className={`h-5 w-5 ${darkMode ? "text-gray-200" : "text-gray-700"}`} />
      </button>

      {/* Hilfe-Popup */}
      {isOpen && (
        <div
          id="help-panel"
          className={`absolute right-0 mt-2 p-4 ${
            darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-200 text-gray-800"
          } border shadow-lg rounded-lg z-20 w-80`}
          role="dialog"
          aria-labelledby="help-title"
        >
          <div className="flex justify-between items-center mb-3">
            <h4 id="help-title" className="font-bold">
              Über die Typewriter App
            </h4>
            <button
              onClick={toggleHelp}
              className={`${darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
              aria-label="Hilfe schließen"
            >
              ✕
            </button>
          </div>

          <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"} space-y-3`}>
            <p>
              <strong>Zweck:</strong> Die Typewriter App bietet ein klassisches Schreibmaschinengefühl für fokussiertes
              Schreiben ohne Ablenkungen.
            </p>

            <p>
              <strong>Hauptfunktionen:</strong>
            </p>

            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Fokussiertes Schreiben:</strong> Keine Formatierungsoptionen, nur reiner Text.
              </li>
              <li>
                <strong>Automatischer Zeilenumbruch:</strong> Wörter werden automatisch in die nächste Zeile verschoben.
              </li>
              <li>
                <strong>Kein vorschnelles Löschen:</strong> Einmal geschriebener Text bleibt bestehen, um den
                Schreibfluss zu fördern.
              </li>
              <li>
                <strong>Vollbildmodus:</strong> Für ablenkungsfreies Schreiben.
              </li>
              <li>
                <strong>Nachtmodus:</strong> Schont die Augen bei schlechten Lichtverhältnissen.
              </li>
              <li>
                <strong>Automatische Speicherung:</strong> Ihr Text wird automatisch lokal gespeichert.
              </li>
            </ul>

            <p>
              <strong>Optimiert für:</strong> Desktop, Tablet und Mobilgeräte (Android, Windows).
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default HelpButton

