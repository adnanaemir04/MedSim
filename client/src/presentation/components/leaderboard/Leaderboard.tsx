'use client';

import { useEffect, useState } from 'react';
import { User } from '../../../../domain/entities/User';
import { Trophy, Medal, Award } from 'lucide-react';

export default function Leaderboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <main className="glass-panel" style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1rem', background: 'rgba(255, 204, 0, 0.1)', borderRadius: '50%', color: 'var(--warning)' }}>
          <Trophy size={32} />
        </div>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Liderlik Tablosu</h2>
          <p style={{ color: 'var(--text-muted)' }}>En çok vaka çözen ve puan toplayan hekimlerimiz.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Yükleniyor...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {users.map((user, index) => (
            <div 
              key={user.id} 
              style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1.5rem', background: 'rgba(255, 255, 255, 0.03)', 
                borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)',
                boxShadow: index < 3 ? '0 0 15px rgba(255, 204, 0, 0.1)' : 'none',
                position: 'relative', overflow: 'hidden'
              }}
            >
              {/* Rank Highlight */}
              {index === 0 && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'var(--warning)' }} />}
              {index === 1 && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: '#94a3b8' }} />}
              {index === 2 && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: '#b45309' }} />}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-muted)', width: '30px', textAlign: 'center' }}>
                  {index + 1}
                </span>
                
                <div style={{
                  background: user.avatar?.startsWith('data:image') ? `url(${user.avatar}) center/cover` : 'var(--bg-panel)',
                  fontSize: user.avatar?.startsWith('data:image') ? '0' : '1.8rem',
                  width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%', border: '2px solid var(--border-light)'
                }}>
                  {!user.avatar?.startsWith('data:image') && (user.avatar || '👨‍⚕️')}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem', color: index === 0 ? 'var(--warning)' : 'var(--text-main)' }}>
                    {user.nickname}
                  </span>
                  {index === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--warning)', fontWeight: 600 }}>Başhekim</span>}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>{user.points}</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Puan</span>
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
