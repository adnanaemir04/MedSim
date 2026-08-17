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

type ViewState = 'dashboard' | 'simulation' | 'leaderboard' | 'profile' | 'past_cases';

export default function Home() {
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

  if (!isAuthenticated) {
    return <AuthForm onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar />
      <div className="app-layout">
        <Sidebar 
          user={user as any} 
          onLogout={() => setIsAuthenticated(false)}
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
                  await fetch('http://localhost:5211/api/Auth/updateProfile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: user.email, nickname: user.nickname, avatar: user.avatar, points: newPoints })
                  });
                } catch (e) {
                  console.error("Failed to save points", e);
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
        </div>
      </div>
    </div>
  );
}
