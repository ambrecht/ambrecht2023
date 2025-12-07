"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface AnalysisOptionsProps {
  isWeighted: boolean
  showHighTurnoverOnly: boolean
  onWeightedChange: (value: boolean) => void
  onTurnoverFilterChange: (value: boolean) => void
}

export function AnalysisOptions({
  isWeighted,
  showHighTurnoverOnly,
  onWeightedChange,
  onTurnoverFilterChange,
}: AnalysisOptionsProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="weightChk"
          checked={isWeighted}
          onCheckedChange={(checked) => onWeightedChange(checked === true)}
        />
        <Label htmlFor="weightChk" className="font-bold">
          Zeitgewichtung aktivieren (letztes Quartal ×3, vorletztes ×2)
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="turnoverChk"
          checked={showHighTurnoverOnly}
          onCheckedChange={(checked) => onTurnoverFilterChange(checked === true)}
        />
        <Label htmlFor="turnoverChk" className="font-bold">
          Nur Artikel mit Lagerumschlag {">"} 1 zeigen
        </Label>
      </div>
    </div>
  )
}
