'use client';

import { useState } from 'react';
import AuthForm from '../presentation/components/auth/AuthForm';
import Sidebar from '../presentation/components/layout/Sidebar';
import TopBar from '../presentation/components/layout/TopBar';
import Dashboard from '../presentation/components/dashboard/Dashboard';
import SimulationView from '../presentation/components/simulation/SimulationView';
import Profile from '../presentation/components/profile/Profile';
import Leaderboard from '../presentation/components/leaderboard/Leaderboard';

type ViewState = 'dashboard' | 'simulation' | 'leaderboard' | 'profile';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [selectedCase, setSelectedCase] = useState<{subject: string, index: number} | null>(null);
  
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
          user={user} 
          onLogout={handleLogout} 
          onNavigate={(view) => setCurrentView(view)} 
        />

        <div className="main-content">
          {currentView === 'dashboard' && (
            <Dashboard onStartCase={(subject, index) => {
              setSelectedCase({ subject, index });
              setCurrentView('simulation');
            }} />
          )}
          
          {currentView === 'simulation' && selectedCase && (
            <SimulationView 
              subject={selectedCase.subject}
              caseIndex={selectedCase.index}
              onBack={() => setCurrentView('dashboard')} 
              onCaseComplete={async (points) => {
                const newPoints = user.points + points;
                setUser({ ...user, points: newPoints, solvedCases: [...user.solvedCases, "case_completed"] as any });
                // Note: Normally we'd call the API here to save progress
              }}
            />
          )}

          {currentView === 'leaderboard' && (
            <Leaderboard />
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
