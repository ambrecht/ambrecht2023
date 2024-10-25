'use client';
import styled from 'styled-components';
import React, { useState, useEffect } from 'react';
import { Quote, Headline1, Headline2, Paragraph, Bild } from '@/styles/';

interface StyledParaProps {
  position: 'left' | 'center' | 'right';
}

const content = [
  {
    tag: 'Technologie',
    content: `Technologie ist mehr als ein Werkzeug – sie ist ein Mittel zur Schaffung echter, nachhaltiger Werte. In meiner Arbeit setze ich bewusst auf Lösungen, die Freiheit und Kontrolle zurück in die Hände der Nutzer legen. Keine kurzlebigen Trends, keine Massenware – ich entwickle technologische Konzepte, die langfristig Bestand haben und Menschen befähigen, ihre Unabhängigkeit zu wahren.`,
  },
  {
    tag: 'Strategie',
    content: `Strategie ist nicht nur ein Plan – sie ist der Kern jeder langfristigen Vision. In meiner strategischen Beratung geht es darum, das große Ganze zu sehen. Wie ein Schachspieler plane ich mehrere Züge voraus und entwickle Strategien, die auf Dauer Bestand haben. Kurzfristige Erfolge interessieren mich nicht – ich baue auf nachhaltige Strategien, die echte Werte schaffen und Ihr Unternehmen langfristig stark machen.`,
  },

  {
    tag: 'Design',
    content: `Design ist nicht nur eine Frage der Ästhetik – es ist eine tiefere Ausdrucksform von Werten und Identität. Gutes Design ist zeitlos, funktional und erzählt eine Geschichte, die verbindet. Mein Designansatz fokussiert sich darauf, visuelle Erlebnisse zu schaffen, die nicht nur beeindrucken, sondern die Essenz Ihrer Marke verkörpern. Weg von oberflächlicher Schönheit hin zu Designs, die Bestand haben und eine tiefe emotionale Bindung schaffen.`,
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
  max-height: 100vh;

  font-weight: 100;
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const StyledPara = styled(Paragraph)<StyledParaProps>`
  position: absolute;
  top: 0;
  left: ${(props) => {
    if (props.position === 'center') return '50%';
    else if (props.position === 'left') return '10%';
    else if (props.position === 'right') return '90%';
  }};
  transform: translateX(-50%)
    scale(${(props) => (props.position === 'center' ? 1 : 0.9)});
  z-index: ${(props) => (props.position === 'center' ? '2' : '1')};
  font-size: ${(props) => (props.position === 'center' ? '1.7rem' : '1.2rem')};
  transition: all 1s ease-in-out;
  width: ${(props) => {
    if (props.position === 'center') return '50%';
    else if (props.position === 'left') return '30%';
    else if (props.position === 'right') return '30%';
  }};

  // Überschreiben der Stile für inaktive Texte
  ${(props) =>
    props.position !== 'center' &&
    `
  
    color: rgba(255, 255, 255, 0.466);
    filter: blur(5px);

   
    


  `}
`;

const CentralTextContainer = styled.div`
  position: relative;
  grid-column: 1 / 4;
  font-size: 1.5rem;
  text-align: justify;
  color: #ffffff;
  width: 100%;
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

// Neue Pfeilkomponenten
const ArrowButton = styled.button`
  background: linear-gradient(
    72.61deg,
    rgb(0, 130, 255) 22.63%,
    rgb(79, 5, 245) 84.67%
  );
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  border: none;
  background-color: transparent;
  font-size: 2rem;
  cursor: pointer;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
  &:focus {
    outline: none;
  }
`;

const LeftArrow = styled(ArrowButton)`
  left: 10px;
  top: 50%;
`;

const RightArrow = styled(ArrowButton)`
  right: 10px;
  top: 50%;
`;

// Next.js Komponente
const MyGridComponent: React.FC = () => {
  const [currentContent, setCurrentContent] = useState<number>(1);

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
        <LeftArrow
          onClick={() =>
            setCurrentContent(
              (currentContent + content.length - 1) % content.length,
            )
          }
          aria-label="Vorheriges Element"
        >
          &#x25C0;
        </LeftArrow>
        <RightArrow
          onClick={() =>
            setCurrentContent((currentContent + 1) % content.length)
          }
          aria-label="Nächstes Element"
        >
          &#x25B6;
        </RightArrow>
        {content.map((item, index) => {
          let position: 'left' | 'center' | 'right';
          const contentLength = content.length;
          if (index === currentContent) {
            position = 'center';
          } else if (index === (currentContent + 1) % contentLength) {
            position = 'right';
          } else if (
            index ===
            (currentContent + contentLength - 1) % contentLength
          ) {
            position = 'left';
          } else {
            position = 'right'; // Anpassung für zusätzliche Elemente
          }
          return (
            <StyledPara key={item.tag} position={position}>
              {item.content}
            </StyledPara>
          );
        })}
      </CentralTextContainer>
    </GridContainer>
  );
};

export default MyGridComponent;
