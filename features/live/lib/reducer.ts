import type { PublicLiveState, ValidatedLiveEvent } from './contract';

export function reduceLiveState(
  state: PublicLiveState,
  event: ValidatedLiveEvent,
): PublicLiveState {
  if (event.type === 'live.snapshot') {
    return event.snapshot;
  }

  if (event.type === 'live.started') {
    return event.snapshot;
  }

  if (state.status !== 'live') {
    return state;
  }

  if (event.type === 'viewer.count') {
    if (event.count === state.viewerCount) {
      return state;
    }

    return {
      ...state,
      viewerCount: event.count,
    };
  }

  if (event.broadcastId !== state.broadcastId) {
    return state;
  }

  if (event.type === 'reaction.updated') {
    let didUpdate = false;
    const lines = state.lines.map((line) => {
      if (line.id !== event.lineId) {
        return line;
      }

      didUpdate = didUpdate || line.heartCount !== event.count;
      return {
        ...line,
        heartCount: event.count,
      };
    });

    if (!didUpdate) {
      return state;
    }

    return {
      ...state,
      lines,
    };
  }

  if (event.sequence <= state.sequence) {
    return state;
  }

  if (event.type === 'draft.updated') {
    return {
      ...state,
      sequence: event.sequence,
      activeDraft: event.text,
    };
  }

  if (event.type === 'line.committed') {
    return {
      ...state,
      sequence: event.sequence,
      lines: [...state.lines, event.line],
      activeDraft: '',
    };
  }

  return { status: 'offline' };
}
