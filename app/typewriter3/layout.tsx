import type React from "react"
/**
 * @file layout.tsx
 * @description Layout-Komponente für die Typewriter-Anwendung
 */

import "./styles/android-fixes.css"

export default function TypewriterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Meta-Tags für bessere mobile Darstellung */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <meta name="theme-color" content="#f3efe9" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="mobile-web-app-capable" content="yes" />

      {children}
    </>
  )
}

