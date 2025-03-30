import { useEffect } from 'react';

/**
 * Passt automatisch die maximale Zeichenanzahl pro Zeile
 * anhand von Containerbreite und Schriftgröße an.
 */
export function useResponsiveMaxChars(
  containerRef: React.RefObject<HTMLElement>,
  fontSize: number,
  setMaxCharsPerLine: (value: number) => void,
) {
  useEffect(() => {
    const updateMaxChars = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const charWidth = fontSize * 0.6; // Monospace
      const newMaxChars = Math.floor((containerWidth * 0.95) / charWidth);
      setMaxCharsPerLine(newMaxChars);
    };

    updateMaxChars();

    const resizeObserver = new ResizeObserver(updateMaxChars);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [containerRef, fontSize, setMaxCharsPerLine]);
}
