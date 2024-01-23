'use client';
import React from 'react';
import Image from 'next/image';
import {
  Grid,
  Categorie,
  MainHeadline,
  SubHeadline,
  Headline,
  Title,
  Text,
  MainBild,
  Bild,
  Header,
  HeaderContainer,
  Label,
  LabelContainer,
  Description,
  ChapterLabel,
  Space,
} from '@/styles/portfolio';
export default function Cafe() {
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
