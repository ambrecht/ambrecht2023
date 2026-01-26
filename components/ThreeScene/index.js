import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ShaderMaterial, TextureLoader, Vector2 } from 'three';
import styled from 'styled-components';
import { fragment as fragmentShader } from './fragment';
import { vertex as vertexShader } from './vertex';
import { createUniforms } from './uniform';

const BackgroundCanvas = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -100;
`;

function ResizableCanvas() {
  const { camera, gl } = useThree();
  useEffect(() => {
    const handleResize = () => {
      const aspect = window.innerWidth / window.innerHeight;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      gl.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [camera, gl]);

  return null; // Render nichts, da dies nur eine Hilfskomponente ist
}

const ShaderPlane = ({ texture, flashTrigger, mode }) => {
  const { scene, camera, gl, size, viewport } = useThree();
  const [material, setMaterial] = useState(null);
  const deltaRef = useRef(0);
  const flashValRef = useRef(0);

  useEffect(() => {
    const material = new ShaderMaterial({
      uniforms: createUniforms(Vector2),
      vertexShader,
      fragmentShader,
    });
    setMaterial(material);
  }, []);

  useEffect(() => {
    if (flashTrigger === undefined) {
      return;
    }

    flashValRef.current = 1.4 + Math.random() * 0.8;
    if (material) {
      material.uniforms.u_glitchSeed.value = Math.random();
    }
  }, [flashTrigger, material]);

  useEffect(() => {
    if (!material) {
      return;
    }
    material.uniforms.u_resolution.value.set(size.width, size.height);
  }, [material, size.width, size.height]);

  useFrame(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const isFrozen = mode === 'FREEZE' || mode === 'END';
    if (!isFrozen) {
      deltaRef.current += 0.1;
      flashValRef.current = Math.max(flashValRef.current - 0.05, 0);
    }

    if (material) {
      if (!isFrozen) {
        material.uniforms.u_time.value = deltaRef.current;
        material.uniforms.u_flash.value = flashValRef.current;
      }
      material.uniforms.u_texture.value = texture;
      if (texture && texture.image) {
        const { width, height } = texture.image;
        if (width && height) {
          material.uniforms.u_textureAspect.value = width / height;
        }
      }
    }

    gl.render(scene, camera);
  });

  useEffect(() => {
    if (material && texture) {
      material.uniforms.u_texture.value = texture;
    }
  }, [material, texture]);

  return (
    material && (
      <mesh material={material}>
        <planeGeometry args={[viewport.width, viewport.height, 128, 128]} />
      </mesh>
    )
  );
};

const Scene = ({ imagePaths, mode, onZap }) => {
  const isBrowser = typeof window !== 'undefined';
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [flashTrigger, setFlashTrigger] = useState(0);
  const onZapRef = useRef(onZap);

  useEffect(() => {
    onZapRef.current = onZap;
  }, [onZap]);

  // Laden Sie alle Texturen vor
  const textures = useMemo(() => {
    if (!isBrowser) {
      return [];
    }
    const loader = new TextureLoader();
    return imagePaths.map((path) => loader.load(path));
  }, [imagePaths, isBrowser]);

  useEffect(() => {
    if (!textures.length) {
      return;
    }
    setCurrentImageIndex((prevIndex) =>
      Math.min(prevIndex, textures.length - 1),
    );
  }, [textures.length]);

  useEffect(() => {
    if (
      !isBrowser ||
      !textures.length ||
      mode === 'FREEZE' ||
      mode === 'END'
    ) {
      return;
    }

    const availableCount = textures.length;

    const intervalId = window.setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        if (availableCount <= 1) {
          return prevIndex;
        }
        const nextIndex = (prevIndex + 1) % availableCount;
        const zapFn = onZapRef.current;
        if (typeof zapFn === 'function') {
          zapFn(nextIndex);
        }
        return nextIndex;
      });
      setFlashTrigger((value) => value + 1);
    }, 4000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [textures.length, mode, isBrowser]);

  useEffect(() => {
    if (!isBrowser || mode === 'END' || !textures.length) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
        return;
      }
      event.preventDefault();
      setCurrentImageIndex((prevIndex) => {
        const count = textures.length;
        if (count <= 1) {
          return prevIndex;
        }
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const nextIndex = (prevIndex + direction + count) % count;
        const zapFn = onZapRef.current;
        if (typeof zapFn === 'function') {
          zapFn(nextIndex);
        }
        return nextIndex;
      });
      setFlashTrigger((value) => value + 1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBrowser, mode, textures.length, onZap]);

  return (
    <BackgroundCanvas>
      <Canvas
        frameloop="always"
        camera={{
          position: [0, 0, 2],
          fov: 45,
          near: 1,
          far: 10000,
          aspect: window.innerWidth / window.innerHeight,
        }}
        onCreated={({ gl }) => {
          gl.setSize(window.innerWidth, window.innerHeight);
        }}
      >
        <ResizableCanvas />
        {textures[currentImageIndex] && (
          <ShaderPlane
            texture={textures[currentImageIndex]}
            flashTrigger={flashTrigger}
            mode={mode}
          />
        )}
      </Canvas>
    </BackgroundCanvas>
  );
};

export default Scene;
