"use client"

import type { InventoryRow, SortDirection, SortKey } from "../types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { ArrowUpDown } from "lucide-react"

interface DetailViewProps {
  rows: InventoryRow[]
  sortKey: SortKey
  sortDir: SortDirection
  onSort: (key: SortKey) => void
}

export function DetailView({ rows, sortKey, sortDir, onSort }: DetailViewProps) {
  if (!rows.length) {
    return <p>Keine Daten</p>
  }

  const sortedRows = [...rows].sort((a, b) => {
    if (sortKey === "priority") {
      const order = { hot: 0, need: 1, low: 2, ok: 3, excess: 4 }
      return (order[a.priority] - order[b.priority]) * (sortDir === "asc" ? 1 : -1)
    }
    return ((a[sortKey] || 0) - (b[sortKey] || 0)) * (sortDir === "asc" ? 1 : -1)
  })

  const SortableHeader = ({ k, label }: { k: SortKey; label: string }) => (
    <TableHead
      className={cn("cursor-pointer hover:bg-gray-600 bg-gray-700 text-white", sortKey === k && "bg-gray-800")}
      onClick={() => onSort(k)}
    >
      <div className="flex items-center justify-center">
        {label}
        <ArrowUpDown className="ml-1 h-4 w-4" />
      </div>
    </TableHead>
  )

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader k="r" label="Rang" />
            <TableHead className="bg-gray-800 text-white">Modell</TableHead>
            <TableHead className="bg-gray-800 text-white">Größe</TableHead>
            <TableHead className="bg-gray-800 text-white">Leiste</TableHead>
            <TableHead className="bg-gray-800 text-white">Farbe</TableHead>
            <SortableHeader k="s" label="Gew. Verkäufe" />
            <SortableHeader k="st" label="Bestand" />
            <SortableHeader k="turnover" label="Umschlagwert" />
            <TableHead className="bg-gray-800 text-white">Aktion</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRows.map((row, index) => (
            <TableRow
              key={`${row.m}-${row.g}-${row.l}-${row.f}-${index}`}
              className={cn({
                "bg-red-100": row.status === "need",
                "bg-yellow-100": row.status === "low",
                "bg-green-100": row.status === "excess",
                "bg-gray-100": row.status === "ok",
                "bg-orange-100": row.status === "hot",
              })}
            >
              <TableCell className="font-bold text-center">{row.r ? `#${row.r}` : "–"}</TableCell>
              <TableCell>{row.m}</TableCell>
              <TableCell>{row.g}</TableCell>
              <TableCell>{row.l}</TableCell>
              <TableCell>{row.f}</TableCell>
              <TableCell className="font-bold text-center">{row.s}</TableCell>
              <TableCell className="font-bold text-center">{row.st}</TableCell>
              <TableCell className="text-center">{row.turnover.toFixed(1)}</TableCell>
              <TableCell className="font-bold text-center">
                {row.icon} {row.hint}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
