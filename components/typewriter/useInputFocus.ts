import { useEffect, RefObject } from 'react';

export function useInputFocus(
  ref: RefObject<HTMLInputElement | null>,
  isMobile: boolean,
) {
  useEffect(() => {
    const focusInput = () => {
      setTimeout(
        () => {
          if (ref.current && !document.hidden) {
            ref.current.focus({ preventScroll: true });
          }
        },
        isMobile ? 500 : 0,
      );
    };

    focusInput();

    window.addEventListener('focus', focusInput);
    document.addEventListener('click', focusInput);
    document.addEventListener('fullscreenchange', focusInput);

    return () => {
      window.removeEventListener('focus', focusInput);
      document.removeEventListener('click', focusInput);
      document.removeEventListener('fullscreenchange', focusInput);
    };
  }, [ref, isMobile]);
}
