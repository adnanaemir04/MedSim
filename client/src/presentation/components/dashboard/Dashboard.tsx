import { useState } from 'react';
import { medCasesData, deptsByYear } from '../../../infrastructure/data/casesData';
import { generateProceduralCase } from '../../services/ProceduralGenerator';

interface DashboardProps {
  filterSubject?: string;
  onStartCase: (subject: string, caseIndex: number, generatedCase?: any) => void;
}

export default function Dashboard({ filterSubject, onStartCase }: DashboardProps) {
  const subjectsToRender = filterSubject ? [filterSubject] : Object.keys(medCasesData);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genSubject, setGenSubject] = useState(filterSubject || 'Dahiliye');
  const [genCount, setGenCount] = useState(1);
  const [generatedCases, setGeneratedCases] = useState<any[]>([]);

  const handleGenerate = () => {
    const newCases = [];
    for(let i=0; i<genCount; i++) {
      newCases.push({ subject: genSubject, data: generateProceduralCase(genSubject) });
    }
    setGeneratedCases([...generatedCases, ...newCases]);
    setShowGenerateModal(false);
  };

  const getYearForSubject = (subject: string) => {
    for (const [year, subjects] of Object.entries(deptsByYear)) {
      if ((subjects as string[]).includes(subject)) {
        return `Dönem ${year}`;
      }
    }
    return 'Uzmanlık';
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

  return (
    <main className="glass-panel" style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>
          {filterSubject ? `${filterSubject} Vakaları` : 'Tüm Vakalarım'}
        </h2>
        <button 
          className="btn-primary" 
          style={{ 
            padding: '1rem 2rem', 
            fontSize: '1.2rem', 
            fontWeight: 800, 
            borderRadius: '30px', 
            boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)',
            letterSpacing: '0.5px',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
          }} 
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(79, 70, 229, 0.6)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(79, 70, 229, 0.4)'; }}
          onClick={() => setShowGenerateModal(true)}
        >
          + Yeni Vaka Üret
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Render Generated Cases */}
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
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{c.data.text.split('.')[0]}...</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flex: 1 }}>
              Sistematik oluşturulmuş benzersiz vaka. Tanı ve Tedavi aşamalarını içerir.
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

        {/* Render Static Cases */}
        {subjectsToRender.map(subject => {
          const subjectData = medCasesData[subject];
          return subjectData.titles.map((title: string, index: number) => (
            <div 
              key={`${subject}-${index}`} 
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
              onClick={() => onStartCase(subject, index)}
            >
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <div style={yearBadgeStyle}>
                  {getYearForSubject(subject)}
                </div>
                <div style={subjectBadgeStyle}>
                  {subject}
                </div>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flex: 1 }}>
                Bu vaka {subjectData.stages.length} aşamadan oluşmaktadır. Doğru kararlar vererek hastayı kurtarın.
              </p>
              <button 
                className="btn-primary" 
                style={{ width: '100%', padding: '0.8rem', marginTop: 'auto' }}
                onClick={(e) => { e.stopPropagation(); onStartCase(subject, index); }}
              >
                Vakayı Başlat
              </button>
            </div>
          ));
        })}
      </div>

      {showGenerateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '400px', padding: '2rem', background: 'var(--bg-panel)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Vaka Üretici</h3>
            
            <div className="form-group">
              <label>Klinik Branş</label>
              <select value={genSubject} onChange={e => setGenSubject(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-main)', border: '1px solid var(--glass-border)', color: 'var(--text-main)' }}>
                {Object.keys(medCasesData).map(subj => <option key={subj} value={subj}>{subj}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Üretilecek Vaka Adedi</label>
              <input type="number" min="1" max="5" value={genCount} onChange={e => setGenCount(Number(e.target.value))} />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleGenerate}>Üret</button>
              <button className="btn-danger" style={{ flex: 1, background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)' }} onClick={() => setShowGenerateModal(false)}>İptal</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
