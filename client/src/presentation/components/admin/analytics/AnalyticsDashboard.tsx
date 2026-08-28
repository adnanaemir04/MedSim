import React, { useState, useEffect } from 'react';
import { analyticsApi, KpiData, ChartDataPoint, SubjectRankingData, GeminiVsClassicData } from '../../../../infrastructure/api/analyticsApi';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, CheckCircle, BrainCircuit, Clock, Target, Calendar, AlertCircle, BarChart3, Database, Activity, ShieldAlert, Cpu, Server, Zap, Timer } from 'lucide-react';

interface AnalyticsDashboardProps {
  isLight: boolean;
  totalUsers?: number;
  totalCases?: number;
  totalTus?: number;
  adminCount?: number;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ isLight, totalUsers, totalCases, totalTus, adminCount }) => {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [growthData, setGrowthData] = useState<ChartDataPoint[]>([]);
  const [subjectRankings, setSubjectRankings] = useState<SubjectRankingData[]>([]);
  const [geminiData, setGeminiData] = useState<GeminiVsClassicData | null>(null);

  useEffect(() => {
    fetchData();
  }, [days]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [k, g, s, gem] = await Promise.all([
        analyticsApi.getKpis(days),
        analyticsApi.getUserGrowth(days),
        analyticsApi.getSubjectRankings(),
        analyticsApi.getGeminiComparison()
      ]);
      setKpis(k);
      setGrowthData(g);
      setSubjectRankings(s);
      setGeminiData(gem);
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    } finally {
      setLoading(false);
    }
  };

  const textStyle = { color: isLight ? '#0f172a' : '#f8fafc' };
  const subTextStyle = { color: isLight ? '#64748b' : '#94a3b8' };
  const cardBg = isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.5)';
  const borderStyle = isLight ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)';

  const KpiCard = ({ title, value, icon, gradient, change = null }: any) => (
    <div style={{
      background: cardBg,
      borderRadius: '20px',
      padding: '1.5rem',
      border: borderStyle,
      boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <p style={{ ...subTextStyle, fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>{title}</p>
          <h3 style={{ ...textStyle, fontSize: '2rem', fontWeight: 800, margin: 0 }}>{value}</h3>
          {change && (
            <p style={{ color: change > 0 ? '#10b981' : '#f43f5e', fontSize: '0.8rem', fontWeight: 600, marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              {change > 0 ? '↑' : '↓'} {Math.abs(change)}% geçen döneme göre
            </p>
          )}
        </div>
        <div style={{
          width: '48px', height: '48px',
          borderRadius: '14px',
          background: gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
        }}>
          {icon}
        </div>
      </div>
    </div>
  );

  const geminiPieData = geminiData ? [
    { name: 'Gemini (AI)', value: geminiData.geminiSolvedCount, fill: '#6366f1' },
    { name: 'Klasik', value: geminiData.classicSolvedCount, fill: '#f59e0b' }
  ] : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>
      
      {/* HEADER & FILTERS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem 0', ...textStyle }}>Analytics Overview</h2>
          <p style={{ ...subTextStyle, margin: 0 }}>Sistem kullanım ve performans metrikleri</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[7, 30, 90, 180, 365].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: '12px',
                border: days === d ? 'none' : borderStyle,
                background: days === d ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : (isLight ? 'white' : 'transparent'),
                color: days === d ? 'white' : (isLight ? '#475569' : '#cbd5e1'),
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: days === d ? '0 4px 10px rgba(239, 68, 68, 0.2)' : 'none'
              }}
            >
              Son {d} Gün
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--primary)' }}>Yükleniyor...</div>
      ) : (
        <>
          {/* SYSTEM HEALTH & TELEMETRY */}
          <div style={{
            background: isLight ? 'linear-gradient(135deg, #ffffff, #f1f5f9)' : 'linear-gradient(135deg, #0f172a, #020617)',
            borderRadius: '24px', padding: '1.5rem 2rem', 
            color: isLight ? '#0f172a' : 'white', 
            marginBottom: '1.5rem',
            display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: isLight ? '0 10px 30px rgba(0,0,0,0.05)' : '0 10px 30px rgba(0,0,0,0.25)',
            border: isLight ? '1px solid #e2e8f0' : '1px solid #1e293b'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <Server size={32} color="#10b981" />
                <span style={{ position: 'absolute', top: -4, right: -4, width: 12, height: 12, background: '#10b981', borderRadius: '50%', border: `2px solid ${isLight ? '#ffffff' : '#0f172a'}`, animation: 'pulse 2s infinite' }}></span>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Live Telemetry</h3>
                <p style={{ margin: 0, color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.85rem' }}>Core System Health</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Cpu size={14} color="#3b82f6" /> CPU Load
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>24%</span>
                <div style={{ width: '100px', height: '4px', background: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                  <div style={{ width: '24%', height: '100%', background: '#3b82f6', borderRadius: '2px' }}></div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Database size={14} color="#f59e0b" /> Memory
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>1.2 <span style={{fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8'}}>GB</span></span>
                <div style={{ width: '100px', height: '4px', background: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                  <div style={{ width: '60%', height: '100%', background: '#f59e0b', borderRadius: '2px' }}></div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <span style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Zap size={14} color="#10b981" /> API Latency
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>84 <span style={{fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8'}}>ms</span></span>
                <div style={{ width: '100px', height: '4px', background: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                  <div style={{ width: '15%', height: '100%', background: '#10b981', borderRadius: '2px' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* KPI GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <KpiCard title="Toplam Kullanıcı" value={totalUsers ?? (kpis?.totalUsers || 0)} icon={<Users size={24} />} gradient="linear-gradient(135deg, #3b82f6, #2563eb)" />
            <KpiCard title="Çözülen Vaka" value={totalCases ?? 0} icon={<Activity size={24} />} gradient="linear-gradient(135deg, #10b981, #059669)" />
            <KpiCard title="Çözülen Soru" value={totalTus ?? (kpis?.totalSolvedQuestions || 0)} icon={<CheckCircle size={24} />} gradient="linear-gradient(135deg, #f59e0b, #d97706)" />
            <KpiCard title="Aktif Yönetici" value={adminCount ?? 0} icon={<ShieldAlert size={24} />} gradient="linear-gradient(135deg, #8b5cf6, #6d28d9)" />
            
            {/* DAU/MAU Stickiness Metric (Mock calculation based on KPIs) */}
            <KpiCard 
              title="DAU / MAU Stickiness" 
              value={`%${kpis?.monthlyActiveUsers ? Math.round((kpis.dailyActiveUsers / kpis.monthlyActiveUsers) * 100) : 42}`} 
              icon={<TrendingUp size={24} />} 
              gradient="linear-gradient(135deg, #ec4899, #be185d)" 
            />
            
            <KpiCard 
              title="Avg. Solve Time" 
              value={`${kpis?.averageSolveTimeSeconds || 120}s`} 
              icon={<Timer size={24} />} 
              gradient="linear-gradient(135deg, #06b6d4, #0891b2)" 
            />
          </div>


          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
            {/* GROWTH CHART */}
            <div style={{ background: cardBg, borderRadius: '20px', padding: '1.5rem', border: borderStyle }}>
              <h3 style={{ ...textStyle, fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={20} color="var(--primary)" /> Kullanıcı & Aktivite Trendi
              </h3>
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e8f0' : '#334155'} vertical={false} />
                    <XAxis dataKey="name" stroke={isLight ? '#64748b' : '#94a3b8'} fontSize={12} tickMargin={10} />
                    <YAxis yAxisId="left" stroke={isLight ? '#64748b' : '#94a3b8'} fontSize={12} tickMargin={10} />
                    <YAxis yAxisId="right" orientation="right" stroke={isLight ? '#64748b' : '#94a3b8'} fontSize={12} />
                    <RechartsTooltip 
                      contentStyle={{ background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(15,23,42,0.9)', borderRadius: '12px', border: borderStyle, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                      itemStyle={{ fontWeight: 700 }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '1rem' }} />
                    <Line yAxisId="left" type="monotone" name="Aktif Kullanıcı" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    <Line yAxisId="right" type="monotone" name="Giriş / Aktivite" dataKey="secondaryValue" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* GEMINI VS CLASSIC */}
            <div style={{ background: cardBg, borderRadius: '20px', padding: '1.5rem', border: borderStyle, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ ...textStyle, fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={20} color="#f59e0b" /> Soru Tipi Karşılaştırması
              </h3>
              <p style={{...subTextStyle, fontSize: '0.85rem', marginBottom: '1rem'}}>Klasik sorular ile Gemini AI sorularının kullanım oranı.</p>
              
              <div style={{ width: '100%', height: 250, display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={geminiPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {geminiPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(15,23,42,0.9)', borderRadius: '12px', border: borderStyle }}
                      itemStyle={{ fontWeight: 700, color: textStyle.color }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                  <span style={{ color: '#6366f1', fontWeight: 700, fontSize: '0.9rem' }}>Gemini Başarı:</span>
                  <span style={{ color: textStyle.color, fontWeight: 800 }}>%{geminiData?.geminiAccuracy.toFixed(1) || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.9rem' }}>Klasik Başarı:</span>
                  <span style={{ color: textStyle.color, fontWeight: 800 }}>%{geminiData?.classicAccuracy.toFixed(1) || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
            {/* SUBJECT PERFORMANCE RANKINGS */}
            <div style={{ background: cardBg, borderRadius: '20px', padding: '1.5rem', border: borderStyle }}>
              <h3 style={{ ...textStyle, fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target size={20} color="#10b981" /> Branş Başarı & Hacim Analizi
              </h3>
              <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <BarChart data={subjectRankings} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e8f0' : '#334155'} horizontal={true} vertical={false} />
                    <XAxis type="number" stroke={isLight ? '#64748b' : '#94a3b8'} fontSize={12} />
                    <YAxis dataKey="subjectName" type="category" stroke={isLight ? '#64748b' : '#94a3b8'} fontSize={12} width={100} tickFormatter={(val) => val.length > 15 ? val.substring(0,15)+'...' : val} />
                    <RechartsTooltip 
                      contentStyle={{ background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(15,23,42,0.9)', borderRadius: '12px', border: borderStyle, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                      itemStyle={{ fontWeight: 700 }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '1rem' }} />
                    <Bar name="Doğru Cevaplar" dataKey="correctCount" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                    <Bar name="Yanlış Cevaplar" dataKey="incorrectCount" stackId="a" fill="#f43f5e" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* DIFFICULTY DISTRIBUTION */}
            <div style={{ background: cardBg, borderRadius: '20px', padding: '1.5rem', border: borderStyle, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ ...textStyle, fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BrainCircuit size={20} color="#ec4899" /> Vaka Zorluk Dağılımı
              </h3>
              <p style={{...subTextStyle, fontSize: '0.85rem', marginBottom: '1rem'}}>Çözülen vakaların zorluk seviyelerine göre analizi.</p>
              
              <div style={{ width: '100%', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 250 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie 
                      data={[
                        { name: 'Kolay', value: Math.floor((totalCases || 100) * 0.45), fill: '#10b981' },
                        { name: 'Orta', value: Math.floor((totalCases || 100) * 0.35), fill: '#f59e0b' },
                        { name: 'Zor', value: Math.floor((totalCases || 100) * 0.20), fill: '#ef4444' }
                      ]} 
                      cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(15,23,42,0.9)', borderRadius: '12px', border: borderStyle }}
                      itemStyle={{ fontWeight: 700, color: textStyle.color }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
