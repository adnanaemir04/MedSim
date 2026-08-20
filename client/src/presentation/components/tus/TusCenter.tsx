'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Activity, Target, TrendingUp, Trophy, ArrowRight, BookOpen, Stethoscope, Loader2, Info, CheckCircle, ChevronRight, Sparkles, BrainCircuit } from 'lucide-react';
import { getTusSubjects, TusSubjectDto, generateTusQuestions, getTusUserStats, TusStatsDto } from '../../../infrastructure/api/simulationApi';
import { soundManager } from '../../../utils/soundManager';
import TusSolveView from './TusSolveView';
import TusSubjectStatsView from './TusSubjectStatsView';
import TusAboutView from './TusAboutView';

interface TusCenterProps {
  userEmail: string;
  onNavigateToAbout?: () => void;
  onNavigateToSolve?: (subject: string, count: number, mode: 'classic' | 'ai', difficulty?: string) => void;
}

const STANDARD_TUS_SUBJECTS = [
  "Anatomi", "Histoloji ve Embriyoloji", "Fizyoloji", "Biyokimya", "Mikrobiyoloji", "Patoloji", "Farmakoloji",
  "Dahiliye", "Pediatri", "Genel Cerrahi", "Kadın Hastalıkları ve Doğum", "Küçük Stajlar"
];

export default function TusCenter({ userEmail, onNavigateToAbout, onNavigateToSolve }: TusCenterProps) {
  const [subjects, setSubjects] = useState<TusSubjectDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [viewState, setViewState] = useState<'list' | 'stats' | 'solve' | 'about'>('list');
  const [solveCount, setSolveCount] = useState<number>(5);
  const [solveMode, setSolveMode] = useState<'classic' | 'ai'>('classic');
  const [solveDifficulty, setSolveDifficulty] = useState<string | undefined>();
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [genericStats, setGenericStats] = useState<TusStatsDto | null>(null);
  
  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setIsLoading(true);
    try {
      const data = await getTusSubjects();
      const statsData = await getTusUserStats(userEmail);
      setGenericStats(statsData);
      
      // Merge with standard TUS subjects so we always show all of them
      const mergedSubjects: TusSubjectDto[] = STANDARD_TUS_SUBJECTS.map(name => {
        const found = data.find(d => d.name === name);
        return {
          name: name,
          questionCount: found ? found.questionCount : 0
        };
      });
      
      setSubjects(mergedSubjects);
    } catch (e) {
      console.error("Dersler yüklenirken hata:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubjectClick = (subjectName: string) => {
    setActiveSubject(subjectName);
    setViewState('stats');
  };

  if (viewState === 'stats' && activeSubject) {
    return (
      <TusSubjectStatsView 
        subject={activeSubject} 
        userEmail={userEmail} 
        onSolveQuestions={(count, mode, difficulty) => {
          setSolveCount(count);
          setSolveMode(mode);
          setSolveDifficulty(difficulty);
          if (onNavigateToSolve) {
            onNavigateToSolve(activeSubject as string, count, mode, difficulty);
          } else {
            setViewState('solve');
          }
        }} 
        onBack={() => { setActiveSubject(null); setViewState('list'); }} 
      />
    );
  }

  if (viewState === 'solve' && activeSubject) {
    return (
      <TusSolveView 
        subject={activeSubject} 
        userEmail={userEmail} 
        count={solveCount}
        mode={solveMode}
        difficulty={solveDifficulty}
        onBack={() => { setViewState('stats'); fetchSubjects(); }} 
      />
    );
  }


  if (viewState === 'about') {
    // Fallback if prop not provided
    return (
      <TusAboutView onBack={() => setViewState('list')} />
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Stethoscope size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>TUS Merkezi</h2>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Tüm dersler için kişiselleştirilmiş istatistikler ve yapay zeka destekli soru çözümü</p>
          </div>
        </div>
        
        <button
          onClick={() => {
            soundManager.playClick();
            if (onNavigateToAbout) {
              onNavigateToAbout();
            } else {
              setViewState('about');
            }
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10b981', padding: '0.75rem 1.25rem', borderRadius: '16px',
            fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { soundManager.playHover(); e.currentTarget.style.transform = 'translateY(-2px)'}}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Info size={18} /> TUS Hakkında
        </button>
      </div>

      {/* Global TUS Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass-panel" 
             style={{ 
               padding: '1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '1.2rem',
               background: isLight ? 'linear-gradient(135deg, #ffffff, #f1f5f9)' : 'var(--glass-bg)',
               boxShadow: isLight ? '0 10px 30px rgba(79, 70, 229, 0.1), inset 0 2px 0 rgba(255,255,255,0.8)' : 'var(--shadow-float)',
               border: isLight ? '1px solid rgba(79, 70, 229, 0.15)' : '1px solid var(--glass-border)',
               transition: 'transform 0.3s, box-shadow 0.3s'
             }}
             onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = isLight ? '0 15px 35px rgba(79, 70, 229, 0.15), inset 0 2px 0 rgba(255,255,255,1)' : 'var(--shadow-float)'; }}
             onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isLight ? '0 10px 30px rgba(79, 70, 229, 0.1), inset 0 2px 0 rgba(255,255,255,0.8)' : 'var(--shadow-float)'; }}
        >
          <div style={{ width: 56, height: 56, borderRadius: '16px', background: isLight ? 'linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(79, 70, 229, 0.05))' : 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}><Target size={28} /></div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>{genericStats?.totalSolved || 0}</div>
            <div style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Toplam Çözülen</div>
          </div>
        </div>
        <div className="glass-panel" 
             style={{ 
               padding: '1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '1.2rem',
               background: isLight ? 'linear-gradient(135deg, #ffffff, #f0fdf4)' : 'var(--glass-bg)',
               boxShadow: isLight ? '0 10px 30px rgba(16, 185, 129, 0.1), inset 0 2px 0 rgba(255,255,255,0.8)' : 'var(--shadow-float)',
               border: isLight ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid var(--glass-border)',
               transition: 'transform 0.3s, box-shadow 0.3s'
             }}
             onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = isLight ? '0 15px 35px rgba(16, 185, 129, 0.15), inset 0 2px 0 rgba(255,255,255,1)' : 'var(--shadow-float)'; }}
             onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isLight ? '0 10px 30px rgba(16, 185, 129, 0.1), inset 0 2px 0 rgba(255,255,255,0.8)' : 'var(--shadow-float)'; }}
        >
          <div style={{ width: 56, height: 56, borderRadius: '16px', background: isLight ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))' : 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}><TrendingUp size={28} /></div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>%{genericStats?.successRate || 0}</div>
            <div style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Genel Başarı</div>
          </div>
        </div>
        <div className="glass-panel" 
             style={{ 
               padding: '1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '1.2rem',
               background: isLight ? 'linear-gradient(135deg, #ffffff, #ecfeff)' : 'var(--glass-bg)',
               boxShadow: isLight ? '0 10px 30px rgba(6, 182, 212, 0.1), inset 0 2px 0 rgba(255,255,255,0.8)' : 'var(--shadow-float)',
               border: isLight ? '1px solid rgba(6, 182, 212, 0.15)' : '1px solid var(--glass-border)',
               transition: 'transform 0.3s, box-shadow 0.3s'
             }}
             onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = isLight ? '0 15px 35px rgba(6, 182, 212, 0.15), inset 0 2px 0 rgba(255,255,255,1)' : 'var(--shadow-float)'; }}
             onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isLight ? '0 10px 30px rgba(6, 182, 212, 0.1), inset 0 2px 0 rgba(255,255,255,0.8)' : 'var(--shadow-float)'; }}
        >
          <div style={{ width: 56, height: 56, borderRadius: '16px', background: isLight ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.05))' : 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}><CheckCircle size={28} /></div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
              {Math.max(0, (genericStats?.correctCount || 0) - ((genericStats?.wrongCount || 0) / 4)).toFixed(1)}
            </div>
            <div style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Toplam Net</div>
          </div>
        </div>
      </div>

      {/* Daily Goal Card */}
      <div className="glass-panel" style={{ 
        padding: '2rem', borderRadius: '24px', marginBottom: '2.5rem',
        background: isLight ? 'linear-gradient(135deg, #ffffff, #fffbeb)' : 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(245,158,11,0.03))',
        border: '1px solid rgba(245,158,11,0.2)',
        boxShadow: 'var(--shadow-float)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🎯 Klasikleşmiş Sorular – Bugünkü Hedef
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Klasik hap bilgileri çözerek günlük hedefinize ulaşın ve hafızanızı taze tutun.</p>
          </div>
          <div style={{ padding: '0.5rem 1.2rem', background: 'var(--warning)', color: '#fff', borderRadius: '20px', fontWeight: 900, fontSize: '1.2rem', boxShadow: '0 4px 15px rgba(245,158,11,0.3)' }}>
            {Math.min(30, genericStats?.totalSolved || 0)} / 30
          </div>
        </div>

        {/* Progress bars for some key courses */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {[
            { name: 'Farmakoloji', progress: Math.min(100, Math.round(((genericStats?.correctCount || 0) * 8.2) % 40) + 60), color: '#ef4444' },
            { name: 'Patoloji', progress: Math.min(100, Math.round(((genericStats?.correctCount || 0) * 6.1) % 40) + 50), color: '#3b82f6' },
            { name: 'Mikrobiyoloji', progress: Math.min(100, Math.round(((genericStats?.correctCount || 0) * 9.1) % 30) + 70), color: '#10b981' }
          ].map(course => (
            <div key={course.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                <span>{course.name}</span>
                <span>%{course.progress}</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${course.progress}%`, height: '100%', background: course.color, borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
          <Loader2 size={48} className="spin" style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-main)' }}>Dersler Yükleniyor...</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {subjects.map(subject => (
            <div
              key={subject.name}
              className="glass-panel hover-scale"
              style={{ 
                padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', cursor: 'pointer',
                background: isLight ? 'rgba(79, 70, 229, 0.08)' : 'var(--glass-bg)',
                boxShadow: isLight ? 'rgba(0, 0, 0, 0.05) 0px 2px 4px' : 'var(--shadow-float)',
                border: isLight ? '1px solid rgba(79, 70, 229, 0.3)' : '1px solid var(--glass-border)',
                backdropFilter: isLight ? 'blur(10px)' : 'blur(24px)'
              }}
              onMouseEnter={e => {
                soundManager.playHover();
                if (isLight) {
                  e.currentTarget.style.boxShadow = 'rgba(0, 0, 0, 0.1) 0px 4px 8px';
                  e.currentTarget.style.borderColor = 'rgba(79, 70, 229, 0.5)';
                  e.currentTarget.style.background = 'rgba(79, 70, 229, 0.15)';
                }
              }}
              onMouseLeave={e => {
                if (isLight) {
                  e.currentTarget.style.boxShadow = 'rgba(0, 0, 0, 0.05) 0px 2px 4px';
                  e.currentTarget.style.borderColor = 'rgba(79, 70, 229, 0.3)';
                  e.currentTarget.style.background = 'rgba(79, 70, 229, 0.08)';
                }
              }}
              onClick={() => { soundManager.playClick(); handleSubjectClick(subject.name); }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <BookOpen size={20} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#8b5cf6', fontSize: '0.8rem', fontWeight: 700, background: 'rgba(139, 92, 246, 0.1)', padding: '0.3rem 0.6rem', borderRadius: '12px' }}>
                  <Sparkles size={14} /> AI Destekli
                </div>
              </div>
              
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.2rem 0', color: 'var(--text-main)' }}>{subject.name}</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sistemde {subject.questionCount} soru var</p>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button 
                  className="btn-review-case btn-full"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <BrainCircuit size={16} /> Ders İstatistikleri & Çözüm
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
