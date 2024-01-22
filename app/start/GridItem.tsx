import styled from 'styled-components';
import { ReactNode } from 'react';
import Image from 'next/image';

interface GridItemComponentProps {
  text: string;
  link: string;
  SvgSrc: string;
}

// This component uses the styled GridItem and renders the SVG, text, and link
const GridItemComponent: React.FC<GridItemComponentProps> = ({
  text,
  link,
  SvgSrc,
}) => {
  return (
    <GridItem>
      <a href={link} target="_blank" rel="noopener noreferrer">
        <LogoContainer src={SvgSrc} alt={text} width={75} height={75} />{' '}
        <Text>{text}</Text>
      </a>
    </GridItem>
  );
};

export default GridItemComponent;

// Define our breakpoints
const breakpoints = {
  sm: '640px',
  md: '768px',
};

// Create a styled div for the grid items with Tailwind-inspired styles
export const GridItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem; // p-4
  border-left: 1px solid rgba(255, 255, 255, 0.1); // border-l border-white/10

  @media (min-width: ${breakpoints.sm}) {
    padding: 1.5rem; // sm:p-6
  }

  @media (min-width: ${breakpoints.md}) {
    padding-top: 3rem; // md:py-12
    padding-bottom: 3rem; // md:py-12
  }

  &:hover {
    border-color: #0070f3; // hover:border-blue-500
  }

  transition: border-color 300ms; // transition-colors duration-300
`;

export const LogoContainer = styled(Image)`
  filter: grayscale(100%);
  transition: 0.3s;

  &:hover {
    filter: grayscale(0%); // hover:border-blue-500

    transform: scale(2);
  }
`;

const Text = styled.span`
  text-align: center;
  margin-top: 200vh;
  opacity: 0;
  font-weight: 800;
  color: white;
  transition: opacity 300ms ease-in-out;
  ${GridItem}:hover & {
    opacity: 1;
  }
`;
