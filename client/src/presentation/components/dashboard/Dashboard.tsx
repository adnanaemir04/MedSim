import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getDepartments, getCases, generateCases, getSolvedCases, DepartmentDto, MedicalCaseDto, SolvedCaseDto } from '../../../infrastructure/api/simulationApi';
import { Sparkles, Stethoscope, Activity, Syringe, BrainCircuit, Search, Play } from 'lucide-react';
import { soundManager } from '../../../utils/soundManager';

interface DashboardProps {
  userEmail: string;
  filterSubject?: string;
  generatedCases: any[];
  setGeneratedCases: React.Dispatch<React.SetStateAction<any[]>>;
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

export default function Dashboard({ userEmail, filterSubject, generatedCases, setGeneratedCases, onStartCase }: DashboardProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [dbCases, setDbCases] = useState<MedicalCaseDto[]>([]);
  const [solvedCases, setSolvedCases] = useState<SolvedCaseDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genYear, setGenYear] = useState<string>('4');
  const [genSubject, setGenSubject] = useState(filterSubject || 'Dahiliye');
  const [genTopic, setGenTopic] = useState('');
  const [genSubTopic, setGenSubTopic] = useState('');
  const [genDifficulty, setGenDifficulty] = useState('Orta');
  const [genCount, setGenCount] = useState(1);
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
      setGenTopic('');
      setGenSubTopic('');
    }
  }, [genYear, departments, filterSubject]);

  // Reset Topic when Subject changes
  useEffect(() => {
    setGenTopic('');
    setGenSubTopic('');
  }, [genSubject]);

  // Reset SubTopic when Topic changes
  useEffect(() => {
    setGenSubTopic('');
  }, [genTopic]);

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
      const newCases = await generateCases(genSubject, genTopic, genSubTopic, count, genDifficulty);
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
          topicName: genTopic,
          subTopicName: genSubTopic
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
          {filterSubject ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.5rem', maxWidth: '800px', lineHeight: 1.5 }}>
              {SUBJECT_DESCRIPTIONS[filterSubject] || `${filterSubject} branşı, tıp fakültesi müfredatında önemli bir yere sahip olan ve geleceğin hekimlerine kritik klinik/temel yetkinlikler kazandıran bir alandır.`}
            </p>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.5rem', maxWidth: '800px', lineHeight: 1.5 }}>
              Platformda yer alan tüm vakaları bu ekrandan görüntüleyebilirsin. Yetkinliklerini geliştirmek istediğin herhangi bir vaka seçerek klinik muhakeme becerilerini sınayabilirsin.
            </p>
          )}
        </div>
        <button 
          style={{ 
            padding: filterSubject ? '0.65rem 1.4rem' : '0.7rem 1.6rem', 
            fontSize: filterSubject ? '0.9rem' : '0.95rem', 
            fontWeight: 800, 
            borderRadius: '50px', 
            background: 'linear-gradient(135deg, #e11d48, #be123c, #f43f5e)',
            backgroundSize: '200% auto',
            color: 'white',
            border: 'none',
            boxShadow: '0 8px 20px rgba(225, 29, 72, 0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
            letterSpacing: '0.5px',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: filterSubject ? '0.5rem' : '0.6rem',
            animation: 'pulseGlow 2s infinite',
            whiteSpace: 'nowrap'
          }} 
          onMouseEnter={e => { 
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; 
            e.currentTarget.style.boxShadow = '0 12px 25px rgba(225, 29, 72, 0.5), inset 0 1px 0 rgba(255,255,255,0.5)'; 
            e.currentTarget.style.backgroundPosition = 'right center';
          }}
          onMouseLeave={e => { 
            e.currentTarget.style.transform = 'translateY(0) scale(1)'; 
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(225, 29, 72, 0.3), inset 0 1px 0 rgba(255,255,255,0.3)'; 
            e.currentTarget.style.backgroundPosition = 'left center';
          }}
          onClick={() => { soundManager.playClick(); setShowGenerateModal(true); }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          {filterSubject ? "YENİ VAKA OLUŞTUR" : "YENİ VAKA SİMÜLASYONU OLUŞTUR"}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {(() => {
          const generatedList = generatedCases.filter(c => !filterSubject || c.subject === filterSubject);
          const dbList = dbCases.filter(c => {
            const subjName = departments.find(d => d.id === c.departmentId)?.name || 'Bilinmiyor';
            const solved = solvedCases.find(sc => sc.medicalCaseId === c.id);
            if (solved && !filterSubject) return false;
            if (filterSubject && subjName !== filterSubject) return false;
            return true;
          });
          
          if (generatedList.length === 0 && dbList.length === 0) {
            return (
              <div style={{ gridColumn: '1 / -1', padding: '4rem 2rem', textAlign: 'center', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>🩺</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Henüz Vaka Bulunamadı</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  {filterSubject 
                    ? `${filterSubject} branşına ait henüz bir vaka oluşturulmamış veya çözmemişsiniz.` 
                    : "Sistemde çözülmeyi bekleyen veya sizin ürettiğiniz hiçbir vaka yok."}
                </p>
                <button 
                  onClick={() => { soundManager.playClick(); setShowGenerateModal(true); }}
                  className="btn-solve-case"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem' }}
                >
                  <Sparkles size={18} />
                  İlk Vakanızı Üretin
                </button>
              </div>
            );
          }

          return (
            <>
              {generatedList.map((c, index) => {
                const solved = c.data?.id ? solvedCases.find(sc => sc.medicalCaseId === c.data.id) : undefined;
                return (
                  <div key={`gen-${index}`} className="premium-card">
                    <BrainCircuit size={120} color="#6366f1" style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.04, pointerEvents: 'none', transform: 'rotate(-15deg)' }} />

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <div className="premium-badge no-dot" style={{ background: 'transparent', padding: 0, border: 'none' }}>
                        <Sparkles size={14} /> AI SİMÜLASYONU
                      </div>
                      {c.data?.difficulty && (
                        <div className={`premium-badge ${c.data.difficulty === 'Zor' ? 'rose' : (c.data.difficulty === 'Orta' ? 'orange' : 'green')}`}>
                          {c.data.difficulty} SEVİYE
                        </div>
                      )}
                    </div>

                    <h3 className="premium-card-title">
                      {c.title ? c.title.replace(/\s*-\s*Vaka\s*\d+/gi, '').trim() : (c.data?.text?.split('.')[0] || 'Yeni Vaka')}
                    </h3>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                      <span className="premium-badge blue">📅 Sınıf: {getYearForSubject(c.subject)}</span>
                      <span className="premium-badge rose">🧬 Branş: {c.subject}</span>
                      {c.data?.topicName && <span className="premium-badge orange">📚 Konu: {c.data.topicName}</span>}
                      {c.data?.subTopicName && <span className="premium-badge green">📌 İçerik: {c.data.subTopicName}</span>}
                    </div>

                    <p className="premium-card-text">
                      {c.data?.stages?.length || 0} aşamalı klinik değerlendirme ve teşhis süreci.
                    </p>

                    <button 
                      onClick={(e) => { e.stopPropagation(); soundManager.playClick(); onStartCase(c.subject, -1, c.data, undefined); }}
                      className={`premium-button ${solved ? 'solved' : ''}`}
                    >
                      {solved ? <><Search size={16} /> Tekrar İncele</> : <><Play size={16} fill="currentColor" /> Vakayı Çöz</>}
                    </button>
                  </div>
          );
        })}

        {dbList.map((c, index) => {
          const subjName = departments.find(d => d.id === c.departmentId)?.name || 'Bilinmiyor';
          const mockData = { id: c.id, title: c.title, text: c.initialText, stages: c.stages, patientInfo: c.patientInfo, difficulty: c.difficulty, difficultyScore: c.difficultyScore, difficultyReason: c.difficultyReason };
          const solved = solvedCases.find(sc => sc.medicalCaseId === c.id);

          return (
            <div key={`db-${c.id}`} className="premium-card db-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <div className="premium-badge no-dot" style={{ background: 'transparent', padding: 0, border: 'none', color: '#0ea5e9' }}>
                  <Activity size={14} /> STANDART VAKA
                </div>
                {c.difficulty && (
                  <div className={`premium-badge ${c.difficulty === 'Zor' ? 'rose' : (c.difficulty === 'Orta' ? 'orange' : 'green')}`}>
                    {c.difficulty} SEVİYE
                  </div>
                )}
              </div>
              
              <h3 className="premium-card-title">{c.title ? c.title.replace(/\s*-\s*Vaka\s*\d+/gi, '').trim() : 'Yeni Vaka'}</h3>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                <span className="premium-badge blue">📅 Sınıf: {getYearForSubject(subjName)}</span>
                <span className="premium-badge rose">🧬 Branş: {subjName}</span>
              </div>
              
              <p className="premium-card-text">
                Bu vaka {c.stages.length} aşamadan oluşmaktadır. Doğru kararlar vererek hastayı kurtarın.
              </p>
              
              <button 
                onClick={(e) => { e.stopPropagation(); soundManager.playClick(); onStartCase(subjName, index, mockData, undefined); }}
                className={`premium-button ${solved ? 'solved' : 'blue'}`}
              >
                {solved ? <><Search size={16} /> Tekrar İncele</> : <><Play size={16} fill="currentColor" /> Vakayı Çöz</>}
              </button>
            </div>
          );
        })}
            </>
          );
        })()}
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
              width: '100%', maxWidth: '820px', 
              padding: '2.5rem', 
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
              overflow: 'hidden',
              maxHeight: '95vh',
              overflowY: 'auto'
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {/* Two Column Layout for Horizontal Alignment */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
                    
                    {/* ── LEFT COLUMN ── */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {/* Header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ 
                          padding: '0.85rem', 
                          background: isLight ? 'linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(6, 182, 212, 0.08))' : 'linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(6, 182, 212, 0.15))', 
                          borderRadius: '16px', color: 'var(--primary)', 
                          border: isLight ? '1px solid rgba(79, 70, 229, 0.15)' : '1px solid rgba(79, 70, 229, 0.3)',
                          boxShadow: isLight ? '0 8px 20px rgba(79, 70, 229, 0.08)' : '0 8px 20px rgba(79, 70, 229, 0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <BrainCircuit size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: isLight ? '#0f172a' : 'white', letterSpacing: '-0.5px' }}>
                            Klinik Vaka Simülatörü
                          </h3>
                          <p style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.88rem', margin: 0, fontWeight: 500, lineHeight: 1.4 }}>
                            Yapay zeka tarafından branşınıza özel kurgulanan özgün klinik vakalar.
                          </p>
                        </div>
                      </div>

                      <div style={{ height: '1px', background: isLight ? 'linear-gradient(90deg, rgba(0,0,0,0.06), transparent)' : 'linear-gradient(90deg, rgba(255,255,255,0.06), transparent)', margin: '0.5rem 0 1.5rem 0' }} />

                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: isLight ? '#475569' : '#cbd5e1', fontWeight: 700 }}>
                          <span>Zorluk Seviyesi</span>
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {['Kolay', 'Orta', 'Zor'].map((lvl) => (
                            <button
                              key={lvl}
                              onClick={() => { soundManager.playClick(); setGenDifficulty(lvl); }}
                              onMouseEnter={() => soundManager.playHover()}
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

                      <div>
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

                    </div>

                    {/* ── RIGHT COLUMN ── */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
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

                      {/* Konu ve Alt Konu Seçimi */}
                      {(() => {
                        const activeDept = departments.find(d => d.year === Number(genYear) && d.name === genSubject);
                        const topics = activeDept?.topics || [];
                        const activeTopic = topics.find(t => t.name === genTopic);
                        const subTopics = activeTopic?.subTopics || [];

                        return (
                          <>
                            {topics.length > 0 && (
                              <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: isLight ? '#475569' : '#cbd5e1', fontWeight: 700 }}>
                                  <span>Konu Seçimi (İsteğe Bağlı)</span>
                                </label>
                                <div style={{ position: 'relative' }}>
                                  <select 
                                    value={genTopic} 
                                    onChange={e => setGenTopic(e.target.value)}
                                    style={{ 
                                      width: '100%', padding: '0.85rem 1rem', 
                                      borderRadius: '12px', 
                                      background: isLight ? 'white' : 'rgba(30, 41, 59, 0.6)', 
                                      border: isLight ? '1.5px solid #cbd5e1' : '1.5px solid rgba(255,255,255,0.1)', 
                                      color: isLight ? '#0f172a' : 'white',
                                      fontSize: '0.95rem', fontWeight: 600,
                                      outline: 'none', transition: 'all 0.2s',
                                      appearance: 'none', cursor: 'pointer'
                                    }}
                                  >
                                    <option value="">Rastgele Konu</option>
                                    {topics.map(t => (
                                      <option key={t.id} value={t.name}>{t.name}</option>
                                    ))}
                                  </select>
                                  <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--secondary)', opacity: 0.7, fontSize: '0.8rem' }}>▼</div>
                                </div>
                              </div>
                            )}

                            {genTopic && subTopics.length > 0 && (
                              <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', color: isLight ? '#475569' : '#cbd5e1', fontWeight: 700 }}>
                                  <span>Alt Konu Seçimi (İsteğe Bağlı)</span>
                                </label>
                                <div style={{ position: 'relative' }}>
                                  <select 
                                    value={genSubTopic} 
                                    onChange={e => setGenSubTopic(e.target.value)}
                                    style={{ 
                                      width: '100%', padding: '0.85rem 1rem', 
                                      borderRadius: '12px', 
                                      background: isLight ? 'white' : 'rgba(30, 41, 59, 0.6)', 
                                      border: isLight ? '1.5px solid #cbd5e1' : '1.5px solid rgba(255,255,255,0.1)', 
                                      color: isLight ? '#0f172a' : 'white',
                                      fontSize: '0.95rem', fontWeight: 600,
                                      outline: 'none', transition: 'all 0.2s',
                                      appearance: 'none', cursor: 'pointer'
                                    }}
                                  >
                                    <option value="">Rastgele Alt Konu</option>
                                    {subTopics.map(s => (
                                      <option key={s.id} value={s.name}>{s.name}</option>
                                    ))}
                                  </select>
                                  <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--secondary)', opacity: 0.7, fontSize: '0.8rem' }}>▼</div>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* BOTTOM ACTIONS */}
                  <div style={{ marginTop: '0.5rem' }}>
                    {generateError && (
                      <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '12px', color: '#f43f5e', fontSize: '0.85rem', lineHeight: 1.5, fontWeight: 600 }}>
                        ⚠️ {generateError}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => { soundManager.playClick(); setShowGenerateModal(false); setGenerateError(null); }}
                        disabled={isGenerating}
                        style={{ 
                          padding: '0.85rem 2rem', background: 'transparent', 
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
                        onClick={() => { soundManager.playClick(); handleGenerate(); }}
                        disabled={isGenerating}
                        style={{ 
                          padding: '0.85rem 2.5rem', 
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
                  </div>
                </div>
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
