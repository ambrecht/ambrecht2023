import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

const NoiseCanvas = styled.canvas`
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.28;
  mix-blend-mode: screen;
  filter: contrast(1.2) brightness(1.1);
  z-index: 1000;
  pointer-events: none;
`;

const WhiteNoise = ({ mode, prefersReducedMotion }) => {
  const canvasRef = useRef(null);
  const isBrowser = typeof window !== 'undefined';

  useEffect(() => {
    if (!isBrowser || (mode !== 'TV' && mode !== 'STORY')) {
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let imageData = ctx.createImageData(canvas.width, canvas.height);

    const generateNoise = () => {
      if (
        imageData.width !== canvas.width ||
        imageData.height !== canvas.height
      ) {
        imageData = ctx.createImageData(canvas.width, canvas.height);
      }
      for (let i = 0; i < imageData.data.length; i += 4) {
        const randomValue = Math.floor(Math.random() * 255);
        imageData.data[i] = randomValue;
        imageData.data[i + 1] = randomValue;
        imageData.data[i + 2] = randomValue;
        imageData.data[i + 3] = 255; // Alpha-Wert
      }
      ctx.putImageData(imageData, 0, 0);
    };

    const intervalId = setInterval(generateNoise, 60); // Lebendigeres Rauschen

    // Cleanup-Funktion
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [mode, isBrowser]);

  if (!isBrowser) {
    return null;
  }

  return <NoiseCanvas ref={canvasRef} width="800" height="600" />;
};

export default WhiteNoise;
