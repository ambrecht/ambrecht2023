// app/typewriter/page.tsx
import Typewriter from './typewriter';

export const metadata = {
  title: 'Typewriter - Schreibmaschinen-Simulation',
  description: 'Eine Next.js-basierte Schreibmaschinen-Simulation',
};

export default function TypewriterPage() {
  return (
    <div className="h-screen w-full">
      <Typewriter />
    </div>
  );
}
