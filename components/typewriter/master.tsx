'use client';

import React, { useState, useEffect } from 'react';
// Beispielweise aus Ihrem Projekt, analog zu den Stilen in datenschutz/page.tsx
import { Headline2, Paragraph } from '@/styles/index';
import styled from 'styled-components';

const MasterContainer = styled.div`
  border: 2px solid #888;
  padding: 1rem;
  margin: 2rem 0;
  border-radius: 8px;
  background-color: #f9fafb; /* eine helle Hintergrundfarbe */
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  min-height: 140px;
  margin-top: 1rem;
  font-family: inherit;
  font-size: 1rem;
  border: 1px solid #ccc;
  padding: 0.5rem;
  resize: vertical;
  &:focus {
    outline: none;
    border-color: #666;
  }
`;

const StyledLabel = styled.label`
  margin-right: 0.5rem;
`;

interface TypewriterMasterProps {
  writerId: string; // Eindeutige ID pro Session
}

export const TypewriterMaster: React.FC<TypewriterMasterProps> = ({
  writerId,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [text, setText] = useState('');
  const [isMaster, setIsMaster] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // PIN-Check: /api/lock
  const handleBecomeMaster = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await fetch('/api/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput, writerId }),
      });
      const data = await response.json();

      if (response.ok && data?.success && data?.role === 'master') {
        setIsMaster(true);

        // Optional den bereits vorhandenen Text laden
        const readResp = await fetch('/api/read-text');
        if (readResp.ok) {
          const readData = await readResp.json();
          if (readData?.typedText) {
            setText(readData.typedText);
          }
        }
      } else {
        setErrorMessage(data?.error || 'Konnte Master-Status nicht erlangen.');
        setIsMaster(false);
      }
    } catch (err) {
      console.error('Master-Error:', err);
      setErrorMessage('Fehler beim Beantragen des Master-Status.');
    }
  };

  // Änderungen im Textfeld -> lokal im State ablegen
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  // Text-Sync an /api/typing (Debounce 500ms)
  useEffect(() => {
    if (!isMaster) return;

    const timer = setTimeout(() => {
      sendTextUpdate(text);
    }, 500);

    return () => clearTimeout(timer);
  }, [text, isMaster]);

  async function sendTextUpdate(currentText: string) {
    try {
      const response = await fetch('/api/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentText, writerId }),
      });
      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data?.error || 'Fehler beim Schreiben.');
        if (data?.masterText) {
          setText(data.masterText);
        }
        setIsMaster(false); // Master-Status verloren
      }
    } catch (err) {
      console.error('sendTextUpdate Fehler:', err);
      setErrorMessage('Netzwerkfehler beim Aktualisieren des Textes.');
    }
  }

  // Finalisieren: an /api/finalize -> POST { typedText, writerId }
  const handleFinalize = async () => {
    setErrorMessage('');
    try {
      const response = await fetch('/api/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ typedText: text, writerId }),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data?.error || 'Fehler beim Finalisieren.');
      } else {
        // Session finalisiert
        setIsMaster(false);
        setText('');
      }
    } catch (err) {
      console.error('Fehler beim Finalisieren:', err);
      setErrorMessage('Netzwerkfehler beim Finalisieren.');
    }
  };

  return (
    <MasterContainer>
      <Headline2>Master-Bereich</Headline2>

      {/* Falls man noch kein Master ist: PIN eingeben */}
      {!isMaster ? (
        <form onSubmit={handleBecomeMaster}>
          <Paragraph>
            <StyledLabel>PIN eingeben:</StyledLabel>
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
            />
            <button type="submit" style={{ marginLeft: '0.5rem' }}>
              Master werden
            </button>
          </Paragraph>
        </form>
      ) : (
        <>
          <Paragraph>
            Sie sind aktuell Master und können den Text bearbeiten:
          </Paragraph>
          <StyledTextarea value={text} onChange={handleTextChange} />
          <button onClick={handleFinalize} style={{ marginTop: '1rem' }}>
            Finalisieren
          </button>
        </>
      )}

      {errorMessage && (
        <Paragraph style={{ color: 'red', marginTop: '1rem' }}>
          {errorMessage}
        </Paragraph>
      )}
    </MasterContainer>
  );
};
