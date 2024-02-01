'use client';
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
            src="/real/33b81ba7-3f6b-46b5-ad28-a0f4b1010f26.webp"
            alt="Picture of the Cafe"
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
            src="/real/5f5cd54b-569a-4cfd-ae2a-57deb82660b0.webp"
            fill={true}
            alt="Picture of the cafe"
            style={{
              objectFit: 'cover',
            }}
          />
        </Bild>
        <Bild>
          <Image
            src="/real/39ba8bee-ad3a-4870-bc56-80f1f5ba8486.webp"
            fill={true}
            alt="Picture of the cafe"
            style={{
              objectFit: 'cover',
            }}
          />
        </Bild>
        <Bild>
          <Image
            src="/real/8c4d84ef-2979-4052-ae70-0d68ab74e57f.webp"
            fill={true}
            alt="Picture of the cafe"
            style={{
              objectFit: 'cover',
            }}
          />
        </Bild>
        <Space></Space>

        <ChapterLabel>Projektidee</ChapterLabel>
        <Description>
          Die Reale Virtualität ist ein innovativer Ort, der die Vorteile einer
          virtuellen Plattform, wie zum Beispiel eines sozialen Netzwerks, mit
          einem realen Standort, wie zum Beispiel einem Café, verbindet. Hier
          können sich Nutzer treffen, austauschen und zusammenarbeiten. Ziel ist
          es, Menschen in der Realität zusammenzubringen, wo Wissenschaftler,
          Unternehmer und Kreative ungezwungen zusammenkommen und gemeinsame
          Projekte starten können.
        </Description>
        <ChapterLabel>Umsetzung</ChapterLabel>
        <Description>
          Die Realisierung dieses Konzepts erfordert innovative Softwarelösungen
          und die Partnerschaft mit Cafés, die bereit sind, neue Wege in der
          Kundeninteraktion zu gehen.
        </Description>
        <ChapterLabel>Zukunftsvision</ChapterLabel>
        <Description>
          Verbindung von virtuellen und realen Welten: Schaffung einer modernen
          Form der Wiener Kaffeehauskultur. Software als Herzstück: Nutzer
          können über eine App oder Website ein Konto anlegen, ein Pseudonym
          vergeben und ihren Tisch auswählen. Verbesserung des Bestellprozesses
          durch Online- oder Kreditkartenzahlung. Individualisierung des
          Benutzerkontos: Einstellungen wie Status (z. B. gesprächsbereit,
          beschäftigt) und Interessen (z. B. Schriftsteller, Physiker) können
          angepasst werden.
        </Description>
      </Grid>
    </>
  );
}
