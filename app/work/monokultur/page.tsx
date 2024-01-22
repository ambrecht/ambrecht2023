'use client';
import Image from 'next/image';
import styled from 'styled-components';
import { imageClampBuilder, clampBuilder } from '@/lib/utils';
import { Quote, Headline1, Headline2, Paragraph } from '@/styles/index';
import React from 'react';
export default function Home() {
  return (
    <>
      <Header>
        <HeaderContainer>
          <MainHeadline>MONOkultur</MainHeadline>
          <LabelContainer>
            <Label>Markenbildung</Label>
            <Label>Logo Design</Label>
            <Label>Visuelle Identität</Label>
          </LabelContainer>
        </HeaderContainer>
        <SubHeadline>
          Die Gestaltung einer unverkennbaren Markenidentität und visuellen
          Präsenz für die Berliner Indie-Rockband MONOkultur, geprägt von
          Alltagsromantik und emotionaler Resonanz.
        </SubHeadline>
      </Header>
      <Grid>
        <Headline></Headline>
        <MainBild>
          <Image
            src="/mono/Treppe-Europasportpark3.jpg"
            alt="Picture of the author"
            fill={true}
            style={{
              objectFit: 'cover',
            }}
          />
        </MainBild>
        <Space></Space>
        <Categorie>
          <Title>Projektentwicklung</Title>
          <Text>
            <span>
              Neue Identität: Entwicklung eines Bandnamens und Logos, das die
              Essenz von MONOkultur einfängt.
            </span>
            <span>
              Alltagsromantik: Schaffung einer Verbindung zwischen den
              alltäglichen Texten der Band und der gefühlvollen Wahrnehmung der
              Hörer.
            </span>
            <span>
              Visuelle und akustische Synergie: Gestaltung einer visuellen
              Identität, die die emotionale Kraft der Musik widerspiegelt.
            </span>
            <span>
              Minimalistischer Ansatz: Reduktion auf das Wesentliche, um mit
              wenigen Mitteln eine maximale Wirkung zu erzielen.
            </span>
          </Text>
        </Categorie>
        <Categorie>
          <Title>Strategie und Positionierung</Title>
          <Text>
            <span>
              Identität und Image: Festlegung einer klaren Identität und
              professionellen Positionierung zur Schaffung eines autonomen und
              wiedererkennbaren Images.
            </span>
            <span>
              Emotionaler Nutzen: Positionierung der Band als Vermittler eines
              einzigartigen emotionalen Mehrwerts für die Fans.
            </span>
            <span>
              Realitätsbezug: Identifikation der Fans durch Texte, die aus
              feinsinniger Beobachtung Alltagssituationen beschreiben.
            </span>
          </Text>
        </Categorie>
        <Categorie>
          <Title>Leitbilder und Visionen</Title>
          <Text>
            <span>
              MONOkultur - Ein Hauch von Frische, der die Routine durchbricht.
            </span>
            <span>
              MONOkultur - Der Puls der Großstadt, mit einem Echo der
              Unendlichkeit.
            </span>
            <span>
              MONOkultur - Die Poesie des Alltäglichen, eingefangen in
              Momentaufnahmen.
            </span>
            <span>
              MONOkultur - Die tragische Ironie des Seins, die den Alltag
              überstrahlt.
            </span>
            <span>
              MONOkultur - Die Konzentration auf das Hier und Jetzt, eine
              Hommage an die kleinen Dinge des Lebens.
            </span>
          </Text>
        </Categorie>
        <Bild>
          <Image
            src="/mono/Assoziatives-Netzwerk-Monokultu33r.jpg"
            fill={true}
            alt="Picture of the author"
            style={{
              objectFit: 'contain',
            }}
          />
        </Bild>
        <Bild>
          <Image
            src="/mono/monoKultur.png"
            fill={true}
            alt="Picture of the author"
            style={{
              objectFit: 'contain',
            }}
          />
        </Bild>
        <Bild>
          <Image
            src="/mono/IMG_0322.png"
            fill={true}
            alt="Picture of the author"
            style={{
              objectFit: 'cover',
            }}
          />
        </Bild>
        <Space></Space>
        <MainBild>
          <Image
            src="/mono/badehaus.png"
            alt="Picture of the author"
            fill={true}
            style={{
              objectFit: 'cover',
            }}
          />
        </MainBild>
        <Space></Space>
        <ChapterLabel>Ansatz</ChapterLabel>
        <Description>
          In der Zusammenarbeit mit MONOkultur habe ich zunächst den Bandnamen
          und das zentrale Thema ihrer Musik – die Alltagsromantik –
          herausgearbeitet. Mit diesen Kernpunkten als Ausgangsbasis entwickelte
          ich eine Markenidentität, die sich durch alle visuellen und
          musikalischen Aspekte zieht.
        </Description>{' '}
        <ChapterLabel>Herausforderung</ChapterLabel>
        <Description>
          Die Herausforderung lag in der Schaffung eines einheitlichen und
          emotional ansprechenden Erscheinungsbildes, das die einzigartige
          Perspektive von MONOkultur auf den Alltag und die individuellen
          Momente des Lebens widerspiegelt.
        </Description>
        <ChapterLabel>Lektion gelernt</ChapterLabel>
        <Description>
          Dieses Projekt lehrte mich, dass echte Verbindung nicht durch
          Überfluss, sondern durch die kunstvolle Reduktion und Fokussierung auf
          die emotionale Essenz erreicht wird – ein Prinzip, das MONOkultur
          sowohl in ihrer Musik als auch in ihrer Marke perfekt verkörpert.
        </Description>
      </Grid>
    </>
  );
}

const Grid = styled.div`
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
`;

const Categorie = styled.div`
  display: flex;
  flex-direction: column;
  border: 0 solid rgb(50, 50, 50);

  padding: 1.25rem;

  @media (min-width: 1024px) {
    border-right-width: 1px;
  }
`;

const MainHeadline = styled.h1`
  text-transform: none;
  font-size: 4rem;
  font-weight: 600;
`;

const SubHeadline = styled.p`
  font-weight: 400;
  font-size: 1.1rem;
  width: 33vw;
  text-align: justify;
`;

const Headline = styled.div`
  grid-column: 1 / -1;
  height: 10%;
`;

const Title = styled.h1`
  margin: 0.5em;
  text-transform: uppercase;
  font-weight: 600;
  font-size: 1.2rem;
`;

const Text = styled.p`
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
  height: 66vh;
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
`;

const Header = styled.header`
  align-items: flex-end;
  margin-top: 4.2rem;
  margin-bottom: 6rem;
  display: flex;
  color: white;
  justify-content: space-between;
  overflow: hidden;
`;

const HeaderContainer = styled.div`
  grid-row-gap: 6.4rem;
  flex-direction: column;
  display: flex;
  justify-content: space-between;
`;

const Label = styled.div`
  background-color: white;
  color: black;
  border-radius: 100vw;
  flex: none;
  margin-left: 0.5rem;
  padding: 0.6rem 0.6rem;
`;

const LabelContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const Description = styled(Paragraph)`
  margin-bottom: 2rem;
  line-height: 2.2rem;
  grid-column: 2 / 4;
  text-align: justify;
`;

const ChapterLabel = styled(Headline2)`
  width: 100%;
  font-family: var(--pop-Font);

  grid-column: 1 / 2;
  justify-self: start;

  font-weight: 800;
  font-size: 2rem;
`;

const Space = styled.div`
  grid-column: 1 / -1;
  width: 100%;
  height: 6rem;
`;
