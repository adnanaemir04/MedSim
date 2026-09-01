'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, PerspectiveCamera, Torus, MeshDistortMaterial, Float } from '@react-three/drei';
import * as random from 'maath/random';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { 
  Sun, MoonIcon, BrainCircuit, Sparkles, Activity, 
  Stethoscope, ChevronRight, CheckCircle2, ShieldCheck, 
  HeartPulse, ArrowRight, BookOpen, BarChart3, Award 
} from 'lucide-react';
import CelestialOrb3D from '../layout/CelestialOrb3D';
import * as THREE from 'three';

// --- DARK MODE: 3D Particle Background ---
function ParticleBackground(props: any) {
  const ref = useRef<any>(null);
  const [sphere] = useState(() => {
    const array = new Float32Array(5001);
    // @ts-ignore
    random.inSphere(array, { radius: 1.5 });
    return array;
  });

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

  // Create a realistic biconcave erythrocyte geometry using LatheGeometry (revolving 2D profile)
  const rbcGeometry = React.useMemo(() => {
    const points = [];
    // A realistic cross-section profile of a red blood cell (thin in middle, thick on rims)
    points.push(new THREE.Vector2(0, 0.15));
    points.push(new THREE.Vector2(0.2, 0.18));
    points.push(new THREE.Vector2(0.5, 0.28));
    points.push(new THREE.Vector2(0.8, 0.42)); // Outer thick rim top
    points.push(new THREE.Vector2(0.95, 0.3));  // Outer edge curve
    points.push(new THREE.Vector2(1.0, 0));     // Outer edge mid-point
    points.push(new THREE.Vector2(0.95, -0.3));
    points.push(new THREE.Vector2(0.8, -0.42)); // Outer thick rim bottom
    points.push(new THREE.Vector2(0.5, -0.28));
    points.push(new THREE.Vector2(0.2, -0.18));
    points.push(new THREE.Vector2(0, -0.15));
    return new THREE.LatheGeometry(points, 32);
  }, []);

  // Generate procedural microvilli (small hair-like bumps) for white blood cells
  const wbcBumpTexture = React.useMemo(() => {
    if (typeof window === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 256, 256);
    
    // Draw 1000 tiny bumps to represent microvilli
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const radius = 2 + Math.random() * 3;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(1, '#808080');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }, []);

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
        
        // Handle potential large delta or wrap around
        while (p.offset < 0) {
          p.offset += 1;
          // Randomize spread when respawning for variety
          p.spreadX = (Math.random() - 0.5) * 6;
          p.spreadY = (Math.random() - 0.5) * 6;
        }
        while (p.offset > 1) p.offset -= 1;

        // Ensure offset is strictly valid before getPointAt
        const safeOffset = Math.max(0, Math.min(1, p.offset || 0));
        const pos = veinCurve.getPointAt(safeOffset);
        
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

    updateMesh(rbcRef, rbcs, 1.0); // RBC geometry is already biconcave, no extra squash needed
    updateMesh(wbcRef, wbcs, 1.0); // White blood cells are spherical
    updateMesh(platRef, plats, 0.6); // Platelets are small and slightly squashed
  });

  return (
    <>
      {/* Red Blood Cells (Erythrocytes) - Beautiful realistic biconcave shape with physical transmission */}
      <instancedMesh ref={rbcRef} args={[rbcGeometry, undefined, rbcCount]}>
        <meshPhysicalMaterial 
          color="#be123c" 
          roughness={0.15} 
          metalness={0.05}
          transmission={0.45} /* Light passes through the cell membrane */
          thickness={0.8}     /* Refraction thickness */
          ior={1.38}          /* Index of refraction for organic cells */
          clearcoat={0.6} 
          clearcoatRoughness={0.2}
        />
      </instancedMesh>

      {/* White Blood Cells (Leukocytes) - Clean glowing spherical cells */}
      <instancedMesh ref={wbcRef} args={[undefined, undefined, wbcCount]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          emissive="#e0f2fe"
          emissiveIntensity={0.3}
          roughness={0.4} 
          metalness={0.05}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
        />
      </instancedMesh>

      {/* Platelets (Thrombocytes) - Clean small warm pinkish-white particles */}
      <instancedMesh ref={platRef} args={[undefined, undefined, platCount]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshPhysicalMaterial 
          color="#fee2e2" 
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

// --- Main Landing Page Component (Human-Crafted 2-Column Clinical Studio Layout) ---
interface LandingPageProps {
  onNavigateToAuth?: (mode: 'login' | 'register') => void;
  isAuthenticated?: boolean;
  onNavigateToDashboard?: () => void;
}

export default function LandingPage({ onNavigateToAuth, isAuthenticated, onNavigateToDashboard }: LandingPageProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  // Interactive Clinical Studio State
  const [studioMode, setStudioMode] = useState<'vaka' | 'tus' | 'analiz'>('vaka');
  const [activeStep, setActiveStep] = useState<'anamnez' | 'ekg' | 'troponin' | 'tani'>('anamnez');
  const [selectedTusChoice, setSelectedTusChoice] = useState<number | null>(null);

  return (
    <div className="landing-container" style={{ overflowY: 'auto' }}>
      {/* Dark Mode Celestial Orb (Moon) */}
      {isDark && (
        <div className="moon-orb-container" style={{ position: 'absolute', pointerEvents: 'none' }}>
          <CelestialOrb3D theme="dark" />
        </div>
      )}

      {/* 3D Background */}
      <div className="canvas-container" style={{ position: 'fixed' }}>
        <Canvas>
          {isDark ? <ParticleBackground /> : <MicroscopicVein />}
        </Canvas>
      </div>

      {/* Main Foreground Container */}
      <div className="landing-content">
        
        {/* Modern Human-Designed Glass Navbar */}
        <motion.nav 
          className="landing-nav"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: isDark ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : 'linear-gradient(135deg, #e11d48, #be123c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: isDark ? '0 4px 12px rgba(59, 130, 246, 0.4)' : '0 4px 12px rgba(225, 29, 72, 0.3)'
            }}>
              <Stethoscope size={20} />
            </div>
            <div>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                MedSim<span style={{ color: isDark ? '#60a5fa' : '#e11d48' }}>.ai</span>
              </span>
            </div>
          </div>

          {/* Center Feature Pills (Desktop) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }} className="nav-center-pills">
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <BrainCircuit size={16} color={isDark ? '#60a5fa' : '#e11d48'} /> 45+ Klinik Branş
            </span>
            <span style={{ color: 'var(--glass-border)', opacity: 0.6 }}>•</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <BookOpen size={16} color={isDark ? '#34d399' : '#059669'} /> 12.100+ TUS İncisi
            </span>
            <span style={{ color: 'var(--glass-border)', opacity: 0.6 }}>•</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <BarChart3 size={16} color={isDark ? '#fbbf24' : '#d97706'} /> AI Karar Motoru
            </span>
          </div>

          {/* Right Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <button
              onClick={toggleTheme}
              style={{
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                border: '1px solid var(--glass-border)',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDark ? '#fbbf24' : '#e11d48',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={18} /> : <MoonIcon size={18} />}
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => onNavigateToDashboard && onNavigateToDashboard()}
                style={{
                  background: isDark ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : 'linear-gradient(135deg, #e11d48, #be123c)',
                  color: 'white',
                  border: 'none',
                  padding: '0.55rem 1.2rem',
                  borderRadius: '999px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  boxShadow: isDark ? '0 4px 15px rgba(59, 130, 246, 0.3)' : '0 4px 15px rgba(225, 29, 72, 0.3)'
                }}
              >
                Simülasyona Dön ➔
              </button>
            ) : (
              <>
                <button
                  onClick={() => onNavigateToAuth && onNavigateToAuth('login')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    padding: '0.55rem 1rem'
                  }}
                >
                  Giriş Yap
                </button>
                <button
                  onClick={() => onNavigateToAuth && onNavigateToAuth('register')}
                  style={{
                    background: isDark ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : 'linear-gradient(135deg, #e11d48, #be123c)',
                    color: 'white',
                    border: 'none',
                    padding: '0.55rem 1.3rem',
                    borderRadius: '999px',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: isDark ? '0 4px 15px rgba(59, 130, 246, 0.4)' : '0 4px 15px rgba(225, 29, 72, 0.35)'
                  }}
                >
                  Ücretsiz Başla ➔
                </button>
              </>
            )}
          </div>
        </motion.nav>

        {/* 2-Column Asymmetric Hero Section */}
        <div className="landing-hero-grid" style={{ marginBottom: '3rem' }}>
          
          {/* Left Column: Editorial & Value Proposition */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ textAlign: 'left' }}
          >
            {/* Live Indicator Eyebrow */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 1rem', borderRadius: '999px', background: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(225, 29, 72, 0.08)', border: isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(225, 29, 72, 0.2)', marginBottom: '1.5rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 10px #10b981', animation: 'pulse 1.8s infinite' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: isDark ? '#60a5fa' : '#be123c', letterSpacing: '0.04em' }}>
                YENİ NESİL HEKİMLİK & TUS STANDARDI
              </span>
            </div>

            {/* Editorial Main Title */}
            <h1 style={{
              fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              margin: '0 0 1.2rem 0',
              color: isDark ? '#f8fafc' : '#0f172a'
            }}>
              Klinik Reflekslerinizi <br />
              <span style={{
                background: isDark 
                  ? 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)' 
                  : 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Yapay Zekayla
              </span> Şekillendirin.
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: '1.12rem',
              lineHeight: 1.65,
              color: isDark ? '#cbd5e1' : '#334155',
              fontWeight: 500,
              margin: '0 0 2rem 0',
              maxWidth: '540px'
            }}>
              Gerçekçi hasta anamnezleri, 12 derste 12.000'den fazla klasikleşmiş hap bilgi ve yapay zeka destekli performans analitiğiyle tıp eğitiminizi ve TUS hazırlığınızı kusursuzlaştırın.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              {isAuthenticated ? (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onNavigateToDashboard && onNavigateToDashboard()}
                  style={{
                    background: isDark ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : 'linear-gradient(135deg, #e11d48, #be123c)',
                    color: 'white',
                    border: 'none',
                    padding: '1rem 2rem',
                    borderRadius: '16px',
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    boxShadow: isDark ? '0 10px 25px rgba(59, 130, 246, 0.4)' : '0 10px 25px rgba(225, 29, 72, 0.3)'
                  }}
                >
                  Simülasyon Paneline Git <ArrowRight size={18} />
                </motion.button>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onNavigateToAuth && onNavigateToAuth('register')}
                    style={{
                      background: isDark ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : 'linear-gradient(135deg, #e11d48, #be123c)',
                      color: 'white',
                      border: 'none',
                      padding: '1rem 2rem',
                      borderRadius: '16px',
                      fontWeight: 800,
                      fontSize: '1.05rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      boxShadow: isDark ? '0 10px 25px rgba(59, 130, 246, 0.4)' : '0 10px 25px rgba(225, 29, 72, 0.35)'
                    }}
                  >
                    Ücretsiz Simülasyona Başla <ArrowRight size={18} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onNavigateToAuth && onNavigateToAuth('login')}
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.85)',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      border: '1px solid var(--glass-border)',
                      padding: '1rem 1.6rem',
                      borderRadius: '16px',
                      fontWeight: 700,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    Giriş Yap
                  </motion.button>
                </>
              )}
            </div>

            {/* Quick Metrics Strip */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--glass-border)'
            }}>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: isDark ? '#f8fafc' : '#0f172a' }}>12.100+</div>
                <div style={{ fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#475569', fontWeight: 700 }}>TUS İncisi & Soru</div>
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: isDark ? '#f8fafc' : '#0f172a' }}>45+</div>
                <div style={{ fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#475569', fontWeight: 700 }}>Klinik Branş</div>
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10b981' }}>%100</div>
                <div style={{ fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#475569', fontWeight: 700 }}>Çeldirici Doğruluğu</div>
              </div>
            </div>

          </motion.div>

          {/* Right Column: "MedSim Studio Cockpit" (Interactive Clinical Terminal) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="cockpit-window"
          >
            {/* macOS Window Titlebar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.9rem 1.2rem',
              background: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(241, 245, 249, 0.85)',
              borderBottom: '1px solid var(--glass-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#f59e0b' }} />
                <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#10b981' }} />
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Activity size={15} color={isDark ? '#60a5fa' : '#e11d48'} /> medsim.clinical-cockpit.ai
              </div>
              <div style={{ width: '40px' }} />
            </div>

            {/* Mode Switcher Tabs inside the Cockpit */}
            <div style={{ padding: '1.2rem 1.2rem 0 1.2rem' }}>
              <div style={{
                display: 'flex',
                background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.06)',
                padding: '0.35rem',
                borderRadius: '14px',
                gap: '0.35rem'
              }}>
                <button
                  onClick={() => setStudioMode('vaka')}
                  style={{
                    flex: 1,
                    padding: '0.55rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: studioMode === 'vaka' ? (isDark ? '#3b82f6' : '#e11d48') : 'transparent',
                    color: studioMode === 'vaka' ? '#ffffff' : (isDark ? '#94a3b8' : '#475569'),
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: studioMode === 'vaka' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'
                  }}
                >
                  🩺 Acil Vaka
                </button>
                <button
                  onClick={() => setStudioMode('tus')}
                  style={{
                    flex: 1,
                    padding: '0.55rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: studioMode === 'tus' ? (isDark ? '#3b82f6' : '#e11d48') : 'transparent',
                    color: studioMode === 'tus' ? '#ffffff' : (isDark ? '#94a3b8' : '#475569'),
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: studioMode === 'tus' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'
                  }}
                >
                  🧬 TUS Hap Bilgi
                </button>
                <button
                  onClick={() => setStudioMode('analiz')}
                  style={{
                    flex: 1,
                    padding: '0.55rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: studioMode === 'analiz' ? (isDark ? '#3b82f6' : '#e11d48') : 'transparent',
                    color: studioMode === 'analiz' ? '#ffffff' : (isDark ? '#94a3b8' : '#475569'),
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: studioMode === 'analiz' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'
                  }}
                >
                  📊 AI Radar
                </button>
              </div>
            </div>

            {/* Dynamic Cockpit Content */}
            <div style={{ padding: '1.2rem', textAlign: 'left' }}>
              <AnimatePresence mode="wait">
                
                {studioMode === 'vaka' && (
                  <motion.div
                    key="vaka"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    {/* Patient Vital Sign Monitor Banner */}
                    <div style={{
                      background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.9)',
                      borderRadius: '16px',
                      padding: '1rem',
                      border: '1px solid var(--glass-border)',
                      marginBottom: '1rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.7rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
                          👤 HASTA: E.K. (54 Yaş, Erkek)
                        </span>
                        <span style={{ fontSize: '0.72rem', background: 'rgba(239, 68, 68, 0.15)', color: '#dc2626', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: 800, border: '1px solid rgba(239,68,68,0.2)' }}>
                          TRİYAJ: ACİL (KIRMIZI ALAN)
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                        <div style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(241,245,249,0.8)', padding: '0.5rem 0.2rem', borderRadius: '10px' }}>
                          <div style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 700 }}>NABIZ</div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#dc2626' }}>84 bpm</div>
                        </div>
                        <div style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(241,245,249,0.8)', padding: '0.5rem 0.2rem', borderRadius: '10px' }}>
                          <div style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 700 }}>TANSİYON</div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#0284c7' }}>135/85</div>
                        </div>
                        <div style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(241,245,249,0.8)', padding: '0.5rem 0.2rem', borderRadius: '10px' }}>
                          <div style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 700 }}>SPO2</div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#16a34a' }}>%98</div>
                        </div>
                        <div style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(241,245,249,0.8)', padding: '0.5rem 0.2rem', borderRadius: '10px' }}>
                          <div style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 700 }}>ATEŞ</div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#d97706' }}>36.8 °C</div>
                        </div>
                      </div>
                    </div>

                    {/* Step Action Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginBottom: '1rem' }}>
                      {[
                        { id: 'anamnez', label: '1. Anamnez' },
                        { id: 'ekg', label: '2. EKG' },
                        { id: 'troponin', label: '3. Troponin' },
                        { id: 'tani', label: '4. Teşhis' }
                      ].map((step) => {
                        const isStepActive = activeStep === step.id;
                        let btnBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)';
                        let btnColor = isDark ? '#cbd5e1' : '#334155';
                        let btnBorder = '1px solid var(--glass-border)';

                        if (isStepActive) {
                          btnBg = isDark ? '#3b82f6' : '#e11d48';
                          btnColor = '#ffffff';
                          btnBorder = isDark ? '1px solid #3b82f6' : '1px solid #e11d48';
                        }

                        return (
                          <button
                            key={step.id}
                            onClick={() => setActiveStep(step.id as any)}
                            style={{
                              padding: '0.55rem 0.2rem',
                              borderRadius: '8px',
                              border: btnBorder,
                              background: btnBg,
                              color: btnColor,
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            {step.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Step Content Preview Box */}
                    <div style={{
                      background: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.85)',
                      borderRadius: '14px',
                      padding: '1.1rem',
                      borderLeft: isDark ? '4px solid #3b82f6' : '4px solid #e11d48',
                      fontSize: '0.9rem',
                      lineHeight: 1.55,
                      color: isDark ? '#f8fafc' : '#0f172a',
                      border: '1px solid var(--glass-border)'
                    }}>
                      {activeStep === 'anamnez' && (
                        <div>
                          <strong style={{ color: isDark ? '#60a5fa' : '#e11d48' }}>Hasta Şikayeti:</strong> &quot;Yaklaşık 1 saat önce göğsümün ortasında baskı tarzında, sol omzuma yayılan şiddetli bir ağrı başladı. Beraberinde soğuk terleme ve nefes darlığı mevcut.&quot;
                        </div>
                      )}
                      {activeStep === 'ekg' && (
                        <div>
                          <strong style={{ color: isDark ? '#60a5fa' : '#e11d48' }}>12 Derivasyonlu EKG:</strong> V1-V4 derivasyonlarında 3 mm ST elevasyonu ve II, III, aVF'de resiprokal ST çökmesi izlendi. <em>(Akut Anterior STEMI)</em>
                        </div>
                      )}
                      {activeStep === 'troponin' && (
                        <div>
                          <strong style={{ color: isDark ? '#60a5fa' : '#e11d48' }}>Acil Biyokimya:</strong> Yüksek duyarlıklı Troponin I: 3.450 ng/L (&lt; 14 ng/L). CK-MB: 52 U/L.
                        </div>
                      )}
                      {activeStep === 'tani' && (
                        <div>
                          <strong style={{ color: '#16a34a' }}>Klinik Yönetim:</strong> Akut Koroner Sendrom protokolü devreye sokuldu. Çift antiagregan + Heparin başlandı ve hasta acil Primer PCI (Anjiyo) salonuna yönlendirildi! 🎉
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {studioMode === 'tus' && (
                  <motion.div
                    key="tus"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: isDark ? '#60a5fa' : '#e11d48', marginBottom: '0.5rem' }}>
                      📚 ANATOMİ KLASİKLEŞMİŞ TUS SORUSU
                    </div>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.92rem', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a', lineHeight: 1.45 }}>
                      Humerus cisim (gövde) kırıklarında sulcus nervi radialis içinde en sık hasarlanan sinir ve ortaya çıkan klinik tablo hangisidir?
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                      {[
                        { text: "A) N. medianus — Maymun Eli", correct: false },
                        { text: "B) N. ulnaris — Pençe El", correct: false },
                        { text: "C) N. radialis — Düşük El", correct: true },
                        { text: "D) N. axillaris — Omuz Abduksiyon Kaybı", correct: false }
                      ].map((opt, idx) => {
                        const isChosen = selectedTusChoice === idx;
                        let bg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)';
                        let border = '1px solid var(--glass-border)';
                        let textColor = isDark ? '#f8fafc' : '#0f172a';

                        if (isChosen) {
                          if (opt.correct) {
                            bg = isDark ? 'rgba(16, 185, 129, 0.25)' : '#dcfce7';
                            border = '1px solid #16a34a';
                            textColor = isDark ? '#34d399' : '#14532d';
                          } else {
                            bg = isDark ? 'rgba(239, 68, 68, 0.25)' : '#fee2e2';
                            border = '1px solid #dc2626';
                            textColor = isDark ? '#f87171' : '#7f1d1d';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedTusChoice(idx)}
                            style={{
                              padding: '0.7rem 0.9rem',
                              borderRadius: '10px',
                              border,
                              background: bg,
                              color: textColor,
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              textAlign: 'left',
                              transition: 'all 0.2s',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                            }}
                          >
                            {opt.text}
                          </button>
                        );
                      })}
                    </div>

                    {selectedTusChoice !== null && (
                      <div style={{
                        padding: '0.9rem',
                        borderRadius: '12px',
                        background: selectedTusChoice === 2 ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#dcfce7') : (isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2'),
                        border: `1px solid ${selectedTusChoice === 2 ? '#16a34a' : '#dc2626'}`,
                        fontSize: '0.85rem',
                        color: selectedTusChoice === 2 ? (isDark ? '#34d399' : '#14532d') : (isDark ? '#f87171' : '#7f1d1d'),
                        lineHeight: 1.5
                      }}>
                        {selectedTusChoice === 2 ? (
                          <span>✅ <strong>Tebrikler!</strong> Humerus cisim kırıklarında n. radialis yaralanır ve ekstansör kas inervasyonu kaybolduğu için &quot;Düşük El&quot; gelişir.</span>
                        ) : (
                          <span>❌ <strong>Yanlış Cevap!</strong> Doğru yanıt C şıkkıdır. Humerus kırıklarında en sık hasarlanan sinir n. radialis'tir.</span>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {studioMode === 'analiz' && (
                  <motion.div
                    key="analiz"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981' }}>📊 KİŞİSEL BRANŞ GELİŞİMİ</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>Tahmini TUS: 74.2</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem', color: isDark ? '#f8fafc' : '#0f172a' }}>
                          <span>Dahiliye & Acil</span>
                          <span style={{ color: '#16a34a' }}>%94</span>
                        </div>
                        <div style={{ height: '8px', background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: '94%', height: '100%', background: '#16a34a', borderRadius: '4px' }} />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem', color: isDark ? '#f8fafc' : '#0f172a' }}>
                          <span>Anatomi & Fizyoloji</span>
                          <span style={{ color: isDark ? '#60a5fa' : '#e11d48' }}>%88</span>
                        </div>
                        <div style={{ height: '8px', background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: '88%', height: '100%', background: isDark ? '#60a5fa' : '#e11d48', borderRadius: '4px' }} />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.3rem', color: isDark ? '#f8fafc' : '#0f172a' }}>
                          <span>Farmakoloji & Biyokimya</span>
                          <span style={{ color: '#d97706' }}>%91</span>
                        </div>
                        <div style={{ height: '8px', background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: '91%', height: '100%', background: '#d97706', borderRadius: '4px' }} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

          </motion.div>

        </div>

        {/* 3 Human-Designed Pillar Cards (Bento Strip) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          width: '100%',
          marginBottom: '2.5rem'
        }}>
          
          <div style={{
            background: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(30px)',
            padding: '1.8rem',
            borderRadius: '24px',
            border: '1px solid var(--glass-border)',
            textAlign: 'left',
            boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(225, 29, 72, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDark ? '#60a5fa' : '#e11d48',
              marginBottom: '1.2rem'
            }}>
              <BrainCircuit size={24} />
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
              Prosedürel Klinik Simülatör
            </h3>
            <p style={{ margin: 0, fontSize: '0.92rem', color: isDark ? '#cbd5e1' : '#334155', lineHeight: 1.6, fontWeight: 500 }}>
              45 farklı uzmanlık alanında yapay zeka tarafından anlık üretilen, her biri özgün anamnez ve laboratuvar sonuçları içeren 10 aşamalı hasta senaryoları.
            </p>
          </div>

          <div style={{
            background: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(30px)',
            padding: '1.8rem',
            borderRadius: '24px',
            border: '1px solid var(--glass-border)',
            textAlign: 'left',
            boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#16a34a',
              marginBottom: '1.2rem'
            }}>
              <Sparkles size={24} />
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
              12.100+ TUS İncisi & Soru
            </h3>
            <p style={{ margin: 0, fontSize: '0.92rem', color: isDark ? '#cbd5e1' : '#334155', lineHeight: 1.6, fontWeight: 500 }}>
              Tüm derslerde sıfır tekrar ve eşit uzunlukta şık kuralına göre özel olarak taranmış, nokta atışı hap bilgiler ve yüksek çeldiricili sınav soruları.
            </p>
          </div>

          <div style={{
            background: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(30px)',
            padding: '1.8rem',
            borderRadius: '24px',
            border: '1px solid var(--glass-border)',
            textAlign: 'left',
            boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#d97706',
              marginBottom: '1.2rem'
            }}>
              <Award size={24} />
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>
              Yapay Zeka Performans Koçu
            </h3>
            <p style={{ margin: 0, fontSize: '0.92rem', color: isDark ? '#cbd5e1' : '#334155', lineHeight: 1.6, fontWeight: 500 }}>
              Hangi branşta ne kadar isabetli tanı koyduğunuzu ve zayıf kaldığınız patolojileri analiz eden kişiselleştirilmiş öğrenme ve skor tahmin algoritması.
            </p>
          </div>

        </div>

        {/* Global Multi-Language Quotes Carousel (Bottom Refined Editorial Strip) */}
        <QuoteCarousel isDark={isDark} />

      </div>
    </div>
  );
}

const quotes = [
  "Bilgi, evrendeki yıldızlar ve damarlardaki hücreler gibi sonsuzdur.",
  "Knowledge is as infinite as the stars in the universe and the cells in your veins.",
  "El conocimiento es tan infinito como las estrellas en el universo y las células en las venas.",
  "La connaissance est aussi infinie que les étoiles dans l'univers et les cellules dans les veines.",
  "Wissen ist so unendlich wie die Sterne im Universum und die Zellen in den Blutgefäßen.",
  "La conoscenza è infinita come le stelle nell'universo e le cellule nelle vene.",
  "Cognitio infinita est sicut stellae in universo et cellulae in venis.",
  "知識は、宇宙の星々や血管内の細胞のように無限です。",
  "Знания так же бесконечны, как звезды во Вселенной и клетки в венах.",
  "المعرفة لا حصر لها مثل النجوم في الكون والخلايا في الأوردة."
];

function QuoteCarousel({ isDark }: { isDark?: boolean }) {
  const [index, setIndex] = useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % quotes.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ 
      marginTop: '1.5rem', 
      marginBottom: '1rem',
      minHeight: '48px',
      position: 'relative', 
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0.5rem 1.5rem',
      borderRadius: '16px',
      background: isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.65)',
      border: '1px solid var(--glass-border)',
      backdropFilter: 'blur(16px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
    }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem'
          }}
        >
          <span style={{ fontSize: '0.95rem', color: isDark ? '#60a5fa' : '#e11d48' }}>✨</span>
          <p style={{
            fontSize: '0.94rem', 
            fontStyle: 'italic', 
            fontWeight: 600,
            textAlign: 'center',
            lineHeight: '1.5',
            margin: 0,
            maxWidth: '720px',
            color: isDark ? '#e2e8f0' : '#1e293b'
          }}>
            &quot;{quotes[index]}&quot;
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
