// app/page.tsx
import React from 'react';
import { SessionProvider } from '@/lib/context/SessionContext';
import Editor from '@/components/typewriter/editor';
import SessionList from '@/components/typewriter/sessions';

/**
 * HomePage-Komponente, die den SessionProvider umschließt, um den Editor
 * in einer Schreibmaschinen-App bereitzustellen.
 *
 * @returns {JSX.Element} Die gerenderte Startseite.
 */
export default function HomePage() {
  return (
    <SessionProvider>
      <main className="min-h-screen bg-gray-50">
        <Editor />
        <SessionList></SessionList>
      </main>
    </SessionProvider>
  );
}
