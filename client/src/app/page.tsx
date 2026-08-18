'use client';

import { useState } from 'react';
import AuthForm from '../presentation/components/auth/AuthForm';
import Sidebar from '../presentation/components/layout/Sidebar';
import TopBar from '../presentation/components/layout/TopBar';
import Dashboard from '../presentation/components/dashboard/Dashboard';
import SimulationView from '../presentation/components/simulation/SimulationView';
import Profile from '../presentation/components/profile/Profile';
import Leaderboard from '../presentation/components/leaderboard/Leaderboard';
import PastCases from '../presentation/components/profile/PastCases';
import LandingPage from '../presentation/components/landing/LandingPage';
import SubscriptionPage from '../presentation/components/subscription/SubscriptionPage';
import TusCenter from '../presentation/components/tus/TusCenter';
import TusAboutView from '../presentation/components/tus/TusAboutView';
import TusSolveView from '../presentation/components/tus/TusSolveView';
import { ArrowLeft } from 'lucide-react';
import { updateUserProfile, solveCase } from '../infrastructure/api/simulationApi';

type ViewState = 'dashboard' | 'simulation' | 'leaderboard' | 'profile' | 'past_cases' | 'subscription' | 'tus' | 'tus_about' | 'tus_solve';

export default function Home() {
  const [isLanding, setIsLanding] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [selectedCase, setSelectedCase] = useState<{subject: string, index: number, data?: any, initialAnswers?: number[]} | null>(null);
  const [selectedTusSolve, setSelectedTusSolve] = useState<{subject: string, count: number, mode: 'classic' | 'ai', difficulty?: string} | null>(null);
  const [filterSubject, setFilterSubject] = useState<string | undefined>();
  
  const [user, setUser] = useState<any>({
    email: '',
    nickname: '',
    points: 0,
    avatar: '👨‍⚕️',
    solvedCases: []
  });

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsLanding(true);
    setUser({
      email: '',
      nickname: '',
      points: 0,
      avatar: '👨‍⚕️',
      solvedCases: []
    });
  };

  if (isLanding) {
    return (
      <LandingPage 
        isAuthenticated={isAuthenticated}
        onNavigateToAuth={(mode) => {
          setAuthMode(mode);
          setIsLanding(false);
        }} 
        onNavigateToDashboard={() => {
          setIsLanding(false);
          setCurrentView('dashboard');
        }}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthForm 
        initialMode={authMode}
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          setIsAuthenticated(true);
        }} 
        onBackToLanding={() => setIsLanding(true)}
      />
    );
  }

  if (currentView === 'simulation' && selectedCase) {
    return (
      <div style={{ width: '100vw', minHeight: '100vh', background: 'var(--bg-main)', padding: '3rem 1.5rem', overflowY: 'auto' }}>
        <SimulationView 
          subject={selectedCase.subject}
          caseIndex={selectedCase.index}
          generatedData={selectedCase.data}
          initialAnswers={selectedCase.initialAnswers}
          onBack={() => setCurrentView('dashboard')} 
          onCaseComplete={async (points, givenAnswers) => {
            try {
              let updatedPoints = user.points;
              if (selectedCase.data?.id) {
                const res = await solveCase(user.email, selectedCase.data.id, points, givenAnswers);
                if (res && res.points !== undefined) {
                  updatedPoints = res.points;
                }
              }
              setUser({ ...user, points: updatedPoints, solvedCases: [...user.solvedCases, "case_completed"] as any });
            } catch (e) {
              console.error("Failed to save points or solved case", e);
            }
          }}
        />
      </div>
    );
  }

  if (currentView === 'tus_solve' && selectedTusSolve) {
    return (
      <div style={{ width: '100vw', minHeight: '100vh', background: 'var(--bg-main)', padding: '1rem 2rem', overflowY: 'auto' }}>
        <TusSolveView 
          subject={selectedTusSolve.subject}
          count={selectedTusSolve.count}
          mode={selectedTusSolve.mode}
          difficulty={selectedTusSolve.difficulty}
          userEmail={user.email}
          onBack={() => setCurrentView('tus')}
          onCorrectAnswer={(newPoints) => {
            setUser((prev: any) => prev ? { ...prev, points: newPoints } : prev);
          }}
        />
      </div>
    );
  }

  if (currentView === 'subscription') {
    return (
      <div style={{ width: '100vw', minHeight: '100vh', background: 'var(--bg-main)', padding: '3rem 1.5rem', overflowY: 'auto', position: 'relative' }}>
        {/* Back Button */}
        <div style={{ position: 'absolute', left: '2.5rem', top: '2rem' }}>
          <button 
            onClick={() => setCurrentView('dashboard')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', 
              color: 'var(--text-main)', cursor: 'pointer', fontSize: '0.9rem', 
              padding: '0.6rem 1.2rem', borderRadius: '30px', transition: 'all 0.2s', 
              fontWeight: 600, backdropFilter: 'blur(8px)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            <ArrowLeft size={16} /> Geri Dön
          </button>
        </div>
        <SubscriptionPage />
      </div>
    );
  }

  if (currentView === 'tus_about') {
    return (
      <div style={{ width: '100vw', minHeight: '100vh', background: 'var(--bg-main)', padding: '3rem 1.5rem', overflowY: 'auto' }}>
        <TusAboutView onBack={() => setCurrentView('tus')} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar 
        onNavigate={(view) => {
          if (view === 'landing') {
            setIsLanding(true);
            return;
          }
          if (view === 'subscription' || view === 'dashboard') {
            setCurrentView(view as any);
            if (view === 'dashboard') {
              setFilterSubject(undefined);
            }
          }
        }} 
      />
      <div className="app-layout">
        <Sidebar 
          user={user as any} 
          onLogout={handleLogout}
          onNavigate={(view, subjectFilter) => {
            setCurrentView(view);
            setFilterSubject(subjectFilter);
          }}
        />

        <div className="main-content">
          {currentView === 'dashboard' && (
            <Dashboard 
              userEmail={user.email}
              filterSubject={filterSubject}
              onStartCase={(subject, index, data, initialAnswers) => {
                setSelectedCase({ subject, index, data, initialAnswers });
                setCurrentView('simulation');
              }} 
            />
          )}
          


          {currentView === 'leaderboard' && (
            <Leaderboard />
          )}

          {currentView === 'past_cases' && (
            <PastCases 
              userEmail={user.email} 
              onStartCase={(subject, index, data, initialAnswers) => {
                setSelectedCase({ subject, index, data, initialAnswers });
                setCurrentView('simulation');
              }}
            />
          )}

          {currentView === 'profile' && (
            <Profile 
              user={user} 
              onUpdate={(updatedUser) => setUser({ ...user, ...updatedUser })} 
              onLogout={handleLogout} 
            />
          )}



          {currentView === 'tus' && (
            <TusCenter 
              userEmail={user.email} 
              onNavigateToAbout={() => setCurrentView('tus_about')}
              onNavigateToSolve={(subject, count, mode, difficulty) => {
                setSelectedTusSolve({ subject, count, mode, difficulty });
                setCurrentView('tus_solve');
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
