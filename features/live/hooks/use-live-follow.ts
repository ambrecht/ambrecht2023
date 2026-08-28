'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { FollowMode, ValidatedLiveEvent } from '../lib/contract';

const BOTTOM_TOLERANCE = 32;
const UPWARD_SCROLL_TOLERANCE = 4;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useLiveFollow({
  broadcastKey,
  followTrigger,
  committedLineCount,
  lastAppliedEvent,
}: {
  broadcastKey: string;
  followTrigger: number;
  committedLineCount: number;
  lastAppliedEvent: {
    type: ValidatedLiveEvent['type'];
    key: string;
  } | null;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const previousScrollTopRef = useRef(0);
  const programmaticScrollRef = useRef(false);
  const lastCountedEventRef = useRef<string | null>(null);

  const [followMode, setFollowMode] = useState<FollowMode>('live');
  const [unseenCommittedCount, setUnseenCommittedCount] = useState(0);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    programmaticScrollRef.current = true;
    bottomRef.current?.scrollIntoView({
      block: 'end',
      behavior,
    });

    window.setTimeout(() => {
      programmaticScrollRef.current = false;
      previousScrollTopRef.current = scrollerRef.current?.scrollTop ?? 0;
    }, 80);
  }, []);

  useEffect(() => {
    setFollowMode('live');
    setUnseenCommittedCount(0);
    lastCountedEventRef.current = null;
    requestAnimationFrame(() => scrollToBottom('auto'));
  }, [broadcastKey, scrollToBottom]);

  useEffect(() => {
    if (followMode === 'live') {
      scrollToBottom('auto');
    }
  }, [followMode, followTrigger, scrollToBottom]);

  useEffect(() => {
    if (
      followMode === 'history' &&
      lastAppliedEvent?.type === 'line.committed' &&
      lastAppliedEvent.key !== lastCountedEventRef.current
    ) {
      setUnseenCommittedCount((current) => current + 1);
      lastCountedEventRef.current = lastAppliedEvent.key;
    }
  }, [committedLineCount, followMode, lastAppliedEvent]);

  const handleScroll = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller || programmaticScrollRef.current) return;

    const currentScrollTop = scroller.scrollTop;
    const distanceToBottom =
      scroller.scrollHeight - currentScrollTop - scroller.clientHeight;

    if (
      currentScrollTop <
      previousScrollTopRef.current - UPWARD_SCROLL_TOLERANCE
    ) {
      setFollowMode('history');
    } else if (distanceToBottom <= BOTTOM_TOLERANCE) {
      setFollowMode('live');
      setUnseenCommittedCount(0);
    }

    previousScrollTopRef.current = currentScrollTop;
  }, []);

  const returnToLive = useCallback(() => {
    setFollowMode('live');
    setUnseenCommittedCount(0);
    scrollToBottom(prefersReducedMotion() ? 'auto' : 'smooth');
  }, [scrollToBottom]);

  return {
    scrollerRef,
    bottomRef,
    followMode,
    unseenCommittedCount,
    handleScroll,
    returnToLive,
  };
}
