'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import styled from 'styled-components';
import Background from '@/components/Background';
import MyGridComponent from '@/app/start/StackGrid';
import profilePic from '@/public/ich.png';
import TechStrDes from '@/app/start/TechStrDes';
import { clampBuilder } from '@/lib/utils';
import Survey from '@/components/sympathy-test';
import { Headline1 } from '@/styles/index';
import type { StartPageContent, SympathyTestContent } from '@/src/content/schemas';

interface StartClientProps {
  startContent: StartPageContent;
  sympathyContent: SympathyTestContent;
}

export default function StartClient({
  startContent,
  sympathyContent,
}: StartClientProps) {
  const [showBackground, setShowBackground] = useState(true);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const updateOpacity = () => {
      const newOpacity = 1 - window.scrollY / 500;
      if (newOpacity <= 0) {
        setShowBackground(false);
        setTimeout(() => {
          setShowBackground(false);
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
    <StartContainer>
      {showBackground && <Background opacityValue={opacity} />}
      <Grid>
        <Section1>
          <PreText>{startContent.hero.introLines[0]} </PreText>
          <ColorP>{startContent.hero.highlight} </ColorP>

          {startContent.hero.introLines.slice(1).map((line) => (
            <PreText key={line}>{line}</PreText>
          ))}
        </Section1>

        <ImageContainer>
          <HeroImage src={profilePic} alt="Picture of Tino Ambrecht" />
        </ImageContainer>
      </Grid>
      <TechStrDes></TechStrDes>
      <Headline1>{startContent.headings.teamFit}</Headline1>
      <Survey content={sympathyContent}></Survey>
      <Headline1>{startContent.headings.techStack}</Headline1>
      <MyGridComponent></MyGridComponent>
    </StartContainer>
  );
}

const StartContainer = styled.div``;

const Grid = styled.div`
  font-size: ${clampBuilder({
    minWidthPx: 600,
    maxWidthPx: 1920,
    minValue: 2,
    maxValue: 5,
    units: 'rem',
  })};
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
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

  position: relative;
  z-index: 2;
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
  grid-column: 2 / 4;
  justify-self: start;
  z-index: 1;

  @media (max-width: 500px) {
    grid-column: 1;
    display: none;
  }
`;
const HeroImage = styled(Image)`
  object-fit: contain;
  object-position: center;
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
