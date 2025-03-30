"use client"

// typewriter/ControlBar.tsx
import type React from "react"
import { AlignLeft, FileText, Fullscreen } from "lucide-react"
import SaveButton from "./SaveButton"
import InputField from "./components/InputField"
import Button from "./components/Button"
import LineBreakSettingsPanel from "./LineBreakSettingsPanel"

interface ControlBarProps {
  wordCount: number
  pageCount: number
  fontSize: number
  setFontSize: (size: number) => void
  toggleFullscreen: () => void
  hiddenInputRef: React.RefObject<HTMLInputElement | null>
}

/**
 * Die Komponente ControlBar rendert die obere Bedienleiste, welche Statistiken,
 * die Einstellung der Schriftgröße, einen Speichern-Button und den Button zum
 * Aktivieren des Vollbildmodus umfasst.
 *
 * @component
 * @param {ControlBarProps} props - Die Eigenschaften der Komponente.
 * @example
 * return (<ControlBar wordCount={100} pageCount={2} fontSize={24} setFontSize={setFontSize} toggleFullscreen={toggleFullscreen} hiddenInputRef={ref} />);
 */
const ControlBar: React.FC<ControlBarProps> = ({
  wordCount,
  pageCount,
  fontSize,
  setFontSize,
  toggleFullscreen,
  hiddenInputRef,
}) => {
  return (
    <div className="flex flex-wrap gap-4 items-center justify-between p-3 text-[#222] text-sm">
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
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="bg-[#ebe8e3] w-16 text-[#222] text-xs h-8 rounded-md"
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
        >
          <Fullscreen className="h-4 w-4" />
          Vollbild
        </Button>
        <LineBreakSettingsPanel onConfigChange={() => {}} />
      </div>
    </div>
  )
}

export default ControlBar

