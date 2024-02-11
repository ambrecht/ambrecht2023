import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import dynamic from 'next/dynamic';
import styled from 'styled-components';

// Dynamically import CameraControls and SkyBox to enable code splitting
const CameraControls = dynamic(() => import('./CameraControls'), {
  ssr: false,
});
const SkyBox = dynamic(() => import('./SkyBox'), { ssr: false });

const UniverseContainer = styled.div`
  width: 100%;
  height: 100vh; // or set to the desired size
  canvas {
    width: 100%;
    height: 100%;
  }
`;

const Universe = () => {
  const [isActive, setIsActive] = useState(true);

  const toggleScene = () => {
    setIsActive(!isActive);
  };
  return (
    <UniverseContainer>
      <Canvas camera={{ position: [1, 1, 1] }}>
        <SkyBox />
        <CameraControls />
        {/* Add other 3D components here as needed */}
      </Canvas>
    </UniverseContainer>
  );
};

export default Universe;
