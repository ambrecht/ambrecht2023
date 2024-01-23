import styled from 'styled-components';

import btc from '@/public/btc.svg';
import javascript from '@/public/javascript.svg';
import sql from '@/public/postgresql.svg';
import figma from '@/public/figma.svg';
import fastify from '@/public/Fastify.dark.svg';
import nextjs from '@/public/nextjs.svg';
import illustrator from '@/public/illustrator.svg';
import tailwind from '@/public/tailwindcss.svg';
import GridItem from './GridItem';

// Usage in a Next.js component
const MyGridComponent = () => {
  return (
    <>
      <GridContainer>
        {/* Repeat the GridItem for each element you want to display in the grid */}
        <GridItem text="Bitcoin" link="https://bitcoin.org/de/" SvgSrc={btc} />
        <GridItem
          text="Javascript"
          link="https://developer.mozilla.org/en-US/docs/Web/JavaScript"
          SvgSrc={javascript}
        />
        <GridItem
          text="PostgreSQL"
          link="https://www.postgresql.org/"
          SvgSrc={sql}
        />
        <GridItem text="Fastify" link="https://fastify.dev/" SvgSrc={fastify} />
        <GridItem text="Next.js" link="https://nextjs.org/" SvgSrc={nextjs} />
        <GridItem text="Figma" link="https://www.figma.com/" SvgSrc={figma} />
        <GridItem
          text="Illustrator"
          link="https://www.adobe.com/de/products/illustrator.html"
          SvgSrc={illustrator}
        />
        <GridItem
          text="TailwindCSS"
          link="https://tailwindcss.com/"
          SvgSrc={tailwind}
        />
      </GridContainer>
    </>
  );
};

// Define our breakpoints
const breakpoints = {
  sm: '640px',
  md: '768px',
};

// Create a styled div for the grid container with responsive columns and gaps
const GridContainer = styled.div`
  display: grid;
  z-index: 100;
  grid-template-columns: repeat(
    1,
    minmax(0, 1fr)
  ); // default to single column layout
  gap: 1rem; // default gap

  @media (min-width: ${breakpoints.sm}) {
    grid-template-columns: repeat(
      2,
      minmax(0, 1fr)
    ); // two columns on sm screens
    gap: 1.5rem; // sm:gap-x-6
  }

  @media (min-width: ${breakpoints.md}) {
    grid-template-columns: repeat(
      3,
      minmax(0, 1fr)
    ); // three columns on md screens
    gap: 4rem; // lg:gap-x-16
  }

  // Assuming lg breakpoint is 1024px for four columns, as it wasn't specified
  @media (min-width: 1024px) {
    grid-template-columns: repeat(
      4,
      minmax(0, 1fr)
    ); // four columns on lg screens
  }
`;

export default MyGridComponent;
