import styled from 'styled-components';
import { imageClampBuilder, clampBuilder } from '@/lib/utils';
import Image from 'next/image';
import { Quote, Headline1, Headline2, Paragraph } from '@/styles/index';

export const Grid = styled.div`
  font-size: ${clampBuilder({
    minWidthPx: 600,
    maxWidthPx: 1920,
    minValue: 1,
    maxValue: 3,
    units: 'rem',
  })};
  font-weight: 100;

  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  width: 100%;

  border-color: hsla(0, 0%, 53%, 0.2);
  height: 100%;
  color: white;
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
`;

export const Categorie = styled.div`
  display: flex;
  flex-direction: column;
  border: 0 solid rgb(50, 50, 50);

  padding: 1.25rem;

  @media (min-width: 1024px) {
    border-right-width: 1px;
  }

  @media (max-width: 500px) {
    width: 80vw;
    font-size: 3rem;
  }
`;

export const MainHeadline = styled.h1`
  text-transform: none;
  font-size: 4rem;
  font-weight: 600;
`;

export const SubHeadline = styled.p`
  font-weight: 400;
  font-size: 1.1rem;
  width: 33vw;
  text-align: justify;
`;

export const Headline = styled.div`
  grid-column: 1 / -1;
  height: 10%;
`;

export const Title = styled.h1`
  margin: 0.5em;
  text-transform: uppercase;
  font-weight: 600;
  font-size: 1.2rem;
`;

export const Text = styled.p`
  font-weight: 300;
  font-size: 1.1rem;
  margin: 0.5em;
  margin-bottom: 1em;

  span {
    display: block;
    position: relative; // Für absolute Positionierung des Pseudo-Elements
    margin-bottom: 0.5em;
    padding-left: 1rem; // Platz für das Aufzählungszeichen, passen Sie dies entsprechend der Breite des Zeichens an
    // Zieht die erste Zeile zurück, um den Text nach dem Punkt zu starten

    &:before {
      content: '•';
      position: absolute;
      left: 0; // Positioniert das Aufzählungszeichen am Anfang des Padding
      top: 0; // Aligns with the top of the line
    }
  }
`;

export const MainBild = styled.div`
  position: relative;
  width: 100vw;
  overflow: hidden;
  position: relative;
  object-fit: contain;
  height: 50vh;
  float: left;
  grid-column: 1 / -1;
  z-index: -1;

  margin-left: -7rem;
`;

export const Bild = styled.div`
  position: relative;
  overflow: hidden;

  height: 33vh;
  float: left;
  z-index: -1;
  object-fit: cover;

  @media (max-width: 500px) {
    display: none;
  }
`;

export const Header = styled.header`
  align-items: flex-end;
  margin-top: 4.2rem;
  margin-bottom: 6rem;
  display: flex;
  color: white;
  justify-content: space-between;
  overflow: hidden;
`;

export const HeaderContainer = styled.div`
  grid-row-gap: 6.4rem;
  flex-direction: column;
  display: flex;
  justify-content: space-between;
`;

export const Label = styled.div`
  background-color: white;
  color: black;
  border-radius: 100vw;
  flex: none;
  margin-left: 0.5rem;
  padding: 0.6rem 0.6rem;
`;

export const LabelContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

export const Description = styled(Paragraph)`
  margin-bottom: 2rem;
  line-height: 2.2rem;
  grid-column: 2 / 4;
  text-align: justify;
`;

export const ChapterLabel = styled(Headline2)`
  width: 100%;
  font-family: var(--pop-Font);

  grid-column: 1 / 2;
  justify-self: start;

  font-weight: 800;
  font-size: 2rem;
`;

export const Space = styled.div`
  grid-column: 1 / -1;
  width: 100%;
  height: 6rem;
`;
