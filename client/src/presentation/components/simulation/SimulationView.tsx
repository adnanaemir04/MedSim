'use client';

export default function SimulationView({ onBack }: { onBack: () => void }) {
  return (
    <main className="sim-container" style={{ display: 'block' }}>
      <div className="sim-header">
        <div>
          <span className="sim-dept">Dahiliye</span>
          <h2 className="sim-title">Hasta Simülasyonu (Örnek)</h2>
        </div>
        <button className="btn-back" onClick={onBack}>⬅ Listeye Dön</button>
      </div>

      <div className="glass-panel" style={{ marginTop: '1rem', padding: '2rem' }}>
        <p>Vaka aşamaları ve seçenekler burada yer alacak...</p>
      </div>
    </main>
  );
}
