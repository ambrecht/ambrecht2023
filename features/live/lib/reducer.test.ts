import { describe, expect, it } from 'vitest';

import type { PublicLiveState } from './contract';
import { reduceLiveState } from './reducer';

describe('reduceLiveState', () => {
  it('updates nextLiveAt while offline without creating a live session', () => {
    const state: PublicLiveState = {
      status: 'offline',
      nextLiveAt: null,
    };

    expect(
      reduceLiveState(state, {
        type: 'live.schedule.updated',
        scheduledAt: '2026-08-21T20:00:00.000Z',
      }),
    ).toEqual({
      status: 'offline',
      nextLiveAt: '2026-08-21T20:00:00.000Z',
    });
  });

  it('updates only nextLiveAt while live', () => {
    const state: PublicLiveState = {
      status: 'live',
      broadcastId: 'broadcast-1',
      sequence: 7,
      startedAt: '2026-08-18T10:00:00.000Z',
      viewerCount: 3,
      lines: [
        {
          id: 'line-1',
          text: 'Ein Satz.',
          publishedAt: '2026-08-18T10:01:00.000Z',
          heartCount: 2,
        },
      ],
      activeDraft: 'Weiter',
      nextLiveAt: null,
    };

    const next = reduceLiveState(state, {
      type: 'live.schedule.updated',
      scheduledAt: '2026-08-21T20:00:00.000Z',
    });

    expect(next).toEqual({
      ...state,
      nextLiveAt: '2026-08-21T20:00:00.000Z',
    });
  });

  it('keeps the scheduled time after a spontaneous live session ends', () => {
    const state: PublicLiveState = {
      status: 'live',
      broadcastId: 'broadcast-1',
      sequence: 7,
      startedAt: '2026-08-18T10:00:00.000Z',
      viewerCount: 3,
      lines: [],
      activeDraft: '',
      nextLiveAt: '2026-08-21T20:00:00.000Z',
    };

    expect(
      reduceLiveState(state, {
        type: 'live.ended',
        broadcastId: 'broadcast-1',
        sequence: 8,
      }),
    ).toEqual({
      status: 'offline',
      nextLiveAt: '2026-08-21T20:00:00.000Z',
    });
  });
});
