'use client';

import { ArrowDown, Circle, Moon, Sun } from 'lucide-react';
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
  scrollbar: string;
  accent: string;
  focus: string;
  draft: string;
  error: string;
  errorBorder: string;
};

type ReaderScaleTokens = {
  label: string;
  shortLabel: string;
  articleText: string;
  emptyText: string;
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
    page: 'bg-[#050403]',
    text: 'text-[#f6e6c8]',
    muted: 'text-[#9f9078]',
    quiet: 'text-[#706655]',
    hairline: 'bg-[#f1e6d0]/16',
    glow: 'shadow-[0_0_34px_rgba(216,180,108,0.08)]',
    control: 'border-[#302b22] bg-[#0d0c09]/76 text-[#d8ccb8]',
    controlActive: 'bg-[#d8b46c] text-[#14110c]',
    scrollbar: '[scrollbar-color:#5c5040_transparent]',
    accent: 'text-[#d8b46c]',
    focus: 'focus-visible:ring-[#d8b46c]',
    draft: 'text-[#fff3d9]',
    error: 'bg-[#271412] text-[#ffd7cf]',
    errorBorder: 'border-[#6f3028]',
  },
  light: {
    page: 'bg-[#fbf1df]',
    text: 'text-[#211810]',
    muted: 'text-[#736551]',
    quiet: 'text-[#998a70]',
    hairline: 'bg-[#30271e]/14',
    glow: 'shadow-[0_0_34px_rgba(92,70,39,0.07)]',
    control: 'border-[#d8c9ae] bg-[#fbf4e6]/78 text-[#382e22]',
    controlActive: 'bg-[#3b3022] text-[#fff7e9]',
    scrollbar: '[scrollbar-color:#b9aa90_transparent]',
    accent: 'text-[#7c5a24]',
    focus: 'focus-visible:ring-[#7c5a24]',
    draft: 'text-[#2f261b]',
    error: 'bg-[#fff4e4] text-[#8b1e1e]',
    errorBorder: 'border-[#d7b897]',
  },
};

const readerScaleTokens: Record<ReaderScale, ReaderScaleTokens> = {
  small: {
    label: 'Kleine Schrift',
    shortLabel: 'S',
    articleText:
      'text-[clamp(1.58rem,5vw,1.88rem)] sm:text-[clamp(1.85rem,3.35vw,2.72rem)] lg:text-[clamp(2.05rem,2.8vw,3.35rem)]',
    emptyText: 'text-[clamp(1.6rem,3.4vw,2.7rem)]',
  },
  medium: {
    label: 'Mittlere Schrift',
    shortLabel: 'M',
    articleText:
      'text-[clamp(1.82rem,5.7vw,2.18rem)] sm:text-[clamp(2.15rem,3.9vw,3.22rem)] lg:text-[clamp(2.42rem,3.35vw,4.25rem)]',
    emptyText: 'text-[clamp(1.8rem,3.8vw,3.2rem)]',
  },
  large: {
    label: 'Große Schrift',
    shortLabel: 'L',
    articleText:
      'text-[clamp(2.05rem,6.4vw,2.5rem)] sm:text-[clamp(2.5rem,4.45vw,3.85rem)] lg:text-[clamp(2.85rem,3.85vw,5.1rem)]',
    emptyText: 'text-[clamp(2rem,4vw,3.6rem)]',
  },
};

const lineTimeFormatter = new Intl.DateTimeFormat('de-DE', {
  hour: '2-digit',
  minute: '2-digit',
});

const formatViewerCount = (count: number) =>
  count === 1 ? '1 liest mit' : `${count} lesen mit`;

const formatNewLineCount = (count: number) =>
  count === 1 ? '1 neue Zeile' : `${count} neue Zeilen`;

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
  if (state.status !== 'live') {
    const offlineCopy =
      connectionStatus === 'connecting' || connectionStatus === 'reconnecting'
        ? connectionLabel[connectionStatus]
        : 'Nicht live';

    return (
      <div
        className={`min-w-0 overflow-hidden whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.13em] ${tokens.muted}`}
      >
        <span className="truncate">{offlineCopy}</span>
      </div>
    );
  }

  const livePresenceCopy = formatViewerCount(state.viewerCount);
  const positionCopy =
    followMode === 'history' ? 'Frühere Zeilen' : 'Hier entsteht ein Text';
  const unseenCopy =
    unseenCommittedCount === 1
      ? '1 neu'
      : `${unseenCommittedCount} neu`;

  return (
    <div
      className={`flex min-w-0 items-center gap-2 overflow-hidden whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.12em] ${tokens.muted}`}
    >
      <span aria-hidden="true" className={tokens.accent}>
        <Circle size={9} fill="currentColor" strokeWidth={0} />
      </span>
      <span className={tokens.text}>LIVE</span>
      <span aria-hidden="true" className={tokens.quiet}>
        ·
      </span>
      <span className="truncate normal-case tracking-normal">{positionCopy}</span>
      {followMode === 'history' && unseenCommittedCount > 0 ? (
        <>
          <span aria-hidden="true" className={tokens.quiet}>
            ·
          </span>
          <span className="truncate normal-case tracking-normal">
            {unseenCopy}
          </span>
        </>
      ) : null}
      <span aria-hidden="true" className={tokens.quiet}>
        ·
      </span>
      <span className="truncate normal-case tracking-normal">
        {livePresenceCopy}
      </span>
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
  const scaleOrder: ReaderScale[] = ['small', 'medium', 'large'];
  const currentIndex = scaleOrder.indexOf(readerScale);
  const nextScale = scaleOrder[(currentIndex + 1) % scaleOrder.length];
  const currentScale = readerScaleTokens[readerScale];

  return (
    <button
      type="button"
      aria-label={`Schriftgröße ändern, aktuell: ${currentScale.label}`}
      title={`Schriftgröße: ${currentScale.label}`}
      onClick={() => setReaderScale(nextScale)}
      className={`pointer-events-auto inline-flex h-9 min-w-[3.35rem] items-center justify-center gap-1 border px-3 text-[12px] font-medium transition-colors hover:bg-current/10 focus:outline-none focus-visible:ring-2 ${tokens.control} ${tokens.focus}`}
    >
      <span className="font-serif text-[18px] leading-none">Aa</span>
      <span aria-hidden="true" className={`text-[9px] ${tokens.quiet}`}>
        {currentScale.shortLabel}
      </span>
      {!isHydrated ? (
        <span className="sr-only">Schriftgröße wird geladen</span>
      ) : null}
    </button>
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
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  const label =
    theme === 'dark' ? 'Light Mode einschalten' : 'Dark Mode einschalten';

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={theme === 'dark'}
      title={label}
      onClick={() => setTheme(nextTheme)}
      className={`pointer-events-auto inline-flex h-9 w-9 items-center justify-center border transition-colors hover:bg-current/10 focus:outline-none focus-visible:ring-2 ${tokens.control} ${tokens.focus}`}
    >
      {theme === 'dark' ? (
        <Moon size={15} aria-hidden="true" />
      ) : (
        <Sun size={15} aria-hidden="true" />
      )}
      {!isHydrated ? <span className="sr-only">Theme wird geladen</span> : null}
    </button>
  );
}

function LiveInfoOverlay({
  open,
  onClose,
  tokens,
}: {
  open: boolean;
  onClose: () => void;
  tokens: ThemeTokens;
}) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-end px-4 py-[max(4.25rem,env(safe-area-inset-top))] sm:px-[clamp(1rem,4vw,3.5rem)]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="live-info-title"
        className={`w-full max-w-[22rem] border px-5 py-5 text-[14px] leading-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-md ${tokens.control}`}
      >
        <div className="flex items-start justify-between gap-4">
          <h2
            id="live-info-title"
            className={`${readerFontClass} text-[1.35rem] font-normal leading-tight ${tokens.text}`}
          >
            Was passiert hier?
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Info schließen"
            onClick={onClose}
            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-lg leading-none hover:bg-current/10 focus:outline-none focus-visible:ring-2 ${tokens.focus}`}
          >
            ×
          </button>
        </div>
        <div className={`mt-4 space-y-3 ${tokens.muted}`}>
          <p>Hier entsteht ein Text live.</p>
          <p>Buchstabe für Buchstabe. Zeile für Zeile.</p>
          <p>
            Sobald eine Zeile abgeschickt wurde, ist sie endgültig. Du siehst
            den Text in dem Moment, in dem er entsteht.
          </p>
          <p>
            ♡ Du kannst auf einzelne Zeilen reagieren. Die Reaktionen existieren
            nur während dieser Live-Session.
          </p>
        </div>
        <div className={`mt-5 h-px w-full ${tokens.hairline}`} />
        <address className={`mt-4 not-italic leading-6 ${tokens.muted}`}>
          <div>Tino Ambrecht</div>
          <a
            href="mailto:tino@ambrecht.de"
            className={`underline decoration-current/30 underline-offset-4 hover:decoration-current focus:outline-none focus-visible:ring-2 ${tokens.focus}`}
          >
            tino@ambrecht.de
          </a>
        </address>
      </section>
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
      className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-3 whitespace-pre-wrap break-words sm:grid-cols-[3rem_minmax(0,36rem)_2.8rem] sm:gap-x-[clamp(0.45rem,1vw,0.8rem)]"
    >
      <time
        dateTime={line.publishedAt}
        className={`col-start-1 row-start-2 mt-0 select-none text-[0.26em] font-medium leading-none tabular-nums sm:col-start-1 sm:row-start-1 sm:mt-[0.38em] sm:text-right sm:text-[0.155em] ${tokens.quiet}`}
      >
        {lineTime}
      </time>
      <span className="col-span-2 row-start-1 block min-w-0 max-w-full [overflow-wrap:anywhere] sm:col-span-1 sm:col-start-2 sm:row-start-1">
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
        className={`col-start-2 row-start-2 mt-[-0.08em] inline-flex min-h-8 min-w-[3rem] items-center justify-end gap-1 justify-self-end rounded-sm px-1 text-[0.26em] font-medium leading-none transition-[color,opacity,transform] hover:opacity-80 focus:outline-none focus-visible:ring-2 disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none sm:col-start-3 sm:row-start-1 sm:mt-[0.32em] sm:min-w-[2.8rem] sm:justify-start sm:text-[0.17em] ${tokens.focus} ${
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
      className={`grid grid-cols-[minmax(0,1fr)] items-start whitespace-pre-wrap break-words sm:grid-cols-[3rem_minmax(0,36rem)_2.8rem] sm:gap-x-[clamp(0.45rem,1vw,0.8rem)] ${tokens.draft}`}
    >
      <span
        className={`block min-w-0 max-w-full [overflow-wrap:anywhere] sm:col-start-2 ${tokens.glow}`}
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
        className="mx-auto flex min-h-full w-full max-w-[54rem] flex-col justify-center pb-[12vh] pl-[clamp(0rem,7vw,8rem)]"
      >
        <p
          className={`${readerFontClass} max-w-[13ch] text-[clamp(2.6rem,7vw,5.6rem)] font-normal leading-[1.08] tracking-normal ${tokens.text}`}
        >
          Gerade findet keine Live-Session statt.
        </p>
        <p className={`mt-5 max-w-[34rem] text-[17px] leading-7 ${tokens.muted}`}>
          Bitte warte, bis es wieder losgeht.
        </p>
        <div ref={bottomRef} aria-hidden="true" />
      </div>
    );
  }

  const isEmpty = state.lines.length === 0 && !state.activeDraft;

  return (
    <article
      data-live-document
      className={`${readerFontClass} mx-auto flex min-h-full w-full max-w-[70rem] flex-col justify-end gap-[1.05em] pb-[15vh] pl-[clamp(0.8rem,3vw,2.4rem)] pt-[11vh] font-normal leading-[1.08] tracking-normal ${scaleTokens.articleText} ${tokens.text} sm:mx-auto sm:translate-x-[clamp(0rem,1.8vw,2.2rem)] sm:gap-[1.15em] sm:pl-[clamp(1.2rem,3vw,2.8rem)] sm:leading-[1.13] lg:leading-[1.09]`}
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
      className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-30 inline-flex min-h-11 -translate-x-1/2 items-center gap-2 border px-4 py-2.5 text-[13px] font-medium shadow-[0_10px_28px_rgba(0,0,0,0.18)] transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 motion-reduce:transition-none motion-reduce:hover:-translate-y-0 ${tokens.control} ${tokens.focus}`}
    >
      <ArrowDown size={16} aria-hidden="true" />
      <span>{`↓ ${formatNewLineCount(unseenCommittedCount)} · Zum Live-Moment`}</span>
      <span className="sr-only">
      {unseenCommittedCount > 0
        ? `${unseenCommittedCount} neue Zeilen · Zurück zu Live`
        : 'Zurück zu Live'}
      </span>
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
  const [isInfoOpen, setIsInfoOpen] = useState(false);
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
  const showScrollHint = false;

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
      <header className="z-20 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 px-[clamp(1rem,4vw,3.5rem)] py-[max(0.85rem,env(safe-area-inset-top))] opacity-85">
        <LiveStatus
          state={broadcastState}
          connectionStatus={connectionStatus}
          followMode={followMode}
          unseenCommittedCount={unseenCommittedCount}
          tokens={tokens}
        />
        <div className="flex flex-wrap justify-end gap-1.5 opacity-75 transition-opacity hover:opacity-100 focus-within:opacity-100">
          <button
            type="button"
            aria-label="Info öffnen"
            title="Was passiert hier?"
            onClick={() => setIsInfoOpen(true)}
            className={`pointer-events-auto inline-flex h-9 w-9 items-center justify-center border text-[14px] font-medium leading-none transition-colors hover:bg-current/10 focus:outline-none focus-visible:ring-2 ${tokens.control} ${tokens.focus}`}
          >
            ?
          </button>
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

      <LiveInfoOverlay
        open={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        tokens={tokens}
      />

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
        className={`min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-[clamp(0.9rem,4vw,3.5rem)] pb-[max(2rem,env(safe-area-inset-bottom))] [scrollbar-width:thin] ${tokens.scrollbar}`}
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

      {followMode === 'history' && unseenCommittedCount > 0 ? (
        <ReturnToLiveButton
          unseenCommittedCount={unseenCommittedCount}
          returnToLive={returnToLive}
          tokens={tokens}
        />
      ) : null}
    </main>
  );
}
