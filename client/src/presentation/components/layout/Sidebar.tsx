'use client';

import { useState } from 'react';
import { User } from '../../../../domain/entities/User';
import { ChevronDown, ChevronRight, Folder, Trophy, LogOut, GraduationCap } from 'lucide-react';

interface SidebarProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (view: 'dashboard' | 'leaderboard' | 'profile', subjectFilter?: string) => void;
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
                <div key={num} style={{ marginBottom: '0.75rem', background: selectedClass === num ? 'rgba(255, 255, 255, 0.05)' : 'transparent', borderRadius: 'var(--radius-lg)', padding: '0.5rem', transition: 'var(--transition)' }}>
                  <button 
                    className={`nav-sub-item ${selectedClass === num ? 'active' : ''}`}
                    onClick={() => setSelectedClass(selectedClass === num ? null : num)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: selectedClass === num ? 800 : 600, color: selectedClass === num ? 'var(--primary)' : 'var(--text-muted)' }}
                  >
                    <span>Tıp {num}</span>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: selectedClass === num ? 'var(--primary)' : 'transparent', transition: 'var(--transition)' }} />
                  </button>
                  {selectedClass === num && (
                    <div style={{ 
                      marginTop: '0.8rem', 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '0.5rem',
                      padding: '0.5rem',
                      background: 'rgba(0,0,0,0.02)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                    }}>
                      {deptsByYear[num].map(dept => (
                        <button 
                          key={dept} 
                          style={{ 
                            fontSize: '0.8rem', 
                            fontWeight: 600, 
                            color: 'var(--primary)', 
                            cursor: 'pointer', 
                            padding: '0.4rem 0.8rem', 
                            borderRadius: '20px', 
                            background: 'rgba(79, 70, 229, 0.1)',
                            border: '1px solid rgba(79, 70, 229, 0.2)',
                            transition: 'var(--transition)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flex: '1 1 auto'
                          }} 
                          onClick={(e) => { e.stopPropagation(); onNavigate('dashboard', dept); }} 
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'var(--primary)';
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 10px var(--primary-glow)';
                          }} 
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(79, 70, 229, 0.1)';
                            e.currentTarget.style.color = 'var(--primary)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          {dept}
                        </button>
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
