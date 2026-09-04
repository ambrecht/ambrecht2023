import { describe, expect, it } from 'vitest';

import { getCompletionNudge, getDaysPhaseCopy, getNotfallPhaseViewData } from './crisis';
import type { NotfallJourneyState } from '../types';

const baseJourney: NotfallJourneyState = {
  currentStageDay: 5,
  daysAfterToday: 51,
  completedDays: 4,
  startsOnLabel: '31. August 2026',
};

describe('notfall crisis copy', () => {
  it('renders a truthful days phase for completedDays === 0', () => {
    const phase = getDaysPhaseCopy(0);

    expect(phase.headline).toBe('HEUTE GEHT ES UM DIESEN EINEN TAG.');
    expect(phase.cues.map((cue) => cue.text).join(' ')).not.toContain('bereits');
    expect(phase.cues.map((cue) => cue.text).join(' ')).not.toContain('verzichtet');
  });

  it('renders singular days copy for one completed day', () => {
    const phase = getDaysPhaseCopy(1);

    expect(phase.headline).toBe('DU HAST BEREITS EINEN TAG AUF SALZWASSER VERZICHTET.');
    expect(phase.cues[0]?.text).toBe('Ein Tag ist wirklich geschehen.');
  });

  it('renders plural days copy for multiple completed days', () => {
    const phase = getDaysPhaseCopy(4);

    expect(phase.headline).toBe('DU HAST SEIT 4 TAGEN AUF SALZWASSER VERZICHTET.');
    expect(phase.cues[0]?.text).toBe('4 Tage sind wirklich geschehen.');
  });

  it('uses journey completedDays as the only source for the days view', () => {
    const phase = getNotfallPhaseViewData('days', 6_000, baseJourney);

    expect(phase.headline).toContain('4 TAGEN');
    expect(phase.visibleCues.map((cue) => cue.text)).toContain(
      'Heute Abend kannst du auch diesen Tag dazulegen.',
    );
  });

  it('does not claim completed history in the completion nudge when no day is done', () => {
    expect(getCompletionNudge({ ...baseJourney, currentStageDay: 1, completedDays: 0 })).toBe(
      'Heute geht es nur um diesen einen Tag.',
    );
  });

  it('renders a plural completion nudge without mentioning remaining 56-day pressure', () => {
    const nudge = getCompletionNudge(baseJourney);

    expect(nudge).toBe(
      '4 Tage ohne Salzwasser haben wirklich stattgefunden. Heute Abend kannst du diesen Tag dazulegen.',
    );
    expect(nudge).not.toContain('51');
    expect(nudge).not.toContain('56');
  });
});
