import React, { useRef, useEffect, useState } from 'react';
import { Canvas, extend, useThree, useFrame } from '@react-three/fiber';
import { CubeTextureLoader } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import styled from 'styled-components';
import dynamic from 'next/dynamic';

extend({ OrbitControls });

const CameraControls = () => {
  const {
    camera,
    gl: { domElement },
  } = useThree();
  const controls = useRef();
  useFrame(() => controls.current.update());

  return (
    <orbitControls
      ref={controls}
      args={[camera, domElement]}
      autoRotate={true}
      enableZoom={true}
      autoRotateSpeed={0.5}
    />
  );
};

const SkyBox = () => {
  const { scene } = useThree();
  const loader = new CubeTextureLoader();
  const texture = loader.load([
    '/cubemap/px.jpg',
    '/cubemap/nx.jpg',
    '/cubemap/py.jpg',
    '/cubemap/ny.jpg',
    '/cubemap/pz.jpg',
    '/cubemap/nz.jpg',
  ]);
  scene.background = texture;
  return null;
};

const UniverseContainer = styled.div`
  canvas {
    width: 100vw;
    height: 120vh;
    z-index: 10;
    will-change: transform;
  }
`;

const App = () => {
  return (
    <UniverseContainer>
      <Canvas camera={{ position: [1, 1, 1] }}>
        <SkyBox />
        <CameraControls />
      </Canvas>
    </UniverseContainer>
  );
};

export default dynamic(() => Promise.resolve(App), {
  loading: () => <div>Loading Universe...</div>,
  ssr: false,
});
