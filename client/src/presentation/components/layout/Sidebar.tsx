'use client';

import { useState } from 'react';
import { User } from '../../../../domain/entities/User';
import { ChevronDown, ChevronRight, Folder, Trophy, LogOut, GraduationCap } from 'lucide-react';

interface SidebarProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (view: 'dashboard' | 'leaderboard' | 'profile') => void;
}

export default function Sidebar({ user, onLogout, onNavigate }: SidebarProps) {
  const [isClassExpanded, setIsClassExpanded] = useState(false);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);

  if (!user) return null;

  return (
    <aside className="sidebar">
      <div className="user-profile-sidebar" onClick={() => onNavigate('profile')}>
        <div className="user-avatar" style={{
          background: user.avatar?.startsWith('data:image') ? `url(${user.avatar}) center/cover` : 'var(--bg-main)',
          fontSize: user.avatar?.startsWith('data:image') ? '0' : '2rem'
        }}>
          {!user.avatar?.startsWith('data:image') && (user.avatar || '👨‍⚕️')}
        </div>
        <div className="user-info">
          <span id="sidebar-username">{user.nickname}</span>
          <span id="sidebar-points" className="user-points">{user.points} Puan</span>
        </div>
      </div>

      <nav className="nav-menu">
        <button className="nav-item active" onClick={() => onNavigate('dashboard')}>
          <Folder size={18} />
          <span>Tüm Vakalarım</span>
        </button>
        
        <div className="nav-accordion">
          <button 
            className={`nav-item ${isClassExpanded ? 'expanded' : ''}`} 
            onClick={() => setIsClassExpanded(!isClassExpanded)}
          >
            <GraduationCap size={18} />
            <span style={{ flex: 1, textAlign: 'left' }}>Sınıflar</span>
            {isClassExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          {isClassExpanded && (
            <div className="accordion-content">
              {[1, 2, 3, 4, 5, 6].map(num => (
                <button 
                  key={num} 
                  className={`nav-sub-item ${selectedClass === num ? 'active' : ''}`}
                  onClick={() => setSelectedClass(num)}
                >
                  Tıp {num}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="nav-item" onClick={() => onNavigate('leaderboard')}>
          <Trophy size={18} />
          <span>Liderlik Tablosu</span>
        </button>
      </nav>

      <div className="sidebar-bottom-actions">
        <button className="btn-logout" onClick={onLogout}>
          <LogOut size={18} />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </aside>
  );
}
