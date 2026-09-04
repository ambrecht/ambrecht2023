import { useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';

import {
  getCompletionNudge,
  getNotfallPhaseViewData,
  notfallActions,
} from '../copy/crisis';
import { useNotfallFlow } from '../hooks/useNotfallFlow';
import { getNotfallJourneyState } from '../lib/journey';
import { isBodyPhase, isNotfallPhase, type NotfallState } from '../lib/machine';
import type { NotfallActionId, NotfallPhaseId, NotfallPhaseViewData } from '../types';
import styles from './notfall.module.css';

const actionLookup = new Map(notfallActions.map((action) => [action.id, action]));

export function NotfallExperience() {
  const router = useRouter();
  const [state, dispatch] = useNotfallFlow();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const journey = useMemo(() => getNotfallJourneyState(), []);
  const loggedActionRef = useRef(false);
  const loggedBodyRef = useRef(false);
  const loggedExitRef = useRef(false);

  useEffect(() => {
    dispatch({ type: 'start', nowMs: performance.now() });
    storeLocalEvent({ event: 'crisis_started' });
  }, [dispatch]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        logExit();
        dispatch({ type: 'exit' });
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch, state]);

  useEffect(() => {
    if (!isPhaseState(state)) {
      if (state.status === 'action' || state.status === 'action-confirmation') {
        headingRef.current?.focus({ preventScroll: true });
      }
      return;
    }

    if (isBodyPhase(state.status) && !loggedBodyRef.current) {
      loggedBodyRef.current = true;
      storeLocalEvent({
        event: 'time_to_body',
        timeToBodyMs: Math.round(performance.now() - state.startedAtMs),
      });
    }

    if (!isBodyPhase(state.status)) {
      headingRef.current?.focus({ preventScroll: true });
    }
  }, [state]);

  useEffect(() => {
    if (state.status === 'exited') {
      router.replace('/');
    }
  }, [router, state.status]);

  useEffect(() => {
    if (state.status !== 'action-confirmation' || loggedActionRef.current) {
      return;
    }

    loggedActionRef.current = true;
    storeLocalEvent({
      event: 'action_selected',
      actionId: state.actionId,
      timeToActionMs: Math.round(state.timeToActionMs),
    });
  }, [state]);

  function logExit() {
    if (loggedExitRef.current) return;

    loggedExitRef.current = true;
    storeLocalEvent({
      event: 'crisis_exited',
      exit_phase: state.status,
      time_to_exit: 'startedAtMs' in state
        ? Math.round(performance.now() - state.startedAtMs)
        : undefined,
    });
  }

  const liveAnnouncement = isPhaseState(state)
    ? getNotfallPhaseViewData(state.status, state.elapsedMs, journey).headline
    : state.status === 'action'
      ? 'Jetzt folgt eine Handlung.'
      : state.status === 'action-confirmation'
        ? 'Handlung ausgewählt.'
        : '';

  return (
    <main className={styles.root} aria-label="Notfallmodus">
      <div className={styles.srOnly} aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {isPhaseState(state) ? (
        <PhaseScreen
          headingRef={headingRef}
          phase={getNotfallPhaseViewData(state.status, state.elapsedMs, journey)}
          elapsedMs={state.elapsedMs}
          isPaused={state.timerState !== 'running'}
          onActionNow={() => {
            storeLocalEvent({
              event: 'action_now_clicked',
              exit_phase: state.status,
              elapsedMs: Math.round(performance.now() - state.startedAtMs),
            });
            dispatch({ type: 'action.now', nowMs: performance.now() });
          }}
          onNext={() => dispatch({ type: 'phase.next', nowMs: performance.now() })}
          onPause={() => dispatch({ type: 'pause.user' })}
          onResume={() => dispatch({ type: 'resume.user' })}
          onExit={() => {
            logExit();
            dispatch({ type: 'exit' });
          }}
        />
      ) : null}

      {state.status === 'action' ? (
        <ActionScreen
          headingRef={headingRef}
          nudge={getCompletionNudge(journey)}
          onSelect={(actionId) =>
            dispatch({ type: 'action.select', actionId, nowMs: performance.now() })
          }
        />
      ) : null}

      {state.status === 'action-confirmation' ? (
        <ActionSelectedScreen
          headingRef={headingRef}
          actionId={state.actionId}
          onExit={() => {
            logExit();
            dispatch({ type: 'exit' });
          }}
        />
      ) : null}
    </main>
  );
}

type PhaseScreenProps = {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  phase: NotfallPhaseViewData;
  elapsedMs: number;
  isPaused: boolean;
  onActionNow: () => void;
  onNext: () => void;
  onPause: () => void;
  onResume: () => void;
  onExit: () => void;
};

function PhaseScreen({
  headingRef,
  phase,
  elapsedMs,
  isPaused,
  onActionNow,
  onNext,
  onPause,
  onResume,
  onExit,
}: PhaseScreenProps) {
  const canContinue = elapsedMs >= (phase.minDurationMs ?? 0);

  return (
    <section
      className={[
        styles.screen,
        phase.visualPhase === 'body' ? styles.bodyScreen : styles.interruptScreen,
      ].join(' ')}
      aria-labelledby="notfall-phase-title"
    >
      <div className={styles.topBar}>
        <span>{phase.visualPhase === 'body' ? 'HIER' : 'NOTFALLMODUS'}</span>
        <button className={styles.quietLink} type="button" onClick={onExit}>
          Seite verlassen
        </button>
      </div>

      <div className={styles.centerStage}>
        <h1
          id="notfall-phase-title"
          className={[
            styles.title,
            phase.visualPhase === 'body' ? styles.bodyTitle : styles.interruptTitle,
          ].join(' ')}
          ref={headingRef}
          tabIndex={-1}
        >
          {phase.headline}
        </h1>
        <div className={styles.cueList} aria-live="polite" aria-atomic="false">
          {phase.visibleCues.map((cue) => (
            <p className={styles[`cue${toCssName(cue.tone ?? 'quiet')}`]} key={cue.text}>
              {cue.text}
            </p>
          ))}
        </div>
      </div>

      <div className={styles.bottomBar}>
        {phase.autoAdvance ? (
          <button className={styles.actionNowButton} type="button" onClick={onActionNow}>
            Ich bin wieder da
          </button>
        ) : canContinue ? (
          <button className={styles.actionNowButton} type="button" onClick={onNext}>
            Weiter
          </button>
        ) : (
          <span className={styles.stillness} aria-hidden="true" />
        )}
        <button
          className={styles.secondaryButton}
          type="button"
          onClick={isPaused ? onResume : onPause}
        >
          {isPaused ? 'Fortsetzen' : 'Pause'}
        </button>
      </div>
    </section>
  );
}

function ActionScreen({
  headingRef,
  nudge,
  onSelect,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  nudge: string | null;
  onSelect: (actionId: NotfallActionId) => void;
}) {
  return (
    <section className={styles.screen} aria-labelledby="notfall-action-title">
      <div className={styles.topBar}>
        <span>HANDLUNG</span>
        <span>JETZT</span>
      </div>
      <div className={styles.centerStage}>
        <h1
          id="notfall-action-title"
          className={`${styles.title} ${styles.actionHeading}`}
          ref={headingRef}
          tabIndex={-1}
        >
          DU MUSST DEM NICHT FOLGEN.
        </h1>
        <div className={styles.actionIntro}>
          <p>Der Wunsch darf mitkommen.</p>
          <p>Du entscheidest, wohin du gehst.</p>
          <p>Was trägt dich jetzt weiter in die Wirklichkeit?</p>
          {nudge ? <p className={styles.optionalText}>{nudge}</p> : null}
        </div>
      </div>
      <div className={styles.actionGrid}>
        {notfallActions.map((action) => (
          <button
            key={action.id}
            className={styles.actionButton}
            type="button"
            onClick={() => onSelect(action.id)}
          >
            {action.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function ActionSelectedScreen({
  headingRef,
  actionId,
  onExit,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  actionId: NotfallActionId;
  onExit: () => void;
}) {
  const action = actionLookup.get(actionId);

  return (
    <section className={`${styles.screen} ${styles.bodyScreen}`} aria-labelledby="notfall-confirmation-title">
      <div className={styles.topBar}>
        <span>GEWÄHLT</span>
        <span>WIRKLICHKEIT</span>
      </div>
      <div className={styles.centerStage}>
        <h1
          id="notfall-confirmation-title"
          className={`${styles.title} ${styles.actionHeading}`}
          ref={headingRef}
          tabIndex={-1}
        >
          {action?.label}
        </h1>
        <div className={styles.cueList}>
          {action?.confirmation.map((line) => (
            <p className={styles.cueQuiet} key={line}>{line}</p>
          ))}
        </div>
      </div>
      <div className={styles.bottomBar}>
        <button className={styles.primaryButton} type="button" onClick={onExit}>
          Seite schließen
        </button>
      </div>
    </section>
  );
}

function toCssName(value: string): string {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function storeLocalEvent(payload: Record<string, unknown>) {
  try {
    const key = 'notfall:events';
    const previous = JSON.parse(window.localStorage.getItem(key) ?? '[]') as unknown[];
    window.localStorage.setItem(
      key,
      JSON.stringify([
        ...previous.slice(-49),
        { ...payload, createdAt: new Date().toISOString() },
      ]),
    );
  } catch {
    // Local analytics are optional and must never interrupt the emergency flow.
  }
}

function isPhaseState(
  state: NotfallState,
): state is Extract<NotfallState, { status: NotfallPhaseId }> {
  return isNotfallPhase(state.status);
}
