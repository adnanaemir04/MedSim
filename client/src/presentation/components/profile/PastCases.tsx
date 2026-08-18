import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getSolvedCases, getDepartments, getCases, SolvedCaseDto, DepartmentDto, MedicalCaseDto } from '../../../infrastructure/api/simulationApi';
import { ChevronLeft, ChevronRight, Filter, Activity, Trophy, Clock, CheckCircle2, HeartPulse, Stethoscope, User, ArrowLeft, Brain, Search } from 'lucide-react';

interface PastCasesProps {
  userEmail: string;
  onStartCase: (subject: string, caseIndex: number, data?: any, initialAnswers?: number[]) => void;
}

export default function PastCases({ userEmail, onStartCase }: PastCasesProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [cases, setCases] = useState<SolvedCaseDto[]>([]);
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [allCases, setAllCases] = useState<MedicalCaseDto[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const [filterYear, setFilterYear] = useState<number | ''>('');
  const [filterSubject, setFilterSubject] = useState<string>('');

  const [selectedReviewCase, setSelectedReviewCase] = useState<MedicalCaseDto | null>(null);

  useEffect(() => {
    // Fetch departments for the filter dropdown
    getDepartments().then(data => setDepartments(data)).catch(console.error);
    // Fetch all cases to match stages & details
    getCases().then(data => setAllCases(data)).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      try {
        const result = await getSolvedCases(userEmail, page, 6, filterSubject || undefined, filterYear !== '' ? Number(filterYear) : undefined);
        setCases(result.items);
        setTotalPages(result.totalPages || 1);
        setTotalCount(result.totalCount || 0);
      } catch (err) {
        console.error("Geçmiş vakalar çekilemedi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, [userEmail, page, filterSubject, filterYear]);

  // Handle year filter change (reset subject filter if year changes)
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterYear(e.target.value === '' ? '' : Number(e.target.value));
    setFilterSubject('');
    setPage(1);
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterSubject(e.target.value);
    setPage(1);
  };

  const handleReviewCase = (medicalCaseId: string, subject: string, givenAnswers: number[]) => {
    const matched = allCases.find(c => c.id === medicalCaseId);
    if (matched) {
      const mockData = {
        id: matched.id,
        title: matched.title,
        text: matched.initialText,
        stages: matched.stages,
        patientInfo: matched.patientInfo
      };
      onStartCase(subject, -1, mockData, givenAnswers);
    } else {
      alert("Vaka detayları yüklenemedi. Lütfen daha sonra tekrar deneyin.");
    }
  };

  const handleResumeCase = (medicalCaseId: string, subject: string) => {
    const matched = allCases.find(c => c.id === medicalCaseId);
    if (matched) {
      const mockData = {
        id: matched.id,
        title: matched.title,
        text: matched.initialText,
        stages: matched.stages,
        patientInfo: matched.patientInfo
      };
      onStartCase(subject, -1, mockData);
    } else {
      alert("Vaka başlatılamadı.");
    }
  };

  const uniqueYears = Array.from(new Set(departments.map(d => d.year))).sort();
  const filteredSubjects = filterYear !== '' ? departments.filter(d => d.year === filterYear) : departments;

  // Render Case Review View
  if (selectedReviewCase) {
    const patientInfo = selectedReviewCase.patientInfo;
    const stages = selectedReviewCase.stages;
    const isCompleted = cases.find(c => c.medicalCaseId === selectedReviewCase.id)?.isSolved ?? false;
    const subjectName = departments.find(d => d.id === selectedReviewCase.departmentId)?.name || 'Genel Tıp';

    const vitalItems = [
      { label: 'Tansiyon', value: patientInfo?.bloodPressure },
      { label: 'Nabız', value: patientInfo?.heartRate },
      { label: 'Ateş', value: patientInfo?.temperature },
      { label: 'SpO₂', value: patientInfo?.oxygenSaturation },
      { label: 'Solunum', value: patientInfo?.respiratoryRate },
    ].filter(v => v.value);

    return (
      <div style={{ padding: '1rem 0', animation: 'fadeIn 0.5s ease-out' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <button 
            onClick={() => setSelectedReviewCase(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)', padding: '0.6rem 1.2rem', borderRadius: '12px',
              color: 'var(--text-main)', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateX(-3px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
          >
            <ArrowLeft size={16} /> Geçmiş Vakalara Dön
          </button>

          <div style={{ textAlign: 'right' }}>
            <span style={{
              padding: '0.3rem 0.8rem', background: isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: isCompleted ? 'var(--success, #10b981)' : 'var(--warning, #f59e0b)', borderRadius: '20px',
              fontSize: '0.8rem', fontWeight: 800
            }}>
              {isCompleted ? 'Vaka Çözüldü' : 'Yarıda Bırakıldı'}
            </span>
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {subjectName}
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0.3rem 0 0 0', color: 'var(--text-main)' }}>
            {selectedReviewCase.title}
          </h2>
        </div>

        {/* Layout Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: patientInfo ? '420px 1fr' : '1fr', gap: '2rem', alignItems: 'start' }}>
          
          {/* Patient Info Card (Left) */}
          {patientInfo && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <User size={16} /> Hasta Bilgileri & Anamnez
                </div>
                <p style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '0.2rem', color: 'var(--text-main)' }}>{patientInfo.name}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  {patientInfo.age} yaş · {patientInfo.gender}
                </p>

                {patientInfo.chiefComplaint && (
                  <div style={{ background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.12)', borderRadius: '16px', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f43f5e', textTransform: 'uppercase' }}>Şikayet</span>
                    <p style={{ marginTop: '0.3rem', fontSize: '0.85rem', lineHeight: 1.5, fontStyle: 'italic', color: 'var(--text-main)' }}>
                      "{patientInfo.chiefComplaint}"
                    </p>
                  </div>
                )}

                {patientInfo.medicalHistory && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.12)', borderRadius: '16px', padding: '0.75rem 1rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>Özgeçmiş / Öykü</span>
                    <p style={{ marginTop: '0.3rem', fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--text-main)' }}>
                      {patientInfo.medicalHistory}
                    </p>
                  </div>
                )}
              </div>

              {/* Vitals */}
              {vitalItems.length > 0 && (
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#f43f5e', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <Activity size={16} /> Yaşamsal Bulgular (Vitals)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
                    {vitalItems.map((v, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{v.label}</span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>{v.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Physical Exam */}
              {patientInfo.physicalExam && (
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', color: '#8b5cf6', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <Stethoscope size={16} /> Fizik Muayene Bulguları
                  </div>
                  <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-muted)' }}>{patientInfo.physicalExam}</p>
                </div>
              )}

              {/* Resume Button if left midway */}
              {!isCompleted && (
                <button
                  onClick={() => handleResumeCase(selectedReviewCase.id, subjectName)}
                  style={{
                    width: '100%', padding: '1rem', borderRadius: '16px',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    color: 'white', border: 'none', fontWeight: 800, fontSize: '1rem',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    boxShadow: '0 8px 20px var(--primary-glow)', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <Brain size={18} /> Vakaya Devam Et (Simülasyonu Sürdür)
                </button>
              )}
            </div>
          )}

          {/* Stages Timeline (Right) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              Klinik Aşamalar & Doğru Tıbbi Yaklaşımlar
            </h3>

            {stages.map((stg, sIndex) => (
              <div key={stg.id} className="glass-panel" style={{ padding: '1.75rem', borderRadius: '24px', position: 'relative', borderLeft: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Aşama {sIndex + 1}
                  </span>
                </div>

                <p style={{ fontSize: '1.05rem', lineHeight: 1.7, fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.5rem' }}>
                  {stg.text}
                </p>

                {/* Options List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {stg.options.map((opt) => {
                    const isCorrect = opt.isCorrect;
                    return (
                      <div 
                        key={opt.id}
                        style={{
                          padding: '1rem 1.25rem', borderRadius: '16px',
                          background: isCorrect ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                          border: isCorrect ? '1.5px solid var(--success)' : '1px solid var(--glass-border)',
                          color: isCorrect ? 'var(--text-main)' : 'var(--text-muted)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontWeight: isCorrect ? 800 : 500, fontSize: '0.9rem' }}>{opt.text}</span>
                          {isCorrect && (
                            <span style={{
                              padding: '0.2rem 0.6rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)',
                              borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, whiteSpace: 'nowrap'
                            }}>
                              Doğru Hamle
                            </span>
                          )}
                        </div>
                        {isCorrect && opt.feedback && (
                          <div style={{ marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px dashed rgba(16, 185, 129, 0.2)', fontSize: '0.8rem', color: 'var(--success)', lineHeight: 1.5 }}>
                            <strong>Gerekçe:</strong> {opt.feedback}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 0', animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Activity color="var(--primary)" size={32} />
            <span>Geçmiş <span style={{ color: 'var(--primary)' }}>Vakalarım</span></span>
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '1.1rem' }}>
            Bugüne kadar çözdüğünüz toplam <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{totalCount}</span> vaka kaydı bulunuyor.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', background: 'var(--glass-bg)', padding: '0.8rem', borderRadius: '20px', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-float)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
            <Filter size={18} />
          </div>
          <select 
            value={filterYear} 
            onChange={handleYearChange}
            style={{ 
              background: 'transparent', border: 'none', color: 'var(--text-main)', 
              fontWeight: 600, outline: 'none', cursor: 'pointer', padding: '0.5rem'
            }}
          >
            <option value="" style={{ color: 'black' }}>Tüm Dönemler</option>
            {uniqueYears.map(y => (
              <option key={y} value={y} style={{ color: 'black' }}>Dönem {y}</option>
            ))}
          </select>
          <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>
          <select 
            value={filterSubject} 
            onChange={handleSubjectChange}
            style={{ 
              background: 'transparent', border: 'none', color: 'var(--text-main)', 
              fontWeight: 600, outline: 'none', cursor: 'pointer', padding: '0.5rem',
              maxWidth: '150px'
            }}
          >
            <option value="" style={{ color: 'black' }}>Tüm Dersler</option>
            {filteredSubjects.map(d => (
              <option key={d.id} value={d.name} style={{ color: 'black' }}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem', color: 'var(--primary)' }}>
          <Activity className="spin-slow" size={48} />
        </div>
      ) : cases.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem', background: 'var(--glass-bg)', borderRadius: '24px', border: '1px dashed var(--glass-border)' }}>
          <Activity size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Hiç vaka bulunamadı</h3>
          <p style={{ color: 'var(--text-muted)' }}>Seçtiğiniz filtrelere uygun çözülmüş bir vaka kaydı yok.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.2rem', marginBottom: '2.5rem' }}>
            {cases.map((c, index) => (
              <div 
                key={c.id} 
                style={{ 
                  background: 'var(--glass-bg)', 
                  border: '1px solid var(--glass-border)',
                  borderLeft: c.isSolved ? '4px solid var(--success, #10b981)' : '4px solid var(--warning, #f59e0b)',
                  borderRadius: '16px', 
                  padding: '1.5rem',
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  animation: `slideLeft ${(index + 1) * 0.1}s ease-out`
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateX(5px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-float)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    <span style={{ 
                      padding: '0.2rem 0.8rem', 
                      background: 'rgba(14, 165, 233, 0.1)', 
                      color: '#0ea5e9', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem', 
                      fontWeight: 800 
                    }}>
                      DÖNEM {c.departmentYear}
                    </span>
                    <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                      {c.departmentName}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    {c.caseTitle}
                  </h4>
                  <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={14} /> 
                      {new Date(c.solvedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end', color: c.isSolved ? 'var(--success, #10b981)' : 'var(--warning, #f59e0b)', fontWeight: 800, fontSize: '1.1rem' }}>
                      {c.isSolved ? <CheckCircle2 size={20} /> : <Activity size={20} />}
                      <span>{c.isSolved ? 'Başarılı' : 'Yarıda Bırakıldı'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                      <Trophy size={14} color="var(--primary)" />
                      Kazanılan: <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>+{c.earnedPoints} Puan</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleReviewCase(c.medicalCaseId, c.departmentName, c.givenAnswers)}
                      className="btn-review-case btn-inline"
                    >
                      <Search size={16} /> Vakayı İncele
                    </button>
                    {!c.isSolved && (
                      <button
                        onClick={() => handleResumeCase(c.medicalCaseId, c.departmentName)}
                        className="btn-solve-case btn-inline"
                      >
                        Vakaya Devam Et
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                style={{ 
                  padding: '0.8rem', borderRadius: '50%', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                  color: page === 1 ? 'var(--text-muted)' : 'var(--text-main)',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { if(page !== 1) e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { if(page !== 1) { e.currentTarget.style.background = 'var(--glass-bg)'; e.currentTarget.style.color = 'var(--text-main)'; } }}
              >
                <ChevronLeft size={20} />
              </button>
              
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                Sayfa {page} / {totalPages}
              </span>

              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                style={{ 
                  padding: '0.8rem', borderRadius: '50%', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                  color: page === totalPages ? 'var(--text-muted)' : 'var(--text-main)',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { if(page !== totalPages) e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { if(page !== totalPages) { e.currentTarget.style.background = 'var(--glass-bg)'; e.currentTarget.style.color = 'var(--text-main)'; } }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
