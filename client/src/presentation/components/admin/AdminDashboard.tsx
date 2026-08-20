import React, { useEffect, useState } from 'react';
import { ShieldAlert, Users, Activity, UserPlus, CheckCircle, XCircle } from 'lucide-react';

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

  if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <ShieldAlert className="w-8 h-8 text-indigo-500" />
        <h1 className="text-3xl font-bold">Admin Paneli</h1>
      </div>

      <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
        <button 
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'stats' ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-white/5'}`}
        >
          <Users className="w-5 h-5" /> Kullanıcı İstatistikleri
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'logs' ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-white/5'}`}
        >
          <Activity className="w-5 h-5" /> Aktivite Logları
        </button>
        <button 
          onClick={() => setActiveTab('create')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'create' ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-white/5'}`}
        >
          <UserPlus className="w-5 h-5" /> Yönetici Ekle
        </button>
      </div>

      {activeTab === 'stats' && (
        <div className="bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5">
              <tr>
                <th className="p-4 font-semibold text-slate-300">Kullanıcı</th>
                <th className="p-4 font-semibold text-slate-300">Rol</th>
                <th className="p-4 font-semibold text-slate-300 text-center">TUS (D/Y/T)</th>
                <th className="p-4 font-semibold text-slate-300 text-center">Vaka (B/B/T)</th>
              </tr>
            </thead>
            <tbody>
              {stats.map(s => (
                <tr key={s.userId} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-white">{s.nickname}</div>
                    <div className="text-sm text-slate-400">{s.email}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${s.role === 'SuperAdmin' ? 'bg-fuchsia-500/20 text-fuchsia-300' : s.role === 'Admin' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-500/20 text-slate-300'}`}>
                      {s.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-emerald-400 flex items-center gap-1" title="Doğru"><CheckCircle className="w-4 h-4"/>{s.correctTus}</span>
                      <span className="text-rose-400 flex items-center gap-1" title="Yanlış"><XCircle className="w-4 h-4"/>{s.incorrectTus}</span>
                      <span className="text-slate-300 font-bold ml-2">Total: {s.totalTusSolved}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-emerald-400 flex items-center gap-1" title="Başarılı"><CheckCircle className="w-4 h-4"/>{s.successfulCases}</span>
                      <span className="text-rose-400 flex items-center gap-1" title="Başarısız"><XCircle className="w-4 h-4"/>{s.failedCases}</span>
                      <span className="text-slate-300 font-bold ml-2">Total: {s.totalCasesSolved}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-4">
          {logs.map(l => (
            <div key={l.id} className="bg-slate-900/50 p-4 rounded-xl border border-white/10 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-white">{l.userEmail}</span>
                  <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-300 font-medium">{l.action}</span>
                </div>
                <div className="text-sm text-slate-400 font-mono">{l.details}</div>
              </div>
              <div className="text-sm text-slate-500 shrink-0">
                {new Date(l.createdAt).toLocaleString('tr-TR')}
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-center text-slate-400 py-8">Henüz log kaydı yok.</div>
          )}
        </div>
      )}

      {activeTab === 'create' && (
        <div className="max-w-md bg-slate-900/50 p-6 rounded-xl border border-white/10">
          <h2 className="text-xl font-semibold mb-6">Yeni Yönetici Hesabı Oluştur</h2>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input 
                type="email" 
                required 
                value={newAdminEmail}
                onChange={e => setNewAdminEmail(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nickname</label>
              <input 
                type="text" 
                required 
                value={newAdminNickname}
                onChange={e => setNewAdminNickname(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Şifre</label>
              <input 
                type="password" 
                required 
                value={newAdminPassword}
                onChange={e => setNewAdminPassword(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors" 
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 font-medium transition-colors">
              Oluştur
            </button>
            {createMessage && (
              <div className="mt-4 p-3 rounded-lg bg-white/5 text-sm text-center">
                {createMessage}
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
