"use client"

/**
 * @file copy-button.tsx
 * @description Komponente für den Kopieren-Button
 */

import type React from "react"
import { useState } from "react"
import { Copy, Check } from "lucide-react"
import Button from "./button"
import { useTypewriterStore } from "../store/typewriter-store"

interface CopyButtonProps {
  darkMode: boolean
}

/**
 * Die Komponente CopyButton rendert einen Button zum Kopieren des gesamten Textes
 * in die Zwischenablage.
 *
 * @component
 * @param props - Die Eigenschaften der Komponente
 */
const CopyButton: React.FC<CopyButtonProps> = ({ darkMode }) => {
  const { lines, activeLine } = useTypewriterStore()
  const [copied, setCopied] = useState(false)

  /**
   * Kopiert den gesamten Text in die Zwischenablage
   */
  const copyToClipboard = () => {
    // Kombiniere alle Zeilen zu einem Text ohne Zeilenumbrüche
    const fullText = [...lines, activeLine].join(" ")

    navigator.clipboard
      .writeText(fullText)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch((err) => {
        console.error("Fehler beim Kopieren:", err)
        alert("Fehler beim Kopieren des Textes!")
      })
  }

  return (
    <Button
      onClick={copyToClipboard}
      className={`${
        darkMode ? "bg-blue-700 hover:bg-blue-600 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
      } flex items-center gap-1 transition-colors duration-200`}
      aria-label="Text kopieren"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          Kopiert!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          Kopieren
        </>
      )}
    </Button>
  )
}

export default CopyButton

