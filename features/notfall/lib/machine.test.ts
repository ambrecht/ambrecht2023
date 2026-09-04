import { describe, expect, it } from 'vitest';

import {
  initialNotfallState,
  phaseDurationsMs,
  reduceNotfallState,
} from './machine';

describe('reduceNotfallState', () => {
  it('starts immediately in the interrupt phase', () => {
    expect(initialNotfallState).toMatchObject({
      status: 'interrupt',
      timerState: 'running',
      elapsedMs: 0,
    });
  });

  it('can reset the flow with a real start timestamp', () => {
    expect(reduceNotfallState(initialNotfallState, { type: 'start', nowMs: 200 })).toEqual({
      status: 'interrupt',
      timerState: 'running',
      elapsedMs: 0,
      startedAtMs: 200,
      phaseStartedAtMs: 200,
    });
  });

  it('advances only one phase even after a delayed tick', () => {
    const state = reduceNotfallState(initialNotfallState, { type: 'start', nowMs: 0 });

    expect(reduceNotfallState(state, { type: 'tick', elapsedMs: 60_000 })).toEqual({
      status: 'reality',
      timerState: 'running',
      elapsedMs: 0,
      startedAtMs: 0,
      phaseStartedAtMs: phaseDurationsMs.interrupt,
    });
  });

  it('moves from reality into the days phase before body orientation', () => {
    let state = reduceNotfallState(initialNotfallState, { type: 'start', nowMs: 0 });
    state = reduceNotfallState(state, { type: 'tick', elapsedMs: phaseDurationsMs.interrupt });
    state = reduceNotfallState(state, { type: 'tick', elapsedMs: phaseDurationsMs.reality });

    expect(state).toMatchObject({
      status: 'days',
      timerState: 'running',
      elapsedMs: 0,
    });

    state = reduceNotfallState(state, { type: 'tick', elapsedMs: phaseDurationsMs.days });

    expect(state).toMatchObject({
      status: 'orient-room',
      timerState: 'running',
      elapsedMs: 0,
    });
  });

  it('auto-advances through breath and then waits in widen', () => {
    let state = reduceNotfallState(initialNotfallState, { type: 'start', nowMs: 0 });

    for (const durationMs of [
      phaseDurationsMs.interrupt,
      phaseDurationsMs.reality,
      phaseDurationsMs.days,
      phaseDurationsMs['orient-room'],
      phaseDurationsMs.ground,
      phaseDurationsMs.breath,
    ]) {
      state = reduceNotfallState(state, { type: 'tick', elapsedMs: durationMs });
    }

    expect(state).toMatchObject({
      status: 'widen',
      timerState: 'running',
      elapsedMs: 0,
    });

    state = reduceNotfallState(state, { type: 'tick', elapsedMs: phaseDurationsMs.widen * 2 });

    expect(state).toMatchObject({
      status: 'widen',
      timerState: 'running',
      elapsedMs: phaseDurationsMs.widen,
    });
  });

  it('moves to action after manual confirmation from self-hold', () => {
    let state = reduceNotfallState(initialNotfallState, { type: 'start', nowMs: 0 });

    for (const durationMs of [
      phaseDurationsMs.interrupt,
      phaseDurationsMs.reality,
      phaseDurationsMs.days,
      phaseDurationsMs['orient-room'],
      phaseDurationsMs.ground,
      phaseDurationsMs.breath,
    ]) {
      state = reduceNotfallState(state, { type: 'tick', elapsedMs: durationMs });
    }

    state = reduceNotfallState(state, { type: 'phase.next', nowMs: 88_000 });
    state = reduceNotfallState(state, { type: 'phase.next', nowMs: 118_000 });

    expect(state).toEqual({ status: 'action', timerState: 'paused', startedAtMs: 0 });
  });

  it('pauses for hidden tabs and resumes without consuming elapsed time', () => {
    let state = reduceNotfallState(initialNotfallState, { type: 'start', nowMs: 0 });
    state = reduceNotfallState(state, { type: 'visibility.hidden' });
    state = reduceNotfallState(state, { type: 'tick', elapsedMs: 30_000 });

    expect(state).toMatchObject({
      status: 'interrupt',
      elapsedMs: 0,
      timerState: 'backgrounded',
    });

    state = reduceNotfallState(state, { type: 'visibility.visible' });

    expect(state).toMatchObject({
      status: 'interrupt',
      elapsedMs: 0,
      timerState: 'running',
    });
  });

  it('can leave early for immediate action', () => {
    const state = reduceNotfallState(
      reduceNotfallState(initialNotfallState, { type: 'start', nowMs: 100 }),
      { type: 'action.now', nowMs: 800 },
    );

    expect(state).toEqual({
      status: 'action',
      timerState: 'paused',
      startedAtMs: 100,
    });
  });

  it('measures time to action locally', () => {
    const state = reduceNotfallState(
      { status: 'action', timerState: 'paused', startedAtMs: 100 },
      { type: 'action.select', actionId: 'walking', nowMs: 12_100 },
    );

    expect(state).toMatchObject({
      status: 'action-confirmation',
      actionId: 'walking',
      timeToActionMs: 12_000,
    });
  });
});
