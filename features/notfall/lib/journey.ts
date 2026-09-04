import type { NotfallJourneyState } from '../types';

const journeyStart = {
  year: 2026,
  monthIndex: 7,
  day: 31,
};

const totalJourneyDays = 56;
const millisecondsPerDay = 24 * 60 * 60 * 1000;

export function getNotfallJourneyState(now: Date = new Date()): NotfallJourneyState {
  const today = toLocalDayStart(now);
  const start = new Date(
    journeyStart.year,
    journeyStart.monthIndex,
    journeyStart.day,
  );
  const rawDayOffset = Math.floor(
    (today.getTime() - start.getTime()) / millisecondsPerDay,
  );
  const clampedDayOffset = clamp(rawDayOffset, 0, totalJourneyDays - 1);
  const currentStageDay = clampedDayOffset + 1;
  const daysAfterToday = Math.max(totalJourneyDays - currentStageDay, 0);

  return {
    currentStageDay,
    daysAfterToday,
    completedDays: Math.max(currentStageDay - 1, 0),
    startsOnLabel: '31. August 2026',
  };
}

function toLocalDayStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}
