'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createPortal } from 'react-dom';
import { User } from '../../../domain/entities/User';
import { Trophy, Medal, Award, Info, X, Sparkles, TrendingUp, Target, Flame, Zap, Star, Activity } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { getUserRank } from '../../../utils/rankSystem';
import { motion, AnimatePresence } from 'framer-motion';

import { getGeneralLeaderboard, getTusLeaderboard, getSolvedCases, getSolvedTusQuestions, getTusUserStats } from '../../../infrastructure/api/simulationApi';
import { soundManager } from '../../../utils/soundManager';

export default function Leaderboard({ user }: { user?: any }) {
  const [boardType, setBoardType] = useState<'general' | 'tus' | 'achievements'>('general');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const { data: users = [], isLoading: loading } = useQuery({
    queryKey: ['leaderboard', boardType],
    queryFn: async () => {
      if (boardType === 'achievements') return [];
      const fetchLeaderboard = boardType === 'general' ? getGeneralLeaderboard : getTusLeaderboard;
      const data = await fetchLeaderboard();
      return data.slice(0, 10);
    },
    staleTime: 60 * 1000,
  });

  const { data: userStats = null } = useQuery({
    queryKey: ['userAchievements', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const [casesData, questionsData, statsData] = await Promise.all([
        getSolvedCases(user.email, 1, 100),
        getSolvedTusQuestions(user.email),
        getTusUserStats(user.email)
      ]);
      return {
        solvedCasesCount: casesData?.items?.length || 0,
        solvedCasesList: casesData?.items || [],
        tusStats: statsData || { totalSolved: 0, correctCount: 0, wrongCount: 0 },
        totalTusCount: questionsData?.totalCount || 0
      };
    },
    enabled: !!user?.email
  });

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
      ? '0 30px 60px rgba(225, 29, 72, 0.06), inset 0 0 0 1px rgba(255,255,255,0.5)'
      : '0 30px 60px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255,255,255,0.02)',
  };

  const cardStyle = (index: number) => {
    const getColors = () => {
      if (isLight) {
        if (index === 0) return { bg: 'linear-gradient(120deg, rgba(255,249,230,0.9), rgba(255,255,255,0.8))', border: 'rgba(255, 204, 0, 0.4)', shadow: '0 15px 35px rgba(255, 204, 0, 0.15)' };
        if (index === 1) return { bg: 'linear-gradient(120deg, rgba(241,245,249,0.9), rgba(255,255,255,0.8))', border: 'rgba(148, 163, 184, 0.4)', shadow: '0 15px 35px rgba(148, 163, 184, 0.15)' };
        if (index === 2) return { bg: 'linear-gradient(120deg, rgba(255,247,237,0.9), rgba(255,255,255,0.8))', border: 'rgba(217, 119, 6, 0.4)', shadow: '0 15px 35px rgba(217, 119, 6, 0.15)' };
        return { bg: 'rgba(255, 255, 255, 0.6)', border: 'rgba(255,255,255,0.8)', shadow: '0 8px 24px rgba(225, 29, 72, 0.05)' };
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
            background: isLight ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'linear-gradient(135deg, rgba(255,204,0,0.2), rgba(255,153,0,0.05))', 
            borderRadius: '50%', 
            color: isLight ? 'white' : 'var(--warning)',
            boxShadow: isLight ? '0 10px 25px var(--primary-glow)' : '0 0 20px rgba(255, 204, 0, 0.2)',
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
            style={{ color: isLight ? '#64748b' : 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.4rem', fontWeight: 500 }}
          >
            {boardType === 'general' ? 'En çok vaka çözen ve yüksek puan toplayan hekimlerimiz.' : boardType === 'tus' ? 'TUS sorularında en yüksek neti yapan başarılı hekimlerimiz.' : 'Tıp simülasyonlarında ve sınavlarda kilidini açabileceğiniz özel başarımlar.'}
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
            boxShadow: boardType === 'general' ? (isLight ? '0 10px 20px var(--primary-glow)' : '0 10px 20px rgba(14, 165, 233, 0.2)') : 'none',
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
            background: boardType === 'tus' ? 'var(--secondary)' : 'transparent',
            color: boardType === 'tus' ? 'white' : 'var(--text-muted)',
            fontWeight: 700, fontSize: '1rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: boardType === 'tus' ? (isLight ? '0 10px 20px rgba(159, 18, 57, 0.3)' : '0 10px 20px rgba(239, 68, 68, 0.2)') : 'none',
            transition: 'background 0.3s'
          }}
        >
          <TrendingUp size={16} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'text-bottom' }} />
          TUS Sıralaması
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onMouseEnter={() => soundManager.playHover()}
          onClick={() => { soundManager.playClick(); setBoardType('achievements'); }}
          style={{
            padding: '0.8rem 1.5rem',
            borderRadius: '12px',
            background: boardType === 'achievements' ? 'rgba(139, 92, 246, 0.8)' : 'transparent',
            color: boardType === 'achievements' ? 'white' : 'var(--text-muted)',
            fontWeight: 700, fontSize: '1rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: boardType === 'achievements' ? (isLight ? '0 10px 20px rgba(139, 92, 246, 0.3)' : '0 10px 20px rgba(139, 92, 246, 0.2)') : 'none',
            transition: 'background 0.3s'
          }}
        >
          <Award size={16} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'text-bottom' }} />
          Başarımlar
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
            background: isLight ? 'rgba(225, 29, 72, 0.05)' : 'rgba(255,255,255,0.08)',
            color: isLight ? 'var(--primary)' : '#cbd5e1',
            fontWeight: 600, fontSize: '1rem',
            border: isLight ? '1px solid rgba(225, 29, 72, 0.1)' : 'none',
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

      {boardType === 'achievements' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {[
            { id: 'first_blood', icon: <Flame color="#f97316" size={24}/>, title: "İlk Kan", desc: "İlk vakanı başarıyla çöz.", target: "1 Vaka Çözümü", current: userStats?.solvedCasesCount || 0, req: 1, isUnlocked: (userStats?.solvedCasesCount || 0) >= 1 },
            { id: 'tus_monster', icon: <Target color="#ef4444" size={24}/>, title: "TUS Canavarı", desc: "En az 5 TUS sorusu çöz ve %80 başarı yakala.", target: "%80 Doğru Oranı", current: userStats?.tusStats ? `${userStats.tusStats.totalSolved > 0 ? Math.round((userStats.tusStats.correctCount / userStats.tusStats.totalSolved) * 100) : 0}% (${userStats.tusStats.correctCount}/${userStats.tusStats.totalSolved})` : '0%', req: 80, isUnlocked: userStats?.tusStats ? (userStats.tusStats.totalSolved >= 5 && (userStats.tusStats.correctCount / userStats.tusStats.totalSolved) >= 0.8) : false },
            { id: 'serial_killer', icon: <Zap color="#eab308" size={24}/>, title: "Seri Katil", desc: "En az 5 vaka çözün.", target: "5 Vaka Çözümü", current: userStats?.solvedCasesCount || 0, req: 5, isUnlocked: (userStats?.solvedCasesCount || 0) >= 5 },
            { id: 'perfection', icon: <Star color="#8b5cf6" size={24}/>, title: "Mükemmeliyet", desc: "Toplam 10 TUS sorusu çözün.", target: "10 Soru Çözümü", current: userStats?.totalTusCount || 0, req: 10, isUnlocked: (userStats?.totalTusCount || 0) >= 10 },
            { id: 'expert', icon: <Award color="#10b981" size={24}/>, title: "Uzman Hekim", desc: "Klinik puanını 10.000 yap.", target: "10,000 Klinik Puan", current: user?.points || 0, req: 10000, isUnlocked: (user?.points || 0) >= 10000 },
            { id: 'life_saver', icon: <Activity color="#0ea5e9" size={24}/>, title: "Hayat Kurtaran", desc: "Zor seviyedeki en az bir vakayı başarıyla tamamla.", target: "1 Zor Vaka", current: userStats?.solvedCasesList?.some((c: any) => c.difficulty === 'Zor' && c.isSolved) ? 1 : 0, req: 1, isUnlocked: userStats?.solvedCasesList?.some((c: any) => c.difficulty === 'Zor' && c.isSolved) || false },
          ].map((ach, idx) => {
            return (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -5 }}
                style={{
                  background: isLight 
                    ? (ach.isUnlocked ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(255,255,255,0.7))' : 'rgba(255, 255, 255, 0.4)')
                    : (ach.isUnlocked ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(30, 41, 59, 0.6))' : 'rgba(30, 41, 59, 0.4)'),
                  border: ach.isUnlocked 
                    ? '1.5px solid rgba(16, 185, 129, 0.4)' 
                    : (isLight ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)'),
                  borderRadius: '24px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: ach.isUnlocked ? '0 10px 25px rgba(16, 185, 129, 0.1)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    padding: '0.8rem',
                    background: ach.isUnlocked ? 'rgba(16, 185, 129, 0.15)' : (isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'),
                    borderRadius: '16px',
                    color: ach.isUnlocked ? '#10b981' : '#94a3b8'
                  }}>
                    {ach.icon}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: isLight ? '#0f172a' : 'white' }}>{ach.title}</h4>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '30px',
                      background: ach.isUnlocked ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                      color: ach.isUnlocked ? '#10b981' : '#94a3b8',
                      display: 'inline-block',
                      marginTop: '0.25rem'
                    }}>
                      {ach.isUnlocked ? 'Kazanıldı' : 'Kilitli'}
                    </span>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4', flex: 1 }}>{ach.desc}</p>

                <div style={{ background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(0,0,0,0.2)', padding: '0.8rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Mevcut İlerleme:</span>
                  <span style={{ color: ach.isUnlocked ? '#10b981' : 'var(--text-main)' }}>{ach.current}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            style={{ width: '40px', height: '40px', border: isLight ? '4px solid rgba(225, 29, 72, 0.2)' : '4px solid rgba(14, 165, 233, 0.2)', borderTopColor: isLight ? 'var(--primary)' : '#0ea5e9', borderRadius: '50%', margin: '0 auto' }}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <AnimatePresence mode="popLayout">
            {users.map((u, index) => (
              <motion.div 
                key={`${boardType}-${u.id || index}`}
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
                      background: u.avatar?.startsWith('data:image') ? `url(${u.avatar}) center/cover` : (isLight ? '#ffffff' : 'rgba(255,255,255,0.05)'),
                      fontSize: u.avatar?.startsWith('data:image') ? '0' : '1.4rem',
                      width: '46px', height: '46px', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: '14px',
                      border: isLight ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                      flexShrink: 0
                    }}
                  >
                    {!u.avatar?.startsWith('data:image') && (u.avatar || '👨‍⚕️')}
                  </motion.div>
                  
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.05rem', color: isLight ? '#0f172a' : 'white' }}>{u.nickname}</span>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: 700, 
                        background: getUserRank(u.points || 0).bg, 
                        color: getUserRank(u.points || 0).color, 
                        padding: '0.15rem 0.5rem', 
                        borderRadius: '30px',
                        border: `1px solid ${getUserRank(u.points || 0).border}`
                      }}>
                        {getUserRank(u.points || 0).title}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>E-posta:</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.email}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: isLight ? 'rgba(225, 29, 72, 0.04)' : 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '16px', boxShadow: isLight ? 'inset 0 2px 4px rgba(225,29,72,0.03)' : 'inset 0 2px 4px rgba(0,0,0,0.2)' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 900, color: isLight ? (boardType === 'tus' ? 'var(--secondary)' : 'var(--primary)') : (boardType === 'tus' ? '#f87171' : '#38bdf8'), letterSpacing: '-1px' }}>
                    {boardType === 'general' ? u.points?.toLocaleString() : u.tusCorrects}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: isLight ? '#9f1239' : '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.8 }}>
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

      {/* Rütbe Sistemi Modalı (Aesthetic 500% Override) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showInfoModal && (
            <motion.div 
              key="info-modal"
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }} 
              animate={{ opacity: 1, backdropFilter: 'blur(25px)' }} 
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              transition={{ duration: 0.4 }}
              style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: isLight ? 'rgba(255, 255, 255, 0.4)' : 'rgba(15, 23, 42, 0.75)', zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 50, opacity: 0 }} 
                animate={{ scale: 1, y: 0, opacity: 1 }} 
                exit={{ scale: 0.9, y: 50, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                style={{
                  background: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(30, 41, 59, 0.85)',
                  padding: '2rem', borderRadius: '32px', width: '95vw', maxWidth: '1100px', maxHeight: '95vh',
                  position: 'relative', overflowY: 'auto', display: 'flex', flexDirection: 'column',
                  boxShadow: isLight ? '0 40px 100px rgba(14, 165, 233, 0.15), inset 0 0 0 1px rgba(255,255,255,1)' : '0 40px 100px rgba(0, 0, 0, 0.8), inset 0 0 0 1px rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(40px)'
                }}
              >
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { soundManager.playClick(); setShowInfoModal(false); }}
                  onMouseEnter={() => soundManager.playHover()}
                  style={{ 
                    position: 'absolute', top: '1.5rem', right: '1.5rem', 
                    background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)', 
                    padding: '0.8rem', borderRadius: '50%', border: 'none', cursor: 'pointer', 
                    color: isLight ? '#0f172a' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <X size={20} strokeWidth={3} />
                </motion.button>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1.5rem', marginTop: '0.5rem' }}>
                  <motion.div 
                    initial={{ rotate: -180, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem' }}
                  >
                    <div style={{ display: 'inline-flex', padding: '0.8rem', background: isLight ? 'linear-gradient(135deg, #38bdf8, #818cf8)' : 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(129,140,248,0.2))', borderRadius: '30%', color: isLight ? 'white' : '#38bdf8', transform: 'rotate(10deg)', boxShadow: isLight ? '0 10px 25px rgba(56,189,248,0.4)' : '0 0 20px rgba(56,189,248,0.2)' }}>
                      <Award size={28} strokeWidth={2.5} />
                    </div>
                    <h3 style={{ margin: 0, color: isLight ? '#0f172a' : '#f8fafc', fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-1px', background: isLight ? 'linear-gradient(135deg, #0f172a, #334155)' : 'linear-gradient(135deg, #ffffff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      Rütbe Sistemi
                    </h3>
                  </motion.div>
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    style={{ color: isLight ? '#475569' : '#94a3b8', fontSize: '1rem', maxWidth: '800px', margin: '0 auto', fontWeight: 500 }}
                  >
                    Klinik vakaları çözerek puan toplayın ve en tepeye tırmanın. TUS Sıralaması ise TUS denemelerindeki netlerinize göre hesaplanır.
                  </motion.p>
                </div>

                <motion.div 
                  initial="hidden" animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                  }}
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', flex: 1 }}
                >
                  {[
                    { icon: '🩺', name: 'Tıp Öğrencisi', range: '0 - 999', color: '#94a3b8', bgLight: 'rgba(241,245,249,0.8)', bgDark: 'rgba(30,41,59,0.4)' },
                    { icon: '🎓', name: 'İntern Doktor', range: '1000 - 2499', color: '#0ea5e9', bgLight: 'rgba(240,249,255,0.8)', bgDark: 'rgba(14,165,233,0.1)' },
                    { icon: '⚕️', name: 'Pratisyen Hekim', range: '2500 - 4999', color: '#10b981', bgLight: 'rgba(236,253,245,0.8)', bgDark: 'rgba(16,185,129,0.1)' },
                    { icon: '👨‍⚕️', name: 'Asistan Hekim', range: '5000 - 9999', color: '#8b5cf6', bgLight: 'rgba(245,243,255,0.8)', bgDark: 'rgba(139,92,246,0.1)' },
                    { icon: '🌟', name: 'Uzman Doktor', range: '10000 - 19999', color: '#f59e0b', bgLight: 'rgba(255,251,235,0.8)', bgDark: 'rgba(245,158,11,0.1)' },
                    { icon: '👑', name: 'Doçent', range: '20000 - 34999', color: '#f43f5e', bgLight: 'rgba(255,241,242,0.8)', bgDark: 'rgba(244,63,94,0.1)' },
                    { icon: '🏆', name: 'Profesör', range: '35000 - 49999', color: '#ef4444', bgLight: 'rgba(254,242,242,0.8)', bgDark: 'rgba(239,68,68,0.1)' }
                  ].map(rank => (
                    <motion.div 
                      key={rank.name}
                      variants={{ hidden: { opacity: 0, y: 20, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1 } }}
                      whileHover={{ scale: 1.05, y: -5, boxShadow: `0 15px 30px ${rank.color}30` }}
                      style={{ 
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                        padding: '1.5rem 1rem', background: isLight ? rank.bgLight : rank.bgDark, 
                        borderRadius: '24px', border: `1px solid ${isLight ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.05)'}`,
                        cursor: 'pointer', transition: 'border 0.3s'
                      }}
                    >
                      <motion.span 
                        whileHover={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ duration: 0.5 }}
                        style={{ fontSize: '2.8rem', marginBottom: '0.6rem', filter: `drop-shadow(0 10px 15px ${rank.color}60)` }}
                      >
                        {rank.icon}
                      </motion.span>
                      <span style={{ fontWeight: 900, fontSize: '1.1rem', color: rank.color, marginBottom: '0.4rem', letterSpacing: '-0.3px', textAlign: 'center' }}>{rank.name}</span>
                      <div style={{ background: isLight ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.3)', padding: '0.3rem 0.8rem', borderRadius: '10px' }}>
                        <span style={{ fontSize: '0.9rem', color: isLight ? '#475569' : '#cbd5e1', fontWeight: 800 }}>{rank.range} Puan</span>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Ordinaryus (Ultimate Flex) */}
                  <motion.div 
                    variants={{ hidden: { opacity: 0, y: 20, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1 } }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    style={{ 
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 1rem', 
                      background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(234, 88, 12, 0.15) 100%)', 
                      borderRadius: '24px', border: '1px solid rgba(251, 191, 36, 0.4)', 
                      boxShadow: '0 0 30px rgba(251, 191, 36, 0.2), inset 0 0 15px rgba(251, 191, 36, 0.1)',
                      position: 'relative', overflow: 'hidden', cursor: 'pointer'
                    }}
                  >
                    <motion.div 
                      animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'conic-gradient(from 0deg, transparent 0 340deg, rgba(251,191,36,0.3) 360deg)', opacity: 0.5, pointerEvents: 'none' }} 
                    />
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <motion.span 
                        animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ fontSize: '3.2rem', marginBottom: '0.6rem', filter: 'drop-shadow(0 15px 20px rgba(251, 191, 36, 0.6))' }}
                      >
                        💎
                      </motion.span>
                      <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#fbbf24', marginBottom: '0.4rem', textShadow: '0 2px 10px rgba(251, 191, 36, 0.5)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Ordinaryus</span>
                      <div style={{ background: 'rgba(251, 191, 36, 0.2)', padding: '0.3rem 0.8rem', borderRadius: '10px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                        <span style={{ fontSize: '0.9rem', color: '#fcd34d', fontWeight: 900 }}>50000+ Puan</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
                
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      , document.body)}
    </motion.main>
  );
}
