'use client';

import { useEffect, useState } from 'react';
import { useTypewriterStore } from './store';

function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={`px-4 py-2 rounded ${props.className}`}>
      {props.children}
    </button>
  );
}

export default function SaveButton() {
  const { lines, activeLine, wordCount, letterCount } = useTypewriterStore();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Kombiniere alle Zeilen und die aktive Zeile zu einem vollständigen Text
  const fullText = [...lines, activeLine].join('\n');

  // Funktion zum Speichern des Textes in der Datenbank
  const saveToDatabase = async () => {
    try {
      const response = await fetch('/api/typewriter/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
        body: JSON.stringify({
          text: fullText,
          wordCount,
          letterCount,
        }),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Speichern des Textes');
      }

      const data = await response.json();
      console.log('Text erfolgreich gespeichert:', data);
      alert('Text erfolgreich gespeichert!');
    } catch (error) {
      console.error('Fehler:', error);
      alert(
        'Fehler beim Speichern des Textes. Der Text wurde lokal gespeichert.',
      );
    }
  };

  // Online/Offline-Status überwachen
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex gap-2">
      <Button
        onClick={async () => {
          if (isOnline) {
            await saveToDatabase();
          } else {
            alert('Du bist offline. Der Text wurde lokal gespeichert.');
          }
        }}
        className="bg-green-600 hover:bg-green-500"
      >
        Text speichern
      </Button>
    </div>
  );
}
