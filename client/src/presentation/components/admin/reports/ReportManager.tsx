import React, { useState, useEffect } from 'react';
import { getAdminReports, getAdminReportStats, getAdminReportDetail, updateAdminReportStatus } from '../../../../infrastructure/api/simulationApi';
import { Loader2, AlertCircle, CheckCircle, Clock, XCircle, Search, Filter, MessageSquare, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../context/ThemeContext';

export default function ReportManager() {
  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    fetchData();
  }, [statusFilter, typeFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsData, reportsData] = await Promise.all([
        getAdminReportStats(),
        getAdminReports(statusFilter !== 'All' ? statusFilter : undefined, typeFilter !== 'All' ? typeFilter : undefined)
      ]);
      setStats(statsData);
      setReports(reportsData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDetail = async (id: string) => {
    setIsDetailLoading(true);
    setSelectedReport({ id }); // Placeholder while loading
    try {
      const data = await getAdminReportDetail(id);
      setSelectedReport(data);
      setAdminNote(data.adminNote || '');
    } catch (err) {
      console.error(err);
      setSelectedReport(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedReport) return;
    setIsUpdating(true);
    try {
      await updateAdminReportStatus(selectedReport.id, newStatus, adminNote);
      setSelectedReport({ ...selectedReport, status: newStatus, adminNote });
      fetchData(); // Refresh list
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Pending': return <span style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '0.3rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={12}/> Bekliyor</span>;
      case 'Reviewing': return <span style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', padding: '0.3rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Search size={12}/> İnceleniyor</span>;
      case 'Resolved': return <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '0.3rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}><CheckCircle size={12}/> Çözüldü</span>;
      case 'Rejected': return <span style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', padding: '0.3rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}><XCircle size={12}/> Reddedildi</span>;
      default: return null;
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text-main)' }}>Bildirim Yönetimi</h2>
      
      {/* Stats Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Toplam Bildirim</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>{stats.totalReports}</div>
          </div>
          <div style={{ background: 'rgba(245,158,11,0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ color: '#f59e0b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Bekleyen</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.5rem' }}>{stats.pendingReports}</div>
          </div>
          <div style={{ background: 'rgba(16,185,129,0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Çözülen</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', marginTop: '0.5rem' }}>{stats.resolvedReports}</div>
          </div>
          <div style={{ background: 'rgba(239,68,68,0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Reddedilen</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444', marginTop: '0.5rem' }}>{stats.rejectedReports}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: 'var(--glass-bg)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--text-muted)" />
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>Filtreler:</span>
        </div>
        <select 
          value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--glass-border)', padding: '0.5rem', borderRadius: '8px', outline: 'none' }}
        >
          <option value="All">Tüm Durumlar</option>
          <option value="Pending">Bekleyenler</option>
          <option value="Reviewing">İncelenenler</option>
          <option value="Resolved">Çözülenler</option>
          <option value="Rejected">Reddedilenler</option>
        </select>
        <select 
          value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--glass-border)', padding: '0.5rem', borderRadius: '8px', outline: 'none' }}
        >
          <option value="All">Tüm İçerikler</option>
          <option value="MedicalCase">Vakalar</option>
          <option value="TusQuestion">TUS Soruları</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--glass-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 className="spin" color="var(--primary)" size={32} /></div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>İçerik</th>
                <th style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tür</th>
                <th style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Bildirim Nedeni</th>
                <th style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Kullanıcı</th>
                <th style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tarih</th>
                <th style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Durum</th>
                <th style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}></th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem', color: 'var(--text-main)', fontSize: '0.9rem', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <span style={{ fontWeight: 600 }}>{r.contentType === 'MedicalCase' ? 'Vaka' : 'TUS'}:</span> {r.contentTitleOrSnippet}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-main)', fontSize: '0.85rem' }}>{r.contentType}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600 }}>{r.reportType}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-main)', fontSize: '0.85rem' }}>@{r.reporterNickname}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(r.createdAt).toLocaleDateString('tr-TR')}</td>
                  <td style={{ padding: '1rem' }}>{getStatusBadge(r.status)}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleOpenDetail(r.id)}
                      style={{ background: 'var(--primary)', border: 'none', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                    >
                      İncele
                    </button>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Bildirim bulunamadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ background: 'var(--bg-main)', borderRadius: '24px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--glass-border)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
            >
              <div style={{ position: 'sticky', top: 0, background: 'var(--bg-main)', padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle color="var(--primary)" /> Bildirim Detayı
                </h3>
                <button onClick={() => setSelectedReport(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X /></button>
              </div>

              <div style={{ padding: '1.5rem' }}>
                {isDetailLoading || !selectedReport.originalContent ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 className="spin" color="var(--primary)" size={32} /></div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Reporter Info */}
                    <div style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Bildiren</div>
                        <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>@{selectedReport.reporterNickname}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Neden</div>
                        <div style={{ color: 'var(--danger)', fontWeight: 700 }}>{selectedReport.reportType}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Durum</div>
                        <div>{getStatusBadge(selectedReport.status)}</div>
                      </div>
                    </div>

                    {selectedReport.description && (
                      <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.05)', borderRadius: '12px', borderLeft: '3px solid #ef4444' }}>
                        <div style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 700, marginBottom: '0.4rem', textTransform: 'uppercase' }}>Kullanıcı Açıklaması</div>
                        <div style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{selectedReport.description}</div>
                      </div>
                    )}

                    {/* Original Content */}
                    <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.1)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                      <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)', fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Şikayet Edilen İçerik ({selectedReport.contentType})</h4>
                      
                      {selectedReport.contentType === 'TusQuestion' && (
                        <div>
                          <p style={{ color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 600 }}>{selectedReport.originalContent.questionText}</p>
                          <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {['A', 'B', 'C', 'D', 'E'].map(opt => {
                              const isCorrect = selectedReport.originalContent.correctOption === opt;
                              return (
                                <li key={opt} style={{ padding: '0.8rem', background: isCorrect ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)', border: isCorrect ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-main)' }}>
                                  <strong style={{ color: isCorrect ? '#10b981' : 'var(--primary)', marginRight: '0.5rem' }}>{opt})</strong> 
                                  {selectedReport.originalContent[`option${opt}`]}
                                </li>
                              )
                            })}
                          </ul>
                          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                            <strong style={{color:'var(--success)'}}>Çözüm:</strong> <span dangerouslySetInnerHTML={{__html: selectedReport.originalContent.explanation}} />
                          </div>
                        </div>
                      )}

                      {selectedReport.contentType === 'MedicalCase' && (
                        <div>
                          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--primary)' }}>{selectedReport.originalContent.title}</h3>
                          <div style={{ color: 'var(--text-main)', fontSize: '0.9rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                            {selectedReport.originalContent.initialText}
                          </div>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1rem' }}>*Vaka detaylarının tamamı admin panelinden "Vakalar" sekmesinden incelenebilir.</p>
                        </div>
                      )}
                    </div>

                    {/* Admin Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', background: 'var(--glass-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                      <h4 style={{ margin: 0, color: 'var(--text-main)' }}>Aksiyon Al</h4>
                      
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Admin Notu (Opsiyonel)</label>
                        <textarea 
                          value={adminNote} onChange={e => setAdminNote(e.target.value)}
                          placeholder="Bu bildirimle ilgili notunuz..."
                          style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', outline: 'none', resize: 'vertical' }}
                          rows={3}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {selectedReport.status === 'Pending' && (
                          <button onClick={() => handleUpdateStatus('Reviewing')} disabled={isUpdating} style={{ flex: 1, padding: '0.8rem', background: 'rgba(139,92,246,0.1)', border: '1px solid #8b5cf6', color: '#8b5cf6', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                            İncelemeye Al
                          </button>
                        )}
                        <button onClick={() => handleUpdateStatus('Resolved')} disabled={isUpdating} style={{ flex: 1, padding: '0.8rem', background: 'var(--success)', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                          Çözüldü Olarak İşaretle
                        </button>
                        <button onClick={() => handleUpdateStatus('Rejected')} disabled={isUpdating} style={{ flex: 1, padding: '0.8rem', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                          Reddet
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style jsx>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
