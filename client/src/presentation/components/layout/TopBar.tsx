'use client';

import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function TopBar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="topbar">
      <div className="topbar-logo">MedSim</div>
      <div className="topbar-actions">
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Karanlık/Aydınlık Mod Değiştir">
          {theme === 'light' ? (
            <Sun size={20} strokeWidth={2.5} />
          ) : (
            <Moon size={20} strokeWidth={2.5} />
          )}
        </button>
      </div>
    </div>
  );
}
