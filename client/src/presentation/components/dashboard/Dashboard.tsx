'use client';

import { medCasesData } from '../../../infrastructure/data/casesData';

interface DashboardProps {
  onStartCase: (subject: string, caseIndex: number) => void;
}

export default function Dashboard({ onStartCase }: DashboardProps) {
  return (
    <main className="glass-panel" style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>Tüm Vakalarım</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {Object.keys(medCasesData).map(subject => {
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
              <div style={{ display: 'inline-block', padding: '0.4rem 0.8rem', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, width: 'fit-content' }}>
                {subject}
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
    </main>
  );
}
