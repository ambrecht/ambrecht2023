"use client"

/**
 * @file control-bar.tsx
 * @description Komponente für die Kontrollleiste der Typewriter-Anwendung
 */

import type React from "react"
import { AlignLeft, FileText, Fullscreen } from "lucide-react"
import SaveButton from "./save-button"
import InputField from "./input-field"
import Button from "./button"
import LineBreakSettingsPanel from "./line-break-settings-panel"
import type { ControlBarProps } from "../types"

/**
 * Die Komponente ControlBar rendert die obere Bedienleiste, welche Statistiken,
 * die Einstellung der Schriftgröße, einen Speichern-Button und den Button zum
 * Aktivieren des Vollbildmodus umfasst.
 *
 * @component
 * @param props - Die Eigenschaften der Komponente
 */
const ControlBar: React.FC<ControlBarProps> = ({
  wordCount,
  pageCount,
  fontSize,
  setFontSize,
  toggleFullscreen,
  hiddenInputRef,
}) => {
  /**
   * Behandelt Änderungen der Schriftgröße
   *
   * @param e - Das Änderungsevent des Eingabefeldes
   */
  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = Number(e.target.value)
    // Stelle sicher, dass die Schriftgröße im gültigen Bereich liegt
    if (newSize >= 24 && newSize <= 50) {
      setFontSize(newSize)
    }
  }

  return (
    <div className="flex flex-wrap gap-4 items-center justify-between p-3 text-[#222] text-sm">
      {/* Statistiken */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <AlignLeft className="h-4 w-4 text-gray-600" />
          <span>Wörter: {wordCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-600" />
          <span>Seiten (A4): {pageCount}</span>
        </div>
      </div>

      {/* Steuerelemente */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="fontSize" className="text-xs">
            Schriftgröße:
          </label>
          <InputField
            id="fontSize"
            type="number"
            min={24}
            max={50}
            value={fontSize}
            onChange={handleFontSizeChange}
            className="bg-[#ebe8e3] w-16 text-[#222] text-xs h-8 rounded-md"
            aria-label="Schriftgröße einstellen"
          />
        </div>
        <SaveButton />
        <Button
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault()
            toggleFullscreen()
            setTimeout(() => hiddenInputRef.current?.focus(), 100)
          }}
          className="bg-[#d3d0cb] hover:bg-[#c4c1bc] text-[#222] flex items-center gap-1 transition-colors duration-200"
          aria-label="Vollbildmodus aktivieren"
        >
          <Fullscreen className="h-4 w-4" />
          Vollbild
        </Button>
        <LineBreakSettingsPanel />
      </div>
    </div>
  )
}

export default ControlBar

