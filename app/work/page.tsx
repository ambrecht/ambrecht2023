'use client';
import Image from 'next/image';
import styled from 'styled-components';
import { imageClampBuilder, clampBuilder } from '@/lib/utils';
import Work from '@/components/InteractiveTable/Index';
import BoxItem from '@/app/work/BoxItem';
import { Quote, Headline1, Headline2, Paragraph } from '@/styles/index';

export default function Home() {
  return (
    <>
      <Intro>Schauen Sie sich meine bisherigen Projekte an:</Intro>
      <Grid>
        <BoxItem
          image={
            '/teleprompter/Screenshot 2024-01-20 at 12-55-48 Screenshot.png'
          }
          title={'Teleprompter'}
          link={'/teleprompter'}
        ></BoxItem>
        <BoxItem
          image={'/realvirtual.png'}
          title={'Reale Virtualität'}
          link={'/real'}
        ></BoxItem>
        <BoxItem
          image={'/mono/monoKultur.png'}
          title={'MONOkultur'}
          link={'/monokultur'}
        ></BoxItem>
        <BoxItem
          image={'/logo4444.jpg'}
          title={'Cafe der 16 Persönlichkeiten'}
          link={'/cafe'}
        ></BoxItem>
      </Grid>
      <Intro>Sehen Sie sich in meiner Werkstatt um:</Intro>
      <Work></Work>
    </>
  );
}

const Grid = styled.div`
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: repeat(3, 1fr); // Drei Spalten mit gleicher Breite
  grid-template-rows: repeat(2, 1fr); // Drei Zeilen mit gleicher Höhe
  gap: 1rem;
  row-gap: 2rem; // Abstand zwischen den Grid-Elementen
  justify-items: center;
  align-items: stretch;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const Intro = styled(Headline2)`
  width: 66vw;
  text-align: center;
  padding-top: 5rem;
  padding-bottom: 5rem;
  border-bottom: 1px solid white;
  border-top: 1px solid white;
  margin-bottom: 3rem;
  margin-top: 3rem;
  margin-left: auto;
  margin-right: auto;
`;

const Space = styled.div`
  width: 100vw;
  height: 100vh;
`;
