import React, { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { CubeTextureLoader } from 'three';

const SkyBox = React.memo(() => {
  const { scene } = useThree();

  // useMemo will ensure that the texture is only loaded once and not reloaded on every render
  const texture = useMemo(() => {
    const loader = new CubeTextureLoader();
    return loader.load([
      '/cubemap/px.jpg',
      '/cubemap/nx.jpg',
      '/cubemap/py.jpg',
      '/cubemap/ny.jpg',
      '/cubemap/pz.jpg',
      '/cubemap/nz.jpg',
    ]);
  }, []);

  // Setting the scene background
  useMemo(() => {
    scene.background = texture;
  }, [scene, texture]);

  // Cleanup: Dispose of the texture when the component unmounts
  React.useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  return null;
});

SkyBox.displayName = 'SkyBox'; // Add display name to the component

export default SkyBox;
