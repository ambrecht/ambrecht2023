'use client';

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

import styles from './live-book-reader.module.css';

type LiveBookReaderProps = {
  initialState: PublicLiveState;
  initialConnectionStatus: ConnectionStatus;
  initialError: string | null;
  streamUrl: string;
};

type ReaderMode = 'FOLLOWING_LIVE' | 'READING_HISTORY';

const userScrollThreshold = 8;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function formatViewerCount(count: number) {
  return count === 1 ? '1 liest mit' : `${count} lesen mit`;
}

function formatUnseenWords(count: number) {
  if (count <= 0) return '↓ zurück zu live';

  return count === 1
    ? '↓ zurück zu live · 1 neues Wort'
    : `↓ zurück zu live · ${count} neue Wörter`;
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
}: LiveBookReaderProps) {
  const { broadcastState, connectionStatus, error } = usePublicLiveStream({
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

  const viewModel = useMemo(
    () => buildLiveBookViewModel(broadcastState),
    [broadcastState],
  );

  // Domain state: this decides whether a live session actually exists.
  // ConnectionStatus only describes the SSE transport and must not be used
  // as a replacement for the product state.
  const isLive = broadcastState.status === 'live';

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

    liveEndRef.current?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'end',
    });
  }, [markProgrammaticScroll, setReaderMode]);

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
          <button
            className={styles.readerButton}
            type="button"
            onClick={scrollToStart}
          >
            Anfang
          </button>
        ) : null}
      </header>

      <article className={styles.story} aria-label="Live-Manuskript">
        <div
          ref={storyStartRef}
          className={styles.storyStart}
          aria-hidden="true"
        />

        {!isLive ? (
          <>
            {showConnectionError ? (
              <p className={styles.error}>{error}</p>
            ) : (
              <p className={styles.offline}>
                Gerade findet keine Live-Session statt.
              </p>
            )}
          </>
        ) : (
          <>
            {error ? <p className={styles.error}>{error}</p> : null}

            {viewModel.title ? (
              <h1 className={styles.title}>{viewModel.title}</h1>
            ) : null}

            {viewModel.historicalParagraphs.length > 0 ? (
              <div className={styles.historicalManuscript}>
                {viewModel.historicalParagraphs.map((paragraph) => (
                  <p key={paragraph.id} className={styles.historicalParagraph}>
                    {renderParagraph(paragraph)}
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

      {isLive && unseenWordCount > 0 ? (
        <div className={styles.srOnly} role="status" aria-live="polite">
          {unseenWordCount} neue Wörter verfügbar
        </div>
      ) : null}
    </main>
  );
}
