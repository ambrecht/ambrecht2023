import type { Metadata } from 'next';

import { LiveBookReader } from '@/features/live/components/live-book-reader';
import {
  PublicLiveSnapshotResponseSchema,
  type ConnectionStatus,
  type PublicLiveState,
} from '@/features/live/lib/contract';
import { buildTypewriterApiUrl } from '@/lib/live/api';

export const metadata: Metadata = {
  title: 'Lesen88 - Ambrecht',
  description:
    'Experimenteller Live-Leseraum für den öffentlichen Ambrecht-Live-Text.',
};

export const dynamic = 'force-dynamic';

const fallbackInitialState: PublicLiveState = {
  status: 'offline',
  nextLiveAt: null,
};

async function loadInitialLiveState(): Promise<{
  state: PublicLiveState;
  connectionStatus: ConnectionStatus;
  initialError: string | null;
}> {
  try {
    const response = await fetch(buildTypewriterApiUrl('/live'), {
      cache: 'no-store',
      headers: {
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      return {
        state: fallbackInitialState,
        connectionStatus: 'error',
        initialError: `Initialer Live-Snapshot fehlgeschlagen (${response.status}).`,
      };
    }

    const json = (await response.json()) as unknown;
    const parsed = PublicLiveSnapshotResponseSchema.safeParse(json);

    if (!parsed.success) {
      return {
        state: fallbackInitialState,
        connectionStatus: 'error',
        initialError: 'Initialer Live-Snapshot hatte ein ungültiges Format.',
      };
    }

    return {
      state: parsed.data.data,
      connectionStatus: 'connecting',
      initialError: null,
    };
  } catch {
    return {
      state: fallbackInitialState,
      connectionStatus: 'error',
      initialError: 'Initialer Live-Snapshot konnte nicht geladen werden.',
    };
  }
}

export default async function Lesen88Page() {
  const initialLive = await loadInitialLiveState();

  return (
    <LiveBookReader
      initialState={initialLive.state}
      initialConnectionStatus={initialLive.connectionStatus}
      initialError={initialLive.initialError}
      streamUrl={buildTypewriterApiUrl('/live/stream')}
    />
  );
}
