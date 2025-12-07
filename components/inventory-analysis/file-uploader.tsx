"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface FileUploaderProps {
  onAnalyze: (salesFile: File, stockFile: File) => void
}

export function FileUploader({ onAnalyze }: FileUploaderProps) {
  const [salesFile, setSalesFile] = useState<File | null>(null)
  const [stockFile, setStockFile] = useState<File | null>(null)

  const handleAnalyze = () => {
    if (!salesFile || !stockFile) {
      alert("Bitte CSV-Dateien auswählen")
      return
    }
    onAnalyze(salesFile, stockFile)
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="salesCsv" className="block font-bold mb-1">
          Verkaufsdaten (CSV)
        </Label>
        <Input
          id="salesCsv"
          type="file"
          accept=".csv"
          onChange={(e) => setSalesFile(e.target.files?.[0] || null)}
          className="w-full"
        />
      </div>

      <div>
        <Label htmlFor="stockCsv" className="block font-bold mb-1">
          Lagerbestand (CSV)
        </Label>
        <Input
          id="stockCsv"
          type="file"
          accept=".csv"
          onChange={(e) => setStockFile(e.target.files?.[0] || null)}
          className="w-full"
        />
      </div>

      <Button onClick={handleAnalyze} className="mt-2">
        Analyse starten
      </Button>
    </div>
  )
}
