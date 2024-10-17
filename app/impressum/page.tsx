'use client';
import styled from 'styled-components';

export default function Impressum() {
  return (
    <Container>
      <Headline>Impressum</Headline>
      <Section>
        <Address>
          <strong>Ambrecht LLC</strong> <br />
          Suite 225C <br />
          2880 W Oakland Park Blvd <br />
          FL 33311 Oakland Park <br />
          USA <br />
          Telefon: +1 202 456 1111 <br />
          E-Mail: managment@ambrecht.de
        </Address>
      </Section>

      <Section>
        <Address>
          <strong>Ambrecht LLC</strong> <br />
          Bulevar Svetog Petra Cetinjskog 22 <br />
          81000 Podgorica <br />
          Montenegro <br />
          Telefon: +382 20 482 123 <br />
          E-Mail: managment@ambrecht.de
        </Address>
      </Section>

      <Headline>Rechtliche Hinweise</Headline>
      <Paragraph>
        Tino Ambrecht LLC leistet keine rechtliche, steuerliche oder
        Investment-Beratung. Inhalte auf dieser Seite dienen lediglich zu
        Informationszwecken.
      </Paragraph>

      <Headline>Haftungsbeschränkung</Headline>
      <Paragraph>
        Die Inhalte dieser Website werden mit größtmöglicher Sorgfalt erstellt.
        Tino Ambrecht LLC übernimmt jedoch keine Gewähr für die Richtigkeit,
        Vollständigkeit und Aktualität der bereitgestellten Inhalte.
      </Paragraph>

      <Headline>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</Headline>
      <Paragraph>
        Tino Ambrecht LLC <br />
        Suite 225C <br />
        2880 W Oakland Park Blvd <br />
        FL 33311 Oakland Park <br />
        USA
      </Paragraph>

      <Headline>Externe Links</Headline>
      <Paragraph>
        Diese Website enthält Verknüpfungen zu Websites Dritter. Diese Websites
        unterliegen der Haftung der jeweiligen Betreiber.
      </Paragraph>

      <Headline>Urheber- und Leistungsschutzrechte</Headline>
      <Paragraph>
        Die auf dieser Website veröffentlichten Inhalte unterliegen dem
        US-amerikanischen und internationalen Urheberrecht.
      </Paragraph>

      <Headline>Online-Streitbeilegung</Headline>
      <Paragraph>
        Online-Streitbeilegung gemäß Art. 14 Abs. 1 ODR-VO: Die Europäische
        Kommission stellt eine Plattform zur Online-Streitbeilegung bereit.
      </Paragraph>
    </Container>
  );
}

const Container = styled.div`
  max-width: 66vw;
  margin: 4rem auto;
  padding: 2rem;
  font-family: var(--pop-Font);
  line-height: 1.6;
  color: white;
`;

const Headline = styled.h2`
  font-family: var(--pop-Font);
  font-size: 1.8rem;
  margin-top: 2rem;
  color: white;
  background: linear-gradient(
    72.61deg,
    rgba(0, 130, 255, 1) 0%,
    rgba(79, 5, 245, 1) 50%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Section = styled.div`
  margin-bottom: 1.5rem;
`;

const Address = styled.p`
  font-size: 1rem;
  line-height: 1.4;
`;

const Paragraph = styled.p`
  font-size: 1rem;
  margin-bottom: 1rem;
`;
