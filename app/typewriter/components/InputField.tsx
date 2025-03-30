"use client"

// typewriter/components/InputField.tsx
import type React from "react"

/**
 * Ein einfaches Eingabefeld, welches die übergebenen Eigenschaften berücksichtigt.
 *
 * @component
 * @param {React.InputHTMLAttributes<HTMLInputElement>} props - Die Eigenschaften des Eingabefelds.
 * @example
 * return (<InputField type="text" value={value} onChange={handleChange} />);
 */
const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
  return (
    <input
      {...props}
      className={`p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${props.className || ""}`}
    />
  )
}

export default InputField

