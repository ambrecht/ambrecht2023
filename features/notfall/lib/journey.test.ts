import { describe, expect, it } from 'vitest';

import { getNotfallJourneyState } from './journey';

describe('getNotfallJourneyState', () => {
  it('treats 31.08.2026 as day 1', () => {
    expect(getNotfallJourneyState(new Date(2026, 7, 31, 23, 30))).toMatchObject({
      currentStageDay: 1,
      completedDays: 0,
      daysAfterToday: 55,
    });
  });

  it('uses inclusive local calendar days', () => {
    expect(getNotfallJourneyState(new Date(2026, 8, 1, 0, 5))).toMatchObject({
      currentStageDay: 2,
      completedDays: 1,
      daysAfterToday: 54,
    });
  });

  it('does not count the current open day as completed', () => {
    expect(getNotfallJourneyState(new Date(2026, 8, 4, 9, 30))).toMatchObject({
      currentStageDay: 5,
      completedDays: 4,
    });
  });

  it('clamps the final day to day 56', () => {
    expect(getNotfallJourneyState(new Date(2026, 9, 25, 12, 0))).toMatchObject({
      currentStageDay: 56,
      completedDays: 55,
      daysAfterToday: 0,
    });
  });

  it('does not render negative values before the start', () => {
    expect(getNotfallJourneyState(new Date(2026, 7, 1, 12, 0))).toMatchObject({
      currentStageDay: 1,
      completedDays: 0,
      daysAfterToday: 55,
    });
  });
});
