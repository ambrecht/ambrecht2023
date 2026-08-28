import type { PublicLiveState } from '@/features/live/lib/contract';

import styles from '../propaganda.module.css';

type PropagandaOfflineProps = {
  state: Extract<PublicLiveState, { status: 'offline' }>;
  now: Date | null;
};

const dayFormatter = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
});

const timeFormatter = new Intl.DateTimeFormat('de-DE', {
  hour: '2-digit',
  minute: '2-digit',
});

function formatSchedule(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'TERMIN UNLESBAR';

  return `${dayFormatter.format(date)} / ${timeFormatter.format(date)}`;
}

function formatCountdown(value: string, now: Date | null) {
  if (!now) return 'ZEITABGLEICH LAEUFT';

  const target = new Date(value).getTime();
  if (Number.isNaN(target)) return 'ZEITABGLEICH FEHLGESCHLAGEN';

  const distanceMs = target - now.getTime();
  if (distanceMs <= 0) return 'START NUR BEI ECHTEM LIVE-SIGNAL';

  const totalMinutes = Math.floor(distanceMs / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}T ${hours}H ${minutes}M`;
  if (hours > 0) return `${hours}H ${minutes}M`;
  return `${Math.max(1, minutes)}M`;
}

export function PropagandaOffline({ state, now }: PropagandaOfflineProps) {
  if (!state.nextLiveAt) {
    return (
      <>
        <div className={styles.transmissionLabel}>SENDESCHLUSS</div>
        <h1 className={styles.programLabel}>KEINE UEBERTRAGUNG</h1>
        <p className={styles.programSubline}>
          DIE NAECHSTE SENDUNG IST NOCH NICHT ANGEKUENDIGT.
        </p>
      </>
    );
  }

  return (
    <>
      <div className={styles.transmissionLabel}>NAECHSTE ANGEKUENDIGTE SENDUNG</div>
      <h1 className={`${styles.programLabel} ${styles.scheduleLabel}`}>
        {formatSchedule(state.nextLiveAt)}
      </h1>
      <p className={styles.programSubline}>
        UNVERBINDLICHE SENDEPLANUNG / {formatCountdown(state.nextLiveAt, now)}
      </p>
    </>
  );
}
