'use client';
import Image from 'next/image';
import styled from 'styled-components';
import Background from '@/components/Background';

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
          <Background></Background>
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

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
    height: 50vh;
  }
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

  border-bottom-left-radius: 80%;
  width: ${imageClampBuilder(600, 1920, 250, 350)};
  mix-blend-mode: overlay;
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
