'use client';
import { useTypingHandler } from './useTypingHandler';
import { RefObject } from 'react';

export default function HiddenInput({
  inputRef,
  isMobile,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  isMobile: boolean;
}) {
  const { handleKeyDown } = useTypingHandler();

  return (
    <input
      ref={inputRef}
      type="text"
      className="absolute -top-20 left-0 w-full h-12 opacity-[0.01] z-[-1]"
      onKeyDown={handleKeyDown}
      autoFocus
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      inputMode="text"
      enterKeyHint="enter"
      tabIndex={0}
    />
  );
}
