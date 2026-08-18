import { useTheme } from '../../context/ThemeContext';
import { ArrowLeft, BookOpen, Clock, Award, Users, BookMarked, GraduationCap } from 'lucide-react';

interface TusAboutViewProps {
  onBack: () => void;
}

export default function TusAboutView({ onBack }: TusAboutViewProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* Header and Back Button */}
      <button 
        onClick={onBack} 
        style={{ 
          background: 'transparent', border: 'none', color: 'var(--text-muted)', 
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', 
          fontSize: '1rem', fontWeight: 600, marginBottom: '2rem', padding: 0 
        }}
      >
        <ArrowLeft size={20} /> TUS Merkezine Dön
      </button>

      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', marginBottom: '1.5rem', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)' }}>
          <GraduationCap size={40} />
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>Tıpta Uzmanlık Eğitimi Giriş Sınavı (TUS)</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
          Türkiye'de tıp fakültesi mezunlarının uzmanlık eğitimi alabilmeleri için girdikleri, dünyanın en zorlu tıbbi sınavlardan biridir.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {/* Info Card 1 */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: 'var(--primary)' }}>
            <div style={{ padding: '0.8rem', background: 'rgba(79, 70, 229, 0.1)', borderRadius: '16px' }}><Clock size={24} /></div>
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>Sınav Formatı & Süre</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
            Sınav iki oturumdan oluşur: <strong>Temel Tıp Bilimleri Testi (TTBT)</strong> ve <strong>Klinik Tıp Bilimleri Testi (KTBT)</strong>. Her iki oturumda 100'er soru sorulur ve her oturum için adaylara 135 dakika süre verilir. Toplam 200 soru ve 270 dakika süren zorlu bir maratondur.
          </p>
        </div>

        {/* Info Card 2 */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: '#f43f5e' }}>
            <div style={{ padding: '0.8rem', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '16px' }}><BookOpen size={24} /></div>
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>Ders Dağılımları</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
            Klinik Bilimlerde ağırlıklı olarak <strong>Dahiliye (30 soru)</strong>, <strong>Pediatri (30 soru)</strong>, <strong>Cerrahi (25 soru)</strong> ve <strong>Kadın Hastalıkları ve Doğum (15 soru)</strong> sorulur. Temel Bilimlerde ise Anatomi, Fizyoloji, Biyokimya, Mikrobiyoloji, Patoloji ve Farmakoloji yer alır.
          </p>
        </div>

        {/* Info Card 3 */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: '#10b981' }}>
            <div style={{ padding: '0.8rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px' }}><Award size={24} /></div>
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>Puan Hesaplaması</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
            Adayların her iki testteki doğru ve yanlış sayıları toplanarak standart sapma ile hesaplanan Özel TUS puanları elde edilir. 4 yanlış 1 doğruyu götürür. Kazananlar 45 ile 80 arası bir puan alır ve kontenjanlara göre tercih yaparlar.
          </p>
        </div>
        
        {/* Info Card 4 */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: '#f59e0b' }}>
            <div style={{ padding: '0.8rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '16px' }}><Users size={24} /></div>
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>Kadrolar & Tercih</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
            TUS sonucunda adaylar <strong>Eğitim ve Araştırma Hastaneleri</strong> veya <strong>Üniversite Hastanelerinde (Tıp Fakülteleri)</strong> asistan hekimlik kadrolarına yerleşir. Kadroların taban puanları, tercih edilen uzmanlık branşının o dönemki popülerliğine göre değişiklik gösterir.
          </p>
        </div>

      </div>

      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', textAlign: 'center', background: isLight ? 'linear-gradient(135deg, rgba(79, 70, 229, 0.05), rgba(79, 70, 229, 0.1))' : 'rgba(79, 70, 229, 0.05)', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
        <BookMarked size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 1rem 0', color: 'var(--text-main)' }}>MedSim TUS Simülasyonu</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '800px', margin: '0 auto', lineHeight: 1.7 }}>
          MedSim platformu, geçmiş yıllardaki çıkmış TUS sorularının zorluk seviyelerine ve klinik kalıplarına dayalı olarak <strong>on binlerce klasikleşmiş soruya</strong> erişim imkanı sağlar. Ayrıca yapay zeka entegrasyonumuz ile her ders için limitsiz ve tamamen dinamik, ezber bozan sorular üreterek TUS çalışma rutininizi mükemmelleştirebilirsiniz.
        </p>
      </div>

    </div>
  );
}
