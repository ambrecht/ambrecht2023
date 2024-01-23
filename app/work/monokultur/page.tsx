'use client';
import Image from 'next/image';
import React from 'react';
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
