'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, PerspectiveCamera, Torus, MeshDistortMaterial, Float } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { Sun, MoonIcon } from 'lucide-react';
import CelestialOrb3D from '../layout/CelestialOrb3D';
import * as THREE from 'three';

// --- DARK MODE: 3D Particle Background ---
function ParticleBackground(props: any) {
  const ref = useRef<any>();
  const [sphere] = useState(() => random.inSphere(new Float32Array(5000), { radius: 1.5 }));

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 1]} />
      <group rotation={[0, 0, Math.PI / 4]}>
        <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
          <PointMaterial
            transparent
            color="#3b82f6"
            size={0.005}
            sizeAttenuation={true}
            depthWrite={false}
          />
        </Points>
      </group>
    </>
  );
}

// --- LIGHT MODE: 500% Aesthetic Curved Microscopic Flowing Vein ---

const veinCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, 10),     // Behind camera
  new THREE.Vector3(0, 0, 0),      // Camera position
  new THREE.Vector3(2, -1, -10),
  new THREE.Vector3(8, -3, -20),
  new THREE.Vector3(18, -1, -30),
  new THREE.Vector3(30, 5, -40),
  new THREE.Vector3(45, 12, -50),  // Curves sharply away out of sight
]);

function BloodParticles() {
  const rbcCount = 200; // Red Blood Cells (Erythrocytes)
  const wbcCount = 15;  // White Blood Cells (Leukocytes)
  const platCount = 100; // Platelets (Thrombocytes)

  const rbcRef = useRef<any>(null);
  const wbcRef = useRef<any>(null);
  const platRef = useRef<any>(null);
  
  // Generate random data for all particles
  const createParticles = (count: number, speedMult: number, scaleBase: number, scaleVar: number) => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        offset: Math.random(), // 0 to 1 along the curve
        spreadX: (Math.random() - 0.5) * 6,
        spreadY: (Math.random() - 0.5) * 6,
        rotation: new THREE.Vector3(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ),
        speed: speedMult + Math.random() * speedMult * 0.5,
        scale: scaleBase + Math.random() * scaleVar,
        wobbleSpeed: 1 + Math.random() * 2,
        rotSpeed: 0.05 + Math.random() * 0.15 // Slower, calmer rotation
      });
    }
    return arr;
  };

  const rbcs = React.useMemo(() => createParticles(rbcCount, 0.05, 0.2, 0.2), []);
  const wbcs = React.useMemo(() => createParticles(wbcCount, 0.03, 0.6, 0.3), []);
  const plats = React.useMemo(() => createParticles(platCount, 0.06, 0.05, 0.05), []);

  const dummy = React.useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    
    const updateMesh = (ref: any, particles: any[], squashY: number) => {
      if (!ref.current) return;
      particles.forEach((p, i) => {
        // Move backwards along the curve (t=1 is far, t=0 is near)
        p.offset -= p.speed * delta * 0.1;
        if (p.offset < 0) {
          p.offset += 1;
          // Randomize spread when respawning for variety
          p.spreadX = (Math.random() - 0.5) * 6;
          p.spreadY = (Math.random() - 0.5) * 6;
        }

        // Get position on the curve
        const pos = veinCurve.getPointAt(p.offset);
        
        // Add organic wobble and spread
        const wobbleX = Math.sin(time * p.wobbleSpeed + i) * 0.5;
        const wobbleY = Math.cos(time * p.wobbleSpeed + i) * 0.5;
        
        // Update rotations (much slower and randomized)
        p.rotation.x += delta * p.rotSpeed;
        p.rotation.y += delta * p.rotSpeed;

        dummy.position.set(pos.x + p.spreadX + wobbleX, pos.y + p.spreadY + wobbleY, pos.z);
        dummy.rotation.set(p.rotation.x, p.rotation.y, p.rotation.z);
        dummy.scale.set(p.scale, p.scale * squashY, p.scale);
        dummy.updateMatrix();
        ref.current.setMatrixAt(i, dummy.matrix);
      });
      ref.current.instanceMatrix.needsUpdate = true;
    };

    updateMesh(rbcRef, rbcs, 0.4); // Red blood cells are squashed (biconcave)
    updateMesh(wbcRef, wbcs, 1.0); // White blood cells are spherical
    updateMesh(platRef, plats, 0.6); // Platelets are small and slightly squashed
  });

  return (
    <>
      {/* Red Blood Cells (Erythrocytes) */}
      <instancedMesh ref={rbcRef} args={[undefined, undefined, rbcCount]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial 
          color="#ef4444" 
          roughness={0.2} 
          metalness={0.1}
          clearcoat={1} 
          clearcoatRoughness={0.2}
        />
      </instancedMesh>

      {/* White Blood Cells (Leukocytes) */}
      <instancedMesh ref={wbcRef} args={[undefined, undefined, wbcCount]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial 
          color="#f8fafc"
          emissive="#e2e8f0"
          emissiveIntensity={0.2}
          roughness={0.8} 
          metalness={0.1}
          clearcoat={0.5} 
          transmission={0.2}
        />
      </instancedMesh>

      {/* Platelets (Thrombocytes) */}
      <instancedMesh ref={platRef} args={[undefined, undefined, platCount]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshPhysicalMaterial 
          color="#fef08a" // Pale yellow/white (platelets)
          roughness={0.3} 
          metalness={0.1}
          clearcoat={0.5}
        />
      </instancedMesh>
    </>
  );
}

function MicroscopicVein() {
  const heartLight = useRef<any>(null);

  useFrame((state) => {
    if (heartLight.current) {
      const time = state.clock.elapsedTime * 1.2; // Slower, calmer heartbeat
      const beat = Math.pow(Math.sin(time * Math.PI), 8) + Math.pow(Math.sin(time * Math.PI + 0.3), 8) * 0.5;
      heartLight.current.intensity = 1 + beat * 2;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 0]} />
      {/* Dense deep-red fog for a realistic visceral/microscopic depth of field */}
      <fog attach="fog" args={['#4c0519', 2, 25]} />
      
      <ambientLight intensity={1.5} color="#fda4af" />
      <directionalLight position={[0, 0, -5]} intensity={3} color="#fca5a5" />
      <pointLight ref={heartLight} position={[0, 0, -5]} color="#ef4444" distance={20} />

      {/* The Organic, Wet, Curved Vein Wall */}
      <mesh>
        <tubeGeometry args={[veinCurve, 100, 5.5, 32, false]} />
        <MeshDistortMaterial 
          color="#7f1d1d" 
          emissive="#450a0a"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.2}
          side={THREE.BackSide} 
          distort={0.45}
          speed={0.6}
        />
      </mesh>

      {/* Flowing Blood Components */}
      <BloodParticles />
    </>
  );
}

// --- Main Landing Page Component ---
interface LandingPageProps {
  onNavigateToAuth: (mode: 'login' | 'register') => void;
}

export default function LandingPage({ onNavigateToAuth }: LandingPageProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="landing-container">
      {/* Dark Mode Celestial Orb (Moon) */}
      {theme === 'dark' && (
        <div className="moon-orb-container" style={{ position: 'absolute', pointerEvents: 'none' }}>
          <CelestialOrb3D theme="dark" />
        </div>
      )}

      {/* Theme Toggle Button */}
      <button 
        onClick={toggleTheme}
        className="landing-theme-toggle"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun size={24} /> : <MoonIcon size={24} />}
      </button>

      {/* 3D Background */}
      <div className="canvas-container">
        <Canvas>
          {theme === 'dark' ? <ParticleBackground /> : <MicroscopicVein />}
        </Canvas>
      </div>

      {/* UI Content overlay */}
      <div className="landing-content">
        <motion.div
          className="hero-card"
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="logo-badge"
          >
            MedSim AI
          </motion.div>
          
          <h1 className="hero-title">
            Geleceğin <span className="highlight">Tıp Eğitimi</span>
          </h1>
          <p className="hero-subtitle">
            Yapay zeka destekli, prosedürel ve sonsuz medikal simülasyonlarla klinik karar verme becerilerinizi kusursuzlaştırın.
          </p>

          <div className="action-buttons">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary-large"
              onClick={() => onNavigateToAuth('register')}
            >
              Hemen Başla
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-secondary-large"
              onClick={() => onNavigateToAuth('login')}
            >
              Giriş Yap
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
