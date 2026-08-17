'use client';

import { useState } from 'react';
import { ApiUserRepository } from '../../../infrastructure/repositories/ApiUserRepository';

export default function AuthForm({ 
  onLoginSuccess, 
  onBackToLanding,
  initialMode = 'login'
}: { 
  onLoginSuccess: () => void,
  onBackToLanding: () => void,
  initialMode?: 'login' | 'register'
}) {
  const [isLoginMode, setIsLoginMode] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const repo = new ApiUserRepository();

    try {
      if (isLoginMode) {
        await repo.login(email, password);
      } else {
        await repo.save({ email, nickname, password, points: 0, solvedCases: [] });
      }
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
    }
  };

  return (
    <div className="auth-container">
      <button className="btn-back" onClick={onBackToLanding}>
        &larr; Anasayfa
      </button>
      <div className="auth-box glass-panel">
        <h1 className="auth-title">MedSim</h1>
        <p className="auth-subtitle">Klinik Simülasyon Platformuna Hoş Geldiniz</p>
        
        <div className="auth-tabs">
          <button 
            type="button"
            className={`auth-tab ${isLoginMode ? 'active' : ''}`}
            onClick={() => setIsLoginMode(true)}
          >
            Giriş Yap
          </button>
          <button 
            type="button"
            className={`auth-tab ${!isLoginMode ? 'active' : ''}`}
            onClick={() => setIsLoginMode(false)}
          >
            Kayıt Ol
          </button>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>E-posta Adresi</label>
            <input 
              type="email" 
              required 
              placeholder="ornek@ogrenci.edu.tr" 
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          
          {!isLoginMode && (
            <div className="form-group">
              <label>Kullanıcı Adı (Nickname)</label>
              <input 
                type="text" 
                placeholder="Liderlik tablosunda görünecek isim" 
                required
                value={nickname}
                onChange={e => setNickname(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label>Şifre</label>
            <input 
              type="password" 
              required 
              placeholder="Şifreniz" 
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary">
            {isLoginMode ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
          
          {error && <p className="auth-error">{error}</p>}
        </form>
      </div>
    </div>
  );
}
