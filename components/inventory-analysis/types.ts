export enum ViewMode {
  Detail = 0,
  Model = 1,
  Size = 2,
}

export type SortKey = "r" | "s" | "st" | "turnover" | "priority"
export type SortDirection = "asc" | "desc"
export type StatusType = "hot" | "need" | "low" | "ok" | "excess"

export interface InventoryRow {
  m: string // Model
  g: string // Size
  l: string // Last
  f: string // Color
  r: number | null // Rank
  s: number // Sales
  st: number // Stock
  turnover: number
  status: StatusType
  icon: string
  hint: string
  priority: StatusType
}

export interface SalesRow {
  Artikel: string
  Größe: string
  Leiste: string
  Variante: string
  Menge: string
  Datum?: string
  Belegdatum?: string
  [key: string]: any
}

export interface StockRow {
  Artikel: string
  Größe: string
  Leiste: string
  Variante: string
  Bestand?: string
  Lager?: string
  [key: string]: any
}
