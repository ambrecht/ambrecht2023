export { default as GlobalStyle } from './global';
export { default as theme } from './theme';
import styled from 'styled-components';
import { imageClampBuilder, clampBuilder } from '@/lib/utils';
import Image from 'next/image';

export const Paragraph = styled.div`
  margin-top: 1rem;
  margin-bottom: 5rem;
  margin-right: auto;
  margin-left: auto;
  column-span: all;
  font-family: var(--pop-Font);
  font-size: ${clampBuilder({
    minWidthPx: 600,
    maxWidthPx: 1800,
    minValue: 2,
    maxValue: 3,
    units: 'rem',
  })};
  font-weight: 100;
  color: white;
  line-height: 125%;

  text-align: justify;
  max-width: 66vw;
  background-color: #ffffff;
  -webkit-background-clip: text;
  color: transparent;
`;

export const Bild = styled(Image)`
  float: left;

  margin-right: 2rem;
`;

export const ColorP = styled.p`
  display: inline;
  font-weight: 700;

  background: linear-gradient(
    72.61deg,
    rgba(0, 130, 255, 1) 22.63%,
    rgba(79, 5, 245, 1) 84.67%
  );
  -webkit-background-clip: text;
  color: transparent;
`;

export const Headline1 = styled.h1`
  font-family: var(--Pop-Font);
  font-size: ${clampBuilder({
    minWidthPx: 600,
    maxWidthPx: 1920,
    minValue: 3,
    maxValue: 5,
    units: 'rem',
  })};
  font-weight: 800;
  color: white;
  line-height: 1;
  text-transform: uppercase;

  margin-bottom: 5rem;
  margin-top: 3rem;

  background: linear-gradient(
    72.61deg,
    rgba(0, 130, 255, 1) 0%,
    rgba(79, 5, 245, 1) 50%
  );
  background-clip: border-box;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media (max-width: 500px) {
    font-size: 2rem;
    max-width: 95vw;
    padding: 0rem;
  }
`;

export const Headline2 = styled.h4`
  font-family: var(--pop-Font);
  font-size: ${clampBuilder({
    minWidthPx: 600,
    maxWidthPx: 1920,
    minValue: 1.5,
    maxValue: 3,
    units: 'rem',
  })};
  font-weight: 800;
  color: white;
  line-height: 1;
  text-align: left;
  margin-bottom: 2rem;
  margin-top: 1rem;

  background: linear-gradient(
    72.61deg,
    rgba(0, 130, 255, 1) 0%,
    rgba(79, 5, 245, 1) 50%
  );
  background-clip: border-box;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

export const Quote = styled.h1`
  margin-top: 1rem;
  margin-bottom: 2rem;
  margin-right: auto;
  margin-left: auto;
  column-span: all;
  font-family: var(--pop-Font);
  font-style: italic;
  letter-spacing: 0.1rem;
  font-size: ${clampBuilder({
    minWidthPx: 600,
    maxWidthPx: 1920,
    minValue: 2.5,
    maxValue: 4,
    units: 'rem',
  })};
  font-weight: 800;
  color: white;
  line-height: 1;
  padding: 5rem;

  text-align: center;
  max-width: 66vw;
  background: linear-gradient(72.61deg, #ffffff 22.63%, #ffffff 84.67%);
  -webkit-background-clip: text;
  color: transparent;

  &:before {
    content: '«';
  }
  &:after {
    content: '»';
  }

  @media (max-width: 500px) {
    font-size: 2rem;
    width: 100vw;
    padding: 0rem;
  }
`;

export const BlockText = styled.text`
  column-span: all;
  font-family: var(--pop-Font);
  font-size: ${clampBuilder({
    minWidthPx: 600,
    maxWidthPx: 1920,
    minValue: 1.5,
    maxValue: 3,
    units: 'rem',
  })};
  font-weight: 300;
  color: white;
  width: ${imageClampBuilder(600, 1920, 250, 800)};
  text-align: justify;

  border-top: 3px solid #333333;
  border-bottom: 3px solid #333333;
  padding: 12px 0;
`;

export const List = styled.ul`
  font-weight: 800;

  list-style-type: lower-roman;
  padding: 0;
  text-align: left;
  margin-left: 1ch;
  margin-bottom: 1ch;

  li {
    padding-left: 1ch;
    margin-top: 1ch;
  }
`;
