import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getSolvedCases, getDepartments, getCases, getSolvedTusQuestions, SolvedCaseDto, DepartmentDto, MedicalCaseDto, SolvedTusQuestionDto } from '../../../infrastructure/api/simulationApi';
import { ChevronLeft, ChevronRight, Filter, Activity, Trophy, Clock, CheckCircle2, HeartPulse, Stethoscope, User, ArrowLeft, Brain, Search, BookOpen, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundManager } from '../../../utils/soundManager';

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
  const [filterDifficulty, setFilterDifficulty] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('desc');

  const [activeTab, setActiveTab] = useState<'cases' | 'tus'>('cases');
  const [tusQuestions, setTusQuestions] = useState<SolvedTusQuestionDto[]>([]);
  const [filterTusSubject, setFilterTusSubject] = useState<string>('');
  const [filterTusDifficulty, setFilterTusDifficulty] = useState<string>('');
  const [tusSortOrder, setTusSortOrder] = useState<string>('desc');
  const [tusPage, setTusPage] = useState(1);
  const [tusTotalPages, setTusTotalPages] = useState(1);
  const [loadingTus, setLoadingTus] = useState<boolean>(false);

  const [selectedReviewCase, setSelectedReviewCase] = useState<MedicalCaseDto | null>(null);

  useEffect(() => {
    if (activeTab === 'tus') {
      setLoadingTus(true);
      getSolvedTusQuestions(userEmail, filterTusSubject || undefined, tusPage, 6, filterTusDifficulty || undefined, tusSortOrder)
        .then(data => {
          setTusQuestions(data.items);
          setTusTotalPages(data.totalPages || 1);
        })
        .catch(err => console.error(err))
        .finally(() => setLoadingTus(false));
    }
  }, [userEmail, activeTab, filterTusSubject, filterTusDifficulty, tusSortOrder, tusPage]);

  useEffect(() => {
    getDepartments().then(data => setDepartments(data)).catch(console.error);
    getCases().then(data => setAllCases(data)).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      try {
        const result = await getSolvedCases(userEmail, page, 6, filterSubject || undefined, filterYear !== '' ? Number(filterYear) : undefined, filterDifficulty || undefined, sortOrder);
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
  }, [userEmail, page, filterSubject, filterYear, filterDifficulty, sortOrder]);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    soundManager.playClick();
    setFilterYear(e.target.value === '' ? '' : Number(e.target.value));
    setFilterSubject('');
    setPage(1);
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    soundManager.playClick();
    setFilterSubject(e.target.value);
    setPage(1);
  };

  const handleReviewCase = (medicalCaseId: string, subject: string, givenAnswers: number[]) => {
    soundManager.playClick();
    const matched = allCases.find(c => c.id === medicalCaseId);
    if (matched) {
      setSelectedReviewCase(matched);
    } else {
      alert("Vaka detayları yüklenemedi. Lütfen daha sonra tekrar deneyin.");
    }
  };

  const handleResumeCase = (medicalCaseId: string, subject: string) => {
    soundManager.playClick();
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } }
  };

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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ padding: '0.5rem 0' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <motion.button 
            whileHover={{ scale: 1.05, x: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { soundManager.playClick(); setSelectedReviewCase(null); }}
            onMouseEnter={() => soundManager.playHover()}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)', padding: '0.5rem 1rem', borderRadius: '10px',
              color: 'var(--text-main)', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem'
            }}
          >
            <ArrowLeft size={16} /> Geri Dön
          </motion.button>

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
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {subjectName}
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0.2rem 0 0 0', color: 'var(--text-main)' }}>
            {selectedReviewCase.title}
          </h2>
        </div>

        {/* Layout Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: patientInfo ? '380px 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
          
          {/* Patient Info Card */}
          {patientInfo && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="glass-panel" style={{ padding: '1.2rem', borderRadius: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', color: 'var(--primary)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <User size={14} /> Hasta Bilgileri
                </div>
                <p style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '0.1rem', color: 'var(--text-main)' }}>{patientInfo.name}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {patientInfo.age} yaş · {patientInfo.gender}
                </p>

                {patientInfo.chiefComplaint && (
                  <div style={{ background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.12)', borderRadius: '12px', padding: '0.6rem 0.8rem', marginBottom: '0.8rem' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#f43f5e', textTransform: 'uppercase' }}>Şikayet</span>
                    <p style={{ marginTop: '0.2rem', fontSize: '0.8rem', lineHeight: 1.4, fontStyle: 'italic', color: 'var(--text-main)' }}>
                      "{patientInfo.chiefComplaint}"
                    </p>
                  </div>
                )}

                {patientInfo.medicalHistory && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.12)', borderRadius: '12px', padding: '0.6rem 0.8rem' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>Özgeçmiş / Öykü</span>
                    <p style={{ marginTop: '0.2rem', fontSize: '0.8rem', lineHeight: 1.4, color: 'var(--text-main)' }}>
                      {patientInfo.medicalHistory}
                    </p>
                  </div>
                )}
              </div>

              {/* Vitals */}
              {vitalItems.length > 0 && (
                <div className="glass-panel" style={{ padding: '1.2rem', borderRadius: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', color: '#f43f5e', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <Activity size={14} /> Yaşamsal Bulgular
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                    {vitalItems.map((v, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', padding: '0.5rem 0.6rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '10px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{v.label}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.1rem' }}>{v.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Physical Exam */}
              {patientInfo.physicalExam && (
                <div className="glass-panel" style={{ padding: '1.2rem', borderRadius: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', color: '#8b5cf6', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <Stethoscope size={14} /> Fizik Muayene
                  </div>
                  <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: 'var(--text-muted)' }}>{patientInfo.physicalExam}</p>
                </div>
              )}

              {!isCompleted && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleResumeCase(selectedReviewCase.id, subjectName)}
                  onMouseEnter={() => soundManager.playHover()}
                  style={{
                    width: '100%', padding: '0.8rem', borderRadius: '14px',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    color: 'white', border: 'none', fontWeight: 800, fontSize: '0.9rem',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    boxShadow: '0 5px 15px var(--primary-glow)'
                  }}
                >
                  <Brain size={16} /> Simülasyona Dön
                </motion.button>
              )}
            </div>
          )}

          {/* Stages Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              Klinik Aşamalar & Doğru Yaklaşımlar
            </h3>

            {stages.map((stg, sIndex) => (
              <div key={stg.id} className="glass-panel" style={{ padding: '1.2rem', borderRadius: '20px', position: 'relative', borderLeft: '3px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Aşama {sIndex + 1}
                  </span>
                </div>

                <p style={{ fontSize: '0.9rem', lineHeight: 1.5, fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.2rem' }}>
                  {stg.text}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {stg.options.map((opt) => {
                    const isCorrect = opt.isCorrect;
                    return (
                      <div 
                        key={opt.id}
                        style={{
                          padding: '0.8rem 1rem', borderRadius: '12px',
                          background: isCorrect ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                          border: isCorrect ? '1.5px solid var(--success)' : '1px solid var(--glass-border)',
                          color: isCorrect ? 'var(--text-main)' : 'var(--text-muted)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.8rem' }}>
                          <span style={{ fontWeight: isCorrect ? 800 : 500, fontSize: '0.85rem' }}>{opt.text}</span>
                          {isCorrect && (
                            <span style={{
                              padding: '0.2rem 0.5rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)',
                              borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800, whiteSpace: 'nowrap'
                            }}>
                              Doğru Hamle
                            </span>
                          )}
                        </div>
                        {isCorrect && opt.feedback && (
                          <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed rgba(16, 185, 129, 0.2)', fontSize: '0.75rem', color: 'var(--success)', lineHeight: 1.4 }}>
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
      </motion.div>
    );
  }

  return (
    <div style={{ padding: '0.5rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 0.3rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Activity color="var(--primary)" size={24} />
            <span>Geçmiş <span style={{ color: 'var(--primary)' }}>Aktiviteler</span></span>
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
            Çözdüğünüz vakaların ve soruların listesi.
          </p>
        </div>

        {/* Tab Selection */}
        <div style={{ 
          display: 'flex', gap: '0.4rem', background: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)', 
          padding: '0.3rem', borderRadius: '14px', width: 'fit-content', 
          border: '1px solid var(--glass-border)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' 
        }}>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => { soundManager.playClick(); setActiveTab('cases'); }}
            onMouseEnter={() => soundManager.playHover()}
            style={{
              background: activeTab === 'cases' ? 'var(--primary)' : 'transparent',
              border: 'none',
              color: activeTab === 'cases' ? 'white' : 'var(--text-main)',
              padding: '0.5rem 1.2rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer',
              transition: 'background 0.3s, color 0.3s', display: 'flex', alignItems: 'center', gap: '0.4rem',
              boxShadow: activeTab === 'cases' ? '0 4px 10px var(--primary-glow)' : 'none',
              fontSize: '0.85rem'
            }}
          >
            <Activity size={16} /> Vakalar
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => { soundManager.playClick(); setActiveTab('tus'); }}
            onMouseEnter={() => soundManager.playHover()}
            style={{
              background: activeTab === 'tus' ? 'var(--primary)' : 'transparent',
              border: 'none',
              color: activeTab === 'tus' ? 'white' : 'var(--text-main)',
              padding: '0.5rem 1.2rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer',
              transition: 'background 0.3s, color 0.3s', display: 'flex', alignItems: 'center', gap: '0.4rem',
              boxShadow: activeTab === 'tus' ? '0 4px 10px var(--primary-glow)' : 'none',
              fontSize: '0.85rem'
            }}
          >
            <BookOpen size={16} /> TUS Soruları
          </motion.button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'cases' ? (
          <motion.div key="cases" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
                Toplam <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{totalCount}</span> vaka
              </p>

              {/* Filters */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', background: 'var(--glass-bg)', padding: '0.5rem', borderRadius: '14px', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-float)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', paddingLeft: '0.4rem' }}>
                  <Filter size={14} />
                </div>
                <select 
                  value={filterYear} onChange={handleYearChange}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontWeight: 600, outline: 'none', cursor: 'pointer', padding: '0.3rem', fontSize: '0.85rem' }}
                >
                  <option value="" style={{ color: 'black' }}>Tüm Dönemler</option>
                  {uniqueYears.map(y => ( <option key={y} value={y} style={{ color: 'black' }}>Dönem {y}</option> ))}
                </select>
                <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>
                <select 
                  value={filterSubject} onChange={handleSubjectChange}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontWeight: 600, outline: 'none', cursor: 'pointer', padding: '0.3rem', maxWidth: '120px', fontSize: '0.85rem' }}
                >
                  <option value="" style={{ color: 'black' }}>Dersler</option>
                  {filteredSubjects.map(d => ( <option key={d.id} value={d.name} style={{ color: 'black' }}>{d.name}</option> ))}
                </select>
                <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>
                <select 
                  value={filterDifficulty} 
                  onChange={(e) => { soundManager.playClick(); setFilterDifficulty(e.target.value); setPage(1); }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontWeight: 600, outline: 'none', cursor: 'pointer', padding: '0.3rem', fontSize: '0.85rem' }}
                >
                  <option value="" style={{ color: 'black' }}>Zorluklar</option>
                  <option value="Kolay" style={{ color: 'black' }}>Kolay</option>
                  <option value="Orta" style={{ color: 'black' }}>Orta</option>
                  <option value="Zor" style={{ color: 'black' }}>Zor</option>
                </select>
              </div>
            </div>
            
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--primary)' }}>
                <Activity className="spin-slow" size={32} />
              </div>
            ) : cases.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--glass-bg)', borderRadius: '20px', border: '1px dashed var(--glass-border)' }}>
                <Activity size={32} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Sonuç bulunamadı</h3>
              </div>
            ) : (
              <>
                <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.8rem', marginBottom: '1.5rem' }}>
                  {cases.map((c, index) => {
                    const maxPoints = (c.givenAnswers?.length || 0) * 10;
                    const isSuccess = c.isSolved && (maxPoints > 0 ? c.earnedPoints >= maxPoints / 2 : c.earnedPoints > 0);
                    const statusText = c.isSolved ? (isSuccess ? 'Başarılı' : 'Başarısız') : 'Yarıda';
                    const statusColor = c.isSolved ? (isSuccess ? 'var(--success, #10b981)' : 'var(--danger, #f43f5e)') : 'var(--warning, #f59e0b)';
                    
                    return (
                    <motion.div 
                      key={c.id} 
                      variants={itemVariants}
                      whileHover={{ scale: 1.01, x: 3 }}
                      onMouseEnter={() => soundManager.playHover()}
                      style={{ 
                        background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderLeft: `4px solid ${statusColor}`,
                        borderRadius: '14px', padding: '1rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                          <span style={{ padding: '0.1rem 0.6rem', background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 800 }}>DÖNEM {c.departmentYear}</span>
                          <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.75rem' }}>{c.departmentName}</span>
                        </div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>{c.caseTitle}</h4>
                        <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={12} /> {new Date(c.solvedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end', color: statusColor, fontWeight: 800, fontSize: '0.9rem' }}>
                            {c.isSolved ? (isSuccess ? <CheckCircle2 size={16} /> : <XCircle size={16} />) : <Activity size={16} />}
                            <span>{statusText}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                            <Trophy size={12} color="var(--primary)" />
                            <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>+{c.earnedPoints} Puan</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleReviewCase(c.medicalCaseId, c.departmentName, c.givenAnswers)} style={{ padding: '0.5rem 0.8rem', borderRadius: '10px', background: 'rgba(79,70,229,0.1)', color: 'var(--primary)', border: 'none', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Search size={14} /> İncele
                          </motion.button>
                          {!c.isSolved && (
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleResumeCase(c.medicalCaseId, c.departmentName)} style={{ padding: '0.5rem 0.8rem', borderRadius: '10px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                              Devam Et
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ); })}
                </motion.div>

                {/* Pagination */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} disabled={page === 1} onClick={() => { soundManager.playClick(); setPage(p => Math.max(1, p - 1)); }} style={{ padding: '0.6rem', borderRadius: '50%', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: page === 1 ? 'var(--text-muted)' : 'var(--text-main)', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>
                    <ChevronLeft size={16} />
                  </motion.button>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.85rem' }}>Sayfa {page} / {Math.max(1, totalPages)}</span>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} disabled={page >= totalPages} onClick={() => { soundManager.playClick(); setPage(p => Math.min(totalPages, p + 1)); }} style={{ padding: '0.6rem', borderRadius: '50%', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: page >= totalPages ? 'var(--text-muted)' : 'var(--text-main)', cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}>
                    <ChevronRight size={16} />
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div key="tus" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>TUS soru geçmişi</p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', background: 'var(--glass-bg)', padding: '0.5rem', borderRadius: '14px', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-float)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', paddingLeft: '0.4rem' }}>
                  <Filter size={14} />
                </div>
                <select value={filterTusSubject} onChange={(e) => { soundManager.playClick(); setFilterTusSubject(e.target.value); setTusPage(1); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontWeight: 600, outline: 'none', cursor: 'pointer', padding: '0.3rem', fontSize: '0.85rem' }}>
                  <option value="" style={{ color: 'black' }}>Tüm TUS Dersleri</option>
                  {["Anatomi", "Fizyoloji", "Biyokimya", "Patoloji", "Farmakoloji", "Dahiliye", "Pediatri", "Genel Cerrahi", "Kadın Hastalıkları", "Küçük Stajlar"].map(subj => ( <option key={subj} value={subj} style={{ color: 'black' }}>{subj}</option> ))}
                </select>
                <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>
                <select value={filterTusDifficulty} onChange={(e) => { soundManager.playClick(); setFilterTusDifficulty(e.target.value); setTusPage(1); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontWeight: 600, outline: 'none', cursor: 'pointer', padding: '0.3rem', fontSize: '0.85rem' }}>
                  <option value="" style={{ color: 'black' }}>Zorluklar</option>
                  <option value="Kolay" style={{ color: 'black' }}>Kolay</option>
                  <option value="Orta" style={{ color: 'black' }}>Orta</option>
                  <option value="Zor" style={{ color: 'black' }}>Zor</option>
                </select>
              </div>
            </div>

            {loadingTus ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--primary)' }}>
                <Activity className="spin-slow" size={32} />
              </div>
            ) : tusQuestions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--glass-bg)', borderRadius: '20px', border: '1px dashed var(--glass-border)' }}>
                <BookOpen size={32} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Sonuç bulunamadı</h3>
              </div>
            ) : (
              <>
                <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.8rem', marginBottom: '1.5rem' }}>
                  {tusQuestions.map((q, index) => (
                    <motion.div 
                      key={q.id} 
                      variants={itemVariants}
                      whileHover={{ scale: 1.01, x: 3 }}
                      onMouseEnter={() => soundManager.playHover()}
                      style={{ 
                        background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                        borderLeft: q.isCorrect ? '4px solid var(--success, #10b981)' : '4px solid var(--danger, #f43f5e)',
                        borderRadius: '14px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                          <span style={{ padding: '0.1rem 0.6rem', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 800 }}>{q.category}</span>
                          <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.75rem' }}>{q.subject}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: q.isCorrect ? 'var(--success, #10b981)' : 'var(--danger, #f43f5e)', fontWeight: 800, fontSize: '0.85rem' }}>
                          {q.isCorrect ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                          <span>{q.isCorrect ? 'Doğru' : 'Yanlış'}</span>
                        </div>
                      </div>
                      <div style={{ color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600 }}>
                        <span dangerouslySetInnerHTML={{ __html: q.questionText }}></span>
                      </div>
                      <div style={{ padding: '0.6rem 0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', borderLeft: '2px solid var(--primary)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <strong>Açıklama:</strong> <span dangerouslySetInnerHTML={{ __html: q.explanation }}></span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* TUS Pagination */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} disabled={tusPage === 1} onClick={() => { soundManager.playClick(); setTusPage(p => Math.max(1, p - 1)); }} style={{ padding: '0.6rem', borderRadius: '50%', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: tusPage === 1 ? 'var(--text-muted)' : 'var(--text-main)', cursor: tusPage === 1 ? 'not-allowed' : 'pointer' }}>
                    <ChevronLeft size={16} />
                  </motion.button>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.85rem' }}>Sayfa {tusPage} / {Math.max(1, tusTotalPages)}</span>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} disabled={tusPage >= tusTotalPages} onClick={() => { soundManager.playClick(); setTusPage(p => Math.min(tusTotalPages, p + 1)); }} style={{ padding: '0.6rem', borderRadius: '50%', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: tusPage >= tusTotalPages ? 'var(--text-muted)' : 'var(--text-main)', cursor: tusPage >= tusTotalPages ? 'not-allowed' : 'pointer' }}>
                    <ChevronRight size={16} />
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        .spin-slow { animation: spin 3s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
