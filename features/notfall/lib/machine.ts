import type {
  CrisisState,
  NotfallActionId,
  NotfallPhaseId,
  TimerState,
} from '../types';

export const phaseDurationsMs = {
  interrupt: 5_000,
  reality: 7_000,
  days: 6_000,
  'orient-room': 22_000,
  ground: 20_000,
  breath: 24_000,
  widen: 30_000,
  'self-hold': 30_000,
} satisfies Record<NotfallPhaseId, number>;

export const bodyStartsAtPhase: NotfallPhaseId = 'orient-room';

export const notfallPhaseOrder = [
  'interrupt',
  'reality',
  'days',
  'orient-room',
  'ground',
  'breath',
  'widen',
  'self-hold',
] as const;

const manualAdvancePhases = new Set<NotfallPhaseId>(['widen', 'self-hold']);

export type NotfallState =
  | {
      status: NotfallPhaseId;
      timerState: TimerState;
      elapsedMs: number;
      startedAtMs: number;
      phaseStartedAtMs: number;
    }
  | { status: 'action'; timerState: 'paused'; startedAtMs: number }
  | {
      status: 'action-confirmation';
      timerState: 'paused';
      actionId: NotfallActionId;
      startedAtMs: number;
      actionSelectedAtMs: number;
      timeToActionMs: number;
    }
  | { status: 'exited'; timerState: 'paused' };

export type NotfallEvent =
  | { type: 'start'; nowMs: number }
  | { type: 'tick'; elapsedMs: number }
  | { type: 'phase.next'; nowMs: number }
  | { type: 'pause.user' }
  | { type: 'resume.user' }
  | { type: 'visibility.hidden' }
  | { type: 'visibility.visible' }
  | { type: 'action.now'; nowMs: number }
  | { type: 'action.select'; actionId: NotfallActionId; nowMs: number }
  | { type: 'exit' };

export const initialNotfallState: NotfallState = {
  status: 'interrupt',
  timerState: 'running',
  elapsedMs: 0,
  startedAtMs: 0,
  phaseStartedAtMs: 0,
};

export function reduceNotfallState(
  state: NotfallState,
  event: NotfallEvent,
): NotfallState {
  if (event.type === 'exit') {
    return { status: 'exited', timerState: 'paused' };
  }

  if (event.type === 'start') {
    return {
      status: 'interrupt',
      timerState: 'running',
      elapsedMs: 0,
      startedAtMs: event.nowMs,
      phaseStartedAtMs: event.nowMs,
    };
  }

  if (isPhaseState(state)) {
    return reducePhaseState(state, event);
  }

  if (state.status === 'action' && event.type === 'action.select') {
    const timeToActionMs = Math.max(event.nowMs - state.startedAtMs, 0);

    return {
      status: 'action-confirmation',
      timerState: 'paused',
      actionId: event.actionId,
      startedAtMs: state.startedAtMs,
      actionSelectedAtMs: event.nowMs,
      timeToActionMs,
    };
  }

  return state;
}

function reducePhaseState(
  state: Extract<NotfallState, { status: NotfallPhaseId }>,
  event: NotfallEvent,
): NotfallState {
  switch (event.type) {
    case 'tick':
      return tickPhase(state, event.elapsedMs);
    case 'phase.next':
      return nextPhase(state, event.nowMs);
    case 'pause.user':
      return { ...state, timerState: 'paused' };
    case 'resume.user':
      return state.timerState === 'paused'
        ? { ...state, timerState: 'running' }
        : state;
    case 'visibility.hidden':
      return state.timerState === 'running'
        ? { ...state, timerState: 'backgrounded' }
        : state;
    case 'visibility.visible':
      return state.timerState === 'backgrounded'
        ? { ...state, timerState: 'running' }
        : state;
    case 'action.now':
      return {
        status: 'action',
        timerState: 'paused',
        startedAtMs: state.startedAtMs || event.nowMs,
      };
    default:
      return state;
  }
}

function tickPhase(
  state: Extract<NotfallState, { status: NotfallPhaseId }>,
  elapsedMs: number,
): NotfallState {
  if (state.timerState !== 'running' || elapsedMs <= 0) {
    return state;
  }

  const nextElapsedMs = state.elapsedMs + elapsedMs;
  const phaseDurationMs = phaseDurationsMs[state.status];

  if (nextElapsedMs < phaseDurationMs) {
    return { ...state, elapsedMs: nextElapsedMs };
  }

  if (manualAdvancePhases.has(state.status)) {
    return { ...state, elapsedMs: phaseDurationMs };
  }

  return nextPhase(state, state.phaseStartedAtMs + phaseDurationMs);
}

function nextPhase(
  state: Extract<NotfallState, { status: NotfallPhaseId }>,
  nowMs: number,
): NotfallState {
  const currentIndex = notfallPhaseOrder.indexOf(state.status);
  const nextStatus = notfallPhaseOrder[currentIndex + 1];

  if (!nextStatus) {
    return {
      status: 'action',
      timerState: 'paused',
      startedAtMs: state.startedAtMs,
    };
  }

  return {
    status: nextStatus,
    timerState: 'running',
    elapsedMs: 0,
    startedAtMs: state.startedAtMs,
    phaseStartedAtMs: nowMs,
  };
}

export function isBodyPhase(status: CrisisState): boolean {
  return (
    isNotfallPhase(status) &&
    notfallPhaseOrder.indexOf(status) >= notfallPhaseOrder.indexOf(bodyStartsAtPhase)
  );
}

export function isNotfallPhase(status: CrisisState): status is NotfallPhaseId {
  return notfallPhaseOrder.includes(status as NotfallPhaseId);
}

function isPhaseState(
  state: NotfallState,
): state is Extract<NotfallState, { status: NotfallPhaseId }> {
  return isNotfallPhase(state.status);
}
