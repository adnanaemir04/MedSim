'use client';

import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, Users, Activity, UserPlus, BarChart3, Clock, 
  ShieldCheck, Cpu, Server, Database, AlertTriangle, Fingerprint, 
  TrendingUp, CheckCircle2, XCircle, Search, Sparkles, Loader2, BookOpen, LineChart, MessageSquare, Trash2, Star
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

  const [activeTab, setActiveTab] = useState<'stats' | 'logs' | 'create' | 'tus' | 'analytics' | 'reports' | 'feedbacks'>('analytics');
  const [stats, setStats] = useState<UserStats[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // User Stats Filters
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('tusDesc');
  const [tusSuccessFilter, setTusSuccessFilter] = useState<number>(0);
  const [caseSuccessFilter, setCaseSuccessFilter] = useState<number>(0);

  // Log Filters
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logActionFilter, setLogActionFilter] = useState<string>('all');
  const [logDateFilter, setLogDateFilter] = useState<string>('all');
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  const toggleLogExpand = (id: string) => {
    setExpandedLogs(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  // Create Admin Form
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminNickname, setNewAdminNickname] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [createMessage, setCreateMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || (typeof window !== 'undefined' ? `http://${window.location.hostname}:5211/api` : 'http://localhost:5211/api');

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

  let filteredStats = stats.filter(s => {
    const matchesSearch = s.nickname.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesRole = true;
    if (roleFilter !== 'all') {
      if (roleFilter === 'Admin') matchesRole = (s.role === 'Admin' || s.role === 'SuperAdmin');
      else if (roleFilter === 'SuperAdmin') matchesRole = s.role === 'SuperAdmin';
      else if (roleFilter === 'User') matchesRole = (s.role !== 'Admin' && s.role !== 'SuperAdmin');
    }

    const tusPercent = s.totalTusSolved > 0 ? Math.round((s.correctTus / s.totalTusSolved) * 100) : 0;
    const casePercent = s.totalCasesSolved > 0 ? Math.round((s.successfulCases / s.totalCasesSolved) * 100) : 0;
    
    const matchesTusSuccess = tusPercent >= tusSuccessFilter;
    const matchesCaseSuccess = casePercent >= caseSuccessFilter;

    return matchesSearch && matchesRole && matchesTusSuccess && matchesCaseSuccess;
  });

  filteredStats.sort((a, b) => {
    if (sortBy === 'nameAsc') return a.nickname.localeCompare(b.nickname);
    if (sortBy === 'nameDesc') return b.nickname.localeCompare(a.nickname);
    if (sortBy === 'tusDesc') return b.totalTusSolved - a.totalTusSolved;
    if (sortBy === 'casesDesc') return b.totalCasesSolved - a.totalCasesSolved;
    if (sortBy === 'tusSuccess') {
      const aTus = a.totalTusSolved > 0 ? Math.round((a.correctTus / a.totalTusSolved) * 100) : 0;
      const bTus = b.totalTusSolved > 0 ? Math.round((b.correctTus / b.totalTusSolved) * 100) : 0;
      return bTus - aTus;
    }
    if (sortBy === 'caseSuccess') {
      const aCase = a.totalCasesSolved > 0 ? Math.round((a.successfulCases / a.totalCasesSolved) * 100) : 0;
      const bCase = b.totalCasesSolved > 0 ? Math.round((b.successfulCases / b.totalCasesSolved) * 100) : 0;
      return bCase - aCase;
    }
    return 0;
  });


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

      {/* Metrics Grid removed as per user request - moved to AnalyticsOverview */}
      {/* Horizontal Tabs Navigation (Standard MedSim Tab Bar) */}
      <div style={{ 
        display: 'flex', gap: '0.6rem', 
        borderBottom: '1px solid var(--glass-border)', 
        paddingBottom: '0.8rem', marginBottom: '1.5rem',
        overflowX: 'auto'
      }}>
        {[
          { id: 'analytics', label: 'Dashboard & Analytics', icon: LineChart },
          { id: 'stats', label: `Kullanıcı Veritabanı (${stats.length})`, icon: Database },
          { id: 'logs', label: `Sistem Logları (${logs.length})`, icon: Server },
          { id: 'create', label: 'Yeni Yönetici Ekle', icon: UserPlus },
          { id: 'tus', label: 'TUS Soru Yönetimi', icon: BookOpen },
          { id: 'reports', label: 'Bildirimler', icon: AlertTriangle },
          { id: 'feedbacks', label: 'Geri Bildirimler', icon: MessageSquare },
        ].map(t => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { soundManager.playClick(); setActiveTab(t.id as any); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.5rem 1rem', borderRadius: '12px',
                background: active ? 'var(--primary)' : 'rgba(255, 255, 255, 0.03)',
                color: active ? '#ffffff' : 'var(--text-muted)',
                border: active ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem',
                transition: 'all 0.2s ease',
                boxShadow: active ? '0 4px 15px var(--primary-glow)' : 'none',
                whiteSpace: 'nowrap'
              }}
            >
              <t.icon size={16} />
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
            <AnalyticsDashboard 
              isLight={isLight} 
              totalUsers={totalUsers}
              totalCases={totalCases}
              totalTus={totalTus}
              adminCount={adminCount}
            />
          </div>
        )}

        {/* TAB 1: USERS STATS */}
        {activeTab === 'stats' && (() => {
          const inputBg = isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)';
          const inputBorder = isLight ? 'rgba(0, 0, 0, 0.1)' : 'var(--glass-border)';
          const optionBg = isLight ? '#ffffff' : 'var(--bg-main)';

          return (
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
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.6rem', 
                  background: inputBg, 
                  border: `1px solid ${inputBorder}`, 
                  borderRadius: '12px', padding: '0.5rem 1rem', minWidth: '220px', flex: 1, maxWidth: '300px',
                  transition: 'all 0.2s'
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
                <select 
                  value={roleFilter} 
                  onChange={e => setRoleFilter(e.target.value)}
                  style={{
                    background: inputBg, border: `1px solid ${inputBorder}`,
                    color: 'var(--text-main)', padding: '0.5rem 1rem', borderRadius: '12px', outline: 'none', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <option value="all" style={{background: optionBg}}>Tüm Roller</option>
                  <option value="Admin" style={{background: optionBg}}>Yöneticiler</option>
                  <option value="SuperAdmin" style={{background: optionBg}}>Süper Adminler</option>
                  <option value="User" style={{background: optionBg}}>Hekimler</option>
                </select>
                <select 
                  value={sortBy} 
                  onChange={e => setSortBy(e.target.value)}
                  style={{
                    background: inputBg, border: `1px solid ${inputBorder}`,
                    color: 'var(--text-main)', padding: '0.5rem 1rem', borderRadius: '12px', outline: 'none', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <option value="tusDesc" style={{background: optionBg}}>TUS Çözüm (Çoktan Aza)</option>
                  <option value="casesDesc" style={{background: optionBg}}>Vaka Çözüm (Çoktan Aza)</option>
                  <option value="tusSuccess" style={{background: optionBg}}>TUS Başarı (%)</option>
                  <option value="caseSuccess" style={{background: optionBg}}>Vaka Başarı (%)</option>
                  <option value="nameAsc" style={{background: optionBg}}>İsim (A-Z)</option>
                  <option value="nameDesc" style={{background: optionBg}}>İsim (Z-A)</option>
                </select>
                <select 
                  value={tusSuccessFilter} 
                  onChange={e => setTusSuccessFilter(Number(e.target.value))}
                  style={{
                    background: inputBg, border: `1px solid ${inputBorder}`,
                    color: 'var(--text-main)', padding: '0.5rem 1rem', borderRadius: '12px', outline: 'none', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <option value={0} style={{background: optionBg}}>TUS Başarısı Tümü</option>
                  <option value={50} style={{background: optionBg}}>Min %50 TUS</option>
                  <option value={80} style={{background: optionBg}}>Min %80 TUS</option>
                </select>
                <select 
                  value={caseSuccessFilter} 
                  onChange={e => setCaseSuccessFilter(Number(e.target.value))}
                  style={{
                    background: inputBg, border: `1px solid ${inputBorder}`,
                    color: 'var(--text-main)', padding: '0.5rem 1rem', borderRadius: '12px', outline: 'none', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <option value={0} style={{background: optionBg}}>Vaka Başarısı Tümü</option>
                  <option value={50} style={{background: optionBg}}>Min %50 Vaka</option>
                  <option value={80} style={{background: optionBg}}>Min %80 Vaka</option>
                </select>
                {(searchQuery !== '' || roleFilter !== 'all' || sortBy !== 'tusDesc' || tusSuccessFilter !== 0 || caseSuccessFilter !== 0) && (
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setRoleFilter('all');
                      setSortBy('tusDesc');
                      setTusSuccessFilter(0);
                      setCaseSuccessFilter(0);
                      soundManager.playClick();
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.5rem 1rem', 
                      borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                  >
                    <XCircle size={16} />
                    Temizle
                  </button>
                )}
              </div>
            </div>

            {/* Filtered Summary Panel */}
            <div style={{
              display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap',
              background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)',
              padding: '1rem', borderRadius: '16px', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <Activity color="#10b981" size={20}/>
                <span style={{color: 'var(--text-main)', fontWeight: 600}}>Filtrelenmiş Sonuçlar: <b style={{color: '#10b981'}}>{filteredStats.length} Kullanıcı</b></span>
              </div>
              <div style={{display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem'}}>
                <span>Top. TUS Çözüm: <b style={{color: 'var(--text-main)'}}>{filteredStats.reduce((acc, s) => acc + s.totalTusSolved, 0)}</b></span>
                <span>Top. Vaka Çözüm: <b style={{color: 'var(--text-main)'}}>{filteredStats.reduce((acc, s) => acc + s.totalCasesSolved, 0)}</b></span>
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
          );
        })()}

        {/* TAB 2: AUDIT LOGS */}
        {activeTab === 'logs' && (() => {
          const now = new Date();
          const inputBg = isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)';
          const inputBorder = isLight ? 'rgba(0, 0, 0, 0.1)' : 'var(--glass-border)';
          const optionBg = isLight ? '#ffffff' : 'var(--bg-main)';
          const cardBgHover = isLight ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)';

          const filteredLogs = logs.filter(l => {
            const matchesSearch = l.userEmail.toLowerCase().includes(logSearchQuery.toLowerCase()) || 
                                  l.details.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
                                  l.action.toLowerCase().includes(logSearchQuery.toLowerCase());
            
            const matchesAction = logActionFilter === 'all' || l.action.includes(logActionFilter);
            
            let matchesDate = true;
            if (logDateFilter !== 'all') {
              const logDate = new Date(l.createdAt);
              const diffMs = now.getTime() - logDate.getTime();
              const diffHours = diffMs / (1000 * 60 * 60);
              if (logDateFilter === '24h') matchesDate = diffHours <= 24;
              else if (logDateFilter === '7d') matchesDate = diffHours <= (24 * 7);
              else if (logDateFilter === '30d') matchesDate = diffHours <= (24 * 30);
            }
            return matchesSearch && matchesAction && matchesDate;
          });

          return (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    Sistem ve Güvenlik Logları
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                    Yönetici aktiviteleri, soru yükleme ve sistem olay kayıtları.
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
                  <div style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.6rem', 
                    background: inputBg, 
                    border: `1px solid ${inputBorder}`, 
                    borderRadius: '12px', padding: '0.5rem 1rem', minWidth: '220px', flex: 1, maxWidth: '300px',
                    transition: 'all 0.2s'
                  }}>
                    <Search size={16} color="var(--text-muted)" />
                    <input 
                      type="text" 
                      value={logSearchQuery}
                      onChange={e => setLogSearchQuery(e.target.value)}
                      placeholder="E-posta veya detay ara..."
                      style={{
                        background: 'transparent', border: 'none', 
                        color: 'var(--text-main)', fontSize: '0.85rem', 
                        outline: 'none', width: '100%'
                      }}
                    />
                  </div>
                  <select 
                    value={logActionFilter} 
                    onChange={e => setLogActionFilter(e.target.value)}
                    style={{
                      background: inputBg, border: `1px solid ${inputBorder}`,
                      color: 'var(--text-main)', padding: '0.5rem 1rem', borderRadius: '12px', outline: 'none', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    <option value="all" style={{background: optionBg}}>Tüm İşlemler</option>
                    <option value="LOGIN" style={{background: optionBg}}>Giriş İşlemleri</option>
                    <option value="CREATE_ADMIN" style={{background: optionBg}}>Yönetici Ekleme</option>
                    <option value="GENERATE_CASE" style={{background: optionBg}}>Vaka Oluşturma</option>
                    <option value="CREATE_QUESTION" style={{background: optionBg}}>Soru Ekleme</option>
                  </select>
                  <select 
                    value={logDateFilter} 
                    onChange={e => setLogDateFilter(e.target.value)}
                    style={{
                      background: inputBg, border: `1px solid ${inputBorder}`,
                      color: 'var(--text-main)', padding: '0.5rem 1rem', borderRadius: '12px', outline: 'none', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    <option value="all" style={{background: optionBg}}>Tüm Zamanlar</option>
                    <option value="24h" style={{background: optionBg}}>Son 24 Saat</option>
                    <option value="7d" style={{background: optionBg}}>Son 7 Gün</option>
                    <option value="30d" style={{background: optionBg}}>Son 30 Gün</option>
                  </select>
                  {(logSearchQuery !== '' || logActionFilter !== 'all' || logDateFilter !== 'all') && (
                    <button 
                      onClick={() => {
                        setLogSearchQuery('');
                        setLogActionFilter('all');
                        setLogDateFilter('all');
                        soundManager.playClick();
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.5rem 1rem', 
                        borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    >
                      <XCircle size={16} />
                      Temizle
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {filteredLogs.map((l) => {
                  let LogIcon = Activity;
                  let color = '#3b82f6';
                  let bg = 'rgba(59, 130, 246, 0.1)';
                  
                  if (l.action.includes('CREATE_ADMIN') || l.action.includes('DELETE')) {
                    LogIcon = ShieldAlert;
                    color = '#ef4444';
                    bg = 'rgba(239, 68, 68, 0.1)';
                  } else if (l.action.includes('LOGIN') || l.action.includes('AUTH')) {
                    LogIcon = ShieldCheck;
                    color = '#10b981';
                    bg = 'rgba(16, 185, 129, 0.1)';
                  } else if (l.action.includes('GENERATE_CASE') || l.action.includes('CREATE_QUESTION')) {
                    LogIcon = BookOpen;
                    color = '#8b5cf6';
                    bg = 'rgba(139, 92, 246, 0.1)';
                  } else if (l.action.includes('UPDATE')) {
                    LogIcon = Server; // Replaced Settings with Server to fix TS error
                    color = '#f59e0b';
                    bg = 'rgba(245, 158, 11, 0.1)';
                  }

                  const isExpanded = !!expandedLogs[l.id];

                  return (
                    <div 
                      key={l.id} 
                      onClick={() => toggleLogExpand(l.id)}
                      style={{
                        display: 'flex', gap: '1rem', alignItems: 'flex-start',
                        padding: '1.2rem', borderRadius: '16px',
                        background: isExpanded ? cardBgHover : 'transparent',
                        border: `1px solid ${inputBorder}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isExpanded ? `0 0 0 1px ${color}` : 'none'
                      }}
                      onMouseEnter={e => { if(!isExpanded) e.currentTarget.style.background = cardBgHover; }}
                      onMouseLeave={e => { if(!isExpanded) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ 
                        width: 42, height: 42, borderRadius: '12px', 
                        background: bg, color: color, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        flexShrink: 0 
                      }}>
                        <LogIcon size={20} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {l.userEmail}
                          </span>
                          <span style={{ 
                            fontSize: '0.7rem', fontWeight: 800, 
                            background: bg, color: color, 
                            padding: '0.25rem 0.6rem', borderRadius: '8px', 
                            textTransform: 'uppercase', letterSpacing: '0.05em' 
                          }}>
                            {l.action}
                          </span>
                        </div>
                        <p style={{ 
                          fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0', lineHeight: 1.5,
                          display: '-webkit-box', WebkitLineClamp: isExpanded ? 'unset' : 1, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                        }}>
                          {l.details}
                        </p>
                        
                        {isExpanded && (
                          <div style={{ 
                            marginTop: '1rem', padding: '1rem', 
                            background: 'rgba(0,0,0,0.2)', borderRadius: '12px', 
                            fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)',
                            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                            borderLeft: `3px solid ${color}`
                          }}>
                            {l.details}
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.8rem', fontWeight: 600 }}>
                          <Clock size={14} />
                          {new Date(l.createdAt).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' })}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredLogs.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                    <Server size={40} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '0.8rem' }} />
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>
                      Kayıtlı sistem logu bulunamadı.
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

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

        {/* TAB: REPORTS */}
        {activeTab === 'reports' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <ReportManager />
          </div>
        )}

        {/* TAB: FEEDBACKS */}
        {activeTab === 'feedbacks' && (() => {
          const rawFeedbacks = typeof window !== 'undefined' ? localStorage.getItem('medsim_user_feedbacks') : '[]';
          const feedbacks = JSON.parse(rawFeedbacks || '[]');
          
          const handleDelete = (id: string) => {
            if (confirm("Bu geri bildirimi silmek istediğinize emin misiniz?")) {
              const updated = feedbacks.filter((f: any) => f.id !== id);
              localStorage.setItem('medsim_user_feedbacks', JSON.stringify(updated));
              // Force re-render trick by setting activeTab again
              setActiveTab('stats');
              setTimeout(() => setActiveTab('feedbacks'), 10);
            }
          };

          return (
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    Kullanıcı Geri Bildirimleri
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                    Liderlik tablosu üzerinden gönderilen görüş, öneri ve hata bildirimleri.
                  </p>
                </div>
              </div>

              {feedbacks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(0,0,0,0.2)', borderRadius: '16px' }}>
                  <MessageSquare size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <p>Henüz bir geri bildirim bulunmuyor.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {feedbacks.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((fb: any) => (
                    <div key={fb.id} style={{ 
                      background: isLight ? '#ffffff' : 'rgba(30, 41, 59, 0.4)', 
                      border: isLight ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)', 
                      borderRadius: '16px', padding: '1.5rem', position: 'relative',
                      boxShadow: isLight ? '0 10px 20px rgba(0,0,0,0.02)' : '0 10px 20px rgba(0,0,0,0.2)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ fontWeight: 800, color: isLight ? '#0f172a' : 'white' }}>{fb.nickname}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{fb.userEmail}</div>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '8px' }}>
                          {new Date(fb.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                      </div>

                      {fb.ratings && Object.values(fb.ratings).some((r: any) => r > 0) && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1rem', padding: '1rem', background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                          {[
                            { key: 'teaching', label: 'Öğreticilik' },
                            { key: 'usability', label: 'Kullanılabilirlik' },
                            { key: 'easeOfUse', label: 'Kolaylık' },
                            { key: 'realLife', label: 'Gerçekçilik' },
                            { key: 'analysis', label: 'Analiz' },
                            { key: 'speed', label: 'Hız' },
                            { key: 'detail', label: 'Detaycılık' }
                          ].map(metric => fb.ratings[metric.key] > 0 ? (
                            <div key={metric.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{metric.label}</span>
                              <div style={{ display: 'flex', gap: '0.1rem' }}>
                                {[1, 2, 3, 4, 5].map(s => (
                                  <Star key={s} size={12} fill={s <= fb.ratings[metric.key] ? '#fbbf24' : 'transparent'} color={s <= fb.ratings[metric.key] ? '#fbbf24' : (isLight ? '#cbd5e1' : '#475569')} />
                                ))}
                              </div>
                            </div>
                          ) : null)}
                        </div>
                      )}

                      <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                        {fb.message}
                      </p>
                      <button 
                        onClick={() => handleDelete(fb.id)}
                        style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.6, transition: 'all 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

      </div>
    </div>
  );
}
