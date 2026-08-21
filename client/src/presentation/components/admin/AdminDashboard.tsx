'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert, Users, Activity, UserPlus, CheckCircle, XCircle, TrendingUp, Award, Clock } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'stats' | 'logs' | 'create'>('stats');
  const [stats, setStats] = useState<UserStats[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminNickname, setNewAdminNickname] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [createMessage, setCreateMessage] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || '/api';

  useEffect(() => { fetchStats(); fetchLogs(); }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/Admin/users-stats`, { headers: { 'User-Email': userEmail } });
      if (res.ok) setStats(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/Admin/audit-logs`, { headers: { 'User-Email': userEmail } });
      if (res.ok) setLogs(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateMessage(''); setCreateLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/Admin/create-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Email': userEmail },
        body: JSON.stringify({ email: newAdminEmail, nickname: newAdminNickname, password: newAdminPassword })
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setCreateMessage('success:Yönetici başarıyla oluşturuldu.');
        setNewAdminEmail(''); setNewAdminNickname(''); setNewAdminPassword('');
        fetchStats();
      } else { setCreateMessage('error:' + (data?.message || 'Bir hata oluştu.')); }
    } catch { setCreateMessage('error:Sunucuya bağlanılamadı.'); }
    finally { setCreateLoading(false); }
  };

  const roleColor = (role: string) => {
    if (role === 'SuperAdmin') return { bg: 'rgba(225,29,72,0.15)', color: '#e11d48', border: 'rgba(225,29,72,0.3)' };
    if (role === 'Admin') return { bg: 'rgba(251,146,60,0.15)', color: '#f97316', border: 'rgba(251,146,60,0.3)' };
    return { bg: 'rgba(100,116,139,0.15)', color: '#64748b', border: 'rgba(100,116,139,0.2)' };
  };

  const successRate = (correct: number, total: number) => total > 0 ? Math.round((correct / total) * 100) : 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'spin 1s linear infinite' }}>
            <Activity style={{ color: 'white', width: 18, height: 18 }} />
          </div>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Yükleniyor...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const tabs = [
    { key: 'stats', label: 'İstatistikler', icon: <Users size={15} /> },
    { key: 'logs', label: 'Aktivite Logları', icon: <Activity size={15} /> },
    { key: 'create', label: 'Yönetici Ekle', icon: <UserPlus size={15} /> },
  ] as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, rgba(225,29,72,0.1) 0%, rgba(159,18,57,0.06) 100%)', border: '1px solid rgba(225,29,72,0.18)', borderRadius: 14, padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px var(--primary-glow)' }}>
            <ShieldAlert style={{ color: 'white', width: 18, height: 18 }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.3px', background: 'linear-gradient(135deg, var(--text-main), var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Sistem Yönetimi</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500, margin: 0 }}>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{userEmail}</span>
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[{ icon: <Users size={12} />, value: stats.length, label: 'Kullanıcı' }, { icon: <TrendingUp size={12} />, value: logs.length, label: 'Log' }].map((chip, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}>
              <span style={{ color: 'var(--primary)' }}>{chip.icon}</span>
              <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{chip.value}</span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{chip.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '0.25rem', width: 'fit-content' }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)', background: isActive ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'transparent', color: isActive ? 'white' : 'var(--text-muted)', boxShadow: isActive ? '0 3px 12px var(--primary-glow)' : 'none' }}>
              {tab.icon}{tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>

        {/* Stats */}
        {activeTab === 'stats' && (
          <div style={{ height: '100%', overflowY: 'auto', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14 }}>
            {stats.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.75rem', minHeight: 160 }}>
                <Users size={28} style={{ color: 'var(--primary)', opacity: 0.4 }} />
                <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Henüz kullanıcı verisi yok.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Kullanıcı', 'Yetki', 'Soru', 'Vaka', '%'].map(h => (
                      <th key={h} style={{ padding: '0.6rem 0.875rem', textAlign: 'left', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--primary)', background: 'rgba(225,29,72,0.05)', borderBottom: '1px solid rgba(225,29,72,0.12)', position: 'sticky', top: 0, zIndex: 5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.map((s, idx) => {
                    const rc = roleColor(s.role);
                    const tusRate = successRate(s.correctTus, s.totalTusSolved);
                    const caseRate = successRate(s.successfulCases, s.totalCasesSolved);
                    const avgRate = Math.round((tusRate + caseRate) / 2);
                    return (
                      <tr key={s.userId}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)', transition: 'background 0.15s ease' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(225,29,72,0.04)')}
                        onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)')}
                      >
                        <td style={{ padding: '0.55rem 0.875rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                            <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, color: 'white' }}>
                              {s.nickname.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-main)' }}>{s.nickname}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.55rem 0.875rem' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.2rem 0.55rem', borderRadius: 20, fontSize: '0.68rem', fontWeight: 800, background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}>
                            {s.role === 'SuperAdmin' ? '⚡ ' : s.role === 'Admin' ? '🛡 ' : '👤 '}{s.role}
                          </span>
                        </td>
                        <td style={{ padding: '0.55rem 0.875rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#10b981', fontWeight: 700, fontSize: '0.8rem' }}><CheckCircle size={12} />{s.correctTus}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#e11d48', fontWeight: 700, fontSize: '0.8rem' }}><XCircle size={12} />{s.incorrectTus}</span>
                            </div>
                            <div style={{ height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', width: 80 }}>
                              <div style={{ height: '100%', borderRadius: 99, width: `${tusRate}%`, background: tusRate >= 70 ? '#10b981' : tusRate >= 40 ? '#f59e0b' : '#e11d48' }} />
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.55rem 0.875rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#10b981', fontWeight: 700, fontSize: '0.8rem' }}><CheckCircle size={12} />{s.successfulCases}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#e11d48', fontWeight: 700, fontSize: '0.8rem' }}><XCircle size={12} />{s.failedCases}</span>
                            </div>
                            <div style={{ height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', width: 80 }}>
                              <div style={{ height: '100%', borderRadius: 99, width: `${caseRate}%`, background: caseRate >= 70 ? '#10b981' : caseRate >= 40 ? '#f59e0b' : '#e11d48' }} />
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.55rem 0.875rem' }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: `conic-gradient(${avgRate >= 70 ? '#10b981' : avgRate >= 40 ? '#f59e0b' : '#e11d48'} ${avgRate * 3.6}deg, rgba(255,255,255,0.07) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--glass-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ fontSize: '0.58rem', fontWeight: 800, color: 'var(--text-main)' }}>{avgRate}%</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Logs */}
        {activeTab === 'logs' && (
          <div style={{ height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {logs.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 160, gap: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)' }}>
                <Activity size={28} style={{ color: 'var(--primary)', opacity: 0.4 }} />
                <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Henüz log kaydı yok.</p>
              </div>
            ) : logs.map((l, idx) => (
              <div key={l.id}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '0.6rem 0.875rem', transition: 'all 0.2s ease', animation: `fadeSlideIn 0.25s ease ${idx * 0.03}s both` }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(225,29,72,0.05)'; el.style.borderColor = 'rgba(225,29,72,0.18)'; el.style.transform = 'translateX(3px)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.03)'; el.style.borderColor = 'rgba(255,255,255,0.07)'; el.style.transform = 'translateX(0)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Activity size={13} style={{ color: 'var(--primary)' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 2 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-main)' }}>{l.userEmail}</span>
                      <span style={{ padding: '0.1rem 0.45rem', borderRadius: 99, fontSize: '0.63rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' as const, background: 'rgba(225,29,72,0.1)', color: 'var(--primary)', border: '1px solid rgba(225,29,72,0.18)' }}>{l.action}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{l.details}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, background: 'rgba(255,255,255,0.05)', borderRadius: 7, padding: '0.3rem 0.6rem', flexShrink: 0, whiteSpace: 'nowrap' as const }}>
                  <Clock size={10} />
                  {new Date(l.createdAt).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Admin */}
        {activeTab === 'create' && (
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '0.5rem' }}>
            <div style={{ width: '100%', maxWidth: 400, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '1.5rem', backdropFilter: 'blur(16px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px var(--primary-glow)' }}>
                  <UserPlus style={{ color: 'white', width: 16, height: 16 }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, var(--text-main), var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Yönetici Ekle</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>Sisteme yeni admin tanımlayın.</p>
                </div>
              </div>
              <form onSubmit={handleCreateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {[
                  { label: 'E-Posta', type: 'email', value: newAdminEmail, onChange: setNewAdminEmail, placeholder: 'admin@medsim.com' },
                  { label: 'Takma Ad', type: 'text', value: newAdminNickname, onChange: setNewAdminNickname, placeholder: 'Admin Ayşe' },
                  { label: 'Şifre', type: 'password', value: newAdminPassword, onChange: setNewAdminPassword, placeholder: 'Güçlü şifre' },
                ].map(field => (
                  <div key={field.label}>
                    <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>{field.label}</label>
                    <input type={field.type} required value={field.value} onChange={e => field.onChange(e.target.value)} placeholder={field.placeholder}
                      style={{ width: '100%', padding: '0.6rem 0.875rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'var(--text-main)', fontSize: '0.82rem', fontWeight: 500, outline: 'none', transition: 'all 0.25s ease', boxSizing: 'border-box' }}
                      onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.background = 'rgba(225,29,72,0.05)'; e.target.style.boxShadow = '0 0 0 2px var(--primary-glow)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                ))}
                <button type="submit" disabled={createLoading} style={{ width: '100%', padding: '0.7rem', background: createLoading ? 'rgba(225,29,72,0.4)' : 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', border: 'none', borderRadius: 10, fontSize: '0.85rem', fontWeight: 800, cursor: createLoading ? 'not-allowed' : 'pointer', boxShadow: createLoading ? 'none' : '0 4px 16px var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', transition: 'all 0.25s ease' }}>
                  {createLoading ? (
                    <><div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Oluşturuluyor...</>
                  ) : (
                    <><Award size={14} /> Yönetici Oluştur</>
                  )}
                </button>
                {createMessage && (() => {
                  const isSuccess = createMessage.startsWith('success:');
                  const msg = createMessage.replace(/^(success|error):/, '');
                  return (
                    <div style={{ padding: '0.6rem 0.875rem', borderRadius: 9, textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, background: isSuccess ? 'rgba(16,185,129,0.1)' : 'rgba(225,29,72,0.1)', color: isSuccess ? '#10b981' : 'var(--primary)', border: `1px solid ${isSuccess ? 'rgba(16,185,129,0.22)' : 'rgba(225,29,72,0.22)'}` }}>
                      {isSuccess ? '✅ ' : '❌ '}{msg}
                    </div>
                  );
                })()}
              </form>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
