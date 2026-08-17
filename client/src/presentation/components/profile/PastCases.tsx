import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getSolvedCases, getDepartments, SolvedCaseDto, DepartmentDto } from '../../../infrastructure/api/simulationApi';
import { ChevronLeft, ChevronRight, Filter, Activity, Trophy, Clock, CheckCircle2 } from 'lucide-react';

interface PastCasesProps {
  userEmail: string;
}

export default function PastCases({ userEmail }: PastCasesProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [cases, setCases] = useState<SolvedCaseDto[]>([]);
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const [filterYear, setFilterYear] = useState<number | ''>('');
  const [filterSubject, setFilterSubject] = useState<string>('');

  useEffect(() => {
    // Fetch departments for the filter dropdown
    getDepartments().then(data => setDepartments(data)).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      try {
        const result = await getSolvedCases(userEmail, page, 6, filterSubject || undefined, filterYear !== '' ? Number(filterYear) : undefined);
        setCases(result.items);
        setTotalPages(result.totalPages || 1);
        setTotalCount(result.totalCount || 0);
      } catch (err) {
        console.error("Geçmiş vakalar çekilemedi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, [userEmail, page, filterSubject, filterYear]);

  // Handle year filter change (reset subject filter if year changes)
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterYear(e.target.value === '' ? '' : Number(e.target.value));
    setFilterSubject('');
    setPage(1);
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterSubject(e.target.value);
    setPage(1);
  };

  const uniqueYears = Array.from(new Set(departments.map(d => d.year))).sort();
  const filteredSubjects = filterYear !== '' ? departments.filter(d => d.year === filterYear) : departments;

  return (
    <div style={{ padding: '2rem 0', animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Activity color="var(--primary)" size={32} />
            <span>Geçmiş <span style={{ color: 'var(--primary)' }}>Vakalarım</span></span>
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '1.1rem' }}>
            Bugüne kadar çözdüğünüz toplam <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{totalCount}</span> vaka kaydı bulunuyor.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', background: 'var(--glass-bg)', padding: '0.8rem', borderRadius: '20px', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-float)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
            <Filter size={18} />
          </div>
          <select 
            value={filterYear} 
            onChange={handleYearChange}
            style={{ 
              background: 'transparent', border: 'none', color: 'var(--text-main)', 
              fontWeight: 600, outline: 'none', cursor: 'pointer', padding: '0.5rem'
            }}
          >
            <option value="" style={{ color: 'black' }}>Tüm Dönemler</option>
            {uniqueYears.map(y => (
              <option key={y} value={y} style={{ color: 'black' }}>Dönem {y}</option>
            ))}
          </select>
          <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>
          <select 
            value={filterSubject} 
            onChange={handleSubjectChange}
            style={{ 
              background: 'transparent', border: 'none', color: 'var(--text-main)', 
              fontWeight: 600, outline: 'none', cursor: 'pointer', padding: '0.5rem',
              maxWidth: '150px'
            }}
          >
            <option value="" style={{ color: 'black' }}>Tüm Dersler</option>
            {filteredSubjects.map(d => (
              <option key={d.id} value={d.name} style={{ color: 'black' }}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem', color: 'var(--primary)' }}>
          <Activity className="spin-slow" size={48} />
        </div>
      ) : cases.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem', background: 'var(--glass-bg)', borderRadius: '24px', border: '1px dashed var(--glass-border)' }}>
          <Activity size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Hiç vaka bulunamadı</h3>
          <p style={{ color: 'var(--text-muted)' }}>Seçtiğiniz filtrelere uygun çözülmüş bir vaka kaydı yok.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.2rem', marginBottom: '2.5rem' }}>
            {cases.map((c, index) => (
              <div 
                key={c.id} 
                style={{ 
                  background: 'var(--glass-bg)', 
                  border: '1px solid var(--glass-border)',
                  borderLeft: c.isSolved ? '4px solid var(--success, #10b981)' : '4px solid var(--warning, #f59e0b)',
                  borderRadius: '16px', 
                  padding: '1.5rem',
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  animation: `slideLeft ${(index + 1) * 0.1}s ease-out`
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateX(5px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-float)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    <span style={{ 
                      padding: '0.2rem 0.8rem', 
                      background: 'rgba(14, 165, 233, 0.1)', 
                      color: '#0ea5e9', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem', 
                      fontWeight: 800 
                    }}>
                      DÖNEM {c.departmentYear}
                    </span>
                    <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                      {c.departmentName}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    {c.caseTitle}
                  </h4>
                  <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={14} /> 
                      {new Date(c.solvedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end', color: c.isSolved ? 'var(--success, #10b981)' : 'var(--warning, #f59e0b)', fontWeight: 800, fontSize: '1.1rem' }}>
                      {c.isSolved ? <CheckCircle2 size={20} /> : <Activity size={20} />}
                      <span>{c.isSolved ? 'Başarılı' : 'Yarıda Bırakıldı'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                      <Trophy size={14} color="var(--primary)" />
                      Kazanılan: <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>+{c.earnedPoints} Puan</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                style={{ 
                  padding: '0.8rem', borderRadius: '50%', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                  color: page === 1 ? 'var(--text-muted)' : 'var(--text-main)',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { if(page !== 1) e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { if(page !== 1) { e.currentTarget.style.background = 'var(--glass-bg)'; e.currentTarget.style.color = 'var(--text-main)'; } }}
              >
                <ChevronLeft size={20} />
              </button>
              
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                Sayfa {page} / {totalPages}
              </span>

              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                style={{ 
                  padding: '0.8rem', borderRadius: '50%', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                  color: page === totalPages ? 'var(--text-muted)' : 'var(--text-main)',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { if(page !== totalPages) e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { if(page !== totalPages) { e.currentTarget.style.background = 'var(--glass-bg)'; e.currentTarget.style.color = 'var(--text-main)'; } }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
