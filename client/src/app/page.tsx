'use client';

import { useState } from 'react';
import AuthForm from '../presentation/components/auth/AuthForm';
import Sidebar from '../presentation/components/layout/Sidebar';
import Dashboard from '../presentation/components/dashboard/Dashboard';
import SimulationView from '../presentation/components/simulation/SimulationView';

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
          <main className="glass-panel">
            <h2>Profilim</h2>
            <p>Yapım aşamasında...</p>
          </main>
        )}
      </div>
    </div>
  );
}
