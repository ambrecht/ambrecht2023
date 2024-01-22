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
          <MainHeadline>Teleprompter</MainHeadline>
          <LabelContainer>
            <Label>UX-Strategie</Label>
            <Label>Research</Label>
            <Label>Entwicklung</Label>
            <Label>Design</Label>
          </LabelContainer>
        </HeaderContainer>
        <SubHeadline>
          Ein fortschrittliches Hörbuchproduktions-Tool, das Sprechern
          ermöglicht, Zeit zu sparen und den Produktionsprozess durch anpassbare
          Textgeschwindigkeiten und intuitive Funktionen zu optimieren.
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
          <Title>Herausforderungen</Title>
          <Text>
            <span>
              Raum- und Kosteneffizienz: Geringer Platz in Sprecherkabinen und
              hohe Kosten für traditionelle Teleprompter.
            </span>
            <span>
              Spezialisierungsbedarf: Fehlende Anpassung herkömmlicher
              Teleprompter an Hörbuchproduktion, insbesondere bei
              WPM-Einstellungen.
            </span>
            <span>
              Plattformübergreifende Nutzung: Notwendigkeit der Kompatibilität
              sowohl mit Smartphones als auch mit PCs.
            </span>
            <span>
              Zusatzfunktion Würfeln: Bedarf an einer Funktion für zufällige
              Textauswahl zur besseren Textverinnerlichung.
            </span>
          </Text>
        </Categorie>
        <Categorie>
          <Title>Problem-Analyse</Title>
          <Text>
            <span>
              Technisches Verständnis: Unterschiedliche technische Kenntnisse
              der Sprecher, Tendenz zu gedruckten Skripten.
            </span>{' '}
            <span>
              Benutzerfreundlichkeit: Notwendigkeit einer intuitiven, nicht
              ablenkenden App mit geringer Lernkurve und selbsterklärender
              Bedienung.
            </span>{' '}
            <span>
              Multimodale Interaktion: Zugänglichkeit durch Bedienung mittels
              Maus, Touch und Tastaturbefehle.
            </span>
          </Text>
        </Categorie>
        <Categorie>
          <Title>Technologien</Title>
          <Text>
            <span>Next.js und React im Frontend</span>
            <span>Redux als State Managment</span>
            <span>Supabase als Datenbank Tailwind als CSS Styling Option</span>
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
        <ChapterLabel>Ansatz</ChapterLabel>
        <Description>
          Als ich mich dem Projekt der Hörbuchproduktions-App näherte, hatte der
          Kunde keine klare Vision der Produktfunktionalität, sondern nur ein
          grundlegendes Produktkonzept mit einigen Anwendungsfällen. Um diese
          Vision zu verfeinern und zu festigen, begann ich mit der Ausarbeitung
          des Produktkonzepts und gestaltete dann ein intuitives Nutzererlebnis.
        </Description>{' '}
        <Description>
          Ich habe mir die App als eine umfassende Lösung vorgestellt, die
          Sprechern ermöglicht, ihre Texte effizient zu managen und die
          gewünschte Geschwindigkeit dynamisch einzustellen, während die App die
          Nutzer durch eine einfache und klare Oberfläche führt.
        </Description>
        <ChapterLabel>Herausforderung</ChapterLabel>
        <Description>
          Bei der Entwicklung dieser App habe ich intensiv mit Sprechern
          zusammengearbeitet und basierend auf ihren Feedbacks eine
          Würfelfunktion integriert. Diese ermöglicht es den Sprechern,
          zufällige Textstellen auszuwählen, um ein besseres Gefühl für den Text
          zu bekommen.{' '}
        </Description>
        <Description>
          Ich habe meine Webanwendung mit modernsten Technologien wie Next.js,
          Redux, Supabase und Tailwind entwickelt, um eine nahtlose,
          benutzerfreundliche Erfahrung ohne Installationsaufwand zu bieten. Die
          App ist sowohl für Smartphones als auch für PCs optimiert und
          unterstützt multimodale Interaktionen.
        </Description>{' '}
        <Description>
          Durch sorgfältige Beobachtungen und Anpassungen basierend auf
          Nutzerfeedbacks habe ich sichergestellt, dass meine Lösung nicht nur
          eine Erleichterung darstellt, sondern auch den Workflow der
          Hörbuchproduktion wesentlich verbessert.
        </Description>{' '}
        <ChapterLabel>Lektion gelernt</ChapterLabel>
        <Description>
          Die Entwicklung dieser App hat mir eine wertvolle Lektion über die
          Bedeutung von Nutzerzentrierung gelehrt. Ich habe gelernt, dass nicht
          die Menge an Features für den Erfolg entscheidend ist, sondern wie gut
          sie die spezifischen Bedürfnisse der Nutzer erfüllen. Durch direktes
          Beobachten der Sprecher in ihrer Arbeitsumgebung und durch
          aufschlussreiche Interviews konnte ich verstehen, was wirklich zählt:
          eine intuitive Handhabung und eine Anpassungsfähigkeit der App, die
          den Sprechern das Gefühl gibt, Kontrolle über ihre Arbeit zu haben,
          statt von Technik eingeschränkt zu werden. Diese Erkenntnisse haben
          nicht nur das Produkt verbessert, sondern auch meine Fähigkeiten als
          Entwickler geschärft, da ich nun komplexen Anforderungen mit
          einfacheren, nutzerorientierten Lösungen begegne.
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
