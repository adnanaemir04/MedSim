'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';
import { motion } from 'framer-motion';

// --- 3D Background Component ---
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
  );
}

// --- Main Landing Page Component ---
interface LandingPageProps {
  onNavigateToAuth: (mode: 'login' | 'register') => void;
}

export default function LandingPage({ onNavigateToAuth }: LandingPageProps) {
  return (
    <div className="landing-container">
      {/* 3D Background */}
      <div className="canvas-container">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <ParticleBackground />
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
