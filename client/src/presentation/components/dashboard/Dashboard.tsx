'use client';

export default function Dashboard({ onStartCase }: { onStartCase: () => void }) {
  return (
    <main className="glass-panel">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Tüm Vakalarım</h2>
        <button className="btn-primary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }} onClick={onStartCase}>
          ➕ Yeni Vaka Başlat
        </button>
      </div>

      <div className="case-grid" style={{ marginTop: '2rem' }}>
        {/* Cases will be injected here */}
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Henüz çözülmüş bir vaka yok. Sağ üstten yeni vaka başlatın.
        </div>
      </div>
    </main>
  );
}
