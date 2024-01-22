'use client';
import Image from 'next/image';
import styled from 'styled-components';

import MyGridComponent from '@/app/start/StackGrid';
import profilePic from '@/public/ickewa.png';
import TechStrDes from '@/app/start/TechStrDes';
import { imageClampBuilder, clampBuilder } from '@/lib/utils';
import Survey from '@/components/sympathy-test';
import { Quote, Headline1, Headline2, Paragraph, Bild } from '@/styles/index';

export default function Home() {
  return (
    <>
      <Grid>
        <Section1>
          <PreText>Mein Name ist Tino Ambrecht, ich bin ein &nbsp; </PreText>
          <ColorP>digitaler Ikonoklast.</ColorP>
          <br />
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
`;

const Section1 = styled.div`
  hyphens: auto;
  text-align: justify;
  width: 100%;

  grid-column: 1/ 2;

  position: relative; // Positionierung relativ zum Grid
  z-index: 2; // Höherer z-index, um über dem Bild zu sein
  place-self: center start;
  margin-bottom: 5em;
  line-height: 125%;
`;

const ImageContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  border-bottom-right-radius: 40%;
  transform: scale(0.8);
  grid-row: 1;
  grid-column: 2 / 4; // ImageContainer nimmt die zweite Spalte ein
  justify-self: start;
  background: transparent;

  z-index: 1;

  // Pseudo-Elemente für den Hintergrund

  &::before {
    content: '';
    position: absolute;
    top: -10%; // Versetzt nach oben
    right: 18vw; // Versetzt nach links
    width: ${clampBuilder({
      minWidthPx: 600,
      maxWidthPx: 1920,
      minValue: 200,
      maxValue: 500,
      units: 'px',
    })};
    height: 200vh; // Höhe des Rechtecks
    background: rgb(0, 130, 255);
    background: linear-gradient(
      0deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(79, 5, 245, 1) 25%,
      rgba(255, 255, 255, 0) 100%
    );
    clip-path: polygon(100% 0%, 75% 50%, 100% 100%, 33% 100%, 0% 50%, 25% 0%);
    z-index: 2;
    mix-blend-mode: color;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0%; // Versetzt nach unten
    left: 18vw; // Versetzt nach rechts
    width: ${clampBuilder({
      minWidthPx: 600,
      maxWidthPx: 1920,
      minValue: 200,
      maxValue: 500,
      units: 'px',
    })};
    height: 200vh; // Höhe des zweiten Rechtecks
    background: rgb(0, 130, 255);
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(0, 130, 255, 1) 24%,
      rgba(255, 255, 255, 0) 100%
    );
    clip-path: polygon(75% 0%, 100% 50%, 75% 100%, 0% 100%, 25% 50%, 0% 0%);
    mix-blend-mode: color;
    z-index: 1;
  }
`;
const HeroImage = styled(Image)`
  object-fit: contain; // Stellt sicher, dass das Bild den Container vollständig abdeckt
  object-position: center; // Zentriert den Fokus des Bildes
  filter: grayscale(100%);
  border-bottom-left-radius: 80%;
  width: ${imageClampBuilder(600, 1920, 250, 350)};
`;

const PreText = styled.div`
  display: inline;
  font-family: var(--gara-Font);
  line-height: 25%;

  font-weight: 1000;
  background: linear-gradient(72.61deg, #ffffff 22.63%, #ffffff 84.67%);
  -webkit-background-clip: text;
  color: transparent;
`;

const ColorP = styled.p`
  display: inline;
  font-family: var(--gara-Font);
  font-weight: 900;
  font-size: 120%;
  background: linear-gradient(
    72.61deg,
    rgba(0, 130, 255, 1) 22.63%,
    rgba(79, 5, 245, 1) 84.67%
  );
  -webkit-background-clip: text;
  color: transparent;
`;
