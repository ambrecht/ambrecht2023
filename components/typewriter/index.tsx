'use client';

import { useEffect, useRef, useState } from 'react';
import { useTypewriterStore } from './store';
import ControlBar from './ControlBar';
import HiddenInput from './HiddenInput';
import ActiveLine from './ActiveLine';
import { useInputFocus } from './useInputFocus';

export default function Typewriter() {
  const { lines, resetSession, setMaxCharsPerLine } = useTypewriterStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [showCursor, setShowCursor] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    resetSession();
    setIsMobile(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      ),
    );
  }, [resetSession]);

  useEffect(() => {
    const updateMaxChars = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const charWidth = fontSize * 0.6;
      const newMaxChars = Math.floor((containerWidth * 0.95) / charWidth);
      setMaxCharsPerLine(newMaxChars);
    };

    updateMaxChars();
    const resizeObserver = new ResizeObserver(updateMaxChars);
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [fontSize, setMaxCharsPerLine]);

  useInputFocus(hiddenInputRef, isMobile);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className={`${
        isFullscreen ? 'fixed inset-0 z-50' : 'h-full w-full'
      } flex flex-col bg-gray-900 text-gray-100`}
      onContextMenu={(e) => e.preventDefault()}
    >
      <HiddenInput inputRef={hiddenInputRef} isMobile={isMobile} />

      {!isFullscreen && (
        <ControlBar
          onFullscreenClick={() => {
            toggleFullscreen();
            setTimeout(() => hiddenInputRef.current?.focus(), 100);
          }}
          fontSize={fontSize}
          setFontSize={setFontSize}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div
          className="flex-1 overflow-y-auto p-4 font-mono select-none"
          style={{ fontSize: `${fontSize}px` }}
          id="typewriter-content"
        >
          <div className="min-h-full flex flex-col justify-end">
            {lines.map((line, i) => (
              <div key={i} className="whitespace-pre-wrap break-words">
                {line}
              </div>
            ))}
          </div>
        </div>

        <ActiveLine
          showCursor={showCursor}
          fontSize={fontSize}
          onClick={() => hiddenInputRef.current?.focus()}
        />
      </div>

      {isFullscreen && (
        <div className="absolute top-2 right-2 z-50">
          <button
            onClick={() => {
              toggleFullscreen();
              setTimeout(() => hiddenInputRef.current?.focus(), 100);
            }}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500"
          >
            <span className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18H5v-4M5 14l6-6M15 6h4v4M19 10l-6 6" />
              </svg>
              Vollbild verlassen
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
