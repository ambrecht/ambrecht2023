'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  Copy,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  Search,
} from 'lucide-react';
import hikamData from '@/src/json/hikma3.json';
import sufiCommentData from '@/src/json/sufi-kommentar.json';

type Hikma = {
  nummer: number;
  arabisch: string;
  uebersetzung_de: string;
  kommentar_de: string;
  sinnkern_de: string;
  version_nah_de: string;
  version_lyrisch_de: string;
  notiz?: string;
};

type SufiComment = {
  nummer: number;
  kommentar_sufi_de: string;
};

const INTERVAL_MS = 120000;

const hikam = (hikamData as { hikam: Hikma[] }).hikam;
const sufiCommentsByNumber = new Map(
  (sufiCommentData as { hikam: SufiComment[] }).hikam.map((hikma) => [
    hikma.nummer,
    hikma.kommentar_sufi_de,
  ])
);

const getRandomIndex = () => Math.floor(Math.random() * hikam.length);

const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();
const displayText = (hikma: Hikma) =>
  hikma.version_lyrisch_de || hikma.version_nah_de || hikma.uebersetzung_de;
const commentText = (hikma: Hikma) =>
  sufiCommentsByNumber.get(hikma.nummer) || hikma.kommentar_de;

export default function WisdomPage() {
  const [index, setIndex] = useState(getRandomIndex);
  const [isRunning, setIsRunning] = useState(true);
  const [copied, setCopied] = useState(false);
  const [entered, setEntered] = useState(false);
  const [numberInput, setNumberInput] = useState('');
  const timerRef = useRef<number | null>(null);

  const current = hikam[index];
  const count = hikam.length;
  const currentTranslation = displayText(current);
  const currentComment = commentText(current);

  const progressKey = `${index}-${isRunning}`;

  const nextWisdom = useCallback(() => {
    setIndex((currentIndex) => {
      if (count <= 1) {
        return currentIndex;
      }

      let nextIndex = currentIndex;
      while (nextIndex === currentIndex) {
        nextIndex = Math.floor(Math.random() * count);
      }

      return nextIndex;
    });
  }, [count]);

  const selectWisdomIndex = useCallback((nextIndex: number) => {
    setIndex(nextIndex);
    setIsRunning(false);
  }, []);

  const selectWisdomByNumber = useCallback(
    (number: number) => {
      const nextIndex = hikam.findIndex((hikma) => hikma.nummer === number);

      if (nextIndex >= 0) {
        selectWisdomIndex(nextIndex);
        return true;
      }

      return false;
    },
    [selectWisdomIndex]
  );

  const showAdjacentWisdom = useCallback(
    (direction: 1 | -1) => {
      setIndex((currentIndex) => (currentIndex + direction + count) % count);
    },
    [count]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditable =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;

      if (isEditable) {
        return;
      }

      if (event.code === 'Space') {
        event.preventDefault();
        nextWisdom();
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        showAdjacentWisdom(1);
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showAdjacentWisdom(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextWisdom, showAdjacentWisdom]);

  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = window.setInterval(nextWisdom, INTERVAL_MS);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, nextWisdom]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setEntered(true), 80);
    return () => window.clearTimeout(timeout);
  }, [index]);

  useEffect(() => {
    setEntered(false);
  }, [index]);

  useEffect(() => {
    setNumberInput(String(current.nummer));
  }, [current.nummer]);

  const submitNumberInput = () => {
    const selectedNumber = Number.parseInt(numberInput, 10);

    if (Number.isNaN(selectedNumber)) {
      setNumberInput(String(current.nummer));
      return;
    }

    const wasSelected = selectWisdomByNumber(selectedNumber);

    if (!wasSelected) {
      setNumberInput(String(current.nummer));
    }
  };

  const copyText = useMemo(
    () =>
      [
        `Hikma ${current.nummer}`,
        '',
        normalize(current.arabisch),
        '',
        currentTranslation.trim(),
        '',
        normalize(currentComment),
      ].join('\n'),
    [current, currentComment, currentTranslation]
  );

  const copyWisdom = async () => {
    await navigator.clipboard.writeText(copyText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const enterFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    }
  };

  return (
    <main className="hikam-page fixed inset-0 z-50 overflow-hidden bg-[#120f0b] text-[#f7efe0]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(214,178,105,0.28),transparent_34%),linear-gradient(135deg,rgba(30,42,39,0.94),rgba(18,15,11,0.98)_46%,rgba(62,36,30,0.94))]" />
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:58px_58px]" />
      <div className="absolute left-[8vw] top-[10vh] h-72 w-72 rounded-full bg-[#c9a85f]/10 blur-3xl" />
      <div className="absolute bottom-[4vh] right-[8vw] h-80 w-80 rounded-full bg-[#3d8075]/12 blur-3xl" />

      <section className="hikam-shell relative flex flex-col">
        <header className="flex shrink-0 items-center justify-between gap-4 text-xs uppercase tracking-[0.28em] text-[#d9cda9]/75">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[#d4b36a]/70" />
            <span>Al-Hikam</span>
          </div>
          <span>
            {String(current.nummer).padStart(3, '0')} /{' '}
            {String(count).padStart(3, '0')}
          </span>
        </header>

        <article
          className={`hikam-stage mx-auto flex w-full flex-1 flex-col justify-center text-center transition duration-700 ease-out ${
            entered ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
          }`}
        >
          <p
            dir="rtl"
            lang="ar"
            className="hikam-arabic mx-auto text-balance font-serif text-[#fff8e8] [font-family:'Amiri','Scheherazade_New','Traditional_Arabic',Georgia,serif]"
          >
            {current.arabisch}
          </p>

          <div className="mx-auto h-px w-28 bg-gradient-to-r from-transparent via-[#d6b66f] to-transparent" />

          <p className="hikam-translation mx-auto text-balance font-serif text-[#f5ead2] [font-family:Georgia,'Times_New_Roman',serif]">
            {currentTranslation}
          </p>

          <p className="hikam-comment mx-auto text-pretty leading-relaxed text-[#d9d0bd]/80">
            {currentComment}
          </p>
        </article>

        <footer className="relative shrink-0">
          <nav
            aria-label="Hikma auswählen"
            className="hikam-picker mb-4 space-y-3"
          >
            <form
              className="hikam-number-form mx-auto flex max-w-sm items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                submitNumberInput();
              }}
            >
              <label className="sr-only" htmlFor="hikam-number">
                Hikma Nummer
              </label>
              <input
                id="hikam-number"
                className="hikam-number-input"
                inputMode="numeric"
                max={count}
                min={1}
                onBlur={submitNumberInput}
                onChange={(event) => setNumberInput(event.target.value)}
                placeholder="Nr."
                type="number"
                value={numberInput}
              />
              <button className="hikam-icon-control" title="Hikma öffnen" type="submit">
                <Search size={18} aria-hidden="true" />
                <span className="sr-only">Hikma öffnen</span>
              </button>
            </form>

            <div className="hikam-number-strip" role="listbox">
              {hikam.map((hikma, hikmaIndex) => {
                const isSelected = hikmaIndex === index;

                return (
                  <button
                    aria-label={`Hikma ${hikma.nummer} auswählen`}
                    aria-selected={isSelected}
                    className="hikam-number-button"
                    key={hikma.nummer}
                    onClick={() => selectWisdomIndex(hikmaIndex)}
                    role="option"
                    type="button"
                  >
                    {String(hikma.nummer).padStart(3, '0')}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="mb-4 h-px w-full overflow-hidden bg-white/10">
            {isRunning && (
              <div
                key={progressKey}
                className="h-full origin-left bg-[#d8b665]"
                style={{
                  animation: `hikam-progress ${INTERVAL_MS}ms linear forwards`,
                }}
              />
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <button className="hikam-control" onClick={nextWisdom} type="button">
              <RotateCcw size={18} aria-hidden="true" />
              <span>Nächste</span>
            </button>
            <button
              className="hikam-control"
              onClick={() => setIsRunning((value) => !value)}
              type="button"
            >
              {isRunning ? (
                <Pause size={18} aria-hidden="true" />
              ) : (
                <Play size={18} aria-hidden="true" />
              )}
              <span>{isRunning ? 'Stop' : 'Weiter'}</span>
            </button>
            <button className="hikam-control" onClick={copyWisdom} type="button">
              {copied ? (
                <Check size={18} aria-hidden="true" />
              ) : (
                <Copy size={18} aria-hidden="true" />
              )}
              <span>{copied ? 'Kopiert' : 'Kopieren'}</span>
            </button>
            <button
              className="hikam-icon-control"
              onClick={enterFullscreen}
              title="Vollbild"
              type="button"
            >
              <Maximize2 size={18} aria-hidden="true" />
              <span className="sr-only">Vollbild</span>
            </button>
          </div>
        </footer>
      </section>

      <style jsx global>{`
        body {
          margin: 0;
          background: #120f0b;
        }

        .hikam-page {
          min-height: 100svh;
        }

        .hikam-shell {
          height: 100svh;
          min-height: 100svh;
          overflow-y: auto;
          padding: max(1rem, env(safe-area-inset-top))
            max(1rem, env(safe-area-inset-right))
            max(1rem, env(safe-area-inset-bottom))
            max(1rem, env(safe-area-inset-left));
        }

        .hikam-stage {
          max-width: 72rem;
          gap: 1.55rem;
          padding: 1.6rem 0;
        }

        .hikam-arabic {
          max-width: 62rem;
          font-size: 2.05rem;
          line-height: 1.45;
        }

        .hikam-translation {
          max-width: 52rem;
          font-size: 1.35rem;
          line-height: 1.24;
          white-space: pre-line;
        }

        .hikam-comment {
          max-width: 44rem;
          font-size: 0.82rem;
        }

        @keyframes hikam-progress {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }

        .hikam-control,
        .hikam-icon-control,
        .hikam-number-input,
        .hikam-number-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
          min-height: 2.75rem;
          border: 1px solid rgba(245, 234, 210, 0.2);
          background: rgba(18, 15, 11, 0.38);
          color: #f5ead2;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.18);
          backdrop-filter: blur(14px);
          transition:
            transform 180ms ease,
            border-color 180ms ease,
            background 180ms ease;
        }

        .hikam-control {
          border-radius: 999px;
          padding: 0.65rem 1rem;
          font-size: 0.9rem;
        }

        .hikam-icon-control {
          width: 2.75rem;
          border-radius: 999px;
        }

        .hikam-number-form {
          min-height: 2.75rem;
        }

        .hikam-number-input {
          width: 100%;
          min-width: 0;
          border-radius: 999px;
          padding: 0.65rem 1rem;
          text-align: center;
          font-size: 0.9rem;
        }

        .hikam-number-input::-webkit-outer-spin-button,
        .hikam-number-input::-webkit-inner-spin-button {
          margin: 0;
        }

        .hikam-number-strip {
          display: flex;
          gap: 0.45rem;
          overflow-x: auto;
          overscroll-behavior-x: contain;
          padding: 0.15rem 0 0.55rem;
          scrollbar-width: thin;
          scrollbar-color: rgba(216, 182, 101, 0.58) rgba(255, 255, 255, 0.08);
        }

        .hikam-number-button {
          flex: 0 0 auto;
          min-width: 3.25rem;
          min-height: 2.25rem;
          border-radius: 999px;
          padding: 0.45rem 0.7rem;
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          color: rgba(245, 234, 210, 0.72);
        }

        .hikam-number-button[aria-selected='true'] {
          border-color: rgba(216, 182, 101, 0.92);
          background: rgba(216, 182, 101, 0.22);
          color: #fff8e8;
        }

        .hikam-control:hover,
        .hikam-icon-control:hover,
        .hikam-number-button:hover {
          transform: translateY(-1px);
          border-color: rgba(216, 182, 101, 0.72);
          background: rgba(216, 182, 101, 0.13);
        }

        .hikam-control:focus-visible,
        .hikam-icon-control:focus-visible,
        .hikam-number-input:focus-visible,
        .hikam-number-button:focus-visible {
          outline: 2px solid #d8b665;
          outline-offset: 3px;
        }

        @media (max-width: 640px) {
          .hikam-shell header {
            align-items: flex-start;
            letter-spacing: 0.2em;
          }

          .hikam-stage {
            justify-content: flex-start;
          }

          .hikam-shell footer > div:last-child {
            display: grid;
            grid-template-columns: 1fr 1fr;
            width: 100%;
          }

          .hikam-number-form {
            max-width: none;
          }

          .hikam-control {
            width: 100%;
            min-width: 0;
            padding-left: 0.75rem;
            padding-right: 0.75rem;
            font-size: 0.82rem;
          }

          .hikam-icon-control {
            width: 100%;
          }
        }

        @media (min-width: 480px) {
          .hikam-shell {
            padding: 1.35rem;
          }

          .hikam-stage {
            gap: 1.85rem;
          }

          .hikam-arabic {
            font-size: 2.55rem;
          }

          .hikam-translation {
            font-size: 1.55rem;
          }
        }

        @media (min-width: 768px) {
          .hikam-shell {
            padding: 1.75rem 2rem;
          }

          .hikam-stage {
            gap: 2.25rem;
            padding: 2rem 0;
          }

          .hikam-arabic {
            font-size: 3.35rem;
            line-height: 1.38;
          }

          .hikam-translation {
            font-size: 2rem;
          }

          .hikam-comment {
            font-size: 0.92rem;
          }
        }

        @media (min-width: 1024px) {
          .hikam-shell {
            padding: 2rem 3rem;
          }

          .hikam-stage {
            max-width: 82rem;
            gap: 2.5rem;
          }

          .hikam-arabic {
            max-width: 74rem;
            font-size: 4.15rem;
          }

          .hikam-translation {
            max-width: 62rem;
            font-size: 2.55rem;
          }
        }

        @media (min-width: 1440px) {
          .hikam-shell {
            padding: 2.35rem 4rem;
          }

          .hikam-stage {
            max-width: 94rem;
            gap: 2.8rem;
          }

          .hikam-arabic {
            max-width: 84rem;
            font-size: 5rem;
          }

          .hikam-translation {
            max-width: 70rem;
            font-size: 3rem;
          }

          .hikam-comment {
            max-width: 54rem;
            font-size: 1rem;
          }
        }

        @media (min-width: 1920px) {
          .hikam-shell {
            padding: 3rem 5rem;
          }

          .hikam-stage {
            max-width: 110rem;
            gap: 3.25rem;
          }

          .hikam-arabic {
            max-width: 98rem;
            font-size: 6.15rem;
          }

          .hikam-translation {
            max-width: 82rem;
            font-size: 3.55rem;
          }

          .hikam-comment {
            max-width: 62rem;
            font-size: 1.05rem;
          }
        }

        @media (min-width: 2560px) {
          .hikam-stage {
            max-width: 128rem;
          }

          .hikam-arabic {
            max-width: 112rem;
            font-size: 7.2rem;
          }

          .hikam-translation {
            max-width: 92rem;
            font-size: 4.15rem;
          }
        }
      `}</style>
    </main>
  );
}
