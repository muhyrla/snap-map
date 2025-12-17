import './App.css';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Leaderboard from './pages/Leaderboard';
import Home from './pages/Home';
import Shop from './pages/Shop';

function AppContent() {
  const { isLoading } = useAuth();
  const [route, setRoute] = useState<string>(window.location.pathname || '/');

  useEffect(() => {
    const onPop = () => setRoute(window.location.pathname || '/');
    window.addEventListener('popstate', onPop);
    // Также слушаем кастомные события для навигации через Tabbar
    const onRouteChange = () => setRoute(window.location.pathname || '/');
    window.addEventListener('popstate', onRouteChange);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('popstate', onRouteChange);
    };
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

  if (route === '/shop') {
    return <Shop />;
  }

  if (isLoading) {
    return (
      <main className="screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Загрузка...</div>
      </main>
    );
  }

  // Default route is home
  return <Home />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
