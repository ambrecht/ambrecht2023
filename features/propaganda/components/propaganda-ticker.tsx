'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

import styles from '../propaganda.module.css';

type PropagandaTickerProps = {
  text: string;
  mode: 'writer' | 'system';
};

type TickerMetrics = {
  cycleWidth: number;
  repeats: number;
  duration: number;
};

type TickerStyle = CSSProperties & {
  '--ticker-cycle-width': string;
  '--ticker-duration': string;
};

const pixelsPerSecond = 128;
const minRepeats = 3;
const maxRepeats = 18;
const minDurationSeconds = 8;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getTickerItemText(text: string, mode: PropagandaTickerProps['mode']) {
  return mode === 'writer'
    ? `+++ AKTUELL +++   ${text}`
    : `+++ SYSTEMMELDUNG +++   ${text}`;
}

export function PropagandaTicker({ text, mode }: PropagandaTickerProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const itemRef = useRef<HTMLSpanElement | null>(null);
  const animationRef = useRef<Animation | null>(null);
  const previousDurationRef = useRef(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [metrics, setMetrics] = useState<TickerMetrics>({
    cycleWidth: 1200,
    repeats: minRepeats,
    duration: 1200 / pixelsPerSecond,
  });
  const itemText = getTickerItemText(text, mode);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);

    syncPreference();
    mediaQuery.addEventListener('change', syncPreference);

    return () => {
      mediaQuery.removeEventListener('change', syncPreference);
    };
  }, []);

  useLayoutEffect(() => {
    let rafId = 0;
    let disposed = false;

    const measure = () => {
      if (disposed) return;

      const viewport = viewportRef.current;
      const item = itemRef.current;
      if (!viewport || !item) return;

      const viewportWidth = viewport.getBoundingClientRect().width;
      const cycleWidth = Math.ceil(item.getBoundingClientRect().width);
      if (viewportWidth <= 0 || cycleWidth <= 0) return;

      const repeats = clamp(
        Math.ceil(viewportWidth / cycleWidth) + 3,
        minRepeats,
        maxRepeats,
      );
      const duration = Math.max(
        minDurationSeconds,
        cycleWidth / pixelsPerSecond,
      );

      setMetrics((current) => {
        if (
          current.cycleWidth === cycleWidth &&
          current.repeats === repeats &&
          current.duration === duration
        ) {
          return current;
        }

        return {
          cycleWidth,
          repeats,
          duration,
        };
      });
    };

    const scheduleMeasure = () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        measure();
      });
    };

    measure();

    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(scheduleMeasure);
    if (viewportRef.current) observer?.observe(viewportRef.current);
    if (itemRef.current) observer?.observe(itemRef.current);
    window.addEventListener('resize', scheduleMeasure);
    window.addEventListener('orientationchange', scheduleMeasure);
    void document.fonts?.ready.then(scheduleMeasure).catch(() => {});

    return () => {
      disposed = true;
      if (rafId) window.cancelAnimationFrame(rafId);
      observer?.disconnect();
      window.removeEventListener('resize', scheduleMeasure);
      window.removeEventListener('orientationchange', scheduleMeasure);
    };
  }, []);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    if (prefersReducedMotion) {
      animationRef.current?.cancel();
      animationRef.current = null;
      previousDurationRef.current = 0;
      track.style.transform = 'none';
      return;
    }

    const previousAnimation = animationRef.current;
    const previousDuration = previousDurationRef.current;
    const previousCurrentTime =
      typeof previousAnimation?.currentTime === 'number'
        ? previousAnimation.currentTime
        : 0;
    const progress =
      previousDuration > 0
        ? (previousCurrentTime % previousDuration) / previousDuration
        : 0;

    previousAnimation?.cancel();

    const durationMs = metrics.duration * 1000;
    const animation = track.animate(
      [
        { transform: 'translate3d(0, 0, 0)' },
        { transform: `translate3d(-${metrics.cycleWidth}px, 0, 0)` },
      ],
      {
        duration: durationMs,
        easing: 'linear',
        iterations: Infinity,
      },
    );

    animation.currentTime = progress * durationMs;
    animationRef.current = animation;
    previousDurationRef.current = durationMs;
  }, [metrics.cycleWidth, metrics.duration, prefersReducedMotion]);

  useEffect(
    () => () => {
      animationRef.current?.cancel();
      animationRef.current = null;
    },
    [],
  );

  const tickerStyle: TickerStyle = {
    '--ticker-cycle-width': `${metrics.cycleWidth}px`,
    '--ticker-duration': `${metrics.duration}s`,
  };

  return (
    <section className={styles.tickerShell} aria-label="Aktuelle Schreibzeile">
      <div className={styles.tickerRule} aria-hidden="true" />
      <div
        ref={viewportRef}
        className={styles.tickerViewport}
        data-mode={mode}
      >
        <span className={styles.srOnly}>{itemText}</span>
        <div ref={trackRef} className={styles.tickerTrack} style={tickerStyle}>
          {Array.from({ length: metrics.repeats }).map((_, index) => (
            <span
              ref={index === 0 ? itemRef : undefined}
              className={styles.tickerItem}
              aria-hidden="true"
              key={index}
            >
              {itemText}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.tickerRule} aria-hidden="true" />
    </section>
  );
}
