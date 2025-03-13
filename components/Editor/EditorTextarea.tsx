'use client';

import React, { useEffect, useRef } from 'react';

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
  // Referenz für den Scroll-Container
  const containerRef = useRef<HTMLDivElement>(null);
  // Referenz für das zuletzt bekannte Wort
  const lastWordRef = useRef<string>('');

  // Funktion zum Scrollen mit Offset (damit die aktuelle Zeile nicht ganz unten klebt)
  const scrollWithOffset = () => {
    const textarea = textareaRef.current;
    const container = containerRef.current;

    if (!textarea || !container) return;

    // Berechne die Position, an der sich der Cursor befindet
    const textBeforeCursor = value;
    const linesBeforeCursor = textBeforeCursor.split(' ').length;

    // Berechne die ungefähre Zeilenhöhe basierend auf der Schriftgröße
    let lineHeight = 24; // Standardwert
    if (fontSize.includes('text-xl')) lineHeight = 28;
    if (fontSize.includes('text-5xl')) lineHeight = 48;
    if (fontSize.includes('text-sm')) lineHeight = 20;

    // Berechne die Scrollposition mit Offset (nicht ganz unten)
    const scrollPosition = linesBeforeCursor * lineHeight;
    const containerHeight = container.clientHeight;

    // Positioniere den Cursor etwa im unteren Drittel des Containers
    const offsetFromBottom = containerHeight * 0.6;
    const targetScrollPosition = Math.max(0, scrollPosition - offsetFromBottom);

    // Sanftes Scrollen zur berechneten Position
    container.scrollTo({
      top: targetScrollPosition,
      behavior: 'smooth',
    });
  };

  // Bei Änderungen des Wertes: Cursor ans Ende setzen und scrollen
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Cursor ans Ende setzen
      textarea.selectionStart = value.length;
      textarea.selectionEnd = value.length;

      // Nur scrollen, wenn wirklich neuer Text hinzugefügt wurde
      const currentWordCount = value.split(' ').length;
      const previousWordCount = lastWordRef.current.split(' ').length;

      if (currentWordCount > previousWordCount) {
        scrollWithOffset();
      }

      lastWordRef.current = value;
    }
  }, [value, textareaRef, fontSize]);

  // Initialer Fokus und Cursor-Position
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = value.length;
        textarea.selectionEnd = value.length;
        scrollWithOffset();
      }, 100);
    }
  }, [textareaRef, value]);

  // Verbesserte Tastatursteuerung: Blockiere bestimmte Tasten, aber erlaube Eingabe
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tasten, die wir blockieren wollen
    const blockedKeys = [
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
      'PageUp',
      'PageDown',
      'Backspace',
      'Delete',
    ];

    // Externe Tastatur: Blockiere nur bestimmte Tasten
    if (blockedKeys.includes(e.key)) {
      e.preventDefault();
      return false;
    }

    // Blockiere Tastenkombinationen, die zum Navigieren oder Löschen führen könnten
    if (
      (e.ctrlKey || e.metaKey) &&
      ['a', 'c', 'v', 'x', 'z', 'y'].includes(e.key.toLowerCase())
    ) {
      e.preventDefault();
      return false;
    }
  };

  // Spezielle Behandlung für die Eingabe: Garantiert, dass nur am Ende eingefügt wird
  const handleBeforeInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;

    // Wenn der Cursor nicht am Ende ist, setze ihn ans Ende
    if (textarea.selectionStart !== value.length) {
      e.preventDefault();
      textarea.selectionStart = value.length;
      textarea.selectionEnd = value.length;
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex-grow overflow-auto relative"
      style={{ paddingBottom: '60vh' }} // Extra Padding unten für bessere UX
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        onBeforeInput={handleBeforeInput}
        onSelect={(e) => {
          // Immer Cursor ans Ende setzen, wenn der Nutzer eine Auswahl trifft
          const textarea = e.currentTarget;
          if (textarea.selectionStart !== value.length) {
            textarea.selectionStart = value.length;
            textarea.selectionEnd = value.length;
          }
        }}
        className={`w-full h-full p-4 font-serif ${fontSize} leading-relaxed border-none focus:outline-none resize-none`}
        placeholder="Beginnen Sie zu schreiben..."
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        enterKeyHint="done"
        data-gramm="false"
      />
    </div>
  );
}
