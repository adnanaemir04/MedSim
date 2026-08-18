'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ArrowLeft, Target, TrendingUp, CheckCircle, BrainCircuit, Loader2 } from 'lucide-react';
import { getTusUserStats, TusStatsDto } from '../../../infrastructure/api/simulationApi';

interface TusSubjectStatsViewProps {
  subject: string;
  userEmail: string;
  onSolveQuestions: (count: number, mode: 'classic' | 'ai') => void;
  onBack: () => void;
}

export default function TusSubjectStatsView({ subject, userEmail, onSolveQuestions, onBack }: TusSubjectStatsViewProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [stats, setStats] = useState<TusStatsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiCount, setAiCount] = useState<number>(10);

  useEffect(() => {
    getTusUserStats(userEmail, subject)
      .then(data => setStats(data))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, [userEmail, subject]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
        <Loader2 size={48} className="spin" style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
        <h3 style={{ color: 'var(--text-main)' }}>İstatistikler Yükleniyor...</h3>
      </div>
    );
  }

  const displayStats = stats || { totalSolved: 0, successRate: 0, accuracy: 0, correctCount: 0, wrongCount: 0 };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* Header and Back Button */}
      <button 
        onClick={onBack} 
        style={{ 
          background: 'transparent', border: 'none', color: 'var(--text-muted)', 
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', 
          fontSize: '1rem', fontWeight: 600, marginBottom: '2rem', padding: 0 
        }}
      >
        <ArrowLeft size={20} /> TUS Merkezine Dön
      </button>

      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', marginBottom: '1.5rem', boxShadow: '0 10px 25px var(--primary-glow)' }}>
          <BrainCircuit size={40} />
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>{subject}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Bu branştaki genel performansınız ve istatistikleriniz. Hazır olduğunuzda yeni sorular üretebilirsiniz.
        </p>
      </div>

      {/* Statistics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Target size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>{displayStats.totalSolved}</div>
          <div style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Çözülen Soru</div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CheckCircle size={32} color="var(--success)" style={{ marginBottom: '1rem' }} />
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--success)', marginBottom: '0.5rem' }}>{displayStats.correctCount}</div>
          <div style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Doğru Sayısı</div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ArrowLeft size={32} color="var(--danger)" style={{ marginBottom: '1rem', transform: 'rotate(-45deg)' }} />
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--danger)', marginBottom: '0.5rem' }}>{displayStats.wrongCount}</div>
          <div style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Yanlış Sayısı</div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <TrendingUp size={32} color="var(--secondary)" style={{ marginBottom: '1rem' }} />
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>%{displayStats.successRate}</div>
          <div style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Başarı Oranı</div>
        </div>
      </div>

      {/* Action Buttons */}
      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Classic Mode */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: '2.5rem 2rem', borderRadius: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center',
            border: isLight ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(16, 185, 129, 0.2)',
            background: isLight ? 'linear-gradient(to bottom, rgba(255,255,255,0.8), rgba(16,185,129,0.05))' : 'linear-gradient(to bottom, rgba(30,41,59,0.5), rgba(16,185,129,0.05))',
            position: 'relative', overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.15)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ 
            width: 70, height: 70, borderRadius: '20px', background: 'linear-gradient(135deg, #10b981, #059669)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', 
            marginBottom: '1.5rem', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)', transform: 'rotate(-5deg)'
          }}>
            <Target size={32} />
          </div>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>Klasikleşmiş Sorular</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: 1.7, fontSize: '1.05rem', flex: 1 }}>
            Veritabanındaki on binlerce geçmiş TUS sorusuna benzer kaliteli ve zorlu sorulardan rastgele seçerek klasik formatta çöz.
          </p>
          <button 
            onClick={() => onSolveQuestions(10, 'classic')}
            style={{ 
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white', border: 'none', padding: '1.1rem 2rem', borderRadius: '16px',
              fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '0.8rem', width: '100%', justifyContent: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <CheckCircle size={22} /> Çözmeye Başla
          </button>
        </div>

        {/* AI Mode */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: '2.5rem 2rem', borderRadius: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center',
            border: isLight ? '1px solid rgba(79, 70, 229, 0.3)' : '1px solid rgba(79, 70, 229, 0.2)',
            background: isLight ? 'linear-gradient(to bottom, rgba(255,255,255,0.8), rgba(79, 70, 229, 0.05))' : 'linear-gradient(to bottom, rgba(30,41,59,0.5), rgba(79, 70, 229, 0.05))',
            position: 'relative', overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(79, 70, 229, 0.15)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ 
            width: 70, height: 70, borderRadius: '20px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', 
            marginBottom: '1.5rem', boxShadow: '0 10px 25px var(--primary-glow)', transform: 'rotate(5deg)'
          }}>
            <BrainCircuit size={32} />
          </div>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>Yapay Zeka ile Üret</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.7, fontSize: '1.05rem', flex: 1 }}>
            Yapay zeka asistanı ile bu dersten yepyeni, özgün ve ezber bozan klinik vakalar üretip hemen çözmeye başla.
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', width: '100%', background: 'rgba(0,0,0,0.03)', padding: '0.5rem 1rem', borderRadius: '16px' }}>
            <label style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem' }}>Soru Sayısı:</label>
            <input 
              type="number" 
              min={1} 
              max={50} 
              value={aiCount} 
              onChange={e => {
                let val = parseInt(e.target.value);
                if (val > 50) val = 50;
                if (val < 1) val = 1;
                setAiCount(val || 10);
              }}
              style={{
                flex: 1, padding: '0.6rem', borderRadius: '12px', border: '2px solid var(--primary)',
                background: isLight ? 'white' : 'rgba(0,0,0,0.3)', color: 'var(--text-main)',
                fontSize: '1.2rem', fontWeight: 800, textAlign: 'center', outline: 'none'
              }}
            />
          </div>

          <button 
            onClick={() => onSolveQuestions(aiCount, 'ai')}
            style={{ 
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              color: 'white', border: 'none', padding: '1.1rem 2rem', borderRadius: '16px',
              fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 8px 20px var(--primary-glow)',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '0.8rem', width: '100%', justifyContent: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <BrainCircuit size={22} /> Üret ve Çöz
          </button>
        </div>
      </div>

    </div>
  );
}
