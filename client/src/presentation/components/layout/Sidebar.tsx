'use client';

import { User } from '../../../../domain/entities/User';

interface SidebarProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (view: 'dashboard' | 'leaderboard' | 'profile') => void;
}

export default function Sidebar({ user, onLogout, onNavigate }: SidebarProps) {
  if (!user) return null;

  return (
    <aside className="sidebar">
      <h1>MedSim</h1>

      <div className="user-profile-sidebar" onClick={() => onNavigate('profile')} style={{ cursor: 'pointer' }}>
        <div className="user-avatar">{user.avatar || '👨‍⚕️'}</div>
        <div className="user-info">
          <span id="sidebar-username">{user.nickname}</span>
          <span id="sidebar-points" className="user-points">{user.points} Puan</span>
        </div>
      </div>

      <div className="nav-menu">
        <div className="nav-item active" onClick={() => onNavigate('dashboard')}>
          <span className="icon">📁</span> Tüm Vakalarım
        </div>
        
        {/* Dynamic Sidebar implementation would go here (Classes 1-6 Accordion) */}
        <div className="accordion-container">
           {/* Placeholder for Departments */}
           <div className="nav-item-sub">🔬 Anatomi (Örnek)</div>
           <div className="nav-item-sub">🩺 Dahiliye (Örnek)</div>
        </div>

        <div className="nav-item" onClick={() => onNavigate('leaderboard')}>
          <span className="icon">🏆</span> Liderlik Tablosu
        </div>
      </div>

      <div className="sidebar-bottom-actions">
        <button className="btn-logout" onClick={onLogout}>Çıkış Yap</button>
      </div>
    </aside>
  );
}
