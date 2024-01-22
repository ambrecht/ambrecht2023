'use client';

import styled from 'styled-components';

export const Frame = styled.div`
  box-sizing: border-box;
  max-width: 100vw;
  z-index: 999; // Volle Bildschirmbreite

  border-width: 0.4rem;
  border-style: solid;
  border-image: linear-gradient(
      72.61deg,
      rgba(0, 130, 255, 1) 22.63%,
      rgba(79, 5, 245, 1) 84.67%
    )
    1;
`;
