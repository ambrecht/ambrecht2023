"use client"

import type { InventoryRow } from "../types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ModelOverviewProps {
  rows: InventoryRow[]
}

export function ModelOverview({ rows }: ModelOverviewProps) {
  if (!rows.length) {
    return <p>Keine Daten</p>
  }

  // Group by model
  const group: Record<
    string,
    {
      totalS: number
      totalSt: number
      sizes: Record<string, { s: number; st: number }>
    }
  > = {}

  rows.forEach((o) => {
    if (!group[o.m]) {
      group[o.m] = { totalS: 0, totalSt: 0, sizes: {} }
    }
    group[o.m].totalS += o.s
    group[o.m].totalSt += o.st

    if (!group[o.m].sizes[o.g]) {
      group[o.m].sizes[o.g] = { s: 0, st: 0 }
    }
    group[o.m].sizes[o.g].s += o.s
    group[o.m].sizes[o.g].st += o.st
  })

  const models = Object.entries(group).map(([model, v]) => ({
    model,
    ...v,
  }))

  models.sort((a, b) => b.totalS - a.totalS)

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="bg-gray-800 text-white">Modell</TableHead>
            <TableHead className="bg-gray-800 text-white">Gesamtverkäufe</TableHead>
            <TableHead className="bg-gray-800 text-white">Top 3 Größen (Verkäufe)</TableHead>
            <TableHead className="bg-gray-800 text-white">Nachbestellen (Größe)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {models.map((model) => {
            const sizes = Object.entries(model.sizes).map(([g, v]) => ({ g, ...v }))
            sizes.sort((a, b) => b.s - a.s)

            const top3 = sizes
              .slice(0, 3)
              .map((x) => `${x.g} (${x.s})`)
              .join(", ")

            const need =
              sizes
                .filter((x) => x.st <= 5)
                .map((x) => `${x.g} (${x.st})`)
                .join(", ") || "–"

            return (
              <TableRow key={model.model}>
                <TableCell>{model.model}</TableCell>
                <TableCell className="font-bold">{model.totalS}</TableCell>
                <TableCell>{top3}</TableCell>
                <TableCell className="bg-red-100">{need}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
