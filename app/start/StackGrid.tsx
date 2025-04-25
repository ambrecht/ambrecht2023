// E:\ambrecht2024\25092024\ambrecht2023\app\start\StackGrid.tsx

import styled from 'styled-components';

import btc from '@/public/btc.svg';
import fastify from '@/public/Fastify.dark.svg';
import figma from '@/public/figma.svg';
import illustrator from '@/public/illustrator.svg';
import javascript from '@/public/javascript.svg';
import nextjs from '@/public/nextjs.svg';
import sql from '@/public/postgresql.svg';
import tailwind from '@/public/tailwindcss.svg';

import GridItem from './GridItem';

const MyGridComponent = () => {
  return (
    <GridContainer>
      <GridItem text="Bitcoin" link="https://bitcoin.org/de/" SvgSrc={btc} />
      <GridItem text="Fastify" link="https://fastify.dev/" SvgSrc={fastify} />
      <GridItem text="Figma" link="https://www.figma.com/" SvgSrc={figma} />
      <GridItem
        text="Illustrator"
        link="https://www.adobe.com/de/products/illustrator.html"
        SvgSrc={illustrator}
      />
      <GridItem
        text="JavaScript"
        link="https://developer.mozilla.org/en-US/docs/Web/JavaScript"
        SvgSrc={javascript}
      />
      <GridItem text="Next.js" link="https://nextjs.org/" SvgSrc={nextjs} />
      <GridItem
        text="PostgreSQL"
        link="https://www.postgresql.org/"
        SvgSrc={sql}
      />
      <GridItem
        text="TailwindCSS"
        link="https://tailwindcss.com/"
        SvgSrc={tailwind}
      />
    </GridContainer>
  );
};

export default MyGridComponent;

// Breakpoints Definition
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
};

// GridContainer Definition
const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  grid-auto-rows: 1fr;
  gap: 1rem;
  padding: 1rem;
  z-index: 100;

  @media (min-width: ${breakpoints.sm}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.5rem;
  }

  @media (min-width: ${breakpoints.md}) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 2rem;
  }

  @media (min-width: ${breakpoints.lg}) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 2.5rem;
  }
`;
