'use client';
import Image from 'next/image';
import styled from 'styled-components';
import { imageClampBuilder, clampBuilder } from '@/lib/utils';
import { Quote, Headline1, Headline2, Paragraph } from '@/styles/index';

export default function Home() {
  return (
    <>
      <Header>
        <HeaderContainer>
          <MainHeadline>Das Café der 16 Persönlichkeiten</MainHeadline>
          <LabelContainer>
            <Label>Workshop Design</Label>
            <Label>Meetup</Label>
            <Label>Coaching</Label>
          </LabelContainer>
        </HeaderContainer>
        <SubHeadline>
          Ein interaktives Meetup, das durch den Myers-Briggs-Typenindikator
          inspiriert ist und ein Forum für Selbsterforschung, Entwicklung und
          das Kennenlernen verschiedener Persönlichkeitstypen bietet.
        </SubHeadline>
      </Header>
      <Grid>
        <Headline></Headline>
        <MainBild>
          <Image
            src="/cafe/Begegnung.PNG"
            alt="Picture of the author"
            fill={true}
            style={{
              objectFit: 'contain',
            }}
          />
        </MainBild>
        <Space></Space>
        <Categorie>
          <Title>Philosophie</Title>
          <Text>
            <span>
              Innere Welten: Eine Reise in die Tiefen unserer Persönlichkeit.
            </span>
            <span>
              Selbstentwicklung: Das Café als Wegbereiter für persönliches
              Wachstum und Selbsterkenntnis.
            </span>
            <span>
              Erkundung der Charaktere: Verständnis der eigenen
              Anpassungsstrategien und Potenziale.
            </span>
            <span>
              Zwischenmenschliche Synergie: Verbesserung der Kommunikation und
              des Verständnisses für andere.
            </span>
          </Text>
        </Categorie>
        <Categorie>
          <Title>Konzept</Title>
          <Text>
            <span>
              Selbsterkenntnis: Erkennung der eigenen Persönlichkeitstypen durch
              bewährte Methoden.
            </span>
            <span>
              Akzeptanz und Entwicklung: Akzeptieren des Ist-Zustandes und
              Entwickeln des eigenen Charakters.
            </span>
            <span>
              Praktische Anwendung: Interaktive Spiele und Aktivitäten fördern
              das Verstehen der eigenen und anderer Persönlichkeiten.
            </span>
          </Text>
        </Categorie>
        <Categorie>
          <Title>Werte</Title>
          <Text>
            <span>
              Vielfalt und Akzeptanz: Fördern eines Umfelds, das Vielfalt
              schätzt und Unterschiede respektiert.
            </span>
            <span>
              Authentische Begegnungen: Ermöglichen echter Verbindungen durch
              tiefgreifendes Verständnis.
            </span>
            <span>
              Gemeinschaft und Spaß: Schaffen einer Atmosphäre, in der Lernen
              und Entdecken Freude bereiten.
            </span>
          </Text>
        </Categorie>
        <Bild>
          <Image
            src="/cafe/dasmenschlichesystem.jpg"
            fill={true}
            alt="Picture of the author"
            style={{
              objectFit: 'contain',
            }}
          />
        </Bild>
        <Bild>
          <Image
            src="/cafe/enneagram.jpg"
            fill={true}
            alt="Picture of the author"
            style={{
              objectFit: 'contain',
            }}
          />
        </Bild>
        <Bild>
          <Image
            src="/cafe/test.png"
            fill={true}
            alt="Picture of the author"
            style={{
              objectFit: 'cover',
            }}
          />
        </Bild>
        <Space></Space>
        <ChapterLabel>Ansatz</ChapterLabel>
        <Description>
          Mein Ansatz für das Café der 16 Persönlichkeiten zielt darauf ab,
          einen Raum zu schaffen, in dem jeder die Tiefe seines Geistes erkunden
          und seine Zukunft aktiv gestalten kann – eine Welt der
          Selbsterkenntnis und der wahren Begegnungen.
        </Description>
        <ChapterLabel>Herausforderung</ChapterLabel>
        <Description>
          Die Herausforderung bei der Entwicklung des Cafés bestand darin, einen
          erleichterten Zugang zu tiefen psychologischen Einsichten zu bieten,
          ohne dabei die Leichtigkeit und den Spaß der Selbstentdeckung zu
          verlieren.
        </Description>
        <ChapterLabel>Lektion gelernt</ChapterLabel>
        <Description>
          Durch das Café der 16 Persönlichkeiten habe ich gelernt, dass das
          Verständnis für die eigene Persönlichkeit und die der anderen ein
          Schlüssel zu einem erfüllten Leben und zu wahrhaftigen Beziehungen
          ist. Es hat mich gelehrt, dass die Reise nach innen der mutigste Weg
          ist, den wir beschreiten können.
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
