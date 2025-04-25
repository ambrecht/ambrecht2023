// E:\ambrecht2024\25092024\ambrecht2023\app\start\GridItem.tsx

import styled from 'styled-components';
import { ReactNode } from 'react';
import Image from 'next/image';

interface GridItemProps {
  text: string;
  link: string;
  SvgSrc: string;
}

const GridItem: React.FC<GridItemProps> = ({ text, link, SvgSrc }) => {
  return (
    <GridItemContainer>
      <Link href={link} target="_blank" rel="noopener noreferrer">
        <ImageWrapper>
          <LogoContainer src={SvgSrc} alt={text} width={75} height={75} />
        </ImageWrapper>
        <Text>{text}</Text>
      </Link>
    </GridItemContainer>
  );
};

export default GridItem;

const breakpoints = {
  sm: '640px',
  md: '768px',
};

const GridItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  transition: border-color 300ms ease, transform 300ms ease;

  @media (min-width: ${breakpoints.sm}) {
    padding: 1.5rem;
  }

  @media (min-width: ${breakpoints.md}) {
    padding-top: 3rem;
    padding-bottom: 3rem;
  }

  &:hover {
    border-color: #0070f3;
    transform: translateY(-5px);
  }
`;

const Link = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
`;

const ImageWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 300ms ease, filter 300ms ease;

  ${GridItemContainer}:hover & {
    transform: scale(1.2);
    filter: brightness(1.2) contrast(1.2);
  }
`;

const LogoContainer = styled(Image)`
  filter: grayscale(100%);
  transition: filter 300ms ease;

  ${GridItemContainer}:hover & {
    filter: grayscale(0%);
  }
`;

const Text = styled.span`
  margin-top: 0.75rem;
  text-align: center;
  opacity: 0;
  font-weight: 800;
  color: white;
  transition: opacity 400ms ease, transform 400ms ease;
  transform: translateY(10px);

  ${GridItemContainer}:hover & {
    opacity: 1;
    transform: translateY(0px);
  }
`;
