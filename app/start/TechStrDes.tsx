'use client';
import styled from 'styled-components';
import React, { useState, useEffect } from 'react';
import { Quote, Headline1, Headline2, Paragraph, Bild } from '@/styles/';

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

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto;
  justify-items: center;
  align-items: start;
  height: auto;
  gap: 20px;
  width: 100%;
  font-weight: 100;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const TextGrid = styled.div`
  display: grid;
  grid-template-columns: 100%;
  width: 100%;
  position: relative;
  height: 60vh;

  @media (max-width: 500px) {
    height: auto;
  }
`;

interface StyledParaProps {
  position: 'left' | 'center' | 'right';
}

const StyledPara = styled(Paragraph)<StyledParaProps>`
  grid-column: 1;
  grid-row: 1;
  transition: all 1s ease-in-out;
  width: 50%;
  margin: 0 auto;
  cursor: ${(props) => (props.position === 'center' ? 'default' : 'pointer')};

  @media (max-width: 500px) {
    width: 90%;
    display: ${(props) => (props.position === 'center' ? 'block' : 'none')};
    transform: none !important;
    font-size: 1.2rem !important;
    opacity: 1 !important;
    filter: none !important;
    color: white !important;
  }

  @media (min-width: 501px) {
    ${(props) => {
      switch (props.position) {
        case 'center':
          return `
            transform: translateX(0) scale(1);
            font-size: 1.7rem;
            opacity: 1;
            filter: blur(0px);
            color: white;
            z-index: 2;
          `;
        case 'left':
          return `
            transform: translateX(-80%) scale(0.9);
            font-size: 1.2rem;
            opacity: 0.466;
            filter: blur(5px);
            color: rgba(255, 255, 255, 0.466);
            z-index: 1;
          `;
        case 'right':
          return `
            transform: translateX(80%) scale(0.9);
            font-size: 1.2rem;
            opacity: 0.466;
            filter: blur(5px);
            color: rgba(255, 255, 255, 0.466);
            z-index: 1;
          `;
      }
    }}
  }
`;

const CentralTextContainer = styled.div`
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
  position: relative;

  @media (max-width: 500px) {
    grid-column: 1;
    margin-top: 2rem;
    min-height: auto;
  }
`;

const CircleContainer = styled.div`
  text-align: center;

  @media (max-width: 500px) {
    width: 100%;
    max-width: 200px;
  }
`;

const TextInsideCircle = styled.span`
  text-align: center;
  font-size: 1.5rem;
  padding: 10px;
  border-bottom: none;
  background: linear-gradient(
    72.61deg,
    rgba(0, 130, 255, 1) 22.63%,
    rgba(79, 5, 245, 1) 84.67%
  );
  -webkit-background-clip: text;
  color: transparent;

  @media (max-width: 500px) {
    font-size: 1.2rem;
  }
`;

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

  @media (max-width: 500px) {
    --circle-size: 80px;
  }

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

      @media (max-width: 500px) {
        font-size: 1.1rem !important;
      }
    }
  }
`;

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

  @media (max-width: 500px) {
    top: 0;
    transform: none;
  }
`;

const LeftArrow = styled(ArrowButton)`
  left: 10px;
`;

const RightArrow = styled(ArrowButton)`
  right: 10px;
`;

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

  const getPosition = (index: number): 'left' | 'center' | 'right' => {
    const contentLength = content.length;
    if (index === currentContent) {
      return 'center';
    } else if (index === (currentContent + 1) % contentLength) {
      return 'right';
    } else if (index === (currentContent + contentLength - 1) % contentLength) {
      return 'left';
    }
    return 'right';
  };

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
        <TextGrid>
          {content.map((item, index) => (
            <StyledPara
              key={item.tag}
              position={getPosition(index)}
              onClick={() => {
                if (getPosition(index) !== 'center') {
                  setCurrentContent(index);
                }
              }}
            >
              {item.content}
            </StyledPara>
          ))}
        </TextGrid>
      </CentralTextContainer>
    </GridContainer>
  );
};

export default MyGridComponent;
