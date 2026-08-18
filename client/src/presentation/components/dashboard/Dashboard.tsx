import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getDepartments, getCases, generateCases, getSolvedCases, DepartmentDto, MedicalCaseDto, SolvedCaseDto } from '../../../infrastructure/api/simulationApi';
import { Sparkles, Stethoscope, Activity, Syringe, BrainCircuit, Search, Play } from 'lucide-react';

interface DashboardProps {
  userEmail: string;
  filterSubject?: string;
  onStartCase: (subject: string, caseIndex: number, generatedCase?: any, initialAnswers?: number[]) => void;
}

const SUBJECT_DESCRIPTIONS: Record<string, string> = {
  "Anatomi": "İnsan vücudunun yapısal ve mekansal ilişkilerini, kemik, kas ve organ sistemlerini inceleyen temel tıp bilimi.",
  "Fizyoloji": "Hücrelerin, dokuların ve organların yaşam fonksiyonlarını ve biyolojik çalışma mekanizmalarını inceleyen bilim dalı.",
  "Tıbbi Biyokimya": "Organizmadaki kimyasal reaksiyonları, moleküler yapıları ve metabolik döngüleri inceleyen laboratuvar bilimi.",
  "Histoloji ve Embriyoloji": "Dokuların mikroskobik yapılarını ve anne karnındaki gelişim (embriyonik) süreçlerini inceleyen bilim dalı.",
  "Tıbbi Biyoloji ve Genetik": "Hücresel süreçleri, DNA yapısını, kalıtım kurallarını ve genetik hastalıkların temelini inceleyen tıp alanı.",
  "Tıbbi Mikrobiyoloji": "Bakteriler, virüsler, mantarlar ve parazitler gibi enfeksiyon yapıcı mikroorganizmaları inceleyen bilim dalı.",
  "Nöroanatomi": "Merkezi ve periferik sinir sisteminin anatomik yapısını ve nöral yolları inceleyen uzmanlık alanı.",
  "Biyofizik": "Biyolojik sistemlerin işleyişini fizik yasaları ve fiziksel yöntemlerle araştıran disiplinlerarası bilim.",
  "İlk Yardım": "Kaza, zehirlenme veya ani hastalıklarda profesyonel tıbbi yardım ulaşana kadar yapılan hayat kurtarıcı müdahaleler.",
  "Tıbbi Patoloji": "Hastalıkların hücre, doku ve organlarda yol açtığı yapısal ve fonksiyonel değişiklikleri inceleyen teşhis bilimi.",
  "Tıbbi Farmakoloji": "İlaçların vücuda etkilerini (farmakodinami) ve vücudun ilaçlara tepkilerini (farmakokinetik) inceleyen bilim.",
  "Klinik Bilimlere Giriş": "Temel tıp eğitiminden klinik stajlara geçişte hasta muayenesi ve anamnez alma gibi temel klinik beceriler.",
  "Biyoistatistik": "Tıbbi araştırma verilerinin analizi, istatistiksel yöntemlerle yorumlanması ve hipotez testleri.",
  "İç Hastalıkları (Dahiliye)": "Yetişkin hastaların cerrahi dışı organ sistem hastalıklarının tanı, tedavi ve takibini üstlenen ana klinik branş.",
  "Çocuk Sağlığı ve Hastalıkları": "Yenidoğan döneminden ergenliğe kadar olan yaş grubundaki bireylerin büyüme, gelişme ve hastalıklarını izleyen branş.",
  "Genel Cerrahi": "Sistemik veya lokal hastalıkların cerrahi girişimler veya ameliyatlarla tedavisini gerçekleştiren ana tıp dalı.",
  "Kadın Hastalıkları ve Doğum": "Kadın üreme sistema sağlığı, gebelik takibi, doğum süreçleri ve jinekolojik patolojileri inceleyen klinik branş.",
  "Nöroloji": "Beyin, omurilik, periferik sinirler ve kasların cerrahi dışı hastalıklarını inceleyen uzmanlık alanı.",
  "Psikiyatri": "Zihinsel, duygusal ve davranışsal bozuklukların tanı, psikoterapi ve farmakolojik tedavilerini yürüten tıp dalı.",
  "Ortopedi ve Travmatoloji": "Kas-iskelet sistemi hastalıkları, kırıklar, çıkıklar ve travmatik yaralanmaların cerrahi/medikal tedavisi.",
  "Göz Hastalıkları": "Görme sistemi anatomisi, göz hastalıklarının tıbbi/cerrahi tedavisi ve görme kusurlarının düzeltilmesi.",
  "KBB": "Kulak, burun, boğaz, baş ve boyun bölgesi hastalıklarının medikal ve cerrahi tedavisiyle ilgilenen klinik branş.",
  "Üroloji": "Kadın ve erkek idrar yolları ile erkek üreme sistemi hastalıklarının tanı ve cerrahi tedavisini üstlenen branş.",
  "Dermatoloji": "Deri, saç, tırnak ve zührevi (cinsel yolla bulaşan) hastalıkların tanı ve tedavisiyle ilgilenen uzmanlık dalı.",
  "Enfeksiyon Hastalıkları": "Mikroorganizmaların vücutta yol açtığı bulaşıcı hastalıkların tanı, tedavi ve salgın kontrolünü yürüten klinik alan.",
  "Kardiyoloji": "Kalp ve dolaşım sistemi hastalıklarının (hipertansiyon, koroner yetmezlik, ritim bozuklukları vb.) teşhis ve tedavisi.",
  "Acil Tıp": "Akut gelişen hastalık ve yaralanmalarda hastane öncesi ve hastane acil servislerindeki acil müdahaleleri yöneten branş.",
  "Aile Hekimliği": "Birey ve ailelere yaş, cinsiyet ve hastalık ayrımı yapmaksızın kapsamlı ve sürekli birinci basamak sağlık hizmeti sunan dal.",
  "Halk Sağlığı": "Toplumun genel sağlık düzeyini yükseltmek, hastalıkları önlemek ve koruyucu sağlık politikaları geliştirmek.",
  "Yoğun Bakım": "Hayati fonksiyonları tehlikede olan kritik hastaların yakın takibini ve organ destek tedavilerini üstlenen ileri uzmanlık."
};

export default function Dashboard({ userEmail, filterSubject, onStartCase }: DashboardProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [dbCases, setDbCases] = useState<MedicalCaseDto[]>([]);
  const [solvedCases, setSolvedCases] = useState<SolvedCaseDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genYear, setGenYear] = useState<string>('4');
  const [genSubject, setGenSubject] = useState(filterSubject || 'Dahiliye');
  const [genDifficulty, setGenDifficulty] = useState('Orta');
  const [genCount, setGenCount] = useState(1);
  const [generatedCases, setGeneratedCases] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptsData, casesData, solvedData] = await Promise.all([
          getDepartments(),
          getCases(),
          getSolvedCases(userEmail, 1, 100) // Fetch up to 100 solved cases for dashboard sync
        ]);
        setDepartments(deptsData);
        setDbCases(casesData);
        if (solvedData && solvedData.items) {
          setSolvedCases(solvedData.items);
        }
      } catch (err) {
        console.error("Veriler çekilemedi", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userEmail]);

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
      const newCases = await generateCases(genSubject, count, genDifficulty);
      const mappedNewCases = newCases.map(c => ({
        subject: genSubject,
        title: c.title,
        data: {
          id: c.id,
          title: c.title,
          text: c.initialText,
          stages: c.stages,
          patientInfo: c.patientInfo,
          difficulty: c.difficulty,
          difficultyScore: c.difficultyScore,
          difficultyReason: c.difficultyReason,
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
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>
            {filterSubject ? `${filterSubject} Vakaları` : 'Tüm Vakalarım'}
          </h2>
          {filterSubject && SUBJECT_DESCRIPTIONS[filterSubject] && (
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.5rem', maxWidth: '800px', lineHeight: 1.5 }}>
              {SUBJECT_DESCRIPTIONS[filterSubject]}
            </p>
          )}
        </div>
        <button 
          style={{ 
            padding: '0.7rem 1.6rem', 
            fontSize: '0.95rem', 
            fontWeight: 800, 
            borderRadius: '50px', 
            background: 'linear-gradient(135deg, #4f46e5, #06b6d4, #3b82f6)',
            backgroundSize: '200% auto',
            color: 'white',
            border: 'none',
            boxShadow: '0 8px 20px rgba(6, 182, 212, 0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
            letterSpacing: '0.5px',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            animation: 'pulseGlow 2s infinite'
          }} 
          onMouseEnter={e => { 
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; 
            e.currentTarget.style.boxShadow = '0 12px 25px rgba(6, 182, 212, 0.5), inset 0 1px 0 rgba(255,255,255,0.5)'; 
            e.currentTarget.style.backgroundPosition = 'right center';
          }}
          onMouseLeave={e => { 
            e.currentTarget.style.transform = 'translateY(0) scale(1)'; 
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(6, 182, 212, 0.3), inset 0 1px 0 rgba(255,255,255,0.3)'; 
            e.currentTarget.style.backgroundPosition = 'left center';
          }}
          onClick={() => setShowGenerateModal(true)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          YENİ VAKA SİMÜLASYONU OLUŞTUR
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {generatedCases.filter(c => !filterSubject || c.subject === filterSubject).map((c, index) => {
          const solved = c.data?.id ? solvedCases.find(sc => sc.medicalCaseId === c.data.id) : undefined;
          if (solved) return null; // Hide solved cases from Dashboard
          return (
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
              onClick={() => onStartCase(c.subject, -1, c.data, undefined)}
            >
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <div style={yearBadgeStyle}>
                  {getYearForSubject(c.subject)}
                </div>
                <div style={subjectBadgeStyle}>
                  {c.subject}
                </div>
                {c.data?.difficulty && (
                  <div 
                    title={c.data.difficultyReason || "Zorluk seviyesi bilgisi"}
                    style={{
                      padding: '0.2rem 0.8rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, cursor: 'help',
                      background: c.data.difficulty === 'Zor' ? 'rgba(244,63,94,0.1)' : (c.data.difficulty === 'Orta' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)'),
                      color: c.data.difficulty === 'Zor' ? '#f43f5e' : (c.data.difficulty === 'Orta' ? '#f59e0b' : '#10b981')
                    }}
                  >
                    {c.data.difficulty} Seviye
                  </div>
                )}
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{c.title || c.data?.text?.split('.')[0] || 'Yeni Vaka'}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flex: 1 }}>
                Yapay zeka tarafından üretilmiş benzersiz vaka. {c.data?.stages?.length || 0} aşamadan oluşmaktadır.
              </p>
              <button 
                onClick={(e) => { e.stopPropagation(); onStartCase(c.subject, -1, c.data, undefined); }}
                className={solved ? "btn-review-case btn-full" : "btn-solve-case btn-full"}
              >
                {solved ? <><Search size={16} /> Tekrar İncele</> : <><Play size={16} /> Vakayı Çöz</>}
              </button>
            </div>
          );
        })}

        {dbCases.filter(c => !filterSubject || departments.find(d => d.id === c.departmentId)?.name === filterSubject).map((c, index) => {
          const subjName = departments.find(d => d.id === c.departmentId)?.name || 'Bilinmiyor';
          const mockData = { id: c.id, title: c.title, text: c.initialText, stages: c.stages, patientInfo: c.patientInfo, difficulty: c.difficulty, difficultyScore: c.difficultyScore, difficultyReason: c.difficultyReason };
          const solved = solvedCases.find(sc => sc.medicalCaseId === c.id);
          
          if (solved) return null; // Hide solved cases from Dashboard

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
              onClick={() => onStartCase(subjName, index, mockData, undefined)}
            >
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <div style={yearBadgeStyle}>
                  {getYearForSubject(subjName)}
                </div>
                <div style={subjectBadgeStyle}>
                  {subjName}
                </div>
                {c.difficulty && (
                  <div 
                    title={c.difficultyReason || "Zorluk seviyesi bilgisi"}
                    style={{
                      padding: '0.2rem 0.8rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, cursor: 'help',
                      background: c.difficulty === 'Zor' ? 'rgba(244,63,94,0.1)' : (c.difficulty === 'Orta' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)'),
                      color: c.difficulty === 'Zor' ? '#f43f5e' : (c.difficulty === 'Orta' ? '#f59e0b' : '#10b981')
                    }}
                  >
                    {c.difficulty} Seviye
                  </div>
                )}
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{c.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flex: 1 }}>
                Bu vaka {c.stages.length} aşamadan oluşmaktadır. Doğru kararlar vererek hastayı kurtarın.
              </p>
              <button 
                onClick={(e) => { e.stopPropagation(); onStartCase(subjName, index, mockData, undefined); }}
                className={solved ? "btn-review-case btn-full" : "btn-solve-case btn-full"}
              >
                {solved ? <><Search size={16} /> Tekrar İncele</> : <><Play size={16} /> Vakayı Çöz</>}
              </button>
            </div>
          );
        })}
      </div>

      {showGenerateModal && (
        <div 
          style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            background: isLight ? 'rgba(255, 255, 255, 0.4)' : 'rgba(2, 6, 23, 0.5)', 
            backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setShowGenerateModal(false)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{ 
              width: '100%', maxWidth: '460px', 
              padding: '2rem', 
              background: isLight 
                ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95))'
                : 'linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.98))', 
              borderRadius: '24px',
              border: isLight ? '1px solid rgba(255,255,255,0.8)' : '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: isLight 
                ? '0 25px 50px -12px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.8)'
                : '0 25px 50px -12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
              animation: 'slideUpScale 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Decorative Glow */}
            <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '180px', height: '180px', background: 'var(--primary)', filter: 'blur(80px)', opacity: isLight ? 0.1 : 0.2, zIndex: 0 }}></div>
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              {isGenerating ? (
                /* ── Loading Screen ── */
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  {/* Animated Ring */}
                  <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 1.5rem auto' }}>
                    <div style={{
                      position: 'absolute', inset: 0,
                      border: '3px solid rgba(79,70,229,0.15)',
                      borderTopColor: 'var(--primary)',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                    <div style={{
                      position: 'absolute', inset: '10px',
                      border: '3px solid rgba(6,182,212,0.15)',
                      borderBottomColor: '#06b6d4',
                      borderRadius: '50%',
                      animation: 'spin 1.2s linear infinite reverse'
                    }} />
                    <div style={{
                      position: 'absolute', inset: '20px',
                      background: 'linear-gradient(135deg, var(--primary), #06b6d4)',
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 0 15px var(--primary-glow)'
                    }}>
                      <span style={{ fontSize: '1rem' }}>🧠</span>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: isLight ? '#0f172a' : 'white' }}>
                    Yapay Zeka Çalışıyor
                  </h3>
                  <p style={{ color: isLight ? '#64748b' : 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    <strong style={{ color: 'var(--primary)' }}>{genSubject}</strong> branşı için gerçekçi bir klinik vaka kurguluyorum.<br />
                    Hasta bilgileri, vital bulgular, fizik muayene ve tanı aşamaları hazırlanıyor...
                  </p>

                  {/* Progress dots */}
                  <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    {[0,1,2,3].map(i => (
                      <div key={i} style={{
                        width: '8px', height: '8px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`
                      }} />
                    ))}
                  </div>

                  <div style={{ padding: '0.75rem 1rem', background: isLight ? 'rgba(79,70,229,0.04)' : 'rgba(79,70,229,0.08)', borderRadius: '12px', border: '1px solid rgba(79,70,229,0.15)' }}>
                    <p style={{ fontSize: '0.78rem', color: isLight ? '#64748b' : '#94a3b8', margin: 0 }}>
                      💡 Vakalar tamamen yapay zeka tarafından üretilmektedir. Bu işlem genellikle <strong>10-20 saniye</strong> sürer.
                    </p>
                  </div>
                </div>
              ) : (
                /* ── Normal Form ── */
                <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ 
                  padding: '0.85rem', 
                  background: isLight ? 'linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(6, 182, 212, 0.08))' : 'linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(6, 182, 212, 0.15))', 
                  borderRadius: '16px', color: 'var(--primary)', 
                  border: isLight ? '1px solid rgba(79, 70, 229, 0.15)' : '1px solid rgba(79, 70, 229, 0.3)',
                  boxShadow: isLight ? '0 8px 20px rgba(79, 70, 229, 0.08)' : '0 8px 20px rgba(79, 70, 229, 0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <BrainCircuit size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: isLight ? '#0f172a' : 'white', letterSpacing: '-0.5px' }}>
                    Klinik Vaka Simülatörü
                  </h3>
                  <p style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.88rem', margin: 0, fontWeight: 500 }}>
                    Yapay zeka tarafından branşınıza özel kurgulanan özgün klinik vakalar.
                  </p>
                </div>
              </div>
              
              <div style={{ height: '1px', background: isLight ? 'linear-gradient(90deg, rgba(0,0,0,0.06), transparent)' : 'linear-gradient(90deg, rgba(255,255,255,0.06), transparent)', margin: '1.25rem 0' }} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: isLight ? '#475569' : '#cbd5e1', fontWeight: 700 }}>
                    <Stethoscope size={16} color="var(--primary)" />
                    Dönem / Eğitim Yılı
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select 
                      value={genYear} 
                      onChange={e => setGenYear(e.target.value)} 
                      disabled={!!filterSubject}
                      style={{ 
                        width: '100%', padding: '0.85rem 1rem', 
                        borderRadius: '12px', 
                        background: !!filterSubject ? (isLight ? '#e2e8f0' : 'rgba(0,0,0,0.5)') : (isLight ? 'white' : 'rgba(30, 41, 59, 0.6)'), 
                        border: isLight ? '1.5px solid #cbd5e1' : '1.5px solid rgba(255,255,255,0.1)', 
                        color: !!filterSubject ? (isLight ? '#64748b' : '#94a3b8') : (isLight ? '#0f172a' : 'white'),
                        fontSize: '0.95rem', fontWeight: 600,
                        outline: 'none', transition: 'all 0.2s',
                        appearance: 'none',
                        cursor: !!filterSubject ? 'not-allowed' : 'pointer'
                      }}
                      onFocus={e => { if (!filterSubject) { e.currentTarget.style.borderColor = 'var(--primary)'; } }}
                      onBlur={e => { e.currentTarget.style.borderColor = isLight ? '#cbd5e1' : 'rgba(255,255,255,0.1)'; }}
                    >
                      {uniqueYears.map(year => (
                        <option key={year} value={year.toString()} style={{ background: isLight ? 'white' : '#1e293b' }}>
                          Dönem {year}
                        </option>
                      ))}
                    </select>
                    <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--primary)', opacity: 0.7, fontSize: '0.8rem' }}>
                      ▼
                    </div>
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: isLight ? '#475569' : '#cbd5e1', fontWeight: 700 }}>
                    <Activity size={16} color="var(--secondary)" />
                    Klinik Branş
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select 
                      value={genSubject} 
                      onChange={e => setGenSubject(e.target.value)} 
                      disabled={!!filterSubject}
                      style={{ 
                        width: '100%', padding: '0.85rem 1rem', 
                        borderRadius: '12px', 
                        background: !!filterSubject ? (isLight ? '#e2e8f0' : 'rgba(0,0,0,0.5)') : (isLight ? 'white' : 'rgba(30, 41, 59, 0.6)'), 
                        border: isLight ? '1.5px solid #cbd5e1' : '1.5px solid rgba(255,255,255,0.1)', 
                        color: !!filterSubject ? (isLight ? '#64748b' : '#94a3b8') : (isLight ? '#0f172a' : 'white'),
                        fontSize: '0.95rem', fontWeight: 600,
                        outline: 'none', transition: 'all 0.2s',
                        appearance: 'none',
                        cursor: !!filterSubject ? 'not-allowed' : 'pointer'
                      }}
                      onFocus={e => { if (!filterSubject) { e.currentTarget.style.borderColor = 'var(--secondary)'; } }}
                      onBlur={e => { e.currentTarget.style.borderColor = isLight ? '#cbd5e1' : 'rgba(255,255,255,0.1)'; }}
                    >
                      {departments.filter(d => d.year === Number(genYear)).map(subj => (
                        <option key={subj.id} value={subj.name} style={{ background: isLight ? 'white' : '#1e293b' }}>{subj.name}</option>
                      ))}
                    </select>
                    <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--secondary)', opacity: 0.7, fontSize: '0.8rem' }}>
                      ▼
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: isLight ? '#475569' : '#cbd5e1', fontWeight: 700 }}>
                  <span>Zorluk Seviyesi</span>
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['Kolay', 'Orta', 'Zor'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setGenDifficulty(lvl)}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: genDifficulty === lvl 
                          ? (lvl === 'Zor' ? 'rgba(244,63,94,0.15)' : lvl === 'Orta' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)')
                          : (isLight ? 'white' : 'rgba(30, 41, 59, 0.6)'),
                        color: genDifficulty === lvl 
                          ? (lvl === 'Zor' ? '#f43f5e' : lvl === 'Orta' ? '#f59e0b' : '#10b981')
                          : (isLight ? '#64748b' : '#94a3b8'),
                        border: genDifficulty === lvl 
                          ? `1.5px solid ${lvl === 'Zor' ? '#f43f5e' : lvl === 'Orta' ? '#f59e0b' : '#10b981'}`
                          : (isLight ? '1.5px solid #cbd5e1' : '1.5px solid rgba(255,255,255,0.1)')
                      }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: isLight ? '#475569' : '#cbd5e1', fontWeight: 700 }}>
                  <span>Üretilecek Vaka Sayısı</span>
                  <span style={{ fontSize: '0.8rem', color: isLight ? '#94a3b8' : '#64748b' }}>(1 - 10)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="number" min="1" max="10" 
                    value={genCount} 
                    onChange={e => {
                      let val = e.target.value;
                      if (val === '') {
                        setGenCount('' as any);
                        return;
                      }
                      let num = parseInt(val, 10);
                      if (isNaN(num)) return;
                      if (num > 10) num = 10;
                      setGenCount(num);
                    }} 
                    style={{ 
                      width: '100%', padding: '0.85rem 1rem', 
                      borderRadius: '12px', 
                      background: isLight ? 'white' : 'rgba(30, 41, 59, 0.6)', 
                      border: isLight ? '1.5px solid #cbd5e1' : '1.5px solid rgba(255,255,255,0.1)', 
                      color: isLight ? '#0f172a' : 'white',
                      fontSize: '1.1rem', fontWeight: 700,
                      outline: 'none', transition: 'all 0.2s',
                      boxShadow: isLight ? 'inset 0 1px 2px rgba(0,0,0,0.05)' : 'none'
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                    onBlur={e => {
                      let val = Number(e.target.value);
                      if (val < 1 || isNaN(val) || e.target.value === '') setGenCount(1);
                      e.currentTarget.style.borderColor = isLight ? '#cbd5e1' : 'rgba(255,255,255,0.1)';
                    }}
                  />
                  <div style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: isLight ? '#94a3b8' : '#64748b', pointerEvents: 'none', fontWeight: 800, fontSize: '0.85rem' }}>VAKA</div>
                </div>
              </div>

              {generateError && (
                <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '12px', color: '#f43f5e', fontSize: '0.85rem', lineHeight: 1.5, fontWeight: 600 }}>
                  ⚠️ {generateError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => { setShowGenerateModal(false); setGenerateError(null); }}
                  disabled={isGenerating}
                  style={{ 
                    flex: 1, padding: '0.85rem', background: 'transparent', 
                    border: isLight ? '1.5px solid #cbd5e1' : '1.5px solid rgba(255,255,255,0.15)', 
                    color: isLight ? '#475569' : '#cbd5e1', 
                    borderRadius: '14px', fontWeight: 700, fontSize: '0.95rem',
                    cursor: isGenerating ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                    opacity: isGenerating ? 0.5 : 1
                  }}
                  onMouseEnter={e => { if (!isGenerating) { e.currentTarget.style.background = isLight ? '#f1f5f9' : 'rgba(255,255,255,0.05)'; } }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  İptal
                </button>
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  style={{ 
                    flex: 1.5, padding: '0.85rem', 
                    background: isGenerating ? 'rgba(79,70,229,0.5)' : 'linear-gradient(135deg, var(--primary), var(--secondary))', 
                    border: 'none', color: 'white', 
                    borderRadius: '14px', fontWeight: 800, fontSize: '0.95rem',
                    boxShadow: isGenerating ? 'none' : '0 8px 20px rgba(79, 70, 229, 0.3)',
                    cursor: isGenerating ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                  }}
                  onMouseEnter={e => { if (!isGenerating) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(79, 70, 229, 0.4)'; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isGenerating ? 'none' : '0 8px 20px rgba(79, 70, 229, 0.3)'; }}
                >
                  {isGenerating ? (
                    <>
                      <div style={{ position: 'relative', width: '16px', height: '16px' }}>
                        <span style={{ display: 'inline-block', position: 'absolute', inset: 0, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                      </div>
                      Simülasyon Kuruluyor...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Simülasyonu Başlat
                    </>
                  )}
                </button>
              </div>
            </>
            )}
            </div>
            
            <style>{`
              @keyframes slideUpScale {
                0% { opacity: 0; transform: translateY(20px) scale(0.96); }
                100% { opacity: 1; transform: translateY(0) scale(1); }
              }
              @keyframes fadeIn {
                0% { opacity: 0; backdrop-filter: blur(0px); }
                100% { opacity: 1; backdrop-filter: blur(16px); }
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
