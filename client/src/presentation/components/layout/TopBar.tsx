'use client';

import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun, Home, CreditCard } from 'lucide-react';
import { useState } from 'react';

export default function TopBar() {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [sunAnimationKey, setSunAnimationKey] = useState(0);

  const handleToggle = () => {
    if (isDarkMode) {
      // Switching TO light mode -> Trigger Sun
      setSunAnimationKey(prev => prev + 1);
    } else {
      // Switching TO dark mode -> Remove Sun
      setSunAnimationKey(0);
    }
    toggleTheme();
  };

  return (
    <>
      <header className="topbar" style={{ justifyContent: 'space-between', padding: '1rem 2rem' }}>
        {/* Navigation Links */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={() => window.location.href = '/'}
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
            onClick={() => window.location.href = '/subscription'}
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
      
      {/* The Animated Background Orb (Only for Light Mode) */}
      {sunAnimationKey > 0 && !isDarkMode && (
        <div key={sunAnimationKey} className="flying-orb sun-orb" />
      )}
    </>
  );
}
