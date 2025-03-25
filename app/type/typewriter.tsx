'use client';

import type React from 'react';

import { useEffect, useRef, useState } from 'react';
import { useTypewriterStore } from './store';
import SaveButton from './saveButton';

import {
  Fullscreen,
  FullscreenIcon as FullscreenExit,
  FileText,
  AlignLeft,
} from 'lucide-react';

// Simple Button component
function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={`px-4 py-2 rounded ${props.className}`}>
      {props.children}
    </button>
  );
}

// Simple Input component
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
  const [fontSize, setFontSize] = useState(24);
  const lastKeyTimeRef = useRef<number>(0);

  // Hidden input field for keyboard input
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Reset session on mount
  useEffect(() => {
    resetSession();
  }, [resetSession]);

  // Detect if we're on a mobile device
  // useEffect(() => {
  //   const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  //     navigator.userAgent
  //   );
  //
  //   // On mobile devices, prefer the onChange handler
  //   if (isMobileDevice) {
  //     setInputMode('change');
  //   }
  // }, []);

  // Dynamically adjust maxCharsPerLine based on font size and container width
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
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [fontSize, setMaxCharsPerLine]);

  // Keep focus on the hidden input
  useEffect(() => {
    const focusInput = () => {
      setTimeout(() => hiddenInputRef.current?.focus(), 10);
    };

    focusInput();

    // Set focus on hidden input field on every click
    const handleClick = () => {
      focusInput();
    };

    document.addEventListener('click', handleClick);

    // Handle fullscreen change events
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      focusInput();
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Process a character input (shared between keydown and change handlers)
  // const processCharacter = (char: string) => {
  //   // Check if line is full and needs to be moved to stack
  //   if (activeLine.length >= maxCharsPerLine) {
  //     // Find the last space to break at a word boundary if possible
  //     const lastSpaceIndex = activeLine.lastIndexOf(" ")
  //
  //     if (lastSpaceIndex > 0 && lastSpaceIndex > maxCharsPerLine * 0.7) {
  //       // Break at word boundary
  //       const lineToAdd = activeLine.substring(0, lastSpaceIndex)
  //       const remaining = activeLine.substring(lastSpaceIndex + 1)
  //
  //       // Update the store
  //       setActiveLine(remaining + char)
  //
  //       // Add the line to the stack
  //       useTypewriterStore.setState((state) => ({
  //         lines: [...state.lines, lineToAdd],
  //       }))
  //     } else {
  //       // No good space found, add the whole line to stack
  //       addLineToStack()
  //       setActiveLine(char)
  //     }
  //   } else {
  //     // Add character to active line
  //     setActiveLine(activeLine + char)
  //   }
  // }

  // Handle key events
  // const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   // Skip if we're using the change handler on this device
  //   if (inputMode === "change") return
  //
  //   // Allow Enter key to add line to stack
  //   if (e.key === "Enter") {
  //     e.preventDefault()
  //     addLineToStack()
  //     return
  //   }
  //
  //   // Ignore arrow keys, Home, End, etc.
  //   if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(e.key)) {
  //     e.preventDefault()
  //     return
  //   }
  //
  //   // Only process single characters (ignore shortcuts like Ctrl+C)
  //   if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
  //     e.preventDefault()
  //     lastKeyTimeRef.current = Date.now()
  //     processCharacter(e.key)
  //   }
  // }

  // Handle input change for mobile devices
  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   // Skip if we're using the keydown handler on this device
  //   if (inputMode === "keydown") return
  //
  //   const value = e.target.value
  //   if (value && value.length > 0) {
  //     // Get the last character typed
  //     const lastChar = value.charAt(value.length - 1)
  //
  //     // Process the character
  //     processCharacter(lastChar)
  //
  //     // Clear the input field to prepare for the next character
  //     e.target.value = ""
  //   }
  // }

  // Handle Enter key for mobile devices
  // const handleInputKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (inputMode === "change" && e.key === "Enter") {
  //     e.preventDefault()
  //     addLineToStack()
  //
  //     // Clear the input field
  //     if (hiddenInputRef.current) {
  //       hiddenInputRef.current.value = ""
  //     }
  //   }
  // }

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current
        .requestFullscreen()
        .catch((err) => console.error('Fullscreen error:', err));
    } else if (document.fullscreenElement) {
      document
        .exitFullscreen()
        .catch((err) => console.error('Exit fullscreen error:', err));
    }
  };

  // Auto-scroll to keep the most recent line visible
  useEffect(() => {
    const scrollToBottom = () => {
      const content = document.getElementById('typewriter-content');
      if (content) {
        content.scrollTop = content.scrollHeight;
      }
    };

    scrollToBottom();
  }, [lines.length]);

  // Blinking cursor effect
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530); // Typical cursor blink speed

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
      {/* Control bar - only visible outside fullscreen */}
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
              min={24}
              max={50}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="bg-gray-700 w-16 text-white text-xs h-8"
            />
          </div>
          <SaveButton></SaveButton>
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

      {/* Writing area with fixed active line at bottom */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Scrollable area for previous lines */}
        <div
          className="flex-1 overflow-y-auto p-4 font-mono select-none"
          style={{ fontSize: `${fontSize}px` }}
          id="typewriter-content"
        >
          <div className="min-h-full flex flex-col justify-end">
            {/* Display lines in correct order (oldest at top, newest at bottom) */}
            {lines.map((line, i) => (
              <div key={i} className="whitespace-pre-wrap break-words">
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* Visible but minimal input field at the bottom */}
        <div className="sticky bottom-0 bg-gray-800 p-4 font-mono border-t border-gray-700">
          <div className="relative">
            {/* Display the active line with cursor */}
            <div
              className="whitespace-pre-wrap break-words absolute top-0 left-0 pointer-events-none"
              style={{ fontSize: `${fontSize}px` }}
            >
              {activeLine}
              <span
                className={`inline-block w-[0.5em] h-[1.2em] ml-[1px] align-middle ${
                  showCursor ? 'bg-white' : 'bg-transparent'
                }`}
                style={{
                  transform: 'translateY(-0.1em)',
                }}
              ></span>
            </div>

            {/* Actual input field - styled to match the display but allow direct input */}
            <input
              ref={hiddenInputRef}
              type="text"
              value={activeLine}
              onChange={(e) => {
                // Simply update the active line with the current input value
                setActiveLine(e.target.value);

                // Check if we need to break the line
                if (e.target.value.length > maxCharsPerLine) {
                  // Find the last space to break at a word boundary if possible
                  const lastSpaceIndex = e.target.value.lastIndexOf(' ');

                  if (
                    lastSpaceIndex > 0 &&
                    lastSpaceIndex > maxCharsPerLine * 0.7
                  ) {
                    // Break at word boundary
                    const lineToAdd = e.target.value.substring(
                      0,
                      lastSpaceIndex,
                    );
                    const remaining = e.target.value.substring(
                      lastSpaceIndex + 1,
                    );

                    // Add the line to the stack
                    useTypewriterStore.setState((state) => ({
                      lines: [...state.lines, lineToAdd],
                    }));

                    // Update the active line with the remaining text
                    setActiveLine(remaining);
                  }
                }
              }}
              onKeyDown={(e) => {
                // Handle Enter key to add line to stack
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addLineToStack();
                }
              }}
              className="w-full bg-transparent text-transparent caret-transparent outline-none"
              style={{
                fontSize: `${fontSize}px`,
                fontFamily: 'monospace',
              }}
              autoFocus
            />
          </div>

          {/* Progress bar */}
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
