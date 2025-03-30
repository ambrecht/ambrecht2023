"use client"

/**
 * @file fullscreen-exit-button.tsx
 * @description Komponente für den Button zum Verlassen des Vollbildmodus
 */

import type React from "react"
import { Minimize2 } from "lucide-react"
import Button from "./button"
import type { FullscreenExitButtonProps } from "../types"

/**
 * Die Komponente FullscreenExitButton rendert einen Button zum Verlassen
 * des Vollbildmodus.
 *
 * @component
 * @param props - Die Eigenschaften der Komponente
 */
const FullscreenExitButton: React.FC<FullscreenExitButtonProps> = ({ toggleFullscreen, hiddenInputRef }) => {
  /**
   * Behandelt den Klick auf den Button
   *
   * @param e - Das Mausereignis
   */
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    toggleFullscreen()
    // Fokussiere das Eingabefeld nach einer kurzen Verzögerung
    setTimeout(() => hiddenInputRef.current?.focus(), 100)
  }

  return (
    <Button
      onClick={handleClick}
      className="bg-[#d3d0cb] hover:bg-[#c4c1bc] text-[#222] flex items-center gap-1 transition-colors duration-200"
      aria-label="Vollbildmodus verlassen"
    >
      <Minimize2 className="h-4 w-4" />
      Vollbild verlassen
    </Button>
  )
}

export default FullscreenExitButton

