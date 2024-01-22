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
          <MainHeadline>Die Reale Virtualität</MainHeadline>
          <LabelContainer>
            <Label>Konzept</Label>
            <Label>Idee</Label>
            <Label>Planung</Label>
          </LabelContainer>
        </HeaderContainer>
        <SubHeadline>
          Eine Idee in Planung: Die Reale Virtualität soll eine Brücke zwischen
          virtuellen Netzwerken und realen Begegnungsorten schlagen, um
          Wissenschaftler, Unternehmer und Kreative im echten Leben
          zusammenzuführen.
        </SubHeadline>
      </Header>
      <Grid>
        <Headline></Headline>
        <MainBild>
          <Image
            src="/teleprompter/Screenshot 2024-01-20 at 12-58-26 Screenshot.png"
            alt="Picture of the author"
            fill={true}
            style={{
              objectFit: 'cover',
            }}
          />
        </MainBild>
        <Space></Space>
        <Categorie>
          <Title>Ideenkonzept</Title>
          <Text>
            <span>
              Virtuell trifft Real: Ein innovatives Konzept, das die soziale
              Interaktion in Cafés durch virtuelle Elemente bereichert.
            </span>
            <span>
              Zielvision: Schaffung eines Ortes, an dem sich Gleichgesinnte
              treffen, austauschen und gemeinsam Projekte realisieren.
            </span>
            <span>Wiener Kaffeehauskultur 2.0</span>
          </Text>
        </Categorie>
        <Categorie>
          <Title>Planung der Umsetzung</Title>
          <Text>
            <span>
              Erste Schritte: Entwicklung einer Software, die eine neue Art der
              Interaktion in Cafés ermöglicht.
            </span>
            <span>
              Individualisierung: Ein Profilbildungsprozess, der den Austausch
              zwischen den Nutzern vereinfacht und fördert.
            </span>
            <span>
              Praktische Anwendungsbeispiele: Vom spontanen Gedankenaustausch
              bis zur professionellen Projektkollaboration.
            </span>
          </Text>
        </Categorie>
        <Categorie>
          <Title>Erwarteter Nutzen</Title>
          <Text>
            <span>
              Für Nutzer: Einfacher und direkter Kontakt zu anderen Personen mit
              ähnlichen Interessen.
            </span>
            <span>
              Für Cafés: Mehr Attraktivität durch das erweiterte Konzept und
              eine stärkere Kundenbindung.
            </span>
            <span>
              Finanzierungsideen: Lizenzmodell für Cafés und eventuell ein
              Beitragssystem für Nutzer.
            </span>
          </Text>
        </Categorie>
        <Bild>
          <Image
            src="/teleprompter/Screenshot 2024-01-20 at 12-56-10 Screenshot.png"
            fill={true}
            alt="Picture of the author"
            style={{
              objectFit: 'cover',
            }}
          />
        </Bild>
        <Bild>
          <Image
            src="/teleprompter/Screenshot 2024-01-20 at 12-57-37 Screenshot.png"
            fill={true}
            alt="Picture of the author"
            style={{
              objectFit: 'cover',
            }}
          />
        </Bild>
        <Bild>
          <Image
            src="/teleprompter/Screenshot 2024-01-20 at 12-56-36 Screenshot.png"
            fill={true}
            alt="Picture of the author"
            style={{
              objectFit: 'cover',
            }}
          />
        </Bild>
        <Space></Space>

        <ChapterLabel>Projektidee</ChapterLabel>
        <Description>
          Die Idee der Realen Virtualität steht noch am Anfang. Sie trägt das
          Potenzial in sich, die Art und Weise, wie wir uns vernetzen und
          zusammenarbeiten, zu revolutionieren und echte Gemeinschaften im
          digitalen Zeitalter zu fördern.
        </Description>
        <ChapterLabel>Umsetzung</ChapterLabel>
        <Description>
          Die Realisierung dieses Konzepts erfordert innovative Softwarelösungen
          und die Partnerschaft mit Cafés, die bereit sind, neue Wege in der
          Kundeninteraktion zu gehen.
        </Description>
        <ChapterLabel>Zukunftsvision</ChapterLabel>
        <Description>
          Wenn die Reale Virtualität Wirklichkeit wird, könnte sie zu einem
          neuen Standard werden, an dem sich Cafés und andere Gemeinschaftsräume
          messen lassen müssen.
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
