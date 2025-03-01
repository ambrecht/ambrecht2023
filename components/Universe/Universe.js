import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import dynamic from 'next/dynamic';
import styled from 'styled-components';

const CameraControls = dynamic(() => import('./CameraControls'), {
  ssr: false,
});
const SkyBox = dynamic(() => import('./SkyBox'), { ssr: false });

const UniverseContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  canvas {
    width: 100%;
    height: 100%;
  }
  .controls {
    position: absolute;
    top: 10px;
    left: 10px;
    display: flex;
    gap: 10px;
    z-index: 10;
  }
`;

const StyledButton = styled.button`
  cursor: pointer;
  font-size: 0.8em;
  padding: 0.5em 0.8em;
  border-radius: 2em;
  border: 0.15em solid transparent;
  background-image: linear-gradient(
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0)
    ),
    linear-gradient(
      72.61deg,
      rgba(0, 130, 255, 1) 22.63%,
      rgba(79, 5, 245, 1) 84.67%
    );
  background-origin: border-box;
  background-clip: content-box, border-box;
  box-shadow: 1em 50em 0.5em black inset;
  transition: all 0.5s;
  text-transform: lowercase;

  &:hover {
    box-shadow: none;
    span {
      color: white;
    }
  }
`;

const ButtonText = styled.span`
  background: linear-gradient(
    72.61deg,
    rgba(0, 130, 255, 1) 22.63%,
    rgba(79, 5, 245, 1) 84.67%
  );
  color: transparent;
  -webkit-background-clip: text;
  font-weight: 600;
  line-height: 1rem;
  letter-spacing: 0.1rem;
  text-transform: lowercase;
`;

const Universe = () => {
  const containerRef = useRef(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioFiles, setAudioFiles] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Audiodateien vom Server abrufen
    const fetchAudioFiles = async () => {
      try {
        const response = await fetch('/api/get-audio-files');
        const files = await response.json();
        setAudioFiles(files);
      } catch (err) {
        console.error('Fehler beim Abrufen der Audiodateien:', err);
      }
    };

    fetchAudioFiles();
  }, []);

  const loadRandomAudio = () => {
    if (audioFiles.length === 0) return;
    const randomIndex = Math.floor(Math.random() * audioFiles.length);
    const randomFile = audioFiles[randomIndex];
    if (audioRef.current) {
      audioRef.current.src = `/audio/${randomFile}`;
      audioRef.current.load();
    }
  };

  useEffect(() => {
    // Audio-Initialisierung nur im Browser
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      audioRef.current.loop = true;

      audioRef.current.addEventListener('canplaythrough', () => {
        setAudioLoaded(true);
      });

      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio-Ladefehler:', e);
      });

      loadRandomAudio();

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.remove();
        }
      };
    }
  }, [audioFiles]);

  useEffect(() => {
    const fullscreenChangeHandler = () => {
      if (document.fullscreenElement) {
        setIsFullscreen(true);
      } else {
        setIsFullscreen(false);
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setIsPlaying(false);
      }
    };

    document.addEventListener('fullscreenchange', fullscreenChangeHandler);
    return () => {
      document.removeEventListener('fullscreenchange', fullscreenChangeHandler);
    };
  }, []);

  const handleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        // Audio wird im fullscreenchange-Handler behandelt
        if (audioRef.current && audioLoaded) {
          loadRandomAudio();
          await audioRef.current.play();
          setIsPlaying(true);
        }
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen-Fehler:', err);
    }
  };

  const handlePlayAudio = async () => {
    if (!audioRef.current || !audioLoaded) return;

    try {
      if (isPlaying) {
        await audioRef.current.pause();
      } else {
        loadRandomAudio();
        await audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (err) {
      console.error('Audio-Wiedergabefehler:', err);
    }
  };

  return (
    <UniverseContainer ref={containerRef}>
      <div className="controls">
        <StyledButton onClick={handleFullscreen}>
          <ButtonText>{isFullscreen ? 'Zurück' : 'Universum'}</ButtonText>
        </StyledButton>
        {isFullscreen && (
          <StyledButton
            onClick={handlePlayAudio}
            disabled={audioFiles.length === 0}
          >
            <ButtonText>{isPlaying ? 'pause audio' : 'play audio'}</ButtonText>
          </StyledButton>
        )}
      </div>
      <Canvas camera={{ position: [1, 1, 1] }}>
        <SkyBox />
        <CameraControls />
      </Canvas>
    </UniverseContainer>
  );
};

export default Universe;
