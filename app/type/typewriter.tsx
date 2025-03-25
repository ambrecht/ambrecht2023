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

// UI Components
function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`px-3 py-1.5 rounded text-sm ${props.className}`}
    >
      {props.children}
    </button>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`p-1.5 border rounded bg-gray-700 text-white ${props.className}`}
    />
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
  const [fontSize, setFontSize] = useState(16);
  const [showCursor, setShowCursor] = useState(true);
  const [hasExternalKeyboard, setHasExternalKeyboard] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 1. Initial Setup and Mobile Detection
  useEffect(() => {
    // Detect mobile platform
    const mobileCheck =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );
    setIsMobile(mobileCheck);

    // Reset session but preserve last state if coming back
    const lastText = localStorage.getItem('typewriter_lastText');
    if (!lastText) {
      resetSession();
    }

    // Setup for Android soft keyboard
    if (mobileCheck) {
      document.body.style.touchAction = 'manipulation';
    }

    return () => {
      document.body.style.touchAction = '';
    };
  }, [resetSession]);

  // 2. Focus Management - Critical for Android
  useEffect(() => {
    const handleFocus = () => {
      if (hiddenInputRef.current && !document.hidden) {
        hiddenInputRef.current.focus({ preventScroll: true });
      }
    };

    // Initial focus with delay for Android
    const focusTimer = setTimeout(handleFocus, 300);

    // Re-focus handlers
    window.addEventListener('focus', handleFocus);
    document.addEventListener('click', handleFocus);
    window.addEventListener('blur', handleFocus);

    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('click', handleFocus);
      window.removeEventListener('blur', handleFocus);
    };
  }, []);

  // 3. Keyboard Detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect external keyboard on Android
      if (isMobile && (e.key === 'Tab' || e.key === 'Alt')) {
        setHasExternalKeyboard(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile]);

  // 4. Responsive Line Length Calculation
  useEffect(() => {
    const calculateMaxChars = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const charWidth = fontSize * (isMobile ? 0.62 : 0.6); // Adjusted for mobile
      const newMaxChars = Math.floor((containerWidth * 0.94) / charWidth);
      setMaxCharsPerLine(Math.max(20, newMaxChars));
    };

    calculateMaxChars();
    const resizeObserver = new ResizeObserver(calculateMaxChars);
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [fontSize, isMobile, setMaxCharsPerLine]);

  // 5. Combined Input Handling for Mobile/Desktop
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Handle mobile input (including predictive text)
    if (isMobile && !hasExternalKeyboard) {
      setActiveLine(newValue);
      return;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Mobile with external keyboard or desktop
    if (hasExternalKeyboard || !isMobile) {
      if (e.key === 'Enter') {
        e.preventDefault();
        addLineToStack();
        if (hiddenInputRef.current) hiddenInputRef.current.value = '';
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        if (activeLine.length > 0) {
          setActiveLine(activeLine.substring(0, activeLine.length - 1));
        }
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        processCharacter(e.key);
      }
    }
  };

  // 6. Character Processing Logic
  const processCharacter = (char: string) => {
    if (activeLine.length >= maxCharsPerLine) {
      handleLineOverflow(char);
    } else {
      setActiveLine(activeLine + char);
    }
  };

  const handleLineOverflow = (char: string) => {
    const lastSpaceIndex = activeLine.lastIndexOf(' ');
    const shouldBreakAtWord = lastSpaceIndex > maxCharsPerLine * 0.6;

    if (shouldBreakAtWord) {
      const newLine = activeLine.substring(0, lastSpaceIndex);
      const remaining = activeLine.substring(lastSpaceIndex + 1);
      setActiveLine(remaining + char);
      useTypewriterStore.setState((state) => ({
        lines: [...state.lines, newLine],
      }));
    } else {
      addLineToStack();
      setActiveLine(char);
    }
  };

  // 7. Fullscreen Handling
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().then(() => {
        setIsFullscreen(true);
        setTimeout(() => hiddenInputRef.current?.focus(), 100);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
        setTimeout(() => hiddenInputRef.current?.focus(), 100);
      });
    }
  };

  // 8. Cursor Blink Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  // 9. Auto-scroll and State Persistence
  useEffect(() => {
    // Auto-scroll
    const contentEl = document.getElementById('typewriter-content');
    if (contentEl) {
      contentEl.scrollTop = contentEl.scrollHeight;
    }

    // Persist state
    localStorage.setItem(
      'typewriter_lastText',
      [...lines, activeLine].join('\n'),
    );
  }, [lines, activeLine]);

  return (
    <div
      ref={containerRef}
      className={`${
        isFullscreen ? 'fixed inset-0 z-50' : 'h-full w-full'
      } flex flex-col bg-gray-900 text-gray-100`}
      onClick={() => hiddenInputRef.current?.focus()}
    >
      {/* Hidden Input - Core of Android Compatibility */}
      <input
        ref={hiddenInputRef}
        type="text"
        value={activeLine}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        className={`absolute ${
          isMobile ? 'top-10 left-0 w-full h-12' : 'top-0 left-0 w-1 h-1'
        } opacity-0`}
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        inputMode="text"
        enterKeyHint="enter"
      />

      {/* Control Bar - Optimized for Mobile */}
      {!isFullscreen && (
        <div className="flex flex-wrap gap-2 items-center p-2 bg-gray-800 text-xs sm:text-sm">
          <div className="flex items-center gap-1">
            <AlignLeft size={16} />
            <span>{wordCount} Wörter</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText size={16} />
            <span>{pageCount} Seiten</span>
          </div>
          <div className="flex items-center gap-1">
            <label>Schrift:</label>
            <Input
              type="number"
              min="12"
              max="32"
              value={fontSize}
              onChange={(e) =>
                setFontSize(Math.min(32, Math.max(12, Number(e.target.value))))
              }
              className="w-12 h-6 text-center"
            />
          </div>
          <div className="flex-grow" />
          <SaveButton />
          <Button
            onClick={toggleFullscreen}
            className="bg-blue-600 hover:bg-blue-500"
          >
            <Fullscreen size={16} />
          </Button>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          id="typewriter-content"
          className="flex-1 overflow-y-auto p-4 font-mono whitespace-pre-wrap break-words"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: `${fontSize * 1.4}px`,
          }}
        >
          {lines.map((line, i) => (
            <div key={i} className="mb-1">
              {line}
            </div>
          ))}
          <div className="relative">
            {activeLine}
            <span
              className={`absolute h-6 w-[2px] ml-1 ${
                showCursor ? 'bg-white' : 'bg-transparent'
              }`}
              style={{ bottom: 1 }}
            />
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="h-1 bg-gray-700">
          <div
            className="h-full bg-blue-500 transition-all duration-100"
            style={{
              width: `${Math.min(
                100,
                (activeLine.length / maxCharsPerLine) * 100,
              )}%`,
            }}
          />
        </div>
      </div>

      {/* Fullscreen Exit Button */}
      {isFullscreen && (
        <div className="absolute top-2 right-2">
          <Button
            onClick={toggleFullscreen}
            className="bg-gray-700 hover:bg-gray-600"
          >
            <FullscreenExit size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}
