'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ArrowLeft, Target, TrendingUp, CheckCircle, BrainCircuit, Loader2, Clock, Activity, Info } from 'lucide-react';
import { getTusUserStats, TusStatsDto } from '../../../infrastructure/api/simulationApi';
import { soundManager } from '../../../utils/soundManager';

interface TusSubjectStatsViewProps {
  subject: string;
  userEmail: string;
  onSolveQuestions: (count: number, mode: 'classic' | 'ai', difficulty?: string) => void;
  onBack: () => void;
}

export default function TusSubjectStatsView({ subject, userEmail, onSolveQuestions, onBack }: TusSubjectStatsViewProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [stats, setStats] = useState<TusStatsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiCount, setAiCount] = useState<number | string>(10);
  const [aiDifficulty, setAiDifficulty] = useState('Orta');
  const [classicCount, setClassicCount] = useState<number | string>(10);
  const [classicDifficulty, setClassicDifficulty] = useState('Tümü');

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

  const displayStats = stats || { totalSolved: 0, successRate: 0, accuracy: 0, correctCount: 0, wrongCount: 0, averageTime: 0 };
  const netScore = Math.max(0, displayStats.correctCount - (displayStats.wrongCount / 4)).toFixed(1);

  const parsedAiCount = typeof aiCount === 'string' ? parseInt(aiCount, 10) : aiCount;
  const isAiCountInvalid = isNaN(parsedAiCount) || parsedAiCount < 1 || parsedAiCount > 30;

  const parsedClassicCount = typeof classicCount === 'string' ? parseInt(classicCount, 10) : classicCount;
  const isClassicCountInvalid = isNaN(parsedClassicCount) || parsedClassicCount < 1 || parsedClassicCount > 50;

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* Header and Back Button */}
      <button 
        onClick={() => { soundManager.playClick(); onBack(); }} 
        onMouseEnter={() => soundManager.playHover()}
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {/* Solved Questions */}
        <div className="glass-panel" style={{ 
          padding: '2rem 1.5rem', borderRadius: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center',
          background: isLight ? 'linear-gradient(135deg, #ffffff, #f1f5f9)' : 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(79,70,229,0.05))',
          border: isLight ? '1px solid rgba(79, 70, 229, 0.2)' : '1px solid rgba(99, 102, 241, 0.2)',
          boxShadow: isLight ? '0 10px 30px rgba(79, 70, 229, 0.05)' : '0 10px 30px rgba(99, 102, 241, 0.05)',
          transition: 'transform 0.3s'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '1rem' }}>
            <Target size={24} />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.2rem' }}>{displayStats.totalSolved}</div>
          <div style={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.08em' }}>Çözülen Soru</div>
        </div>

        {/* Correct Count */}
        <div className="glass-panel" style={{ 
          padding: '2rem 1.5rem', borderRadius: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center',
          background: isLight ? 'linear-gradient(135deg, #ffffff, #f0fdf4)' : 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(16,185,129,0.05))',
          border: isLight ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)',
          boxShadow: isLight ? '0 10px 30px rgba(16, 185, 129, 0.05)' : '0 10px 30px rgba(16, 185, 129, 0.05)',
          transition: 'transform 0.3s'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)', marginBottom: '1rem' }}>
            <CheckCircle size={24} />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--success)', marginBottom: '0.2rem' }}>{displayStats.correctCount}</div>
          <div style={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.08em' }}>Doğru Sayısı</div>
        </div>

        {/* Wrong Count */}
        <div className="glass-panel" style={{ 
          padding: '2rem 1.5rem', borderRadius: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center',
          background: isLight ? 'linear-gradient(135deg, #ffffff, #fdf2f8)' : 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(244,63,94,0.05))',
          border: isLight ? '1px solid rgba(244, 63, 94, 0.2)' : '1px solid rgba(244, 63, 94, 0.2)',
          boxShadow: isLight ? '0 10px 30px rgba(244, 63, 94, 0.05)' : '0 10px 30px rgba(244, 63, 94, 0.05)',
          transition: 'transform 0.3s'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)', marginBottom: '1rem' }}>
            <ArrowLeft size={24} style={{ transform: 'rotate(-45deg)' }} />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--danger)', marginBottom: '0.2rem' }}>{displayStats.wrongCount}</div>
          <div style={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.08em' }}>Yanlış Sayısı</div>
        </div>

        {/* Success Rate */}
        <div className="glass-panel" style={{ 
          padding: '2rem 1.5rem', borderRadius: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center',
          background: isLight ? 'linear-gradient(135deg, #ffffff, #ecfeff)' : 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(6,182,212,0.05))',
          border: isLight ? '1px solid rgba(6, 182, 212, 0.2)' : '1px solid rgba(6, 182, 212, 0.2)',
          boxShadow: isLight ? '0 10px 30px rgba(6, 182, 212, 0.05)' : '0 10px 30px rgba(6, 182, 212, 0.05)',
          transition: 'transform 0.3s'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', marginBottom: '1rem' }}>
            <TrendingUp size={24} />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.2rem' }}>%{displayStats.successRate}</div>
          <div style={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.08em' }}>Başarı Oranı</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginTop: '0.5rem', opacity: 0.8, lineHeight: 1.3, maxWidth: '180px' }}>Klinik aşamalardaki genel performans ve puan kazanım yüzdesi</div>
        </div>

        {/* Time Spent */}
        <div className="glass-panel" style={{ 
          padding: '2rem 1.5rem', borderRadius: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center',
          background: isLight ? 'linear-gradient(135deg, #ffffff, #e0f2fe)' : 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(56,189,248,0.05))',
          border: isLight ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid rgba(56, 189, 248, 0.2)',
          boxShadow: isLight ? '0 10px 30px rgba(56, 189, 248, 0.05)' : '0 10px 30px rgba(56, 189, 248, 0.05)',
          transition: 'transform 0.3s'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', marginBottom: '1rem' }}>
            <Clock size={24} />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0284c7', marginBottom: '0.2rem' }}>{displayStats.averageTime || 0} sn</div>
          <div style={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.08em' }}>Soru Başına Süre</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginTop: '0.5rem', opacity: 0.8, lineHeight: 1.3, maxWidth: '180px' }}>Soruları çözerken harcanan ortalama süre</div>
        </div>

        {/* Net Score */}
        <div className="glass-panel" style={{ 
          padding: '2rem 1.5rem', borderRadius: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center',
          background: isLight ? 'linear-gradient(135deg, #ffffff, #fef3c7)' : 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(245,158,11,0.05))',
          border: isLight ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(245, 158, 11, 0.2)',
          boxShadow: isLight ? '0 10px 30px rgba(245, 158, 11, 0.05)' : '0 10px 30px rgba(245, 158, 11, 0.05)',
          transition: 'transform 0.3s'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)', marginBottom: '1rem' }}>
            <Activity size={24} />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--warning)', marginBottom: '0.2rem' }}>{netScore}</div>
          <div style={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.08em' }}>Net Sayısı</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginTop: '0.5rem', opacity: 0.8, lineHeight: 1.3, maxWidth: '180px' }}>Toplam net sayısı (4 yanlış 1 doğruyu götürür)</div>
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
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.7, fontSize: '1.05rem', flex: 1 }}>
            Veritabanındaki on binlerce geçmiş TUS sorusuna benzer kaliteli ve zorlu sorulardan rastgele seçerek klasik formatta çöz.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', background: 'rgba(0,0,0,0.03)', padding: '0.5rem 1rem', borderRadius: '16px' }}>
              <label style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem' }}>Soru Sayısı:</label>
              <input 
                type="number" 
                value={classicCount} 
                onChange={e => setClassicCount(e.target.value)}
                style={{
                  flex: 1, padding: '0.6rem', borderRadius: '12px', border: '2px solid #10b981',
                  background: isLight ? 'white' : 'rgba(0,0,0,0.3)', color: 'var(--text-main)',
                  fontSize: '1.2rem', fontWeight: 800, textAlign: 'center', outline: 'none'
                }}
              />
            </div>
            {isClassicCountInvalid ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--danger)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: 'rgba(244, 63, 94, 0.1)', padding: '0.4rem', borderRadius: '10px' }}>
                <Info size={16} /> Sadece 1 ile 50 arasında bir değer girebilirsiniz!
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.4rem', borderRadius: '10px' }}>
                <Info size={16} /> Lütfen 1 - 50 arası bir değer girin
              </div>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', background: 'rgba(0,0,0,0.03)', padding: '0.5rem 1rem', borderRadius: '16px' }}>
              <label style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem' }}>Zorluk:</label>
              <div style={{ display: 'flex', gap: '0.5rem', flex: 1, flexWrap: 'wrap' }}>
                {['Tümü', 'Kolay', 'Orta', 'Zor'].map((lvl) => (
                  <button
                    key={lvl}
                    onMouseEnter={() => soundManager.playHover()}
                    onClick={() => { soundManager.playClick(); setClassicDifficulty(lvl); }}
                    style={{
                      flex: '1 1 40%', padding: '0.4rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem',
                      cursor: 'pointer', transition: 'all 0.2s',
                      background: classicDifficulty === lvl 
                        ? (lvl === 'Zor' ? 'rgba(244,63,94,0.15)' : lvl === 'Orta' ? 'rgba(245,158,11,0.15)' : lvl === 'Kolay' ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)')
                        : (isLight ? 'white' : 'rgba(0,0,0,0.3)'),
                      color: classicDifficulty === lvl 
                        ? (lvl === 'Zor' ? '#f43f5e' : lvl === 'Orta' ? '#f59e0b' : lvl === 'Kolay' ? '#10b981' : '#6366f1')
                        : 'var(--text-main)',
                      border: classicDifficulty === lvl 
                        ? `2px solid ${lvl === 'Zor' ? '#f43f5e' : lvl === 'Orta' ? '#f59e0b' : lvl === 'Kolay' ? '#10b981' : '#6366f1'}`
                        : (isLight ? '2px solid transparent' : '2px solid rgba(255,255,255,0.1)')
                    }}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={() => { soundManager.playClick(); onSolveQuestions(parsedClassicCount, 'classic', classicDifficulty); }}
            disabled={isClassicCountInvalid}
            style={{ 
              background: isClassicCountInvalid ? 'rgba(0,0,0,0.1)' : 'linear-gradient(135deg, #10b981, #059669)',
              color: isClassicCountInvalid ? 'var(--text-muted)' : 'white', border: 'none', padding: '1.1rem 2rem', borderRadius: '16px',
              fontSize: '1.1rem', fontWeight: 800, cursor: isClassicCountInvalid ? 'not-allowed' : 'pointer',
              boxShadow: isClassicCountInvalid ? 'none' : '0 8px 20px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '0.8rem', width: '100%', justifyContent: 'center'
            }}
            onMouseEnter={e => { soundManager.playHover(); if (!isClassicCountInvalid) e.currentTarget.style.transform = 'scale(1.03)'; }}
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
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', background: 'rgba(0,0,0,0.03)', padding: '0.5rem 1rem', borderRadius: '16px' }}>
              <label style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem' }}>Soru Sayısı:</label>
              <input 
                type="number" 
                value={aiCount} 
                onChange={e => setAiCount(e.target.value)}
                style={{
                  flex: 1, padding: '0.6rem', borderRadius: '12px', border: '2px solid var(--primary)',
                  background: isLight ? 'white' : 'rgba(0,0,0,0.3)', color: 'var(--text-main)',
                  fontSize: '1.2rem', fontWeight: 800, textAlign: 'center', outline: 'none'
                }}
              />
            </div>
            {isAiCountInvalid ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--danger)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: 'rgba(244, 63, 94, 0.1)', padding: '0.4rem', borderRadius: '10px' }}>
                <Info size={16} /> Sadece 1 ile 30 arasında bir değer girebilirsiniz!
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: 'rgba(245, 158, 11, 0.1)', padding: '0.4rem', borderRadius: '10px' }}>
                <Info size={16} /> Lütfen 1 - 30 arası bir değer girin
              </div>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', background: 'rgba(0,0,0,0.03)', padding: '0.5rem 1rem', borderRadius: '16px' }}>
              <label style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem' }}>Zorluk:</label>
              <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                {['Kolay', 'Orta', 'Zor'].map((lvl) => (
                  <button
                    key={lvl}
                    onMouseEnter={() => soundManager.playHover()}
                    onClick={() => { soundManager.playClick(); setAiDifficulty(lvl); }}
                    style={{
                      flex: 1, padding: '0.6rem', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem',
                      cursor: 'pointer', transition: 'all 0.2s',
                      background: aiDifficulty === lvl 
                        ? (lvl === 'Zor' ? 'rgba(244,63,94,0.15)' : lvl === 'Orta' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)')
                        : (isLight ? 'white' : 'rgba(0,0,0,0.3)'),
                      color: aiDifficulty === lvl 
                        ? (lvl === 'Zor' ? '#f43f5e' : lvl === 'Orta' ? '#f59e0b' : '#10b981')
                        : 'var(--text-main)',
                      border: aiDifficulty === lvl 
                        ? `2px solid ${lvl === 'Zor' ? '#f43f5e' : lvl === 'Orta' ? '#f59e0b' : '#10b981'}`
                        : (isLight ? '2px solid transparent' : '2px solid rgba(255,255,255,0.1)')
                    }}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={() => { soundManager.playClick(); onSolveQuestions(parsedAiCount, 'ai', aiDifficulty); }}
            disabled={isAiCountInvalid}
            style={{ 
              background: isAiCountInvalid ? 'rgba(0,0,0,0.1)' : 'linear-gradient(135deg, var(--primary), var(--secondary))',
              color: isAiCountInvalid ? 'var(--text-muted)' : 'white', border: 'none', padding: '1.1rem 2rem', borderRadius: '16px',
              fontSize: '1.1rem', fontWeight: 800, cursor: isAiCountInvalid ? 'not-allowed' : 'pointer',
              boxShadow: isAiCountInvalid ? 'none' : '0 8px 20px var(--primary-glow)',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '0.8rem', width: '100%', justifyContent: 'center'
            }}
            onMouseEnter={e => { soundManager.playHover(); if (!isAiCountInvalid) e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <BrainCircuit size={22} /> Üret ve Çöz
          </button>
        </div>
      </div>

    </div>
  );
}
