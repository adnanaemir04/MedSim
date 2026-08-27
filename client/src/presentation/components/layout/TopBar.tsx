'use client';

import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun, Home, CreditCard, X, AlertTriangle } from 'lucide-react';
import CelestialOrb3D from './CelestialOrb3D';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopBar({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const handleToggle = () => {
    toggleTheme();
  };

  const [showDisclaimer, setShowDisclaimer] = useState(false);

  return (
    <>
      <header className="topbar" style={{ justifyContent: 'space-between', padding: '1rem 2rem' }}>
        {/* Navigation Links */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <motion.button
            onClick={() => onNavigate && onNavigate('landing')}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              padding: '0.5rem 1rem', borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border)',
              color: 'var(--text-main)', fontWeight: 600, fontSize: '0.9rem',
              cursor: 'pointer', transition: 'var(--transition)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--primary)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = 'transparent';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = 'var(--text-main)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <Home size={16} />
            Anasayfa
          </motion.button>

          <motion.button 
            onClick={() => onNavigate && onNavigate('subscription')}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              padding: '0.5rem 1rem', borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.2))',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#d97706', fontWeight: 600, fontSize: '0.9rem',
              cursor: 'pointer', transition: 'var(--transition)',
              position: 'relative', overflow: 'hidden'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.2))';
              e.currentTarget.style.color = '#d97706';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Shimmer sweep on hover */}
            <motion.span
              style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
                transform: 'translateX(-100%)',
                pointerEvents: 'none'
              }}
              whileHover={{ transform: 'translateX(200%)' }}
              transition={{ duration: 0.55, ease: 'easeInOut' }}
            />
            <CreditCard size={16} />
            Abonelik Planları
          </motion.button>

          {/* Medical Disclaimer */}
          <AnimatePresence mode="wait">
            {showDisclaimer ? (
              <motion.div
                key="disclaimer-open"
                initial={{ opacity: 0, x: -20, scaleX: 0.85 }}
                animate={{ opacity: 1, x: 0, scaleX: 1 }}
                exit={{ opacity: 0, x: -20, scaleX: 0.85 }}
                transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                style={{
                  marginLeft: '2rem',
                  padding: '0.75rem 1.25rem',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderLeft: '4px solid #ef4444',
                  borderRadius: '12px',
                  maxWidth: '650px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 20px rgba(239, 68, 68, 0.12), 0 0 0 0 rgba(239,68,68,0)'
                }}
              >
                <motion.div
                  animate={{ rotate: [0, -8, 8, -6, 6, 0] }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                >
                  <AlertTriangle size={24} color="#ef4444" style={{ flexShrink: 0 }} />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500, lineHeight: 1.5, flex: 1 }}
                >
                  <span style={{ color: '#ef4444', fontWeight: 800 }}>Tıbbi Simülasyon Uyarısı:</span> Bu platformdaki senaryo ve kararlar tamamen <strong style={{ color: '#f87171' }}>yapay zeka</strong> tarafından oluşturulur. Gerçek tıbbi teşhis/tedavi referansı olarak <strong style={{ textDecoration: 'underline' }}>kullanılamaz</strong>.
                </motion.p>
                <motion.button 
                  onClick={() => setShowDisclaimer(false)}
                  whileHover={{ scale: 1.15, background: 'rgba(239, 68, 68, 0.25)' }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)', border: 'none',
                    color: '#ef4444', cursor: 'pointer', padding: '0.25rem',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s'
                  }}
                  aria-label="Kapat"
                >
                  <X size={16} />
                </motion.button>
              </motion.div>
            ) : (
              <motion.button
                key="disclaimer-closed"
                onClick={() => setShowDisclaimer(true)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  marginLeft: '2rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '12px',
                  color: '#ef4444',
                  fontWeight: 600, fontSize: '0.85rem',
                  cursor: 'pointer', transition: 'all 0.2s',
                  backdropFilter: 'blur(5px)',
                  position: 'relative'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
              >
                <motion.div
                  animate={{ rotate: [0, -5, 5, -3, 3, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 3 }}
                >
                  <AlertTriangle size={16} />
                </motion.div>
                Simülasyon Uyarısı
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="topbar-actions">
          <motion.button 
            className="theme-toggle" 
            onClick={handleToggle}
            aria-label="Toggle Theme"
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {isDarkMode ? (
                <motion.span key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.25 }}>
                  <Sun size={20} />
                </motion.span>
              ) : (
                <motion.span key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.25 }}>
                  <Moon size={20} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </header>
      
      {/* The Animated Background Orb (WebGL Moon for Dark Mode, CSS Sun for Light Mode) */}
      {isDarkMode ? (
        <div key="dark-orb" className="flying-orb moon-orb-container">
          <CelestialOrb3D theme="dark" />
        </div>
      ) : (
        <div key="light-orb" className="flying-orb sun-orb" />
      )}
    </>
  );
}
