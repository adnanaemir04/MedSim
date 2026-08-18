'use client';

import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
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
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const caseData = generatedData || medCasesData[subject];
  const caseTitle = generatedData?.title || (caseData.titles?.[caseIndex] || caseData.titles?.[0] || 'Klinik Vaka');
  const stages = caseData.stages;
  const patientInfo = {
    name: "Ahmet Yılmaz",
    age: 58,
    gender: "Erkek",
    chiefComplaint: "Yaklaşık 3 gündür devam eden zonklayıcı tarzda baş ağrısı, aralıklı baş dönmesi ve eforla gelen hafif nefes darlığı şikayeti.",
    medicalHistory: "Kronik Hastalıklar: Hipertansiyon (5 yıldır, düzensiz ilaç kullanımı), Tip 2 Diabetes Mellitus (Diyetle regüle).\nAlışkanlıklar: Aktif sigara içicisi (20 paket/yıl), alkol kullanımı yok.\nKullandığı İlaçlar: Amlodipin 5mg 1x1 (Düzensiz), Metformin 500mg 2x1.\nSoygeçmiş: Babasında 62 yaşında Myokard Enfarktüsü (MI) öyküsü mevcut.\nAlerjiler: Penisilin alerjisi bildiriyor (Döküntü).",
    physicalExam: "Genel Durum: İyi, bilinci açık, koopere ve oryante.\nKardiyovasküler Sistem: S1 ve S2 doğal, ek ses veya üfürüm duyulmadı. Periferik nabızlar bilateral eşit alınıyor. İnspeksiyonda boyun venöz dolgunluğu izlenmedi. Pretibial ödem (-/-).\nSolunum Sistemi: Her iki hemitoraks solunuma eşit katılıyor. Dinlemekle bilateral bazallerde ince raller mevcut, ekspiryum uzunluğu saptanmadı.\nBatın Muayenesi: Batın rahat, defans veya rebound yok. Traube alanı açık, organomegali izlenmedi.\nNörolojik Muayene: Kraniyal sinir muayeneleri doğal, motor ve duyu defisiti izlenmedi. Patolojik refleks (Babinski vs.) negatif.",
    bloodPressure: "155/95 mmHg",
    heartRate: "88 atım/dk (Ritmik)",
    temperature: "36.8 °C (Timpanik)",
    oxygenSaturation: "%96 (Oda Havası)",
    respiratoryRate: "18 /dk",
    ...(caseData?.patientInfo || {})
  };
  
  const isReviewMode = initialAnswers !== undefined && initialAnswers.length > 0;

  const [currentStage, setCurrentStage] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(isReviewMode ? initialAnswers[0] : null);
  const [activePanelTab, setActivePanelTab] = useState<'anamnez' | 'ozgecmis' | 'vitals' | 'muayene' | null>(null);
  const [hasAnswered, setHasAnswered] = useState(isReviewMode);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [hasWrongAnswer, setHasWrongAnswer] = useState(false);
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
    
    const isCorrect = stage.options[optIndex].isCorrect;
    if (isCorrect) {
      setEarnedPoints(prev => prev + 10);
    } else {
      setHasWrongAnswer(true);
    }
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

  const finalPoints = hasWrongAnswer ? 0 : stages.length * 10;

  const handleFinish = () => {
    if (!isReviewMode) {
      onCaseComplete(finalPoints, givenAnswers);
    }
    onBack();
  };

  if (isFinished) {
    return (
      <div className="glass-panel" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center', padding: '4rem 2rem' }}>
        <HeartPulse size={64} color={finalPoints > 0 ? "var(--success)" : "var(--danger)"} style={{ margin: '0 auto 1.5rem auto' }} />
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{finalPoints > 0 ? 'Vaka Tamamlandı!' : 'Vaka Sonuçlandı'}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '2rem' }}>
          {finalPoints > 0 ? (
            <>Bu vakadan toplam <strong style={{ color: 'var(--primary)', fontSize: '1.5rem' }}>{finalPoints}</strong> puan kazandınız!</>
          ) : (
            <span style={{ color: 'var(--danger)', fontWeight: 600 }}>En az bir soruyu yanlış cevapladığınız için bu vakadan puan kazanamadınız.</span>
          )}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <span style={{ display: 'inline-block', padding: '0.3rem 0.8rem', background: 'rgba(79, 70, 229, 0.15)', color: 'var(--primary)', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
            {subject}
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>{caseTitle}</h2>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr', 
        gap: '1.5rem', 
        alignItems: 'start',
        marginLeft: activePanelTab ? '460px' : '0px',
        transition: 'margin-left 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>

        {/* ── Collapsible Patient Card Sidebar ── */}
        {patientInfo && (
          <div style={{
            position: 'fixed',
            left: activePanelTab ? '0' : '-440px',
            top: '10vh',
            bottom: '10vh',
            width: '440px',
            background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: activePanelTab ? '20px 0 50px rgba(0,0,0,0.15)' : 'none',
            borderRight: '1px solid var(--glass-border)',
            borderTopRightRadius: '32px',
            borderBottomRightRadius: '32px',
            transition: 'left 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
          }}>
            
            {/* ── Tabs attached to the right edge ── */}
            <div style={{
              position: 'absolute',
              right: '-64px', // Adjusted for slightly wider tabs
              top: '3rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {/* Tab: Anamnez */}
              <div
                onClick={() => setActivePanelTab(prev => prev === 'anamnez' ? null : 'anamnez')}
                title="Hasta Bilgileri & Anamnez"
                style={{
                  width: '64px', height: '64px',
                  background: activePanelTab === 'anamnez' ? 'var(--primary)' : (isLight ? 'rgba(255,255,255,0.9)' : 'rgba(30, 41, 59, 0.9)'),
                  color: activePanelTab === 'anamnez' ? 'white' : 'var(--primary)',
                  borderTopRightRadius: '16px', borderBottomRightRadius: '16px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '0.2rem',
                  boxShadow: activePanelTab === 'anamnez' ? '8px 0 20px rgba(79, 70, 229, 0.3)' : '4px 0 10px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  border: '1px solid var(--glass-border)', borderLeft: 'none',
                  transform: activePanelTab === 'anamnez' ? 'translateX(8px)' : 'translateX(0)'
                }}
                onMouseEnter={e => { if (activePanelTab !== 'anamnez') e.currentTarget.style.transform = 'translateX(4px)'; }}
                onMouseLeave={e => { if (activePanelTab !== 'anamnez') e.currentTarget.style.transform = 'translateX(0)'; }}
              >
                <User size={20} />
                <span style={{ fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase' }}>Anamnez</span>
              </div>

              {/* Tab: Özgeçmiş */}
              {patientInfo.medicalHistory && (
                <div
                  onClick={() => setActivePanelTab(prev => prev === 'ozgecmis' ? null : 'ozgecmis')}
                  title="Özgeçmiş / Öykü"
                  style={{
                    width: '64px', height: '64px',
                    background: activePanelTab === 'ozgecmis' ? '#10b981' : (isLight ? 'rgba(255,255,255,0.9)' : 'rgba(30, 41, 59, 0.9)'),
                    color: activePanelTab === 'ozgecmis' ? 'white' : '#10b981',
                    borderTopRightRadius: '16px', borderBottomRightRadius: '16px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '0.2rem',
                    boxShadow: activePanelTab === 'ozgecmis' ? '8px 0 20px rgba(16, 185, 129, 0.3)' : '4px 0 10px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    border: '1px solid var(--glass-border)', borderLeft: 'none',
                    transform: activePanelTab === 'ozgecmis' ? 'translateX(8px)' : 'translateX(0)'
                  }}
                  onMouseEnter={e => { if (activePanelTab !== 'ozgecmis') e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={e => { if (activePanelTab !== 'ozgecmis') e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  <FileText size={20} />
                  <span style={{ fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase' }}>Özgeçmiş</span>
                </div>
              )}
              
              {/* Tab: Vitals */}
              {vitalItems.length > 0 && (
                <div
                  onClick={() => setActivePanelTab(prev => prev === 'vitals' ? null : 'vitals')}
                  title="Yaşamsal Bulgular"
                  style={{
                    width: '64px', height: '64px',
                    background: activePanelTab === 'vitals' ? '#f43f5e' : (isLight ? 'rgba(255,255,255,0.9)' : 'rgba(30, 41, 59, 0.9)'),
                    color: activePanelTab === 'vitals' ? 'white' : '#f43f5e',
                    borderTopRightRadius: '16px', borderBottomRightRadius: '16px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '0.2rem',
                    boxShadow: activePanelTab === 'vitals' ? '8px 0 20px rgba(244, 63, 94, 0.3)' : '4px 0 10px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    border: '1px solid var(--glass-border)', borderLeft: 'none',
                    transform: activePanelTab === 'vitals' ? 'translateX(8px)' : 'translateX(0)'
                  }}
                  onMouseEnter={e => { if (activePanelTab !== 'vitals') e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={e => { if (activePanelTab !== 'vitals') e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  <Activity size={20} />
                  <span style={{ fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase' }}>Vitals</span>
                </div>
              )}

              {/* Tab: Fizik Muayene */}
              {patientInfo.physicalExam && (
                <div
                  onClick={() => setActivePanelTab(prev => prev === 'muayene' ? null : 'muayene')}
                  title="Fizik Muayene"
                  style={{
                    width: '64px', height: '64px',
                    background: activePanelTab === 'muayene' ? '#8b5cf6' : (isLight ? 'rgba(255,255,255,0.9)' : 'rgba(30, 41, 59, 0.9)'),
                    color: activePanelTab === 'muayene' ? 'white' : '#8b5cf6',
                    borderTopRightRadius: '16px', borderBottomRightRadius: '16px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '0.2rem',
                    boxShadow: activePanelTab === 'muayene' ? '8px 0 20px rgba(139, 92, 246, 0.3)' : '4px 0 10px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    border: '1px solid var(--glass-border)', borderLeft: 'none',
                    transform: activePanelTab === 'muayene' ? 'translateX(8px)' : 'translateX(0)'
                  }}
                  onMouseEnter={e => { if (activePanelTab !== 'muayene') e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={e => { if (activePanelTab !== 'muayene') e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  <Stethoscope size={20} />
                  <span style={{ fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase' }}>Muayene</span>
                </div>
              )}

              {/* Tab: Vakadan Çık */}
              <div
                onClick={onBack}
                title="Vakadan Çık / İptal Et"
                style={{
                  width: '64px', height: '64px',
                  background: '#f43f5e',
                  color: 'white',
                  borderTopRightRadius: '16px', borderBottomRightRadius: '16px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '0.2rem',
                  boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  marginTop: '4rem', // Space it out from the other tabs significantly
                  border: '1px solid rgba(255,255,255,0.2)', borderLeft: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(6px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; }}
              >
                <XCircle size={22} />
                <span style={{ fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.1 }}>Vakadan<br/>Çık</span>
              </div>
            </div>

            {/* ── Drawer Content ── */}
            <div style={{ padding: '2rem', overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {activePanelTab === 'anamnez' && 'Hasta Dosyası'}
                  {activePanelTab === 'ozgecmis' && 'Özgeçmiş / Öykü'}
                  {activePanelTab === 'vitals' && 'Yaşamsal Bulgular'}
                  {activePanelTab === 'muayene' && 'Fizik Muayene'}
                </h3>
                <button onClick={() => setActivePanelTab(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <XCircle size={24} />
                </button>
              </div>

              {activePanelTab === 'anamnez' && (
                <div className="glass-panel" style={{ 
                  padding: '1.5rem', 
                  borderRadius: '24px', 
                  background: isLight ? 'linear-gradient(135deg, #ffffff, #f8fafc)' : 'var(--glass-bg)',
                  border: isLight ? '1px solid rgba(79, 70, 229, 0.1)' : '1px solid var(--glass-border)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem', color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <User size={16} /> Hasta Bilgileri & Anamnez
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '16px', background: isLight ? 'rgba(79, 70, 229, 0.1)' : 'rgba(79, 70, 229, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', boxShadow: isLight ? 'inset 0 2px 4px rgba(255,255,255,0.8)' : 'none' }}>
                      <User size={28} />
                    </div>
                    <div>
                      <p style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.2rem', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{patientInfo.name}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                        {patientInfo.age} yaş · {patientInfo.gender}
                      </p>
                    </div>
                  </div>
                  
                  {patientInfo.chiefComplaint && (
                    <div style={{ background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.15)', borderRadius: '16px', padding: '1rem', marginBottom: '1rem', boxShadow: isLight ? 'inset 0 2px 4px rgba(255,255,255,0.5)' : 'none' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Şikayet</span>
                      <p style={{ marginTop: '0.4rem', fontSize: '0.9rem', lineHeight: 1.5, fontStyle: 'italic', color: 'var(--text-main)' }}>
                        "{patientInfo.chiefComplaint}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activePanelTab === 'ozgecmis' && patientInfo.medicalHistory && (
                <div className="glass-panel" style={{ 
                  padding: '1.5rem', 
                  borderRadius: '24px',
                  background: isLight ? 'linear-gradient(135deg, #ffffff, #d1fae5)' : 'var(--glass-bg)',
                  border: isLight ? '1px solid rgba(16, 185, 129, 0.1)' : '1px solid var(--glass-border)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', color: '#10b981', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <FileText size={16} /> Özgeçmiş / Öykü
                  </div>
                  <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
                    {patientInfo.medicalHistory.split('\n').map((line: string, i: number) => (
                      <div key={i} style={{ marginBottom: '0.4rem', paddingLeft: line.includes(':') ? '0' : '0.5rem' }}>
                        {line.includes(':') ? (
                          <>
                            <strong style={{ color: '#10b981' }}>{line.split(':')[0]}:</strong>
                            {line.substring(line.indexOf(':') + 1)}
                          </>
                        ) : line}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activePanelTab === 'vitals' && vitalItems.length > 0 && (
                <div className="glass-panel" style={{ 
                  padding: '1.5rem', 
                  borderRadius: '24px',
                  background: isLight ? 'linear-gradient(135deg, #ffffff, #fff1f2)' : 'var(--glass-bg)',
                  border: isLight ? '1px solid rgba(244, 63, 94, 0.1)' : '1px solid var(--glass-border)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#f43f5e', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <Activity size={16} /> Yaşamsal Bulgular (Vitals)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {vitalItems.map((v, i) => (
                      <div key={i} style={{ 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', 
                        background: isLight ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.03)', 
                        border: isLight ? '1px solid rgba(244, 63, 94, 0.1)' : '1px solid var(--glass-border)', 
                        borderRadius: '16px',
                        boxShadow: isLight ? '0 2px 5px rgba(0,0,0,0.02)' : 'none'
                      }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{v.label}</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>{v.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activePanelTab === 'muayene' && patientInfo.physicalExam && (
                <div className="glass-panel" style={{ 
                  padding: '1.5rem', 
                  borderRadius: '24px',
                  background: isLight ? 'linear-gradient(135deg, #ffffff, #f5f3ff)' : 'var(--glass-bg)',
                  border: isLight ? '1px solid rgba(139, 92, 246, 0.1)' : '1px solid var(--glass-border)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', color: '#8b5cf6', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <Stethoscope size={16} /> Fizik Muayene Bulguları
                  </div>
                  <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
                    {patientInfo.physicalExam.split('\n').map((line: string, i: number) => (
                      <div key={i} style={{ marginBottom: '0.5rem', padding: '0.5rem', background: isLight ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
                        {line.includes(':') ? (
                          <>
                            <strong style={{ color: '#8b5cf6', display: 'block', marginBottom: '0.2rem' }}>{line.split(':')[0]}</strong>
                            {line.substring(line.indexOf(':') + 1)}
                          </>
                        ) : line}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
