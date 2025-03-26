// app/typewriter/page.tsx
import { SessionView } from '@/components/SessionView/SessionView';

export const metadata = {
  title: 'Typewriter - Schreibmaschinen-Simulation',
  description: 'Eine Next.js-basierte Schreibmaschinen-Simulation',
};

export default function TypewriterPage() {
  return (
    <div className="h-screen w-full">
      <SessionView />
    </div>
  );
}
