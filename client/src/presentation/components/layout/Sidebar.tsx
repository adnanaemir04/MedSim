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

const yearIconMap: Record<number, React.ReactNode> = {
  1: <Dna size={16} />,
  2: <Microscope size={16} />,
  3: <Stethoscope size={16} />,
  4: <Activity size={16} />,
  5: <BrainCircuit size={16} />,
  6: <GraduationCap size={16} />
};

interface SidebarProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (view: 'dashboard' | 'leaderboard' | 'profile' | 'past_cases' | 'subscription', subjectFilter?: string) => void;
}

export default function Sidebar({ user, onLogout, onNavigate }: SidebarProps) {
  const [isClassExpanded, setIsClassExpanded] = useState(false);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);

  if (!user) return null;

  const deptsByYear: Record<number, string[]> = {
    1: ["Anatomi", "Fizyoloji", "Tıbbi Biyokimya", "Histoloji ve Embriyoloji", "Tıbbi Biyoloji ve Genetik"],
    2: ["Tıbbi Mikrobiyoloji", "Nöroanatomi", "Biyofizik", "İlk Yardım"],
    3: ["Tıbbi Patoloji", "Tıbbi Farmakoloji", "Klinik Bilimlere Giriş", "Biyoistatistik"],
    4: ["İç Hastalıkları (Dahiliye)", "Çocuk Sağlığı ve Hastalıkları", "Genel Cerrahi", "Kadın Hastalıkları ve Doğum"],
    5: ["Nöroloji", "Psikiyatri", "Ortopedi ve Travmatoloji", "Göz Hastalıkları", "KBB", "Üroloji", "Dermatoloji", "Enfeksiyon Hastalıkları", "Kardiyoloji"],
    6: ["Acil Tıp", "Aile Hekimliği", "Halk Sağlığı", "Yoğun Bakım"]
  };

  return (
    <aside className="sidebar">
      <div className="topbar-logo" style={{ padding: '0 0.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div 
          onClick={() => onNavigate('dashboard')}
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          className="logo-wrapper"
        >
          <h1 className="medsim-logo-premium" style={{ margin: 0 }}>
            <span style={{ fontWeight: 900 }}>Med</span>
            <span style={{ fontWeight: 200, fontStyle: 'italic', marginLeft: '2px' }}>Sim</span>
          </h1>
        </div>
      </div>

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
                      flexDirection: 'column',
                      padding: '0.8rem 1.2rem',
                      background: selectedClass === num ? 'linear-gradient(90deg, rgba(79, 70, 229, 0.25), rgba(6, 182, 212, 0.15))' : 'rgba(79, 70, 229, 0.05)',
                      border: selectedClass === num ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                      borderLeft: selectedClass === num ? '4px solid var(--secondary)' : '4px solid rgba(79, 70, 229, 0.4)',
                      borderRadius: '12px',
                      color: selectedClass === num ? 'var(--primary)' : 'var(--text-main)',
                      fontWeight: selectedClass === num ? 800 : 600,
                      boxShadow: selectedClass === num ? '0 0 20px rgba(6, 182, 212, 0.2)' : '0 2px 5px rgba(0,0,0,0.05)',
                      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      cursor: 'pointer',
                      zIndex: 2,
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', letterSpacing: '1px' }}>
                        <div style={{ color: selectedClass === num ? 'var(--secondary)' : 'var(--text-muted)' }}>
                          {yearIconMap[num]}
                        </div>
                        <span style={{ textShadow: selectedClass === num ? '0 0 10px rgba(6, 182, 212, 0.5)' : 'none' }}>DÖNEM {num}</span>
                      </span>
                      <div style={{ 
                        width: '8px', height: '8px', borderRadius: '50%', 
                        background: selectedClass === num ? 'var(--secondary)' : 'transparent', 
                        boxShadow: selectedClass === num ? '0 0 10px var(--secondary)' : 'none',
                        transition: 'all 0.3s' 
                      }} />
                    </div>
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

        <button className="nav-item" onClick={() => onNavigate('past_cases')}>
          <Activity size={18} />
          <span>Geçmiş Vakalar</span>
        </button>

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
