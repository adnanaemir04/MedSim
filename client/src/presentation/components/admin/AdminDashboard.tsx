'use client';

import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, Users, Activity, UserPlus, BarChart3, Clock, 
  ShieldCheck, Cpu, Server, Database, AlertTriangle, Fingerprint, 
  TrendingUp, CheckCircle2, XCircle, Search, Sparkles, Loader2, BookOpen, LineChart
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { soundManager } from '../../../utils/soundManager';
import TusAdminPanel from '../tus/TusAdminPanel';
import { AnalyticsDashboard } from './analytics/AnalyticsDashboard';
import ReportManager from './reports/ReportManager';

interface UserStats {
  userId: string;
  email: string;
  nickname: string;
  role: string;
  totalTusSolved: number;
  correctTus: number;
  incorrectTus: number;
  totalCasesSolved: number;
  successfulCases: number;
  failedCases: number;
}

interface AuditLog {
  id: string;
  userEmail: string;
  action: string;
  details: string;
  createdAt: string;
}

export default function AdminDashboard({ userEmail }: { userEmail: string }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [activeTab, setActiveTab] = useState<'stats' | 'logs' | 'create' | 'tus' | 'analytics' | 'reports'>('analytics');
  const [stats, setStats] = useState<UserStats[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create Admin Form
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminNickname, setNewAdminNickname] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [createMessage, setCreateMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5211/api';

  useEffect(() => {
    fetchStats();
    fetchLogs();
  }, []);

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('medsim_access_token') : null;
    return {
      'User-Email': userEmail,
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/Admin/users-stats`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/Admin/audit-logs`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateMessage('');
    setIsSubmitting(true);
    soundManager.playClick();
    try {
      const res = await fetch(`${API_BASE_URL}/Admin/create-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ email: newAdminEmail, nickname: newAdminNickname, password: newAdminPassword })
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        soundManager.playSuccess();
        setCreateMessage('Yönetici hesabı başarıyla oluşturuldu.');
        setNewAdminEmail(''); 
        setNewAdminNickname(''); 
        setNewAdminPassword('');
        fetchStats(); 
      } else {
        soundManager.playError();
        setCreateMessage(data?.message || 'Bir hata oluştu.');
      }
    } catch (err) {
      soundManager.playError();
      setCreateMessage('Sunucuya bağlanılamadı.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.2rem' }}>
      <Loader2 size={44} className="animate-spin" style={{ color: 'var(--primary)' }} />
      <p style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.95rem', letterSpacing: '0.05em' }}>SİSTEM VERİLERİ YÜKLENİYOR...</p>
    </div>
  );

  const totalUsers = stats.length;
  const totalCases = stats.reduce((acc, s) => acc + s.totalCasesSolved, 0);
  const totalTus = stats.reduce((acc, s) => acc + s.totalTusSolved, 0);
  const adminCount = stats.filter(s => s.role === 'Admin' || s.role === 'SuperAdmin').length;

  const filteredStats = stats.filter(s => 
    s.nickname.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const metrics = [
    { title: "Toplam Kullanıcı", val: totalUsers, icon: Users, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' },
    { title: "Çözülen Vaka", val: totalCases, icon: Activity, color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
    { title: "Çözülen Soru", val: totalTus, icon: BarChart3, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
    { title: "Aktif Yönetici", val: adminCount, icon: ShieldAlert, color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.12)' },
  ];

  return (
    <div style={{ padding: '1rem 0', maxWidth: '1250px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{ 
            width: 54, height: 54, borderRadius: '16px', 
            background: 'linear-gradient(135deg, var(--primary), var(--accent))', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            color: 'white', boxShadow: '0 6px 20px var(--primary-glow)' 
          }}>
            <Fingerprint size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              Sistem Merkezi
              <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', background: 'var(--primary)', color: 'white', borderRadius: '8px', fontWeight: 800, letterSpacing: '0.05em' }}>
                SUPERADMIN
              </span>
            </h2>
            <p style={{ color: 'var(--text-muted)', margin: '0.2rem 0 0 0', fontSize: '0.95rem', fontWeight: 500 }}>
              Platform yönetim, performans analiz ve denetim matrisi.
            </p>
          </div>
        </div>

        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '0.6rem', 
          padding: '0.5rem 1.1rem', background: 'rgba(16, 185, 129, 0.1)', 
          color: '#10b981', borderRadius: '30px', border: '1px solid rgba(16, 185, 129, 0.2)', 
          fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.05em' 
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></span>
          SİSTEM AKTİF
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
        {metrics.map((m, i) => (
          <div 
            key={i} 
            style={{ 
              background: 'var(--glass-bg)', 
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--glass-border)', 
              borderRadius: '20px', 
              padding: '1.4rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1.2rem',
              boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            <div style={{ 
              width: 52, height: 52, borderRadius: '15px', 
              background: m.bg, color: m.color, 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              flexShrink: 0, boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1)' 
            }}>
              <m.icon size={26} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {m.title}
              </p>
              <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-main)' }}>
                {m.val}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Horizontal Tabs Navigation (Standard MedSim Tab Bar) */}
      <div style={{ 
        display: 'flex', gap: '0.8rem', 
        borderBottom: '1px solid var(--glass-border)', 
        paddingBottom: '1rem', marginBottom: '2rem',
        overflowX: 'auto'
      }}>
        {[
          { id: 'analytics', label: 'Dashboard & Analytics', icon: LineChart },
          { id: 'stats', label: `Kullanıcı Veritabanı (${stats.length})`, icon: Database },
          { id: 'logs', label: `Sistem Logları (${logs.length})`, icon: Server },
          { id: 'create', label: 'Yeni Yönetici Ekle', icon: UserPlus },
          { id: 'tus', label: 'TUS Soru Yönetimi', icon: BookOpen },
          { id: 'reports', label: 'Bildirimler', icon: AlertTriangle },
        ].map(t => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { soundManager.playClick(); setActiveTab(t.id as any); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.75rem 1.4rem', borderRadius: '14px',
                background: active ? 'var(--primary)' : 'rgba(255, 255, 255, 0.03)',
                color: active ? '#ffffff' : 'var(--text-muted)',
                border: active ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                transition: 'all 0.2s ease',
                boxShadow: active ? '0 4px 15px var(--primary-glow)' : 'none',
                whiteSpace: 'nowrap'
              }}
            >
              <t.icon size={18} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Main Panel Content */}
      <div style={{ 
        background: 'var(--glass-bg)', 
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '1px solid var(--glass-border)', 
        borderRadius: '24px', 
        padding: '2rem',
        boxShadow: '0 12px 40px rgba(0,0,0,0.04)'
      }}>
        
        {/* TAB 0: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <AnalyticsDashboard isLight={isLight} />
          </div>
        )}

        {/* TAB 1: USERS STATS */}
        {activeTab === 'stats' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Kullanıcı Performans Matrisi
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                  Platformdaki tüm hekim ve yöneticilerin soru ve vaka istatistikleri.
                </p>
              </div>

              {/* Search input */}
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '0.6rem', 
                background: 'rgba(255, 255, 255, 0.05)', 
                border: '1px solid var(--glass-border)', 
                borderRadius: '12px', padding: '0.5rem 1rem', width: '280px' 
              }}>
                <Search size={16} color="var(--text-muted)" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Kullanıcı veya e-posta ara..."
                  style={{
                    background: 'transparent', border: 'none', 
                    color: 'var(--text-main)', fontSize: '0.85rem', 
                    outline: 'none', width: '100%'
                  }}
                />
              </div>
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {filteredStats.map(s => {
                const tusPercent = s.totalTusSolved > 0 ? Math.round((s.correctTus / s.totalTusSolved) * 100) : 0;
                const casePercent = s.totalCasesSolved > 0 ? Math.round((s.successfulCases / s.totalCasesSolved) * 100) : 0;
                const isAdmin = s.role === 'SuperAdmin' || s.role === 'Admin';

                return (
                  <div 
                    key={s.userId}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                      padding: '1.2rem 1.4rem', borderRadius: '18px',
                      background: isAdmin ? 'rgba(244, 63, 94, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                      border: isAdmin ? '1px solid rgba(244, 63, 94, 0.2)' : '1px solid var(--glass-border)',
                      gap: '1.5rem', flexWrap: 'wrap', transition: 'transform 0.15s ease'
                    }}
                  >
                    {/* User Identity */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '260px', flex: 1 }}>
                      <div style={{
                        width: 46, height: 46, borderRadius: '50%',
                        background: isAdmin ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'rgba(100, 116, 139, 0.2)',
                        color: isAdmin ? '#ffffff' : 'var(--text-main)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '0.95rem', flexShrink: 0,
                        boxShadow: isAdmin ? '0 4px 12px var(--primary-glow)' : 'none'
                      }}>
                        {s.nickname.substring(0, 2).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {s.nickname}
                          </h4>
                          {isAdmin && (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                              padding: '0.15rem 0.5rem', borderRadius: '6px',
                              background: 'rgba(244, 63, 94, 0.12)', color: '#f43f5e',
                              fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.05em'
                            }}>
                              <ShieldCheck size={12} /> YÖNETİCİ
                            </span>
                          )}
                        </div>
                        <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.email}
                        </p>
                      </div>
                    </div>

                    {/* Performance Progress */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flex: 2, minWidth: '320px', flexWrap: 'wrap' }}>
                      {/* TUS Bar */}
                      <div style={{ flex: 1, minWidth: '140px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>TUS Başarısı</span>
                          <span style={{ color: 'var(--text-main)' }}>{tusPercent}%</span>
                        </div>
                        <div style={{ width: '100%', background: 'rgba(0,0,0,0.06)', height: '7px', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ 
                            height: '100%', borderRadius: '4px', 
                            background: tusPercent > 50 ? '#10b981' : '#f59e0b', 
                            width: `${tusPercent}%`, transition: 'width 0.8s ease' 
                          }}></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem', fontWeight: 600 }}>
                          <span>{s.correctTus} D / {s.incorrectTus} Y</span>
                          <span>{s.totalTusSolved} Soru</span>
                        </div>
                      </div>

                      {/* Case Bar */}
                      <div style={{ flex: 1, minWidth: '140px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Vaka Başarısı</span>
                          <span style={{ color: 'var(--text-main)' }}>{casePercent}%</span>
                        </div>
                        <div style={{ width: '100%', background: 'rgba(0,0,0,0.06)', height: '7px', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ 
                            height: '100%', borderRadius: '4px', 
                            background: casePercent > 50 ? '#3b82f6' : '#f59e0b', 
                            width: `${casePercent}%`, transition: 'width 0.8s ease' 
                          }}></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem', fontWeight: 600 }}>
                          <span>{s.successfulCases} Başarılı</span>
                          <span>{s.totalCasesSolved} Vaka</span>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}

              {filteredStats.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                  Arama kriterlerine uygun kullanıcı bulunamadı.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: AUDIT LOGS */}
        {activeTab === 'logs' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Sistem ve Güvenlik Logları
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                Yönetici aktiviteleri, soru yükleme ve sistem olay kayıtları.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {logs.map((l) => (
                <div 
                  key={l.id} 
                  style={{
                    display: 'flex', gap: '1rem', alignItems: 'flex-start',
                    padding: '1.1rem 1.3rem', borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--glass-border)'
                  }}
                >
                  <div style={{ 
                    width: 38, height: 38, borderRadius: '10px', 
                    background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    flexShrink: 0, marginTop: '0.1rem' 
                  }}>
                    <Activity size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {l.userEmail}
                      </span>
                      <span style={{ 
                        fontSize: '0.68rem', fontWeight: 800, 
                        background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', 
                        padding: '0.2rem 0.5rem', borderRadius: '6px', 
                        textTransform: 'uppercase', letterSpacing: '0.05em' 
                      }}>
                        {l.action}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0', lineHeight: 1.5 }}>
                      {l.details}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 600 }}>
                      <Clock size={12} />
                      {new Date(l.createdAt).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' })}
                    </div>
                  </div>
                </div>
              ))}

              {logs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                  <Server size={40} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '0.8rem' }} />
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>
                    Kayıtlı sistem logu bulunamadı.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CREATE ADMIN */}
        {activeTab === 'create' && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem 0' }}>
            <div style={{ width: '100%', maxWidth: '440px' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ 
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', 
                  width: 56, height: 56, borderRadius: '16px', 
                  background: 'rgba(244, 63, 94, 0.12)', color: 'var(--primary)', 
                  marginBottom: '1rem', boxShadow: '0 4px 15px var(--primary-glow)' 
                }}>
                  <UserPlus size={28} />
                </div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  Yeni Yönetici Yetkilendir
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.3rem', margin: 0 }}>
                  Sisteme tam yetkili yeni bir yönetici hesabı ekleyin.
                </p>
              </div>

              <form onSubmit={handleCreateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    E-Posta Adresi
                  </label>
                  <input 
                    type="email" 
                    required 
                    value={newAdminEmail}
                    onChange={e => setNewAdminEmail(e.target.value)}
                    placeholder="admin@medsim.com"
                    style={{ 
                      width: '100%', background: 'rgba(255, 255, 255, 0.06)', 
                      border: '1px solid var(--glass-border)', borderRadius: '12px', 
                      padding: '0.8rem 1rem', fontSize: '0.9rem', color: 'var(--text-main)', 
                      outline: 'none', transition: 'border-color 0.2s' 
                    }} 
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Unvan & İsim
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={newAdminNickname}
                    onChange={e => setNewAdminNickname(e.target.value)}
                    placeholder="Prof. Dr. XYZ"
                    style={{ 
                      width: '100%', background: 'rgba(255, 255, 255, 0.06)', 
                      border: '1px solid var(--glass-border)', borderRadius: '12px', 
                      padding: '0.8rem 1rem', fontSize: '0.9rem', color: 'var(--text-main)', 
                      outline: 'none', transition: 'border-color 0.2s' 
                    }} 
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Geçici Şifre
                  </label>
                  <input 
                    type="password" 
                    required 
                    value={newAdminPassword}
                    onChange={e => setNewAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ 
                      width: '100%', background: 'rgba(255, 255, 255, 0.06)', 
                      border: '1px solid var(--glass-border)', borderRadius: '12px', 
                      padding: '0.8rem 1rem', fontSize: '0.9rem', color: 'var(--text-main)', 
                      outline: 'none', transition: 'border-color 0.2s' 
                    }} 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  style={{ 
                    width: '100%', marginTop: '0.6rem', 
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
                    color: '#ffffff', border: 'none', borderRadius: '14px', 
                    padding: '0.9rem', fontSize: '0.95rem', fontWeight: 800, 
                    cursor: isSubmitting ? 'not-allowed' : 'pointer', 
                    opacity: isSubmitting ? 0.6 : 1,
                    transition: 'all 0.2s ease', 
                    boxShadow: '0 4px 20px var(--primary-glow)' 
                  }}
                >
                  {isSubmitting ? 'Yetkilendiriliyor...' : 'Yönetici Hesabını Oluştur'}
                </button>

                {createMessage && (
                  <div style={{
                    marginTop: '1rem', padding: '0.85rem', borderRadius: '10px',
                    fontSize: '0.85rem', fontWeight: 700, textAlign: 'center',
                    background: createMessage.includes('başarıyla') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                    color: createMessage.includes('başarıyla') ? '#10b981' : '#ef4444',
                    border: createMessage.includes('başarıyla') ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(244, 63, 94, 0.2)',
                  }}>
                    {createMessage}
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: TUS ADMIN */}
        {activeTab === 'tus' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <TusAdminPanel onBack={() => setActiveTab('stats')} />
          </div>
        )}

        {/* TAB 5: REPORTS */}
        {activeTab === 'reports' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <ReportManager />
          </div>
        )}

      </div>
    </div>
  );
}
