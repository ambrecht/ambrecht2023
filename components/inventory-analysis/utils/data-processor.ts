"use client"

import type { InventoryRow, SalesRow, StockRow } from "../types"
import Papa from "papaparse"

const HOT_THRESHOLD = 7
const EXCLUDE_PATTERN = /schuhband|schuhlöffel/i

// Helper functions
const toNumber = (v: string | undefined): number => {
  if (!v) return 0
  return Number(
    String(v)
      .replace(/[^0-9,.-]/g, "")
      .replace(",", "."),
  )
}

const parseDate = (s: string | undefined): Date | null => {
  if (!s) return null
  const parts = s.split(".")
  if (parts.length < 3) return null
  const [d, m, y] = parts.map(Number)
  return new Date(y, m - 1, d)
}

// Parse CSV files\
const parseCsv = async <T>(file: File)
: Promise<T[]> =>
{
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      delimiter: ';',
      encoding: 'latin1',
      skipEmptyLines: true,
      complete: ({ data }: { data: T[] }) => 
        resolve(data.filter((r: any) => r && !EXCLUDE_PATTERN.test(r['Artikel']))),
      error: reject,
    });
  });
}

// Calculate sales data
const buildSales = (rows: SalesRow[], weighted: boolean) => {
  const counts: Record<string, number> = {}
  let newest = 0
  const quarterMs = 91 * 24 * 3600 * 1000

  // Find newest date
  rows.forEach((r) => {
    const t = parseDate(r["Datum"] || r["Belegdatum"])?.getTime() || 0
    if (t > newest) newest = t
  })

  // Calculate weighted sales
  rows.forEach((r) => {
    const key = [r["Artikel"], r["Größe"], r["Leiste"], r["Variante"]].join("|")
    const qty = toNumber(r["Menge"])
    if (isNaN(qty)) return

    let factor = 1
    if (weighted) {
      const date = parseDate(r["Datum"] || r["Belegdatum"])
      if (date) {
        const diff = Math.floor((newest - date.getTime()) / quarterMs)
        factor = diff === 0 ? 3 : diff === 1 ? 2 : 1
      }
    }

    counts[key] = (counts[key] || 0) + qty * factor
  })

  // Calculate rankings
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const rank: Record<string, number> = {}
  const sold: Record<string, number> = {}
  let lastQty: number | null = null
  let rankCounter = 0

  entries.forEach(([k, q]) => {
    if (q !== lastQty) {
      rankCounter++
      lastQty = q
    }
    rank[k] = rankCounter
    sold[k] = q
  })

  return { rank, sold }
}

// Calculate inventory data
const buildInv = (rows: StockRow[]) => {
  const inv: Record<string, number> = {}

  rows.forEach((r) => {
    const qty = toNumber(r["Bestand"] || r["Lager"])
    if (isNaN(qty)) return

    const key = [r["Artikel"], r["Größe"], r["Leiste"], r["Variante"]].join("|")
    inv[key] = (inv[key] || 0) + qty
  })

  return inv
}

// Combine data into rows
const rowsData = (
  rank: Record<string, number>,
  sold: Record<string, number>,
  inv: Record<string, number>,
  showHighTurnoverOnly: boolean,
): InventoryRow[] => {
  const arr: InventoryRow[] = []
  const keys = new Set([...Object.keys(rank), ...Object.keys(inv)])

  keys.forEach((key) => {
    const [m, g, l, f] = key.split("|")
    const s = sold[key] || 0
    const st = inv[key] || 0
    const rnk = rank[key] || null
    const turnover = st ? s / st : s

    if (showHighTurnoverOnly && turnover <= 1) return

    let status: InventoryRow["status"] = "ok"
    let icon = "➖"
    let hint = "OK"

    if (turnover > HOT_THRESHOLD) {
      status = "hot"
      icon = "🔥"
      hint = "Hot Seller"
    } else if (rnk && st === 0) {
      status = "need"
      icon = "❌"
      hint = "Kein Bestand"
    } else if (rnk && rnk <= 100 && st === 1) {
      status = "low"
      icon = "⚠️"
      hint = "Bestand gering"
    } else if (rnk && rnk <= 100 && st <= 5) {
      status = "need"
      icon = "❗"
      hint = "Bestellen"
    } else if (!rnk && st >= 10) {
      status = "excess"
      icon = "✅"
      hint = "Zu viele"
    }

    arr.push({
      m,
      g,
      l,
      f,
      r: rnk,
      s,
      st,
      turnover,
      status,
      icon,
      hint,
      priority: status,
    })
  })

  return arr
}

// Main data processing function
export const processData = async (
  salesFile: File,
  stockFile: File,
  isWeighted: boolean,
  showHighTurnoverOnly: boolean,
): Promise<InventoryRow[]> => {
  try {
    const [sales, stock] = await Promise.all([parseCsv<SalesRow>(salesFile), parseCsv<StockRow>(stockFile)])

    const { rank, sold } = buildSales(sales, isWeighted)
    const inv = buildInv(stock)
    return rowsData(rank, sold, inv, showHighTurnoverOnly)
  } catch (error) {
    console.error("Error processing data:", error)
    return []
  }
}
