// Datei: components/InputComponent.tsx
'use client';
import { useState } from 'react';

export default function InputComponent() {
  const [text, setText] = useState<string>('');

  const handleChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    // Senden des neuen Textes an die API‑Route
    await fetch('/api/channels-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newText }),
    });
  };

  return (
    <textarea
      value={text}
      onChange={handleChange}
      placeholder="Geben Sie Ihren Text ein..."
    />
  );
}
