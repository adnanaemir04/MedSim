'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ArrowRight, CheckCircle, XCircle, BrainCircuit, RefreshCw, LogOut, Loader2 } from 'lucide-react';
import { getTusConceptExplanation } from '../../../infrastructure/api/simulationApi';

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
  onBack: () => void;
}

export default function TusSolveView({ subject, userEmail, onBack }: TusSolveViewProps) {
  const [questions, setQuestions] = useState<TusQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [result, setResult] = useState<{ isCorrect: boolean, correctOption: string, explanation: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    fetchQuestions();
  }, [subject]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      // Fetch batch of 5 questions for this subject
      const res = await fetch(`http://localhost:5211/api/Tus/questions?count=5&subject=${encodeURIComponent(subject)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setQuestions(data);
          setCurrentIndex(0);
          resetState();
        } else {
          // If no questions found
          setQuestions([]);
        }
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
  };

  const handleAnswerSubmit = async (optionKey: string) => {
    if (selectedOption || !questions[currentIndex]) return; // prevent multiple clicks
    setSelectedOption(optionKey);
    
    try {
      const currentQuestionId = questions[currentIndex].id;
      const res = await fetch('http://localhost:5211/api/Tus/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          questionId: currentQuestionId,
          selectedOption: optionKey
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        
        // As soon as the result is fetched, trigger AI explanation in the background
        fetchAiExplanation(currentQuestionId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAiExplanation = async (questionId: string) => {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button 
            onClick={onBack}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', marginBottom: '0.5rem' }}
          >
            <LogOut size={16} /> Ders Seçimine Dön
          </button>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            {subject} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>Soru Çözümü</span>
          </h2>
        </div>
      </div>

      {/* Question Card */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
        
        {/* Loading overlay for next batch */}
        {isLoading && questions.length > 0 && (
          <div style={{ position: 'absolute', inset: 0, background: 'var(--glass-bg)', backdropFilter: 'blur(4px)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'inherit' }}>
            <Loader2 size={32} className="spin" color="var(--primary)" />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--primary)', background: 'rgba(79, 70, 229, 0.1)', padding: '0.3rem 0.8rem', borderRadius: '20px' }}>
            Soru {currentIndex + 1}
          </span>
          <span>{currentQ.category}</span>
        </div>

        <p style={{ fontSize: '1.15rem', lineHeight: 1.7, fontWeight: 500, color: 'var(--text-main)' }}>
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
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '1rem 1.2rem',
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
                  width: '32px', height: '32px', 
                  borderRadius: '8px', 
                  background: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                  color: isSelected ? 'white' : 'var(--text-main)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, flexShrink: 0
                }}>
                  {opt.key}
                </div>
                <span style={{ fontSize: '1rem', lineHeight: 1.5 }}>{opt.text}</span>
                
                {result && opt.key === result.correctOption && <CheckCircle color="var(--success)" size={24} style={{ marginLeft: 'auto' }} />}
                {result && isSelected && !result.isCorrect && <XCircle color="var(--danger)" size={24} style={{ marginLeft: 'auto' }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results & Explanations */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.5s ease-out' }}>
          
          {/* Base Explanation */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: `4px solid ${result.isCorrect ? 'var(--success)' : 'var(--danger)'}` }}>
            <h4 style={{ marginBottom: '0.8rem', color: result.isCorrect ? 'var(--success)' : 'var(--danger)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {result.isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />}
              {result.isCorrect ? 'Tebrikler, Doğru Cevap!' : `Yanlış Cevap. Doğru Seçenek: ${result.correctOption}`}
            </h4>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{result.explanation}</p>
          </div>

          {/* AI Concept Explanation */}
          <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#8b5cf6', fontWeight: 700 }}>
              <BrainCircuit size={20} />
              Yapay Zeka Kavram Analizi
            </div>
            
            {isAiLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
                <Loader2 size={20} className="spin" color="#8b5cf6" />
                <span>Gemini bu sorudaki önemli kavramları sizin için inceliyor...</span>
              </div>
            ) : (
              <div style={{ color: 'var(--text-main)', lineHeight: 1.7, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                {aiExplanation}
              </div>
            )}
          </div>

          <button 
            className="btn-primary"
            style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1.1rem' }}
            onClick={handleNextQuestion}
          >
            Sonraki Soru <ArrowRight size={20} />
          </button>

        </div>
      )}

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
  );
}
