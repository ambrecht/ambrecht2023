'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import styled from 'styled-components';

const Scene = dynamic(() => import('../../components/ThreeScene/index'), {
  ssr: false,
  loading: () => (
    <div aria-hidden="true" style={{ width: '100vw', height: '100vh' }} />
  ),
});
const NewsTicker = dynamic(() => import('../../components/Newsticker'), {
  ssr: false,
  loading: () => <div aria-hidden="true" />,
});
const Noise = dynamic(() => import('../../components/Noise'), {
  ssr: false,
  loading: () => <div aria-hidden="true" />,
});

const FALLBACK_IMAGES = [];
const STORY_TEXT = `Getöse. Stimmengewirr. Histerisches Lachen. Dumpf hallende Schläge. Alles dringt auf mich ein, verlangt meine Aufmerksamkeit. Konzentration. Das rechte Knie zittert als würde es gleich aus der Fassung springen. Beruhig dich! Alles schon tausendmal erlebt. Ein Schluck aus dem Glas. Dabei Schütte ich mir die Hälfte über den Hals. Einfach nur einamten und ausatmen, nicht mehr, nicht weniger. Draußen fangen sie an. Schlagzeug und Bass rumpeln langsam los, versuchen sich zu finden wie zwei Tauben beim Balztanz. Es dauert einen Moment bis sie sich aufeinander einstimmen, bis sie sich gefunden haben. Der Bass schnarrt und eine der Saiten ist schlimm verstimmt, wodurch sein Klang etwas trauriges düsteres und hoffnungsloses hat. Die Becken und Trommelschläge werden von dieser Melancholie angesteckt. alles hallt ewig dramatisch nach, wie bei einem Traumermarsch von Besoffenen. Dim, Dim, Dim, Dam-Dam-Dam-Dam...`;
const TYPING_SPEED = 60;
const SESSION_MAX_MS = 0;
const ZAP_BUDGET_DEFAULT = Number.POSITIVE_INFINITY;
const FREEZE_AFTER_ZAPS = Number.POSITIVE_INFINITY;
const FREEZE_DURATION_MS = 6000;
const HOLD_END_DELAY_MS = 2000;
const FREEZE_TEXTS = [
  'Steh still.',
  'Nicht alles ist sichtbar.',
  'Nimm den Ausfall ernst.',
  'Bleib im Riss.',
];
const STORY_ENABLED = false;

const Home = () => {
  const [imagePaths, setImagePaths] = useState(FALLBACK_IMAGES);
  const [mode, setMode] = useState('TV');
  const [sessionEndAt, setSessionEndAt] = useState(0);
  const [zapBudget, setZapBudget] = useState(ZAP_BUDGET_DEFAULT);
  const [zapsUsed, setZapsUsed] = useState(0);
  const [freezeUsed, setFreezeUsed] = useState(false);
  const [freezeUntil, setFreezeUntil] = useState(0);
  const [storyUsed, setStoryUsed] = useState(false);
  const [heldFragmentId, setHeldFragmentId] = useState(null);
  const [currentFragmentId, setCurrentFragmentId] = useState(null);
  const [freezeText, setFreezeText] = useState(FREEZE_TEXTS[0]);
  const [storyActive, setStoryActive] = useState(false);
  const [displayedStory, setDisplayedStory] = useState('');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const storyIndex = useRef(0);

  useEffect(() => {
    const now = Date.now();
    if (SESSION_MAX_MS > 0) {
      setSessionEndAt(now + SESSION_MAX_MS);
    }
    const initTimer = window.setTimeout(() => {
      setMode('TV');
    }, 400);
    return () => window.clearTimeout(initTimer);
  }, []);

  useEffect(() => {
    if (mode !== 'TV') {
      setMode('TV');
      setStoryActive(false);
    }
  }, [mode]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };
    updatePreference();
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updatePreference);
      return () => mediaQuery.removeEventListener('change', updatePreference);
    }
    mediaQuery.addListener(updatePreference);
    return () => mediaQuery.removeListener(updatePreference);
  }, []);

  useEffect(() => {
    if (!sessionEndAt || mode === 'END') {
      return;
    }
    const remaining = sessionEndAt - Date.now();
    if (remaining <= 0) {
      setMode('END');
      return;
    }
    const timer = window.setTimeout(() => {
      setMode('END');
    }, remaining);
    return () => window.clearTimeout(timer);
  }, [mode, sessionEndAt]);

  useEffect(() => {
    if (mode !== 'END') {
      return;
    }
    setStoryActive(false);
  }, [mode]);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const response = await fetch('/api/tv-images');
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }
        const data = await response.json();
        if (data.images?.length) {
          setImagePaths(data.images);
        }
      } catch (error) {
        console.error('Failed to load TV images', error);
      }
    };

    loadImages();
  }, []);

  useEffect(() => {
    if (imagePaths.length) {
      setCurrentFragmentId(imagePaths[0]);
    }
  }, [imagePaths]);

  useEffect(() => {
    const storedHold = window.localStorage.getItem('heldFragmentId');
    if (storedHold) {
      setHeldFragmentId(storedHold);
    }
  }, []);

  useEffect(() => {
    if (heldFragmentId) {
      window.localStorage.setItem('heldFragmentId', heldFragmentId);
    }
  }, [heldFragmentId]);

  useEffect(() => {
    if (!storyActive) {
      setDisplayedStory('');
      storyIndex.current = 0;
      return;
    }

    setDisplayedStory('');
    storyIndex.current = 0;

    const intervalId = window.setInterval(() => {
      storyIndex.current = Math.min(STORY_TEXT.length, storyIndex.current + 1);
      setDisplayedStory(STORY_TEXT.slice(0, storyIndex.current));
      if (storyIndex.current >= STORY_TEXT.length) {
        window.clearInterval(intervalId);
        setStoryActive(false);
        if (mode !== 'END' && mode !== 'FREEZE') {
          setMode('TV');
        }
      }
    }, TYPING_SPEED);

    return () => window.clearInterval(intervalId);
  }, [storyActive, mode]);

  useEffect(() => {
    if (freezeUsed || zapsUsed < FREEZE_AFTER_ZAPS || mode === 'END') {
      return;
    }
    setFreezeUsed(true);
    setFreezeText(
      FREEZE_TEXTS[Math.floor(Math.random() * FREEZE_TEXTS.length)],
    );
    setFreezeUntil(Date.now() + FREEZE_DURATION_MS);
    setStoryActive(false);
    setMode('FREEZE');
  }, [freezeUsed, zapsUsed, mode]);

  useEffect(() => {
    if (mode !== 'FREEZE' || !freezeUntil) {
      return;
    }
    const remaining = freezeUntil - Date.now();
    if (remaining <= 0) {
      setMode('TV');
      return;
    }
    const timer = window.setTimeout(() => {
      setMode('TV');
    }, remaining);
    return () => window.clearTimeout(timer);
  }, [mode, freezeUntil]);

  const handleZap = useCallback(
    (nextIndex) => {
      if (mode !== 'TV') {
        return;
      }
      setZapsUsed((prev) => prev + 1);
      setZapBudget((prev) => Math.max(0, prev - 1));
      const nextId = imagePaths[nextIndex];
      if (nextId) {
        setCurrentFragmentId(nextId);
      }
    },
    [imagePaths, mode],
  );

  const handleStoryTrigger = () => {
    if (!STORY_ENABLED) {
      return;
    }
    if (mode === 'END' || mode === 'FREEZE') {
      return;
    }
    if (storyUsed) {
      if (!heldFragmentId && currentFragmentId) {
        setHeldFragmentId(currentFragmentId);
        setZapBudget(0);
        window.setTimeout(() => {
          setMode('END');
        }, HOLD_END_DELAY_MS);
      } else {
        setMode('END');
      }
      return;
    }
    setStoryUsed(true);
    setStoryActive(true);
    setMode('STORY');
  };

  return (
    <Container>
      <NewsTicker mode={mode} prefersReducedMotion={prefersReducedMotion} />
      {(storyActive || mode === 'FREEZE') && (
        <StoryOverlay>
          <StoryText>
            {mode === 'FREEZE' ? freezeText : displayedStory || '\u00a0'}
          </StoryText>
        </StoryOverlay>
      )}
      <Noise mode={mode} prefersReducedMotion={prefersReducedMotion} />
      <SiteGrid>
        <Scene
          imagePaths={imagePaths}
          mode={mode}
          zapBudget={zapBudget}
          onZap={handleZap}
          prefersReducedMotion={prefersReducedMotion}
        />
      </SiteGrid>
      {STORY_ENABLED && (
        <StoryTrigger onClick={handleStoryTrigger}>
          {storyActive ? 'Schluss mit dem Stream' : 'Story einschalten'}
        </StoryTrigger>
      )}
    </Container>
  );
};

export default Home;

const Container = styled.div`
  max-width: 100vw;
  max-height: 100vh;
  overflow: hidden;
`;

const SiteGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  padding-top: 20rem;
  position: relative;
  padding-left: 5.8rem;
  padding-right: 5.8rem;
`;

const StoryTrigger = styled.button`
  position: fixed;
  right: 1rem;
  top: 1rem;
  z-index: 20;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.4);
  padding: 0.65rem 1.5rem;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.15rem;
  cursor: pointer;
  font-size: 0.8rem;
  transition:
    transform 0.2s ease,
    background 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.1);
  }
`;

const StoryOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 32vh;
  z-index: 8;
  pointer-events: none;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.95) 0%,
    rgba(0, 0, 0, 0.5) 35%,
    rgba(0, 0, 0, 0.05) 80%
  );
  padding: 2rem 3rem 0;
`;

const StoryText = styled.p`
  max-width: 95%;
  color: #fefefe;
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  font-weight: 600;
  line-height: 1.6;
  letter-spacing: 0.04rem;
  text-shadow: 0 0 30px rgba(0, 0, 0, 0.8);
  white-space: pre-wrap;
  font-family: 'IBM Plex Sans', sans-serif;
`;
