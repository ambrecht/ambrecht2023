'use client';
import styled from 'styled-components';
import Image from 'next/image';
import React from 'react';
import { Quote, Headline1, Headline2, Paragraph } from '@/styles/index';
import Link from 'next/link';
// MARKUP
export function Footer() {
  return (
    <Wrapper>
      <StyledImage
        src={'/footer.png'}
        alt="Brutalism"
        fill={true}
      ></StyledImage>
      <Footerbox>
        <Link href="/tools/wordprocess">
          <Bild src="/3DDREIECK.svg" alt="Logo" width={250} height={250}></Bild>
        </Link>
        <Para>
          Tino Ambrecht <br />
          Schleifmühlweg. 9 <br />
          95119 Naila <br />
        </Para>
        <Para>tino@ambrecht.de</Para>
      </Footerbox>
      <Copy>
        COPYRIGHT ©1990-2024. Alle Rechte vorbehalten. Nicht autorisierte, ganze
        oder teilweise Reproduktion ist strengstens untersagt.
      </Copy>
    </Wrapper>
  );
}

// STYLE

const Wrapper = styled.div`
  font-weight: 300;
  font-size: 1em;
  position: relative;
  overflow: hidden;

  height: 100vh; // Stellen Sie sicher, dass der Wrapper mindestens so hoch wie der Viewport ist
`;

// Convert the styled component to a regular component
const Bild = styled(Image)`
  opacity: 200%;
  mix-blend-mode: lighten;
  objectfit: contain;
  padding: 0;
  margin-right: 10rem; // Überschreibt das Padding
`;

const Copy = styled.span`
  text-align: center;
  font-size: 0.5em;
  position: absolute;
  color: white;
  opacity: 80%;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
  text-align: center;
  bottom: 0;
`;

const Footerbox = styled.div`
  position: absolute;

  right: 0;
  bottom: 0;
  width: 100vw; // Setzt die Breite auf die volle Breite des Viewports
  height: auto;
  padding-left: 5.8rem;
  padding-right: 5.8rem;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  align-content: space-between;
  flex-wrap: wrap;
  color: white;
  text-shadow: 0em 2em 2em rgba(0, 0, 0, 0.9);
  padding-bottom: 20vh;

  // Stellen Sie einen Abstand zum unteren Rand sicher
`;

const StyledImage = styled(Image)`
  position: absolute;
  opacity: 50%;
  right: 0;
  bottom: 0;
  width: 100vw; // Setzt die Breite auf die volle Breite des Viewports
  height: auto; // Passt die Höhe automatisch an, um das Seitenverhältnis zu erhalten
  object-fit: cover; // Sorgt dafür, dass das Bild den Bereich vollständig ausfüllt
  z-index: -1; // Stellt sicher, dass das Bild immer im Hintergrund bleibt
`;

const Para = styled(Paragraph)`
  font-family: var(--Pop-Font);
  font-size: 2rem;
`;
