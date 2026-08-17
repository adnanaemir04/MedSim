'use client';

import { useState } from 'react';
import { User } from '../../../../domain/entities/User';
import { Home, Folder, Trophy, LogOut, User as UserIcon, Microscope, Dna, Pill, FlaskConical, Bug, Stethoscope, Baby, Scissors, HeartPulse, Wind, Biohazard, Brain, BrainCircuit, Activity, Ambulance, ChevronDown, ChevronRight, GraduationCap } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  'Anatomi': <UserIcon size={14} />,
  'Histoloji': <Microscope size={14} />,
  'Tıbbi Biyoloji': <Dna size={14} />,
  'Fizyoloji': <Activity size={14} />,
  'Biyokimya': <FlaskConical size={14} />,
  'Mikrobiyoloji': <Bug size={14} />,
  'Farmakoloji': <Pill size={14} />,
  'Patoloji': <Microscope size={14} />,
  'Dahiliye': <Stethoscope size={14} />,
  'Genel Cerrahi': <Scissors size={14} />,
  'Kadın Hastalıkları': <HeartPulse size={14} />,
  'Pediatri': <Baby size={14} />,
  'Ortopedi': <Activity size={14} />,
  'Göz Hastalıkları': <Microscope size={14} />,
  'KBB': <Wind size={14} />,
  'Psikiyatri': <BrainCircuit size={14} />,
  'Dermatoloji': <Biohazard size={14} />,
  'Acil Tıp': <Ambulance size={14} />,
  'Aile Hekimliği': <Home size={14} />,
  'Yoğun Bakım': <Brain size={14} />
};

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
            <div className="accordion-content" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[1, 2, 3, 4, 5, 6].map(num => (
                <div key={num} style={{ position: 'relative' }}>
                  
                  {/* Neon Cyberpunk Style Class Button */}
                  <button 
                    onClick={() => setSelectedClass(selectedClass === num ? null : num)}
                    style={{ 
                      width: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '0.8rem 1.2rem',
                      background: selectedClass === num ? 'linear-gradient(90deg, rgba(79, 70, 229, 0.2), rgba(6, 182, 212, 0.1))' : 'rgba(255, 255, 255, 0.03)',
                      border: selectedClass === num ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                      color: selectedClass === num ? 'var(--primary)' : 'var(--text-main)',
                      fontWeight: selectedClass === num ? 800 : 500,
                      boxShadow: selectedClass === num ? '0 0 20px rgba(6, 182, 212, 0.2)' : 'none',
                      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      cursor: 'pointer',
                      zIndex: 2,
                      position: 'relative'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '1px' }}>
                      <Activity size={16} style={{ color: selectedClass === num ? 'var(--secondary)' : 'var(--text-muted)' }} />
                      DÖNEM {num}
                    </span>
                    <div style={{ 
                      width: '12px', height: '12px', borderRadius: '50%', 
                      background: selectedClass === num ? 'var(--secondary)' : 'transparent', 
                      border: `2px solid ${selectedClass === num ? 'var(--secondary)' : 'var(--text-muted)'}`,
                      boxShadow: selectedClass === num ? '0 0 10px var(--secondary)' : 'none',
                      transition: 'all 0.3s' 
                    }} />
                  </button>

                  {/* Floating Medical Nodes Grid */}
                  {selectedClass === num && (
                    <div style={{ 
                      marginTop: '0.5rem', 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(2, 1fr)', 
                      gap: '0.5rem',
                      padding: '1rem 0.5rem 0.5rem 0.5rem',
                      position: 'relative',
                      animation: 'slideDown 0.3s ease-out'
                    }}>
                      {/* Connecting Line from Top */}
                      <div style={{ position: 'absolute', top: 0, left: '50%', width: '2px', height: '1rem', background: 'var(--secondary)', opacity: 0.5 }} />

                      {deptsByYear[num].map(dept => (
                        <button 
                          key={dept} 
                          onClick={(e) => { e.stopPropagation(); onNavigate('dashboard', dept); }} 
                          style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: 700, 
                            color: 'var(--text-main)', 
                            cursor: 'pointer', 
                            padding: '0.6rem', 
                            borderRadius: '10px', 
                            background: 'rgba(79, 70, 229, 0.08)',
                            border: '1px solid rgba(79, 70, 229, 0.3)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.3rem',
                            textAlign: 'center',
                            backdropFilter: 'blur(10px)'
                          }} 
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary))';
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 8px 15px rgba(79, 70, 229, 0.4)';
                            e.currentTarget.style.borderColor = 'transparent';
                          }} 
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(79, 70, 229, 0.08)';
                            e.currentTarget.style.color = 'var(--text-main)';
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                            e.currentTarget.style.borderColor = 'rgba(79, 70, 229, 0.3)';
                          }}
                        >
                          <div style={{ color: 'var(--primary)', filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.5))' }}>
                            {iconMap[dept] || <Activity size={14} />}
                          </div>
                          <span style={{ lineHeight: '1.2' }}>{dept}</span>
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
