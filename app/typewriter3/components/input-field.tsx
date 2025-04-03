/**
 * @file input-field.tsx
 * @description Wiederverwendbare Eingabefeld-Komponente für die Typewriter-Anwendung
 */

import type React from "react"

/**
 * Ein einfaches Eingabefeld, welches die übergebenen Eigenschaften berücksichtigt.
 *
 * @component
 * @param props - Die Eigenschaften des Eingabefelds
 */
const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
  const { className, ...rest } = props

  return (
    <input
      {...rest}
      className={`p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 touch-manipulation ${className || ""}`}
      style={{
        minHeight: "44px", // Mindesthöhe für bessere Touch-Bedienung
        fontSize: "16px", // Verhindert Zoom auf iOS bei Fokus
      }}
    />
  )
}

export default InputField

