'use client';

import React from 'react';

interface EditorTextareaProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function EditorTextarea({
  textareaRef,
  value,
  onChange,
}: EditorTextareaProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Verhindern, dass die Enter-Taste einen Zeilenumbruch erzeugt
    if (e.key === 'Enter') {
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
        className="w-full h-full p-4 font-serif text-xl leading-relaxed border-none focus:outline-none resize-none"
        placeholder="Beginnen Sie zu schreiben..."
        autoFocus
      />
    </main>
  );
}
