'use client';
import { useState } from 'react';
import artistsData from './artists.json';

// TypeScript type für die Künstlerdaten
type ArtistsData = {
  [key: string]: string[];
};

export default function PromptGenerator() {
  const [basePrompt, setBasePrompt] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [usedArtists, setUsedArtists] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>('');

  const addRandomArtist = () => {
    let availableArtists: string[] = [];

    if (selectedStyle) {
      // Wenn ein Stil ausgewählt ist, nur Künstler aus diesem Stil verwenden
      availableArtists = (artistsData as ArtistsData)[selectedStyle].filter(
        (artist) => !usedArtists.includes(artist),
      );
    } else {
      // Sonst alle Künstler verwenden
      availableArtists = Object.values(artistsData as ArtistsData)
        .flat()
        .filter((artist) => !usedArtists.includes(artist));
    }

    if (availableArtists.length === 0) {
      console.log('Alle verfügbaren Künstler wurden bereits verwendet!');
      return;
    }

    const randomArtist =
      availableArtists[Math.floor(Math.random() * availableArtists.length)];

    const newPrompt = currentPrompt
      ? `${currentPrompt}, ${randomArtist}`
      : `${basePrompt} ${randomArtist}`;

    setCurrentPrompt(newPrompt);
    setUsedArtists([...usedArtists, randomArtist]);
  };

  const resetPrompt = () => {
    setCurrentPrompt(basePrompt);
    setUsedArtists([]);
    setSelectedStyle('');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
      <div style={{ marginBottom: '16px' }}>
        <label
          htmlFor="prompt"
          style={{ display: 'block', marginBottom: '8px' }}
        >
          Basis-Prompt:
        </label>
        <input
          id="prompt"
          value={basePrompt}
          onChange={(e) => {
            setBasePrompt(e.target.value);
            setCurrentPrompt(e.target.value);
          }}
          placeholder="z.B. a woman in leather jacket"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label
          htmlFor="style-select"
          style={{ display: 'block', marginBottom: '8px' }}
        >
          Kunststil (optional):
        </label>
        <select
          id="style-select"
          value={selectedStyle}
          onChange={(e) => setSelectedStyle(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        >
          <option value="">Alle Stile</option>
          {Object.keys(artistsData).map((style) => (
            <option key={style} value={style}>
              {style.charAt(0).toUpperCase() + style.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <button
          onClick={addRandomArtist}
          disabled={!basePrompt}
          style={{
            flex: '1',
            padding: '8px 16px',
            backgroundColor: '#007BFF',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Zufälligen Künstler hinzufügen
        </button>
        <button
          onClick={resetPrompt}
          style={{
            flex: '1',
            padding: '8px 16px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Zurücksetzen
        </button>
      </div>

      {currentPrompt && (
        <div
          style={{
            padding: '16px',
            backgroundColor: '#f1f3f5',
            marginTop: '16px',
            borderRadius: '4px',
          }}
        >
          <label>Generierter Prompt:</label>
          <p style={{ marginTop: '8px', fontSize: '18px' }}>{currentPrompt}</p>
        </div>
      )}

      {usedArtists.length > 0 && (
        <div
          style={{
            padding: '16px',
            backgroundColor: '#f1f3f5',
            marginTop: '16px',
            borderRadius: '4px',
          }}
        >
          <label>Verwendete Künstler ({usedArtists.length}):</label>
          <ul
            style={{
              marginTop: '8px',
              listStyleType: 'disc',
              paddingLeft: '20px',
            }}
          >
            {usedArtists.map((artist, index) => (
              <li key={index}>{artist}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
