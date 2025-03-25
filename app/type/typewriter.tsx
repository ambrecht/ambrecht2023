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

  useEffect(() => {
    const focusInput = () => {
      setTimeout(
        () => {
          if (hiddenInputRef.current && !document.hidden) {
            hiddenInputRef.current.focus({ preventScroll: true });
          }
        },
        isMobile ? 300 : 0,
      );
    };

    focusInput();
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      focusInput();
    };

    window.addEventListener('focus', focusInput);
    document.addEventListener('click', focusInput);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('focus', focusInput);
      document.removeEventListener('click', focusInput);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isMobile]);

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
      processCharacter(e.key);
    }
  };

  const processCharacter = (char: string) => {
    if (activeLine.length >= maxCharsPerLine) {
      const lastSpaceIndex = activeLine.lastIndexOf(' ');
      if (lastSpaceIndex > maxCharsPerLine * 0.7) {
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

  useEffect(() => {
    const scrollToBottom = () => {
      const content = document.getElementById('typewriter-content');
      if (content) {
        content.scrollTop = content.scrollHeight;
      }
    };

    scrollToBottom();
  }, [lines.length]);

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
      <input
        ref={hiddenInputRef}
        type="text"
        className={`absolute ${
          isMobile ? 'top-10 left-0 w-full h-12' : 'top-0 left-0 w-1 h-1'
        } opacity-0`}
        onKeyDown={handleKeyDown}
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        inputMode={isMobile ? 'text' : 'none'}
        enterKeyHint="enter"
        tabIndex={-1}
        aria-hidden="true"
      />

      {!isFullscreen && (
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
            onClick={(e) => {
              e.preventDefault();
              toggleFullscreen();
              setTimeout(() => hiddenInputRef.current?.focus(), 100);
            }}
            className="bg-blue-600 hover:bg-blue-500"
          >
            <Fullscreen className="h-4 w-4 mr-1" />
            Vollbild
          </Button>
        </div>
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
            ></span>
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

      {isFullscreen && (
        <div className="absolute top-2 right-2 z-50">
          <Button
            onClick={(e) => {
              e.preventDefault();
              toggleFullscreen();
              setTimeout(() => hiddenInputRef.current?.focus(), 100);
            }}
          >
            <FullscreenExit className="h-4 w-4 mr-1" />
            Vollbild verlassen
          </Button>
        </div>
      )}
    </div>
  );
}
