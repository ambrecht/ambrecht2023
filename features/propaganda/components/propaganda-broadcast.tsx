'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';

import { usePublicLiveStream } from '@/features/live/hooks/use-public-live-stream';
import type {
  ConnectionStatus,
  PublicLiveState,
} from '@/features/live/lib/contract';

import styles from '../propaganda.module.css';
import { PropagandaOffline } from './propaganda-offline';
import { PropagandaTicker } from './propaganda-ticker';

type PropagandaBroadcastProps = {
  initialState: PublicLiveState;
  initialConnectionStatus: ConnectionStatus;
  initialError: string | null;
  streamUrl: string;
};

const timeFormatter = new Intl.DateTimeFormat('de-DE', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const connectionLabel: Record<ConnectionStatus, string> = {
  connecting: 'SIGNALAUFBAU',
  connected: 'SIGNAL STABIL',
  reconnecting: 'SIGNALSTOERUNG',
  error: 'SIGNAL FEHLT',
};

function useBroadcastViewportLock() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previous = {
      htmlHeight: html.style.height,
      htmlOverflow: html.style.overflow,
      htmlOverscrollBehavior: html.style.overscrollBehavior,
      bodyHeight: body.style.height,
      bodyOverflow: body.style.overflow,
      bodyOverscrollBehavior: body.style.overscrollBehavior,
    };

    html.style.height = '100%';
    html.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'none';
    body.style.height = '100%';
    body.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'none';

    return () => {
      html.style.height = previous.htmlHeight;
      html.style.overflow = previous.htmlOverflow;
      html.style.overscrollBehavior = previous.htmlOverscrollBehavior;
      body.style.height = previous.bodyHeight;
      body.style.overflow = previous.bodyOverflow;
      body.style.overscrollBehavior = previous.bodyOverscrollBehavior;
    };
  }, []);
}

function useClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return now;
}

function getCurrentTickerText(state: PublicLiveState) {
  if (state.status !== 'live') return '';

  return state.activeDraft.length > 0
    ? state.activeDraft
    : state.lines[state.lines.length - 1]?.text ?? '';
}

function getLiveProgramLabel(state: PublicLiveState) {
  if (state.status !== 'live') return 'SENDESCHLUSS';
  if (state.activeDraft.length > 0) return 'TEXT WIRD GESCHRIEBEN';
  if (state.lines.length > 0) return 'ZEILE FESTGESCHRIEBEN';
  return 'DER AUTOR SCHWEIGT NOCH';
}

function getTickerMode(state: PublicLiveState) {
  if (state.status !== 'live') return 'system';
  return getCurrentTickerText(state).length > 0 ? 'writer' : 'system';
}

export function PropagandaBroadcast({
  initialState,
  initialConnectionStatus,
  initialError,
  streamUrl,
}: PropagandaBroadcastProps) {
  const { broadcastState, connectionStatus, error, lastAppliedEvent } =
    usePublicLiveStream({
      initialState,
      initialConnectionStatus,
      initialError,
      streamUrl,
    });
  const now = useClock();

  useBroadcastViewportLock();

  const currentTickerText = useMemo(
    () => getCurrentTickerText(broadcastState),
    [broadcastState],
  );
  const liveEmpty =
    broadcastState.status === 'live' && currentTickerText.length === 0;
  const tickerText =
    broadcastState.status === 'live'
      ? currentTickerText || 'UEBERTRAGUNG LAEUFT'
      : broadcastState.nextLiveAt
        ? 'NAECHSTE UEBERTRAGUNG ANGEKUENDIGT'
        : 'SENDESCHLUSS';
  const tickerMode = getTickerMode(broadcastState);
  const viewerCount =
    broadcastState.status === 'live' ? broadcastState.viewerCount : 0;
  const scheduleText =
    broadcastState.status === 'offline' && broadcastState.nextLiveAt
      ? 'SENDEPLAN AKTIV'
      : 'KEIN SENDEPLAN';
  const isLiveStarted = lastAppliedEvent?.type === 'live.started';
  const isLiveEnded = lastAppliedEvent?.type === 'live.ended';
  const rootStyle = {
    '--status-accent':
      broadcastState.status === 'live' ? '#b20d18' : '#8b8578',
  } as CSSProperties;

  return (
    <main
      className={styles.root}
      data-status={broadcastState.status}
      data-last-event={
        isLiveStarted ? 'live-started' : isLiveEnded ? 'live-ended' : undefined
      }
      style={rootStyle}
    >
      <div className={styles.scanlines} aria-hidden="true" />
      <div className={styles.noise} aria-hidden="true" />

      <header className={styles.header}>
        <div className={styles.brandBlock}>
          <span className={styles.brandKicker}>AMBRECHT</span>
          <span className={styles.brand}>PROPAGANDA</span>
        </div>
        <div className={styles.headerMeta}>
          <span className={styles.signal}>{connectionLabel[connectionStatus]}</span>
          <span className={styles.liveBadge}>
            <span className={styles.liveDot} aria-hidden="true" />
            {broadcastState.status === 'live' ? 'LIVE' : 'OFF AIR'}
          </span>
        </div>
      </header>

      <section className={styles.stage} aria-label="Aktueller Sendestatus">
        {broadcastState.status === 'live' ? (
          <>
            <div className={styles.transmissionLabel}>SONDERMELDUNG</div>
            <h1 className={styles.programLabel}>{getLiveProgramLabel(broadcastState)}</h1>
            <p className={styles.programSubline}>
              {liveEmpty
                ? 'SYSTEMTEXT, KEIN AUTORENTEXT'
                : tickerMode === 'writer'
                  ? 'GEGENWART DES TEXTES'
                  : 'KANALBEREITSCHAFT'}
            </p>
          </>
        ) : (
          <PropagandaOffline state={broadcastState} now={now} />
        )}
      </section>

      <PropagandaTicker text={tickerText} mode={tickerMode} />

      <footer className={styles.footer}>
        <span>LIVE-UEBERTRAGUNG</span>
        <span>{scheduleText}</span>
        <span>
          {broadcastState.status === 'live'
            ? `${viewerCount} EMPFANGSGERAETE VERBUNDEN`
            : '0 EMPFANGSGERAETE'}
        </span>
        <time>{now ? timeFormatter.format(now) : '--:--:--'}</time>
      </footer>

      {error ? <div className={styles.errorStrip}>{error}</div> : null}
    </main>
  );
}
