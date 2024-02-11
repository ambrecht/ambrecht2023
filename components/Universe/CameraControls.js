import React, { useRef, useEffect } from 'react';
import { extend, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

extend({ OrbitControls });

const CameraControls = React.memo(() => {
  const {
    camera,
    gl: { domElement },
  } = useThree();

  const controls = useRef();

  // Update controls each frame
  useFrame(() => controls.current?.update());

  // Initialize and cleanup the controls
  useEffect(() => {
    if (controls.current) {
      const currentControls = controls.current;
      currentControls.addEventListener('change', () => {}); // Optional: Add event listeners if needed

      return () => {
        currentControls.dispose();
      };
    }
  }, [controls]);

  return (
    <orbitControls
      ref={controls}
      args={[camera, domElement]}
      autoRotate={true}
      enableZoom={false}
      autoRotateSpeed={0.5}
    />
  );
});

CameraControls.displayName = 'CameraControls'; // Add display name

export default CameraControls;
