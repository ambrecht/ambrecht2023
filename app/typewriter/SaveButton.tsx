"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useTypewriterStore } from "./store"
import { Save } from "lucide-react"
import { saveText } from "./actions"

function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-md transition-colors flex items-center gap-1 ${props.className}`}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  )
}

export default function SaveButton() {
  const { lines, activeLine, wordCount, letterCount } = useTypewriterStore()
  const [isOnline, setIsOnline] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle")

  const fullText = [...lines, activeLine].join("\n")

  useEffect(() => {
    // Nur im Browser ausführen
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine)

      const handleOnline = () => setIsOnline(true)
      const handleOffline = () => setIsOnline(false)

      window.addEventListener("online", handleOnline)
      window.addEventListener("offline", handleOffline)

      return () => {
        window.removeEventListener("online", handleOnline)
        window.removeEventListener("offline", handleOffline)
      }
    }
  }, [])

  // Reset save status after 3 seconds
  useEffect(() => {
    if (saveStatus === "success" || saveStatus === "error") {
      const timer = setTimeout(() => {
        setSaveStatus("idle")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [saveStatus])

  const handleSave = async () => {
    if (!isOnline || isLoading) return

    setIsLoading(true)
    setSaveStatus("saving")

    try {
      // Use the server action instead of direct fetch
      const result = await saveText({
        text: fullText,
        wordCount,
        letterCount,
      })

      if (result.success) {
        console.log("Erfolgreich gespeichert:", result.data)
        setSaveStatus("success")
      } else {
        throw new Error(result.error || "Unknown error")
      }
    } catch (error) {
      console.error("Speicherfehler:", error)
      setSaveStatus("error")
      // Hier könnten Sie den Text im localStorage speichern
      localStorage.setItem("typewriter_backup", fullText)
    } finally {
      setIsLoading(false)
    }
  }

  const getButtonStyle = () => {
    if (!isOnline) return "bg-gray-400 cursor-not-allowed"
    if (isLoading) return "bg-blue-400 opacity-70"
    if (saveStatus === "success") return "bg-green-500 hover:bg-green-600"
    if (saveStatus === "error") return "bg-red-500 hover:bg-red-600"
    return "bg-blue-500 hover:bg-blue-600"
  }

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
      >
        <Save className="h-4 w-4" />
        {getButtonText()}
      </Button>

      {!isOnline && <div className="text-red-500 text-xs">Offline - nur lokal</div>}
    </div>
  )
}

