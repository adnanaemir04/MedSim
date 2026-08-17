'use client';

import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Environment, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

interface CelestialOrb3DProps {
  theme: 'light' | 'dark';
}

function Sun() {
  const coreRef = useRef<THREE.Mesh>(null);
  const shellRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (coreRef.current) {
      // Gentle pulsing of the core
      const scale = 1 + Math.sin(time * 2) * 0.03;
      coreRef.current.scale.set(scale, scale, scale);
    }
    if (shellRef.current) {
      // Slow rotation of the glass shell
      shellRef.current.rotation.y += 0.002;
      shellRef.current.rotation.z += 0.001;
    }
  });

  return (
    <group>
      {/* High-quality lighting reflections for the glass */}
      <Environment preset="sunset" />
      
      {/* Inner Glowing Core */}
      <Sphere ref={coreRef} args={[0.85, 64, 64]}>
        <meshStandardMaterial 
          color="#ffffff"
          emissive="#ffaa00"
          emissiveIntensity={4}
          toneMapped={false}
        />
      </Sphere>

      {/* Premium Sci-Fi Glass Shell (Glassmorphism Aesthetic) */}
      <Sphere ref={shellRef} args={[1.2, 64, 64]}>
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={1}      // Fully transparent like glass
          opacity={1}
          metalness={0.1}
          roughness={0.05}      // Very smooth
          ior={1.52}            // Index of Refraction for Glass
          thickness={1}         // Refraction thickness
          clearcoat={1}         // Glossy outer layer
          clearcoatRoughness={0.1}
        />
      </Sphere>
    </group>
  );
}

function Moon() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Use locally hosted texture to avoid GitHub raw rate limits/CORS
  const colorMap = useTexture('/textures/moon.jpg');

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <>
      {/* Harsh directional light from Top-Left to simulate sunlight in space */}
      <directionalLight position={[-5, 5, 5]} intensity={2.5} color="#ffffff" />
      {/* Very subtle ambient light to prevent pitch black on the dark side */}
      <ambientLight intensity={0.05} color="#94a3b8" />
      
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <meshStandardMaterial 
          map={colorMap}
          roughness={1}
          metalness={0.1}
        />
      </Sphere>
    </>
  );
}

export default function CelestialOrb3D({ theme }: CelestialOrb3DProps) {
  const isLightMode = theme === 'light';

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {/* Moved camera further back [0, 0, 4] so the bloom glow has plenty of canvas space and doesn't clip */}
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }} gl={{ alpha: true }}>
        {/* Soft floating animation for the entire camera/scene could be added, but CSS handles it */}
        {isLightMode ? (
          <>
            <Sun />
            <EffectComposer>
              {/* Intense Bloom for the sun's corona */}
              <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} intensity={2.5} />
            </EffectComposer>
          </>
        ) : (
          <Suspense fallback={null}>
            <Moon />
            <EffectComposer>
              {/* Soft ambient bloom for the moon's atmospheric glow */}
              <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={0.5} />
            </EffectComposer>
          </Suspense>
        )}
      </Canvas>
    </div>
  );
}
