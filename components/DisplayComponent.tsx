// Datei: components/DisplayComponent.tsx
'use client';
import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';

interface EventData {
  text: string;
}

export default function DisplayComponent() {
  const [displayText, setDisplayText] = useState<string>('');

  useEffect(() => {
    // Initialisieren des Pusher‑Clients mit Ihrem öffentlichen App‑Key und Cluster
    const pusher = new Pusher('app-key', {
      cluster: 'cluster-region',
    });
    const channel = pusher.subscribe('event-channel');

    channel.bind('event-name', (data: EventData) => {
      setDisplayText(data.text);
    });

    return () => {
      pusher.disconnect();
    };
  }, []);

  return <div>{displayText}</div>;
}
