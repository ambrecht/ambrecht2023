import { useEffect, useState } from 'react';

/**
 * Hook, der einen blinkenden Cursorzustand (`true`/`false`) liefert.
 * Nutzt `setInterval` zur Umschaltung alle 530ms.
 */
export function useBlinkingCursor(interval: number = 530): boolean {
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, interval);

    return () => clearInterval(id);
  }, [interval]);

  return showCursor;
}
