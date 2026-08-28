'use client';

import { Bell, BellOff, Circle, Moon, Sun } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  RefObject,
  TouchEvent as ReactTouchEvent,
  WheelEvent as ReactWheelEvent,
} from 'react';

import type { BrowserLiveNotificationStatus } from '../hooks/use-browser-live-notifications';
import { useBrowserLiveNotifications } from '../hooks/use-browser-live-notifications';
import { setHeartReaction } from '../api/set-heart-reaction';
import { usePublicLiveStream } from '../hooks/use-public-live-stream';
import type { ConnectionStatus, LiveLine, PublicLiveState } from '../lib/contract';

type ReadingLiveReaderProps = {
  initialState: PublicLiveState;
  initialConnectionStatus: ConnectionStatus;
  initialError: string | null;
  streamUrl: string;
};

type LiveTheme = 'dark' | 'light';
type ReaderScale = 'small' | 'medium' | 'large';
type ReadingMode = 'live' | 'history';
type ReadingLineFocusState = 'focused' | 'nearby' | 'distant';
type ReaderInteraction = 'reading' | 'navigating';

type ReadingNavigation = {
  mode: ReadingMode;
  offset: number;
};

type VisualReaderRowBase = {
  key: string;
  text: string;
  segmentIndex: number;
  segmentCount: number;
};

type VisualCommittedRow = VisualReaderRowBase & {
  kind: 'committed';
  line: LiveLine;
};

type VisualDraftRow = VisualReaderRowBase & {
  kind: 'draft';
};

type VisualReaderRow = VisualCommittedRow | VisualDraftRow;

type ReadingVisibleWindow = {
  visibleRows: VisualReaderRow[];
  startIndex: number;
  endIndex: number;
  selected: number;
};

type ThemeTokens = {
  page: string;
  text: string;
  muted: string;
  quiet: string;
  hairline: string;
  glow: string;
  control: string;
  scrollbar: string;
  accent: string;
  focus: string;
  readerText: string;
  readerMeta: string;
  readerMetaMuted: string;
  readerMetaMutedValue: string;
  readerMetaActiveValue: string;
  readerDivider: string;
  readerFocus: string;
  readerFocusBgValue: string;
  readerFocusEdgeValue: string;
  readerAccentValue: string;
  readerHint: string;
  readerNavMutedValue: string;
  readerNavActiveValue: string;
  draft: string;
  error: string;
  errorBorder: string;
};

type ReaderInteractionTokens = {
  rowText: Record<ReadingLineFocusState, string>;
  meta: Record<ReadingLineFocusState, string>;
  hoverMeta: string;
  hoverText: string;
};

type ReaderScaleTokens = {
  label: string;
  shortLabel: string;
  fontSize: string;
  fallbackFontSizePx: number;
  emptyText: string;
};

type ReaderLayoutMetrics = {
  viewportWidth: number;
  viewportHeight: number;
  headerHeight: number;
  availableTextHeight: number;
  readerFontSize: number;
  readerLineHeight: number;
  maxRows: number;
  stackCapacity: number;
  textContentWidth: number;
  leftPadding: number;
  rightPadding: number;
  canvasFont: string;
};

type ReaderCssVars = CSSProperties & {
  '--reader-font-size': string;
  '--reader-line-h': string;
  '--reader-x-padding': string;
  '--reader-meta-rail': string;
  '--reader-heart-rail': string;
  '--reader-content-max': string;
  '--reader-meta-muted': string;
  '--reader-meta-active': string;
  '--reader-focus-bg': string;
  '--reader-focus-edge': string;
  '--reader-accent': string;
  '--reader-nav-muted': string;
  '--reader-nav-active': string;
  '--reader-history-h': string;
};

const readerFontClass =
  "[font-family:var(--gara-Font),Georgia,'Times_New_Roman',serif]";
const themeStorageKey = 'ambrecht-live-theme';
const readerScaleStorageKey = 'ambrecht-live-reader-scale';
const viewerIdStorageKey = 'ambrecht-live-viewer-id';
const heartedStoragePrefix = 'ambrecht-live-hearts:';
const readerNavigationUsedStorageKey = 'ambrecht-live-reader-navigation-used';
const contactEmail = 'tino@ambrecht.de';
const contactMailto = `mailto:${contactEmail}`;
const wheelStepThreshold = 85;
const touchStepThreshold = 42;
const maxInputStepsPerEvent = 6;
const navigatingResetDelayMs = 820;
const readerLineHeightRatio = 1.32;
const fallbackStackCapacity = 4;
const readerMetaRailWidth = '3.75rem';
const readerHeartRailWidth = '2.5rem';
const readerContentMaxWidth = 'min(72vw, 27ch)';
const readerHorizonRatio = 0.72;
const defaultReaderCanvasFont =
  "400 86px Georgia, 'Times New Roman', serif";
const emptyLiveLines: ReadonlyArray<LiveLine> = [];

const connectionLabel: Record<ConnectionStatus, string> = {
  connecting: 'Verbindung wird hergestellt ...',
  connected: 'Verbunden',
  reconnecting: 'Verbindung wird wiederhergestellt ...',
  error: 'Live-Verbindung gestoert',
};

const themeTokens: Record<LiveTheme, ThemeTokens> = {
  dark: {
    page: 'bg-[#050403]',
    text: 'text-[#f6e6c8]',
    muted: 'text-[#9f9078]',
    quiet: 'text-[#706655]',
    hairline: 'bg-[#f1e6d0]/16',
    glow: 'shadow-[0_0_34px_rgba(216,180,108,0.08)]',
    control: 'border-[#302b22] bg-[#0d0c09]/76 text-[#d8ccb8]',
    scrollbar: '[scrollbar-color:#5c5040_transparent]',
    accent: 'text-[#d8b46c]',
    focus: 'focus-visible:ring-[#d8b46c]',
    readerText: 'text-[#f6e6c8]',
    readerMeta: 'text-[#c9ad7c]',
    readerMetaMuted: 'text-[#706655]',
    readerMetaMutedValue: '#706655',
    readerMetaActiveValue: '#d8b46c',
    readerDivider: 'bg-[#f1e6d0]/16',
    readerFocus: 'bg-[#f1e6d0]/[0.025]',
    readerFocusBgValue: 'rgba(216, 180, 108, 0.115)',
    readerFocusEdgeValue: 'rgba(216, 180, 108, 0.22)',
    readerAccentValue: '#d8b46c',
    readerHint: 'text-[#9f9078]',
    readerNavMutedValue: 'rgba(159, 144, 120, 0.34)',
    readerNavActiveValue: 'rgba(216, 180, 108, 0.88)',
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
    scrollbar: '[scrollbar-color:#b9aa90_transparent]',
    accent: 'text-[#7c5a24]',
    focus: 'focus-visible:ring-[#7c5a24]',
    readerText: 'text-[#211810]',
    readerMeta: 'text-[#7c5a24]',
    readerMetaMuted: 'text-[#998a70]',
    readerMetaMutedValue: '#998a70',
    readerMetaActiveValue: '#7c5a24',
    readerDivider: 'bg-[#30271e]/14',
    readerFocus: 'bg-[#30271e]/[0.025]',
    readerFocusBgValue: 'rgba(124, 90, 36, 0.095)',
    readerFocusEdgeValue: 'rgba(124, 90, 36, 0.18)',
    readerAccentValue: '#7c5a24',
    readerHint: 'text-[#736551]',
    readerNavMutedValue: 'rgba(115, 101, 81, 0.38)',
    readerNavActiveValue: 'rgba(124, 90, 36, 0.88)',
    draft: 'text-[#2f261b]',
    error: 'bg-[#fff4e4] text-[#8b1e1e]',
    errorBorder: 'border-[#d7b897]',
  },
};

const readerInteractionTokens: Record<ReaderInteraction, ReaderInteractionTokens> = {
  reading: {
    rowText: {
      focused: 'opacity-[0.88]',
      nearby: 'opacity-[0.66]',
      distant: 'opacity-[0.44]',
    },
    meta: {
      focused: 'opacity-55',
      nearby: 'opacity-0',
      distant: 'opacity-0',
    },
    hoverMeta: 'group-hover:opacity-70',
    hoverText: 'group-hover:opacity-[0.96]',
  },
  navigating: {
    rowText: {
      focused: 'opacity-100',
      nearby: 'opacity-[0.74]',
      distant: 'opacity-[0.48]',
    },
    meta: {
      focused: 'opacity-90',
      nearby: 'opacity-30',
      distant: 'opacity-0',
    },
    hoverMeta: 'group-hover:opacity-85',
    hoverText: 'group-hover:opacity-100',
  },
};

const readerScaleTokens: Record<ReaderScale, ReaderScaleTokens> = {
  small: {
    label: 'Kleine Schrift',
    shortLabel: 'S',
    fontSize: 'clamp(2.25rem, 3.85vw, 4.5rem)',
    fallbackFontSizePx: 70,
    emptyText: 'text-[clamp(1.25rem,2.6vw,2rem)]',
  },
  medium: {
    label: 'Mittlere Schrift',
    shortLabel: 'M',
    fontSize: 'clamp(2.65rem, 4.65vw, 5.375rem)',
    fallbackFontSizePx: 86,
    emptyText: 'text-[clamp(1.38rem,2.9vw,2.35rem)]',
  },
  large: {
    label: 'Grosse Schrift',
    shortLabel: 'L',
    fontSize: 'clamp(3rem, 5.25vw, 6.125rem)',
    fallbackFontSizePx: 98,
    emptyText: 'text-[clamp(1.55rem,3.2vw,2.8rem)]',
  },
};

const lineTimeFormatter = new Intl.DateTimeFormat('de-DE', {
  hour: '2-digit',
  minute: '2-digit',
});

const scheduledDayFormatter = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

const scheduledTimeFormatter = new Intl.DateTimeFormat('de-DE', {
  hour: '2-digit',
  minute: '2-digit',
});

const scheduledAccessibleFormatter = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});

const dayMs = 24 * 60 * 60 * 1000;

function useReadingViewportLock() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previous = {
      htmlHeight: html.style.height,
      htmlMaxHeight: html.style.maxHeight,
      htmlOverflow: html.style.overflow,
      htmlOverscrollBehavior: html.style.overscrollBehavior,
      htmlOverscrollBehaviorY: html.style.overscrollBehaviorY,
      bodyHeight: body.style.height,
      bodyMaxHeight: body.style.maxHeight,
      bodyOverflow: body.style.overflow,
      bodyOverscrollBehavior: body.style.overscrollBehavior,
      bodyOverscrollBehaviorY: body.style.overscrollBehaviorY,
    };

    html.classList.add('reading-mode');
    html.style.height = '100%';
    html.style.maxHeight = '100%';
    html.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'none';
    html.style.overscrollBehaviorY = 'none';
    body.classList.add('reading-mode');
    body.style.height = '100%';
    body.style.maxHeight = '100%';
    body.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'none';
    body.style.overscrollBehaviorY = 'none';

    return () => {
      html.classList.remove('reading-mode');
      html.style.height = previous.htmlHeight;
      html.style.maxHeight = previous.htmlMaxHeight;
      html.style.overflow = previous.htmlOverflow;
      html.style.overscrollBehavior = previous.htmlOverscrollBehavior;
      html.style.overscrollBehaviorY = previous.htmlOverscrollBehaviorY;
      body.classList.remove('reading-mode');
      body.style.height = previous.bodyHeight;
      body.style.maxHeight = previous.bodyMaxHeight;
      body.style.overflow = previous.bodyOverflow;
      body.style.overscrollBehavior = previous.bodyOverscrollBehavior;
      body.style.overscrollBehaviorY = previous.bodyOverscrollBehaviorY;
    };
  }, []);
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function isReaderInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  return Boolean(
    target.closest(
      'button,a,input,textarea,select,[role="button"],[contenteditable="true"],[data-reading-info-overlay]',
    ),
  );
}

function computeFocusedIndex(rowCount: number, offset: number) {
  return clamp(
    rowCount - 1 - offset,
    0,
    Math.max(0, rowCount - 1),
  );
}

function computeReadingVisibleWindow({
  rows,
  stackCapacity,
  mode,
  offset,
}: {
  rows: ReadonlyArray<VisualReaderRow>;
  stackCapacity: number;
  mode: ReadingMode;
  offset: number;
}): ReadingVisibleWindow {
  const count =
    rows.length === 0 ? 0 : Math.max(1, Math.min(stackCapacity, rows.length));

  if (count === 0) {
    return {
      visibleRows: [],
      startIndex: 0,
      endIndex: 0,
      selected: 0,
    };
  }

  const selectedIndex =
    mode === 'history'
      ? clamp(rows.length - 1 - offset, 0, rows.length - 1)
      : rows.length - 1;
  const endIndex = selectedIndex + 1;
  const startIndex = Math.max(0, endIndex - count);

  return {
    visibleRows: rows.slice(startIndex, endIndex),
    startIndex,
    endIndex,
    selected: selectedIndex + 1,
  };
}

function getFallbackMetrics(scaleTokens: ReaderScaleTokens): ReaderLayoutMetrics {
  const readerFontSize = scaleTokens.fallbackFontSizePx;
  const readerLineHeight = Math.round(readerFontSize * readerLineHeightRatio);

  return {
    viewportWidth: 0,
    viewportHeight: 0,
    headerHeight: 0,
    availableTextHeight: 0,
    readerFontSize,
    readerLineHeight,
    maxRows: 1,
    stackCapacity: 0,
    textContentWidth: 0,
    leftPadding: 0,
    rightPadding: 0,
    canvasFont: defaultReaderCanvasFont,
  };
}

function readPx(value: string) {
  const parsed = Number.parseFloat(value || '0');
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildCanvasFont(styles: CSSStyleDeclaration, fontSizePx: number) {
  if (styles.font && styles.font !== '') return styles.font;

  return [
    styles.fontStyle || 'normal',
    styles.fontVariant || 'normal',
    styles.fontWeight || '400',
    `${fontSizePx}px`,
    styles.fontFamily || "Georgia, 'Times New Roman', serif",
  ].join(' ');
}

function sameReaderMetrics(
  current: ReaderLayoutMetrics,
  next: ReaderLayoutMetrics,
) {
  return (
    current.viewportWidth === next.viewportWidth &&
    current.viewportHeight === next.viewportHeight &&
    current.headerHeight === next.headerHeight &&
    current.availableTextHeight === next.availableTextHeight &&
    current.readerFontSize === next.readerFontSize &&
    current.readerLineHeight === next.readerLineHeight &&
    current.maxRows === next.maxRows &&
    current.stackCapacity === next.stackCapacity &&
    current.textContentWidth === next.textContentWidth &&
    current.leftPadding === next.leftPadding &&
    current.rightPadding === next.rightPadding &&
    current.canvasFont === next.canvasFont
  );
}

function useReaderLayoutMetrics({
  rootRef,
  headerRef,
  paneRef,
  textMeasureRef,
  scaleTokens,
}: {
  rootRef: RefObject<HTMLElement | null>;
  headerRef: RefObject<HTMLElement | null>;
  paneRef: RefObject<HTMLElement | null>;
  textMeasureRef: RefObject<HTMLElement | null>;
  scaleTokens: ReaderScaleTokens;
}) {
  const [metrics, setMetrics] = useState<ReaderLayoutMetrics>(() =>
    getFallbackMetrics(scaleTokens),
  );

  useEffect(() => {
    let rafId = 0;
    let disposed = false;

    const recalc = () => {
      if (disposed) return;

      const root = rootRef.current;
      const header = headerRef.current;
      const pane = paneRef.current;
      const textMeasure = textMeasureRef.current;
      if (!root || !header || !pane || !textMeasure) return;

      const rootRect = root.getBoundingClientRect();
      const headerHeight = Math.ceil(header.getBoundingClientRect().height);
      const paneStyles = window.getComputedStyle(pane);
      const textStyles = window.getComputedStyle(textMeasure);
      const readerFontSize =
        Math.round(readPx(textStyles.fontSize) * 100) / 100 ||
        scaleTokens.fallbackFontSizePx;
      const readerLineHeight = Math.max(
        1,
        Math.round(readerFontSize * readerLineHeightRatio),
      );
      const availableTextHeight = Math.max(
        0,
        Math.floor(rootRect.height) - headerHeight,
      );
      const maxRows = Math.max(
        1,
        Math.floor(availableTextHeight / readerLineHeight),
      );

      const next: ReaderLayoutMetrics = {
        viewportWidth: Math.floor(rootRect.width),
        viewportHeight: Math.floor(rootRect.height),
        headerHeight,
        availableTextHeight,
        readerFontSize,
        readerLineHeight,
        maxRows,
        stackCapacity: Math.max(0, maxRows - 1),
        textContentWidth: Math.floor(textMeasure.getBoundingClientRect().width),
        leftPadding: Math.round(readPx(paneStyles.paddingLeft)),
        rightPadding: Math.round(readPx(paneStyles.paddingRight)),
        canvasFont: buildCanvasFont(textStyles, readerFontSize),
      };

      setMetrics((current) => (sameReaderMetrics(current, next) ? current : next));
    };

    const scheduleRecalc = () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        recalc();
      });
    };

    recalc();

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(scheduleRecalc);
    const root = rootRef.current;
    const header = headerRef.current;
    const pane = paneRef.current;
    const textMeasure = textMeasureRef.current;
    if (root) resizeObserver?.observe(root);
    if (header) resizeObserver?.observe(header);
    if (pane) resizeObserver?.observe(pane);
    if (textMeasure) resizeObserver?.observe(textMeasure);

    window.addEventListener('resize', scheduleRecalc);
    window.addEventListener('orientationchange', scheduleRecalc);
    window.visualViewport?.addEventListener('resize', scheduleRecalc);
    void document.fonts?.ready.then(scheduleRecalc).catch(() => {});

    return () => {
      disposed = true;
      if (rafId) window.cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', scheduleRecalc);
      window.removeEventListener('orientationchange', scheduleRecalc);
      window.visualViewport?.removeEventListener('resize', scheduleRecalc);
    };
  }, [headerRef, paneRef, rootRef, scaleTokens, textMeasureRef]);

  return metrics;
}

function createCanvasMeasure(font: string) {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return null;

  context.font = font || defaultReaderCanvasFont;
  return (text: string) => context.measureText(text).width;
}

function splitTokenToFit(
  token: string,
  maxWidth: number,
  measure: (text: string) => number,
) {
  if (token.length <= 1) return token;

  let low = 1;
  let high = token.length;
  let best = 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const candidate = token.slice(0, mid);
    if (measure(candidate) <= maxWidth) {
      best = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return token.slice(0, Math.max(1, best));
}

function wrapTextToVisualSegments({
  text,
  maxWidth,
  measure,
}: {
  text: string;
  maxWidth: number;
  measure: (text: string) => number;
}) {
  const normalizedText = text.replace(/\r\n|\r|\n/g, ' ').trim();
  if (normalizedText.length === 0) return [''];
  if (maxWidth <= 0) return [normalizedText];

  const segments: string[] = [];
  const tokens = normalizedText.split(/(\s+)/).filter((token) => token.length > 0);
  let current = '';

  for (const rawToken of tokens) {
    const token = current.length === 0 ? rawToken.trimStart() : rawToken;
    if (token.length === 0) continue;

    const candidate = `${current}${token}`;
    if (measure(candidate) <= maxWidth) {
      current = candidate;
      continue;
    }

    if (current.trimEnd().length > 0) {
      segments.push(current.trimEnd());
      current = '';
    }

    let remaining = token.trimStart();
    while (remaining.length > 0 && measure(remaining) > maxWidth) {
      const fit = splitTokenToFit(remaining, maxWidth, measure);
      segments.push(fit);
      remaining = remaining.slice(fit.length);
    }
    current = remaining;
  }

  if (current.trimEnd().length > 0) {
    segments.push(current.trimEnd());
  }

  return segments.length > 0 ? segments : [''];
}

function deriveVisualRows(
  lines: ReadonlyArray<LiveLine>,
  textContentWidth: number,
  canvasFont: string,
): VisualReaderRow[] {
  const measure = createCanvasMeasure(canvasFont);
  if (!measure) {
    return lines.map((line) => ({
      kind: 'committed',
      key: `${line.id}:0`,
      line,
      text: line.text,
      segmentIndex: 0,
      segmentCount: 1,
    }));
  }

  return lines.flatMap((line) => {
    const segments = wrapTextToVisualSegments({
      text: line.text,
      maxWidth: textContentWidth,
      measure,
    });

    return segments.map((segment, segmentIndex) => ({
      kind: 'committed',
      key: `${line.id}:${segmentIndex}`,
      line,
      text: segment,
      segmentIndex,
      segmentCount: segments.length,
    }));
  });
}

function deriveDraftVisualRows(
  text: string,
  textContentWidth: number,
  canvasFont: string,
): VisualReaderRow[] {
  if (text.length === 0) return [];

  const measure = createCanvasMeasure(canvasFont);
  const segments = measure
    ? wrapTextToVisualSegments({
        text,
        maxWidth: textContentWidth,
        measure,
      })
    : [text];

  return segments.map((segment, segmentIndex) => ({
    kind: 'draft',
    key: `draft:${segmentIndex}:${segment}`,
    text: segment,
    segmentIndex,
    segmentCount: segments.length,
  }));
}

const formatViewerCount = (count: number) =>
  count === 1 ? '1 liest mit' : `${count} lesen mit`;

const getHeartedStorageKey = (broadcastId: string) =>
  `${heartedStoragePrefix}${broadcastId}`;

function readHeartedLineIds(broadcastId: string): Set<string> {
  try {
    const raw = window.localStorage.getItem(getHeartedStorageKey(broadcastId));
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];

    if (!Array.isArray(parsed)) return new Set();

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
    // The reaction still works for the current page session.
  }
}

function removeHeartedLineIds(broadcastId: string) {
  try {
    window.localStorage.removeItem(getHeartedStorageKey(broadcastId));
  } catch {
    // Best-effort cleanup only.
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

function getLineMinuteKey(publishedAt: string) {
  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) return publishedAt;

  return [
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
  ].join(':');
}

function formatHistoryDistance(count: number) {
  return count === 1 ? '1 Zeile voraus' : `${count} Zeilen voraus`;
}

function getLocalDayTime(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function formatScheduledDay(date: Date, now: number | null) {
  if (now !== null) {
    const today = getLocalDayTime(new Date(now));
    const scheduledDay = getLocalDayTime(date);
    const diffDays = Math.round((scheduledDay - today) / dayMs);

    if (diffDays === 0) return 'Heute';
    if (diffDays === 1) return 'Morgen';
  }

  return scheduledDayFormatter.format(date);
}

function getScheduledDate(scheduledAt: string) {
  const date = new Date(scheduledAt);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatCountdownTime(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, '0'))
    .join(' : ');
}

function getInitialTheme(): LiveTheme {
  if (typeof window === 'undefined') return 'dark';

  try {
    const storedTheme = window.localStorage.getItem(themeStorageKey);
    if (storedTheme === 'dark' || storedTheme === 'light') return storedTheme;
  } catch {
    // Fall back to system preference.
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
    // Keep the default scale.
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
      // The visual toggle still works without persistence.
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
      // The visual choice still works without persistence.
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

  return { ensureViewerId };
}

function ReadingHeader({
  headerRef,
  state,
  connectionStatus,
  error,
  followMode,
  historyDistance,
  unseenCommittedCount,
  readerScale,
  setReaderScale,
  isReaderScaleHydrated,
  theme,
  setTheme,
  isThemeHydrated,
  browserNotificationStatus,
  onEnableBrowserNotifications,
  onOpenInfo,
  tokens,
}: {
  headerRef: RefObject<HTMLElement | null>;
  state: PublicLiveState;
  connectionStatus: ConnectionStatus;
  error: string | null;
  followMode: ReadingMode;
  historyDistance: number;
  unseenCommittedCount: number;
  readerScale: ReaderScale;
  setReaderScale: (scale: ReaderScale) => void;
  isReaderScaleHydrated: boolean;
  theme: LiveTheme;
  setTheme: (theme: LiveTheme) => void;
  isThemeHydrated: boolean;
  browserNotificationStatus: BrowserLiveNotificationStatus;
  onEnableBrowserNotifications: () => void;
  onOpenInfo: () => void;
  tokens: ThemeTokens;
}) {
  const liveCopy =
    state.status === 'live'
      ? followMode === 'history'
        ? `LIVE · ${formatHistoryDistance(Math.max(historyDistance, unseenCommittedCount))}`
        : `LIVE · ${formatViewerCount(state.viewerCount)}`
      : connectionStatus === 'connecting' || connectionStatus === 'reconnecting'
        ? connectionLabel[connectionStatus]
        : 'Nicht live';
  const scaleOrder: ReaderScale[] = ['small', 'medium', 'large'];
  const nextScale =
    scaleOrder[(scaleOrder.indexOf(readerScale) + 1) % scaleOrder.length];
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  const browserNotificationLabel =
    browserNotificationStatus === 'enabled'
      ? 'Browser-Benachrichtigung aktiv'
      : browserNotificationStatus === 'blocked'
        ? 'Browser-Benachrichtigung blockiert'
        : browserNotificationStatus === 'unsupported'
          ? 'Browser-Benachrichtigung nicht verfuegbar'
          : 'Browser-Benachrichtigung aktivieren';
  const canEnableBrowserNotifications =
    browserNotificationStatus !== 'enabled' &&
    browserNotificationStatus !== 'blocked' &&
    browserNotificationStatus !== 'unsupported';

  const quietControlClass = `inline-flex h-9 min-w-9 items-center justify-center border border-transparent bg-transparent transition-[color,background-color,border-color,opacity] hover:border-current/10 hover:bg-current/[0.045] hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-25 ${tokens.quiet} ${tokens.focus}`;

  return (
    <header
      ref={headerRef}
      data-reading-header
      className="z-20 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 px-[clamp(0.9rem,2.4vw,2.25rem)] py-[max(0.72rem,env(safe-area-inset-top))]"
    >
      <div className="min-w-0">
        <div
          className={`flex min-w-0 items-center gap-2 overflow-hidden whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.18em] ${tokens.muted}`}
        >
          {state.status === 'live' ? (
            <span aria-hidden="true" className={tokens.accent}>
              <Circle size={8} fill="currentColor" strokeWidth={0} />
            </span>
          ) : null}
          <span className="truncate">{liveCopy}</span>
        </div>

        {state.status === 'live' ? (
          <a
            href={contactMailto}
            className={`mt-1.5 block w-fit max-w-[min(42vw,20rem)] truncate text-[9px] normal-case tracking-normal opacity-65 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 ${tokens.quiet} ${tokens.focus}`}
          >
            {contactEmail}
          </a>
        ) : null}

        {error ? (
          <p
            className={`mt-3 max-w-[40rem] border px-4 py-3 text-sm normal-case tracking-normal ${tokens.errorBorder} ${tokens.error}`}
          >
            {error}
          </p>
        ) : null}
      </div>

      <div
        role="group"
        aria-label="Live-Ansicht Einstellungen"
        className="flex flex-wrap justify-end gap-0.5 opacity-[0.38] transition-opacity duration-200 hover:opacity-100 focus-within:opacity-100"
      >
        <button
          type="button"
          aria-label={browserNotificationLabel}
          aria-pressed={browserNotificationStatus === 'enabled'}
          title={browserNotificationLabel}
          disabled={!canEnableBrowserNotifications}
          onClick={onEnableBrowserNotifications}
          className={quietControlClass}
        >
          {browserNotificationStatus === 'enabled' ? (
            <Bell size={15} aria-hidden="true" />
          ) : (
            <BellOff size={15} aria-hidden="true" />
          )}
        </button>

        <button
          type="button"
          aria-label="Info oeffnen"
          title="Was passiert hier?"
          onClick={onOpenInfo}
          className={`${quietControlClass} text-[14px] font-medium leading-none`}
        >
          ?
        </button>

        <button
          type="button"
          aria-label={`Schriftgroesse aendern, aktuell: ${readerScaleTokens[readerScale].label}`}
          title={`Schriftgroesse: ${readerScaleTokens[readerScale].label}`}
          onClick={() => setReaderScale(nextScale)}
          className={`${quietControlClass} gap-1 px-2.5`}
        >
          <span className="font-serif text-[18px] leading-none">Aa</span>
          <span aria-hidden="true" className="text-[8px] opacity-65">
            {readerScaleTokens[readerScale].shortLabel}
          </span>
          {!isReaderScaleHydrated ? (
            <span className="sr-only">Schriftgroesse wird geladen</span>
          ) : null}
        </button>

        <button
          type="button"
          aria-label={theme === 'dark' ? 'Light Mode einschalten' : 'Dark Mode einschalten'}
          aria-pressed={theme === 'dark'}
          title={theme === 'dark' ? 'Light Mode einschalten' : 'Dark Mode einschalten'}
          onClick={() => setTheme(nextTheme)}
          className={quietControlClass}
        >
          {theme === 'dark' ? (
            <Moon size={15} aria-hidden="true" />
          ) : (
            <Sun size={15} aria-hidden="true" />
          )}
          {!isThemeHydrated ? (
            <span className="sr-only">Theme wird geladen</span>
          ) : null}
        </button>
      </div>
    </header>
  );
}

function ReadingInfoOverlay({
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
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      data-reading-info-overlay
      className="fixed inset-0 z-40 flex items-start justify-end overflow-y-auto overscroll-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(4.25rem,env(safe-area-inset-top))] sm:px-[clamp(1rem,4vw,3.5rem)]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="reading-info-title"
        className={`max-h-[calc(100dvh-5.5rem)] w-full max-w-[22rem] overflow-y-auto overscroll-contain border px-5 py-5 text-[14px] leading-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-md ${tokens.control}`}
      >
        <div className="flex items-start justify-between gap-4">
          <h2
            id="reading-info-title"
            className={`${readerFontClass} text-[1.35rem] font-normal leading-tight ${tokens.text}`}
          >
            Was passiert hier?
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Info schliessen"
            onClick={onClose}
            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-lg leading-none hover:bg-current/10 focus:outline-none focus-visible:ring-2 ${tokens.focus}`}
          >
            x
          </button>
        </div>
        <div className={`mt-4 space-y-3 ${tokens.muted}`}>
          <p>Hier entsteht ein Text live.</p>
          <p>Buchstabe fuer Buchstabe. Zeile fuer Zeile.</p>
          <p>
            Fertige Zeilen stehen im Verlauf. Die aktuelle Zeile bleibt unten
            als Gegenwart sichtbar.
          </p>
        </div>
        <div className={`mt-5 h-px w-full ${tokens.hairline}`} />
        <address className={`mt-4 not-italic leading-6 ${tokens.muted}`}>
          <a
            href={contactMailto}
            className={`underline decoration-current/30 underline-offset-4 hover:decoration-current focus:outline-none focus-visible:ring-2 ${tokens.focus}`}
          >
            {contactEmail}
          </a>
        </address>
      </section>
    </div>
  );
}

function ReadingCommittedLine({
  row,
  heartCount,
  hearted,
  isPending,
  focusState,
  isFocusedLine,
  showTime,
  interaction,
  onToggleHeart,
  tokens,
}: {
  row: VisualCommittedRow;
  heartCount: number;
  hearted: boolean;
  isPending: boolean;
  focusState: ReadingLineFocusState;
  isFocusedLine: boolean;
  showTime: boolean;
  interaction: ReaderInteraction;
  onToggleHeart: (line: LiveLine) => void;
  tokens: ThemeTokens;
}) {
  const line = row.line;
  const lineTime = formatLineTime(line.publishedAt);
  const showLineTools = row.segmentIndex === 0;
  const interactionTone = readerInteractionTokens[interaction];
  const textFocusTone = interactionTone.rowText[focusState];
  const metaFocusTone = interactionTone.meta[focusState];
  const metaActiveTone = isFocusedLine
    ? 'text-[var(--reader-meta-active)] opacity-75'
    : `${tokens.readerMetaMuted} ${metaFocusTone}`;
  const heartActiveTone = hearted
    ? `${tokens.accent} opacity-75`
    : heartCount > 0
      ? `${tokens.quiet} opacity-[0.24]`
      : `${tokens.quiet} opacity-0`;
  const focusTextShadow =
    interaction === 'navigating' && isFocusedLine
      ? '[text-shadow:0_0_18px_rgba(216,180,108,0.10)]'
      : '';

  return (
    <article
      data-reading-row
      data-reading-line
      data-reading-committed-line
      data-line-id={line.id}
      data-row-key={row.key}
      data-segment-index={row.segmentIndex}
      data-segment-count={row.segmentCount}
      data-focus-state={focusState}
      data-focused-line={isFocusedLine ? 'true' : undefined}
      data-reader-interaction={interaction}
      className="group relative grid min-w-0 grid-cols-[minmax(0,1fr)_var(--reader-meta-rail)_minmax(0,var(--reader-content-max))_var(--reader-heart-rail)_minmax(0,1fr)] items-start gap-x-[clamp(0.3rem,0.55vw,0.65rem)] overflow-hidden whitespace-pre transition-[opacity] duration-200 ease-out motion-reduce:transition-none"
      style={{
        height: 'var(--reader-line-h)',
        lineHeight: 'var(--reader-line-h)',
      }}
    >
      {showTime ? (
        <time
          dateTime={line.publishedAt}
          className={`relative z-10 col-start-2 mt-[0.48em] select-none text-right text-[0.16em] font-medium leading-none tabular-nums transition-[color,opacity,text-shadow] duration-200 ease-out motion-reduce:transition-none ${metaActiveTone} ${interactionTone.hoverMeta} group-focus-within:opacity-90 ${focusTextShadow}`}
        >
          {lineTime}
        </time>
      ) : null}

      <span
        className={`relative z-10 col-start-3 block min-w-0 max-w-full overflow-hidden transition-[opacity,text-shadow] duration-200 ease-out motion-reduce:transition-none ${tokens.readerText} ${textFocusTone} ${interactionTone.hoverText} ${focusTextShadow}`}
      >
        {row.text}
      </span>

      {showLineTools ? (
        <button
          type="button"
          aria-pressed={hearted}
          aria-label={
            hearted
              ? `Reaktion fuer diese Zeile entfernen${heartCount > 0 ? `, ${heartCount} Reaktionen` : ''}`
              : `Auf diese Zeile reagieren${heartCount > 0 ? `, ${heartCount} Reaktionen vorhanden` : ''}`
          }
          title={hearted ? 'Reaktion entfernen' : 'Auf diese Zeile reagieren'}
          disabled={isPending}
          onClick={() => onToggleHeart(line)}
          className={`relative z-10 col-start-4 mt-[0.31em] inline-flex min-h-10 min-w-10 origin-left items-center justify-start gap-1 rounded-sm px-1 text-[0.16em] font-medium leading-none transition-[color,opacity,text-shadow] duration-200 ease-out hover:opacity-90 focus:opacity-95 focus:outline-none focus-visible:ring-2 disabled:cursor-wait disabled:opacity-55 motion-reduce:transition-none ${tokens.focus} ${heartActiveTone} group-hover:opacity-75 group-focus-within:opacity-90 ${focusTextShadow}`}
        >
          <span aria-hidden="true">
            {hearted ? '♥' : heartCount > 0 ? '•' : '♡'}
          </span>
          {heartCount > 0 ? (
            <span className="opacity-0 transition-opacity duration-150 group-hover:opacity-65 group-focus-within:opacity-70 motion-reduce:transition-none">
              {heartCount}
            </span>
          ) : null}
        </button>
      ) : null}
    </article>
  );
}

function ReadingDraftStackLine({
  row,
  focusState,
  interaction,
  tokens,
}: {
  row: VisualDraftRow;
  focusState: ReadingLineFocusState;
  interaction: ReaderInteraction;
  tokens: ThemeTokens;
}) {
  const interactionTone = readerInteractionTokens[interaction];
  const textFocusTone = interactionTone.rowText[focusState];
  const focusTextShadow =
    interaction === 'navigating' && focusState === 'focused'
      ? '[text-shadow:0_0_18px_rgba(216,180,108,0.10)]'
      : '';

  return (
    <article
      data-reading-row
      data-reading-draft-stack-line
      data-row-key={row.key}
      data-segment-index={row.segmentIndex}
      data-segment-count={row.segmentCount}
      data-focus-state={focusState}
      data-reader-interaction={interaction}
      className="grid min-w-0 grid-cols-[minmax(0,1fr)_var(--reader-meta-rail)_minmax(0,var(--reader-content-max))_var(--reader-heart-rail)_minmax(0,1fr)] items-start gap-x-[clamp(0.3rem,0.55vw,0.65rem)] overflow-hidden whitespace-pre"
      style={{
        height: 'var(--reader-line-h)',
        lineHeight: 'var(--reader-line-h)',
      }}
    >
      <span
        className={`col-start-3 block min-w-0 max-w-full overflow-hidden transition-[opacity,text-shadow] duration-200 ease-out motion-reduce:transition-none ${tokens.draft} ${textFocusTone} ${interactionTone.hoverText} ${focusTextShadow}`}
      >
        {row.text}
      </span>
    </article>
  );
}

function ReadingNavigationRail({
  canNavigateOlder,
  canNavigateNewer,
  interaction,
  showNavigationHint,
  tokens,
}: {
  canNavigateOlder: boolean;
  canNavigateNewer: boolean;
  interaction: ReaderInteraction;
  showNavigationHint: boolean;
  tokens: ThemeTokens;
}) {
  const isNavigating = interaction === 'navigating';
  const railOpacity = isNavigating
    ? 'opacity-80'
    : showNavigationHint
      ? 'opacity-[0.16]'
      : 'opacity-0';
  const activeColor = isNavigating
    ? 'text-[var(--reader-nav-active)]'
    : 'text-[var(--reader-nav-muted)]';

  return (
    <div
      data-reading-navigation-rail
      data-reader-interaction={interaction}
      className={`pointer-events-none absolute left-[max(0.75rem,env(safe-area-inset-left))] top-1/2 z-20 flex h-[min(38vh,18rem)] -translate-y-1/2 flex-col items-center justify-center text-[clamp(0.68rem,0.9vw,0.82rem)] font-medium uppercase tracking-[0.13em] transition-opacity duration-200 motion-reduce:transition-none ${railOpacity} ${activeColor}`}
      aria-hidden="true"
    >
      <span className={`h-1.5 w-1.5 rounded-full border border-current/45 ${canNavigateOlder ? 'opacity-75' : 'opacity-15'}`} />
      <span className="my-2 min-h-0 flex-1 w-px bg-current/16" />
      <span className="h-2 w-2 rounded-full bg-current" />
      <span className="my-2 min-h-0 flex-1 w-px bg-current/16" />
      <span className={`h-1.5 w-1.5 rounded-full border border-current/45 ${canNavigateNewer ? 'opacity-75' : 'opacity-15'}`} />
      {showNavigationHint ? (
        <div
          data-reading-navigation-hint
          className={`pointer-events-none absolute left-[calc(100%+0.85rem)] top-1/2 w-[min(13rem,48vw)] -translate-y-1/2 text-left text-[clamp(0.64rem,0.85vw,0.76rem)] normal-case leading-5 tracking-normal opacity-70 ${tokens.readerHint}`}
        >
          <span className="hidden sm:inline">Scrollen: Vergangenheit lesen</span>
          <span className="sm:hidden">Wischen: Vergangenheit lesen</span>
        </div>
      ) : null}
    </div>
  );
}

function BrowserNotificationPrompt({
  status,
  onEnable,
  tokens,
}: {
  status: BrowserLiveNotificationStatus;
  onEnable: () => void;
  tokens: ThemeTokens;
}) {
  const label =
    status === 'enabled'
      ? 'Browser-Benachrichtigung aktiv'
      : status === 'blocked'
        ? 'Browser-Benachrichtigung blockiert'
        : status === 'unsupported'
          ? 'Browser-Benachrichtigung nicht verfuegbar'
          : 'Browser-Benachrichtigung aktivieren';
  const disabled = status !== 'idle';

  return (
    <button
      type="button"
      onClick={onEnable}
      disabled={disabled}
      className={`mt-7 inline-flex min-h-10 items-center justify-center gap-2 border px-4 text-[12px] font-medium uppercase tracking-[0.13em] transition-colors hover:bg-current/10 focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-55 ${tokens.control} ${tokens.focus}`}
    >
      {status === 'enabled' ? (
        <Bell size={15} aria-hidden="true" />
      ) : (
        <BellOff size={15} aria-hidden="true" />
      )}
      <span>{label}</span>
    </button>
  );
}

function OfflineReadingView({
  paneRef,
  browserNotificationStatus,
  onEnableBrowserNotifications,
  tokens,
}: {
  paneRef: RefObject<HTMLElement | null>;
  browserNotificationStatus: BrowserLiveNotificationStatus;
  onEnableBrowserNotifications: () => void;
  tokens: ThemeTokens;
}) {
  return (
    <section
      ref={paneRef}
      data-reading-history
      data-reading-history-pane
      className="h-full max-h-full min-h-0 min-w-0 overflow-hidden px-[var(--reader-x-padding)]"
    >
      <div className="flex min-h-full w-full flex-col justify-center pb-[8vh]">
        <p
          className={`${readerFontClass} max-w-[13ch] text-[clamp(2.4rem,6vw,5rem)] font-normal leading-[1.08] tracking-normal ${tokens.text}`}
        >
          Gerade findet keine Live-Session statt.
        </p>
        <p className={`mt-5 max-w-[34rem] text-[17px] leading-7 ${tokens.muted}`}>
          Bitte warte, bis es wieder losgeht.
        </p>
        <BrowserNotificationPrompt
          status={browserNotificationStatus}
          onEnable={onEnableBrowserNotifications}
          tokens={tokens}
        />
      </div>
    </section>
  );
}

function LiveCountdown({
  scheduledAt,
  tokens,
}: {
  scheduledAt: string;
  tokens: ThemeTokens;
}) {
  const [now, setNow] = useState<number | null>(null);
  const scheduledDate = getScheduledDate(scheduledAt);

  useEffect(() => {
    const date = getScheduledDate(scheduledAt);
    if (!date) {
      setNow(null);
      return;
    }

    let intervalId: number | null = null;

    const updateNow = () => {
      const currentNow = Date.now();
      setNow(currentNow);

      if (date.getTime() <= currentNow && intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    };

    intervalId = window.setInterval(updateNow, 1000);
    updateNow();

    return () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [scheduledAt]);

  if (!scheduledDate || now === null) {
    return (
      <p className={`mt-8 text-[14px] leading-6 ${tokens.muted}`}>
        Der Zeitpunkt dient zur Orientierung.
      </p>
    );
  }

  const remaining = scheduledDate.getTime() - now;

  if (remaining <= 0) {
    return (
      <div className="mt-8">
        <p
          className={`${readerFontClass} text-[clamp(1.45rem,3.2vw,2.55rem)] font-normal leading-tight ${tokens.text}`}
        >
          Sollte bald weitergehen.
        </p>
        <p className={`mt-3 text-[14px] leading-6 ${tokens.muted}`}>
          Der Zeitpunkt dient zur Orientierung.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <p
        aria-hidden="true"
        className={`${readerFontClass} text-[clamp(2rem,5.2vw,4.25rem)] font-normal leading-none tabular-nums tracking-normal ${tokens.text}`}
      >
        {formatCountdownTime(remaining)}
      </p>
      <p className={`mt-4 text-[13px] leading-6 ${tokens.muted}`}>
        bis zum angekuendigten Zeitpunkt
      </p>
    </div>
  );
}

function UpcomingLiveView({
  scheduledAt,
  paneRef,
  browserNotificationStatus,
  onEnableBrowserNotifications,
  tokens,
}: {
  scheduledAt: string;
  paneRef: RefObject<HTMLElement | null>;
  browserNotificationStatus: BrowserLiveNotificationStatus;
  onEnableBrowserNotifications: () => void;
  tokens: ThemeTokens;
}) {
  const [formatNow, setFormatNow] = useState<number | null>(null);
  const scheduledDate = getScheduledDate(scheduledAt);

  useEffect(() => {
    setFormatNow(Date.now());
  }, [scheduledAt]);

  if (!scheduledDate) {
    return (
      <OfflineReadingView
        paneRef={paneRef}
        browserNotificationStatus={browserNotificationStatus}
        onEnableBrowserNotifications={onEnableBrowserNotifications}
        tokens={tokens}
      />
    );
  }

  const dayLabel = formatScheduledDay(scheduledDate, formatNow);
  const timeLabel = scheduledTimeFormatter.format(scheduledDate);
  const accessibleSchedule = scheduledAccessibleFormatter.format(scheduledDate);

  return (
    <section
      ref={paneRef}
      data-reading-history
      data-reading-history-pane
      data-reading-upcoming-live
      aria-labelledby="upcoming-live-title"
      className="h-full max-h-full min-h-0 min-w-0 overflow-hidden px-[var(--reader-x-padding)]"
    >
      <div className="mx-auto flex min-h-full w-full max-w-[58rem] flex-col items-center justify-center pb-[8vh] text-center">
        <p
          id="upcoming-live-title"
          className={`text-[10px] font-medium uppercase tracking-[0.24em] ${tokens.muted}`}
        >
          Voraussichtlich wieder live
        </p>
        <time
          dateTime={scheduledAt}
          className={`${readerFontClass} mt-8 block max-w-full text-[clamp(2.75rem,9vw,7rem)] font-normal leading-[0.98] tracking-normal ${tokens.text} [overflow-wrap:anywhere]`}
        >
          {dayLabel}
        </time>
        <p
          className={`${readerFontClass} mt-4 text-[clamp(2.25rem,7vw,5.1rem)] font-normal leading-none tracking-normal ${tokens.accent}`}
        >
          {timeLabel}
        </p>
        <p className="sr-only">
          Voraussichtlich wieder live: {accessibleSchedule} Uhr.
        </p>
        <LiveCountdown scheduledAt={scheduledAt} tokens={tokens} />
        <BrowserNotificationPrompt
          status={browserNotificationStatus}
          onEnable={onEnableBrowserNotifications}
          tokens={tokens}
        />
      </div>
    </section>
  );
}

function ReadingHistoryPane({
  state,
  paneRef,
  textMeasureRef,
  visibleRows,
  visualRowCount,
  stackCapacity,
  windowStartIndex,
  focusedIndex,
  focusedLineId,
  navigation,
  interaction,
  showNavigationHint,
  canNavigateOlder,
  canNavigateNewer,
  onWheel,
  onKeyDown,
  browserNotificationStatus,
  onEnableBrowserNotifications,
  tokens,
  heartedLineIds,
  pendingLineIds,
  optimisticHeartCounts,
  onToggleHeart,
}: {
  state: PublicLiveState;
  paneRef: RefObject<HTMLElement | null>;
  textMeasureRef: RefObject<HTMLSpanElement | null>;
  visibleRows: ReadonlyArray<VisualReaderRow>;
  visualRowCount: number;
  stackCapacity: number;
  windowStartIndex: number;
  focusedIndex: number;
  focusedLineId: string | null;
  navigation: ReadingNavigation;
  interaction: ReaderInteraction;
  showNavigationHint: boolean;
  canNavigateOlder: boolean;
  canNavigateNewer: boolean;
  onWheel: (event: ReactWheelEvent<HTMLElement>) => void;
  onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void;
  browserNotificationStatus: BrowserLiveNotificationStatus;
  onEnableBrowserNotifications: () => void;
  tokens: ThemeTokens;
  heartedLineIds: ReadonlySet<string>;
  pendingLineIds: ReadonlySet<string>;
  optimisticHeartCounts: ReadonlyMap<string, number>;
  onToggleHeart: (line: LiveLine) => void;
}) {
  if (state.status === 'offline') {
    if (state.nextLiveAt) {
      return (
        <UpcomingLiveView
          scheduledAt={state.nextLiveAt}
          paneRef={paneRef}
          browserNotificationStatus={browserNotificationStatus}
          onEnableBrowserNotifications={onEnableBrowserNotifications}
          tokens={tokens}
        />
      );
    }

    return (
      <OfflineReadingView
        paneRef={paneRef}
        browserNotificationStatus={browserNotificationStatus}
        onEnableBrowserNotifications={onEnableBrowserNotifications}
        tokens={tokens}
      />
    );
  }

  const isEmpty = state.lines.length === 0 && !state.activeDraft;

  return (
    <section
      ref={paneRef}
      data-reading-history
      data-reading-history-pane
      data-reading-mode={navigation.mode}
      data-reading-offset={navigation.offset}
      data-reader-interaction={interaction}
      data-focused-index={focusedIndex}
      data-focused-line-id={focusedLineId ?? ''}
      data-window-start-index={windowStartIndex}
      data-visible-line-count={visibleRows.length}
      data-visible-row-count={visibleRows.length}
      data-total-line-count={state.lines.length}
      data-total-visual-row-count={visualRowCount}
      data-stack-capacity={stackCapacity}
      role="list"
      aria-label="Live-Verlauf"
      tabIndex={0}
      onWheel={onWheel}
      onKeyDown={onKeyDown}
      className={`relative h-full max-h-full min-h-0 min-w-0 touch-none overflow-hidden overscroll-none px-[var(--reader-x-padding)] outline-none focus-visible:ring-2 ${tokens.focus}`}
    >
      <ReadingNavigationRail
        canNavigateOlder={canNavigateOlder}
        canNavigateNewer={canNavigateNewer}
        interaction={interaction}
        showNavigationHint={showNavigationHint}
        tokens={tokens}
      />
      <div
        data-reading-history-stack
        className={`${readerFontClass} relative flex h-full min-h-0 w-full flex-col justify-end gap-0 overflow-hidden font-normal tracking-normal ${tokens.text}`}
        style={{
          fontSize: 'var(--reader-font-size)',
          lineHeight: 'var(--reader-line-h)',
          letterSpacing: 0,
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 grid grid-cols-[minmax(0,1fr)_var(--reader-meta-rail)_minmax(0,var(--reader-content-max))_var(--reader-heart-rail)_minmax(0,1fr)] gap-x-[clamp(0.3rem,0.55vw,0.65rem)] opacity-0"
        >
          <span
            ref={textMeasureRef}
            data-reading-text-measure
            className="col-start-3"
          >
            MgypqQ
          </span>
        </div>
        {isEmpty ? (
          <p className={`leading-[1.18] text-[0.72em] ${tokens.muted}`}>
            Live verbunden. Warte auf den ersten Satz.
          </p>
        ) : null}

        {visibleRows.map((row, visibleIndex) => {
          const actualIndex = windowStartIndex + visibleIndex;
          const distanceFromFocus = Math.abs(actualIndex - focusedIndex);
          const isFocusedLine =
            row.kind === 'committed' && row.line.id === focusedLineId;
          const focusState: ReadingLineFocusState =
            isFocusedLine || distanceFromFocus === 0
              ? 'focused'
              : distanceFromFocus === 1
                ? 'nearby'
                : 'distant';

          let previousCommittedLine: LiveLine | null = null;
          if (row.kind === 'committed' && row.segmentIndex === 0) {
            for (let index = visibleIndex - 1; index >= 0; index -= 1) {
              const candidate = visibleRows[index];
              if (
                candidate?.kind === 'committed' &&
                candidate.line.id !== row.line.id
              ) {
                previousCommittedLine = candidate.line;
                break;
              }
            }
          }
          const showTime =
            row.kind === 'committed' &&
            row.segmentIndex === 0 &&
            (!previousCommittedLine ||
              getLineMinuteKey(previousCommittedLine.publishedAt) !==
                getLineMinuteKey(row.line.publishedAt));

          if (row.kind === 'draft') {
            return (
              <ReadingDraftStackLine
                key={row.key}
                row={row}
                focusState={focusState}
                interaction={interaction}
                tokens={tokens}
              />
            );
          }

          return (
            <ReadingCommittedLine
              key={row.key}
              row={row}
              heartCount={optimisticHeartCounts.get(row.line.id) ?? row.line.heartCount}
              hearted={heartedLineIds.has(row.line.id)}
              isPending={pendingLineIds.has(row.line.id)}
              focusState={focusState}
              isFocusedLine={isFocusedLine}
              showTime={showTime}
              interaction={interaction}
              onToggleHeart={onToggleHeart}
              tokens={tokens}
            />
          );
        })}
      </div>
    </section>
  );
}

function ReadingActiveDraft({
  text,
  tokens,
  isFocused,
  showReturnToLive,
  historyDistance,
  unseenCommittedCount,
  onReturnToLive,
}: {
  text: string;
  tokens: ThemeTokens;
  isFocused: boolean;
  showReturnToLive: boolean;
  historyDistance: number;
  unseenCommittedCount: number;
  onReturnToLive: () => void;
}) {
  const hasText = text.length > 0;
  const returnToLiveLabel =
    unseenCommittedCount > 0
      ? `↓ ${unseenCommittedCount} neue ${unseenCommittedCount === 1 ? 'Zeile' : 'Zeilen'} · Zu Live`
      : `↓ ${formatHistoryDistance(historyDistance)} · Zu Live`;

  return (
    <section
      data-reading-active-draft
      data-focused-line={isFocused ? 'true' : undefined}
      aria-label="Gegenwart des Live-Texts"
      className={`relative min-w-0 touch-none overflow-visible px-[var(--reader-x-padding)] ${readerFontClass} font-normal tracking-normal`}
      style={{
        height: 'var(--reader-line-h)',
        fontSize: 'var(--reader-font-size)',
        lineHeight: 'var(--reader-line-h)',
        letterSpacing: 0,
      }}
    >
      {showReturnToLive ? (
        <button
          type="button"
          onClick={onReturnToLive}
          className={`absolute left-1/2 top-0 z-30 inline-flex min-h-10 -translate-x-1/2 -translate-y-[calc(100%+0.55rem)] items-center px-3 py-2 text-[clamp(0.68rem,0.9vw,0.82rem)] font-medium tracking-[0.02em] opacity-75 transition-[opacity,transform] hover:-translate-y-[calc(100%+0.7rem)] hover:opacity-100 focus:outline-none focus-visible:ring-2 motion-reduce:transition-none motion-reduce:hover:-translate-y-[calc(100%+0.55rem)] ${tokens.readerHint} ${tokens.focus}`}
        >
          {returnToLiveLabel}
        </button>
      ) : null}

      <p
        className={`relative z-10 grid h-full w-full grid-cols-[minmax(0,1fr)_var(--reader-meta-rail)_minmax(0,var(--reader-content-max))_var(--reader-heart-rail)_minmax(0,1fr)] items-start gap-x-[clamp(0.3rem,0.55vw,0.65rem)] overflow-hidden whitespace-pre ${tokens.draft}`}
      >
        <span
          className={`col-start-2 mt-[0.43em] flex select-none items-center justify-end gap-1.5 pr-1 text-[0.15em] font-semibold uppercase leading-none tracking-[0.16em] transition-[color,opacity] duration-200 motion-reduce:transition-none ${
            isFocused
              ? 'text-[var(--reader-meta-active)] opacity-90'
              : `${tokens.readerMetaMuted} opacity-35`
          }`}
        >
          <Circle size={7} fill="currentColor" strokeWidth={0} aria-hidden="true" />
          <span>Jetzt</span>
        </span>

        <span
          data-reading-active-draft-text
          className={`col-start-3 block min-w-0 max-w-full overflow-hidden ${
            hasText ? tokens.glow : ''
          }`}
        >
          {text}
          {hasText ? (
            <span
              aria-hidden="true"
              className={`ml-2 inline-block h-[0.8em] w-[0.035em] translate-y-[0.08em] ${tokens.hairline}`}
            />
          ) : null}
        </span>
      </p>
    </section>
  );
}

export function ReadingLiveReader({
  initialState,
  initialConnectionStatus,
  initialError,
  streamUrl,
}: ReadingLiveReaderProps) {
  const {
    broadcastState,
    connectionStatus,
    error,
    lastAppliedEvent,
    applyLiveEvent,
  } = usePublicLiveStream({
    initialState,
    initialConnectionStatus,
    initialError,
    streamUrl,
  });
  const { theme, setTheme, isHydrated } = useLiveTheme();
  const { readerScale, setReaderScale, isReaderScaleHydrated } =
    useReaderScale();
  const { ensureViewerId } = useAnonymousViewerId();
  const {
    browserNotificationStatus,
    enableBrowserNotifications,
    notifyLiveStart,
  } = useBrowserLiveNotifications();
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
  const [navigationOffset, setNavigationOffset] = useState(0);
  const [interaction, setInteraction] =
    useState<ReaderInteraction>('reading');
  const [hasUsedReaderNavigation, setHasUsedReaderNavigation] = useState(false);
  const [unseenCommittedCount, setUnseenCommittedCount] = useState(0);
  const rootRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const historyPaneRef = useRef<HTMLElement | null>(null);
  const textMeasureRef = useRef<HTMLSpanElement | null>(null);
  const navigationOffsetRef = useRef(0);
  const previousNavigationBroadcastKeyRef = useRef<string | null>(null);
  const previousVisualRowCountRef = useRef(0);
  const previousCommittedLineCountRef = useRef(0);
  const wheelAccumulatorRef = useRef(0);
  const interactionTimerRef = useRef<number | null>(null);
  const touchLastPointRef = useRef<{ x: number; y: number } | null>(null);
  const touchAccumulatorRef = useRef(0);
  const previousBroadcastIdRef = useRef<string | null>(null);
  const activeBroadcastIdRef = useRef<string | null>(null);
  const tokens = themeTokens[theme];
  const scaleTokens = readerScaleTokens[readerScale];
  const layoutMetrics = useReaderLayoutMetrics({
    rootRef,
    headerRef,
    paneRef: historyPaneRef,
    textMeasureRef,
    scaleTokens,
  });

  useReadingViewportLock();

  useEffect(() => {
    try {
      setHasUsedReaderNavigation(
        window.localStorage.getItem(readerNavigationUsedStorageKey) === 'true',
      );
    } catch {
      setHasUsedReaderNavigation(false);
    }
  }, []);

  useEffect(
    () => () => {
      if (interactionTimerRef.current !== null) {
        window.clearTimeout(interactionTimerRef.current);
      }
    },
    [],
  );

  const activeBroadcastId =
    broadcastState.status === 'live' ? broadcastState.broadcastId : null;
  const broadcastKey =
    broadcastState.status === 'live' ? broadcastState.broadcastId : 'offline';
  const committedLineCount =
    broadcastState.status === 'live' ? broadcastState.lines.length : 0;
  const committedLines =
    broadcastState.status === 'live' ? broadcastState.lines : emptyLiveLines;
  const activeDraft =
    broadcastState.status === 'live' ? broadcastState.activeDraft : '';
  const committedVisualRows = useMemo(
    () =>
      deriveVisualRows(
        committedLines,
        layoutMetrics.textContentWidth,
        layoutMetrics.canvasFont,
      ),
    [committedLines, layoutMetrics.canvasFont, layoutMetrics.textContentWidth],
  );
  const activeDraftRows = useMemo(
    () =>
      deriveDraftVisualRows(
        activeDraft,
        layoutMetrics.textContentWidth,
        layoutMetrics.canvasFont,
      ),
    [activeDraft, layoutMetrics.canvasFont, layoutMetrics.textContentWidth],
  );
  const activeDraftText = useMemo(
    () => activeDraftRows[activeDraftRows.length - 1]?.text ?? activeDraft,
    [activeDraft, activeDraftRows],
  );
  const visualRows = committedVisualRows;
  const visualRowCount = visualRows.length;
  const readerHistoryHeight = Math.max(
    layoutMetrics.readerLineHeight,
    Math.round(
      (layoutMetrics.availableTextHeight || layoutMetrics.readerLineHeight * 6) *
        readerHorizonRatio -
        layoutMetrics.readerLineHeight,
    ),
  );
  const horizonStackCapacity = Math.max(
    1,
    Math.floor(readerHistoryHeight / Math.max(1, layoutMetrics.readerLineHeight)),
  );
  const visibleStackCapacity =
    visualRowCount > 0
      ? Math.min(
          layoutMetrics.stackCapacity > 0
            ? layoutMetrics.stackCapacity
            : fallbackStackCapacity,
          horizonStackCapacity,
        )
      : 0;
  const maxNavigationOffset = Math.max(0, visualRowCount - 1);
  const safeNavigationOffset = clamp(
    Number.isFinite(navigationOffset) ? navigationOffset : 0,
    0,
    maxNavigationOffset,
  );
  const navigationMode: ReadingMode =
    safeNavigationOffset === 0 ? 'live' : 'history';
  const navigation: ReadingNavigation = {
    mode: navigationMode,
    offset: safeNavigationOffset,
  };
  const focusedIndex = computeFocusedIndex(
    visualRowCount,
    safeNavigationOffset,
  );
  const focusedRow = visualRows[focusedIndex];
  const focusedLineId =
    navigationMode === 'history' && focusedRow?.kind === 'committed'
      ? focusedRow.line.id
      : null;
  const isActiveDraftFocused = navigationMode === 'live';
  const visibleWindow = useMemo(
    () =>
      computeReadingVisibleWindow({
        rows: visualRows,
        stackCapacity: visibleStackCapacity,
        mode: navigationMode,
        offset: safeNavigationOffset,
      }),
    [
      navigationMode,
      safeNavigationOffset,
      visibleStackCapacity,
      visualRows,
    ],
  );
  const readerCssVars: ReaderCssVars = {
    '--reader-font-size': scaleTokens.fontSize,
    '--reader-line-h': `${layoutMetrics.readerLineHeight}px`,
    '--reader-x-padding': 'clamp(0.75rem, 2.4vw, 2.25rem)',
    '--reader-meta-rail': readerMetaRailWidth,
    '--reader-heart-rail': readerHeartRailWidth,
    '--reader-content-max': readerContentMaxWidth,
    '--reader-meta-muted': tokens.readerMetaMutedValue,
    '--reader-meta-active': tokens.readerMetaActiveValue,
    '--reader-focus-bg': tokens.readerFocusBgValue,
    '--reader-focus-edge': tokens.readerFocusEdgeValue,
    '--reader-accent': tokens.readerAccentValue,
    '--reader-nav-muted': tokens.readerNavMutedValue,
    '--reader-nav-active': tokens.readerNavActiveValue,
    '--reader-history-h': `${readerHistoryHeight}px`,
  } as ReaderCssVars;
  const showNavigationHint =
    navigationMode === 'live' &&
    !hasUsedReaderNavigation &&
    visibleStackCapacity > 0 &&
    visualRowCount > visibleStackCapacity;
  const canNavigateOlder = safeNavigationOffset < maxNavigationOffset;
  const canNavigateNewer = safeNavigationOffset > 0;

  useEffect(() => {
    navigationOffsetRef.current = safeNavigationOffset;
  }, [safeNavigationOffset]);

  useEffect(() => {
    if (broadcastState.status !== 'live') return;
    if (lastAppliedEvent?.type !== 'live.started') return;

    notifyLiveStart({
      broadcastId: broadcastState.broadcastId,
      startedAt: broadcastState.startedAt,
    });
  }, [broadcastState, lastAppliedEvent, notifyLiveStart]);

  const markReaderNavigationActivity = useCallback(() => {
    setInteraction('navigating');

    if (!hasUsedReaderNavigation) {
      setHasUsedReaderNavigation(true);
      try {
        window.localStorage.setItem(readerNavigationUsedStorageKey, 'true');
      } catch {
        // The hint can still disappear for this page session.
      }
    }

    if (interactionTimerRef.current !== null) {
      window.clearTimeout(interactionTimerRef.current);
    }

    interactionTimerRef.current = window.setTimeout(() => {
      interactionTimerRef.current = null;
      setInteraction('reading');
    }, navigatingResetDelayMs);
  }, [hasUsedReaderNavigation]);

  const applyNavigationOffset = useCallback((nextOffset: number) => {
    const roundedOffset = Number.isFinite(nextOffset)
      ? Math.round(nextOffset)
      : 0;
    const clampedOffset = clamp(
      roundedOffset,
      0,
      Math.max(0, visualRowCount - 1),
    );

    navigationOffsetRef.current = clampedOffset;
    setNavigationOffset(clampedOffset);

    if (clampedOffset === 0) {
      setUnseenCommittedCount(0);
    }
  }, [visualRowCount]);

  const navigateBy = useCallback(
    (delta: number) => {
      applyNavigationOffset(navigationOffsetRef.current + delta);
    },
    [applyNavigationOffset],
  );
  const navigateOlder = useCallback(
    (steps = 1) => {
      if (visualRowCount <= 0) return;
      const stepCount = Number.isFinite(steps) ? Math.max(1, steps) : 1;

      markReaderNavigationActivity();
      navigateBy(stepCount);
    },
    [markReaderNavigationActivity, navigateBy, visualRowCount],
  );
  const navigateNewer = useCallback(
    (steps = 1) => {
      if (visualRowCount <= 0) return;
      const stepCount = Number.isFinite(steps) ? Math.max(1, steps) : 1;

      markReaderNavigationActivity();
      navigateBy(-stepCount);
    },
    [markReaderNavigationActivity, navigateBy, visualRowCount],
  );

  const returnToLive = useCallback(() => {
    wheelAccumulatorRef.current = 0;
    touchAccumulatorRef.current = 0;
    touchLastPointRef.current = null;
    if (interactionTimerRef.current !== null) {
      window.clearTimeout(interactionTimerRef.current);
      interactionTimerRef.current = null;
    }
    setInteraction('reading');
    applyNavigationOffset(0);
  }, [applyNavigationOffset]);

  const handleHistoryWheel = useCallback(
    (event: ReactWheelEvent<HTMLElement>) => {
      if (visualRowCount <= 0) return;

      event.preventDefault();
      wheelAccumulatorRef.current += event.deltaY;

      const steps = Math.min(
        maxInputStepsPerEvent,
        Math.floor(Math.abs(wheelAccumulatorRef.current) / wheelStepThreshold),
      );

      if (steps <= 0) return;

      if (wheelAccumulatorRef.current < 0) {
        navigateOlder(steps);
      } else {
        navigateNewer(steps);
      }
      wheelAccumulatorRef.current = 0;
    },
    [navigateNewer, navigateOlder, visualRowCount],
  );

  const handleHistoryTouchStart = useCallback(
    (event: ReactTouchEvent<HTMLElement>) => {
      if (isReaderInteractiveTarget(event.target)) {
        touchLastPointRef.current = null;
        touchAccumulatorRef.current = 0;
        return;
      }

      const touch = event.touches[0];
      if (!touch) return;

      touchLastPointRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      };
      touchAccumulatorRef.current = 0;
    },
    [],
  );

  const handleHistoryTouchMove = useCallback(
    (event: ReactTouchEvent<HTMLElement>) => {
      const touch = event.touches[0];
      const previousPoint = touchLastPointRef.current;
      if (!touch || !previousPoint) return;

      const deltaX = touch.clientX - previousPoint.x;
      const deltaY = touch.clientY - previousPoint.y;
      touchLastPointRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      };

      if (Math.abs(deltaX) > Math.abs(deltaY) * 1.4) return;

      event.preventDefault();
      if (visualRowCount <= 0) return;

      touchAccumulatorRef.current += deltaY;

      const steps = Math.min(
        maxInputStepsPerEvent,
        Math.floor(Math.abs(touchAccumulatorRef.current) / touchStepThreshold),
      );

      if (steps <= 0) return;

      if (touchAccumulatorRef.current > 0) {
        navigateOlder(steps);
      } else {
        navigateNewer(steps);
      }
      touchAccumulatorRef.current = 0;
    },
    [navigateNewer, navigateOlder, visualRowCount],
  );

  const handleHistoryTouchEnd = useCallback(() => {
    touchLastPointRef.current = null;
    touchAccumulatorRef.current = 0;
  }, []);

  const handleHistoryKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      const target = event.target as HTMLElement | null;
      const isNestedInteractiveTarget =
        target !== null &&
        target !== event.currentTarget &&
        (target.isContentEditable ||
          target.closest('button,a,input,textarea,select,[role="button"]'));

      if (isNestedInteractiveTarget) return;

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        navigateOlder();
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        navigateNewer();
        return;
      }

      if (event.key === 'PageUp') {
        event.preventDefault();
        navigateOlder(Math.max(1, visibleStackCapacity - 1));
        return;
      }

      if (event.key === 'PageDown') {
        event.preventDefault();
        navigateNewer(Math.max(1, visibleStackCapacity - 1));
        return;
      }

      if (event.key === 'End') {
        event.preventDefault();
        returnToLive();
      }
    },
    [navigateNewer, navigateOlder, returnToLive, visibleStackCapacity],
  );

  useEffect(() => {
    const previousBroadcastKey = previousNavigationBroadcastKeyRef.current;

    if (previousBroadcastKey !== broadcastKey) {
      previousNavigationBroadcastKeyRef.current = broadcastKey;
      previousVisualRowCountRef.current = visualRowCount;
      previousCommittedLineCountRef.current = committedLineCount;
      wheelAccumulatorRef.current = 0;
      touchAccumulatorRef.current = 0;
      touchLastPointRef.current = null;
      applyNavigationOffset(0);
      return;
    }

    const previousVisualRowCount = previousVisualRowCountRef.current;
    const previousCommittedLineCount = previousCommittedLineCountRef.current;
    previousVisualRowCountRef.current = visualRowCount;
    previousCommittedLineCountRef.current = committedLineCount;

    if (visualRowCount < previousVisualRowCount) {
      applyNavigationOffset(navigationOffsetRef.current);
      return;
    }

    const addedVisualRows = visualRowCount - previousVisualRowCount;
    const addedCommittedLines = committedLineCount - previousCommittedLineCount;
    if (addedVisualRows <= 0 || addedCommittedLines <= 0) return;

    if (navigationOffsetRef.current > 0) {
      applyNavigationOffset(navigationOffsetRef.current + addedVisualRows);
      setUnseenCommittedCount((current) => current + addedVisualRows);
      return;
    }

    applyNavigationOffset(0);
  }, [
    applyNavigationOffset,
    broadcastKey,
    committedLineCount,
    visualRowCount,
  ]);

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
      if (previousBroadcastId) removeHeartedLineIds(previousBroadcastId);
      setHeartedLineIds(new Set());
      setPendingLineIds(new Set());
      setOptimisticHeartCounts(new Map());
    }

    previousBroadcastIdRef.current = activeBroadcastId;
  }, [activeBroadcastId]);

  const handleToggleHeart = useCallback(
    async (line: LiveLine) => {
      if (broadcastState.status !== 'live' || pendingLineIds.has(line.id)) {
        return;
      }

      const viewerId = ensureViewerId();
      if (!viewerId) return;

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

        if (activeBroadcastIdRef.current !== broadcastId) return;

        if (result.broadcastId !== broadcastId || result.lineId !== line.id) {
          throw new Error('Heart reaction does not match the current line.');
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
      ref={rootRef}
      data-reading-live-reader
      data-theme={theme}
      data-reader-interaction={interaction}
      data-reader-font-size={layoutMetrics.readerFontSize}
      data-reader-line-height={layoutMetrics.readerLineHeight}
      data-reader-max-rows={layoutMetrics.maxRows}
      data-reader-stack-capacity={layoutMetrics.stackCapacity}
      data-reader-visible-stack-capacity={visibleStackCapacity}
      data-reader-text-content-width={layoutMetrics.textContentWidth}
      data-reader-visual-row-count={visualRowCount}
      data-reader-visible-row-count={visibleWindow.visibleRows.length}
      style={readerCssVars}
      onTouchStart={handleHistoryTouchStart}
      onTouchMove={handleHistoryTouchMove}
      onTouchEnd={handleHistoryTouchEnd}
      onTouchCancel={handleHistoryTouchEnd}
      className={`fixed inset-0 z-50 grid h-[100dvh] max-h-[100dvh] min-h-0 w-screen overflow-hidden overscroll-none transition-colors duration-300 motion-reduce:transition-none [color-scheme:dark_light] ${broadcastState.status === 'live' ? 'grid-rows-[auto_var(--reader-history-h)_var(--reader-line-h)_minmax(0,1fr)]' : 'grid-rows-[auto_minmax(0,1fr)]'} ${tokens.page} ${tokens.text}`}
      suppressHydrationWarning
    >
      <ReadingHeader
        headerRef={headerRef}
        state={broadcastState}
        connectionStatus={connectionStatus}
        error={error}
        followMode={navigation.mode}
        historyDistance={navigation.offset}
        unseenCommittedCount={unseenCommittedCount}
        readerScale={readerScale}
        setReaderScale={setReaderScale}
        isReaderScaleHydrated={isReaderScaleHydrated}
        theme={theme}
        setTheme={setTheme}
        isThemeHydrated={isHydrated}
        browserNotificationStatus={browserNotificationStatus}
        onEnableBrowserNotifications={enableBrowserNotifications}
        onOpenInfo={() => setIsInfoOpen(true)}
        tokens={tokens}
      />

      <ReadingInfoOverlay
        open={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        tokens={tokens}
      />

      <ReadingHistoryPane
        state={broadcastState}
        paneRef={historyPaneRef}
        textMeasureRef={textMeasureRef}
        visibleRows={visibleWindow.visibleRows}
        visualRowCount={visualRowCount}
        stackCapacity={visibleStackCapacity}
        windowStartIndex={visibleWindow.startIndex}
        focusedIndex={focusedIndex}
        focusedLineId={focusedLineId}
        navigation={navigation}
        interaction={interaction}
        showNavigationHint={showNavigationHint}
        canNavigateOlder={canNavigateOlder}
        canNavigateNewer={canNavigateNewer}
        onWheel={handleHistoryWheel}
        onKeyDown={handleHistoryKeyDown}
        browserNotificationStatus={browserNotificationStatus}
        onEnableBrowserNotifications={enableBrowserNotifications}
        tokens={tokens}
        heartedLineIds={heartedLineIds}
        pendingLineIds={pendingLineIds}
        optimisticHeartCounts={optimisticHeartCounts}
        onToggleHeart={handleToggleHeart}
      />

      {broadcastState.status === 'live' ? (
        <ReadingActiveDraft
          text={activeDraftText}
          tokens={tokens}
          isFocused={isActiveDraftFocused}
          showReturnToLive={navigation.mode === 'history'}
          historyDistance={navigation.offset}
          unseenCommittedCount={unseenCommittedCount}
          onReturnToLive={returnToLive}
        />
      ) : null}
    </main>
  );
}
