import React from 'react';
import styled from 'styled-components';
import Image, { StaticImageData } from 'next/image';
import { imageClampBuilder, clampBuilder } from '@/lib/utils';
// MARKUP
interface MARKUPProps {
  children: React.ReactNode;
  autor: string;
  image: StaticImageData;
  alttext: string;
}

export const Quote: React.FC<MARKUPProps> = ({
  children,
  autor,
  image,
  alttext,
}) => {
  return (
    <Wrapper>
      <BlockQuoteBox>
        <BildCon>
          <Bild src={image} alt={alttext} fill={true}></Bild>
        </BildCon>
        {children}

        <br />

        <Autor>- {autor}</Autor>
      </BlockQuoteBox>
    </Wrapper>
  );
};

//STYLE
//quotes: "\201""\201D""\2018""\2019";

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: var(--pop-Font);
  font-size: ${clampBuilder({
    minWidthPx: 600,
    maxWidthPx: 1920,
    minValue: 1.5,
    maxValue: 2.5,
    units: 'rem',
  })};
  font-weight: 100;
`;

const BlockQuoteBox = styled.blockquote`
  width: ${imageClampBuilder(600, 1920, 250, 1000)};

  color: white;
  padding: 1em 0em 0em 5em;
  border-left: 0.05em solid white;
  border-right: 0.05em solid white;
  line-height: 1.6rem;
  letter-spacing: 0.1rem;
  font-style: italic;

  &:after {
    content: '❝';
    position: absolute;
    z-index: -1;
    left: 50%;
    top: 25%;
    transform: translate(-50%, -50%);
    width: 1.3em;
    height: 1.3em;
    background: none;
    box-shadow: 0 4px 5px -1px hsla(0 0% 0% / 20%);
    border-radius: 999px;
    display: grid;
    place-content: center;
    padding-top: 0.5em;
    color: grey;
    font-size: 5rem;
    font-style: normal;
    text-indent: 0;
  }
`;

const Autor = styled.p`
  margin-top: 1rem;
  font-size: 1rem;
  letter-spacing: 0.2rem;
  font-weight: 1000;
  font-style: normal;
  text-shadow: none;
  text-transform: uppercase;

  text-align: center;

  @media (max-width: 1300px) {
    font-size: 1.5em;
  }

  &:after {
  }
`;

const Bild = styled(Image)`
  border-radius: 50%;
`;

const BildCon = styled.div`
  width: 10vw;
  height: 10vw;
  position: relative;
  float: left;
  opacity: 100%;

  shape-outside: circle(50%);

  @media (max-width: 768px) {
    width: 25vw;
    height: 25vw;
  }
  @media (max-width: 1300px) {
    width: 10vw;
    height: 10vw;
  }
`;
