/**
 * @file button.tsx
 * @description Wiederverwendbare Button-Komponente für die Typewriter-Anwendung
 */

import type React from "react"

/**
 * Ein einfacher Button, welcher die übergebenen Eigenschaften und Kinder rendert.
 *
 * @component
 * @param props - Die Eigenschaften des Buttons
 */
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  const { className, children, ...rest } = props

  return (
    <button {...rest} className={`px-4 py-2 rounded-md transition-colors duration-200 ${className || ""}`}>
      {children}
    </button>
  )
}

export default Button

