'use client';
import { AlignLeft, FileText, Fullscreen } from 'lucide-react';
import { useTypewriterStore } from './store';
import Button from '../ui/Button';
import Input from '../ui/Input';
import SaveButton from './saveButton';

export default function ControlBar({
  onFullscreenClick,
  fontSize,
  setFontSize,
}: {
  onFullscreenClick: () => void;
  fontSize: number;
  setFontSize: (val: number) => void;
}) {
  const { wordCount, pageCount } = useTypewriterStore();

  return (
    <div className="flex flex-wrap gap-4 items-center justify-between p-3 bg-gray-800 text-white text-sm">
      <div className="flex items-center gap-2">
        <AlignLeft className="h-4 w-4" />
        <span>Wörter: {wordCount}</span>
      </div>
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        <span>Seiten (A4): {pageCount}</span>
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="fontSize" className="text-xs">
          Schriftgröße:
        </label>
        <Input
          id="fontSize"
          type="number"
          min={12}
          max={32}
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          className="bg-gray-700 w-16 text-white text-xs h-8"
        />
      </div>
      <SaveButton />
      <Button
        onClick={onFullscreenClick}
        className="bg-blue-600 hover:bg-blue-500"
      >
        <Fullscreen className="h-4 w-4 mr-1" />
        Vollbild
      </Button>
    </div>
  );
}
