'use client';
import styled from 'styled-components';
import { Quote, Headline1, Headline2, Paragraph } from '@/styles/index';

export default function Vision() {
  return (
    <>
      <Container>
        <Headline1>Meine Vision</Headline1>

        <Paragraph>
          In einer Ära, in der digitale Technologie jeden Aspekt unseres Lebens
          beeinflusst, ist es mein Ziel, Menschen und Unternehmen zu befähigen,
          diese Technologien nicht nur zu nutzen, sondern sie zu beherrschen.
          Mein Motto lautet: &quot;Es gilt, die Maschine zu beherrschen, um
          nicht eines Tages von der Maschine beherrscht zu werden.&quot;
        </Paragraph>

        <Headline2>
          Ganzheitliche Produktentwicklung mit Sinn und Zweck
        </Headline2>
        <Paragraph>
          Kundenerfahrungen sind für mich mehr als nur nüchterne Transaktionen.
          Sie sind wie eine Geschichte – eine epische Reise oder ein
          mitreißender Thriller. In meiner Arbeit verbinde ich Strategie, Design
          und Technologie zu Lösungen, die nicht nur funktionieren, sondern
          echten Mehrwert bieten. Ich hinterfrage bestehende Strukturen radikal
          und entwickle neue Ansätze, die nicht nur technisch überzeugend,
          sondern auch menschlich und ethisch fundiert sind.
        </Paragraph>

        <Quote>
          &quot;Kundenerfahrungen können romantische Liebesgeschichten oder
          epische Heldensagen sein.&quot;
        </Quote>

        <Headline2>
          Meine Arbeitsweise: Kreativ, kritisch, kollaborativ
        </Headline2>
        <Paragraph>
          Meine Arbeit basiert auf den Prinzipien des ganzheitlichen Denkens:
          Technologie soll den Menschen dienen, nicht umgekehrt. Als
          unabhängiger Stratege und kreativer Generalist unterstütze ich
          Unternehmen, die bereit sind, über den Tellerrand hinaus zu denken und
          sich für langfristige, sinnvolle Lösungen zu entscheiden. Ich arbeite
          nur an Projekten, die ethisch und sozial verantwortlich sind und einen
          echten positiven Beitrag leisten.
        </Paragraph>

        <Headline2>Mein Versprechen</Headline2>
        <Paragraph>
          Ich stehe für Integrität, Qualität und Innovation. Jedes Projekt, das
          ich begleite, zielt darauf ab, echte Werte zu schaffen – sowohl für
          die Kunden als auch für die Gesellschaft. Dabei kombiniere ich
          praxeologische Grundsätze mit modernen Technologien, um langfristige,
          nachhaltige Lösungen zu schaffen.
        </Paragraph>

        <Paragraph>
          Sind Sie bereit, gemeinsam die digitale Zukunft zu gestalten? Lassen
          Sie uns zusammenarbeiten, um das Internet und die digitale Welt zu
          einem besseren Ort zu machen.
        </Paragraph>
      </Container>
    </>
  );
}

const Container = styled.div`
  max-width: 66vw;
  margin-right: auto;
  margin-left: auto;
  margin-top: 4rem;
  text-align: left;
`;
