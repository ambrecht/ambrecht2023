"use client"

import { useEffect, useRef } from "react"
import type { InventoryRow } from "../types"

interface SizeDistributionProps {
  rows: InventoryRow[]
}

export function SizeDistribution({ rows }: SizeDistributionProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (!rows.length || !chartRef.current) {
      return
    }

    // Calculate size distribution
    const dist: Record<number, number> = {}
    rows.forEach((o) => {
      const size = Number(
        String(o.g)
          .replace(/[^0-9,.-]/g, "")
          .replace(",", "."),
      )
      if (!isNaN(size)) {
        dist[size] = (dist[size] || 0) + o.s
      }
    })

    const sizes = Object.keys(dist)
      .map(Number)
      .sort((a, b) => a - b)
    const counts = sizes.map((s) => dist[s])
    const total = counts.reduce((a, b) => a + b, 0)

    // Calculate mean and standard deviation
    const mean = sizes.reduce((sum, s, i) => sum + s * counts[i], 0) / total
    const variance = sizes.reduce((sum, s, i) => sum + counts[i] * Math.pow(s - mean, 2), 0) / total
    const sigma = Math.sqrt(variance)

    // Generate normal distribution points
    const xs: string[] = []
    const ys: number[] = []
    const step = 0.5

    for (let x = sizes[0]; x <= sizes[sizes.length - 1]; x += step) {
      xs.push(x.toFixed(1))
      ys.push((1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-Math.pow(x - mean, 2) / (2 * sigma * sigma)))
    }

    // Import Chart.js dynamically to avoid SSR issues
    import("chart.js").then(({ Chart }) => {
      // Clean up previous chart if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }

      const ctx = chartRef.current?.getContext("2d")
      if (!ctx) return

      chartInstanceRef.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: xs,
          datasets: [
            {
              label: "Schuhgrößenverteilung",
              data: ys,
              fill: true,
              tension: 0.4,
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: "Größe",
              },
            },
            y: {
              title: {
                display: true,
                text: "Dichte",
              },
            },
          },
        },
      })
    })

    // Cleanup function
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
        chartInstanceRef.current = null
      }
    }
  }, [rows])

  if (!rows.length) {
    return <p>Keine Daten</p>
  }

  return (
    <div className="w-full" style={{ height: "400px" }}>
      <canvas ref={chartRef} />
    </div>
  )
}
