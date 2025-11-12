import './App.css';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Leaderboard from './pages/Leaderboard';
import Home from './pages/Home';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [route, setRoute] = useState<string>(window.location.pathname || '/');

  useEffect(() => {
    const onPop = () => setRoute(window.location.pathname || '/');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

    const navigate = (path: string) => {
    if (path !== window.location.pathname) {
      // use window.history to satisfy linter
      window.history.pushState({}, '', path);
      setRoute(path);
    }
  };

  // If user explicitly opened /leaderboard, show it regardless of auth for preview
  if (route === '/leaderboard') {
    return (
      <main className="screen">
        <div style={{ padding: 12 }}>
          <button onClick={() => navigate('/')}>← Назад</button>
        </div>
        <Leaderboard />
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Загрузка...</div>
      </main>
    );
  }

  // With automatic auth enabled in AuthProvider, we expect isAuthenticated to become true
  // once init completes. If not authenticated, fall back to Home (no manual authorize page).

  return (
    <main className="screen">
      <div style={{ position: 'absolute', top: 8, right: 12 }}>
        <button onClick={() => navigate('/leaderboard')} style={{ padding: '6px 10px' }}>
          Открыть Leaderboard
        </button>
      </div>
      <Home />
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}