'use client';

import { useEffect, useState } from 'react';
import { useTypewriterStore } from './store';

function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded transition-colors ${props.className}`}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
}

export default function SaveButton() {
  const { lines, activeLine, wordCount, letterCount } = useTypewriterStore();
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fullText = [...lines, activeLine].join('\n');

  useEffect(() => {
    // Nur im Browser ausführen
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);

      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const saveToDatabase = async () => {
    if (!isOnline || isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        'https://api.ambrecht.de/api/typewriter/save',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
          },
          body: JSON.stringify({
            text: fullText,
            wordCount,
            letterCount,
          }),
          credentials: 'include', // Falls Cookies verwendet werden
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Erfolgreich gespeichert:', data);
      alert('Text erfolgreich gespeichert!');
    } catch (error) {
      console.error('Speicherfehler:', error);
      alert('Fehler beim Speichern. Der Text wurde lokal gesichert.');
      // Hier könnten Sie den Text im localStorage speichern
      localStorage.setItem('typewriter_backup', fullText);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={saveToDatabase}
        disabled={!isOnline || isLoading}
        className={`bg-green-600 hover:bg-green-500 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? 'Wird gespeichert...' : 'Text speichern'}
      </Button>

      {!isOnline && (
        <div className="text-red-500 text-sm mt-1">
          Offline - nur lokale Speicherung verfügbar
        </div>
      )}
    </div>
  );
}
