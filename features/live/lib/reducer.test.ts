import { describe, expect, it } from 'vitest';

import type { PublicLiveState } from './contract';
import { reduceLiveState } from './reducer';

const liveState = (
  overrides: Partial<Extract<PublicLiveState, { status: 'live' }>> = {},
) =>
  ({
    status: 'live',
    broadcastId: 'broadcast-1',
    sequence: 7,
    startedAt: '2026-08-18T10:00:00.000Z',
    viewerCount: 3,
    lines: [],
    activeDraft: '',
    interactions: [],
    nextLiveAt: null,
    ...overrides,
  }) satisfies PublicLiveState;

describe('reduceLiveState', () => {
  it('initializes state from a live snapshot', () => {
    const snapshot = liveState({
      sequence: 10,
      activeDraft: 'Hallo',
      lines: [
        {
          id: 'line-1',
          sequence: 9,
          text: 'Schon da.',
          publishedAt: '2026-08-18T10:01:00.000Z',
          heartCount: 0,
        },
      ],
    });

    expect(
      reduceLiveState(
        {
          status: 'offline',
          nextLiveAt: null,
        },
        {
          type: 'live.snapshot',
          snapshot,
        },
      ),
    ).toEqual(snapshot);
  });

  it('updates activeDraft immediately for draft.updated', () => {
    expect(
      reduceLiveState(liveState(), {
        type: 'draft.updated',
        broadcastId: 'broadcast-1',
        sequence: 8,
        text: 'H',
      }),
    ).toEqual(liveState({ sequence: 8, activeDraft: 'H' }));
  });

  it('applies multiple draft.updated events in sequence', () => {
    const first = reduceLiveState(liveState(), {
      type: 'draft.updated',
      broadcastId: 'broadcast-1',
      sequence: 8,
      text: 'Hal',
    });
    const second = reduceLiveState(first, {
      type: 'draft.updated',
      broadcastId: 'broadcast-1',
      sequence: 9,
      text: 'Hallo',
    });

    expect(second).toEqual(liveState({ sequence: 9, activeDraft: 'Hallo' }));
  });

  it('adds a committed line and clears activeDraft', () => {
    const line = {
      id: 'line-1',
      sequence: 9,
      text: 'Hallo',
      publishedAt: '2026-08-18T10:02:00.000Z',
      heartCount: 0,
    };

    expect(
      reduceLiveState(liveState({ sequence: 8, activeDraft: 'Hallo' }), {
        type: 'line.committed',
        broadcastId: 'broadcast-1',
        sequence: 9,
        line,
      }),
    ).toEqual(liveState({ sequence: 9, lines: [line], activeDraft: '' }));
  });

  it('ignores older sequenced events', () => {
    const state = liveState({ sequence: 9, activeDraft: 'Hallo' });

    expect(
      reduceLiveState(state, {
        type: 'draft.updated',
        broadcastId: 'broadcast-1',
        sequence: 8,
        text: 'Hal',
      }),
    ).toBe(state);
  });

  it('does not let a delayed snapshot overwrite newer live state', () => {
    const state = liveState({ sequence: 2737, activeDraft: 'Hallo' });

    expect(
      reduceLiveState(state, {
        type: 'live.snapshot',
        snapshot: liveState({ sequence: 2700, activeDraft: 'Hal' }),
      }),
    ).toBe(state);
  });

  it('does not duplicate committed lines after reconnect replay', () => {
    const line = {
      id: 'line-1',
      sequence: 9,
      text: 'Hallo',
      publishedAt: '2026-08-18T10:02:00.000Z',
      heartCount: 0,
    };
    const state = liveState({ sequence: 10, lines: [line], activeDraft: '' });

    expect(
      reduceLiveState(state, {
        type: 'line.committed',
        broadcastId: 'broadcast-1',
        sequence: 11,
        line,
      }),
    ).toEqual(liveState({ sequence: 11, lines: [line], activeDraft: '' }));
  });

  it('adds an opened interaction without changing lines or draft', () => {
    const state = liveState({ sequence: 8, activeDraft: 'Weiter' });

    expect(
      reduceLiveState(state, {
        type: 'interaction.opened',
        broadcastId: 'broadcast-1',
        sequence: 9,
        interaction: {
          id: 'interaction-1',
          kind: 'pressure',
          question: 'Was soll jetzt staerker werden?',
          options: [
            { id: 'option-1', label: 'Naehe' },
            { id: 'option-2', label: 'Gefahr' },
          ],
        },
      }),
    ).toEqual(
      liveState({
        sequence: 9,
        activeDraft: 'Weiter',
        interactions: [
          {
            id: 'interaction-1',
            broadcastId: 'broadcast-1',
            kind: 'pressure',
            question: 'Was soll jetzt staerker werden?',
            options: [
              { id: 'option-1', label: 'Naehe' },
              { id: 'option-2', label: 'Gefahr' },
            ],
            status: 'open',
            openedSequence: 9,
            closedSequence: null,
            finalResults: null,
            openedAt: null,
            closedAt: null,
          },
        ],
      }),
    );
  });

  it('closes an existing interaction with final results', () => {
    const state = liveState({
      sequence: 9,
      interactions: [
        {
          id: 'interaction-1',
          broadcastId: 'broadcast-1',
          kind: 'pressure',
          question: 'Was soll jetzt staerker werden?',
          options: [
            { id: 'option-1', label: 'Naehe' },
            { id: 'option-2', label: 'Gefahr' },
          ],
          status: 'open',
          openedSequence: 9,
          closedSequence: null,
          finalResults: null,
          openedAt: null,
          closedAt: null,
        },
      ],
    });

    expect(
      reduceLiveState(state, {
        type: 'interaction.closed',
        broadcastId: 'broadcast-1',
        sequence: 10,
        interactionId: 'interaction-1',
        results: [
          { optionId: 'option-1', count: 8 },
          { optionId: 'option-2', count: 12 },
        ],
        total: 20,
      }),
    ).toEqual(
      liveState({
        sequence: 10,
        interactions: [
          {
            ...state.interactions[0],
            status: 'closed',
            closedSequence: 10,
            finalResults: [
              { optionId: 'option-1', count: 8 },
              { optionId: 'option-2', count: 12 },
            ],
          },
        ],
      }),
    );
  });

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
    const state = liveState({
      lines: [
        {
          id: 'line-1',
          sequence: 7,
          text: 'Ein Satz.',
          publishedAt: '2026-08-18T10:01:00.000Z',
          heartCount: 2,
        },
      ],
      activeDraft: 'Weiter',
    });

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
    const state = liveState({
      nextLiveAt: '2026-08-21T20:00:00.000Z',
    });

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
