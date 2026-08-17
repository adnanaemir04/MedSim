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

  const deptsByYear: Record<number, string[]> = {
    1: ["Anatomi", "Tıbbi Biyoloji", "Histoloji"],
    2: ["Fizyoloji", "Mikrobiyoloji", "Biyokimya"],
    3: ["Farmakoloji", "Patoloji"],
    4: ["Dahiliye", "Genel Cerrahi", "Kadın Hastalıkları", "Pediatri"],
    5: ["Ortopedi", "Göz Hastalıkları", "KBB", "Psikiyatri", "Dermatoloji"],
    6: ["Acil Tıp", "Aile Hekimliği", "Yoğun Bakım"]
  };

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
                <div key={num} style={{ marginBottom: '0.5rem' }}>
                  <button 
                    className={`nav-sub-item ${selectedClass === num ? 'active' : ''}`}
                    onClick={() => setSelectedClass(selectedClass === num ? null : num)}
                    style={{ width: '100%', fontWeight: selectedClass === num ? 800 : 500, color: selectedClass === num ? 'var(--text-main)' : 'var(--text-muted)' }}
                  >
                    Tıp {num}
                  </button>
                  {selectedClass === num && (
                    <div style={{ paddingLeft: '1rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {deptsByYear[num].map(dept => (
                        <span key={dept} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => onNavigate('dashboard')}>
                          • {dept}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
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
