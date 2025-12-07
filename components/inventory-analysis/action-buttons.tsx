"use client"

import { Button } from "@/components/ui/button"
import { ViewMode } from "./types"

interface ActionButtonsProps {
  hasData: boolean
  viewMode: ViewMode
  onAnalyze: () => void
  onExport: () => void
  onToggleModelView: () => void
  onToggleSizeView: () => void
}

export function ActionButtons({
  hasData,
  viewMode,
  onAnalyze,
  onExport,
  onToggleModelView,
  onToggleSizeView,
}: ActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={onAnalyze}>Analyse starten</Button>

      <Button onClick={onExport} disabled={!hasData} variant="outline">
        Top 500 als CSV exportieren
      </Button>

      <Button
        onClick={onToggleModelView}
        disabled={!hasData}
        variant={viewMode === ViewMode.Model ? "secondary" : "outline"}
      >
        {viewMode === ViewMode.Model ? "Detailansicht anzeigen" : "Modellübersicht anzeigen"}
      </Button>

      <Button
        onClick={onToggleSizeView}
        disabled={!hasData}
        variant={viewMode === ViewMode.Size ? "secondary" : "outline"}
      >
        {viewMode === ViewMode.Size ? "Detailansicht anzeigen" : "Größenverteilung anzeigen"}
      </Button>
    </div>
  )
}
