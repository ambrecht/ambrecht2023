// lib/typewriter-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TypewriterState {
  lines: string[];
  activeLine: string;
  maxCharsPerLine: number;
  wordCount: number;
  pageCount: number;
  letterCount: number;
  setActiveLine: (text: string) => void;
  addLineToStack: () => void;
  setMaxCharsPerLine: (value: number) => void;
  resetSession: () => void;
}

export const useTypewriterStore = create(
  persist<TypewriterState>(
    (set) => ({
      lines: [],
      activeLine: '',
      maxCharsPerLine: 80,
      letterCount: 0,
      wordCount: 0,
      pageCount: 0,

      setActiveLine: (text: string) =>
        set((state) => {
          const fullText = [...state.lines, text].join(' ');
          const wordCount = fullText.trim().split(/\s+/).filter(Boolean).length;
          const pageCount = Math.max(1, Math.ceil(fullText.length / 2500));
          return { activeLine: text, wordCount, pageCount };
        }),

      addLineToStack: () =>
        set((state) => {
          if (!state.activeLine.trim()) return state;
          const newLines = [...state.lines, state.activeLine];
          return { lines: newLines, activeLine: '' };
        }),

      setMaxCharsPerLine: (value: number) =>
        set(() => ({ maxCharsPerLine: Math.max(20, value) })),

      resetSession: () =>
        set(() => ({ lines: [], activeLine: '', wordCount: 0, pageCount: 0 })),
    }),
    {
      name: 'typewriter-storage',
    },
  ),
);
