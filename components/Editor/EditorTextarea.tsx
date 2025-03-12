'use client';

import React from 'react';

interface EditorTextareaProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  fontSize: string;
}

export default function EditorTextarea({
  textareaRef,
  value,
  onChange,
  fontSize,
}: EditorTextareaProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Unerwünschte Tasten, die zu einer Cursorbewegung oder Löschaktion führen könnten
    const disallowedKeys = [
      'Enter',
      'ArrowLeft',
      'ArrowUp',
      'ArrowRight',
      'ArrowDown',
      'Home',
      'End',
      'Backspace',
      'Delete',
      'PageUp',
      'PageDown',
    ];
    if (disallowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <main className="flex-grow overflow-auto">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        className={`w-full h-full p-4 font-serif ${fontSize} leading-relaxed border-none focus:outline-none resize-none`}
        placeholder="Beginnen Sie zu schreiben..."
        autoFocus
      />
    </main>
  );
}
