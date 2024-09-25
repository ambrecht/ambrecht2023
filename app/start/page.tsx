'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import styled from 'styled-components';
import Background from '@/components/Background';
import Button from '@/components/Button';

import MyGridComponent from '@/app/start/StackGrid';
import profilePic from '@/public/ich.png';
import TechStrDes from '@/app/start/TechStrDes';
import { imageClampBuilder, clampBuilder } from '@/lib/utils';
import Survey from '@/components/sympathy-test';
import { Quote, Headline1, Headline2, Paragraph, Bild } from '@/styles/index';

export default function Home() {
  const [showBackground, setShowBackground] = useState(true);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const updateOpacity = () => {
      const newOpacity = 1 - window.scrollY / 500; // Anpassbar, um die Ausblendgeschwindigkeit zu ändern
      if (newOpacity <= 0) {
        setShowBackground(false); // Entfernt die Komponente aus dem DOM, wenn die Opazität Null erreicht
        setTimeout(() => {
          setShowBackground(false); // Setzt die Komponente nach 5 Sekunden zurück
        }, 5000);
      } else {
        setOpacity(newOpacity);
      }
    };

    if (showBackground) {
      window.addEventListener('scroll', updateOpacity, { passive: true });
      return () => window.removeEventListener('scroll', updateOpacity);
    }
  }, [showBackground]);

  return (
    <>
      {' '}
      {showBackground && <Background opacityValue={opacity} />}
      <Grid>
        <Section1>
          <PreText>Mein Name ist Tino Ambrecht, ich bin ein </PreText>
          <ColorP>digitaler Ikonoklast. </ColorP>

          <PreText>
            Mein Ziel ist es mit Hilfe von Technologie, Strategie und Design
            Werte für Menschen zu schaffen.
          </PreText>
        </Section1>

        <ImageContainer>
          <HeroImage src={profilePic} alt="Picture of Tino Ambrecht" />
        </ImageContainer>
      </Grid>
      <TechStrDes></TechStrDes>
      <Headline1>Passe ich in Ihr Team?</Headline1>
      <Survey></Survey>
      <Headline1>Technologiestack</Headline1>
      <MyGridComponent></MyGridComponent>
    </>
  );
}

const Grid = styled.div`
  font-size: ${clampBuilder({
    minWidthPx: 600,
    maxWidthPx: 1920,
    minValue: 2,
    maxValue: 5,
    units: 'rem',
  })};
  display: grid;
  grid-template-columns: 1fr 1fr 1fr; // Teilt das Grid in zwei Spalten
  width: 100%;
  max-width: 100vw;
  height: 100vh;
  pointer-events: none;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
    height: 50vh;
  }
`;

const Section1 = styled.div`
  hyphens: auto;
  text-align: justify-all;
  min-width: 50vw;

  grid-column: 1/ 2;

  position: relative; // Positionierung relativ zum Grid
  z-index: 2; // Höherer z-index, um über dem Bild zu sein
  place-self: center start;
  margin-bottom: 5em;
  line-height: 150%;
  word-break: keep-all;
  hyphens: none;

  @media (max-width: 500px) {
    grid-column: 1;
    margin-top: -7rem;
    margin-bottom: 0;
  }
`;

const ImageContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  border-bottom-right-radius: 40%;

  grid-row: 1;
  grid-column: 2 / 4; // ImageContainer nimmt die zweite Spalte ein
  justify-self: start;
  z-index: 1;

  @media (max-width: 500px) {
    grid-column: 1;
    display: none;
  }
`;
const HeroImage = styled(Image)`
  object-fit: contain; // Stellt sicher, dass das Bild den Container vollständig abdeckt
  object-position: center; // Zentriert den Fokus des Bildes
  mix-blend-mode: color-dodge;
  max-width: 22vw;
  max-height: 22vw;
  z-index: -5;
`;

const PreText = styled.div`
  display: inline;
  font-family: var(--pop-Font);
  line-height: 1.5rem;

  font-weight: 400;
  background: linear-gradient(72.61deg, #ffffff 22.63%, #ffffff 84.67%);
  -webkit-background-clip: text;
  color: transparent;
  word-break: keep-all;
  hyphens: none;
`;

const ColorP = styled.p`
  display: inline;
  font-size: 120%;
  background: linear-gradient(
    72.61deg,
    rgba(0, 130, 255, 1) 22.63%,
    rgba(79, 5, 245, 1) 84.67%
  );
  -webkit-background-clip: text;
  color: transparent;
  word-break: keep-all;
  hyphens: none;
`;
