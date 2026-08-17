export interface RankInfo {
  title: string;
  color: string;
  bg: string;
  border: string;
  icon: string;
}

export const getUserRank = (points: number): RankInfo => {
  if (points < 100) return { title: 'Tıp Öğrencisi', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.2)', icon: '🩺' };
  if (points < 500) return { title: 'İntern Doktor', color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.1)', border: 'rgba(14, 165, 233, 0.2)', icon: '🎓' };
  if (points < 1500) return { title: 'Pratisyen Hekim', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)', icon: '⚕️' };
  if (points < 3000) return { title: 'Asistan Hekim', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.2)', icon: '👨‍⚕️' };
  if (points < 5000) return { title: 'Uzman Doktor', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)', icon: '🌟' };
  if (points < 10000) return { title: 'Doçent', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.1)', border: 'rgba(244, 63, 94, 0.2)', icon: '👑' };
  return { title: 'Profesör', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)', icon: '🏆' };
};
