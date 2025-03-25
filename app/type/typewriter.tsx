// components/typewriter.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useTypewriterStore } from './store';
import SaveButton from './saveButton';
import {
  Fullscreen,
  FullscreenIcon as FullscreenExit,
  FileText,
  AlignLeft,
} from 'lucide-react';

function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={`px-4 py-2 rounded ${props.className}`}>
      {props.children}
    </button>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} className={`p-2 border rounded ${props.className}`} />
  );
}

export default function Typewriter() {
  const {
    lines,
    activeLine,
    wordCount,
    pageCount,
    maxCharsPerLine,
    setActiveLine,
    addLineToStack,
    setMaxCharsPerLine,
    resetSession,
  } = useTypewriterStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [isMobile, setIsMobile] = useState(false);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Check if mobile on mount
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        ),
      );
    };

    if (typeof window !== 'undefined') {
      checkIfMobile();
      window.addEventListener('resize', checkIfMobile);
      return () => window.removeEventListener('resize', checkIfMobile);
    }
  }, []);

  // Reset session on mount
  useEffect(() => {
    resetSession();
  }, [resetSession]);

  // Dynamically adjust maxCharsPerLine
  useEffect(() => {
    const updateMaxChars = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const charWidth = fontSize * (isMobile ? 0.8 : 0.6); // Larger char width on mobile
      const newMaxChars = Math.floor((containerWidth * 0.95) / charWidth);
      setMaxCharsPerLine(newMaxChars);
    };

    updateMaxChars();
    const resizeObserver = new ResizeObserver(updateMaxChars);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [fontSize, setMaxCharsPerLine, isMobile]);

  // Focus management for mobile
  useEffect(() => {
    const focusInput = () => {
      if (hiddenInputRef.current && !hiddenInputRef.current.disabled) {
        hiddenInputRef.current.focus({ preventScroll: true });
      }
    };

    const handleClick = () => {
      focusInput();
    };

    // Handle virtual keyboard appearance
    const handleResize = () => {
      focusInput();
    };

    document.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLineToStack();
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (activeLine.length > 0) {
        setActiveLine(activeLine.substring(0, activeLine.length - 1));
      }
      return;
    }

    if (
      [
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Home',
        'End',
        'PageUp',
        'PageDown',
      ].includes(e.key)
    ) {
      e.preventDefault();
      return;
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      handleCharacterInput(e.key);
    }
  };

  const handleCharacterInput = (char: string) => {
    if (activeLine.length >= maxCharsPerLine) {
      const lastSpaceIndex = activeLine.lastIndexOf(' ');

      if (lastSpaceIndex > 0 && lastSpaceIndex > maxCharsPerLine * 0.7) {
        const lineToAdd = activeLine.substring(0, lastSpaceIndex);
        const remaining = activeLine.substring(lastSpaceIndex + 1);
        setActiveLine(remaining + char);
        useTypewriterStore.setState((state) => ({
          lines: [...state.lines, lineToAdd],
        }));
      } else {
        addLineToStack();
        setActiveLine(char);
      }
    } else {
      setActiveLine(activeLine + char);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch(console.error);
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch(console.error);
    }
  };

  // Auto-scroll
  useEffect(() => {
    const content = document.getElementById('typewriter-content');
    if (content) {
      content.scrollTop = content.scrollHeight;
    }
  }, [lines.length]);

  // Cursor blink effect
  const [showCursor, setShowCursor] = useState(true);
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${
        isFullscreen ? 'fixed inset-0 z-50' : 'h-full w-full'
      } flex flex-col bg-gray-900 text-gray-100`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Mobile-friendly input field */}
      <input
        ref={hiddenInputRef}
        type="text"
        className={`absolute top-0 left-0 w-full h-full opacity-0 ${
          isMobile ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        onKeyDown={handleKeyDown}
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        inputMode={isMobile ? 'text' : 'none'} // Important for mobile
      />

      {/* Control bar */}
      {!isFullscreen && (
        <div className="flex flex-wrap gap-2 items-center justify-between p-2 bg-gray-800 text-white text-sm">
          <div className="flex items-center gap-1">
            <AlignLeft className="h-4 w-4" />
            <span>Wörter: {wordCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>Seiten: {pageCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <label htmlFor="fontSize" className="text-xs">
              Schrift:
            </label>
            <Input
              id="fontSize"
              type="number"
              min={12}
              max={32}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="bg-gray-700 w-12 text-white text-xs h-6"
            />
          </div>
          <SaveButton />
          <Button
            onClick={toggleFullscreen}
            className="bg-blue-600 hover:bg-blue-500 text-xs p-1"
          >
            <Fullscreen className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Writing area */}
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

        {/* Active line */}
        <div
          className="sticky bottom-0 bg-gray-800 p-4 font-mono border-t border-gray-700"
          style={{ fontSize: `${fontSize}px` }}
          onClick={() => hiddenInputRef.current?.focus()}
        >
          <div className="whitespace-pre-wrap break-words">
            {activeLine}
            <span
              className={`inline-block w-[0.5em] h-[1.2em] ml-[1px] align-middle ${
                showCursor ? 'bg-white' : 'bg-transparent'
              }`}
              style={{ transform: 'translateY(-0.1em)' }}
            />
          </div>
          <div className="absolute bottom-0 left-0 h-1 bg-gray-700 w-full">
            <div
              className="h-full bg-blue-500 transition-all duration-75"
              style={{
                width: `${(activeLine.length / maxCharsPerLine) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Exit fullscreen button */}
      {isFullscreen && (
        <div className="absolute top-2 right-2 z-50">
          <Button
            onClick={toggleFullscreen}
            className="bg-gray-700 hover:bg-gray-600 text-xs p-1"
          >
            <FullscreenExit className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
