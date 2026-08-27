'use client';

import { useCallback, useEffect, useState } from 'react';

export type BrowserLiveNotificationStatus =
  | 'unsupported'
  | 'idle'
  | 'enabled'
  | 'blocked';

const enabledStorageKey = 'ambrecht-live-browser-notifications';
const notifiedBroadcastStorageKey = 'ambrecht-live-notified-broadcast';

function supportsBrowserNotifications() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

function readEnabledPreference() {
  try {
    return window.localStorage.getItem(enabledStorageKey) === 'true';
  } catch {
    return false;
  }
}

function writeEnabledPreference(enabled: boolean) {
  try {
    window.localStorage.setItem(enabledStorageKey, enabled ? 'true' : 'false');
  } catch {
    // Permission still works for the current browser session.
  }
}

function getNotificationStatus(): BrowserLiveNotificationStatus {
  if (!supportsBrowserNotifications()) return 'unsupported';
  if (Notification.permission === 'denied') return 'blocked';

  return Notification.permission === 'granted' && readEnabledPreference()
    ? 'enabled'
    : 'idle';
}

export function useBrowserLiveNotifications() {
  const [status, setStatus] =
    useState<BrowserLiveNotificationStatus>('idle');

  useEffect(() => {
    setStatus(getNotificationStatus());
  }, []);

  const enableNotifications = useCallback(async () => {
    if (!supportsBrowserNotifications()) {
      setStatus('unsupported');
      return;
    }

    if (Notification.permission === 'denied') {
      setStatus('blocked');
      return;
    }

    const permission =
      Notification.permission === 'granted'
        ? 'granted'
        : await Notification.requestPermission();

    if (permission === 'granted') {
      writeEnabledPreference(true);
      setStatus('enabled');
      return;
    }

    writeEnabledPreference(false);
    setStatus(permission === 'denied' ? 'blocked' : 'idle');
  }, []);

  const notifyLiveStart = useCallback(
    ({
      broadcastId,
      startedAt,
    }: {
      broadcastId: string;
      startedAt: string;
    }) => {
      if (status !== 'enabled' || !supportsBrowserNotifications()) return;
      if (Notification.permission !== 'granted') {
        setStatus(getNotificationStatus());
        return;
      }

      try {
        if (
          window.localStorage.getItem(notifiedBroadcastStorageKey) === broadcastId
        ) {
          return;
        }
        window.localStorage.setItem(notifiedBroadcastStorageKey, broadcastId);
      } catch {
        // Without storage the notification may repeat after a reload.
      }

      const startedDate = new Date(startedAt);
      const startedLabel = Number.isNaN(startedDate.getTime())
        ? 'gerade'
        : startedDate.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
          });
      const notification = new Notification('Ambrecht ist live', {
        body: `Neue Live-Session gestartet (${startedLabel}).`,
        icon: '/favicon.ico',
        tag: `ambrecht-live-${broadcastId}`,
        renotify: true,
      });

      notification.onclick = () => {
        window.focus();
        window.location.assign('/lesen');
      };
    },
    [status],
  );

  return {
    browserNotificationStatus: status,
    enableBrowserNotifications: enableNotifications,
    notifyLiveStart,
  };
}
