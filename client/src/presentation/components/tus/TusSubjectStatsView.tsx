'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ArrowLeft, Target, TrendingUp, CheckCircle, BrainCircuit, Loader2, Clock, Activity, Info, X, BookOpen, AlertCircle, ChevronRight, BarChart3, Stethoscope } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'stats' | 'info'>('stats');

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

  const getSubjectTusInfo = (subj: string) => {
    const s = subj.toLowerCase();
    if (s.includes('anatomi')) return { category: 'Temel Bilimler', count: 14, desc: 'Anatomi TUS Temel Bilimler testinde 14 soru ile yer alır. Özellikle sinir sistemi, kas-iskelet ve dolaşım sistemi soruları belirleyicidir.' };
    if (s.includes('fizyoloji') || s.includes('histoloji') || s.includes('embriyoloji')) return { category: 'Temel Bilimler', count: 14, desc: 'Fizyoloji, Histoloji ve Embriyoloji toplam 14 soruyla yer alır. Mekanizma kavrama üzerine kurulu bu ders, patolojinin ve dahiliyenin temelini oluşturur.' };
    if (s.includes('biyokimya')) return { category: 'Temel Bilimler', count: 22, desc: 'Biyokimya 22 soruyla temel bilimlerin en önemli taşlarındandır. Enzimler, metabolizma yolları ve genetik konuları yoğunluktadır.' };
    if (s.includes('mikrobiyoloji')) return { category: 'Temel Bilimler', count: 22, desc: 'Mikrobiyoloji 22 soruyla yer alır. Bakteriyoloji, Viroloji, Parazitoloji ve Mikoloji alt dallarından oluşur. İnfeksiyon hastalıkları ve farmakoloji ile doğrudan ilişkilidir.' };
    if (s.includes('patoloji')) return { category: 'Temel Bilimler', count: 22, desc: 'Patoloji 22 soruyla sınavın tam merkezinde yer alır. Dahiliye, pediatri ve cerrahi gibi tüm klinik branşların temelini oluşturur.' };
    if (s.includes('farmakoloji')) return { category: 'Temel Bilimler', count: 22, desc: 'Farmakoloji 22 soruyla temel bilimlerin zorlu derslerindendir. Mekanizma, endikasyon ve yan etki üçgeninde sorular gelir. Klinikle iç içedir.' };
    if (s.includes('dahiliye') || s.includes('i̇ç hastalıkları')) return { category: 'Klinik Bilimler', count: 29, desc: 'Dahiliye 29 soru ile klinik bilimlerin en hacimli dersidir. Kardiyoloji, gastroenteroloji, endokrinoloji, nefroloji ve hematoloji gibi majör sistemleri barındırır.' };
    if (s.includes('pediatri') || s.includes('çocuk')) return { category: 'Klinik Bilimler', count: 30, desc: 'Pediatri 30 soru ile klinik bilimlerde en çok sorunun geldiği tek branştır. Yenidoğan, genetik ve metabolizma gibi spesifik alt dalları vardır.' };
    if (s.includes('cerrahi')) return { category: 'Klinik Bilimler', count: 24, desc: 'Genel Cerrahi 24 soruyla klinikte önemli bir yer tutar. Gastrointestinal sistem cerrahisi, meme ve endokrin cerrahi öne çıkar. Anatomi ile çok yakındır.' };
    if (s.includes('kadın') || s.includes('doğum')) return { category: 'Klinik Bilimler', count: 12, desc: 'Kadın Hastalıkları ve Doğum 12 soruyla yer alır. Obstetri ve Jinekoloji olarak iki temel ayağı vardır. Sorular genellikle iyi kurgulanmış vakalar üzerinden gelir.' };
    if (s.includes('küçük stajlar')) return { category: 'Klinik Bilimler', count: 25, desc: 'Küçük Stajlar toplam 25 soru ile geniş bir yelpazeyi kapsar. Ortopedi, KBB, Göz, Nöroloji, Psikiyatri, Üroloji gibi dallardan doğrudan teşhis odaklı sorular gelir.' };
    return { category: 'TUS Branşı', count: '-', desc: 'Bu branş TUS hazırlık sürecinde kendi ağırlığı oranında önemli bir yere sahiptir. Soru çözümleri ve çıkmış soru analizleriyle eksiklerinizi kapatabilirsiniz.' };
  };

  const subjectInfo = getSubjectTusInfo(subject);

  return (
    <>
      {/* Detailed Info Modal */}
      {viewMode === 'info' && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ width: '90%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto', background: isLight ? '#f8fafc' : '#0f172a', borderRadius: '24px', padding: '2rem', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <button 
              onClick={() => { soundManager.playClick(); setViewMode('stats'); }} 
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-main)', transition: 'all 0.2s', zIndex: 10 }} 
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'} 
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <X size={24} />
            </button>
            <TusSubjectDetailView subject={subject} subjectInfo={subjectInfo} onBack={() => setViewMode('stats')} isModal={true} />
          </div>
        </div>
      )}

      <div style={{ padding: '2rem', maxWidth: '950px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out', display: viewMode === 'info' ? 'none' : 'block' }}>
      
      {/* Header and Back Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button 
            onClick={() => { soundManager.playClick(); onBack(); }} 
            onMouseEnter={() => soundManager.playHover()}
            style={{ 
              background: 'transparent', border: 'none', color: 'var(--text-muted)', 
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', 
              fontSize: '1rem', fontWeight: 600, padding: 0, marginBottom: '1.5rem'
            }}
          >
            <ArrowLeft size={20} /> TUS Merkezine Dön
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '20px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', boxShadow: '0 10px 25px var(--primary-glow)', transform: 'rotate(-5deg)' }}>
              <BrainCircuit size={32} />
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 0.3rem 0', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{subject}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0, fontWeight: 500 }}>
                Bu branştaki genel performansınız ve istatistikleriniz.
              </p>
            </div>
          </div>
        </div>
        {/* Subject TUS Info Button */}
        <button 
          onClick={() => { soundManager.playClick(); setViewMode('info'); }}
          onMouseEnter={(e) => { soundManager.playHover(); e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          style={{ 
            padding: '0.8rem 1.2rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.8rem',
            background: isLight ? 'linear-gradient(135deg, rgba(79, 70, 229, 0.05), rgba(79, 70, 229, 0.1))' : 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(79, 70, 229, 0.15))',
            border: '1px solid rgba(79, 70, 229, 0.2)', cursor: 'pointer', transition: 'all 0.2s', alignSelf: 'flex-start'
          }}
        >
          <Info size={24} color="var(--primary)" />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TUS'taki Yeri</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.1rem' }}>Detaylı Bilgi</div>
          </div>
        </button>
      </div>

      {/* Statistics Table Bar */}
      <div className="glass-panel" style={{ 
        padding: '1.25rem 1.5rem', borderRadius: '24px', marginBottom: '3rem',
        background: isLight ? '#ffffff' : 'rgba(30,41,59,0.5)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-float)',
        display: 'flex', flexWrap: 'nowrap', gap: '0.8rem', justifyContent: 'space-between', alignItems: 'center'
      }}>
        
        {/* Solved Questions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: 0, justifyContent: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
            <Target size={20} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1.1, whiteSpace: 'nowrap' }}>{displayStats.totalSolved}</div>
            <div style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Çözülen</div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '32px', background: 'var(--glass-border)', display: 'block', flexShrink: 0 }}></div>

        {/* Correct Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: 0, justifyContent: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)', flexShrink: 0 }}>
            <CheckCircle size={20} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--success)', lineHeight: 1.1, whiteSpace: 'nowrap' }}>{displayStats.correctCount}</div>
            <div style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Doğru</div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '32px', background: 'var(--glass-border)', display: 'block', flexShrink: 0 }}></div>

        {/* Wrong Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: 0, justifyContent: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)', flexShrink: 0 }}>
            <ArrowLeft size={20} style={{ transform: 'rotate(-45deg)' }} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--danger)', lineHeight: 1.1, whiteSpace: 'nowrap' }}>{displayStats.wrongCount}</div>
            <div style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Yanlış</div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '32px', background: 'var(--glass-border)', display: 'block', flexShrink: 0 }}></div>

        {/* Success Rate */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: 0, justifyContent: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', flexShrink: 0 }}>
            <TrendingUp size={20} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1.1, whiteSpace: 'nowrap' }}>%{displayStats.successRate}</div>
            <div style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Başarı</div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '32px', background: 'var(--glass-border)', display: 'block', flexShrink: 0 }}></div>

        {/* Net Score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: 0, justifyContent: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)', flexShrink: 0 }}>
            <Activity size={20} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--warning)', lineHeight: 1.1, whiteSpace: 'nowrap' }}>{netScore}</div>
            <div style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Net</div>
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* Classic Mode */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: '2rem 1.5rem', borderRadius: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center',
            border: isLight ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(16, 185, 129, 0.2)',
            background: isLight ? 'linear-gradient(to bottom, rgba(255,255,255,0.8), rgba(16,185,129,0.05))' : 'linear-gradient(to bottom, rgba(30,41,59,0.5), rgba(16,185,129,0.05))',
            position: 'relative', overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 15px 30px rgba(16, 185, 129, 0.15)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ 
            width: 60, height: 60, borderRadius: '18px', background: 'linear-gradient(135deg, #10b981, #059669)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', 
            marginBottom: '1rem', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)', transform: 'rotate(-5deg)'
          }}>
            <Target size={28} />
          </div>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>Klasikleşmiş Sorular</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5, fontSize: '0.95rem', flex: 1 }}>
            Veritabanındaki on binlerce geçmiş TUS sorusuna benzer kaliteli ve zorlu sorulardan rastgele seçerek klasik formatta çöz.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', background: 'rgba(0,0,0,0.03)', padding: '0.5rem 1rem', borderRadius: '16px' }}>
              <label style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>Soru Sayısı:</label>
              <input 
                type="number" 
                value={classicCount} 
                onChange={e => setClassicCount(e.target.value)}
                style={{
                  flex: 1, padding: '0.5rem', borderRadius: '12px', border: '2px solid #10b981',
                  background: isLight ? 'white' : 'rgba(0,0,0,0.3)', color: 'var(--text-main)',
                  fontSize: '1.1rem', fontWeight: 800, textAlign: 'center', outline: 'none'
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
              background: isClassicCountInvalid ? 'rgba(0,0,0,0.1)' : (isLight ? 'rgba(79, 70, 229, 0.08)' : 'linear-gradient(135deg, #10b981, #059669)'),
              color: isClassicCountInvalid ? 'var(--text-muted)' : (isLight ? '#4f46e5' : 'white'), 
              border: isLight ? '1px solid rgba(79, 70, 229, 0.3)' : 'none', 
              padding: '1rem 1.5rem', borderRadius: '14px',
              fontSize: '1.05rem', fontWeight: 800, cursor: isClassicCountInvalid ? 'not-allowed' : 'pointer',
              boxShadow: isClassicCountInvalid ? 'none' : (isLight ? 'rgba(0, 0, 0, 0.05) 0px 2px 4px' : '0 8px 20px rgba(16, 185, 129, 0.3)'),
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%', justifyContent: 'center'
            }}
            onMouseEnter={e => { soundManager.playHover(); if (!isClassicCountInvalid) e.currentTarget.style.transform = 'scale(1.02)'; }}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <CheckCircle size={22} /> Çözmeye Başla
          </button>
        </div>

        {/* AI Mode */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: '2rem 1.5rem', borderRadius: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center',
            border: isLight ? '1px solid rgba(79, 70, 229, 0.3)' : '1px solid rgba(79, 70, 229, 0.2)',
            background: isLight ? 'linear-gradient(to bottom, rgba(255,255,255,0.8), rgba(79, 70, 229, 0.05))' : 'linear-gradient(to bottom, rgba(30,41,59,0.5), rgba(79, 70, 229, 0.05))',
            position: 'relative', overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 15px 30px rgba(79, 70, 229, 0.15)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ 
            width: 60, height: 60, borderRadius: '18px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', 
            marginBottom: '1rem', boxShadow: '0 10px 25px var(--primary-glow)', transform: 'rotate(5deg)'
          }}>
            <BrainCircuit size={28} />
          </div>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>Yapay Zeka ile Üret</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5, fontSize: '0.95rem', flex: 1 }}>
            Yapay zeka asistanı ile bu dersten yepyeni, özgün ve ezber bozan klinik vakalar üretip hemen çözmeye başla.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', background: 'rgba(0,0,0,0.03)', padding: '0.5rem 1rem', borderRadius: '16px' }}>
              <label style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>Soru Sayısı:</label>
              <input 
                type="number" 
                value={aiCount} 
                onChange={e => setAiCount(e.target.value)}
                style={{
                  flex: 1, padding: '0.5rem', borderRadius: '12px', border: '2px solid var(--primary)',
                  background: isLight ? 'white' : 'rgba(0,0,0,0.3)', color: 'var(--text-main)',
                  fontSize: '1.1rem', fontWeight: 800, textAlign: 'center', outline: 'none'
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
              background: isAiCountInvalid ? 'rgba(0,0,0,0.1)' : (isLight ? 'rgba(79, 70, 229, 0.08)' : 'linear-gradient(135deg, var(--primary), var(--secondary))'),
              color: isAiCountInvalid ? 'var(--text-muted)' : (isLight ? '#4f46e5' : 'white'), 
              border: isLight ? '1px solid rgba(79, 70, 229, 0.3)' : 'none', 
              padding: '1rem 1.5rem', borderRadius: '14px',
              fontSize: '1.05rem', fontWeight: 800, cursor: isAiCountInvalid ? 'not-allowed' : 'pointer',
              boxShadow: isAiCountInvalid ? 'none' : (isLight ? 'rgba(0, 0, 0, 0.05) 0px 2px 4px' : '0 8px 20px var(--primary-glow)'),
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%', justifyContent: 'center'
            }}
            onMouseEnter={e => { soundManager.playHover(); if (!isAiCountInvalid) e.currentTarget.style.transform = 'scale(1.02)'; }}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <BrainCircuit size={22} /> Üret ve Çöz
          </button>
        </div>
      </div>

    </div>
    </>
  );
}

// --------------------------------------------------------------------------------------
// DETAILED TUS INFO VIEW COMPONENT
// --------------------------------------------------------------------------------------

interface TusSubjectDetailViewProps {
  subject: string;
  subjectInfo: any;
  onBack: () => void;
  isModal?: boolean;
}

function TusSubjectDetailView({ subject, subjectInfo, onBack, isModal }: TusSubjectDetailViewProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Mock detailed data based on subject
  const getSubjectDetails = (subj: string) => {
    const s = subj.toLowerCase();
    if (s.includes('anatomi')) {
      return {
        importance: "TUS Temel Bilimler testinde yer alan ve hafıza yükü en ağır derslerden biridir. İlk tekrarlarda nankör gelebilir ancak görsellerle pekiştirildiğinde kalıcılığı yüksektir.",
        topics: ["Nöroanatomi (%25)", "Lokomotor Sistem (%20)", "Dolaşım & Solunum (%15)", "Sindirim & Boşaltım (%15)", "Diğer Organlar (%25)"],
        strategy: "Asla düz metin okumayın, mutlaka atlas veya kendi çizimleriniz üzerinden çalışın. Nöroanatomi ve kemik/kas kısımları her sınavda belirleyici olur. Sınava son 1 ay kala hızlı tekrarı hayati önem taşır.",
        studyTime: "İlk tekrar için 10-12 gün, sonraki tekrarlar için 4-5 gün idealdir.",
        correlation: "Genel cerrahi (özellikle fıtıklar, safra), Ortopedi ve Nöroloji ile doğrudan ilişkilidir."
      };
    }
    if (s.includes('fizyoloji')) {
      return {
        importance: "Mekanizma anlamanın merkezidir. TUS'ta doğrudan sorulmasa bile, fizyolojiyi anlamadan patoloji ve dahiliye çözmek ezberden öteye geçemez.",
        topics: ["Hücre & Kas (%20)", "Kardiyovasküler (%20)", "Nörofizyoloji (%20)", "Endokrin (%15)", "Solunum & Böbrek (%25)"],
        strategy: "Ezberlemek yerine sistemlerin 'neden' böyle çalıştığına odaklanın. Bir hormonun etkisini ezberlemek yerine, vücudun o hormonu neden salgıladığını kavrayın.",
        studyTime: "İlk tekrar için 7-8 gün yeterlidir.",
        correlation: "Patoloji, Dahiliye, Farmakoloji"
      };
    }
    if (s.includes('biyokimya')) {
      return {
        importance: "En çok soru gelen temel bilim derslerindendir. Yolakların (pathways) karmaşıklığı yüzünden çok unutulur, ancak iyi çalışan birinin full çekme ihtimali en yüksek derslerden biridir.",
        topics: ["Karbonhidrat Metabolizması (%25)", "Lipit Metabolizması (%20)", "Protein & Enzimler (%20)", "Nükleik Asitler & Genetik (%20)", "Hormon Biyokimyası (%15)"],
        strategy: "Metabolizma yollarını büyük bir beyaz kağıda çizin. Hız kısıtlayıcı enzimleri ve hastalık (eksiklik) durumlarını özellikle fosforlu kalemle işaretleyin.",
        studyTime: "İlk tekrar 8-10 gün. Sınavdan hemen önce son 2 hafta mutlaka tekrar edilmeli.",
        correlation: "Pediatri (Metabolizma hastalıkları), Farmakoloji"
      };
    }
    if (s.includes('mikrobiyoloji')) {
      return {
        importance: "22 soru ile büyük öneme sahiptir. Bilgi çok nettir; 'bunu yapan bakteri hangisidir' tarzında nokta atışı sorular gelir.",
        topics: ["Bakteriyoloji (%40)", "Viroloji (%25)", "Parazitoloji (%15)", "Mikoloji (%10)", "Temel Mikrobiyoloji & İmmünoloji (%10)"],
        strategy: "Mikroorganizmaları hikayeleştirin. En sık görülen, en ölümcül olan, tipik bir besinle bulaşan gibi 'en'leri iyi bilin. İmmünoloji kısmı son yıllarda çok seçici gelmektedir.",
        studyTime: "İlk tekrar 8-9 gün. Bol soru çözerek pekişir.",
        correlation: "İntaniye (Enfeksiyon Hastalıkları), Pediatri, Farmakoloji (Antibiyotikler)"
      };
    }
    if (s.includes('patoloji')) {
      return {
        importance: "TUS'un altın anahtarıdır! 22 sorusu vardır ancak dolaylı olarak en az 40-50 klinik soruyu çözdürür.",
        topics: ["Genel Patoloji (Hücre, İltihap, Neoplazi) (%30)", "Kardiyovasküler & Solunum (%20)", "Gastrointestinal (%15)", "Genitoüriner (%15)", "Diğer Sistemler (%20)"],
        strategy: "Genel patoloji kısmını (özellikle Neoplazi ve İltihap) çok iyi oturtun. Makroskopik/Mikroskopik görünüm kelimelerini ('buzlu cam', 'yıldızlı gökyüzü') asla kaçırmayın.",
        studyTime: "İlk tekrar için en az 10-12 gün ayrılmalıdır.",
        correlation: "Dahiliye, Pediatri, Genel Cerrahi, Kadın Doğum (Kısaca TÜM KLİNİK)"
      };
    }
    if (s.includes('farmakoloji')) {
      return {
        importance: "Öğrencilerin en çok zorlandığı derslerdendir. İlaç isimleri yabancı gelse de, farmakoloji aslında bir mantık dersidir.",
        topics: ["Otonom Sinir Sistemi (%20)", "Kardiyovasküler İlaçlar (%20)", "Santral Sinir Sistemi (%20)", "Kemoterapötikler (Antibiyotikler vb.) (%25)", "Endokrin & Diğer (%15)"],
        strategy: "Otonom sinir sistemini (Sempatik/Parasempatik) tam kavramadan diğer sistemlere geçmeyin. İlaçların endikasyonlarından çok, yan etkileri (advers etkiler) sorulur.",
        studyTime: "İlk tekrar 9-10 gün. Sınava kadar en az 4-5 kez hızlıca üstünden geçilmelidir.",
        correlation: "Dahiliye, Kardiyoloji, Mikrobiyoloji"
      };
    }
    if (s.includes('dahiliye')) {
      return {
        importance: "29 sorusuyla klinik testinin belkemiğidir. Öğrenilecek derya deniz bilgi vardır.",
        topics: ["Kardiyoloji (%20)", "Gastroenteroloji (%15)", "Endokrinoloji (%15)", "Nefroloji (%15)", "Hematoloji & Onkoloji (%20)", "Romatoloji & Göğüs (%15)"],
        strategy: "En çok vaka sorusu gelen branştır. Semptom -> Teşhis -> En iyi tanı aracı -> İlk tedavi algoritmasını beyninizde kurun. Spot bilgi okumak yerine vaka sorusu çözün.",
        studyTime: "İlk okuma en az 14 gün sürer.",
        correlation: "Patoloji, Farmakoloji, Fizyoloji"
      };
    }
    if (s.includes('pediatri')) {
      return {
        importance: "30 soru ile sınavın tek başına en büyük branşıdır. Dahiliyenin çocuk versiyonu gibidir ancak kendine has genetik, metabolizma ve yenidoğan konuları vardır.",
        topics: ["Yenidoğan (%15)", "Beslenme & Gelişim (%10)", "Çocuk Enfeksiyon (%15)", "Çocuk Hematoloji/Onkoloji (%15)", "Genetik & Metabolizma (%15)", "Diğer Sistemler (%30)"],
        strategy: "Aşı takvimi, büyüme-gelişme kilometre taşları ve yenidoğan hastalıkları fix sorudur, firesiz geçilmeli. Geri kalanı için dahiliye temelinizi kullanın.",
        studyTime: "İlk tekrar 12-14 gün.",
        correlation: "Dahiliye, Biyokimya (Metabolizma), Mikrobiyoloji (Enfeksiyon)"
      };
    }
    if (s.includes('cerrahi')) {
      return {
        importance: "Klinik kısmında netleri hızlı artırılabilecek, nispeten daha dar kapsamlı ve net bir derstir.",
        topics: ["Meme & Endokrin (%25)", "Gastrointestinal Sistem (%35)", "Travma & Yanık (%15)", "Safra Yolları (%15)", "Genel İlkeler (%10)"],
        strategy: "Vaka sorularında 'en sık görülen komplikasyon', 'ilk yapılması gereken görüntüleme' ve 'altın standart tedavi' kalıplarına dikkat edin.",
        studyTime: "İlk tekrar 6-7 gün.",
        correlation: "Anatomi (özellikle batın ve boyun anatomisi), Patoloji"
      };
    }
    if (s.includes('kadın') || s.includes('doğum')) {
      return {
        importance: "12 soruluk kısa ama öz bir branş. Bilgiler sabittir, algoritma sorusu severler.",
        topics: ["Obstetri (Doğum) (%45)", "Jinekoloji (%40)", "Reprodüktif Endokrinoloji (%15)"],
        strategy: "Kanamalı gebe algoritmaları, fetal monitörizasyon ve jinekolojik kanserlerin evrelemelerine (özellikle over ve serviks) odaklanın.",
        studyTime: "İlk tekrar 5-6 gün.",
        correlation: "Genel Cerrahi, Endokrinoloji (Dahiliye)"
      };
    }

    // Default
    return {
      importance: "Klinik ve Temel bilimler arasında köprü kuran önemli bir TUS branşıdır. Detaylara boğulmadan spot bilgilere ve çıkmış sorulara hakim olmak gerekir.",
      topics: ["Temel Kavramlar (%30)", "Klinik Uygulamalar (%40)", "Tanı & Tedavi Algoritmaları (%30)"],
      strategy: "Önceki yıllarda sorulmuş soruların etrafında dönen yeni sorular yakalamak en mantıklı çalışma yöntemidir.",
      studyTime: "Ortalama 4-5 gün.",
      correlation: "Tüm temel ve klinik bilimler."
    };
  };

  const details = getSubjectDetails(subject);

  return (
    <div style={{ padding: isModal ? '0' : '2rem', maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* Header and Back Button */}
      {!isModal && (
        <button 
          onClick={() => { soundManager.playClick(); onBack(); }} 
          onMouseEnter={() => soundManager.playHover()}
          style={{ 
            background: 'transparent', border: 'none', color: 'var(--text-muted)', 
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', 
            fontSize: '1rem', fontWeight: 600, marginBottom: '2rem', padding: 0 
          }}
        >
          <ArrowLeft size={20} /> İstatistiklere Dön
        </button>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem', marginTop: isModal ? '1rem' : '0' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: '24px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', boxShadow: '0 10px 25px var(--primary-glow)', transform: 'rotate(-5deg)' }}>
          <BookOpen size={36} />
        </div>
        <div>
          <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>
            {subjectInfo.category} • Ortalama {subjectInfo.count} Soru
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 0.5rem 0', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{subject}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', margin: 0, fontWeight: 500, maxWidth: '600px' }}>
            Bu branşın TUS'taki stratejik önemi, konu dağılımları ve en verimli çalışma yöntemleri.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Sınavdaki Yeri ve Önemi */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', background: isLight ? '#fff' : 'rgba(30,41,59,0.5)', border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(79,70,229,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Sınavdaki Yeri ve Önemi</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '1rem', margin: 0 }}>
            {details.importance}
          </p>
        </div>

        {/* Çalışma Stratejisi */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', background: isLight ? '#fff' : 'rgba(30,41,59,0.5)', border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Çalışma Stratejisi</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '1rem', margin: 0 }}>
            {details.strategy}
          </p>
        </div>

        {/* Konu Dağılımı */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', background: isLight ? '#fff' : 'rgba(30,41,59,0.5)', border: '1px solid var(--glass-border)', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(245,158,11,0.1)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Tahmini Konu Dağılımı</h3>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {details.topics.map((topic, i) => (
              <div key={i} style={{ 
                background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.2)', 
                padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)',
                display: 'flex', alignItems: 'center', gap: '0.8rem', flex: '1 1 250px'
              }}>
                <ChevronRight size={18} color="var(--primary)" />
                <span style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '1.05rem' }}>{topic}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ekstra Bilgiler */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', gridColumn: '1 / -1' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '1rem', background: isLight ? '#fff' : 'rgba(30,41,59,0.5)', border: '1px solid var(--glass-border)' }}>
            <Clock size={28} color="var(--primary)" />
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Önerilen İlk Tekrar Süresi</div>
              <div style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 800 }}>{details.studyTime}</div>
            </div>
          </div>
          
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '1rem', background: isLight ? '#fff' : 'rgba(30,41,59,0.5)', border: '1px solid var(--glass-border)' }}>
            <Stethoscope size={28} color="var(--secondary)" />
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>En Yakın İlişkili Branşlar</div>
              <div style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 800 }}>{details.correlation}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
