'use client';
import { useTypewriterStore } from './store';

export default function ActiveLine({
  showCursor,
  fontSize,
  onClick,
}: {
  showCursor: boolean;
  fontSize: number;
  onClick: () => void;
}) {
  const { activeLine, maxCharsPerLine } = useTypewriterStore();

  return (
    <div
      className="sticky bottom-0 bg-gray-800 p-4 font-mono border-t border-gray-700"
      style={{ fontSize: `${fontSize}px` }}
      onClick={onClick}
    >
      <div className="whitespace-pre-wrap break-words">
        {activeLine}
        <span
          className={`inline-block w-[0.5em] h-[1.2em] ml-[1px] align-middle ${
            showCursor ? 'bg-white' : 'bg-transparent'
          }`}
          style={{ transform: 'translateY(-0.1em)' }}
        ></span>
      </div>
      <div className="absolute bottom-0 left-0 h-1 bg-gray-700 w-full">
        <div
          className="h-full bg-blue-500 transition-all duration-75"
          style={{ width: `${(activeLine.length / maxCharsPerLine) * 100}%` }}
        />
      </div>
    </div>
  );
}
