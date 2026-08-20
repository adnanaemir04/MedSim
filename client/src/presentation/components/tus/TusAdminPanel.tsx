'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  ArrowLeft, Search, Trash2, CheckCircle2, XCircle, Plus, Edit2, 
  Sparkles, Loader2, Play, BookOpen, AlertCircle, Eye, EyeOff, Save, Check
} from 'lucide-react';
import { 
  getAdminKnowledges, saveAdminKnowledge, deleteAdminKnowledge,
  getPendingQuestions, approveQuestion, rejectQuestion, toggleActiveQuestion,
  generateClassicPipeline, getTusSubjects
} from '../../../infrastructure/api/simulationApi';
import { soundManager } from '../../../utils/soundManager';

interface TusAdminPanelProps {
  onBack: () => void;
}

const STANDARD_TUS_SUBJECTS = [
  "Anatomi", "Histoloji ve Embriyoloji", "Fizyoloji", "Biyokimya", "Mikrobiyoloji", "Patoloji", "Farmakoloji",
  "Dahiliye", "Pediatri", "Genel Cerrahi", "Kadın Hastalıkları ve Doğum", "Küçük Stajlar"
];

export default function TusAdminPanel({ onBack }: TusAdminPanelProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [activeTab, setActiveTab] = useState<'knowledge' | 'pending' | 'generate'>('knowledge');
  const [selectedSubject, setSelectedSubject] = useState<string>('Farmakoloji');
  
  // Knowledge Base tab states
  const [knowledges, setKnowledges] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editScore, setEditScore] = useState<number>(50);
  const [editFreq, setEditFreq] = useState('Orta');
  const [editSources, setEditSources] = useState('');
  
  // Pending Questions tab states
  const [pendingQuestions, setPendingQuestions] = useState<any[]>([]);
  
  // AI Generate tab states
  const [genSubject, setGenSubject] = useState('Farmakoloji');
  const [genTopic, setGenTopic] = useState('Antihipertansifler');
  const [genSubTopic, setGenSubTopic] = useState('ACE inhibitörleri');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateResult, setGenerateResult] = useState<any | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'knowledge') {
      loadKnowledges();
    } else if (activeTab === 'pending') {
      loadPendingQuestions();
    }
  }, [activeTab, selectedSubject]);

  const loadKnowledges = async () => {
    setLoading(true);
    try {
      const data = await getAdminKnowledges(selectedSubject);
      setKnowledges(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingQuestions = async () => {
    setLoading(true);
    try {
      const data = await getPendingQuestions();
      setPendingQuestions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEditKnowledge = (k: any) => {
    soundManager.playClick();
    setEditingId(k.id);
    setEditText(k.knowledgeText);
    setEditScore(k.importanceScore);
    setEditFreq(k.repetitionFrequency);
    setEditSources(k.sources);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    soundManager.playClick();
    try {
      const payload = {
        id: editingId,
        knowledgeText: editText,
        subject: selectedSubject,
        importanceScore: editScore,
        repetitionFrequency: editFreq,
        sources: editSources,
        isActive: true
      };
      await saveAdminKnowledge(payload);
      setEditingId(null);
      loadKnowledges();
    } catch (e) {
      console.error(e);
      alert("Düzenleme kaydedilirken bir hata oluştu.");
    }
  };

  const handleDeleteKnowledge = async (id: string) => {
    if (!confirm("Bu bilgiyi ve bağlı olan tüm soruları silmek istediğinize emin misiniz?")) return;
    soundManager.playClick();
    try {
      await deleteAdminKnowledge(id);
      loadKnowledges();
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveQuestion = async (id: string) => {
    soundManager.playSuccess();
    try {
      await approveQuestion(id);
      setPendingQuestions(prev => prev.filter(q => q.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectQuestion = async (id: string) => {
    soundManager.playError();
    try {
      await rejectQuestion(id);
      setPendingQuestions(prev => prev.filter(q => q.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleQuestionActive = async (id: string) => {
    soundManager.playClick();
    try {
      await toggleActiveQuestion(id);
      loadPendingQuestions();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunPipeline = async () => {
    if (!genSubject || !genTopic || !genSubTopic) {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }
    soundManager.playClick();
    setIsGenerating(true);
    setGenerateResult(null);
    setGenerateError(null);

    try {
      const data = await generateClassicPipeline(genSubject, genTopic, genSubTopic);
      setGenerateResult(data);
      soundManager.playSuccess();
    } catch (e: any) {
      console.error(e);
      setGenerateError(e.response?.data?.error || "Yapay zeka soru üretiminde bir hata oluştu.");
      soundManager.playError();
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredKnowledges = knowledges.filter(k => 
    k.knowledgeText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => { soundManager.playClick(); onBack(); }}
            style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)',
              color: 'var(--text-main)', padding: '0.6rem 1rem', borderRadius: '12px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700
            }}
          >
            <ArrowLeft size={16} /> Geri
          </button>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Klasikleşmiş Sorular Admin Paneli <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', background: 'var(--primary)', color: 'white', borderRadius: '8px' }}>SUPERADMIN</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Klasik TUS soru ve bilgi bankasını yapay zeka entegrasyonu ile yönetin.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        {[
          { id: 'knowledge', label: 'Bilgi Havuzu (Knowledge Base)', icon: <BookOpen size={16} /> },
          { id: 'pending', label: `Onay Bekleyen Sorular (${pendingQuestions.length})`, icon: <AlertCircle size={16} /> },
          { id: 'generate', label: 'AI Klasik Soru Üret', icon: <Sparkles size={16} /> }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => { soundManager.playClick(); setActiveTab(t.id as any); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.25rem', borderRadius: '12px',
              background: activeTab === t.id ? 'var(--primary)' : 'rgba(255, 255, 255, 0.03)',
              border: activeTab === t.id ? 'none' : '1px solid var(--glass-border)',
              color: activeTab === t.id ? 'white' : 'var(--text-main)',
              fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'knowledge' && (
        <div>
          {/* Filters and search */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              style={{
                background: isLight ? 'white' : 'rgba(30, 41, 59, 0.7)',
                border: '1px solid var(--glass-border)', color: 'var(--text-main)',
                padding: '0.75rem 1rem', borderRadius: '12px', fontWeight: 600, outline: 'none', cursor: 'pointer'
              }}
            >
              {STANDARD_TUS_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Bilgi havuzunda ara..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem', borderRadius: '12px',
                  background: isLight ? 'white' : 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid var(--glass-border)', color: 'var(--text-main)',
                  outline: 'none', fontSize: '0.95rem'
                }}
              />
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <Loader2 className="spin" size={32} style={{ color: 'var(--primary)', margin: '0 auto' }} />
            </div>
          ) : filteredKnowledges.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '16px' }}>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>Bu branşta henüz tanımlanmış klasik bilgi yok. AI Klasik Soru Üret sekmesinden türetebilirsiniz!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {filteredKnowledges.map(k => {
                const isEditing = editingId === k.id;
                return (
                  <div key={k.id} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                          <label style={{ fontWeight: 800, color: 'var(--text-main)' }}>Bilgi Cümlesi (Hap Bilgi):</label>
                          <textarea
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: isLight ? 'white' : 'rgba(0,0,0,0.3)', color: 'var(--text-main)', outline: 'none', marginTop: '0.3rem', fontSize: '0.95rem', minHeight: '60px' }}
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <label style={{ fontWeight: 800, color: 'var(--text-main)' }}>Önem Derecesi (0-100):</label>
                            <input
                              type="number"
                              value={editScore}
                              onChange={e => setEditScore(Number(e.target.value))}
                              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: isLight ? 'white' : 'rgba(0,0,0,0.3)', color: 'var(--text-main)', outline: 'none', marginTop: '0.3rem' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontWeight: 800, color: 'var(--text-main)' }}>Sıklık Derecesi:</label>
                            <select
                              value={editFreq}
                              onChange={e => setEditFreq(e.target.value)}
                              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: isLight ? 'white' : 'rgba(0,0,0,0.3)', color: 'var(--text-main)', outline: 'none', marginTop: '0.3rem' }}
                            >
                              <option value="Çok Yüksek">Çok Yüksek</option>
                              <option value="Yüksek">Yüksek</option>
                              <option value="Orta">Orta</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label style={{ fontWeight: 800, color: 'var(--text-main)' }}>Kaynaklar (Noktalı virgül ile ayırın):</label>
                          <input
                            type="text"
                            value={editSources}
                            onChange={e => setEditSources(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: isLight ? 'white' : 'rgba(0,0,0,0.3)', color: 'var(--text-main)', outline: 'none', marginTop: '0.3rem' }}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => setEditingId(null)} style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer' }}>İptal</button>
                          <button onClick={handleSaveEdit} style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Save size={16} /> Kaydet</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {/* Info details */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.6rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '6px', marginRight: '0.5rem' }}>ÖNEM: {k.importanceScore}</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.6rem', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', borderRadius: '6px' }}>SIKLIK: {k.repetitionFrequency}</span>
                            <h3 style={{ margin: '0.8rem 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{k.knowledgeText}</h3>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}><b>Kaynaklar:</b> {k.sources || 'Belirtilmemiş'}</p>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => handleEditKnowledge(k)} style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', cursor: 'pointer' }}><Edit2 size={16} /></button>
                            <button onClick={() => handleDeleteKnowledge(k.id)} style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                          </div>
                        </div>

                        {/* Questions list linked to this knowledge */}
                        {k.questions && k.questions.length > 0 && (
                          <div style={{ background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '12px', marginTop: '1rem' }}>
                            <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Bağlı Soru Varyasyonları ({k.questions.length})</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {k.questions.map((q: any) => (
                                <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-main)', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.3rem' }}>
                                  <span>{q.questionText}</span>
                                  <span style={{ fontWeight: 800, color: '#10b981' }}>Doğru: {q.correctOption}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'pending' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <Loader2 className="spin" size={32} style={{ color: 'var(--primary)', margin: '0 auto' }} />
            </div>
          ) : pendingQuestions.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '16px' }}>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>Onay bekleyen soru bulunmuyor.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {pendingQuestions.map(q => (
                <div key={q.id} className="glass-panel" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                  
                  {/* Subject and associated fact */}
                  <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <span style={{ padding: '0.2rem 0.6rem', background: 'rgba(79,70,229,0.1)', color: 'var(--primary)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>{q.subject}</span>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      <b>İlişkili TUS Hap Bilgisi:</b> "{q.tusKnowledge?.knowledgeText || 'Bilinmiyor'}"
                    </div>
                  </div>

                  {/* Question and Options */}
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.5rem' }}>{q.questionText}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
                    {[
                      { key: 'A', text: q.optionA },
                      { key: 'B', text: q.optionB },
                      { key: 'C', text: q.optionC },
                      { key: 'D', text: q.optionD },
                      { key: 'E', text: q.optionE }
                    ].map(opt => {
                      const isCorrect = opt.key === q.correctOption;
                      return (
                        <div 
                          key={opt.key}
                          style={{
                            padding: '0.75rem 1rem', borderRadius: '10px',
                            background: isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.02)',
                            border: isCorrect ? '1px solid #10b981' : '1px solid var(--glass-border)',
                            color: 'var(--text-main)', display: 'flex', gap: '1rem', alignItems: 'center'
                          }}
                        >
                          <span style={{ fontWeight: 800, color: isCorrect ? '#10b981' : 'var(--text-muted)' }}>{opt.key})</span>
                          <span>{opt.text}</span>
                          {isCorrect && <CheckCircle2 size={16} style={{ color: '#10b981', marginLeft: 'auto' }} />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  <div style={{ background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <b>Açıklama:</b> {q.explanation}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => handleToggleQuestionActive(q.id)} 
                      style={{
                        padding: '0.6rem 1.2rem', borderRadius: '10px',
                        background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)',
                        color: 'var(--text-main)', cursor: 'pointer', fontWeight: 700
                      }}
                    >
                      {q.isApproved ? 'Pasifleştir' : 'Aktifleştir'}
                    </button>
                    <button 
                      onClick={() => handleRejectQuestion(q.id)} 
                      style={{
                        padding: '0.6rem 1.2rem', borderRadius: '10px',
                        background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)',
                        color: 'var(--danger)', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem'
                      }}
                    >
                      <XCircle size={16} /> Reddet ve Sil
                    </button>
                    <button 
                      onClick={() => handleApproveQuestion(q.id)} 
                      style={{
                        padding: '0.6rem 1.2rem', borderRadius: '10px',
                        background: 'var(--primary)', color: 'white', border: 'none',
                        cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem'
                      }}
                    >
                      <CheckCircle2 size={16} /> Onayla ve Yayınla
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'generate' && (
        <div>
          <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '24px', maxWidth: '600px', margin: '0 auto', border: '1px solid var(--glass-border)' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="var(--primary)" /> AI ile Klasik Soru Oluşturma Pipeline'ı
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.9rem' }}>Ders Seçin:</label>
                <select
                  value={genSubject}
                  onChange={e => setGenSubject(e.target.value)}
                  style={{
                    width: '100%', background: isLight ? 'white' : 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--glass-border)', color: 'var(--text-main)',
                    padding: '0.75rem 1rem', borderRadius: '10px', fontWeight: 600, outline: 'none', marginTop: '0.3rem', cursor: 'pointer'
                  }}
                >
                  {STANDARD_TUS_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.9rem' }}>Konu Adı:</label>
                <input
                  type="text"
                  value={genTopic}
                  onChange={e => setGenTopic(e.target.value)}
                  placeholder="Örn: Antihipertansifler, Kemik Tümörleri..."
                  style={{
                    width: '100%', padding: '0.75rem 1rem', borderRadius: '10px',
                    background: isLight ? 'white' : 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--glass-border)', color: 'var(--text-main)',
                    outline: 'none', marginTop: '0.3rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.9rem' }}>Alt Konu Adı:</label>
                <input
                  type="text"
                  value={genSubTopic}
                  onChange={e => setGenSubTopic(e.target.value)}
                  placeholder="Örn: ACE inhibitörleri, Osteokondrom..."
                  style={{
                    width: '100%', padding: '0.75rem 1rem', borderRadius: '10px',
                    background: isLight ? 'white' : 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--glass-border)', color: 'var(--text-main)',
                    outline: 'none', marginTop: '0.3rem'
                  }}
                />
              </div>

              {generateError && (
                <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: 'var(--danger)', padding: '1rem', borderRadius: '12px', fontSize: '0.9rem', alignItems: 'center' }}>
                  <XCircle size={20} />
                  <span>{generateError}</span>
                </div>
              )}

              <button
                onClick={handleRunPipeline}
                disabled={isGenerating}
                style={{
                  width: '100%', padding: '1rem', borderRadius: '12px',
                  background: 'var(--primary)', color: 'white', border: 'none',
                  fontSize: '1rem', fontWeight: 800, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  transition: 'opacity 0.2s', opacity: isGenerating ? 0.7 : 1
                }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="spin" size={20} /> Yapay Zeka Hap Bilgiyi ve 3x Soru Varyasyonunu Türetiyor...
                  </>
                ) : (
                  <>
                    <Play size={18} /> AI Üretim Pipeline'ını Çalıştır
                  </>
                )}
              </button>
            </div>
          </div>

          {generateResult && (
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--glass-border)', marginTop: '2rem', animation: 'fadeIn 0.3s ease-out' }}>
              <div style={{ display: 'flex', gap: '0.5rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', alignItems: 'center' }}>
                <CheckCircle2 size={24} />
                <span style={{ fontWeight: 800 }}>Yapay Zeka başarıyla 1 Klasik Bilgi ve 3 Soru Varyasyonu türetti! Bu sorular admin onay kuyruğuna (Pending) eklendi.</span>
              </div>

              <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)' }}>Üretilen Hap Bilgi (Knowledge)</h4>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>"{generateResult.knowledge?.knowledgeText}"</div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span><b>Önem Skoru:</b> {generateResult.knowledge?.importanceScore}/100</span>
                  <span><b>Sıklık:</b> {generateResult.knowledge?.repetitionFrequency}</span>
                  <span><b>Kaynaklar:</b> {generateResult.knowledge?.sources}</span>
                </div>
              </div>

              <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)' }}>Üretilen Soru Varyasyonları</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {generateResult.questions?.map((q: any, i: number) => (
                  <div key={i} style={{ background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '12px' }}>
                    <div style={{ fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>Varyasyon Soru #{i + 1}</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.8rem' }}>{q.questionText}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <b>Seçenekler:</b> A) {q.optionA} | B) {q.optionB} | C) {q.optionC} | D) {q.optionD} | E) {q.optionE}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700, marginTop: '0.5rem' }}>
                      Doğru Seçenek: {q.correctOption}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
