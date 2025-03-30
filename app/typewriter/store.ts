// lib/typewriter-store.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { type LineBreakConfig, defaultLineBreakConfig } from "./lineBreakConfig"
import { reformatText } from "./lineBreakLogic"

interface TypewriterState {
  lines: string[]
  activeLine: string
  maxCharsPerLine: number
  wordCount: number
  pageCount: number
  letterCount: number
  lineBreakConfig: LineBreakConfig
  setActiveLine: (text: string) => void
  addLineToStack: () => void
  setMaxCharsPerLine: (value: number) => void
  resetSession: () => void
}

export const useTypewriterStore = create(
  persist<TypewriterState>(
    (set, get) => ({
      lines: [],
      activeLine: "",
      maxCharsPerLine: 56,
      letterCount: 0,
      wordCount: 0,
      pageCount: 0,
      lineBreakConfig: defaultLineBreakConfig,

      setActiveLine: (text: string) =>
        set((state) => {
          const fullText = [...state.lines, text].join(" ")
          const wordCount = fullText.trim().split(/\s+/).filter(Boolean).length
          const letterCount = fullText.replace(/\s+/g, "").length
          const pageCount = Math.floor(fullText.length / 1600)

          return { activeLine: text, wordCount, letterCount, pageCount }
        }),

      addLineToStack: () =>
        set((state) => {
          if (!state.activeLine.trim()) return state
          const newLines = [...state.lines, state.activeLine]
          return { lines: newLines, activeLine: "" }
        }),

      setMaxCharsPerLine: (value: number) =>
        set((state) => {
          const newConfig = { ...state.lineBreakConfig, maxCharsPerLine: value }
          const newLines = reformatText(state.lines, newConfig)
          return {
            maxCharsPerLine: value,
            lineBreakConfig: newConfig,
            lines: newLines,
          }
        }),

      resetSession: () =>
        set(() => ({
          lines: [],
          activeLine: "",
          wordCount: 0,
          letterCount: 0,
          pageCount: 0,
        })),
    }),
    {
      name: "typewriter-storage",
    },
  ),
)

