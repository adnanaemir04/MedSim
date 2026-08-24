import React, { useEffect, useState } from 'react';
import { ShieldAlert, Users, Activity, UserPlus, CheckCircle, XCircle, BarChart3, Clock, ShieldCheck, PlusCircle } from 'lucide-react';

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
  
  // Create Admin Form
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminNickname, setNewAdminNickname] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [createMessage, setCreateMessage] = useState('');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5211/api';

  useEffect(() => {
    fetchStats();
    fetchLogs();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/Admin/users-stats`, {
        headers: { 'User-Email': userEmail }
      });
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
      const res = await fetch(`${API_BASE_URL}/Admin/audit-logs`, {
        headers: { 'User-Email': userEmail }
      });
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
    try {
      const res = await fetch(`${API_BASE_URL}/Admin/create-admin`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Email': userEmail
        },
        body: JSON.stringify({
          email: newAdminEmail,
          nickname: newAdminNickname,
          password: newAdminPassword
        })
      });
      
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setCreateMessage('Yönetici başarıyla oluşturuldu.');
        setNewAdminEmail('');
        setNewAdminNickname('');
        setNewAdminPassword('');
        fetchStats(); // refresh stats
      } else {
        setCreateMessage(data?.message || 'Bir hata oluştu.');
      }
    } catch (err) {
      console.error(err);
      setCreateMessage('Sunucuya bağlanılamadı.');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-indigo-400">
      <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-semibold text-lg">Veriler Yükleniyor...</p>
    </div>
  );

  // Summary calculations
  const totalUsers = stats.length;
  const totalCases = stats.reduce((acc, s) => acc + s.totalCasesSolved, 0);
  const totalTus = stats.reduce((acc, s) => acc + s.totalTusSolved, 0);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto text-slate-100">
      
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-fuchsia-500 rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.4)]">
          <ShieldCheck className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Sistem Yönetimi
          </h1>
          <p className="text-slate-400 font-medium mt-1">Platformun tüm verilerini, kullanıcılarını ve güvenliğini tek bir ekrandan yönetin.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-xl flex items-center justify-between hover:bg-white/10 transition-colors">
          <div>
            <p className="text-slate-400 font-semibold mb-1">Toplam Kullanıcı</p>
            <h3 className="text-4xl font-black text-white">{totalUsers}</h3>
          </div>
          <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-xl flex items-center justify-between hover:bg-white/10 transition-colors">
          <div>
            <p className="text-slate-400 font-semibold mb-1">Çözülen Vakalar</p>
            <h3 className="text-4xl font-black text-white">{totalCases}</h3>
          </div>
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Activity className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-xl flex items-center justify-between hover:bg-white/10 transition-colors">
          <div>
            <p className="text-slate-400 font-semibold mb-1">Çözülen TUS Sorusu</p>
            <h3 className="text-4xl font-black text-white">{totalTus}</h3>
          </div>
          <div className="w-14 h-14 rounded-full bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-400">
            <BarChart3 className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-black/20 p-2 rounded-2xl backdrop-blur-sm border border-white/5">
        <button 
          onClick={() => setActiveTab('stats')}
          className={`flex-1 flex flex-col items-center justify-center gap-2 px-4 py-4 rounded-xl transition-all duration-300 ${activeTab === 'stats' ? 'bg-indigo-600 shadow-lg shadow-indigo-500/30' : 'hover:bg-white/5'}`}
        >
          <Users className={`w-6 h-6 ${activeTab === 'stats' ? 'text-white' : 'text-slate-400'}`} />
          <div className="text-center">
            <span className={`block font-bold ${activeTab === 'stats' ? 'text-white' : 'text-slate-300'}`}>İstatistikler</span>
            <span className={`text-xs ${activeTab === 'stats' ? 'text-indigo-200' : 'text-slate-500'}`}>Tüm kullanıcı başarı oranları</span>
          </div>
        </button>

        <button 
          onClick={() => setActiveTab('logs')}
          className={`flex-1 flex flex-col items-center justify-center gap-2 px-4 py-4 rounded-xl transition-all duration-300 ${activeTab === 'logs' ? 'bg-fuchsia-600 shadow-lg shadow-fuchsia-500/30' : 'hover:bg-white/5'}`}
        >
          <Clock className={`w-6 h-6 ${activeTab === 'logs' ? 'text-white' : 'text-slate-400'}`} />
          <div className="text-center">
            <span className={`block font-bold ${activeTab === 'logs' ? 'text-white' : 'text-slate-300'}`}>Aktivite Logları</span>
            <span className={`text-xs ${activeTab === 'logs' ? 'text-fuchsia-200' : 'text-slate-500'}`}>Sistemdeki tüm eylemler</span>
          </div>
        </button>

        <button 
          onClick={() => setActiveTab('create')}
          className={`flex-1 flex flex-col items-center justify-center gap-2 px-4 py-4 rounded-xl transition-all duration-300 ${activeTab === 'create' ? 'bg-emerald-600 shadow-lg shadow-emerald-500/30' : 'hover:bg-white/5'}`}
        >
          <UserPlus className={`w-6 h-6 ${activeTab === 'create' ? 'text-white' : 'text-slate-400'}`} />
          <div className="text-center">
            <span className={`block font-bold ${activeTab === 'create' ? 'text-white' : 'text-slate-300'}`}>Yönetici Ekle</span>
            <span className={`text-xs ${activeTab === 'create' ? 'text-emerald-200' : 'text-slate-500'}`}>Yeni sistem yetkilisi oluştur</span>
          </div>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* STATS TAB */}
        {activeTab === 'stats' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="p-5 font-semibold text-slate-300">Kullanıcı</th>
                  <th className="p-5 font-semibold text-slate-300 text-center">TUS Başarısı</th>
                  <th className="p-5 font-semibold text-slate-300 text-center">Vaka Başarısı</th>
                  <th className="p-5 font-semibold text-slate-300 text-right">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.map(s => {
                  const tusPercent = s.totalTusSolved > 0 ? Math.round((s.correctTus / s.totalTusSolved) * 100) : 0;
                  const casePercent = s.totalCasesSolved > 0 ? Math.round((s.successfulCases / s.totalCasesSolved) * 100) : 0;
                  
                  return (
                    <tr key={s.userId} className="hover:bg-white/5 transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-lg text-white shadow-lg">
                            {s.nickname.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white text-lg">{s.nickname}</div>
                            <div className="text-sm text-slate-400">{s.email}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-5 align-middle">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center justify-between w-full max-w-[200px] mb-1">
                            <span className="text-xs font-semibold text-emerald-400">{s.correctTus} D</span>
                            <span className="text-xs font-semibold text-rose-400">{s.incorrectTus} Y</span>
                          </div>
                          <div className="w-full max-w-[200px] bg-slate-800 rounded-full h-2.5 overflow-hidden flex">
                            <div className="bg-emerald-500 h-full" style={{ width: `${tusPercent}%` }}></div>
                            <div className="bg-rose-500 h-full" style={{ width: `${100 - tusPercent}%` }}></div>
                          </div>
                          <span className="text-xs text-slate-500 mt-1">Toplam: {s.totalTusSolved}</span>
                        </div>
                      </td>
                      
                      <td className="p-5 align-middle">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center justify-between w-full max-w-[200px] mb-1">
                            <span className="text-xs font-semibold text-emerald-400">{s.successfulCases} B</span>
                            <span className="text-xs font-semibold text-rose-400">{s.failedCases} H</span>
                          </div>
                          <div className="w-full max-w-[200px] bg-slate-800 rounded-full h-2.5 overflow-hidden flex">
                            <div className="bg-emerald-500 h-full" style={{ width: `${casePercent}%` }}></div>
                            <div className="bg-rose-500 h-full" style={{ width: `${100 - casePercent}%` }}></div>
                          </div>
                          <span className="text-xs text-slate-500 mt-1">Toplam: {s.totalCasesSolved}</span>
                        </div>
                      </td>
                      
                      <td className="p-5 text-right">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${s.role === 'SuperAdmin' ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30' : s.role === 'Admin' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' : 'bg-slate-500/10 text-slate-400 border-slate-500/30'}`}>
                          {s.role === 'SuperAdmin' && <ShieldAlert className="w-3.5 h-3.5" />}
                          {s.role}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* LOGS TAB */}
        {activeTab === 'logs' && (
          <div className="p-6">
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              {logs.map((l, idx) => (
                <div key={l.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Timeline Icon */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-900 bg-fuchsia-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <Activity className="w-4 h-4" />
                  </div>
                  
                  {/* Content Box */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 shadow-lg group-hover:bg-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white flex items-center gap-2">
                        {l.userEmail}
                      </span>
                      <span className="text-xs font-medium text-fuchsia-400 bg-fuchsia-400/10 px-2 py-1 rounded-full">
                        {l.action}
                      </span>
                    </div>
                    <div className="text-slate-300 font-mono text-sm mb-3 bg-black/30 p-2 rounded-lg border border-white/5">
                      {l.details}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(l.createdAt).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                </div>
              ))}

              {logs.length === 0 && (
                <div className="text-center text-slate-400 py-12">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Henüz sistemde kaydedilmiş bir log bulunmuyor.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CREATE TAB */}
        {activeTab === 'create' && (
          <div className="p-8 md:p-12">
            <div className="max-w-xl mx-auto bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
              {/* Decorative Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/3"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -z-10 translate-y-1/3 -translate-x-1/3"></div>
              
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                  <PlusCircle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-white">Yeni Yönetici Hesabı Oluştur</h2>
                <p className="text-slate-400 text-sm mt-2">Sisteme tam yetkili (Admin) bir hesap ekliyorsunuz.</p>
              </div>

              <form onSubmit={handleCreateAdmin} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-300 ml-1">E-posta Adresi</label>
                  <input 
                    type="email" 
                    required 
                    value={newAdminEmail}
                    onChange={e => setNewAdminEmail(e.target.value)}
                    placeholder="admin@medsim.com"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" 
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-300 ml-1">Kullanıcı Adı (Nickname)</label>
                  <input 
                    type="text" 
                    required 
                    value={newAdminNickname}
                    onChange={e => setNewAdminNickname(e.target.value)}
                    placeholder="Dr. Admin"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" 
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-300 ml-1">Güvenli Şifre</label>
                  <input 
                    type="password" 
                    required 
                    value={newAdminPassword}
                    onChange={e => setNewAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" 
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl px-4 py-3 font-bold text-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:-translate-y-0.5"
                >
                  Hesabı Oluştur
                </button>

                {createMessage && (
                  <div className={`mt-4 p-4 rounded-xl border font-medium text-center ${
                    createMessage.includes('başarıyla') 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}>
                    {createMessage}
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
