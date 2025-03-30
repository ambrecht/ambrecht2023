/**
 * `WordCountDisplay`
 *
 * Zeigt Wortanzahl und geschätzte Seitenanzahl (A4) in einer kleinen UI-Komponente.
 * Nutzt Lucide-Icons. Darstellung ist rein visuell.
 *
 * @param wordCount Anzahl der Wörter
 * @param pageCount Anzahl der geschätzten A4-Seiten
 */

import { AlignLeft, FileText } from 'lucide-react';

interface WordCountDisplayProps {
  wordCount: number;
  pageCount: number;
}

export default function WordCountDisplay({
  wordCount,
  pageCount,
}: WordCountDisplayProps) {
  return (
    <>
      <div className="flex items-center gap-2">
        <AlignLeft className="h-4 w-4" />
        <span>Wörter: {wordCount}</span>
      </div>
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        <span>Seiten (A4): {pageCount}</span>
      </div>
    </>
  );
}
