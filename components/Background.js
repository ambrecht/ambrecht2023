'use client';
import styled from 'styled-components';
import dynamic from 'next/dynamic';

const Universe = dynamic(() => import('@/components/Universe/Universe.js'), {
  loading: () => <Background>LOAD UNIVERSE!</Background>,
});

//MARKUP
export default function BackgroundUniverse({ opacityValue }) {
  return (
    <Background opacity={opacityValue}>
      <Universe></Universe>
    </Background>
  );
}

//STYLE

const Background = styled.div`
  position: absolute;
  width: 100%;
  height: 100vh;
  left: 0;
  right: 0;
  top: 0;
  overflow: hidden;
  //a handcourser
  cursor: grab;
  z-index: 0;
  clip-path: polygon(100% 0, 100% 60%, 0 100%, 0 0%);
  opacity: ${(props) => props.opacity};
  transition: opacity 0.5s ease;
`;
