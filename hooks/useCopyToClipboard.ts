'use client';

import { useEffect, useRef, useState } from 'react';

export function useCopyToClipboard(resetMs = 1500) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(true);

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => setCopied(false), resetMs);
  };

  return { copied, copy };
}
