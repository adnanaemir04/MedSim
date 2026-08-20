'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { User } from '../../../domain/entities/User';
import { Trophy, Medal, Award, Info, X, Sparkles, TrendingUp } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { getUserRank } from '../../../utils/rankSystem';
import { motion, AnimatePresence } from 'framer-motion';

import { getGeneralLeaderboard, getTusLeaderboard } from '../../../infrastructure/api/simulationApi';
import { soundManager } from '../../../utils/soundManager';

export default function Leaderboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [boardType, setBoardType] = useState<'general' | 'tus'>('general');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    setLoading(true);
    const fetchLeaderboard = boardType === 'general' ? getGeneralLeaderboard : getTusLeaderboard;
      
    fetchLeaderboard()
      .then(data => {
        setUsers(data.slice(0, 10));
        setLoading(false);
      })
      .catch(err => {
        console.error("Leaderboard fetch error:", err);
        setLoading(false);
      });
  }, [boardType]);

  const containerStyle = {
    padding: '3rem', maxWidth: '1100px', margin: '0.5rem auto 2rem auto',
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
      padding: '0.9rem 1.5rem', 
      background: colors.bg,
      backdropFilter: 'blur(20px)',
      borderRadius: '20px', 
      border: `1px solid ${colors.border}`,
      boxShadow: colors.shadow,
      position: 'relative' as const, 
      overflow: 'hidden',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      cursor: 'pointer'
    };
  };

  return (
    <motion.main 
      style={containerStyle}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '2rem', justifyContent: 'center' }}>
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
          style={{ 
            padding: '1rem', 
            background: isLight ? 'linear-gradient(135deg, #ffcc00, #ff9900)' : 'linear-gradient(135deg, rgba(255,204,0,0.2), rgba(255,153,0,0.05))', 
            borderRadius: '50%', 
            color: isLight ? 'white' : 'var(--warning)',
            boxShadow: isLight ? '0 10px 25px rgba(255, 204, 0, 0.4)' : '0 0 20px rgba(255, 204, 0, 0.2)',
            border: isLight ? 'none' : '1px solid rgba(255, 204, 0, 0.4)'
          }}
        >
          <Trophy size={36} strokeWidth={2.5} />
        </motion.div>
        
        <div style={{ textAlign: 'left' }}>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ 
              fontSize: '2.2rem', fontWeight: 900, margin: 0, 
              color: isLight ? '#1e293b' : '#ffffff',
              letterSpacing: '-1px'
            }}
          >
            Liderlik Tablosu
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ color: isLight ? '#64748b' : 'var(--text-muted)', fontSize: '1rem', marginTop: '0.4rem', fontWeight: 500 }}
          >
            {boardType === 'general' ? 'En çok vaka çözen ve yüksek puan toplayan hekimlerimiz.' : 'TUS sorularında en yüksek neti yapan başarılı hekimlerimiz.'}
          </motion.p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '2.5rem', background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.2)', padding: '0.4rem', borderRadius: '16px', width: 'fit-content', margin: '0 auto 2.5rem auto' }}
      >
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onMouseEnter={() => soundManager.playHover()}
          onClick={() => { soundManager.playClick(); setBoardType('general'); }}
          style={{
            padding: '0.8rem 1.5rem',
            borderRadius: '12px',
            background: boardType === 'general' ? 'var(--primary)' : 'transparent',
            color: boardType === 'general' ? 'white' : 'var(--text-muted)',
            fontWeight: 700, fontSize: '1rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: boardType === 'general' ? '0 10px 20px rgba(14, 165, 233, 0.2)' : 'none',
            transition: 'background 0.3s'
          }}
        >
          <Sparkles size={16} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'text-bottom' }} />
          Klinik Puanlar
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onMouseEnter={() => soundManager.playHover()}
          onClick={() => { soundManager.playClick(); setBoardType('tus'); }}
          style={{
            padding: '0.8rem 1.5rem',
            borderRadius: '12px',
            background: boardType === 'tus' ? '#ef4444' : 'transparent',
            color: boardType === 'tus' ? 'white' : 'var(--text-muted)',
            fontWeight: 700, fontSize: '1rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: boardType === 'tus' ? '0 10px 20px rgba(239, 68, 68, 0.2)' : 'none',
            transition: 'background 0.3s'
          }}
        >
          <TrendingUp size={16} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'text-bottom' }} />
          TUS Sıralaması
        </motion.button>
        
        <div style={{ width: '1px', background: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)', margin: '0 0.5rem' }}></div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onMouseEnter={() => soundManager.playHover()}
          onClick={() => { soundManager.playClick(); setShowInfoModal(true); }}
          style={{
            padding: '0.8rem 1.2rem',
            borderRadius: '12px',
            background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)',
            color: isLight ? '#475569' : '#cbd5e1',
            fontWeight: 600, fontSize: '1rem',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Info size={18} />
          <span>Sıralama Sistemi</span>
        </motion.button>
      </motion.div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            style={{ width: '40px', height: '40px', border: '4px solid rgba(14, 165, 233, 0.2)', borderTopColor: '#0ea5e9', borderRadius: '50%', margin: '0 auto' }}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <AnimatePresence mode="popLayout">
            {users.map((user, index) => (
              <motion.div 
                key={`${boardType}-${user.id || index}`}
                layout
                initial={{ opacity: 0, x: -50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                transition={{ duration: 0.4, delay: index * 0.05, type: "spring", stiffness: 100 }}
                whileHover={{ scale: 1.02, x: 10, transition: { duration: 0.2 } }}
                style={cardStyle(index)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 900, 
                    color: isLight 
                      ? (index === 0 ? '#d97706' : index === 1 ? '#475569' : index === 2 ? '#9a3412' : '#94a3b8') 
                      : (index === 0 ? '#fcd34d' : index === 1 ? '#cbd5e1' : index === 2 ? '#fb923c' : '#475569'),
                    width: '30px', textAlign: 'center',
                    textShadow: index < 3 ? (isLight ? '0 2px 8px rgba(0,0,0,0.1)' : '0 2px 10px rgba(255,255,255,0.1)') : 'none',
                    fontStyle: 'italic'
                  }}>
                    {index + 1}
                  </div>
                  
                  <motion.div 
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    style={{
                      background: user.avatar?.startsWith('data:image') ? `url(${user.avatar}) center/cover` : (isLight ? '#ffffff' : 'rgba(255,255,255,0.05)'),
                      fontSize: user.avatar?.startsWith('data:image') ? '0' : '1.4rem',
                      width: '46px', height: '46px', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: '50%', 
                      border: isLight ? '2px solid white' : '2px solid rgba(255,255,255,0.1)',
                      boxShadow: isLight ? '0 5px 15px rgba(0,0,0,0.08)' : '0 5px 15px rgba(0,0,0,0.3)'
                    }}
                  >
                    {!user.avatar?.startsWith('data:image') && (user.avatar || '👨‍⚕️')}
                  </motion.div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ 
                      fontWeight: 800, fontSize: '1.05rem', 
                      color: isLight ? '#1e293b' : 'white',
                      textShadow: !isLight && index === 0 ? '0 0 10px rgba(255,255,255,0.3)' : 'none',
                      letterSpacing: '-0.3px'
                    }}>
                      {user.nickname}
                    </span>
                    
                    {(() => {
                      const rank = getUserRank(user.points || 0);
                      return (
                        <span style={{ 
                          fontSize: '0.8rem', 
                          color: rank.color, 
                          fontWeight: 700,
                          background: rank.bg,
                          border: isLight ? 'none' : `1px solid ${rank.border}`,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '8px',
                          display: 'inline-block',
                          marginTop: '0.3rem',
                          boxShadow: !isLight ? `0 0 8px ${rank.bg}` : 'none'
                        }}>
                          {rank.icon} {rank.title}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: isLight ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '16px', boxShadow: isLight ? 'inset 0 2px 4px rgba(0,0,0,0.02)' : 'inset 0 2px 4px rgba(0,0,0,0.2)' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 900, color: isLight ? (boardType === 'tus' ? '#ef4444' : '#0ea5e9') : (boardType === 'tus' ? '#f87171' : '#38bdf8'), letterSpacing: '-1px' }}>
                    {boardType === 'general' ? user.points?.toLocaleString() : user.tusCorrects}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {boardType === 'general' ? 'Puan' : 'Doğru'}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {users.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Henüz kimse puan kazanmamış.
            </motion.div>
          )}
        </div>
      )}

      {showInfoModal && typeof document !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(25px)'
        }}>
          <div style={{
            background: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 41, 59, 0.9)',
            padding: '3rem',
            borderRadius: '32px',
            width: '95vw',
            maxWidth: '1200px',
            maxHeight: '95vh',
            position: 'relative',
            boxShadow: '0 30px 60px rgba(0, 0, 0, 0.4)',
            border: isLight ? '1px solid rgba(255, 255, 255, 1)' : '1px solid rgba(255, 255, 255, 0.1)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <button 
              onClick={() => { soundManager.playClick(); setShowInfoModal(false); }}
              onMouseEnter={() => soundManager.playHover()}
              style={{ position: 'absolute', top: '2rem', right: '2rem', background: isLight ? '#f1f5f9' : '#0f172a', padding: '0.8rem', borderRadius: '50%', border: 'none', cursor: 'pointer', color: isLight ? '#64748b' : '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
            >
              <X size={24} />
            </button>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'inline-flex', padding: '0.8rem', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '50%', color: '#0ea5e9' }}>
                  <Info size={28} />
                </div>
                <h3 style={{ margin: 0, color: isLight ? '#0f172a' : '#f8fafc', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
                  Puanlama ve Rütbe Sistemi
                </h3>
              </div>
              <p style={{ color: isLight ? '#475569' : '#cbd5e1', lineHeight: '1.5', fontSize: '1.05rem', maxWidth: '850px', margin: '0 auto' }}>
                Vaka simülasyonlarını başarıyla tamamladıkça puan kazanırsınız. Puanınız arttıkça yeni rütbelere terfi edersiniz. TUS Sıralaması ise TUS denemelerindeki doğru sayınıza göre hesaplanır.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: isLight ? 'rgba(248, 250, 252, 0.8)' : 'rgba(15, 23, 42, 0.6)', borderRadius: '24px', border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s' }}>
                <span style={{ fontSize: '3rem', marginBottom: '0.8rem', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}>🩺</span>
                <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Tıp Öğrencisi</span>
                <span style={{ fontSize: '1rem', color: isLight ? '#64748b' : '#64748b', fontWeight: 700 }}>0 - 999 Puan</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: isLight ? 'rgba(240, 249, 255, 0.8)' : 'rgba(14, 165, 233, 0.05)', borderRadius: '24px', border: isLight ? '1px solid #bae6fd' : '1px solid rgba(14, 165, 233, 0.2)', transition: 'all 0.3s' }}>
                <span style={{ fontSize: '3rem', marginBottom: '0.8rem', filter: 'drop-shadow(0 10px 15px rgba(14, 165, 233, 0.2))' }}>🎓</span>
                <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0ea5e9', marginBottom: '0.3rem' }}>İntern Doktor</span>
                <span style={{ fontSize: '1rem', color: isLight ? '#0284c7' : '#38bdf8', fontWeight: 700 }}>1000 - 2499 Puan</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: isLight ? 'rgba(236, 253, 245, 0.8)' : 'rgba(16, 185, 129, 0.05)', borderRadius: '24px', border: isLight ? '1px solid #a7f3d0' : '1px solid rgba(16, 185, 129, 0.2)', transition: 'all 0.3s' }}>
                <span style={{ fontSize: '3rem', marginBottom: '0.8rem', filter: 'drop-shadow(0 10px 15px rgba(16, 185, 129, 0.2))' }}>⚕️</span>
                <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#10b981', marginBottom: '0.3rem' }}>Pratisyen Hekim</span>
                <span style={{ fontSize: '1rem', color: isLight ? '#059669' : '#34d399', fontWeight: 700 }}>2500 - 4999 Puan</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: isLight ? 'rgba(245, 243, 255, 0.8)' : 'rgba(139, 92, 246, 0.05)', borderRadius: '24px', border: isLight ? '1px solid #ddd6fe' : '1px solid rgba(139, 92, 246, 0.2)', transition: 'all 0.3s' }}>
                <span style={{ fontSize: '3rem', marginBottom: '0.8rem', filter: 'drop-shadow(0 10px 15px rgba(139, 92, 246, 0.2))' }}>👨‍⚕️</span>
                <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#8b5cf6', marginBottom: '0.3rem' }}>Asistan Hekim</span>
                <span style={{ fontSize: '1rem', color: isLight ? '#6d28d9' : '#a78bfa', fontWeight: 700 }}>5000 - 9999 Puan</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: isLight ? 'rgba(255, 251, 235, 0.8)' : 'rgba(245, 158, 11, 0.05)', borderRadius: '24px', border: isLight ? '1px solid #fde68a' : '1px solid rgba(245, 158, 11, 0.2)', transition: 'all 0.3s' }}>
                <span style={{ fontSize: '3rem', marginBottom: '0.8rem', filter: 'drop-shadow(0 10px 15px rgba(245, 158, 11, 0.2))' }}>🌟</span>
                <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#f59e0b', marginBottom: '0.3rem' }}>Uzman Doktor</span>
                <span style={{ fontSize: '1rem', color: isLight ? '#b45309' : '#fbbf24', fontWeight: 700 }}>10000 - 19999 Puan</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: isLight ? 'rgba(255, 241, 242, 0.8)' : 'rgba(244, 63, 94, 0.05)', borderRadius: '24px', border: isLight ? '1px solid #fecdd3' : '1px solid rgba(244, 63, 94, 0.2)', transition: 'all 0.3s' }}>
                <span style={{ fontSize: '3rem', marginBottom: '0.8rem', filter: 'drop-shadow(0 10px 15px rgba(244, 63, 94, 0.2))' }}>👑</span>
                <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#f43f5e', marginBottom: '0.3rem' }}>Doçent</span>
                <span style={{ fontSize: '1rem', color: isLight ? '#be123c' : '#fb7185', fontWeight: 700 }}>20000 - 34999 Puan</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: isLight ? 'rgba(254, 242, 242, 0.8)' : 'rgba(239, 68, 68, 0.05)', borderRadius: '24px', border: isLight ? '1px solid #fecaca' : '1px solid rgba(239, 68, 68, 0.2)', transition: 'all 0.3s' }}>
                <span style={{ fontSize: '3rem', marginBottom: '0.8rem', filter: 'drop-shadow(0 10px 15px rgba(239, 68, 68, 0.2))' }}>🏆</span>
                <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#ef4444', marginBottom: '0.3rem' }}>Profesör</span>
                <span style={{ fontSize: '1rem', color: isLight ? '#b91c1c' : '#f87171', fontWeight: 700 }}>35000 - 49999 Puan</span>
              </div>
              
              {/* Ordinaryus */}
              <div style={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', 
                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(234, 88, 12, 0.15) 100%)', 
                borderRadius: '24px', border: '1px solid rgba(251, 191, 36, 0.4)', 
                boxShadow: '0 0 25px rgba(251, 191, 36, 0.2), inset 0 0 15px rgba(251, 191, 36, 0.1)',
                transition: 'all 0.3s', position: 'relative', overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: '-20%', left: '-20%', right: '-20%', bottom: '-20%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 60%)', opacity: 0.5, pointerEvents: 'none' }}></div>
                <span style={{ fontSize: '3.5rem', marginBottom: '0.8rem', filter: 'drop-shadow(0 15px 25px rgba(251, 191, 36, 0.4))' }}>💎</span>
                <span style={{ fontWeight: 900, fontSize: '1.3rem', color: '#fbbf24', marginBottom: '0.3rem', textShadow: '0 2px 10px rgba(251, 191, 36, 0.3)', letterSpacing: '1px', textTransform: 'uppercase' }}>Ordinaryus</span>
                <span style={{ fontSize: '1rem', color: '#fcd34d', fontWeight: 800 }}>50000+ Puan</span>
              </div>
            </div>
            
          </div>
        </div>
      , document.body)}
    </motion.main>
  );
}
