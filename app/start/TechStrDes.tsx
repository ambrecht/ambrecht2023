'use client';
import styled from 'styled-components';
import React, { useState, useEffect } from 'react';
import { Quote, Headline1, Headline2, Paragraph, Bild } from '@/styles/';

const content = [
  {
    tag: 'Technologie',
    content: `Technologie ist das moderne Werkzeug, das die digitale Welt formt – doch sie muss dem Menschen dienen, nicht umgekehrt. In meiner Arbeit sorge ich dafür, dass Technologie zur Entfaltung von Freiheit und Kreativität beiträgt. Es geht nicht nur um effiziente Systeme, sondern um Lösungen, die den Nutzern Kontrolle und Eigenständigkeit verleihen.`,
  },
  {
    tag: 'Strategie',
    content: `Eine Strategie ist mehr als ein Plan – sie ist das Zusammenspiel von Theorie und Praxis, die Verbindung von langfristiger Voraussicht und aktueller Markterkenntnis. In meiner strategischen Beratung geht es nicht nur darum, den nächsten Schritt zu kennen, sondern die gesamte Reise zu planen. So wie ein Schachspieler den gesamten Verlauf des Spiels vor Augen hat, gestalte ich digitale Strategien, die nachhaltigen Erfolg sichern.`,
  },
  {
    tag: 'Design',
    content: `Design ist die Brücke zwischen Idee und Wirklichkeit, zwischen Vision und Nutzererfahrung. Es geht nicht nur darum, schön auszusehen – gutes Design erzählt eine Geschichte, schafft eine Verbindung und lässt den Benutzer Teil einer größeren Erzählung werden. Mein Designansatz vereint Ästhetik mit intuitiver Funktionalität, um Erlebnisse zu schaffen, die sowohl fesseln als auch leiten.`,
  },
];

// Grid container

const GridContainer = styled.div`
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
  transition: opacity 0.5s ease-in-out;
  width: 50%;
  height: 100%;
  min-height: 50vh;
  margin-top: 5rem;
  margin-bottom: 2rem;
  font-family: var(--pop-Font);
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
`;

// Text innerhalb des Kreises
const TextInsideCircle = styled.span`
  text-align: center;
  font-size: 1.5rem; // Angepasste Schriftgröße
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
    transform: scale(1.2);
    background-image: linear-gradient(
      72.61deg,
      rgba(0, 130, 255, 1) 22.63%,
      rgba(79, 5, 245, 1) 84.67%
    );

    ${TextInsideCircle} {
      font-size: 1.3rem !important;
      font-weight: 200 !important;
      border-bottom: solid white !important;
      background: white !important;
      -webkit-background-clip: text !important;
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
          <Circle className={currentContent === index ? 'selected' : ''}>
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
