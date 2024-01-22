'use client';
import styled from 'styled-components';
import Image from 'next/image';
import { Quote, Headline1, Headline2, Paragraph, Bild } from '@/styles/index';

// LOGIC
const LOGIC = () => {};

// MARKUP
export default function MARKUP() {
  return (
    <Wrapper>
      <Quote>
        Es gilt die Maschine zu beherrschen um nicht von der Maschine beherrscht
        zu werden
      </Quote>
      <Headline1>Der Weg zum positiven Mehrwerterlebnis:</Headline1>
      <GridContainer direction={true}>
        <Bild
          src={'/Flow/Problem.svg'}
          alt="Desktop"
          width={3000}
          height={3000}
        />

        <Paragraph>
          <Headline2>Phase 1</Headline2>
          In dieser ersten Phase liegt mein Hauptaugenmerk darauf, die
          Zielgruppe im Detail zu verstehen. Ich tauche tief in die Welt meiner
          potenziellen Nutzer ein und versuche, ihre Bedürfnisse, Wünsche und
          Sehnsüchte genau zu erfassen. Ich möchte herausfinden, wer diese
          Menschen sind, die von meinem Produkt angesprochen werden sollen. Wie
          groß ist diese Zielgruppe? Welche Kommunikationskanäle stehen mir zur
          Verfügung, um sie zu erreichen? Die Antworten auf diese Fragen sind
          für mich entscheidend, um eine solide Grundlage für meine weitere
          Produktentwicklung zu schaffen.
        </Paragraph>
      </GridContainer>
      <GridContainer direction={false}>
        <Bild
          src={'/Flow/Vision.svg'}
          alt="Desktop"
          width={3000}
          height={3000}
        />
        <Paragraph>
          <Headline2>Phase 2</Headline2>
          In dieser zweiten Phase arbeite ich daran, ein langfristiges und
          inspirierendes Leitbild für mein Produkt zu schaffen. Dieses Leitbild
          dient mir als Nordstern, der mich in jeder weiteren Entscheidung und
          Maßnahme leitet. Es ist von wesentlicher Bedeutung, klar zu
          kommunizieren, warum mein Produkt existiert und welchen Mehrwert es
          für meine Zielgruppe bietet. Ich will nicht nur ein Produkt
          entwickeln, sondern eine Vision verfolgen, die meine Nutzer begeistert
          und inspiriert.
        </Paragraph>
      </GridContainer>
      <GridContainer direction={true}>
        <Bild
          src={'/Flow/Ideen.svg'}
          alt="Desktop"
          width={3000}
          height={3000}
        />

        <Paragraph>
          <Headline2>Phase 3</Headline2>
          Sobald ich das Leitbild festgelegt habe, stürze ich mich in die
          kreative Phase. Ich setze verschiedene Kreativitätstechniken ein, um
          eine Vielzahl von Ideen zu generieren. Diese Ideen entwickle ich in
          kurzen, agilen Iterationen weiter. Anschließend wähle ich die
          vielversprechendsten Konzepte aus und verwandle sie in erste
          Prototypen. Diese Prototypen sind meine ersten greifbaren Versuche,
          die ich in realen Nutzerszenarien teste, um wertvolles Feedback zu
          sammeln. Mein Ziel ist es, innovative Lösungen zu finden, die das
          Potenzial haben, mein Leitbild zu verwirklichen.
        </Paragraph>
      </GridContainer>
      <GridContainer direction={false}>
        <Bild
          src={'/Flow/Implementieren.svg'}
          alt="Desktop"
          width={3000}
          height={3000}
        />
        <Paragraph>
          <Headline2>Phase 4</Headline2>
          In dieser vierten und letzten Phase nehme ich alle gesammelten
          Erkenntnisse zusammen. Ich werte die Daten aus den Nutzertests aus,
          setze die technischen Rahmenbedingungen und beginne mit der agilen
          Produktentwicklung. Hier liegt meine Herausforderung darin, die
          visionären Aspekte meines Leitbildes in konkrete technische Parameter
          zu übersetzen. Der Prozess ist agil und iterativ, was bedeutet, dass
          ich immer wieder evaluieren und korrigieren muss, um sicherzustellen,
          dass mein Endprodukt den gewünschten Mehrwert liefert. Es ist ein
          fortwährender Zyklus der Verbesserung und Anpassung, um
          sicherzustellen, dass ich das bestmögliche positive Mehrwerterlebnis
          für meine Nutzer schaffe.
        </Paragraph>
      </GridContainer>
    </Wrapper>
  );
}

// STYLE
const Wrapper = styled.div`
  padding-top: 5rem;
`;

interface GridContainerProps {
  direction: boolean;
}

const GridContainer = styled.div<GridContainerProps>`
  padding-bottom: 5em;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  gap: 2rem;

  width: 100%;
  height: auto;
  flex-wrap: nowrap;
  flex-direction: ${(props) => (props.direction ? 'row' : 'row-reverse')};

  @media (max-width: 800px) {
    display: block;
    flex-wrap: column;
  }
`;
