import type {
  NotfallAction,
  NotfallJourneyState,
  NotfallPhaseCopy,
  NotfallPhaseId,
  NotfallPhaseViewData,
} from '../types';
import { phaseDurationsMs } from '../lib/machine';

export const notfallPhases: NotfallPhaseCopy[] = [
  {
    id: 'interrupt',
    visualPhase: 'interrupt',
    headline: 'DU JAGST GERADE EIN BILD.',
    durationMs: phaseDurationsMs.interrupt,
    autoAdvance: true,
    cues: [
      { text: 'Du musst es nicht wegmachen.', appearAfterMs: 900, tone: 'quiet' },
      { text: 'Aber du musst ihm auch nicht folgen.', appearAfterMs: 2600, tone: 'quiet' },
    ],
  },
  {
    id: 'reality',
    visualPhase: 'interrupt',
    headline: 'DAS GEFÜHL IST ECHT. DIE GESCHICHTE IST ES NICHT.',
    durationMs: phaseDurationsMs.reality,
    autoAdvance: true,
    cues: [
      { text: 'Die Erregung darf da sein.', appearAfterMs: 1400, tone: 'quiet' },
      { text: 'Sie bestimmt nicht, was du tun musst.', appearAfterMs: 3400, tone: 'quiet' },
      { text: 'Du kennst ihren Willen nicht.', appearAfterMs: 5400, tone: 'quiet' },
    ],
  },
  {
    id: 'days',
    visualPhase: 'interrupt',
    headline: 'HEUTE GEHT ES UM DIESEN EINEN TAG.',
    durationMs: phaseDurationsMs.days,
    autoAdvance: true,
    cues: [
      { text: 'Heute liegt vor dir.', appearAfterMs: 1100, tone: 'quiet' },
      { text: 'Heute kommt nur dieser eine Tag dazu.', appearAfterMs: 3100, tone: 'quiet' },
      { text: 'Nur dieser eine Tag.', appearAfterMs: 4800, tone: 'primary' },
    ],
  },
  {
    id: 'orient-room',
    visualPhase: 'body',
    headline: 'Schau vom Bildschirm weg.',
    durationMs: phaseDurationsMs['orient-room'],
    autoAdvance: true,
    cues: [
      { text: 'Sieh den Raum.', appearAfterMs: 5000, tone: 'primary' },
      { text: 'Was ist links von dir?', appearAfterMs: 10_000, tone: 'quiet' },
      { text: 'Was ist rechts von dir?', appearAfterMs: 13_500, tone: 'quiet' },
      { text: 'Was ist hinter dir?', appearAfterMs: 17_000, tone: 'quiet' },
      { text: 'Lass deinen Blick weich werden.', appearAfterMs: 20_000, tone: 'optional' },
    ],
  },
  {
    id: 'ground',
    visualPhase: 'body',
    headline: 'Spür, was dich trägt.',
    durationMs: phaseDurationsMs.ground,
    autoAdvance: true,
    cues: [
      { text: 'Füße.', appearAfterMs: 4500, tone: 'primary' },
      { text: 'Sitzfläche.', appearAfterMs: 8500, tone: 'primary' },
      { text: 'Rücken.', appearAfterMs: 12_500, tone: 'primary' },
      { text: 'Du musst gerade nirgendwohin.', appearAfterMs: 17_000, tone: 'quiet' },
    ],
  },
  {
    id: 'breath',
    visualPhase: 'body',
    headline: 'Lass den Atem kommen.',
    durationMs: phaseDurationsMs.breath,
    autoAdvance: true,
    cues: [
      { text: 'Du musst ihn nicht verändern.', appearAfterMs: 4500, tone: 'quiet' },
      {
        text: 'Kannst du eine Atembewegung irgendwo in dir bemerken?',
        appearAfterMs: 11_000,
        tone: 'primary',
      },
      {
        text: 'Und vielleicht etwas mehr von deinem ganzen Körper.',
        appearAfterMs: 17_000,
        tone: 'quiet',
      },
      {
        text: 'Wenn dein Körper sich ein wenig bewegen will, lass ihn.',
        appearAfterMs: 21_000,
        tone: 'optional',
      },
    ],
  },
  {
    id: 'widen',
    visualPhase: 'body',
    headline: 'Da ist Erregung.',
    durationMs: phaseDurationsMs.widen,
    minDurationMs: 18_000,
    autoAdvance: false,
    cues: [
      { text: 'Und da ist noch mehr von dir.', appearAfterMs: 8000, tone: 'primary' },
      { text: 'Spür einmal, wie das Ganze gerade in dir ist.', appearAfterMs: 18_000, tone: 'quiet' },
      {
        text: 'Und ob irgendwo darin etwas mehr Raum ist.',
        appearAfterMs: 24_000,
        tone: 'quiet',
      },
      { text: 'Du musst nichts verändern.', appearAfterMs: 28_000, tone: 'optional' },
    ],
  },
  {
    id: 'self-hold',
    visualPhase: 'body',
    headline: 'Nimm dich für einen Moment zu dir.',
    durationMs: phaseDurationsMs['self-hold'],
    minDurationMs: 18_000,
    autoAdvance: false,
    cues: [
      {
        text: 'Wenn es stimmig ist: Leg eine Hand auf Brust oder Bauch.',
        appearAfterMs: 6000,
        tone: 'quiet',
      },
      {
        text: 'Oder nimm deine Oberarme in die Hände.',
        appearAfterMs: 11_000,
        tone: 'quiet',
      },
      {
        text: 'Spür einfach den Kontakt.',
        appearAfterMs: 18_000,
        tone: 'quiet',
      },
      { text: 'Du bist hier.', appearAfterMs: 24_000, tone: 'primary' },
      { text: 'Ich bin bei mir.', appearAfterMs: 28_000, tone: 'optional' },
    ],
  },
];

export const notfallActions: NotfallAction[] = [
  {
    id: 'washingPrayer',
    label: 'Waschung & Gebet',
    confirmation: [
      'Waschung & Gebet.',
      'Computer aus.',
      'Waschung.',
      'Gebet.',
      'Schließe jetzt diese Seite.',
    ],
  },
  {
    id: 'sitting',
    label: '10 Minuten sitzen',
    confirmation: [
      '10 Minuten sitzen.',
      'Spür Atem, Gewicht und Raum.',
      'Was auftaucht, darf auftauchen.',
      'Du musst nichts fortsetzen.',
      'Schließe jetzt diese Seite.',
    ],
  },
  {
    id: 'walking',
    label: '20 Minuten gehen',
    confirmation: [
      'Geh 20 Minuten.',
      'Spür deine Schritte.',
      'Sieh Häuser, Bäume, Himmel und Menschen.',
      'Lass die Welt wieder Welt sein.',
      'Schließe jetzt diese Seite.',
    ],
  },
  {
    id: 'water',
    label: 'Duschen / Wasser',
    confirmation: [
      'Duschen oder Wasser.',
      'Spür Temperatur, Haut und Gewicht.',
      'Lass Wasser wirklich Wasser sein.',
      'Schließe jetzt diese Seite.',
    ],
  },
  {
    id: 'contact',
    label: 'Einen Menschen kontaktieren',
    confirmation: [
      'Einen Menschen kontaktieren.',
      'Ruf jemanden an oder schreib jemandem.',
      'Sei einfach wirklich in Kontakt.',
      'Schließe jetzt diese Seite.',
    ],
  },
  {
    id: 'holding',
    label: 'Mich halten',
    confirmation: [
      'Leg deine Hände dorthin, wo es gut ist.',
      'Spür den Kontakt deiner Hände.',
      'Vielleicht kannst du einen Moment nichts von dir verlangen.',
      'Ich bin da. Seite schließen.',
    ],
  },
  {
    id: 'everyday',
    label: 'Zurück in meinen Alltag',
    confirmation: [
      'Zurück in meinen Alltag.',
      'Der Wunsch darf mitkommen.',
      'Du entscheidest, wohin du gehst.',
      'Schließe jetzt diese Seite.',
    ],
  },
];

export function getNotfallPhaseViewData(
  phaseId: NotfallPhaseId,
  elapsedMs: number,
  journey?: NotfallJourneyState,
): NotfallPhaseViewData {
  const phase =
    phaseId === 'days'
      ? getDaysPhaseCopy(journey?.completedDays ?? 0)
      : selectPhaseCopy(phaseId);

  return {
    ...phase,
    visibleCues: phase.cues.filter((cue) => elapsedMs >= cue.appearAfterMs),
  };
}

export function getCompletionNudge(journey: NotfallJourneyState): string | null {
  if (journey.completedDays < 1) {
    return 'Heute geht es nur um diesen einen Tag.';
  }

  return `${formatCompletedDays(journey.completedDays)} ohne Salzwasser ${formatHaveVerb(
    journey.completedDays,
  )} wirklich stattgefunden. Heute Abend kannst du diesen Tag dazulegen.`;
}

export function getDaysPhaseCopy(completedDays: number): NotfallPhaseCopy {
  if (completedDays < 1) {
    return selectPhaseCopy('days');
  }

  const dayLabel = formatCompletedDays(completedDays);

  return {
    id: 'days',
    visualPhase: 'interrupt',
    headline:
      completedDays === 1
        ? 'DU HAST BEREITS EINEN TAG AUF SALZWASSER VERZICHTET.'
        : `DU HAST SEIT ${completedDays} TAGEN AUF SALZWASSER VERZICHTET.`,
    durationMs: phaseDurationsMs.days,
    autoAdvance: true,
    cues: [
      {
        text: `${dayLabel} ${formatAreVerb(completedDays)} wirklich geschehen.`,
        appearAfterMs: 1300,
        tone: 'quiet',
      },
      {
        text: 'Heute Abend kannst du auch diesen Tag dazulegen.',
        appearAfterMs: 3100,
        tone: 'quiet',
      },
      { text: 'Nur dieser eine Tag.', appearAfterMs: 4800, tone: 'primary' },
    ],
  };
}

function selectPhaseCopy(phaseId: NotfallPhaseId): NotfallPhaseCopy {
  const phase = notfallPhases.find((candidate) => candidate.id === phaseId);

  if (!phase) {
    throw new Error(`Missing notfall copy for phase ${phaseId}`);
  }

  return phase;
}

function formatCompletedDays(completedDays: number): string {
  return completedDays === 1 ? 'Ein Tag' : `${completedDays} Tage`;
}

function formatAreVerb(completedDays: number): string {
  return completedDays === 1 ? 'ist' : 'sind';
}

function formatHaveVerb(completedDays: number): string {
  return completedDays === 1 ? 'hat' : 'haben';
}
