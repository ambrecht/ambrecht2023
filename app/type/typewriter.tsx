'use client';

import type React from 'react';
import { useState, useRef, useEffect } from 'react';

interface TypewriterProps {
  lines: string[];
  loop?: boolean;
  typingSpeed?: number;
  deleteSpeed?: number;
  delayBeforeTypingNewText?: number;
}

const Typewriter: React.FC<TypewriterProps> = ({
  lines,
  loop = true,
  typingSpeed = 50,
  deleteSpeed = 30,
  delayBeforeTypingNewText = 1000,
}) => {
  const [lineStack, setLineStack] = useState<string[]>([]);
  const [activeLine, setActiveLine] = useState('');
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [hasExternalKeyboard, setHasExternalKeyboard] = useState(false);

  // Detect external keyboard (this is a heuristic, not perfect)
  useEffect(() => {
    const detectExternalKeyboard = () => {
      // On Android, we can try to detect if an external keyboard is connected
      // by checking for certain key events that only physical keyboards would trigger
      const handleKeyDown = (e: KeyboardEvent) => {
        // Tab key is rarely accessible on virtual keyboards
        if (e.key === 'Tab' && isMobile) {
          setHasExternalKeyboard(true);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    };

    return detectExternalKeyboard();
  }, [isMobile]);

  useEffect(() => {
    setIsMobile(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      ),
    );
  }, []);

  useEffect(() => {
    const type = async () => {
      const fullLine = lines[currentLineIndex];

      if (isDeleting) {
        setActiveLine((prevLine) => prevLine.substring(0, prevLine.length - 1));
      } else {
        setActiveLine((prevLine) => fullLine.substring(0, prevLine.length + 1));
      }

      const typingInterval = isDeleting ? deleteSpeed : typingSpeed;
      await new Promise((resolve) => setTimeout(resolve, typingInterval));

      if (!isDeleting && activeLine === fullLine) {
        setIsDeleting(true);
        await new Promise((resolve) =>
          setTimeout(resolve, delayBeforeTypingNewText),
        );
      }

      if (isDeleting && activeLine === '') {
        setIsDeleting(false);
        setCurrentLineIndex((prevIndex) =>
          loop
            ? (prevIndex + 1) % lines.length
            : Math.min(prevIndex + 1, lines.length - 1),
        );
      }

      if (!isDeleting && activeLine !== fullLine) {
        type();
      } else if (isDeleting && activeLine !== '') {
        type();
      }
    };

    if (lines.length > 0 && currentLineIndex < lines.length) {
      type();
    }
  }, [
    lines,
    currentLineIndex,
    isDeleting,
    typingSpeed,
    deleteSpeed,
    delayBeforeTypingNewText,
    loop,
    activeLine,
  ]);

  const addLineToStack = () => {
    setLineStack([...lineStack, activeLine]);
    setActiveLine('');
  };

  const handleCharacterInput = (char: string) => {
    setActiveLine((prevLine) => prevLine + char);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // For Android with external keyboard, we need special handling
    const isAndroidWithExternalKeyboard =
      isMobile && /Android/i.test(navigator.userAgent);

    if (e.key === 'Enter') {
      e.preventDefault();
      addLineToStack();
      return;
    }

    // Let Android with external keyboard handle backspace natively
    if (e.key === 'Backspace') {
      if (!isAndroidWithExternalKeyboard) {
        e.preventDefault();
        if (activeLine.length > 0) {
          setActiveLine(activeLine.substring(0, activeLine.length - 1));
        }
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

    // For Android with external keyboard, let the input event handle character input
    if (
      !isAndroidWithExternalKeyboard &&
      e.key.length === 1 &&
      !e.ctrlKey &&
      !e.altKey &&
      !e.metaKey
    ) {
      e.preventDefault();
      handleCharacterInput(e.key);
    }
  };

  // Keep input value in sync with activeLine
  useEffect(() => {
    if (hiddenInputRef.current && isMobile) {
      hiddenInputRef.current.value = activeLine;
    }
  }, [activeLine, isMobile]);

  // Improved focus management
  useEffect(() => {
    const focusInput = () => {
      if (hiddenInputRef.current) {
        hiddenInputRef.current.focus({ preventScroll: true });
      }
    };

    // Focus on mount
    focusInput();

    // Re-focus on clicks
    const handleClick = () => {
      focusInput();
    };

    // Handle focus loss
    const handleBlur = () => {
      // Small delay to prevent focus issues during keyboard transitions
      setTimeout(focusInput, 100);
    };

    document.addEventListener('click', handleClick);
    if (hiddenInputRef.current) {
      hiddenInputRef.current.addEventListener('blur', handleBlur);
    }

    return () => {
      document.removeEventListener('click', handleClick);
      if (hiddenInputRef.current) {
        hiddenInputRef.current.removeEventListener('blur', handleBlur);
      }
    };
  }, []);

  // Improved focus management for Android with external keyboards
  useEffect(() => {
    if (!isMobile || !/Android/i.test(navigator.userAgent)) return;

    const focusInput = () => {
      if (hiddenInputRef.current) {
        hiddenInputRef.current.focus({ preventScroll: true });
      }
    };

    // Handle focus loss
    const handleBlur = () => {
      // Small delay to prevent focus issues during keyboard transitions
      setTimeout(focusInput, 100);
    };

    if (hiddenInputRef.current) {
      hiddenInputRef.current.addEventListener('blur', handleBlur);
    }

    return () => {
      if (hiddenInputRef.current) {
        hiddenInputRef.current.removeEventListener('blur', handleBlur);
      }
    };
  }, [isMobile]);

  // Keep input value in sync with activeLine for Android external keyboards
  useEffect(() => {
    if (
      hiddenInputRef.current &&
      isMobile &&
      /Android/i.test(navigator.userAgent)
    ) {
      // Only update if the focus is not on the input to prevent cursor jumping
      if (document.activeElement !== hiddenInputRef.current) {
        hiddenInputRef.current.value = activeLine;
      }
    }
  }, [activeLine, isMobile]);

  return (
    <div className="relative">
      {lineStack.map((line, index) => (
        <div key={index}>{line}</div>
      ))}
      <div>
        {activeLine}
        <span className="inline-block w-1 h-5 bg-black animate-blink align-middle"></span>
      </div>
      <input
        ref={hiddenInputRef}
        type="text"
        value={activeLine}
        onChange={(e) => {
          // For Android with external keyboard, use the onChange event
          if (isMobile && /Android/i.test(navigator.userAgent)) {
            setActiveLine(e.target.value);
          }
        }}
        className={`absolute top-0 left-0 w-full h-full opacity-0 ${
          isMobile ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        onKeyDown={handleKeyDown}
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        inputMode="text" // Important for mobile
      />
    </div>
  );
};

export default Typewriter;
