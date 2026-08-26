import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Send, MessageSquareWarning } from 'lucide-react';
import { createReport } from '../../../infrastructure/api/simulationApi';
import { useTheme } from '../../context/ThemeContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  contentType: 'MedicalCase' | 'TusQuestion';
  contentSnippet: string; // A short snippet of the question/case to show the user what they are reporting
}

const REPORT_REASONS = [
  "Yanlış cevap",
  "Soru metninde hata",
  "Şıklarda hata",
  "Açıklama/çözüm hatalı",
  "Tıbbi bilgi hatalı",
  "Görsel/tablo hatalı",
  "Birden fazla doğru cevap",
  "Hiçbir seçenek doğru değil",
  "Güncel olmayan bilgi",
  "Diğer"
];

export default function ReportModal({ isOpen, onClose, contentId, contentType, contentSnippet }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const { theme } = useTheme();
  const isLight = theme === 'light';

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      setMessage({ type: 'error', text: 'Lütfen bir bildirim nedeni seçiniz.' });
      return;
    }
    if (selectedReason === 'Diğer' && !description.trim()) {
      setMessage({ type: 'error', text: 'Lütfen "Diğer" seçeneği için açıklama giriniz.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    try {
      const res = await createReport(contentId, contentType, selectedReason, description);
      setMessage({ type: 'success', text: res.message || 'Bildiriminiz başarıyla alındı.' });
      setTimeout(() => {
        onClose();
        setSelectedReason('');
        setDescription('');
        setMessage(null);
      }, 2000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Bildirim gönderilirken bir hata oluştu.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          zIndex: 9999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          padding: '1rem'
        }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
              background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '28px',
              padding: '2.5rem',
              width: '100%',
              maxWidth: '520px',
              border: isLight ? '1px solid rgba(79, 70, 229, 0.15)' : '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: isLight ? '0 25px 50px -12px rgba(79, 70, 229, 0.25)' : '0 25px 50px -12px rgba(0,0,0,0.8)',
              color: 'var(--text-main)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.8rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1)' }}>
                  <MessageSquareWarning color="#ef4444" size={28} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>Hatalı {contentType === 'MedicalCase' ? 'Vaka' : 'Soru'} Bildir</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0', fontWeight: 500 }}>Geri bildiriminiz için teşekkür ederiz!</p>
                </div>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ 
              background: isLight ? 'rgba(79, 70, 229, 0.05)' : 'rgba(255,255,255,0.03)', 
              padding: '1.2rem', 
              borderRadius: '16px', 
              marginBottom: '1.5rem', 
              fontSize: '0.9rem', 
              fontStyle: 'italic', 
              borderLeft: '4px solid var(--primary)',
              color: 'var(--text-main)',
              lineHeight: 1.5
            }}>
              "{contentSnippet}"
            </div>

            {message && (
              <div style={{ 
                padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500,
                background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: message.type === 'success' ? '#10b981' : '#ef4444',
                border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
              }}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bildirim Nedeni <span style={{color:'#ef4444'}}>*</span></label>
                <select 
                  value={selectedReason}
                  onChange={e => setSelectedReason(e.target.value)}
                  style={{
                    width: '100%', padding: '0.9rem 1rem', borderRadius: '14px',
                    background: isLight ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.2)', 
                    border: isLight ? '1px solid rgba(79, 70, 229, 0.2)' : '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--text-main)', fontSize: '0.95rem', outline: 'none',
                    boxShadow: isLight ? 'inset 0 2px 4px rgba(0,0,0,0.02)' : 'inset 0 2px 4px rgba(0,0,0,0.2)',
                    transition: 'border-color 0.2s', fontWeight: 500
                  }}
                  required
                >
                  <option value="" disabled>Lütfen bir neden seçin</option>
                  {REPORT_REASONS.map(reason => (
                    <option key={reason} value={reason} style={{ color: isLight ? '#000' : '#fff', background: isLight ? '#fff' : '#1e293b' }}>{reason}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Açıklama {selectedReason === 'Diğer' && <span style={{color:'#ef4444'}}>*</span>}
                </label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Hatanın detaylarını buraya yazabilirsiniz..."
                  rows={4}
                  style={{
                    width: '100%', padding: '0.9rem 1rem', borderRadius: '14px',
                    background: isLight ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.2)', 
                    border: isLight ? '1px solid rgba(79, 70, 229, 0.2)' : '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--text-main)', fontSize: '0.95rem', resize: 'vertical', outline: 'none',
                    boxShadow: isLight ? 'inset 0 2px 4px rgba(0,0,0,0.02)' : 'inset 0 2px 4px rgba(0,0,0,0.2)',
                    transition: 'border-color 0.2s', fontWeight: 500, lineHeight: 1.5
                  }}
                  required={selectedReason === 'Diğer'}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={onClose}
                  style={{
                    padding: '0.85rem 1.75rem', borderRadius: '14px', background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
                    border: 'none', color: 'var(--text-main)',
                    fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || message?.type === 'success'}
                  style={{
                    padding: '0.85rem 1.75rem', borderRadius: '14px', 
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    border: 'none', color: 'white', fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.6rem', transition: 'all 0.2s',
                    opacity: isSubmitting ? 0.7 : 1, boxShadow: '0 8px 20px var(--primary-glow)'
                  }}
                  onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { if (!isSubmitting) e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  {isSubmitting ? 'Gönderiliyor...' : (
                    <>
                      Bildirimi Gönder <Send size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
