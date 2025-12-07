import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function imageClampBuilder(
  minWidthPx: number,
  maxWidthPx: number,
  minImageWidth: number,
  maxImageWidth: number,
): string {
  const slope = (maxImageWidth - minImageWidth) / (maxWidthPx - minWidthPx);
  const yAxisIntersection = -minWidthPx * slope + minImageWidth;

  return `clamp(${minImageWidth}px, ${yAxisIntersection}px + ${
    slope * 100
  }vw, ${maxImageWidth}px)`;
}

type ClampBuilderParams = {
  minWidthPx: number;
  maxWidthPx: number;
  minValue: number;
  maxValue: number;
  units: 'rem' | 'px' | 'em';
};

export const clampBuilder = ({
  minWidthPx,
  maxWidthPx,
  minValue,
  maxValue,
  units = 'rem',
}: ClampBuilderParams) => {
  // Berechnen Sie die Steigung und den y-Achsenabschnitt für die clamp-Funktion.
  const slope = (maxValue - minValue) / (maxWidthPx - minWidthPx);
  const yAxisIntersection = -minWidthPx * slope + minValue;

  // Rückgabe des clamp-Ausdrucks in der gewünschten Einheit.
  return `clamp(${minValue}${units}, ${yAxisIntersection}${units} + ${
    slope * 100
  }vw, ${maxValue}${units})`;
};
