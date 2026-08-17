import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getDepartments, getCases, generateCases, DepartmentDto, MedicalCaseDto } from '../../../infrastructure/api/simulationApi';

interface DashboardProps {
  filterSubject?: string;
  onStartCase: (subject: string, caseIndex: number, generatedCase?: any) => void;
}

export default function Dashboard({ filterSubject, onStartCase }: DashboardProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [dbCases, setDbCases] = useState<MedicalCaseDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genYear, setGenYear] = useState<string>('4');
  const [genSubject, setGenSubject] = useState(filterSubject || 'Dahiliye');
  const [genCount, setGenCount] = useState(1);
  const [generatedCases, setGeneratedCases] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptsData, casesData] = await Promise.all([
          getDepartments(),
          getCases()
        ]);
        setDepartments(deptsData);
        setDbCases(casesData);
      } catch (err) {
        console.error("Veriler çekilemedi", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Update subject dropdown when year changes, IF filterSubject is NOT active
  useEffect(() => {
    if (filterSubject) return; // Don't auto-change if we are locked to a subject
    const subjectsForYear = departments.filter(d => d.year === Number(genYear));
    if (subjectsForYear.length > 0 && !subjectsForYear.find(d => d.name === genSubject)) {
      setGenSubject(subjectsForYear[0].name);
    }
  }, [genYear, departments, filterSubject]);

  // When filterSubject or departments change, lock to that subject
  useEffect(() => {
    if (filterSubject && departments.length > 0) {
      const dept = departments.find(d => d.name === filterSubject);
      if (dept) {
        setGenSubject(dept.name);
        setGenYear(dept.year.toString());
      }
    }
  }, [filterSubject, departments]);

  const handleGenerate = async () => {
    let count = Math.max(1, Math.min(10, genCount));
    if (isNaN(count)) count = 1;
    setIsGenerating(true);
    setGenerateError(null);

    try {
      const newCases = await generateCases(genSubject, count);
      const mappedNewCases = newCases.map(c => ({
        subject: genSubject,
        title: c.title,
        data: {
          title: c.title,
          text: c.initialText,
          stages: c.stages,
          patientInfo: c.patientInfo,
        }
      }));
      setGeneratedCases(prev => [...prev, ...mappedNewCases]);
      setShowGenerateModal(false);
      setGenCount(1);
    } catch (err: any) {
      console.error('Vaka üretilemedi', err);
      setGenerateError(err?.response?.data || err?.message || 'Vaka üretilemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getYearForSubject = (subjectName: string) => {
    const dept = departments.find(d => d.name === subjectName);
    return dept ? `Dönem ${dept.year}` : 'Uzmanlık';
  };

  const yearBadgeStyle = {
    padding: '0.35rem 0.85rem', 
    background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(14, 165, 233, 0.05))', 
    border: '1px solid rgba(14, 165, 233, 0.25)', 
    color: '#0ea5e9', 
    borderRadius: '20px', 
    fontSize: '0.75rem', 
    fontWeight: 800,
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(14, 165, 233, 0.1), inset 0 1px 0 rgba(255,255,255,0.1)'
  };

  const subjectBadgeStyle = {
    padding: '0.35rem 0.85rem', 
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
    color: 'white', 
    borderRadius: '20px', 
    fontSize: '0.75rem', 
    fontWeight: 700,
    boxShadow: '0 4px 15px var(--primary-glow), inset 0 1px 0 rgba(255,255,255,0.2)'
  };

  if (loading) {
    return <div style={{ color: 'var(--text-muted)', padding: '2rem' }}>Sunucudan veriler yükleniyor...</div>;
  }

  // Get unique years for the select dropdown
  const uniqueYears = Array.from(new Set(departments.map(d => d.year))).sort();

  return (
    <main className="glass-panel" style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>
          {filterSubject ? `${filterSubject} Vakaları` : 'Tüm Vakalarım'}
        </h2>
        <button 
          style={{ 
            padding: '1rem 2.5rem', 
            fontSize: '1.2rem', 
            fontWeight: 900, 
            borderRadius: '50px', 
            background: 'linear-gradient(135deg, #4f46e5, #06b6d4, #3b82f6)',
            backgroundSize: '200% auto',
            color: 'white',
            border: 'none',
            boxShadow: '0 10px 30px rgba(6, 182, 212, 0.4), inset 0 2px 0 rgba(255,255,255,0.3)',
            letterSpacing: '1px',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            animation: 'pulseGlow 2s infinite'
          }} 
          onMouseEnter={e => { 
            e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)'; 
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(6, 182, 212, 0.6), inset 0 2px 0 rgba(255,255,255,0.5)'; 
            e.currentTarget.style.backgroundPosition = 'right center';
          }}
          onMouseLeave={e => { 
            e.currentTarget.style.transform = 'translateY(0) scale(1)'; 
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(6, 182, 212, 0.4), inset 0 2px 0 rgba(255,255,255,0.3)'; 
            e.currentTarget.style.backgroundPosition = 'left center';
          }}
          onClick={() => setShowGenerateModal(true)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          SİMÜLASYON YARAT
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {generatedCases.filter(c => !filterSubject || c.subject === filterSubject).map((c, index) => (
          <div 
            key={`gen-${index}`} 
            style={{ 
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(6, 182, 212, 0.1))', 
              border: '1px solid var(--primary)',
              borderRadius: 'var(--radius-xl)', 
              padding: '1.5rem',
              boxShadow: '0 0 15px var(--primary-glow)',
              display: 'flex', flexDirection: 'column', gap: '1rem',
              transition: 'var(--transition)',
              cursor: 'pointer'
            }}
            onClick={() => onStartCase(c.subject, -1, c.data)}
          >
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <div style={yearBadgeStyle}>
                {getYearForSubject(c.subject)}
              </div>
              <div style={subjectBadgeStyle}>
                {c.subject}
              </div>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{c.title || c.data?.text?.split('.')[0] || 'Yeni Vaka'}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flex: 1 }}>
              Yapay zeka tarafından üretilmiş benzersiz vaka. {c.data?.stages?.length || 0} aşamadan oluşmaktadır.
            </p>
            <button 
              className="btn-primary" 
              style={{ width: '100%', padding: '0.8rem', marginTop: 'auto' }}
              onClick={(e) => { e.stopPropagation(); onStartCase(c.subject, -1, c.data); }}
            >
              Vakayı Başlat
            </button>
          </div>
        ))}

        {/* Render DB Cases */}
        {dbCases.filter(c => !filterSubject || departments.find(d => d.id === c.departmentId)?.name === filterSubject).map((c, index) => {
          const subjName = departments.find(d => d.id === c.departmentId)?.name || 'Bilinmiyor';
          const mockData = { text: c.initialText, stages: c.stages };

          return (
            <div 
              key={`db-${c.id}`} 
              style={{ 
                background: 'var(--glass-bg)', 
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-xl)', 
                padding: '1.5rem',
                boxShadow: 'var(--shadow-float)',
                display: 'flex', flexDirection: 'column', gap: '1rem',
                transition: 'var(--transition)',
                cursor: 'pointer'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              onClick={() => onStartCase(subjName, index, mockData)}
            >
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <div style={yearBadgeStyle}>
                  {getYearForSubject(subjName)}
                </div>
                <div style={subjectBadgeStyle}>
                  {subjName}
                </div>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{c.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flex: 1 }}>
                Bu vaka {c.stages.length} aşamadan oluşmaktadır. Doğru kararlar vererek hastayı kurtarın.
              </p>
              <button 
                className="btn-primary" 
                style={{ width: '100%', padding: '0.8rem', marginTop: 'auto' }}
                onClick={(e) => { e.stopPropagation(); onStartCase(subjName, index, mockData); }}
              >
                Vakayı Başlat
              </button>
            </div>
          );
        })}
      </div>

      {showGenerateModal && (
        <div 
          style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            background: isLight ? 'rgba(255, 255, 255, 0.5)' : 'rgba(2, 6, 23, 0.6)', 
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease-out'
          }}
          onClick={() => setShowGenerateModal(false)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{ 
              width: '100%', maxWidth: '480px', 
              padding: '3rem', 
              background: isLight 
                ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.8))'
                : 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.95))', 
              borderRadius: '32px',
              border: isLight ? '1px solid rgba(255,255,255,0.8)' : '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: isLight 
                ? '0 30px 60px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.8)'
                : '0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
              animation: 'slideUpScale 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Decorative Glow */}
            <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', background: 'var(--primary)', filter: 'blur(80px)', opacity: isLight ? 0.15 : 0.3, zIndex: 0 }}></div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              {isGenerating ? (
                /* ── Loading Screen ── */
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  {/* Animated Ring */}
                  <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 2rem auto' }}>
                    <div style={{
                      position: 'absolute', inset: 0,
                      border: '3px solid rgba(79,70,229,0.15)',
                      borderTopColor: 'var(--primary)',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                    <div style={{
                      position: 'absolute', inset: '12px',
                      border: '3px solid rgba(6,182,212,0.15)',
                      borderBottomColor: '#06b6d4',
                      borderRadius: '50%',
                      animation: 'spin 1.2s linear infinite reverse'
                    }} />
                    <div style={{
                      position: 'absolute', inset: '26px',
                      background: 'linear-gradient(135deg, var(--primary), #06b6d4)',
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 0 20px var(--primary-glow)'
                    }}>
                      <span style={{ fontSize: '1.2rem' }}>🧠</span>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.75rem', color: isLight ? '#0f172a' : 'white' }}>
                    Yapay Zeka Çalışıyor
                  </h3>
                  <p style={{ color: isLight ? '#64748b' : 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                    <strong style={{ color: 'var(--primary)' }}>{genSubject}</strong> branşı için gerçekçi bir klinik vaka kurguluyorum.<br />
                    Hasta bilgileri, vital bulgular, fizik muayene ve tanı aşamaları hazırlanıyor...
                  </p>

                  {/* Progress dots */}
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem' }}>
                    {[0,1,2,3].map(i => (
                      <div key={i} style={{
                        width: '10px', height: '10px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`
                      }} />
                    ))}
                  </div>

                  <div style={{ padding: '0.85rem 1.25rem', background: isLight ? 'rgba(79,70,229,0.06)' : 'rgba(79,70,229,0.1)', borderRadius: '12px', border: '1px solid rgba(79,70,229,0.2)' }}>
                    <p style={{ fontSize: '0.82rem', color: isLight ? '#64748b' : '#94a3b8', margin: 0 }}>
                      💡 Vakalar tamamen yapay zeka tarafından üretilmektedir. Bu işlem genellikle <strong>10-20 saniye</strong> sürer.
                    </p>
                  </div>
                </div>
              ) : (
                /* ── Normal Form ── */
                <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ 
                  padding: '1rem', 
                  background: isLight ? 'rgba(14, 165, 233, 0.1)' : 'linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(14, 165, 233, 0.05))', 
                  borderRadius: '24px', color: '#0ea5e9', 
                  border: isLight ? '1px solid rgba(14, 165, 233, 0.2)' : '1px solid rgba(14, 165, 233, 0.3)',
                  boxShadow: isLight ? '0 4px 10px rgba(14, 165, 233, 0.1)' : 'none'
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <h3 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, color: isLight ? '#0f172a' : 'white', letterSpacing: '-0.5px' }}>
                  Simülasyon Yarat
                </h3>
              </div>
              
              <p style={{ color: isLight ? '#475569' : 'var(--text-muted)', fontSize: '1rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                Gelişmiş prosedürel motorumuz, seçtiğiniz döneme ve branşa özel, eşi benzeri olmayan tıbbi vakaları saniyeler içinde kurgular.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem', color: isLight ? '#334155' : '#cbd5e1', fontWeight: 700 }}>Dönem / Sınıf</label>
                  <select 
                    value={genYear} 
                    onChange={e => setGenYear(e.target.value)} 
                    disabled={!!filterSubject}
                    style={{ 
                      width: '100%', padding: '1.2rem 1rem', 
                      borderRadius: '20px', 
                      background: !!filterSubject ? (isLight ? '#e2e8f0' : 'rgba(0,0,0,0.5)') : (isLight ? '#f1f5f9' : 'rgba(0,0,0,0.3)'), 
                      border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.1)', 
                      color: !!filterSubject ? (isLight ? '#64748b' : '#94a3b8') : (isLight ? '#0f172a' : 'white'),
                      fontSize: '1rem', fontWeight: 600,
                      outline: 'none', transition: 'border-color 0.3s, box-shadow 0.3s',
                      appearance: 'none',
                      cursor: !!filterSubject ? 'not-allowed' : 'pointer'
                    }}
                    onFocus={e => { if (!filterSubject) { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 4px var(--primary-glow)'; } }}
                    onBlur={e => { e.currentTarget.style.borderColor = isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    {uniqueYears.map(year => (
                      <option key={year} value={year.toString()} style={{ background: isLight ? 'white' : '#1e293b' }}>
                        Dönem {year}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem', color: isLight ? '#334155' : '#cbd5e1', fontWeight: 700 }}>Klinik Ders</label>
                  <select 
                    value={genSubject} 
                    onChange={e => setGenSubject(e.target.value)} 
                    disabled={!!filterSubject}
                    style={{ 
                      width: '100%', padding: '1.2rem 1rem', 
                      borderRadius: '20px', 
                      background: !!filterSubject ? (isLight ? '#e2e8f0' : 'rgba(0,0,0,0.5)') : (isLight ? '#f1f5f9' : 'rgba(0,0,0,0.3)'), 
                      border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.1)', 
                      color: !!filterSubject ? (isLight ? '#64748b' : '#94a3b8') : (isLight ? '#0f172a' : 'white'),
                      fontSize: '1rem', fontWeight: 600,
                      outline: 'none', transition: 'border-color 0.3s, box-shadow 0.3s',
                      appearance: 'none',
                      cursor: !!filterSubject ? 'not-allowed' : 'pointer'
                    }}
                    onFocus={e => { if (!filterSubject) { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 4px var(--primary-glow)'; } }}
                    onBlur={e => { e.currentTarget.style.borderColor = isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    {departments.filter(d => d.year === Number(genYear)).map(subj => (
                      <option key={subj.id} value={subj.name} style={{ background: isLight ? 'white' : '#1e293b' }}>{subj.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '3rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem', color: isLight ? '#334155' : '#cbd5e1', fontWeight: 700 }}>Üretilecek Vaka Sayısı (1 - 10)</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="number" min="1" max="10" 
                    value={genCount} 
                    onChange={e => setGenCount(Number(e.target.value))} 
                    onBlur={e => {
                      let val = Number(e.target.value);
                      if (val < 1 || isNaN(val)) setGenCount(1);
                      if (val > 10) setGenCount(10);
                    }}
                    style={{ 
                      width: '100%', padding: '1.2rem 1rem', 
                      borderRadius: '20px', 
                      background: isLight ? '#f1f5f9' : 'rgba(0,0,0,0.3)', 
                      border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.1)', 
                      color: isLight ? '#0f172a' : 'white',
                      fontSize: '1.2rem', fontWeight: 800,
                      outline: 'none', transition: 'border-color 0.3s, box-shadow 0.3s'
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 4px var(--primary-glow)'; }}
                  />
                  <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: isLight ? '#94a3b8' : '#64748b', pointerEvents: 'none', fontWeight: 600 }}>Adet</div>
                </div>
              </div>

              {generateError && (
                <div style={{ marginBottom: '1rem', padding: '0.85rem 1rem', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '12px', color: '#f43f5e', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  ⚠️ {generateError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => { setShowGenerateModal(false); setGenerateError(null); }}
                  disabled={isGenerating}
                  style={{ 
                    flex: 1, padding: '1.2rem', background: 'transparent', 
                    border: isLight ? '2px solid #e2e8f0' : '2px solid rgba(255,255,255,0.1)', 
                    color: isLight ? '#64748b' : '#94a3b8', 
                    borderRadius: '24px', fontWeight: 800, fontSize: '1.1rem',
                    cursor: isGenerating ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                    opacity: isGenerating ? 0.5 : 1
                  }}
                  onMouseEnter={e => { if (!isGenerating) { e.currentTarget.style.background = isLight ? '#f8fafc' : 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = isLight ? '#0f172a' : 'white'; } }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = isLight ? '#64748b' : '#94a3b8'; }}
                >
                  İptal
                </button>
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  style={{ 
                    flex: 2, padding: '1.2rem', 
                    background: isGenerating ? 'rgba(79,70,229,0.5)' : 'linear-gradient(135deg, var(--primary), var(--secondary))', 
                    border: 'none', color: 'white', 
                    borderRadius: '24px', fontWeight: 900, fontSize: '1.1rem',
                    boxShadow: isGenerating ? 'none' : '0 10px 30px var(--primary-glow)',
                    cursor: isGenerating ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                    letterSpacing: '0.5px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                  }}
                  onMouseEnter={e => { if (!isGenerating) { e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 20px 40px var(--primary-glow)'; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = isGenerating ? 'none' : '0 10px 30px var(--primary-glow)'; }}
                >
                  {isGenerating ? (
                    <>
                      <span style={{ display: 'inline-block', width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                      Yapay Zeka Üretiyor...
                    </>
                  ) : 'Yarat'}
                </button>
              </div>
            </>
            )}
            </div>
            
            <style>{`
              @keyframes slideUpScale {
                0% { opacity: 0; transform: translateY(40px) scale(0.9); }
                100% { opacity: 1; transform: translateY(0) scale(1); }
              }
              @keyframes fadeIn {
                0% { opacity: 0; backdrop-filter: blur(0px); }
                100% { opacity: 1; backdrop-filter: blur(24px); }
              }
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
              @keyframes pulse {
                0%, 100% { transform: scale(0.6); opacity: 0.4; }
                50% { transform: scale(1); opacity: 1; }
              }
              @keyframes pulseGlow {
                0% { box-shadow: 0 10px 30px rgba(6, 182, 212, 0.4), inset 0 2px 0 rgba(255,255,255,0.3); }
                50% { box-shadow: 0 15px 40px rgba(6, 182, 212, 0.7), inset 0 2px 0 rgba(255,255,255,0.5); }
                100% { box-shadow: 0 10px 30px rgba(6, 182, 212, 0.4), inset 0 2px 0 rgba(255,255,255,0.3); }
              }
            `}</style>
          </div>
        </div>
      )}
    </main>
  );
}
