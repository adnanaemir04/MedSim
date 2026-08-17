'use client';

import { useState } from 'react';
import { medCasesData } from '../../../infrastructure/data/casesData';
import { CheckCircle, XCircle, ArrowRight, HeartPulse } from 'lucide-react';

interface SimulationViewProps {
  subject: string;
  caseIndex: number;
  onBack: () => void;
  onCaseComplete: (pointsEarned: number) => void;
}

export default function SimulationView({ subject, caseIndex, onBack, onCaseComplete }: SimulationViewProps) {
  const caseData = medCasesData[subject];
  const caseTitle = caseData.titles[caseIndex] || caseData.titles[0];
  const stages = caseData.stages;

  const [currentStage, setCurrentStage] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const stage = stages[currentStage];

  const handleOptionSelect = (optIndex: number) => {
    if (hasAnswered) return;
    setSelectedOption(optIndex);
    setHasAnswered(true);

    const isCorrect = stage.options[optIndex].isCorrect;
    if (isCorrect) {
      setEarnedPoints(prev => prev + 10);
    }
  };

  const handleNextStage = () => {
    if (currentStage < stages.length - 1) {
      setCurrentStage(prev => prev + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleFinish = () => {
    onCaseComplete(earnedPoints);
    onBack();
  };

  if (isFinished) {
    return (
      <div className="glass-panel" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center', padding: '4rem 2rem' }}>
        <HeartPulse size={64} color="var(--success)" style={{ margin: '0 auto 1.5rem auto' }} />
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Vaka Tamamlandı!</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '2rem' }}>
          Bu vakadan toplam <strong style={{ color: 'var(--primary)', fontSize: '1.5rem' }}>{earnedPoints}</strong> puan kazandınız.
        </p>
        <button className="btn-primary" onClick={handleFinish} style={{ width: '100%', maxWidth: '300px' }}>
          Dashboard'a Dön
        </button>
      </div>
    );
  }

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <span style={{ display: 'inline-block', padding: '0.3rem 0.8rem', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {subject}
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>{caseTitle}</h2>
        </div>
        <button onClick={onBack} style={{ background: 'transparent', border: '1px solid var(--glass-border)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', cursor: 'pointer' }}>
          Vakadan Çık
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '3rem', position: 'relative', overflow: 'hidden' }}>
        {/* Progress Bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'rgba(0,0,0,0.05)' }}>
          <div style={{ width: `${((currentStage) / stages.length) * 100}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.5s ease' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', color: 'var(--text-muted)' }}>
          <span style={{ fontWeight: 600 }}>Aşama {currentStage + 1} / {stages.length}</span>
          <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Skor: {earnedPoints}</span>
        </div>

        <p style={{ fontSize: '1.25rem', lineHeight: 1.6, marginBottom: '3rem', fontWeight: 500 }}>
          {stage.text}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {stage.options.map((opt: any, index: number) => {
            const isSelected = selectedOption === index;
            const isCorrect = opt.isCorrect;
            let bgColor = 'rgba(255, 255, 255, 0.05)';
            let borderColor = 'var(--glass-border)';
            
            if (hasAnswered) {
              if (isCorrect) {
                bgColor = 'rgba(16, 185, 129, 0.1)';
                borderColor = 'var(--success)';
              } else if (isSelected && !isCorrect) {
                bgColor = 'rgba(244, 63, 94, 0.1)';
                borderColor = 'var(--danger)';
              }
            } else if (isSelected) {
              borderColor = 'var(--primary)';
            }

            return (
              <button 
                key={index}
                onClick={() => handleOptionSelect(index)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  width: '100%', padding: '1.25rem', textAlign: 'left',
                  background: bgColor, border: `2px solid ${borderColor}`,
                  borderRadius: 'var(--radius-lg)', color: 'var(--text-main)',
                  cursor: hasAnswered ? 'default' : 'pointer',
                  transition: 'var(--transition)',
                  fontSize: '1.05rem', fontWeight: 500
                }}
              >
                <span>{opt.text}</span>
                {hasAnswered && isCorrect && <CheckCircle color="var(--success)" />}
                {hasAnswered && isSelected && !isCorrect && <XCircle color="var(--danger)" />}
              </button>
            );
          })}
        </div>

        {hasAnswered && (
          <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-lg)', borderLeft: `4px solid ${stage.options[selectedOption!].isCorrect ? 'var(--success)' : 'var(--danger)'}` }}>
            <h4 style={{ marginBottom: '0.5rem', color: stage.options[selectedOption!].isCorrect ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
              {stage.options[selectedOption!].isCorrect ? 'Doğru Karar!' : 'Yanlış Karar'}
            </h4>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {stage.options[selectedOption!].feedback}
            </p>
            
            <button 
              className="btn-primary" 
              style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              onClick={handleNextStage}
            >
              {currentStage < stages.length - 1 ? 'Sonraki Aşama' : 'Vakayı Bitir'}
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
