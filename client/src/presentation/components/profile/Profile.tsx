'use client';

import { useState, useRef, useEffect } from 'react';
import { User } from '../../../domain/entities/User';
import { Camera, Settings, LogOut, Award, Target, Activity, Users, Star, Flame, Zap, Clock, Copy, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { getUserRank } from '../../../utils/rankSystem';
import { getFriendsList, getTusUserStats, addFriend, updateUserProfile, deleteUserAccount, getSolvedCases } from '../../../infrastructure/api/simulationApi';
import { motion, AnimatePresence } from 'framer-motion';
import { soundManager } from '../../../utils/soundManager';

interface ProfileProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
  onLogout: () => void;
}

const AVATAR_OPTIONS = ['👨‍⚕️', '👩‍⚕️', '🧠', '🫀', '💊', '🔬', '🏥', '🚑'];

export default function Profile({ user, onUpdate, onLogout }: ProfileProps) {
  const [nickname, setNickname] = useState(user.nickname);
  const [avatar, setAvatar] = useState(user.avatar || '👨‍⚕️');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [friends, setFriends] = useState<any[]>([]);
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [friendMsg, setFriendMsg] = useState('');
  const [copied, setCopied] = useState(false);
  
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [tusStats, setTusStats] = useState({ totalSolved: 0, correctCount: 0, wrongCount: 0, successRate: 0 });

  const fetchFriends = async () => {
    try {
      const data = await getFriendsList(user.email);
      setFriends(data);
    } catch (err) {
      console.error("Friends fetch error:", err);
    }
  };

  const fetchTusStats = async () => {
    try {
      const data = await getTusUserStats(user.email);
      setTusStats(data);
    } catch (err) {
      console.error("TUS stats fetch error:", err);
    }
  };

  const fetchActivities = async () => {
    try {
      const data = await getSolvedCases(user.email, 1, 5); // fetch top 5 recent
      setRecentActivities(data.items || []);
    } catch (err) {
      console.error("Activities fetch error:", err);
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchTusStats();
    fetchActivities();
  }, [user.email]);

  const handleCopyCode = () => {
    if (user.friendCode) {
      navigator.clipboard.writeText(user.friendCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddFriend = async () => {
    if (!friendCodeInput.trim()) return;
    try {
      const data = await addFriend(user.email, friendCodeInput);
      setFriendMsg("Arkadaş eklendi!");
      setFriendCodeInput('');
      fetchFriends();
    } catch (err: any) {
      const message = err.response?.data?.message || "Hata oluştu.";
      setFriendMsg(message);
    }
    setTimeout(() => setFriendMsg(''), 3000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');
    
    try {
      const updatedUser = await updateUserProfile(user.email, nickname, avatar);
      onUpdate(updatedUser);
      setMessage('Profil başarıyla güncellendi!');
    } catch (err: any) {
      const errorMsg = err.response?.data || err.message;
      setMessage('Hata: ' + errorMsg);
    } finally {
      setIsSaving(false);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setAvatar(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Hesabınızı kalıcı olarak silmek istediğinize emin misiniz?')) return;
    
    try {
      await deleteUserAccount(user.email);
      onLogout();
    } catch (err) {
      alert('Hesap silinirken hata oluştu.');
    }
  };

  const rank = getUserRank(user.points);

  const containerStyle = {
    padding: '2rem', maxWidth: '1250px', margin: '0.5rem auto',
    background: isLight 
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1))'
      : 'var(--bg-panel)',
    backdropFilter: isLight ? 'blur(40px)' : 'none',
    WebkitBackdropFilter: isLight ? 'blur(40px)' : 'none',
    borderRadius: isLight ? '40px' : '32px',
    border: isLight ? '1px solid rgba(255, 255, 255, 0.6)' : '1px solid var(--glass-border)',
    boxShadow: isLight ? '0 30px 60px rgba(0, 50, 150, 0.08), inset 0 0 0 1px rgba(255,255,255,0.5)' : 'var(--shadow-lg)'
  };

  const panelStyle = {
    background: isLight ? 'rgba(255,255,255,0.7)' : 'var(--bg-main)',
    padding: '1.5rem',
    borderRadius: '24px',
    border: isLight ? '1px solid rgba(255,255,255,0.9)' : '1px solid var(--glass-border)',
    boxShadow: isLight ? '0 10px 30px rgba(0,0,0,0.03)' : 'inset 0 0 0 1px rgba(255,255,255,0.02)'
  };

  const inputStyle = isLight ? {
    background: 'rgba(255,255,255,0.8)',
    border: '1px solid rgba(0,0,0,0.1)',
    color: '#1e293b',
    boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.02)',
    padding: '0.6rem 0.8rem', borderRadius: '10px', width: '100%', outline: 'none', fontSize: '0.9rem'
  } : {
    background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'white', padding: '0.6rem 0.8rem', borderRadius: '10px', width: '100%', outline: 'none', fontSize: '0.9rem'
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  // Mock Achievements
  const achievements = [
    { icon: <Flame color="#f97316" size={20}/>, title: "İlk Kan", desc: "İlk vakanı çözdün." },
    { icon: <Target color="#ef4444" size={20}/>, title: "TUS Canavarı", desc: "TUS'ta %80 başarı." },
    { icon: <Zap color="#eab308" size={20}/>, title: "Seri Katil", desc: "Arka arkaya 5 doğru tanı." },
    { icon: <Star color="#8b5cf6" size={20}/>, title: "Mükemmeliyet", desc: "Tüm TUS soruları çözüldü." },
    { icon: <Award color="#10b981" size={20}/>, title: "Uzman Hekim", desc: "10.000 puana ulaştın." },
    { icon: <Activity color="#0ea5e9" size={20}/>, title: "Hayat Kurtaran", desc: "Zor seviye vaka tamamlandı." },
  ];

  // Mock Recent Activities are now fetched dynamically!
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('tr-TR') + ' ' + d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.main 
      className={isLight ? "" : "glass-panel"} 
      style={containerStyle}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.6rem', background: 'rgba(79, 70, 229, 0.1)', borderRadius: '14px', color: 'var(--primary)' }}>
          <Settings size={22} />
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: isLight ? '#1e293b' : 'white', letterSpacing: '-0.5px', margin: 0 }}>
          Kullanıcı Paneli
        </h2>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Sol Kolon: Kimlik ve Ayarlar */}
        <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ ...panelStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            
            <motion.div 
              whileHover="hover"
              onMouseEnter={() => soundManager.playHover()}
              onClick={() => { soundManager.playClick(); fileInputRef.current?.click(); }}
              style={{ 
                fontSize: avatar.startsWith('data:image') ? '0' : '3.5rem', 
                background: avatar.startsWith('data:image') ? `url(${avatar}) center/cover` : 'var(--bg-panel)', 
                width: '120px', height: '120px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                borderRadius: '50%', border: '3px solid var(--border-light)', 
                boxShadow: 'var(--shadow-md)', position: 'relative', cursor: 'pointer',
                marginBottom: '1rem',
                overflow: 'hidden'
              }}
            >
              {!avatar.startsWith('data:image') && avatar}
              <motion.div 
                variants={{
                  hover: { opacity: 1, backdropFilter: 'blur(4px)' },
                  initial: { opacity: 0, backdropFilter: 'blur(0px)' }
                }}
                initial="initial"
                style={{ 
                  position: 'absolute', inset: 0, 
                  background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', color: 'white', gap: '0.3rem',
                  transition: 'all 0.2s ease'
                }}>
                <Camera size={24} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Fotoğraf Ekle</span>
              </motion.div>
            </motion.div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.4rem 0', color: isLight ? '#0f172a' : 'white' }}>{nickname}</h3>
            
            {/* Arkadaşlık ID Alanı Her Zaman Görünür */}
            <div 
              onClick={handleCopyCode}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.6rem', 
                marginBottom: '1rem', cursor: 'pointer',
                padding: '0.6rem 1rem', background: isLight ? 'rgba(79, 70, 229, 0.08)' : 'rgba(79, 70, 229, 0.15)',
                borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600, color: isLight ? '#4f46e5' : '#818cf8',
                border: isLight ? '1px solid rgba(79, 70, 229, 0.2)' : '1px solid rgba(79, 70, 229, 0.3)',
                transition: 'all 0.2s', boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
              }}
              title="Arkadaş Ekleme ID'sini Kopyala"
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 15px rgba(79, 70, 229, 0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.02)'; }}
            >
              <span>Arkadaşlık ID: <strong style={{ letterSpacing: '0.05em' }}>{user.friendCode || "Bulunamadı"}</strong></span>
              {copied ? <CheckCircle2 size={16} color="#10b981" /> : <Copy size={16} />}
            </div>
            
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.4rem 1rem', background: rank.bg,
              border: isLight ? 'none' : `1px solid ${rank.border}`,
              borderRadius: '16px', color: rank.color, fontWeight: 800,
              boxShadow: !isLight ? `0 0 15px ${rank.bg}` : 'none'
            }}>
              <span style={{ fontSize: '1rem' }}>{rank.icon}</span>
              <span style={{ fontSize: '0.85rem' }}>{rank.title}</span>
            </div>
            
            <div style={{ width: '100%', height: '1px', background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)', margin: '1.5rem 0' }}></div>
            
            <div style={{ width: '100%', textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: isLight ? '#475569' : 'var(--text-muted)', fontWeight: 600 }}>Görünür İsim (Nickname)</label>
              <input 
                type="text" 
                value={nickname} 
                onChange={e => setNickname(e.target.value)} 
                style={inputStyle}
              />
              
              <label style={{ display: 'block', marginTop: '1rem', marginBottom: '0.4rem', fontSize: '0.8rem', color: isLight ? '#475569' : 'var(--text-muted)', fontWeight: 600 }}>E-posta Adresi</label>
              <input type="text" value={user.email} disabled style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} />

              <label style={{ display: 'block', marginTop: '1rem', marginBottom: '0.4rem', fontSize: '0.8rem', color: isLight ? '#475569' : 'var(--text-muted)', fontWeight: 600 }}>Hızlı Avatar Seçimi</label>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {AVATAR_OPTIONS.map(opt => (
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    key={opt}
                    onMouseEnter={() => soundManager.playHover()}
                    onClick={() => { soundManager.playClick(); setAvatar(opt); }}
                    style={{
                      fontSize: '1.2rem', background: avatar === opt ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
                      border: avatar === opt ? '2px solid var(--primary)' : '2px solid transparent',
                      padding: '0.3rem', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {opt}
                  </motion.button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem' }}>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={() => soundManager.playHover()}
                  className="btn-primary" 
                  onClick={() => { soundManager.playClick(); handleSave(); }} 
                  disabled={isSaving}
                  style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', fontWeight: 800, fontSize: '0.9rem' }}
                >
                  {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={() => soundManager.playHover()}
                  onClick={() => { soundManager.playClick(); handleDeleteAccount(); }}
                  style={{ padding: '0.8rem', borderRadius: '10px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <LogOut size={18} />
                </motion.button>
              </div>
              
              <AnimatePresence>
                {message && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ marginTop: '1rem', padding: '0.6rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px', textAlign: 'center', fontWeight: 700, fontSize: '0.85rem' }}
                  >
                    {message}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Sağ Kolon: İstatistikler, Başarımlar, Aktiviteler ve Arkadaşlar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Stats Grid */}
          <motion.div variants={containerVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <motion.div variants={itemVariants} whileHover={{ y: -3 }} style={{ ...panelStyle, display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.2rem 1.5rem' }}>
              <div style={{ padding: '0.8rem', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '14px', color: '#0ea5e9' }}><Award size={24} /></div>
              <div>
                <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Klinik Puan</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: isLight ? '#0f172a' : 'white', letterSpacing: '-0.5px' }}>{user.points}</div>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} whileHover={{ y: -3 }} style={{ ...panelStyle, display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.2rem 1.5rem' }}>
              <div style={{ padding: '0.8rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '14px', color: '#10b981' }}><Activity size={24} /></div>
              <div>
                <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Çözülen Vaka</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: isLight ? '#0f172a' : 'white', letterSpacing: '-0.5px' }}>{user.solvedCases?.length || 0}</div>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} whileHover={{ y: -3 }} style={{ ...panelStyle, display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.2rem 1.5rem' }}>
              <div style={{ padding: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '14px', color: '#ef4444' }}><Target size={24} /></div>
              <div>
                <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>TUS Neti (D/Y)</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: isLight ? '#0f172a' : 'white', letterSpacing: '-0.5px', display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                  <span style={{ color: '#10b981' }}>{tusStats.correctCount}</span>
                  <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>/</span>
                  <span style={{ color: '#ef4444', fontSize: '1.4rem' }}>{tusStats.wrongCount}</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} whileHover={{ y: -3 }} style={{ ...panelStyle, display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.2rem 1.5rem' }}>
              <div style={{ padding: '0.8rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '14px', color: '#f59e0b' }}><Star size={24} /></div>
              <div>
                <span style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>TUS Başarısı</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: isLight ? '#0f172a' : 'white', letterSpacing: '-0.5px' }}>%{tusStats.successRate}</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Başarımlar Section */}
          <motion.div variants={itemVariants} style={panelStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
              <Award size={20} color={isLight ? '#f59e0b' : '#fbbf24'} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: isLight ? '#1e293b' : 'white' }}>Başarımlar</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem' }}>
              {achievements.map((ach, i) => (
                <motion.div key={i} whileHover={{ scale: 1.05 }} style={{ background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '14px', textAlign: 'center', border: isLight ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'inline-block', padding: '0.6rem', background: isLight ? 'white' : 'rgba(255,255,255,0.1)', borderRadius: '50%', marginBottom: '0.4rem', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    {ach.icon}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: isLight ? '#334155' : 'white', marginBottom: '0.2rem' }}>{ach.title}</div>
                  <div style={{ fontSize: '0.75rem', color: isLight ? '#64748b' : '#94a3b8', lineHeight: '1.3' }}>{ach.desc}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Aktiviteler Section */}
          <motion.div variants={itemVariants} style={panelStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.2rem' }}>
              <Clock size={20} color={isLight ? '#0ea5e9' : '#38bdf8'} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: isLight ? '#1e293b' : 'white' }}>Son Aktiviteler</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {recentActivities.length === 0 && (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Henüz aktivite bulunmuyor.</div>
              )}
              {recentActivities.map((act, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', background: isLight ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.03)', borderRadius: '12px', border: isLight ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: act.earnedPoints > 0 ? '#10b981' : '#3b82f6' }}></div>
                  <div style={{ flex: 1, fontSize: '0.85rem', color: isLight ? '#334155' : 'var(--text-main)', fontWeight: 500 }}>
                    "{act.caseTitle}" ({act.departmentName}) vakası {act.isSolved ? 'çözüldü' : 'denendi'}.
                  </div>
                  {act.earnedPoints > 0 && <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981' }}>+{act.earnedPoints}</div>}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(act.solvedAt)}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Arkadaşlarım Section */}
          <motion.div variants={itemVariants} style={panelStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Users size={20} color={isLight ? '#3b82f6' : '#60a5fa'} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: isLight ? '#1e293b' : 'white' }}>Arkadaşlarım</h3>
              </div>
              <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.8rem' }}>
                {friends.length} Arkadaş
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.5rem' }}>
              <input 
                type="text" 
                placeholder="Arkadaşının ID'sini (Friend Code) yaz..." 
                value={friendCodeInput}
                onChange={e => setFriendCodeInput(e.target.value)}
                style={inputStyle}
              />
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={() => soundManager.playHover()}
                onClick={() => { soundManager.playClick(); handleAddFriend(); }}
                style={{ padding: '0 1.5rem', borderRadius: '10px', background: 'var(--primary)', color: 'white', fontWeight: 800, fontSize: '0.9rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)' }}
              >
                Ekle
              </motion.button>
            </div>
            
            <AnimatePresence>
              {friendMsg && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginBottom: '1rem', color: friendMsg.includes('eklendi') ? '#10b981' : '#ef4444', fontWeight: 700, background: friendMsg.includes('eklendi') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', padding: '0.6rem 0.8rem', borderRadius: '10px', fontSize: '0.85rem' }}>
                  {friendMsg}
                </motion.div>
              )}
            </AnimatePresence>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem' }}>
              {friends.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Henüz kimseyi eklemediniz.</div>
              )}
              {friends.map((friend, idx) => {
                const friendRank = getUserRank(friend.points);
                return (
                  <motion.div key={idx} whileHover={{ scale: 1.03 }} style={{ background: isLight ? 'rgba(241,245,249,0.8)' : 'rgba(255,255,255,0.03)', padding: '0.8rem 1rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '0.8rem', border: isLight ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: friend.avatar?.startsWith('data:image') ? '0' : '1.5rem', background: friend.avatar?.startsWith('data:image') ? `url(${friend.avatar}) center/cover` : 'rgba(255,255,255,0.1)', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                      {!friend.avatar?.startsWith('data:image') && friend.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, color: isLight ? '#0f172a' : 'white', fontSize: '0.95rem' }}>{friend.nickname}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{friend.points} Puan</span>
                        <span style={{ fontSize: '0.65rem', background: friendRank.bg, color: friendRank.color, padding: '0.15rem 0.4rem', borderRadius: '6px', fontWeight: 800 }}>
                          {friendRank.icon} {friendRank.title}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

        </div>
      </div>
      
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileUpload} />
    </motion.main>
  );
}
