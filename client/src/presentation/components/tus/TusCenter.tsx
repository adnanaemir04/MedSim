'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { BookOpen, Stethoscope, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { getTusSubjects, TusSubjectDto, generateTusQuestions } from '../../../infrastructure/api/simulationApi';
import TusSolveView from './TusSolveView';

interface TusCenterProps {
  userEmail: string;
}

export default function TusCenter({ userEmail }: TusCenterProps) {
  const [subjects, setSubjects] = useState<TusSubjectDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  
  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setIsLoading(true);
    try {
      const data = await getTusSubjects();
      setSubjects(data);
    } catch (e) {
      console.error("Dersler yüklenirken hata:", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (activeSubject) {
    return <TusSolveView subject={activeSubject} userEmail={userEmail} onBack={() => setActiveSubject(null)} />;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <Stethoscope size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>TUS Merkezi</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Uzmanlık sınavı için ders bazlı simülasyon ve yapay zeka destekli soru çözümü</p>
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
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'all 0.3s' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }} onClick={() => setActiveSubject(subject.name)}>
                <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <BookOpen size={20} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#8b5cf6', fontSize: '0.8rem', fontWeight: 700, background: 'rgba(139, 92, 246, 0.1)', padding: '0.3rem 0.6rem', borderRadius: '12px' }}>
                  <Sparkles size={14} /> AI Destekli
                </div>
              </div>
              
              <div style={{ cursor: 'pointer' }} onClick={() => setActiveSubject(subject.name)}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.2rem 0', color: 'var(--text-main)' }}>{subject.name}</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Toplam {subject.questionCount} soru</p>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem' }}
                  onClick={() => setActiveSubject(subject.name)}
                >
                  Çözmeye Başla
                </button>
                <button 
                  className="btn-secondary" 
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem', background: 'var(--glass-bg)', color: 'var(--text-main)', border: '1px solid var(--glass-border)' }}
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (isGenerating === subject.name) return;
                    setIsGenerating(subject.name);
                    try {
                      await generateTusQuestions(subject.name, 5);
                      await fetchSubjects();
                    } catch (err) {
                      console.error("Soru üretme hatası:", err);
                      alert("Soru üretilirken hata oluştu.");
                    } finally {
                      setIsGenerating(null);
                    }
                  }}
                  disabled={isGenerating === subject.name}
                >
                  {isGenerating === subject.name ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
                  {isGenerating === subject.name ? 'Üretiliyor...' : '5 Yeni Soru Üret'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        .hover-scale:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          border-color: var(--primary);
        }
      `}</style>
    </div>
  );
}
