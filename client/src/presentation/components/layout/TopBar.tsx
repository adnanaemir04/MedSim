'use client';

import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun, Home, CreditCard, X, AlertTriangle } from 'lucide-react';
import CelestialOrb3D from './CelestialOrb3D';

export default function TopBar({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const handleToggle = () => {
    toggleTheme();
  };

  const [showDisclaimer, setShowDisclaimer] = useState(true);

  return (
    <>
      <header className="topbar" style={{ justifyContent: 'space-between', padding: '1rem 2rem' }}>
        {/* Navigation Links */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={() => onNavigate && onNavigate('dashboard')}
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
          </button>
          <button 
            onClick={() => onNavigate && onNavigate('subscription')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              padding: '0.5rem 1rem', borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.2))',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#d97706', fontWeight: 600, fontSize: '0.9rem',
              cursor: 'pointer', transition: 'var(--transition)'
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
            <CreditCard size={16} />
            Abonelik Planları
          </button>

          {/* Medical Disclaimer */}
          {showDisclaimer ? (
            <div style={{
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
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
            }}>
              <AlertTriangle size={24} color="#ef4444" style={{ flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500, lineHeight: 1.5, flex: 1 }}>
                <span style={{ color: '#ef4444', fontWeight: 800 }}>Tıbbi Simülasyon Uyarısı:</span> Bu platformdaki senaryo ve kararlar tamamen <strong style={{ color: '#f87171' }}>yapay zeka</strong> tarafından oluşturulur. Gerçek tıbbi teşhis/tedavi referansı olarak <strong style={{ textDecoration: 'underline' }}>kullanılamaz</strong>.
              </p>
              <button 
                onClick={() => setShowDisclaimer(false)}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)', border: 'none',
                  color: '#ef4444', cursor: 'pointer', padding: '0.25rem',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                aria-label="Kapat"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowDisclaimer(true)}
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
                backdropFilter: 'blur(5px)'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
            >
              <AlertTriangle size={16} />
              Simülasyon Uyarısı
            </button>
          )}
        </div>

        <div className="topbar-actions">
          <button 
            className="theme-toggle" 
            onClick={handleToggle}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
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
