/**
 * @file save-button.tsx
 * @description Komponente für den Speichern-Button der Typewriter-Anwendung
 */

"use client"

import { useEffect, useState } from "react"
import { useTypewriterStore } from "../store/typewriter-store"
import { Save } from "lucide-react"
import Button from "./button"

/**
 * Die Komponente SaveButton rendert einen Button zum Speichern des Textes.
 * Der Text wird entweder an eine API gesendet oder lokal gespeichert,
 * abhängig vom Online-Status.
 *
 * @component
 */
export default function SaveButton() {
  const { lines, activeLine, wordCount, letterCount, darkMode } = useTypewriterStore()
  const [isOnline, setIsOnline] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle")

  // Kombiniere alle Zeilen zu einem Text
  const fullText = [...lines, activeLine].join("\n")

  // Überwache den Online-Status
  useEffect(() => {
    // Nur im Browser ausführen
    if (typeof window !== "undefined") {
      // Initialisiere den Online-Status
      setIsOnline(navigator.onLine)

      // Event-Handler für Online- und Offline-Events
      const handleOnline = () => setIsOnline(true)
      const handleOffline = () => setIsOnline(false)

      // Registriere die Event-Handler
      window.addEventListener("online", handleOnline)
      window.addEventListener("offline", handleOffline)

      // Bereinige die Event-Handler beim Unmount
      return () => {
        window.removeEventListener("online", handleOnline)
        window.removeEventListener("offline", handleOffline)
      }
    }
  }, [])

  // Setze den Speicherstatus nach 3 Sekunden zurück
  useEffect(() => {
    if (saveStatus === "success" || saveStatus === "error") {
      const timer = setTimeout(() => {
        setSaveStatus("idle")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [saveStatus])

  /**
   * Speichert den Text entweder an eine API oder lokal,
   * abhängig vom Online-Status.
   */
  const handleSave = async () => {
    if (!isOnline || isLoading) return

    setIsLoading(true)
    setSaveStatus("saving")

    try {
      // Sende den Text an die API
      const response = await fetch("https://api.ambrecht.de/api/typewriter/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
        },
        body: JSON.stringify({
          text: fullText,
          wordCount,
          letterCount,
        }),
      })

      // Prüfe, ob die Anfrage erfolgreich war
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Verarbeite die Antwort
      const data = await response.json()
      console.log("Erfolgreich gespeichert:", data)
      setSaveStatus("success")
    } catch (error) {
      // Behandle Fehler
      console.error("Speicherfehler:", error)
      setSaveStatus("error")

      // Speichere den Text lokal
      localStorage.setItem("typewriter_backup", fullText)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Bestimmt den Stil des Buttons basierend auf dem Speicherstatus
   *
   * @returns Die CSS-Klasse für den Button
   */
  const getButtonStyle = () => {
    if (!isOnline) return darkMode ? "bg-gray-600 cursor-not-allowed" : "bg-gray-400 cursor-not-allowed"
    if (isLoading) return darkMode ? "bg-blue-600 opacity-70" : "bg-blue-400 opacity-70"
    if (saveStatus === "success") return "bg-green-500 hover:bg-green-600"
    if (saveStatus === "error") return "bg-red-500 hover:bg-red-600"
    return "bg-blue-500 hover:bg-blue-600"
  }

  /**
   * Bestimmt den Text des Buttons basierend auf dem Speicherstatus
   *
   * @returns Der Text für den Button
   */
  const getButtonText = () => {
    if (isLoading) return "Wird gespeichert..."
    if (saveStatus === "success") return "Gespeichert!"
    if (saveStatus === "error") return "Fehler! Lokal gesichert"
    return "Speichern"
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleSave}
        disabled={!isOnline || isLoading}
        className={`text-white ${getButtonStyle()} transition-colors duration-200`}
        aria-label={getButtonText()}
        aria-busy={isLoading}
      >
        <Save className="h-4 w-4" />
        {getButtonText()}
      </Button>

      {!isOnline && (
        <div className={`${darkMode ? "text-red-400" : "text-red-500"} text-xs`} aria-live="polite">
          Offline - nur lokal
        </div>
      )}
    </div>
  )
}

