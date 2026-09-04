import type { PublicLiveState, ValidatedLiveEvent } from './contract';

export function reduceLiveState(
  state: PublicLiveState,
  event: ValidatedLiveEvent,
): PublicLiveState {
  if (event.type === 'live.snapshot') {
    if (
      state.status === 'live' &&
      event.snapshot.status === 'live' &&
      event.snapshot.broadcastId === state.broadcastId &&
      event.snapshot.sequence < state.sequence
    ) {
      return state;
    }

    return event.snapshot;
  }

  if (event.type === 'live.started') {
    if (
      state.status === 'live' &&
      event.snapshot.broadcastId === state.broadcastId &&
      event.snapshot.sequence <= state.sequence
    ) {
      return state;
    }

    return event.snapshot;
  }

  if (event.type === 'live.schedule.updated') {
    if (event.scheduledAt === state.nextLiveAt) {
      return state;
    }

    return {
      ...state,
      nextLiveAt: event.scheduledAt,
    };
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
    const hasLine = state.lines.some((line) => line.id === event.line.id);

    return {
      ...state,
      sequence: event.sequence,
      lines: hasLine ? state.lines : [...state.lines, event.line],
      activeDraft: '',
    };
  }

  if (event.type === 'interaction.opened') {
    const hasInteraction = state.interactions.some(
      (interaction) => interaction.id === event.interaction.id,
    );

    if (hasInteraction) {
      return {
        ...state,
        sequence: event.sequence,
      };
    }

    return {
      ...state,
      sequence: event.sequence,
      interactions: [
        ...state.interactions,
        {
          id: event.interaction.id,
          broadcastId: event.broadcastId,
          kind: event.interaction.kind,
          question: event.interaction.question,
          options: event.interaction.options,
          status: 'open',
          openedSequence: event.sequence,
          closedSequence: null,
          finalResults: null,
          openedAt: null,
          closedAt: null,
        },
      ],
    };
  }

  if (event.type === 'interaction.closed') {
    let didUpdate = false;
    const interactions = state.interactions.map((interaction) => {
      if (interaction.id !== event.interactionId) {
        return interaction;
      }

      didUpdate = true;
      return {
        ...interaction,
        status: 'closed' as const,
        closedSequence: event.sequence,
        finalResults: event.results,
      };
    });

    return {
      ...state,
      sequence: event.sequence,
      interactions: didUpdate ? interactions : state.interactions,
    };
  }

  return { status: 'offline', nextLiveAt: state.nextLiveAt };
}
