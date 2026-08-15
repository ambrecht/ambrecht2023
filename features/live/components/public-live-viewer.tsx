'use client';

import { ArrowDown, Circle, Moon, Radio, Sun } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

import { setHeartReaction } from '../api/set-heart-reaction';
import { useLiveFollow } from '../hooks/use-live-follow';
import { usePublicLiveStream } from '../hooks/use-public-live-stream';
import type {
  ConnectionStatus,
  FollowMode,
  LiveLine,
  PublicLiveState,
} from '../lib/contract';

type PublicLiveViewerProps = {
  initialState: PublicLiveState;
  initialConnectionStatus: ConnectionStatus;
  initialError: string | null;
  streamUrl: string;
};

type LiveTheme = 'dark' | 'light';
type ReaderScale = 'small' | 'medium' | 'large';

type ThemeTokens = {
  page: string;
  text: string;
  muted: string;
  quiet: string;
  hairline: string;
  glow: string;
  control: string;
  controlActive: string;
  accent: string;
  focus: string;
  draft: string;
  error: string;
  errorBorder: string;
};

type ReaderScaleTokens = {
  label: string;
  buttonClass: string;
  articleText: string;
  emptyText: string;
  gap: string;
};

const connectionLabel: Record<ConnectionStatus, string> = {
  connecting: 'Verbindung wird hergestellt ...',
  connected: 'Verbunden',
  reconnecting: 'Verbindung wird wiederhergestellt ...',
  error: 'Live-Verbindung gestört',
};

const readerFontClass =
  "[font-family:var(--gara-Font),Georgia,'Times_New_Roman',serif]";
const themeStorageKey = 'ambrecht-live-theme';
const readerScaleStorageKey = 'ambrecht-live-reader-scale';
const viewerIdStorageKey = 'ambrecht-live-viewer-id';
const heartedStoragePrefix = 'ambrecht-live-hearts:';

const themeTokens: Record<LiveTheme, ThemeTokens> = {
  dark: {
    page: 'bg-[#080807]',
    text: 'text-[#f4efe4]',
    muted: 'text-[#aaa191]',
    quiet: 'text-[#756f66]',
    hairline: 'bg-[#f4efe4]/12',
    glow: 'shadow-[0_0_42px_rgba(228,210,174,0.09)]',
    control: 'border-[#3d382f] bg-[#12110f]/88 text-[#d6cbbb]',
    controlActive: 'bg-[#f1e6d0] text-[#11100f]',
    accent: 'text-[#e2b463]',
    focus: 'focus-visible:ring-[#e2b463]',
    draft: 'text-[#fff8e6]',
    error: 'bg-[#271412] text-[#ffd7cf]',
    errorBorder: 'border-[#6f3028]',
  },
  light: {
    page: 'bg-[#f4efe4]',
    text: 'text-[#201b15]',
    muted: 'text-[#776e61]',
    quiet: 'text-[#9c9284]',
    hairline: 'bg-[#2a2118]/14',
    glow: 'shadow-[0_0_38px_rgba(96,73,44,0.08)]',
    control: 'border-[#d6c5a8] bg-[#fffaf0]/90 text-[#3a3126]',
    controlActive: 'bg-[#211c16] text-[#fff8ed]',
    accent: 'text-[#9b1c1c]',
    focus: 'focus-visible:ring-[#9b1c1c]',
    draft: 'text-[#322a20]',
    error: 'bg-[#fff4e4] text-[#8b1e1e]',
    errorBorder: 'border-[#d7b897]',
  },
};

const readerScaleTokens: Record<ReaderScale, ReaderScaleTokens> = {
  small: {
    label: 'Kleine Schrift',
    buttonClass: 'text-[13px]',
    articleText:
      'text-[clamp(1.45rem,4.7vw,1.72rem)] sm:text-[clamp(1.7rem,3.4vw,2.55rem)] lg:text-[clamp(1.9rem,2.9vw,3.25rem)]',
    emptyText: 'text-[clamp(1.6rem,3.4vw,2.7rem)]',
    gap: 'gap-[0.34em]',
  },
  medium: {
    label: 'Mittlere Schrift',
    buttonClass: 'text-[16px]',
    articleText:
      'text-[clamp(1.65rem,5.2vw,1.95rem)] sm:text-[clamp(1.95rem,4vw,3.05rem)] lg:text-[clamp(2.2rem,3.45vw,4.1rem)]',
    emptyText: 'text-[clamp(1.8rem,3.8vw,3.2rem)]',
    gap: 'gap-[0.38em]',
  },
  large: {
    label: 'Große Schrift',
    buttonClass: 'text-[19px]',
    articleText:
      'text-[clamp(1.85rem,5.8vw,2.25rem)] sm:text-[clamp(2.25rem,4.5vw,3.65rem)] lg:text-[clamp(2.6rem,4vw,5rem)]',
    emptyText: 'text-[clamp(2rem,4vw,3.6rem)]',
    gap: 'gap-[0.42em]',
  },
};

const lineTimeFormatter = new Intl.DateTimeFormat('de-DE', {
  hour: '2-digit',
  minute: '2-digit',
});

const formatViewerCount = (count: number) =>
  count === 1 ? '1 liest gerade mit' : `${count} lesen gerade mit`;

const getHeartedStorageKey = (broadcastId: string) =>
  `${heartedStoragePrefix}${broadcastId}`;

function readHeartedLineIds(broadcastId: string): Set<string> {
  try {
    const raw = window.localStorage.getItem(getHeartedStorageKey(broadcastId));
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];

    if (!Array.isArray(parsed)) {
      return new Set();
    }

    return new Set(parsed.filter((lineId): lineId is string => typeof lineId === 'string'));
  } catch {
    return new Set();
  }
}

function writeHeartedLineIds(broadcastId: string, lineIds: ReadonlySet<string>) {
  try {
    window.localStorage.setItem(
      getHeartedStorageKey(broadcastId),
      JSON.stringify(Array.from(lineIds)),
    );
  } catch {
    // Hearts still work for the current page session without persistent storage.
  }
}

function removeHeartedLineIds(broadcastId: string) {
  try {
    window.localStorage.removeItem(getHeartedStorageKey(broadcastId));
  } catch {
    // Cleanup is best-effort when storage is unavailable.
  }
}

function getOrCreateAnonymousViewerId() {
  try {
    const storedViewerId = window.localStorage.getItem(viewerIdStorageKey);
    if (storedViewerId) return storedViewerId;

    const viewerId = window.crypto.randomUUID();
    window.localStorage.setItem(viewerIdStorageKey, viewerId);
    return viewerId;
  } catch {
    return null;
  }
}

function formatLineTime(publishedAt: string) {
  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) return '';
  return lineTimeFormatter.format(date);
}

function getInitialTheme(): LiveTheme {
  if (typeof window === 'undefined') return 'dark';

  try {
    const storedTheme = window.localStorage.getItem(themeStorageKey);
    if (storedTheme === 'dark' || storedTheme === 'light') return storedTheme;
  } catch {
    // Private browsing modes can block storage; the system preference still works.
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
}

function getInitialReaderScale(): ReaderScale {
  if (typeof window === 'undefined') return 'medium';

  try {
    const storedScale = window.localStorage.getItem(readerScaleStorageKey);
    if (
      storedScale === 'small' ||
      storedScale === 'medium' ||
      storedScale === 'large'
    ) {
      return storedScale;
    }
  } catch {
    // The reader still works when storage is unavailable.
  }

  return 'medium';
}

function useLiveTheme() {
  const [theme, setTheme] = useState<LiveTheme>('dark');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setTheme(getInitialTheme());
    setIsHydrated(true);
  }, []);

  const updateTheme = useCallback((nextTheme: LiveTheme) => {
    setTheme(nextTheme);
    try {
      window.localStorage.setItem(themeStorageKey, nextTheme);
    } catch {
      // The visual toggle should keep working even when storage is unavailable.
    }
  }, []);

  return { theme, setTheme: updateTheme, isHydrated };
}

function useReaderScale() {
  const [readerScale, setReaderScale] = useState<ReaderScale>('medium');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setReaderScale(getInitialReaderScale());
    setIsHydrated(true);
  }, []);

  const updateReaderScale = useCallback((nextScale: ReaderScale) => {
    setReaderScale(nextScale);
    try {
      window.localStorage.setItem(readerScaleStorageKey, nextScale);
    } catch {
      // The visual choice should keep working even without persistent storage.
    }
  }, []);

  return {
    readerScale,
    setReaderScale: updateReaderScale,
    isReaderScaleHydrated: isHydrated,
  };
}

function useAnonymousViewerId() {
  const [viewerId, setViewerId] = useState<string | null>(null);

  useEffect(() => {
    setViewerId(getOrCreateAnonymousViewerId());
  }, []);

  const ensureViewerId = useCallback(() => {
    const nextViewerId = viewerId ?? getOrCreateAnonymousViewerId();
    if (nextViewerId && nextViewerId !== viewerId) {
      setViewerId(nextViewerId);
    }

    return nextViewerId;
  }, [viewerId]);

  return {
    viewerId,
    ensureViewerId,
  };
}

function LiveStatus({
  state,
  connectionStatus,
  followMode,
  unseenCommittedCount,
  tokens,
}: {
  state: PublicLiveState;
  connectionStatus: ConnectionStatus;
  followMode: FollowMode;
  unseenCommittedCount: number;
  tokens: ThemeTokens;
}) {
  const isLive = state.status === 'live';
  const presenceCopy = isLive ? formatViewerCount(state.viewerCount) : null;
  const statusCopy =
    followMode === 'history'
      ? unseenCommittedCount > 0
        ? `${unseenCommittedCount} neue Zeilen laufen ein`
        : 'Du liest frühere Zeilen'
      : isLive
        ? presenceCopy
        : connectionLabel[connectionStatus];

  return (
    <div
      className={`flex min-w-0 items-center gap-2 overflow-hidden whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.14em] ${tokens.muted}`}
    >
      <span aria-hidden="true" className={isLive ? tokens.accent : tokens.quiet}>
        <Circle size={9} fill="currentColor" strokeWidth={0} />
      </span>
      <span className={isLive ? tokens.text : tokens.muted}>
        {isLive ? 'LIVE' : 'Aktuell nicht live'}
      </span>
      <span aria-hidden="true" className={tokens.quiet}>
        /
      </span>
      <span className="truncate">{statusCopy}</span>
      {followMode === 'history' && presenceCopy ? (
        <>
          <span aria-hidden="true" className={tokens.quiet}>
            /
          </span>
          <span className="truncate normal-case tracking-normal">
            {presenceCopy}
          </span>
        </>
      ) : null}
    </div>
  );
}

function FontSizeToggle({
  readerScale,
  setReaderScale,
  isHydrated,
  tokens,
}: {
  readerScale: ReaderScale;
  setReaderScale: (scale: ReaderScale) => void;
  isHydrated: boolean;
  tokens: ThemeTokens;
}) {
  const scales: ReaderScale[] = ['small', 'medium', 'large'];

  return (
    <div
      aria-label="Schriftgröße"
      className={`pointer-events-auto inline-grid grid-cols-3 gap-1 border p-1 ${tokens.control}`}
      role="group"
    >
      {scales.map((scale) => {
        const scaleTokens = readerScaleTokens[scale];

        return (
          <button
            key={scale}
            type="button"
            aria-pressed={readerScale === scale}
            title={scaleTokens.label}
            onClick={() => setReaderScale(scale)}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-sm font-serif leading-none transition-colors focus:outline-none focus-visible:ring-2 ${tokens.focus} ${scaleTokens.buttonClass} ${
              readerScale === scale
                ? tokens.controlActive
                : 'hover:bg-current/10'
            }`}
          >
            A
            <span className="sr-only">{scaleTokens.label}</span>
          </button>
        );
      })}
      {!isHydrated ? (
        <span className="sr-only">Schriftgröße wird geladen</span>
      ) : null}
    </div>
  );
}

function ThemeToggle({
  theme,
  setTheme,
  isHydrated,
  tokens,
}: {
  theme: LiveTheme;
  setTheme: (theme: LiveTheme) => void;
  isHydrated: boolean;
  tokens: ThemeTokens;
}) {
  return (
    <div
      aria-label="Darstellung"
      className={`pointer-events-auto inline-grid grid-cols-2 gap-1 border p-1 ${tokens.control}`}
      role="group"
    >
      <button
        type="button"
        aria-pressed={theme === 'dark'}
        title="Dark Mode"
        onClick={() => setTheme('dark')}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-sm transition-colors focus:outline-none focus-visible:ring-2 ${tokens.focus} ${
          theme === 'dark' ? tokens.controlActive : 'hover:bg-current/10'
        }`}
      >
        <Moon size={16} aria-hidden="true" />
        <span className="sr-only">Dark Mode</span>
      </button>
      <button
        type="button"
        aria-pressed={theme === 'light'}
        title="Light Mode"
        onClick={() => setTheme('light')}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-sm transition-colors focus:outline-none focus-visible:ring-2 ${tokens.focus} ${
          theme === 'light' ? tokens.controlActive : 'hover:bg-current/10'
        }`}
      >
        <Sun size={16} aria-hidden="true" />
        <span className="sr-only">Light Mode</span>
      </button>
      {!isHydrated ? <span className="sr-only">Theme wird geladen</span> : null}
    </div>
  );
}

function ReaderLine({
  line,
  heartCount,
  hearted,
  isPending,
  onToggleHeart,
  tokens,
}: {
  line: LiveLine;
  heartCount: number;
  hearted: boolean;
  isPending: boolean;
  onToggleHeart: (line: LiveLine) => void;
  tokens: ThemeTokens;
}) {
  const lineTime = formatLineTime(line.publishedAt);

  return (
    <div
      data-live-line
      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1 whitespace-pre-wrap break-words sm:grid-cols-[3.4rem_minmax(0,1fr)_4.8rem] sm:gap-x-[clamp(0.8rem,2vw,1.6rem)]"
    >
      <time
        dateTime={line.publishedAt}
        className={`col-start-1 row-start-1 mt-[0.38em] select-none text-[0.28em] font-medium leading-none tabular-nums sm:text-right sm:text-[0.18em] ${tokens.quiet}`}
      >
        {lineTime}
      </time>
      <span className="col-span-3 row-start-2 block min-w-0 max-w-full [overflow-wrap:anywhere] sm:col-span-1 sm:col-start-2 sm:row-start-1">
        {line.text}
      </span>
      <button
        type="button"
        aria-pressed={hearted}
        aria-label={
          hearted ? 'Gefällt mir nicht mehr' : 'Diese Zeile gefällt mir'
        }
        disabled={isPending}
        onClick={() => onToggleHeart(line)}
        className={`col-start-3 row-start-1 mt-[0.24em] inline-flex min-h-8 min-w-[3.4rem] items-center justify-end gap-1 justify-self-end rounded-sm px-1 text-[0.28em] font-medium leading-none transition-[color,opacity,transform] hover:opacity-80 focus:outline-none focus-visible:ring-2 disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none sm:min-w-[4.4rem] sm:text-[0.2em] ${tokens.focus} ${
          hearted ? tokens.accent : tokens.quiet
        }`}
      >
        <span
          aria-hidden="true"
          className="inline-block transition-transform duration-150 motion-reduce:transition-none"
        >
          {hearted ? '♥' : '♡'}
        </span>
        {heartCount > 0 ? <span>{heartCount}</span> : null}
      </button>
    </div>
  );
}

function LiveDraft({ text, tokens }: { text: string; tokens: ThemeTokens }) {
  return (
    <p
      data-live-draft
      className={`grid grid-cols-[1.4rem_minmax(0,1fr)] items-start gap-[clamp(0.55rem,2vw,1.35rem)] whitespace-pre-wrap break-words sm:grid-cols-[2.8rem_minmax(0,1fr)] ${tokens.draft}`}
    >
      <span
        aria-hidden="true"
        className={`mt-[0.34em] flex justify-end ${tokens.accent}`}
      >
        <Radio size="0.22em" />
      </span>
      <span
        className={`block min-w-0 max-w-full [overflow-wrap:anywhere] ${tokens.glow}`}
      >
        {text}
        <span
          aria-hidden="true"
          className={`ml-2 inline-block h-[0.82em] w-[0.045em] translate-y-[0.08em] ${tokens.hairline}`}
        />
      </span>
    </p>
  );
}

function LiveDocument({
  state,
  bottomRef,
  tokens,
  scaleTokens,
  heartedLineIds,
  pendingLineIds,
  optimisticHeartCounts,
  onToggleHeart,
}: {
  state: PublicLiveState;
  bottomRef: RefObject<HTMLDivElement | null>;
  tokens: ThemeTokens;
  scaleTokens: ReaderScaleTokens;
  heartedLineIds: ReadonlySet<string>;
  pendingLineIds: ReadonlySet<string>;
  optimisticHeartCounts: ReadonlyMap<string, number>;
  onToggleHeart: (line: LiveLine) => void;
}) {
  if (state.status === 'offline') {
    return (
      <div
        data-live-document
        className="mx-auto flex min-h-full w-full max-w-[54rem] flex-col justify-center pb-[12vh]"
      >
        <p
          className={`${readerFontClass} max-w-[13ch] text-[clamp(2.6rem,7vw,5.6rem)] font-normal leading-[1.08] tracking-normal ${tokens.text}`}
        >
          Aktuell nicht live
        </p>
        <p className={`mt-5 max-w-[34rem] text-[17px] leading-7 ${tokens.muted}`}>
          Wenn der Live-Kanal startet, erscheint der Text hier automatisch.
          Diese Seite kann einfach offen bleiben.
        </p>
        <div ref={bottomRef} aria-hidden="true" />
      </div>
    );
  }

  const isEmpty = state.lines.length === 0 && !state.activeDraft;

  return (
    <article
      data-live-document
      className={`${readerFontClass} mx-auto flex min-h-full w-full max-w-[58rem] flex-col justify-end pb-[14vh] pt-[10vh] font-normal leading-[1.14] tracking-normal ${scaleTokens.gap} ${scaleTokens.articleText} ${tokens.text} sm:leading-[1.18] lg:leading-[1.12]`}
    >
      {isEmpty ? (
        <p className={`leading-[1.18] ${scaleTokens.emptyText} ${tokens.muted}`}>
          Live verbunden. Warte auf den ersten Satz.
        </p>
      ) : null}

      {state.lines.map((line) => (
        <ReaderLine
          key={line.id}
          line={line}
          heartCount={optimisticHeartCounts.get(line.id) ?? line.heartCount}
          hearted={heartedLineIds.has(line.id)}
          isPending={pendingLineIds.has(line.id)}
          onToggleHeart={onToggleHeart}
          tokens={tokens}
        />
      ))}

      {state.activeDraft ? (
        <LiveDraft text={state.activeDraft} tokens={tokens} />
      ) : null}

      <div ref={bottomRef} aria-hidden="true" />
    </article>
  );
}

function ScrollHint({
  visible,
  tokens,
}: {
  visible: boolean;
  tokens: ThemeTokens;
}) {
  if (!visible) return null;

  return (
    <div
      className={`pointer-events-none fixed bottom-[max(5.2rem,calc(env(safe-area-inset-bottom)_+_4.8rem))] left-4 right-4 z-20 border px-4 py-2 text-center text-xs font-medium md:left-1/2 md:right-auto md:w-[28rem] md:-translate-x-1/2 ${tokens.control}`}
    >
      Nach oben scrollen für den bisherigen Verlauf
    </div>
  );
}

function ReturnToLiveButton({
  unseenCommittedCount,
  returnToLive,
  tokens,
}: {
  unseenCommittedCount: number;
  returnToLive: () => void;
  tokens: ThemeTokens;
}) {
  return (
    <button
      type="button"
      onClick={returnToLive}
      className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-30 inline-flex min-h-12 -translate-x-1/2 items-center gap-2 border px-4 py-3 text-sm font-medium shadow-[0_12px_34px_rgba(0,0,0,0.22)] transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 motion-reduce:transition-none motion-reduce:hover:-translate-y-0 ${tokens.control} ${tokens.focus}`}
    >
      <ArrowDown size={17} aria-hidden="true" />
      {unseenCommittedCount > 0
        ? `${unseenCommittedCount} neue Zeilen · Zurück zu Live`
        : 'Zurück zu Live'}
    </button>
  );
}

export function PublicLiveViewer({
  initialState,
  initialConnectionStatus,
  initialError,
  streamUrl,
}: PublicLiveViewerProps) {
  const {
    broadcastState,
    connectionStatus,
    error,
    lastAppliedEvent,
    applyLiveEvent,
  } =
    usePublicLiveStream({
      initialState,
      initialConnectionStatus,
      initialError,
      streamUrl,
    });
  const { theme, setTheme, isHydrated } = useLiveTheme();
  const { readerScale, setReaderScale, isReaderScaleHydrated } =
    useReaderScale();
  const { ensureViewerId } = useAnonymousViewerId();
  const [hasInteractedWithScroll, setHasInteractedWithScroll] = useState(false);
  const [heartedLineIds, setHeartedLineIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [pendingLineIds, setPendingLineIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [optimisticHeartCounts, setOptimisticHeartCounts] = useState<
    ReadonlyMap<string, number>
  >(() => new Map());
  const previousBroadcastIdRef = useRef<string | null>(null);
  const activeBroadcastIdRef = useRef<string | null>(null);
  const tokens = themeTokens[theme];
  const scaleTokens = readerScaleTokens[readerScale];

  const activeBroadcastId =
    broadcastState.status === 'live' ? broadcastState.broadcastId : null;
  const broadcastKey =
    broadcastState.status === 'live' ? broadcastState.broadcastId : 'offline';
  const followTrigger =
    broadcastState.status === 'live' ? broadcastState.sequence : 0;
  const committedLineCount =
    broadcastState.status === 'live' ? broadcastState.lines.length : 0;

  const {
    scrollerRef,
    bottomRef,
    followMode,
    unseenCommittedCount,
    handleScroll,
    returnToLive,
  } = useLiveFollow({
    broadcastKey,
    followTrigger,
    committedLineCount,
    lastAppliedEvent,
  });
  const hasEnoughHistory =
    broadcastState.status === 'live' && broadcastState.lines.length >= 3;
  const showScrollHint =
    followMode === 'live' && hasEnoughHistory && !hasInteractedWithScroll;

  useEffect(() => {
    const previousBroadcastId = previousBroadcastIdRef.current;
    activeBroadcastIdRef.current = activeBroadcastId;

    if (activeBroadcastId) {
      if (activeBroadcastId !== previousBroadcastId) {
        setHeartedLineIds(readHeartedLineIds(activeBroadcastId));
        setPendingLineIds(new Set());
        setOptimisticHeartCounts(new Map());
      }
    } else {
      if (previousBroadcastId) {
        removeHeartedLineIds(previousBroadcastId);
      }
      setHeartedLineIds(new Set());
      setPendingLineIds(new Set());
      setOptimisticHeartCounts(new Map());
    }

    previousBroadcastIdRef.current = activeBroadcastId;
  }, [activeBroadcastId]);

  const handleReaderScroll = useCallback(() => {
    setHasInteractedWithScroll(true);
    handleScroll();
  }, [handleScroll]);

  const handleToggleHeart = useCallback(
    async (line: LiveLine) => {
      if (broadcastState.status !== 'live' || pendingLineIds.has(line.id)) {
        return;
      }

      const viewerId = ensureViewerId();
      if (!viewerId) {
        return;
      }

      const broadcastId = broadcastState.broadcastId;
      const wasHearted = heartedLineIds.has(line.id);
      const nextActive = !wasHearted;
      const previousHeartedLineIds = new Set(heartedLineIds);
      const nextOptimisticCount = Math.max(
        0,
        line.heartCount + (nextActive ? 1 : -1),
      );

      setHeartedLineIds((current) => {
        const next = new Set(current);
        if (nextActive) {
          next.add(line.id);
        } else {
          next.delete(line.id);
        }
        return next;
      });
      setOptimisticHeartCounts((current) => {
        const next = new Map(current);
        next.set(line.id, nextOptimisticCount);
        return next;
      });
      setPendingLineIds((current) => {
        const next = new Set(current);
        next.add(line.id);
        return next;
      });

      try {
        const result = await setHeartReaction({
          broadcastId,
          lineId: line.id,
          viewerId,
          active: nextActive,
        });

        if (
          activeBroadcastIdRef.current !== broadcastId
        ) {
          return;
        }

        if (result.broadcastId !== broadcastId || result.lineId !== line.id) {
          throw new Error('Heart-Reaktion passt nicht zur aktuellen Zeile.');
        }

        setHeartedLineIds((current) => {
          const next = new Set(current);
          if (result.active) {
            next.add(line.id);
          } else {
            next.delete(line.id);
          }
          writeHeartedLineIds(broadcastId, next);
          return next;
        });
        applyLiveEvent({
          type: 'reaction.updated',
          broadcastId: result.broadcastId,
          lineId: result.lineId,
          reaction: result.reaction,
          count: result.count,
        });
      } catch {
        if (activeBroadcastIdRef.current === broadcastId) {
          setHeartedLineIds(previousHeartedLineIds);
        }
      } finally {
        setPendingLineIds((current) => {
          const next = new Set(current);
          next.delete(line.id);
          return next;
        });
        setOptimisticHeartCounts((current) => {
          const next = new Map(current);
          next.delete(line.id);
          return next;
        });
      }
    },
    [
      applyLiveEvent,
      broadcastState,
      ensureViewerId,
      heartedLineIds,
      pendingLineIds,
    ],
  );

  return (
    <main
      data-live-viewer
      data-theme={theme}
      className={`fixed inset-0 z-50 flex h-[100dvh] w-screen flex-col overflow-hidden transition-colors duration-300 motion-reduce:transition-none [color-scheme:dark_light] ${tokens.page} ${tokens.text}`}
      suppressHydrationWarning
    >
      <header className="z-20 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 px-[clamp(1rem,4vw,3.5rem)] py-[max(1rem,env(safe-area-inset-top))]">
        <LiveStatus
          state={broadcastState}
          connectionStatus={connectionStatus}
          followMode={followMode}
          unseenCommittedCount={unseenCommittedCount}
          tokens={tokens}
        />
        <div className="flex flex-wrap justify-end gap-2">
          <FontSizeToggle
            readerScale={readerScale}
            setReaderScale={setReaderScale}
            isHydrated={isReaderScaleHydrated}
            tokens={tokens}
          />
          <ThemeToggle
            theme={theme}
            setTheme={setTheme}
            isHydrated={isHydrated}
            tokens={tokens}
          />
        </div>
      </header>

      {error ? (
        <p
          className={`mx-[clamp(1.1rem,4vw,3.5rem)] border px-4 py-3 text-sm ${tokens.errorBorder} ${tokens.error}`}
        >
          {error}
        </p>
      ) : null}

      <section
        ref={scrollerRef}
        data-live-scroller
        onScroll={handleReaderScroll}
        className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-[clamp(0.75rem,4vw,3.5rem)] pb-[max(2rem,env(safe-area-inset-bottom))]"
      >
        <LiveDocument
          state={broadcastState}
          bottomRef={bottomRef}
          tokens={tokens}
          scaleTokens={scaleTokens}
          heartedLineIds={heartedLineIds}
          pendingLineIds={pendingLineIds}
          optimisticHeartCounts={optimisticHeartCounts}
          onToggleHeart={handleToggleHeart}
        />
      </section>

      <ScrollHint visible={showScrollHint} tokens={tokens} />

      {followMode === 'history' ? (
        <ReturnToLiveButton
          unseenCommittedCount={unseenCommittedCount}
          returnToLive={returnToLive}
          tokens={tokens}
        />
      ) : null}
    </main>
  );
}
