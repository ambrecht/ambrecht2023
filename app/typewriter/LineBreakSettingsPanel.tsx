"use client"

// LineBreakSettingsPanel.tsx
import type React from "react"
import { useState } from "react"
import { Settings } from "lucide-react"

interface LineBreakSettingsPanelProps {
  onConfigChange?: () => void
}

const LineBreakSettingsPanel: React.FC<LineBreakSettingsPanelProps> = ({ onConfigChange }) => {
  const [isOpen, setIsOpen] = useState(false)

  const togglePanel = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="relative">
      {/* Zahnrad-Button */}
      <button
        onClick={togglePanel}
        className="p-2 rounded-full bg-[#e2dfda] hover:bg-[#d3d0cb] focus:outline-none transition-colors duration-200"
        title="Zeilenlogik Einstellungen"
      >
        <Settings className="h-5 w-5 text-gray-700" />
      </button>
      {/* Einstellungs-Popup */}
      {isOpen && (
        <div className="absolute right-0 mt-2 p-4 bg-white border border-gray-200 shadow-lg rounded-lg z-20 w-80">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-gray-800">Zeilenumbruch Einstellungen</h4>
            <button onClick={togglePanel} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Die Schreibmaschine ist auf 56 Zeichen pro Zeile eingestellt. Wörter, die nicht vollständig in eine Zeile
            passen, werden automatisch in die nächste Zeile verschoben.
          </p>
          <button
            onClick={togglePanel}
            className="mt-4 w-full px-3 py-2 bg-[#d3d0cb] text-gray-800 rounded-md hover:bg-[#c4c1bc] transition-colors duration-200"
          >
            Schließen
          </button>
        </div>
      )}
    </div>
  )
}

export default LineBreakSettingsPanel

