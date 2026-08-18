'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ArrowLeft, Target, TrendingUp, CheckCircle, BrainCircuit, Loader2 } from 'lucide-react';
import { getTusUserStats, TusStatsDto } from '../../../infrastructure/api/simulationApi';

interface TusSubjectStatsViewProps {
  subject: string;
  userEmail: string;
  onSolveQuestions: () => void;
  onBack: () => void;
}

export default function TusSubjectStatsView({ subject, userEmail, onSolveQuestions, onBack }: TusSubjectStatsViewProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [stats, setStats] = useState<TusStatsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Target size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>{displayStats.totalSolved}</div>
          <div style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Çözülen Soru</div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <TrendingUp size={32} color="var(--success)" style={{ marginBottom: '1rem' }} />
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>%{displayStats.successRate}</div>
          <div style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Başarı Oranı</div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CheckCircle size={32} color="var(--secondary)" style={{ marginBottom: '1rem' }} />
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>%{displayStats.accuracy}</div>
          <div style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Doğruluk Payı</div>
        </div>
      </div>

      {/* Action Button */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button 
          onClick={onSolveQuestions}
          style={{ 
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            color: 'white', border: 'none', padding: '1.2rem 3rem', borderRadius: '100px',
            fontSize: '1.2rem', fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 10px 30px var(--primary-glow)',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            display: 'flex', alignItems: 'center', gap: '0.8rem'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 15px 40px var(--primary-glow)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 30px var(--primary-glow)';
          }}
        >
          <BrainCircuit size={24} /> Yapay Zeka ile Soru Üret ve Çöz
        </button>
      </div>

    </div>
  );
}
