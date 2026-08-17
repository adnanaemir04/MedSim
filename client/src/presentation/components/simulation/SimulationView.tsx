'use client';

import { useState } from 'react';
import { medCasesData } from '../../../infrastructure/data/casesData';
import { CheckCircle, XCircle, ArrowRight, HeartPulse, Activity, User, FileText, Stethoscope } from 'lucide-react';

interface SimulationViewProps {
  subject: string;
  caseIndex: number;
  generatedData?: any;
  initialAnswers?: number[];
  onBack: () => void;
  onCaseComplete: (pointsEarned: number, givenAnswers: number[]) => void;
}

export default function SimulationView({ subject, caseIndex, generatedData, initialAnswers, onBack, onCaseComplete }: SimulationViewProps) {
  const caseData = generatedData || medCasesData[subject];
  const caseTitle = generatedData?.title || (caseData.titles?.[caseIndex] || caseData.titles?.[0] || 'Klinik Vaka');
  const stages = caseData.stages;
  const patientInfo = caseData.patientInfo;
  
  const isReviewMode = initialAnswers !== undefined && initialAnswers.length > 0;

  const [currentStage, setCurrentStage] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(isReviewMode ? initialAnswers[0] : null);
  const [hasAnswered, setHasAnswered] = useState(isReviewMode);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [givenAnswers, setGivenAnswers] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const clinicalPhases = ["Anamnez", "Fizik Muayene", "Tetkik", "Tanı", "Tedavi", "İzlem"];
  const currentPhaseName = clinicalPhases[Math.min(currentStage, clinicalPhases.length - 1)];
  const stage = stages[currentStage];

  const handleOptionSelect = (optIndex: number) => {
    if (hasAnswered || isReviewMode) return;
    setSelectedOption(optIndex);
    setHasAnswered(true);
    setGivenAnswers(prev => [...prev, optIndex]);
    if (stage.options[optIndex].isCorrect) setEarnedPoints(prev => prev + 10);
  };

  const handleNextStage = () => {
    if (currentStage < stages.length - 1) {
      setCurrentStage(prev => prev + 1);
      if (isReviewMode) {
        setSelectedOption(initialAnswers[currentStage + 1]);
        setHasAnswered(true);
      } else {
        setSelectedOption(null);
        setHasAnswered(false);
      }
    } else {
      setIsFinished(true);
    }
  };

  const handleFinish = () => {
    if (!isReviewMode) {
      onCaseComplete(earnedPoints, givenAnswers);
    }
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

  const vitalItems = [
    { label: 'Tansiyon', value: patientInfo?.bloodPressure },
    { label: 'Nabız', value: patientInfo?.heartRate },
    { label: 'Ateş', value: patientInfo?.temperature },
    { label: 'SpO₂', value: patientInfo?.oxygenSaturation },
    { label: 'Solunum', value: patientInfo?.respiratoryRate },
  ].filter(v => v.value);

  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <span style={{ display: 'inline-block', padding: '0.3rem 0.8rem', background: 'rgba(79, 70, 229, 0.15)', color: 'var(--primary)', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
            {subject}
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>{caseTitle}</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: patientInfo ? '460px 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* ── LEFT: Patient Card ── */}
        {patientInfo && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: vitalItems.length > 0 ? '1.2fr 0.8fr' : '1fr', gap: '1rem' }}>
              {/* Anamnez ve Hasta Bilgileri */}
              <div className="glass-panel" style={{ padding: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <User size={14} /> Hasta Bilgileri & Anamnez
                </div>
                <p style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.2rem' }}>{patientInfo.name}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  {patientInfo.age} yaş · {patientInfo.gender}
                </p>
                
                {patientInfo.chiefComplaint && (
                  <div style={{ background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.15)', borderRadius: '12px', padding: '0.5rem 0.75rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#f43f5e', textTransform: 'uppercase' }}>Şikayet</span>
                    <p style={{ marginTop: '0.2rem', fontSize: '0.8rem', lineHeight: 1.4, fontStyle: 'italic', color: 'var(--text-main)' }}>
                      "{patientInfo.chiefComplaint}"
                    </p>
                  </div>
                )}

                {patientInfo.medicalHistory && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '12px', padding: '0.5rem 0.75rem' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>Özgeçmiş / Öykü</span>
                    <p style={{ marginTop: '0.2rem', fontSize: '0.8rem', lineHeight: 1.4, color: 'var(--text-main)' }}>
                      {patientInfo.medicalHistory}
                    </p>
                  </div>
                )}
              </div>

              {/* Vitals */}
              {vitalItems.length > 0 && (
                <div className="glass-panel" style={{ padding: '1.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#f43f5e', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <Activity size={14} /> Vitals
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {vitalItems.map((v, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0.5rem', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-sm)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{v.label}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>{v.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Physical Exam (Moved to take full width of bottom row since History is pulled up) */}
            {patientInfo.physicalExam && (
              <div className="glass-panel" style={{ padding: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#8b5cf6', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Stethoscope size={14} /> Fizik Muayene
                </div>
                <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: 'var(--text-muted)' }}>{patientInfo.physicalExam}</p>
              </div>
            )}

            {/* Vakadan Çık Button */}
            <button 
              onClick={onBack} 
              style={{ 
                alignSelf: 'flex-start',
                background: 'transparent', 
                border: '1.5px solid var(--glass-border)', 
                padding: '0.6rem 1.2rem', 
                borderRadius: '12px', 
                color: 'var(--text-muted)', 
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.4)';
                e.currentTarget.style.color = '#f43f5e';
                e.currentTarget.style.background = 'rgba(244, 63, 94, 0.05)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--glass-border)';
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              ← Vakadan Çık
            </button>
          </div>
        )}

        {/* ── RIGHT: Question Panel ── */}
        <div className="glass-panel" style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
          {/* Progress Bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'rgba(0,0,0,0.05)' }}>
            <div style={{ width: `${(currentStage / stages.length) * 100}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.5s ease' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.1rem' }}>{currentPhaseName}</span>
              <span style={{ fontSize: '0.85rem' }}>(Aşama {currentStage + 1} / {stages.length})</span>
            </div>
            <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Skor: {earnedPoints}</span>
          </div>

          <p style={{ fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2.25rem', fontWeight: 500 }}>
            {stage.text}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {stage.options.map((opt: any, index: number) => {
              const isSelected = selectedOption === index;
              const isCorrect = opt.isCorrect;
              let bgColor = 'rgba(255, 255, 255, 0.06)';
              let borderColor = 'rgba(255, 255, 255, 0.15)';

              if (hasAnswered) {
                if (isCorrect) { bgColor = 'rgba(16, 185, 129, 0.15)'; borderColor = 'var(--success)'; }
                else if (isSelected && !isCorrect) { bgColor = 'rgba(244, 63, 94, 0.15)'; borderColor = 'var(--danger)'; }
              } else if (isSelected) {
                borderColor = 'var(--primary)';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    width: '100%', padding: '1rem 1.2rem', textAlign: 'left',
                    background: bgColor, border: `2px solid ${borderColor}`,
                    borderRadius: 'var(--radius-lg)', color: 'var(--text-main)',
                    backdropFilter: 'blur(10px)',
                    cursor: hasAnswered ? 'default' : 'pointer',
                    transition: 'var(--transition)',
                    fontSize: '0.95rem', fontWeight: 600,
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <span style={{ flex: 1, paddingRight: '0.5rem' }}>{opt.text}</span>
                  {hasAnswered && isCorrect && <CheckCircle color="var(--success)" size={20} style={{ flexShrink: 0 }} />}
                  {hasAnswered && isSelected && !isCorrect && <XCircle color="var(--danger)" size={20} style={{ flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>

          {hasAnswered && (
            <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-lg)', borderLeft: `4px solid ${stage.options[selectedOption!].isCorrect ? 'var(--success)' : 'var(--danger)'}` }}>
              <h4 style={{ marginBottom: '0.4rem', color: stage.options[selectedOption!].isCorrect ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
                {stage.options[selectedOption!].isCorrect ? '✓ Doğru Karar!' : '✗ Yanlış Karar'}
              </h4>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.92rem' }}>
                {stage.options[selectedOption!].feedback}
              </p>
              <div style={{ marginTop: '1.25rem', display: 'flex', gap: '1rem' }}>
                {isReviewMode && currentStage > 0 && (
                  <button
                    className="btn-secondary"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--glass-bg)', color: 'var(--text-main)', border: '1px solid var(--glass-border)' }}
                    onClick={() => {
                      setCurrentStage(prev => prev - 1);
                      setSelectedOption(initialAnswers![currentStage - 1]);
                    }}
                  >
                    ← Önceki Aşama
                  </button>
                )}
                <button
                  className="btn-primary"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  onClick={handleNextStage}
                >
                  {currentStage < stages.length - 1 ? 'Sonraki Aşama' : (isReviewMode ? 'İncelemeyi Bitir' : 'Vakayı Bitir')}
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
