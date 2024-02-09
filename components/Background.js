'use client';
import styled from 'styled-components';
import dynamic from 'next/dynamic';

const Universe = dynamic(() => import('@/components/Universe/Universe.js'), {
  loading: () => <Background>LOAD UNIVERSE!</Background>,
});

//MARKUP
export default function BackgroundUniverse() {
  return (
    <Background>
      <Universe></Universe>
    </Background>
  );
}

//STYLE

const Background = styled.div`
  position: absolute;
  width: 33vw;
  height: 33vw;
  overflow: hidden;
  display: block;
  clip-path: circle(50% at 50% 50%);
  z-index: -10;
`;
