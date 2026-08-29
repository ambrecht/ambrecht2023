'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { usePublicLiveStream } from '../hooks/use-public-live-stream';
import {
  buildLiveBookViewModel,
  countViewModelWords,
  getFragmentSeparator,
  type LiveBookViewModel,
  type ReaderParagraph,
} from '../lib/build-live-book-view-model';
import type { ConnectionStatus, PublicLiveState } from '../lib/contract';
import type { OfflineHistoryItem } from '../lib/offline-history';

import styles from './live-book-reader.module.css';

type LiveBookReaderProps = {
  initialState: PublicLiveState;
  initialConnectionStatus: ConnectionStatus;
  initialError: string | null;
  streamUrl: string;
  offlineHistory?: OfflineHistoryItem[];
  contactLinks?: Array<{
    href: string;
    label: string;
  }>;
};

type ReaderMode = 'FOLLOWING_LIVE' | 'READING_HISTORY';
type NotificationState =
  | 'idle'
  | 'requesting'
  | 'armed'
  | 'denied'
  | 'unsupported';
type SessionTextState = {
  text: string | null;
  loading: boolean;
  error: string | null;
};

const userScrollThreshold = 8;
const notifiedBroadcastStorageKey = 'ambrecht-live-reader-notified-broadcast';
const traceMarkerCounts = [3, 5, 7, 3];

const scheduleDayFormatter = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
});

const scheduleTimeFormatter = new Intl.DateTimeFormat('de-DE', {
  hour: '2-digit',
  minute: '2-digit',
});

const scheduleDateTimeFormatter = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});

const historyDateFormatter = new Intl.DateTimeFormat('de-DE', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function formatViewerCount(count: number) {
  return count === 1 ? '1 liest mit' : `${count} lesen mit`;
}

function formatUnseenWords(count: number) {
  return '↓ zurück zu live';
}

function getScheduledDate(scheduledAt: string | null) {
  if (!scheduledAt) return null;

  const date = new Date(scheduledAt);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatScheduleLabel(scheduledAt: string) {
  const date = getScheduledDate(scheduledAt);
  if (!date) return 'termin unlesbar';

  return `${scheduleDayFormatter.format(date)} · ${scheduleTimeFormatter.format(
    date,
  )}`;
}

function formatTimerParts(distanceMs: number) {
  const totalSeconds = Math.max(0, Math.floor(distanceMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, '0'))
    .join(' : ');
}

function formatTimerLabel(distanceMs: number) {
  const totalMinutes = Math.max(0, Math.ceil(distanceMs / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `Noch ${hours} Stunden und ${minutes} Minuten bis zur Live-Session`;
  }

  return `Noch ${minutes} Minuten bis zur Live-Session`;
}

function formatHistoryDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return historyDateFormatter.format(date);
}

function renderParagraph(paragraph: ReaderParagraph) {
  let previousText: string | null = null;

  return paragraph.fragments.map((fragment) => {
    const separator = getFragmentSeparator(previousText, fragment.text);
    previousText = fragment.text;

    return (
      <span key={fragment.id} className={styles.fragment}>
        {separator}
        {fragment.text}
      </span>
    );
  });
}

export function LiveBookReader({
  initialState,
  initialConnectionStatus,
  initialError,
  streamUrl,
  offlineHistory = [],
  contactLinks = [],
}: LiveBookReaderProps) {
  const { broadcastState, connectionStatus, error, lastAppliedEvent } =
    usePublicLiveStream({
    initialState,
    initialConnectionStatus,
    initialError,
    streamUrl,
  });

  const storyStartRef = useRef<HTMLDivElement | null>(null);
  const liveEndRef = useRef<HTMLDivElement | null>(null);
  const liveBoundaryRef = useRef<HTMLElement | null>(null);
  const modeRef = useRef<ReaderMode>('FOLLOWING_LIVE');
  const previousScrollYRef = useRef(0);
  const didInitialPositionRef = useRef(false);
  const programmaticScrollRef = useRef(false);
  const followFrameRef = useRef<number | null>(null);
  const programmaticTimerRef = useRef<number | null>(null);
  const historyBaselineWordCountRef = useRef(0);

  const [mode, setMode] = useState<ReaderMode>('FOLLOWING_LIVE');
  const [unseenWordCount, setUnseenWordCount] = useState(0);
  const [now, setNow] = useState<number | null>(null);
  const [notificationState, setNotificationState] =
    useState<NotificationState>('idle');
  const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(
    null,
  );
  const [traceCount, setTraceCount] = useState(18);
  const [tracePopoverOpen, setTracePopoverOpen] = useState(false);
  const [traceAnnouncement, setTraceAnnouncement] = useState('');

  const viewModel = useMemo(
    () => buildLiveBookViewModel(broadcastState),
    [broadcastState],
  );

  // Domain state: this decides whether a live session actually exists.
  // ConnectionStatus only describes the SSE transport and must not be used
  // as a replacement for the product state.
  const isLive = broadcastState.status === 'live';
  const scheduledAt = broadcastState.nextLiveAt;

  const setReaderMode = useCallback((nextMode: ReaderMode) => {
    modeRef.current = nextMode;
    setMode(nextMode);
  }, []);

  const markProgrammaticScroll = useCallback(() => {
    programmaticScrollRef.current = true;

    if (programmaticTimerRef.current !== null) {
      window.clearTimeout(programmaticTimerRef.current);
    }

    programmaticTimerRef.current = window.setTimeout(() => {
      programmaticScrollRef.current = false;
      previousScrollYRef.current = window.scrollY;
      programmaticTimerRef.current = null;
    }, 180);
  }, []);

  const setHistoryBaseline = useCallback((model: LiveBookViewModel) => {
    historyBaselineWordCountRef.current = countViewModelWords(model);
    setUnseenWordCount(0);
  }, []);

  const enterReadingHistory = useCallback(() => {
    if (modeRef.current === 'READING_HISTORY') return;

    setHistoryBaseline(viewModel);
    setReaderMode('READING_HISTORY');
  }, [setHistoryBaseline, setReaderMode, viewModel]);

  const scheduleFollowLive = useCallback(() => {
    if (modeRef.current !== 'FOLLOWING_LIVE') return;

    if (followFrameRef.current !== null) {
      window.cancelAnimationFrame(followFrameRef.current);
    }

    followFrameRef.current = window.requestAnimationFrame(() => {
      followFrameRef.current = null;

      liveEndRef.current?.scrollIntoView({
        behavior: 'auto',
        block: 'end',
      });

      previousScrollYRef.current = window.scrollY;
    });
  }, []);

  const scrollToInitialLivePosition = useCallback(() => {
    if (didInitialPositionRef.current) return;

    didInitialPositionRef.current = true;
    markProgrammaticScroll();

    window.requestAnimationFrame(() => {
      liveBoundaryRef.current?.scrollIntoView({
        behavior: 'auto',
        block: 'center',
      });

      previousScrollYRef.current = window.scrollY;
    });
  }, [markProgrammaticScroll]);

  const scrollToStart = useCallback(() => {
    enterReadingHistory();
    markProgrammaticScroll();

    storyStartRef.current?.scrollIntoView({
      block: 'start',
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }, [enterReadingHistory, markProgrammaticScroll]);

  const returnToLive = useCallback(() => {
    markProgrammaticScroll();
    setReaderMode('FOLLOWING_LIVE');
    setUnseenWordCount(0);

    liveBoundaryRef.current?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'center',
    });
  }, [markProgrammaticScroll, setReaderMode]);

  const requestNotification = useCallback(async () => {
    if (!('Notification' in window)) {
      setNotificationState('unsupported');
      return;
    }

    if (Notification.permission === 'denied') {
      setNotificationState('denied');
      return;
    }

    setNotificationState('requesting');
    const permission =
      Notification.permission === 'granted'
        ? 'granted'
        : await Notification.requestPermission();

    setNotificationState(permission === 'granted' ? 'armed' : 'denied');
  }, []);

  const disarmNotification = useCallback(() => {
    setNotificationState('idle');
  }, []);

  const toggleExpandedHistory = useCallback((id: number) => {
    setExpandedHistoryId((currentId) => (currentId === id ? null : id));
  }, []);

  const closeTracePopover = useCallback(() => {
    setTracePopoverOpen(false);
  }, []);

  const leaveTrace = useCallback((trace: string) => {
    setTraceCount((current) => current + 1);
    setTracePopoverOpen(false);
    setTraceAnnouncement(`Deine Spur (${trace}) wurde hinzugefuegt.`);
  }, []);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    return () => {
      if (followFrameRef.current !== null) {
        window.cancelAnimationFrame(followFrameRef.current);
      }

      if (programmaticTimerRef.current !== null) {
        window.clearTimeout(programmaticTimerRef.current);
      }
    };
  }, []);

  // A finished session must reset the transient reader state. This also makes
  // a later offline -> live transition position the new session correctly.
  useEffect(() => {
    if (isLive) return;

    didInitialPositionRef.current = false;
    historyBaselineWordCountRef.current = 0;
    setReaderMode('FOLLOWING_LIVE');
    setUnseenWordCount(0);
  }, [isLive, setReaderMode]);

  useEffect(() => {
    if (isLive || !scheduledAt) {
      setNow(null);
      return;
    }

    const tick = () => setNow(Date.now());
    tick();
    const interval = window.setInterval(tick, 1000);

    return () => window.clearInterval(interval);
  }, [isLive, scheduledAt]);

  useEffect(() => {
    if (!('Notification' in window)) {
      setNotificationState('unsupported');
      return;
    }

    if (Notification.permission === 'denied') {
      setNotificationState('denied');
    }
  }, []);

  useEffect(() => {
    if (
      notificationState !== 'armed' ||
      lastAppliedEvent?.type !== 'live.started' ||
      broadcastState.status !== 'live' ||
      !('Notification' in window) ||
      Notification.permission !== 'granted'
    ) {
      return;
    }

    try {
      if (
        window.localStorage.getItem(notifiedBroadcastStorageKey) ===
        broadcastState.broadcastId
      ) {
        return;
      }
      window.localStorage.setItem(
        notifiedBroadcastStorageKey,
        broadcastState.broadcastId,
      );
    } catch {
      // Notification can still be shown for this tab.
    }

    const notification = new Notification('Ambrecht ist live', {
      body: 'Die Live-Session hat begonnen.',
      icon: '/favicon.ico',
      tag: `ambrecht-live-${broadcastState.broadcastId}`,
      renotify: true,
    });

    notification.onclick = () => {
      window.focus();
    };
  }, [broadcastState, lastAppliedEvent, notificationState]);

  useEffect(() => {
    if (!isLive) return;

    scrollToInitialLivePosition();
  }, [isLive, scrollToInitialLivePosition]);

  useEffect(() => {
    if (!isLive) return;

    if (modeRef.current === 'FOLLOWING_LIVE') {
      setUnseenWordCount(0);
      scheduleFollowLive();
      return;
    }

    setUnseenWordCount(
      Math.max(
        0,
        countViewModelWords(viewModel) - historyBaselineWordCountRef.current,
      ),
    );
  }, [isLive, scheduleFollowLive, viewModel]);

  useEffect(() => {
    const handleScroll = () => {
      if (!isLive || programmaticScrollRef.current) return;

      const currentY = window.scrollY;

      if (
        modeRef.current === 'FOLLOWING_LIVE' &&
        currentY < previousScrollYRef.current - userScrollThreshold
      ) {
        enterReadingHistory();
      }

      previousScrollYRef.current = currentY;
    };

    previousScrollYRef.current = window.scrollY;
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [enterReadingHistory, isLive]);

  useEffect(() => {
    if (!isLive) return;

    const liveEnd = liveEndRef.current;
    if (!liveEnd) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || programmaticScrollRef.current) return;

        setReaderMode('FOLLOWING_LIVE');
        setUnseenWordCount(0);
        previousScrollYRef.current = window.scrollY;
      },
      {
        threshold: 0.8,
      },
    );

    observer.observe(liveEnd);

    return () => observer.disconnect();
  }, [isLive, setReaderMode, viewModel.revisionKey]);

  useEffect(() => {
    if (!tracePopoverOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setTracePopoverOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [tracePopoverOpen]);

  const showConnectionError =
    !isLive && connectionStatus === 'error' && Boolean(error);

  return (
    <main
      className={styles.reader}
      data-live-book-reader
      data-reader-mode={mode}
    >
      <header className={styles.readerHeader}>
        <div className={styles.livePresence}>
          {isLive ? (
            <>
              <span className={styles.liveDot} aria-hidden="true" />
              <span>
                live · {viewModel.authorLabel}
                {viewModel.activeReaders !== null
                  ? ` · ${formatViewerCount(viewModel.activeReaders)}`
                  : ''}
              </span>
            </>
          ) : (
            <span>gerade nicht live</span>
          )}
        </div>

        {isLive ? (
          <nav className={styles.liveNav} aria-label="Live-Navigation">
            <button
              className={styles.readerButton}
              type="button"
              aria-expanded={tracePopoverOpen}
              aria-controls="trace-popover"
              onClick={() => setTracePopoverOpen((open) => !open)}
            >
              Spuren · {traceCount}
            </button>
            <button
              className={styles.readerButton}
              type="button"
              onClick={scrollToStart}
            >
              Anfang
            </button>
          </nav>
        ) : null}
      </header>

      {isLive ? (
        <TracePopover
          open={tracePopoverOpen}
          traceCount={traceCount}
          onClose={closeTracePopover}
          onLeaveTrace={leaveTrace}
        />
      ) : null}

      <article className={styles.story} aria-label="Live-Manuskript">
        <div
          ref={storyStartRef}
          className={styles.storyStart}
          aria-hidden="true"
        />

        {!isLive ? (
          <OfflineLanding
            contactLinks={contactLinks}
            error={showConnectionError ? error : null}
            notificationState={notificationState}
            now={now}
            offlineHistory={offlineHistory}
            scheduledAt={scheduledAt}
            expandedHistoryId={expandedHistoryId}
            onDisableNotification={disarmNotification}
            onToggleHistory={toggleExpandedHistory}
            onRequestNotification={requestNotification}
          />
        ) : (
          <>
            {error ? <p className={styles.error}>{error}</p> : null}

            <header className={styles.liveIntro} id="anfang">
              <p className={styles.liveIntroKicker}>Live-Manuskript · heute</p>
              <h1 className={styles.title}>
                {viewModel.title ?? (
                  <>
                    Während du liest,
                    <br />
                    entsteht der Text weiter.
                  </>
                )}
              </h1>
              <span className={styles.liveIntroOrnament} aria-hidden="true">
                · · ·
              </span>
            </header>

            {viewModel.historicalParagraphs.length > 0 ? (
              <div
                className={`${styles.historicalManuscript} ${
                  tracePopoverOpen ? styles.tracesEmphasized : ''
                }`}
                lang="de"
              >
                {viewModel.historicalParagraphs.map((paragraph, index) => (
                  <p
                    key={paragraph.id}
                    className={`${styles.historicalParagraph} ${
                      index === 0 ? styles.openingParagraph : ''
                    }`}
                  >
                    {renderParagraph(paragraph)}
                    <TraceMarker
                      count={traceMarkerCounts[index % traceMarkerCounts.length]}
                      onOpen={() => setTracePopoverOpen(true)}
                    />
                  </p>
                ))}
              </div>
            ) : null}

            <section
              ref={liveBoundaryRef}
              className={styles.liveSection}
              aria-label="Aktuell entstehender Text"
            >
              <div className={styles.liveRule} aria-hidden="true" />
              <div className={styles.liveLabel}>live · jetzt</div>

              {viewModel.liveText.length > 0 ? (
                <p className={styles.livePassage}>
                  {viewModel.liveText}
                  <span className={styles.cursor} aria-hidden="true" />
                </p>
              ) : null}

              <div ref={liveEndRef} aria-hidden="true" />
            </section>
          </>
        )}
      </article>

      {isLive && mode === 'READING_HISTORY' ? (
        <button
          className={styles.returnToLive}
          type="button"
          onClick={returnToLive}
        >
          {formatUnseenWords(unseenWordCount)}
        </button>
      ) : null}

      {isLive && traceAnnouncement ? (
        <div className={styles.srOnly} role="status" aria-live="polite">
          {traceAnnouncement}
        </div>
      ) : null}
    </main>
  );
}

function TraceMarker({
  count,
  onOpen,
}: {
  count: number;
  onOpen: () => void;
}) {
  return (
    <button
      className={styles.traceMark}
      type="button"
      aria-label={`${count} Spuren an diesem Absatz`}
      onClick={onOpen}
    >
      {count}
    </button>
  );
}

function TracePopover({
  open,
  traceCount,
  onClose,
  onLeaveTrace,
}: {
  open: boolean;
  traceCount: number;
  onClose: () => void;
  onLeaveTrace: (trace: string) => void;
}) {
  return (
    <aside
      id="trace-popover"
      className={`${styles.tracePopover} ${open ? styles.tracePopoverOpen : ''}`}
      aria-labelledby="trace-title"
      hidden={!open}
    >
      <h2 id="trace-title">Spuren im Text</h2>
      <p>
        Leise Resonanzen anderer Leser:innen. Keine Profile, keine Punkte. Die
        kleinen Zeichen stehen direkt an den Stellen, an denen etwas haengen
        blieb.
      </p>
      <div className={styles.traceActions} aria-label="Eine Spur hinterlassen">
        <button type="button" onClick={() => onLeaveTrace('still')}>
          ○ still
        </button>
        <button type="button" onClick={() => onLeaveTrace('nah')}>
          ◇ nah
        </button>
        <button type="button" onClick={() => onLeaveTrace('stark')}>
          ✦ stark
        </button>
      </div>
      <div className={styles.traceFoot}>
        <span>{traceCount} Spuren heute</span>
        <button type="button" onClick={onClose}>
          schliessen
        </button>
      </div>
    </aside>
  );
}

function OfflineLanding({
  contactLinks,
  error,
  notificationState,
  now,
  offlineHistory,
  scheduledAt,
  expandedHistoryId,
  onDisableNotification,
  onToggleHistory,
  onRequestNotification,
}: {
  contactLinks: Array<{ href: string; label: string }>;
  error: string | null;
  notificationState: NotificationState;
  now: number | null;
  offlineHistory: OfflineHistoryItem[];
  scheduledAt: string | null;
  expandedHistoryId: number | null;
  onDisableNotification: () => void;
  onToggleHistory: (id: number) => void;
  onRequestNotification: () => void;
}) {
  return (
    <div className={styles.offlineLanding}>
      {error ? <p className={styles.error}>{error}</p> : null}

      <section className={styles.offlineIntro} aria-labelledby="offline-intro-title">
        <h1 id="offline-intro-title">
          hier kannst du mir live beim schreiben zusehen.
        </h1>
        <p>satz fuer satz, waehrend der text entsteht.</p>
      </section>

      <section
        id="next-live"
        className={styles.nextSession}
        aria-labelledby="next-live-title"
      >
        <h2 id="next-live-title" className={styles.offlineKicker}>
          naechste live-session
        </h2>

        {scheduledAt ? (
          <ScheduledSession scheduledAt={scheduledAt} now={now} />
        ) : (
          <div className={styles.noSchedule}>
            <p>noch kein neuer termin</p>
            <span>Schau spaeter wieder vorbei.</span>
          </div>
        )}

        <NotificationControl
          state={notificationState}
          onDisable={onDisableNotification}
          onRequest={onRequestNotification}
        />
      </section>

      {offlineHistory.length > 0 ? (
        <OfflineHistory
          expandedId={expandedHistoryId}
          items={offlineHistory}
          scheduledAt={scheduledAt}
          onToggle={onToggleHistory}
        />
      ) : null}

      {contactLinks.length > 0 ? <ContactLinks links={contactLinks} /> : null}
    </div>
  );
}

function ScheduledSession({
  scheduledAt,
  now,
}: {
  scheduledAt: string;
  now: number | null;
}) {
  const scheduledDate = getScheduledDate(scheduledAt);
  const distanceMs =
    scheduledDate && now !== null ? scheduledDate.getTime() - now : 0;

  return (
    <>
      <time
        className={styles.scheduleDate}
        dateTime={scheduledAt}
        title={scheduledDate ? scheduleDateTimeFormatter.format(scheduledDate) : undefined}
      >
        {formatScheduleLabel(scheduledAt)}
      </time>
      <div
        className={styles.countdown}
        role="timer"
        aria-label={formatTimerLabel(distanceMs)}
      >
        <span aria-hidden="true">{formatTimerParts(distanceMs)}</span>
      </div>
      <p className={styles.countdownLabel}>bis ich wieder schreibe</p>
    </>
  );
}

function NotificationControl({
  state,
  onDisable,
  onRequest,
}: {
  state: NotificationState;
  onDisable: () => void;
  onRequest: () => void;
}) {
  if (state === 'unsupported') {
    return (
      <p className={styles.notificationHint} role="status" aria-live="polite">
        Benachrichtigungen werden hier nicht unterstuetzt.
      </p>
    );
  }

  if (state === 'armed') {
    return (
      <div className={styles.notificationControl}>
        <button className={styles.notificationButton} type="button" disabled>
          ✓ Benachrichtigung aktiv
        </button>
        <button className={styles.notificationTextButton} type="button" onClick={onDisable}>
          deaktivieren
        </button>
        <p className={styles.notificationHint} role="status" aria-live="polite">
          funktioniert, solange diese seite geoeffnet bleibt.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.notificationControl}>
      <button
        className={styles.notificationButton}
        type="button"
        disabled={state === 'requesting' || state === 'denied'}
        onClick={onRequest}
      >
        {state === 'requesting' ? 'frage browser ...' : 'Benachrichtige mich'}
      </button>
      <p className={styles.notificationHint}>
        {state === 'denied'
          ? 'Benachrichtigungen sind im Browser deaktiviert.'
          : 'funktioniert, solange diese seite geoeffnet bleibt.'}
      </p>
    </div>
  );
}

function OfflineHistory({
  expandedId,
  items,
  scheduledAt,
  onToggle,
}: {
  expandedId: number | null;
  items: OfflineHistoryItem[];
  scheduledAt: string | null;
  onToggle: (id: number) => void;
}) {
  return (
    <section className={styles.offlineHistory} aria-labelledby="history-title">
      <h2 id="history-title" className={styles.historyTitle}>
        aus vergangenen sessions
      </h2>

      {items.map((item) => (
        <SessionTeaser
          key={item.id}
          expanded={expandedId === item.id}
          item={item}
          scheduledAt={scheduledAt}
          onToggle={onToggle}
        />
      ))}
    </section>
  );
}

function SessionTeaser({
  expanded,
  item,
  scheduledAt,
  onToggle,
}: {
  expanded: boolean;
  item: OfflineHistoryItem;
  scheduledAt: string | null;
  onToggle: (id: number) => void;
}) {
  const articleRef = useRef<HTMLElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [sessionText, setSessionText] = useState<SessionTextState>({
    text: null,
    loading: false,
    error: null,
  });

  const loadText = useCallback(async () => {
    if (sessionText.text !== null || sessionText.loading) return;

    setSessionText((current) => ({ ...current, loading: true, error: null }));

    try {
      const response = await fetch(`/api/offline-history/${item.id}`, {
        cache: 'no-store',
        headers: {
          accept: 'application/json',
        },
      });
      const json = (await response.json()) as {
        success: boolean;
        data?: {
          id: number;
          text: string;
        };
        message?: string;
        error?: string;
      };

      if (!response.ok || !json.success || !json.data) {
        throw new Error(
          json.message || json.error || 'Session konnte nicht geladen werden.',
        );
      }

      setSessionText({
        text: json.data.text,
        loading: false,
        error: null,
      });
    } catch (error) {
      setSessionText((current) => ({
        ...current,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Session konnte nicht geladen werden.',
      }));
    }
  }, [item.id, sessionText.loading, sessionText.text]);

  useEffect(() => {
    if (!expanded) return;

    void loadText();
  }, [expanded, loadText]);

  const toggleExpanded = () => {
    const articleTop = articleRef.current?.getBoundingClientRect().top ?? null;

    onToggle(item.id);

    window.requestAnimationFrame(() => {
      if (articleTop === null || prefersReducedMotion()) return;

      const nextTop = articleRef.current?.getBoundingClientRect().top;
      if (typeof nextTop !== 'number') return;

      window.scrollBy({
        top: nextTop - articleTop,
        behavior: 'auto',
      });
    });
  };

  const collapse = () => {
    toggleExpanded();

    window.requestAnimationFrame(() => {
      buttonRef.current?.focus({ preventScroll: true });
      const article = articleRef.current;
      if (!article) return;

      const rect = article.getBoundingClientRect();
      if (rect.top < 0 || rect.top > window.innerHeight) {
        article.scrollIntoView({
          block: 'start',
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        });
      }
    });
  };

  const handleToggle = () => {
    if (sessionText.error) {
      void loadText();
      return;
    }

    if (expanded) {
      collapse();
      return;
    }

    toggleExpanded();
  };

  const contentId = `offline-session-${item.id}-full`;
  const showFullText = expanded && sessionText.text !== null;

  return (
    <article
      ref={articleRef}
      className={styles.historyItem}
      aria-busy={sessionText.loading || undefined}
    >
      <time className={styles.historyDate} dateTime={item.createdAt}>
        {formatHistoryDate(item.createdAt)}
      </time>
      {item.title ? <h3 className={styles.historyItemTitle}>{item.title}</h3> : null}
      <p
        id={contentId}
        className={showFullText ? styles.historyFullText : styles.historyPreview}
      >
        {showFullText ? sessionText.text : item.excerpt}
      </p>
      {sessionText.error ? (
        <p className={styles.historyError} role="status">
          Text konnte nicht geladen werden.
        </p>
      ) : null}
      <button
        ref={buttonRef}
        className={styles.historyButton}
        type="button"
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={handleToggle}
        disabled={sessionText.loading}
      >
        {sessionText.loading
          ? 'lädt …'
          : sessionText.error
            ? 'erneut versuchen ↓'
            : expanded
              ? 'weniger anzeigen ↑'
              : 'weiterlesen ↓'}
      </button>
      {showFullText && scheduledAt ? (
        <p className={styles.historyLiveReminder}>
          <a href="#next-live">
            naechste live-session · {formatScheduleLabel(scheduledAt)}
          </a>
        </p>
      ) : null}
    </article>
  );
}

function ContactLinks({
  links,
}: {
  links: Array<{
    href: string;
    label: string;
  }>;
}) {
  return (
    <footer className={styles.contactFooter}>
      <nav aria-label="Kontakt">
        {links.map((link, index) => (
          <span key={link.href}>
            {index > 0 ? <span aria-hidden="true"> · </span> : null}
            <Link href={link.href}>{link.label}</Link>
          </span>
        ))}
      </nav>
    </footer>
  );
}
