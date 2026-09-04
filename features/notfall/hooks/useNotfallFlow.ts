import { useEffect, useReducer, useRef } from 'react';

import {
  initialNotfallState,
  isNotfallPhase,
  reduceNotfallState,
  type NotfallEvent,
  type NotfallState,
} from '../lib/machine';

export function useNotfallFlow(): [NotfallState, React.Dispatch<NotfallEvent>] {
  const [state, dispatch] = useReducer(reduceNotfallState, initialNotfallState);
  const stateRef = useRef(state);
  const lastTickRef = useRef<number | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    let frameId = 0;

    function tick(now: number) {
      const current = stateRef.current;

      if (!isNotfallPhase(current.status) || current.timerState !== 'running') {
        lastTickRef.current = now;
        frameId = window.requestAnimationFrame(tick);
        return;
      }

      const lastTick = lastTickRef.current ?? now;
      const elapsedMs = now - lastTick;
      lastTickRef.current = now;

      dispatch({ type: 'tick', elapsedMs });
      frameId = window.requestAnimationFrame(tick);
    }

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    function handleVisibilityChange() {
      dispatch({
        type:
          document.visibilityState === 'visible'
            ? 'visibility.visible'
            : 'visibility.hidden',
      });
      lastTickRef.current = performance.now();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return [state, dispatch];
}
