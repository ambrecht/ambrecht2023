import { imageClampBuilder, clampBuilder } from '@/lib/utils';
import styled from 'styled-components';

export const Paragraph = styled.div`
  display: inline;
  font-family: var(--gara-Font);
  font-size: ${clampBuilder({
    minWidthPx: 600,
    maxWidthPx: 1920,
    minValue: 2,
    maxValue: 5,
    units: 'rem',
  })};
  font-weight: 300;
  color: white;
`;

const ColorP = styled.p`
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
