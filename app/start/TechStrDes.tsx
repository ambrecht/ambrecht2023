'use client';
import styled from 'styled-components';
import React, { useState, useEffect } from 'react';
import { Quote, Headline1, Headline2, Paragraph, Bild } from '@/styles/';

const content = [
  {
    tag: 'technologie',
    content: `Als ganzheitlicher digitaler Produktentwickler liegt mein Fokus nicht nur auf der technischen Umsetzung, sondern auch darauf, wie Technologie genutzt werden kann, um innovative Lösungen zu schaffen. Ich beherrsche die Kunst der Web- und App-Entwicklung, wobei ich stets darauf achte, die neuesten technologischen Trends und Möglichkeiten zu integrieren. Meine Arbeit in der Technologie geht über das Programmieren hinaus – es geht darum, digitale Produkte zu entwickeln, die funktional, effizient und zukunftssicher sind.`,
  },
  {
    tag: 'strategie ',
    content: `In meiner Rolle als strategischer Berater tauche ich tief in die Geschäftsziele und Herausforderungen meiner Kunden ein. Ich entwickle individuelle Strategien, die auf aktuelle und zukünftige Markttrends reagieren, um nachhaltiges Wachstum und langfristigen Erfolg zu sichern. Meine strategische Arbeit umfasst die Analyse von Markttrends, das Verständnis für Kundenbedürfnisse und das Entwerfen von Geschäftsmodellen, die digitale Innovationen effektiv nutzen.`,
  },
  {
    tag: 'design ',
    content: `Design ist ein integraler Bestandteil meiner Arbeit als digitaler Produktentwickler. Ich gestalte nicht nur visuell ansprechende Websites und Anwendungen, sondern schaffe auch einprägsame Benutzererlebnisse. Mein Designansatz konzentriert sich darauf, die Markenidentität meiner Kunden durch kreatives und benutzerzentriertes Design zum Leben zu erwecken. Ich kombiniere ästhetische Elemente mit funktionaler Einfachheit, um sicherzustellen, dass jede digitale Lösung nicht nur gut aussieht, sondern auch intuitiv und benutzerfreundlich ist.`,
  },
];

// Grid container

const GridContainer = styled.div`
  z-index: 4;
  display: grid;
  grid-template-columns: repeat(3, 1fr); // 3 Spalten
  grid-template-rows: auto;
  justify-items: center;
  align-items: start;
  height: auto;
  gap: 20px;
  position: relative;

  font-weight: 100;
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const CentralTextContainer = styled.div`
  grid-column: 1 / 4; // Standardmäßig in der mittleren Spalte
  font-size: 1.5rem;
  text-align: justify;
  color: #ffffff;
  transition: opacity 0.3s ease-in-out;
  width: 50%;
  transition: 3s;
  height: 100%;
  min-height: 50vh;
  margin-top: 5rem;
  margin-bottom: 2rem;
  font-family: var(--gara-Font);
  line-height: 200%;

  @media (max-width: 960px) {
    width: 100%;
  }

  @media (max-width: 500px) {
    gap: 0px;
  }
`;
const CircleContainer = styled.div`
  text-align: center;

  .selected {
    background-color: red;
  }
`;

// Text innerhalb des Kreises
const TextInsideCircle = styled.span`
  text-align: center;
  font-size: 1.5rem; // Angepasste Schriftgröße
  color: white;
  padding: 10px; // Padding hinzufügen, falls nötig

  border-bottom: none;
  background: linear-gradient(
    72.61deg,
    rgba(0, 130, 255, 1) 22.63%,
    rgba(79, 5, 245, 1) 84.67%
  );
  -webkit-background-clip: text;
  color: transparent;
`;

const InfoText = styled.div`
  line-height: 150%;
`;

// Circle item
const Circle = styled.div.attrs((props) => ({
  className: props.className,
}))`
  --circle-size: clamp(100px, 15vw, 200px);
  border-radius: 50%;
  width: var(--circle-size);
  height: var(--circle-size);
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
  background-image: linear-gradient(72.61deg, #969696 22.63%, #ffffff 84.67%);
  transition: 0.3s;

  // Animate the background-image property over 1 second

  &:hover,
  &.selected {
    transform: scale(1.1);
    background-image: linear-gradient(
      72.61deg,
      rgba(0, 130, 255, 1) 22.63%,
      rgba(79, 5, 245, 1) 84.67%
    );

    ${TextInsideCircle} {
      color: white;
      font-size: 3rem;
      border-bottom: solid white;
    }
  }
`;

// Next.js Komponente
const MyGridComponent: React.FC = () => {
  // Initialen State auf 'Strategie' setzen (Index 1)
  const [currentContent, setCurrentContent] = useState<number>(1);

  // SEO-Optimierung: Seite bei Initial Load für die Suchmaschine optimieren
  useEffect(() => {
    const script = document.createElement('script');
    script.textContent = `
      if ('use client') {
        window.dispatchEvent(new Event('render'));
      }
    `;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <GridContainer>
      {content.map((item, index) => (
        <CircleContainer
          key={item.tag}
          onMouseEnter={() => setCurrentContent(index)}
          onTouchStart={() => setCurrentContent(index)}
          aria-label={`Wechsle zu ${item.tag.trim()} Inhalt`}
        >
          <Circle
            className={currentContent === index ? 'selected' : ''} // Füge die 'selected' Klasse hinzu, wenn der Index dem aktuellen Inhalt entspricht
          >
            <TextInsideCircle>{item.tag}</TextInsideCircle>
          </Circle>
        </CircleContainer>
      ))}
      <CentralTextContainer>
        {content.map((item, index) => (
          <Paragraph
            key={item.tag}
            style={{ display: currentContent === index ? 'block' : 'none' }}
          >
            {item.content}
          </Paragraph>
        ))}
      </CentralTextContainer>
    </GridContainer>
  );
};

export default MyGridComponent;
