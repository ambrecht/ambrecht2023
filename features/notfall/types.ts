export type NotfallPhaseId =
  | 'interrupt'
  | 'reality'
  | 'days'
  | 'orient-room'
  | 'ground'
  | 'breath'
  | 'widen'
  | 'self-hold';

export type CrisisState =
  | NotfallPhaseId
  | 'action'
  | 'action-confirmation'
  | 'exited';

export type TimerState = 'running' | 'paused' | 'backgrounded';

export type CueTone = 'primary' | 'quiet' | 'optional';

export type PhaseCue = {
  text: string;
  appearAfterMs: number;
  tone?: CueTone;
};

export type NotfallPhaseCopy = {
  id: NotfallPhaseId;
  headline: string;
  cues: PhaseCue[];
  durationMs: number;
  minDurationMs?: number;
  autoAdvance: boolean;
  visualPhase: 'interrupt' | 'body';
};

export type NotfallPhaseViewData = NotfallPhaseCopy & {
  visibleCues: PhaseCue[];
};

export type NotfallJourneyState = {
  currentStageDay: number;
  daysAfterToday: number;
  completedDays: number;
  startsOnLabel: string;
};

export type NotfallActionId =
  | 'washingPrayer'
  | 'sitting'
  | 'walking'
  | 'water'
  | 'contact'
  | 'holding'
  | 'everyday';

export type NotfallAction = {
  id: NotfallActionId;
  label: string;
  confirmation: string[];
};
