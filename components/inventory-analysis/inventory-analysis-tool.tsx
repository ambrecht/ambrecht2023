"use client"

import { useState } from "react"
import { FileUploader } from "./file-uploader"
import { AnalysisOptions } from "./analysis-options"
import { ActionButtons } from "./action-buttons"
import { Legend } from "./legend"
import { DetailView } from "./views/detail-view"
import { ModelOverview } from "./views/model-overview"
import { SizeDistribution } from "./views/size-distribution"
import { type InventoryRow, type SortDirection, type SortKey, ViewMode } from "./types"
import { processData } from "./utils/data-processor"

export function InventoryAnalysisTool() {
  const [currentRows, setCurrentRows] = useState<InventoryRow[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Detail)
  const [sortKey, setSortKey] = useState<SortKey>("priority")
  const [sortDir, setSortDir] = useState<SortDirection>("asc")
  const [isWeighted, setIsWeighted] = useState(false)
  const [showHighTurnoverOnly, setShowHighTurnoverOnly] = useState(false)

  const handleAnalyze = async (salesFile: File, stockFile: File) => {
    const rows = await processData(salesFile, stockFile, isWeighted, showHighTurnoverOnly)
    setCurrentRows(rows)
    setViewMode(ViewMode.Detail)
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const toggleViewMode = (mode: ViewMode) => {
    setViewMode(viewMode === mode ? ViewMode.Detail : mode)
  }

  const exportToCsv = () => {
    if (!currentRows.length) return

    // Import dynamically to avoid SSR issues
    import("papaparse").then(({ unparse }) => {
      const rows = [...currentRows]
        .sort((a, b) => {
          if (sortKey === "priority") {
            const order = { hot: 0, need: 1, low: 2, ok: 3, excess: 4 }
            return (order[a.priority] - order[b.priority]) * (sortDir === "asc" ? 1 : -1)
          }
          return ((a[sortKey] || 0) - (b[sortKey] || 0)) * (sortDir === "asc" ? 1 : -1)
        })
        .slice(0, 500)

      const csv = unparse(
        rows.map((o) => ({
          Rang: o.r || "",
          Modell: o.m,
          Größe: o.g,
          Leiste: o.l,
          Farbe: o.f,
          Verkäufe: o.s,
          Bestand: o.st,
          Umschlagwert: o.turnover.toFixed(1),
          Aktion: o.hint,
        })),
        { delimiter: ";" },
      )

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "top500_bestellliste.csv"
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  return (
    <div className="space-y-4">
      <FileUploader onAnalyze={handleAnalyze} />

      <AnalysisOptions
        isWeighted={isWeighted}
        showHighTurnoverOnly={showHighTurnoverOnly}
        onWeightedChange={setIsWeighted}
        onTurnoverFilterChange={setShowHighTurnoverOnly}
      />

      <ActionButtons
        hasData={currentRows.length > 0}
        viewMode={viewMode}
        onAnalyze={() => {}} // This is handled by FileUploader
        onExport={exportToCsv}
        onToggleModelView={() => toggleViewMode(ViewMode.Model)}
        onToggleSizeView={() => toggleViewMode(ViewMode.Size)}
      />

      <Legend />

      <div className="mt-6">
        {viewMode === ViewMode.Detail && (
          <DetailView rows={currentRows} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
        )}

        {viewMode === ViewMode.Model && <ModelOverview rows={currentRows} />}

        {viewMode === ViewMode.Size && <SizeDistribution rows={currentRows} />}
      </div>
    </div>
  )
}
