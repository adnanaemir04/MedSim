'use client';

import { useEffect, useState } from 'react';
import { User } from '../../../../domain/entities/User';
import { Trophy, Medal, Award } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { getUserRank } from '../../../utils/rankSystem';

export default function Leaderboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    fetch('http://localhost:5211/api/Auth/leaderboard')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Leaderboard fetch error:", err);
        setLoading(false);
      });
  }, []);

  const containerStyle = {
    padding: '3rem', maxWidth: '900px', margin: '2rem auto',
    background: isLight 
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1))'
      : 'linear-gradient(135deg, rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.3))',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    borderRadius: '32px',
    border: isLight 
      ? '1px solid rgba(255, 255, 255, 0.6)'
      : '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: isLight 
      ? '0 30px 60px rgba(0, 50, 150, 0.08), inset 0 0 0 1px rgba(255,255,255,0.5)'
      : '0 30px 60px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255,255,255,0.02)',
  };

  const cardStyle = (index: number) => {
    const getColors = () => {
      if (isLight) {
        if (index === 0) return { bg: 'linear-gradient(120deg, rgba(255,249,230,0.9), rgba(255,255,255,0.8))', border: 'rgba(255, 204, 0, 0.4)', shadow: '0 15px 35px rgba(255, 204, 0, 0.15)' };
        if (index === 1) return { bg: 'linear-gradient(120deg, rgba(241,245,249,0.9), rgba(255,255,255,0.8))', border: 'rgba(148, 163, 184, 0.4)', shadow: '0 15px 35px rgba(148, 163, 184, 0.15)' };
        if (index === 2) return { bg: 'linear-gradient(120deg, rgba(255,247,237,0.9), rgba(255,255,255,0.8))', border: 'rgba(217, 119, 6, 0.4)', shadow: '0 15px 35px rgba(217, 119, 6, 0.15)' };
        return { bg: 'rgba(255, 255, 255, 0.6)', border: 'rgba(255,255,255,0.8)', shadow: '0 8px 24px rgba(0,0,0,0.04)' };
      } else {
        if (index === 0) return { bg: 'linear-gradient(120deg, rgba(255, 204, 0, 0.1), rgba(0,0,0,0.4))', border: 'rgba(255, 204, 0, 0.3)', shadow: '0 15px 35px rgba(255, 204, 0, 0.1)' };
        if (index === 1) return { bg: 'linear-gradient(120deg, rgba(148, 163, 184, 0.1), rgba(0,0,0,0.4))', border: 'rgba(148, 163, 184, 0.3)', shadow: '0 15px 35px rgba(148, 163, 184, 0.1)' };
        if (index === 2) return { bg: 'linear-gradient(120deg, rgba(217, 119, 6, 0.1), rgba(0,0,0,0.4))', border: 'rgba(217, 119, 6, 0.3)', shadow: '0 15px 35px rgba(217, 119, 6, 0.1)' };
        return { bg: 'rgba(255, 255, 255, 0.03)', border: 'rgba(255,255,255,0.05)', shadow: '0 8px 24px rgba(0,0,0,0.2)' };
      }
    };
    
    const colors = getColors();

    return {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '1.5rem 2.5rem', 
      background: colors.bg,
      backdropFilter: 'blur(20px)',
      borderRadius: '24px', 
      border: `1px solid ${colors.border}`,
      boxShadow: colors.shadow,
      position: 'relative' as const, 
      overflow: 'hidden',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      cursor: 'pointer'
    };
  };

  return (
    <main style={containerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem', justifyContent: 'center' }}>
        <div style={{ 
          padding: '1.2rem', 
          background: isLight ? 'linear-gradient(135deg, #ffcc00, #ff9900)' : 'linear-gradient(135deg, rgba(255,204,0,0.2), rgba(255,153,0,0.05))', 
          borderRadius: '50%', 
          color: isLight ? 'white' : 'var(--warning)',
          boxShadow: isLight ? '0 10px 25px rgba(255, 204, 0, 0.4)' : '0 0 20px rgba(255, 204, 0, 0.2)',
          border: isLight ? 'none' : '1px solid rgba(255, 204, 0, 0.3)'
        }}>
          <Trophy size={36} strokeWidth={2.5} />
        </div>
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ 
            fontSize: '2.5rem', fontWeight: 900, margin: 0, 
            color: isLight ? '#1e293b' : '#ffffff',
            letterSpacing: '-1px'
          }}>
            Liderlik Tablosu
          </h2>
          <p style={{ color: isLight ? '#64748b' : 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.5rem', fontWeight: 500 }}>
            En çok vaka çözen ve yüksek puan toplayan hekimlerimiz.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Yükleniyor...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {users.map((user, index) => (
            <div 
              key={user.id} 
              style={cardStyle(index)}
              className="light-leaderboard-card" 
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 900, 
                  color: isLight 
                    ? (index === 0 ? '#d97706' : index === 1 ? '#475569' : index === 2 ? '#9a3412' : '#94a3b8') 
                    : (index === 0 ? '#fcd34d' : index === 1 ? '#cbd5e1' : index === 2 ? '#fb923c' : '#475569'),
                  width: '40px', textAlign: 'center',
                  textShadow: index < 3 ? (isLight ? '0 2px 10px rgba(0,0,0,0.1)' : '0 2px 15px rgba(255,255,255,0.1)') : 'none'
                }}>
                  {index + 1}
                </div>
                
                <div style={{
                  background: user.avatar?.startsWith('data:image') ? `url(${user.avatar}) center/cover` : (isLight ? '#ffffff' : 'rgba(255,255,255,0.05)'),
                  fontSize: user.avatar?.startsWith('data:image') ? '0' : '2rem',
                  width: '64px', height: '64px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%', 
                  border: isLight ? '3px solid white' : '2px solid rgba(255,255,255,0.1)',
                  boxShadow: isLight ? '0 8px 20px rgba(0,0,0,0.08)' : '0 8px 20px rgba(0,0,0,0.3)'
                }}>
                  {!user.avatar?.startsWith('data:image') && (user.avatar || '👨‍⚕️')}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ 
                    fontWeight: 800, fontSize: '1.3rem', 
                    color: isLight ? '#1e293b' : 'white',
                    textShadow: !isLight && index === 0 ? '0 0 10px rgba(255,255,255,0.3)' : 'none'
                  }}>
                    {user.nickname}
                  </span>
                  
                  {(() => {
                    const rank = getUserRank(user.points);
                    return (
                      <span style={{ 
                        fontSize: '0.85rem', 
                        color: rank.color, 
                        fontWeight: 700,
                        background: rank.bg,
                        border: isLight ? 'none' : `1px solid ${rank.border}`,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        display: 'inline-block',
                        marginTop: '0.3rem',
                        boxShadow: !isLight ? `0 0 10px ${rank.bg}` : 'none'
                      }}>
                        {rank.icon} {rank.title}
                      </span>
                    );
                  })()}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: isLight ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.3)', padding: '0.8rem 1.5rem', borderRadius: '20px', boxShadow: isLight ? 'inset 0 2px 5px rgba(0,0,0,0.02)' : 'inset 0 2px 5px rgba(0,0,0,0.2)' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 900, color: isLight ? '#0ea5e9' : '#38bdf8', letterSpacing: '-1px' }}>
                  {user.points}
                </span>
                <span style={{ fontSize: '1rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: 700 }}>Puan</span>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Henüz kimse puan kazanmamış.</div>
          )}
        </div>
      )}
    </main>
  );
}
