'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { BookOpen, CheckCircle, XCircle, Award, Target } from 'lucide-react';

interface TusQuestion {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string;
  category: string;
  subject: string;
}

interface TusCenterProps {
  userEmail: string;
}

export default function TusCenter({ userEmail }: TusCenterProps) {
  const [questions, setQuestions] = useState<TusQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [result, setResult] = useState<{ isCorrect: boolean, correctOption: string, explanation: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [stats, setStats] = useState({ totalSolved: 0, correctCount: 0, wrongCount: 0, successRate: 0 });

  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    fetchQuestions();
    fetchStats();
  }, []);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5211/api/Tus/questions?count=5');
      if (res.ok) {
        setQuestions(await res.json());
        setCurrentIndex(0);
        setSelectedOption(null);
        setResult(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`http://localhost:5211/api/Tus/stats?email=${userEmail}`);
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!selectedOption || !questions[currentIndex]) return;
    
    try {
      const res = await fetch('http://localhost:5211/api/Tus/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          questionId: questions[currentIndex].id,
          selectedOption
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        fetchStats(); // Update stats immediately
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setResult(null);
    } else {
      fetchQuestions(); // Load new batch
    }
  };

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-main)' }}>Sorular Yükleniyor...</div>;
  }

  if (questions.length === 0) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-main)' }}>Soru bulunamadı.</div>;
  }

  const currentQuestion = questions[currentIndex];

  const statBoxStyle = {
    background: isLight ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.05)',
    padding: '1.2rem',
    borderRadius: '16px',
    border: isLight ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.1)',
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <BookOpen size={36} color="#ef4444" />
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: isLight ? '#1e293b' : 'white' }}>TUS Merkezi</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Tıpta Uzmanlık Sınavı Soru Çözüm ve Hazırlık Platformu</p>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={statBoxStyle}>
          <Target size={24} color="#3b82f6" />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Çözülen Soru</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: isLight ? '#1e293b' : 'white' }}>{stats.totalSolved}</span>
        </div>
        <div style={statBoxStyle}>
          <CheckCircle size={24} color="#10b981" />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Doğru</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{stats.correctCount}</span>
        </div>
        <div style={statBoxStyle}>
          <XCircle size={24} color="#ef4444" />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Yanlış</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>{stats.wrongCount}</span>
        </div>
        <div style={statBoxStyle}>
          <Award size={24} color="#f59e0b" />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Başarı Oranı</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>%{stats.successRate}</span>
        </div>
      </div>

      {/* Question Card */}
      <div style={{ 
        background: isLight ? 'white' : 'var(--bg-panel)',
        borderRadius: '24px',
        border: isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)',
        padding: '2rem',
        boxShadow: isLight ? '0 10px 30px rgba(0,0,0,0.05)' : '0 10px 30px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column', gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.3rem 0.8rem', borderRadius: '12px' }}>
            {currentQuestion.category} - {currentQuestion.subject}
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Soru {currentIndex + 1} / {questions.length}
          </span>
        </div>
        
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: isLight ? '#1e293b' : 'white', lineHeight: '1.6' }}>
          {currentQuestion.questionText}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {['A', 'B', 'C', 'D', 'E'].map(optChar => {
            const optKey = `option${optChar}` as keyof TusQuestion;
            const text = currentQuestion[optKey];
            
            let bg = isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)';
            let border = isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)';
            let textColor = isLight ? '#334155' : 'var(--text-main)';
            
            if (result) {
              if (optChar === result.correctOption) {
                bg = 'rgba(16, 185, 129, 0.1)';
                border = '1px solid #10b981';
                textColor = '#10b981';
              } else if (optChar === selectedOption && !result.isCorrect) {
                bg = 'rgba(239, 68, 68, 0.1)';
                border = '1px solid #ef4444';
                textColor = '#ef4444';
              }
            } else if (selectedOption === optChar) {
              bg = 'rgba(59, 130, 246, 0.1)';
              border = '1px solid #3b82f6';
              textColor = '#3b82f6';
            }

            return (
              <button
                key={optChar}
                onClick={() => !result && setSelectedOption(optChar)}
                disabled={!!result}
                style={{
                  display: 'flex', gap: '1rem', alignItems: 'center',
                  padding: '1rem 1.2rem',
                  borderRadius: '12px',
                  background: bg,
                  border: border,
                  color: textColor,
                  fontWeight: 600,
                  fontSize: '1rem',
                  textAlign: 'left',
                  cursor: result ? 'default' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontWeight: 800 }}>{optChar})</span>
                <span>{text}</span>
              </button>
            );
          })}
        </div>

        {!result ? (
          <button 
            className="btn-primary" 
            onClick={handleAnswerSubmit} 
            disabled={!selectedOption}
            style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '1rem', opacity: selectedOption ? 1 : 0.5 }}
          >
            Cevapla
          </button>
        ) : (
          <div style={{ 
            marginTop: '1rem', padding: '1.5rem', borderRadius: '16px',
            background: result.isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: result.isCorrect ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: result.isCorrect ? '#10b981' : '#ef4444', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {result.isCorrect ? <CheckCircle /> : <XCircle />}
              {result.isCorrect ? 'Doğru Cevap!' : 'Yanlış Cevap!'}
            </h4>
            <p style={{ color: isLight ? '#334155' : 'var(--text-main)', lineHeight: '1.6', margin: 0, fontWeight: 500 }}>
              <span style={{ fontWeight: 800 }}>Açıklama: </span>
              {result.explanation}
            </p>
            <button className="btn-primary" onClick={handleNextQuestion} style={{ marginTop: '1.5rem', width: '100%' }}>
              Sonraki Soru
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
