import { SessionActivityOverview } from '@/components/SessionView/SessionActivityOverview';

export function SessionV2Activity() {
  return (
    <section>
      <div className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-[#fdfaf3] sm:text-4xl">
          Aktivitaet
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#aa9e8d]">
          Wie die Schreibarbeit ueber die Zeit verteilt ist. Die Daten kommen aus derselben
          bestehenden Schreibaktivitaets-API wie bisher.
        </p>
      </div>
      <SessionActivityOverview />
    </section>
  );
}

