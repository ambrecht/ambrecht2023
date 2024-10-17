'use client';
import styled from 'styled-components';
import Image from 'next/image';
import React from 'react';
import { Paragraph } from '@/styles/index';
import Link from 'next/link';
import SecondFooter from '@/components/secondFooter';
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
        <Container>
          <Link href="/tools/wordprocess">
            <Bild
              src="/3DDREIECK.svg"
              alt="Logo"
              width={250}
              height={250}
            ></Bild>
          </Link>
        </Container>
        <Para>
          <Label>Impressum:</Label>
          <br />
          Tino Ambrecht <br />
          Schleifmühlweg. 9 <br />
          95119 Naila <br />
        </Para>
        <Para>
          <Label>Kontakt:</Label>
          <br />
          tino@ambrecht.de
        </Para>

        <Container>
          <Link href="https://github.com/ambrecht">
            <Bild
              src="/github-mark-white.svg"
              alt="Logo"
              width={100}
              height={100}
            ></Bild>
          </Link>
        </Container>
      </Footerbox>

      <Copy>
        <SecondFooter></SecondFooter>
      </Copy>
    </Wrapper>
  );
}

// STYLE

const Wrapper = styled.footer`
  position: relative;
  overflow: hidden;
  background: linear-gradient(
    72.61deg,
    rgba(0, 130, 255, 1) 22.63%,
    rgba(79, 5, 245, 1) 84.67%
  );
  mix-blend-mode: lighten;
  clip-path: polygon(0 0, 100% 50%, 100% 100%, 0% 100%);
  display: flex;
  -webkit-box-pack: center;
  justify-content: center;
  align-items: center;
  padding-left: 5.8rem;
  padding-right: 5.8rem;
  height: 100vh; // Stellen Sie sicher, dass der Wrapper mindestens so hoch wie der Viewport ist
  z-index: 100;
`;

// Convert the styled component to a regular component
const Bild = styled(Image)`
  opacity: 200%;
  objectfit: contain;
  padding: 0;
  margin-right: 10rem; // Überschreibt das Padding
  @media (max-width: 1300px) {
    width: 10vw;
  }
`;

const Copy = styled.span`
  font-size: 0.5em;
  position: absolute;
  color: white;
  opacity: 100%;
  left: 0;
  right: 0;
  bottom: 0;

  @media (max-width: 1300px) {
    font-size: 0.3em;
  }
`;

const Footerbox = styled.div`
  margin-top: 33vh;
  display: flex; // Ordnet die Elemente in einer Spalte an
  align-items: center; // Zentriert die Elemente innerhalb der Footerbox horizontal
  justify-content: start; // Zentriert die Elemente innerhalb der Footerbox vertikal
  width: 100%;
  text-align: center; // Zentriert den Text innerhalb jedes Elements

  @media (max-width: 800px) {
    flex-direction: column;
    align-items: end; // Zentriert die Elemente innerhalb der Footerbox horizontal
    justify-content: start;
  }
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
  font-size: 1.5rem;
  font-weight: 400;
`;

const Label = styled.span`
  font-family: var(--Pop-Font);
  font-size: 1rem;
  font-weight: 100;
`;

const Container = styled.div`
  max-width: 10vw;
  max-height: 10vw;
  align-self: center;
`;
