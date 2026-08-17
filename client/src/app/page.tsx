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

type ViewState = 'dashboard' | 'simulation' | 'leaderboard' | 'profile' | 'past_cases' | 'subscription';

export default function Home() {
  const [isLanding, setIsLanding] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [selectedCase, setSelectedCase] = useState<{subject: string, index: number, data?: any} | null>(null);
  const [filterSubject, setFilterSubject] = useState<string | undefined>();
  
  // Mock user for testing UI until we fully connect Redux/Context
  const [user, setUser] = useState({
    email: 'test@test.com',
    nickname: 'Dr. John Doe',
    points: 120,
    avatar: '👨‍⚕️',
    solvedCases: []
  });

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsLanding(true);
  };

  if (isLanding && !isAuthenticated) {
    return (
      <LandingPage 
        onNavigateToAuth={(mode) => {
          setAuthMode(mode);
          setIsLanding(false);
        }} 
      />
    );
  }

  if (!isLanding && !isAuthenticated) {
    return (
      <AuthForm 
        initialMode={authMode}
        onLoginSuccess={() => setIsAuthenticated(true)} 
        onBackToLanding={() => setIsLanding(true)}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar 
        onNavigate={(view) => {
          if (view === 'subscription' || view === 'dashboard') {
            setCurrentView(view as any);
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
              filterSubject={filterSubject}
              onStartCase={(subject, index, data) => {
                setSelectedCase({ subject, index, data });
                setCurrentView('simulation');
              }} 
            />
          )}
          
          {currentView === 'simulation' && selectedCase && (
            <SimulationView 
              subject={selectedCase.subject}
              caseIndex={selectedCase.index}
              generatedData={selectedCase.data}
              onBack={() => setCurrentView('dashboard')} 
              onCaseComplete={async (points) => {
                const newPoints = user.points + points;
                setUser({ ...user, points: newPoints, solvedCases: [...user.solvedCases, "case_completed"] as any });
                try {
                  // Update points
                  await fetch('http://localhost:5211/api/Auth/updateProfile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email, nickname: user.nickname, avatar: user.avatar, points: newPoints })
                  });

                  // Save solved case
                  if (selectedCase.data?.id) {
                    await fetch('http://localhost:5211/api/Profile/solve-case', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        email: user.email, 
                        medicalCaseId: selectedCase.data.id,
                        points: points 
                      })
                    });
                  }
                } catch (e) {
                  console.error("Failed to save points or solved case", e);
                }
              }}
            />
          )}

          {currentView === 'leaderboard' && (
            <Leaderboard />
          )}

          {currentView === 'past_cases' && (
            <PastCases userEmail={user.email} />
          )}

          {currentView === 'profile' && (
            <Profile 
              user={user} 
              onUpdate={(updatedUser) => setUser({ ...user, ...updatedUser })} 
              onLogout={handleLogout} 
            />
          )}

          {currentView === 'subscription' && (
            <SubscriptionPage />
          )}
        </div>
      </div>
    </div>
  );
}
