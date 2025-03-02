'use client';

import React, { useEffect, useState } from 'react';
import { Headline2, Paragraph } from '@/styles/index';
import styled from 'styled-components';

const SlaveContainer = styled.div`
  border: 1px solid #aaa;
  background-color: #fff;
  padding: 1rem;
  margin: 2rem 0;
  border-radius: 4px;
`;

const DisplayArea = styled.div`
  min-height: 100px;
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 1rem;
`;

export const TypeReaderSlave: React.FC = () => {
  const [text, setText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // 1) Initialen Text laden
  useEffect(() => {
    const fetchText = async () => {
      try {
        const response = await fetch('/api/read-text');
        if (response.ok) {
          const data = await response.json();
          setText(data.typedText || '');
        } else {
          setErrorMessage('Fehler beim Laden des Textes.');
        }
      } catch (err) {
        console.error('Slave fetch error:', err);
        setErrorMessage('Netzwerkfehler beim Laden des Textes.');
      }
    };
    fetchText();
  }, []);

  // 2) Live-Updates via SSE
  useEffect(() => {
    const evtSource = new EventSource('/api/sse');

    evtSource.addEventListener('update', (evt: any) => {
      try {
        const parsed = JSON.parse(evt.data);
        if (parsed?.text !== undefined) {
          setText(parsed.text);
        }
      } catch (err) {
        console.error('Fehler bei SSE-Ereignis:', err);
      }
    });

    evtSource.onerror = (err) => {
      console.error('SSE-Verbindung fehlgeschlagen:', err);
      setErrorMessage('Live-Update-Stream unterbrochen.');
    };

    return () => {
      evtSource.close();
    };
  }, []);

  return (
    <SlaveContainer>
      <Headline2>Slave-Lesebereich</Headline2>
      <DisplayArea>{text}</DisplayArea>
      {errorMessage && (
        <Paragraph style={{ color: 'red', marginTop: '1rem' }}>
          {errorMessage}
        </Paragraph>
      )}
    </SlaveContainer>
  );
};
