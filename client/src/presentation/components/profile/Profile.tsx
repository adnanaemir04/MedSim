'use client';

import { useState, useRef } from 'react';
import { User } from '../../../../domain/entities/User';
import { Camera } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ProfileProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
  onLogout: () => void;
}

const AVATAR_OPTIONS = ['👨‍⚕️', '👩‍⚕️', '🧠', '🫀', '💊', '🔬'];

export default function Profile({ user, onUpdate, onLogout }: ProfileProps) {
  const [nickname, setNickname] = useState(user.nickname);
  const [avatar, setAvatar] = useState(user.avatar || '👨‍⚕️');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');
    
    try {
      const res = await fetch('http://localhost:5211/api/Auth/updateProfile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, nickname, avatar })
      });
      
      if (!res.ok) {
        throw new Error(await res.text());
      }
      
      const updatedUser = await res.json();
      onUpdate(updatedUser);
      setMessage('Profil başarıyla güncellendi!');
    } catch (err: any) {
      setMessage('Hata: ' + err.message);
    } finally {
      setIsSaving(false);
    }
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
      const res = await fetch(`http://localhost:5211/api/Auth/deleteAccount/${user.email}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        onLogout();
      }
    } catch (err) {
      alert('Hesap silinirken hata oluştu.');
    }
  };

  const containerStyle = {
    padding: '3rem', maxWidth: '850px', margin: isLight ? '2rem auto' : '0 auto',
    background: isLight 
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1))'
      : 'var(--bg-panel)',
    backdropFilter: isLight ? 'blur(40px)' : 'none',
    WebkitBackdropFilter: isLight ? 'blur(40px)' : 'none',
    borderRadius: isLight ? '32px' : 'var(--radius-lg)',
    border: isLight ? '1px solid rgba(255, 255, 255, 0.6)' : '1px solid var(--glass-border)',
    boxShadow: isLight ? '0 30px 60px rgba(0, 50, 150, 0.08), inset 0 0 0 1px rgba(255,255,255,0.5)' : 'var(--shadow-lg)'
  };

  const statBoxStyle = {
    flex: 1, 
    background: isLight ? 'rgba(255,255,255,0.7)' : 'var(--bg-main)', 
    padding: '1.5rem', 
    borderRadius: '20px',
    border: isLight ? '1px solid rgba(255,255,255,0.9)' : 'none',
    boxShadow: isLight ? '0 10px 25px rgba(0,0,0,0.03)' : 'none'
  };

  const labelStyle = {
    display: 'block', 
    marginBottom: '0.6rem', 
    fontSize: '0.9rem', 
    color: isLight ? '#475569' : 'var(--text-muted)', 
    fontWeight: 600
  };

  const inputStyle = isLight ? {
    background: 'rgba(255,255,255,0.8)',
    border: '1px solid rgba(0,0,0,0.1)',
    color: '#1e293b',
    boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.02)'
  } : {};

  return (
    <main className={isLight ? "" : "glass-panel"} style={containerStyle}>
      <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2.5rem', color: isLight ? '#1e293b' : 'white', letterSpacing: '-0.5px' }}>
        Profil Bilgileri
      </h2>
      
      <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
        
        {/* Avatar Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div 
            onClick={() => fileInputRef.current?.click()}
            style={{ 
              fontSize: avatar.startsWith('data:image') ? '0' : '3.5rem', 
              background: avatar.startsWith('data:image') ? `url(${avatar}) center/cover` : 'var(--bg-main)', 
              width: '140px', height: '140px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              borderRadius: '50%', border: '1px solid var(--border-light)', 
              boxShadow: 'var(--shadow-sm)', position: 'relative', cursor: 'pointer'
            }}
          >
            {!avatar.startsWith('data:image') && avatar}
            
            <div style={{ 
              position: 'absolute', bottom: 0, right: 0, 
              background: 'var(--bg-panel)', padding: '0.5rem', 
              borderRadius: '50%', border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <Camera size={18} color="var(--text-muted)" />
            </div>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fotoğraf Değiştir</span>
        </div>

        {/* Form and Stats Section */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div style={statBoxStyle}>
              <span style={{ display: 'block', fontSize: '0.85rem', color: isLight ? '#64748b' : 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>Toplam Puan</span>
              <span style={{ fontSize: '2.2rem', fontWeight: 900, color: isLight ? '#0ea5e9' : 'var(--primary)' }}>{user.points}</span>
            </div>
            <div style={statBoxStyle}>
              <span style={{ display: 'block', fontSize: '0.85rem', color: isLight ? '#64748b' : 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>Çözülen Vaka</span>
              <span style={{ fontSize: '2.2rem', fontWeight: 900, color: isLight ? '#1e293b' : 'white' }}>{user.solvedCases?.length || 0}</span>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>E-posta Adresi</label>
            <input type="text" value={user.email} disabled style={{ ...inputStyle, opacity: 0.7, cursor: 'not-allowed' }} />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Görünür İsim (Nickname)</label>
            <input 
              type="text" 
              value={nickname} 
              onChange={e => setNickname(e.target.value)} 
              style={inputStyle}
            />
          </div>
          
          <div style={{ marginTop: '2rem' }}>
            <label style={labelStyle}>Veya Avatar Seç</label>
            <div className="avatar-selector">
              {AVATAR_OPTIONS.map(opt => (
                <button 
                  key={opt}
                  className={`avatar-option ${avatar === opt ? 'selected' : ''}`}
                  onClick={() => setAvatar(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
            <button className="btn-danger" onClick={handleDeleteAccount}>
              Hesabımı Sil
            </button>
          </div>
          
          {message && <div style={{ marginTop: '1rem', color: 'var(--primary)', fontWeight: 600 }}>{message}</div>}
        </div>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*"
        onChange={handleFileUpload}
      />
    </main>
  );
}
