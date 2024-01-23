'use client';
import Image from 'next/image';
import styled from 'styled-components';
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
import React from 'react';
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
