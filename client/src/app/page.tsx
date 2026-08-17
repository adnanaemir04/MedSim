'use client';

import { useState } from 'react';
import AuthForm from '../presentation/components/auth/AuthForm';
import Sidebar from '../presentation/components/layout/Sidebar';
import TopBar from '../presentation/components/layout/TopBar';
import Dashboard from '../presentation/components/dashboard/Dashboard';
import SimulationView from '../presentation/components/simulation/SimulationView';
import Profile from '../presentation/components/profile/Profile';

type ViewState = 'dashboard' | 'simulation' | 'leaderboard' | 'profile';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  
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
            <Dashboard onStartCase={() => setCurrentView('simulation')} />
          )}
          
          {currentView === 'simulation' && (
            <SimulationView onBack={() => setCurrentView('dashboard')} />
          )}

          {currentView === 'leaderboard' && (
            <main className="glass-panel">
              <h2>Liderlik Tablosu</h2>
              <p>Yapım aşamasında...</p>
            </main>
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
