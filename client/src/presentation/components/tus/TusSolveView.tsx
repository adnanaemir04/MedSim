'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ArrowRight, ArrowLeft, CheckCircle, XCircle, BrainCircuit, RefreshCw, LogOut, Loader2 } from 'lucide-react';
import { getTusConceptExplanation, getTusQuestions, submitTusAnswer } from '../../../infrastructure/api/simulationApi';

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

interface TusSolveViewProps {
  subject: string;
  userEmail: string;
  count: number;
  onBack: () => void;
  onCorrectAnswer?: (points: number) => void;
}

export default function TusSolveView({ subject, userEmail, count, onBack, onCorrectAnswer }: TusSolveViewProps) {
  const [questions, setQuestions] = useState<TusQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [result, setResult] = useState<{ isCorrect: boolean, correctOption: string, explanation: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);

  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    fetchQuestions();
  }, [subject]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const data = await getTusQuestions(count, subject);
      if (data && data.length > 0) {
        setQuestions(data);
        setCurrentIndex(0);
        resetState();
      } else {
        setQuestions([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setSelectedOption(null);
    setResult(null);
    setAiExplanation(null);
    setIsAiLoading(false);
    setIsAiPanelOpen(false);
  };

  const handleAnswerSubmit = async (optionKey: string) => {
    if (selectedOption || !questions[currentIndex]) return; // prevent multiple clicks
    setSelectedOption(optionKey);
    
    try {
      const currentQuestionId = questions[currentIndex].id;
      const data = await submitTusAnswer(userEmail, currentQuestionId, optionKey);
      
      setResult(data);
      if (data.isCorrect && onCorrectAnswer) {
        onCorrectAnswer(10);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAiExplanation = async (questionId: string) => {
    setIsAiPanelOpen(true);
    setIsAiLoading(true);
    setAiExplanation(null);
    try {
      const explanation = await getTusConceptExplanation(questionId);
      setAiExplanation(explanation);
    } catch (err) {
      console.error("AI Explanation Error:", err);
      setAiExplanation("Kavram açıklaması yüklenirken bir hata oluştu.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetState();
    } else {
      // End of batch, fetch more
      fetchQuestions();
    }
  };

  if (isLoading && questions.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Loader2 size={48} className="spin" style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
        <h3 style={{ color: 'var(--text-main)' }}>Sorular Yükleniyor...</h3>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <XCircle size={40} color="var(--danger)" />
        </div>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Soru Bulunamadı</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '400px' }}>
          Bu derse ait sistemde kayıtlı soru bulunmamaktadır veya tüm soruları çözdünüz.
        </p>
        <button className="btn-primary" onClick={onBack}>Geri Dön</button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const optionsList = [
    { key: 'A', text: currentQ.optionA },
    { key: 'B', text: currentQ.optionB },
    { key: 'C', text: currentQ.optionC },
    { key: 'D', text: currentQ.optionD },
    { key: 'E', text: currentQ.optionE }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 90,
      background: isLight ? '#f1f5f9' : '#020617',
      overflowY: 'auto',
      padding: '2rem 1.5rem',
      boxSizing: 'border-box'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        maxWidth: '1000px',
        margin: '0 auto',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        width: '100%',
        position: 'relative'
      }}>
        
        {/* Back Button Row */}
        <div style={{ position: 'absolute', left: '-9.6rem', top: '1.9rem' }}>
          <button 
            onClick={onBack}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.6rem', 
              background: isLight ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.6)', 
              border: isLight ? '1px solid rgba(79, 70, 229, 0.25)' : '1px solid rgba(99, 102, 241, 0.25)', 
              color: 'var(--text-main)', cursor: 'pointer', fontSize: '0.9rem', 
              padding: '0.6rem 1.3rem', borderRadius: '30px', transition: 'all 0.3s', 
              fontWeight: 700, backdropFilter: 'blur(12px)', 
              boxShadow: isLight ? '0 4px 15px rgba(79,70,229,0.08)' : '0 4px 20px rgba(0,0,0,0.3)',
            }}
            onMouseEnter={e => { 
              e.currentTarget.style.background = 'var(--primary)'; 
              e.currentTarget.style.color = 'white'; 
              e.currentTarget.style.transform = 'translateX(-5px)'; 
              e.currentTarget.style.boxShadow = '0 5px 15px var(--primary-glow)';
            }}
            onMouseLeave={e => { 
              e.currentTarget.style.background = isLight ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.6)'; 
              e.currentTarget.style.color = 'var(--text-main)'; 
              e.currentTarget.style.transform = 'translateX(0)'; 
              e.currentTarget.style.boxShadow = isLight ? '0 4px 15px rgba(79,70,229,0.08)' : '0 4px 20px rgba(0,0,0,0.3)';
            }}
          >
            <ArrowLeft size={16} /> Geri Dön
          </button>
        </div>

      {/* Header */}
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 2rem', borderRadius: '20px', background: isLight ? 'var(--glass-bg)' : 'rgba(15, 23, 42, 0.85)', border: isLight ? '1px solid var(--glass-border)' : '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              {subject}
            </h2>
            <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>Soru Çözümü</span>
          </div>
          
          {questions.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ 
                fontSize: '0.75rem', fontWeight: 800, 
                background: 'linear-gradient(90deg, rgba(79, 70, 229, 0.15), rgba(139, 92, 246, 0.15))',
                color: '#8b5cf6', padding: '0.3rem 0.8rem', borderRadius: '20px',
                letterSpacing: '0.05em', textTransform: 'uppercase',
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}>
                {questions[currentIndex].category}
              </span>
            </div>
          )}
        </div>
      </div>


      {/* Question Layout Container */}
      <div style={{ position: 'relative' }}>
        
        {/* Loading overlay for next batch */}
        {isLoading && questions.length > 0 && (
          <div style={{ position: 'absolute', inset: 0, background: 'var(--glass-bg)', backdropFilter: 'blur(4px)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '24px' }}>
            <Loader2 size={32} className="spin" color="var(--primary)" />
          </div>
        )}

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: result ? '1.2fr 1fr' : '1fr', 
          gap: '2rem',
          alignItems: 'start'
        }}>
          {/* ── Left Side: Question & Options ── */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem', borderRadius: '24px', background: isLight ? 'var(--glass-bg)' : 'rgba(15, 23, 42, 0.85)', border: isLight ? '1px solid var(--glass-border)' : '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--primary)', background: 'rgba(79, 70, 229, 0.1)', padding: '0.3rem 0.8rem', borderRadius: '20px' }}>
                Soru {currentIndex + 1}
              </span>
            </div>
            <p style={{ fontSize: '1.25rem', lineHeight: 1.7, fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              {currentQ.questionText}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {optionsList.map(opt => {
                const isSelected = selectedOption === opt.key;
                let bgColor = 'rgba(255,255,255,0.03)';
                let borderColor = 'rgba(255,255,255,0.1)';
                
                if (result) {
                  if (opt.key === result.correctOption) {
                    bgColor = 'rgba(16, 185, 129, 0.1)';
                    borderColor = 'var(--success)';
                  } else if (isSelected) {
                    bgColor = 'rgba(244, 63, 94, 0.1)';
                    borderColor = 'var(--danger)';
                  }
                } else if (isSelected) {
                  borderColor = 'var(--primary)';
                }

                return (
                  <button
                    key={opt.key}
                    onClick={() => handleAnswerSubmit(opt.key)}
                    disabled={!!result}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.8rem',
                      padding: '0.8rem 1rem',
                      background: bgColor,
                      border: `2px solid ${borderColor}`,
                      borderRadius: '12px',
                      color: 'var(--text-main)',
                      textAlign: 'left',
                      cursor: result ? 'default' : 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: result && opt.key !== result.correctOption && !isSelected ? 0.6 : 1
                    }}
                  >
                    <div style={{ 
                      width: '28px', height: '28px', 
                      borderRadius: '6px', 
                      background: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                      color: isSelected ? 'white' : 'var(--text-main)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, flexShrink: 0
                    }}>
                      {opt.key}
                    </div>
                    <span style={{ fontSize: '1rem', lineHeight: 1.5, fontWeight: 650, color: 'var(--text-main)' }}>{opt.text}</span>
                    
                    {result && opt.key === result.correctOption && <CheckCircle color="var(--success)" size={20} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                    {result && isSelected && !result.isCorrect && <XCircle color="var(--danger)" size={20} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Right Side: Classic Explanation ── */}
          {result && (
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: 'fit-content', animation: 'fadeIn 0.5s ease-out', padding: '2rem', borderRadius: '24px', gap: '1.2rem', background: isLight ? 'var(--glass-bg)' : 'rgba(15, 23, 42, 0.85)', border: isLight ? '1px solid var(--glass-border)' : '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ padding: '1.5rem', borderRadius: '16px', background: result.isCorrect ? 'rgba(16, 185, 129, 0.05)' : 'rgba(244, 63, 94, 0.05)', borderLeft: `4px solid ${result.isCorrect ? 'var(--success)' : 'var(--danger)'}`, flex: 1, boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)' }}>
                <h4 style={{ margin: '0 0 0.8rem 0', color: result.isCorrect ? 'var(--success)' : 'var(--danger)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                  {result.isCorrect ? <CheckCircle size={22} /> : <XCircle size={22} />}
                  {result.isCorrect ? 'Tebrikler, Doğru Cevap!' : `Yanlış Cevap. Doğru Seçenek: ${result.correctOption}`}
                </h4>
                <p style={{ color: 'var(--text-main)', lineHeight: 1.7, margin: 0, fontSize: '0.95rem' }}>{result.explanation}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <button 
                  className="btn-primary"
                  style={{ padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1rem', width: '100%' }}
                  onClick={handleNextQuestion}
                >
                  Sonraki Soru <ArrowRight size={18} />
                </button>

                {!isAiPanelOpen && (
                  <button 
                    onClick={() => fetchAiExplanation(questions[currentIndex].id)}
                    style={{
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      color: '#8b5cf6', padding: '0.7rem 1.5rem', borderRadius: '12px',
                      fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.1)', width: '100%'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <BrainCircuit size={18} /> Yapay Zeka Analizi İste
                  </button>
                )}
              </div>

              {/* ── AI Concept Explanation Inside the Card ── */}
              {isAiPanelOpen && (
                <div style={{ 
                  marginTop: '1.2rem',
                  padding: '1.2rem',
                  borderRadius: '16px',
                  background: isLight ? 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(139, 92, 246, 0.03))' : 'linear-gradient(135deg, rgba(30,41,59,0.5), rgba(139, 92, 246, 0.05))',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  boxShadow: '0 8px 32px rgba(139, 92, 246, 0.05)',
                  display: 'flex', 
                  flexDirection: 'column', 
                  animation: 'fadeIn 0.3s ease-out'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', color: '#8b5cf6', fontWeight: 800, fontSize: '1.05rem', borderBottom: '1px solid rgba(139, 92, 246, 0.1)', paddingBottom: '0.6rem' }}>
                    <BrainCircuit size={18} /> Yapay Zeka Analiz Raporu
                  </div>
                  
                  {isAiLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
                      <Loader2 size={24} className="spin" color="#8b5cf6" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.02em' }}>Gemini vaka analizi oluşturuyor...</span>
                    </div>
                  ) : (
                    <div style={{ 
                      color: 'var(--text-main)', 
                      lineHeight: 1.7, 
                      fontSize: '0.9rem', 
                      whiteSpace: 'pre-wrap',
                      background: 'rgba(255,255,255,0.01)',
                      padding: '0.8rem',
                      borderRadius: '10px'
                    }}>
                      {aiExplanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  </div>
  );
}
