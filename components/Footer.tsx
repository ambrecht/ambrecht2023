'use client';
import styled from 'styled-components';
import Image from 'next/image';
import React from 'react';
import { Paragraph } from '@/styles/index';
import Link from 'next/link';
import type { FooterContent } from '@/src/content/schemas';
import SecondFooter from '@/components/secondFooter';

// MARKUP
type FooterProps = {
  content: FooterContent;
};

const Footer = ({ content }: FooterProps) => {
  return (
    <Wrapper>
      <StyledImage src="/footer.png" alt="Brutalism" fill={true}></StyledImage>
      <Footerbox>
        <Container>
          <Link href={content.logoLink}>
            <Bild
              src="/3DDREIECK.svg"
              alt={content.logoAlt}
              width={250}
              height={250}
            ></Bild>
          </Link>
        </Container>
        <Para>
          <Label>{content.addressLabel}</Label>
          <br />
          {content.addressLines.map((line) => (
            <React.Fragment key={line}>
              {line} <br />
            </React.Fragment>
          ))}
        </Para>
        <Para>
          <Label>{content.contactLabel}</Label>
          <br />
          {content.contactEmail}
        </Para>

        <Container>
          <Link href={content.githubUrl}>
            <Bild
              src="/github-mark-white.svg"
              alt="GitHub"
              width={100}
              height={100}
            ></Bild>
          </Link>
        </Container>
      </Footerbox>

      <Copy>
        <SecondFooter content={content.secondary}></SecondFooter>
      </Copy>
    </Wrapper>
  );
};

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
  margin-right: 10rem; // よberschreibt das Padding
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
  height: auto; // Passt die HБhe automatisch an, um das Seitenverhビltnis zu erhalten
  object-fit: cover; // Sorgt dafグr, dass das Bild den Bereich vollstビndig ausfグllt
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

export default Footer;
