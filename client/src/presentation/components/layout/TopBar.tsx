'use client';

import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';
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
      <header className="topbar" style={{ justifyContent: 'flex-end', padding: '1rem 2rem' }}>
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
