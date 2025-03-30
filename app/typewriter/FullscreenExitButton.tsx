"use client"

// typewriter/FullscreenExitButton.tsx
import type React from "react"
import { Minimize2 } from "lucide-react"
import Button from "./components/Button"

interface FullscreenExitButtonProps {
  toggleFullscreen: () => void
  hiddenInputRef: React.RefObject<HTMLInputElement | null>
}

/**
 * Die Komponente FullscreenExitButton rendert einen Button zum Verlassen
 * des Vollbildmodus.
 *
 * @component
 * @param {FullscreenExitButtonProps} props - Die Eigenschaften der Komponente.
 * @example
 * return (<FullscreenExitButton toggleFullscreen={toggleFullscreen} hiddenInputRef={ref} />);
 */
const FullscreenExitButton: React.FC<FullscreenExitButtonProps> = ({ toggleFullscreen, hiddenInputRef }) => {
  return (
    <Button
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        toggleFullscreen()
        setTimeout(() => hiddenInputRef.current?.focus(), 100)
      }}
      className="bg-[#d3d0cb] hover:bg-[#c4c1bc] text-[#222] flex items-center gap-1 transition-colors duration-200"
    >
      <Minimize2 className="h-4 w-4" />
      Vollbild verlassen
    </Button>
  )
}

export default FullscreenExitButton

