// CameraControls.js - Nur die notwendigen Änderungen
import React, { useRef, useEffect } from 'react';
import { extend, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
extend({ OrbitControls });

const CameraControls = React.memo(({ onCameraMove }) => {
  // Nur den onCameraMove prop hinzugefügt
  const {
    camera,
    gl: { domElement },
  } = useThree();
  const controls = useRef();
  const lastPosition = useRef({ x: 0, y: 0 });
  const isMoving = useRef(false);

  useFrame(() => {
    if (controls.current) {
      controls.current.update();

      // Nur den Bewegungs-Check hinzufügen
      if (isMoving.current) {
        const currentPosition = {
          x: controls.current.getAzimuthalAngle(),
          y: controls.current.getPolarAngle(),
        };

        const deltaX = Math.abs(currentPosition.x - lastPosition.current.x);
        const deltaY = Math.abs(currentPosition.y - lastPosition.current.y);
        const movement = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (movement > 0.01) {
          onCameraMove?.(movement);
        }

        lastPosition.current = currentPosition;
      }
    }
  });

  useEffect(() => {
    if (controls.current) {
      const currentControls = controls.current;

      const handleStart = () => {
        isMoving.current = true;
      };

      const handleEnd = () => {
        isMoving.current = false;
      };

      currentControls.addEventListener('start', handleStart);
      currentControls.addEventListener('end', handleEnd);

      return () => {
        currentControls.removeEventListener('start', handleStart);
        currentControls.removeEventListener('end', handleEnd);
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

CameraControls.displayName = 'CameraControls';
export default CameraControls;
