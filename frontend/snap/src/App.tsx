import { useState } from 'react';
import Home from './pages/Home';
import QuestsPage from './pages/QuestsPage';
import Leaderboard from './pages/Leaderboard';
import Shop from './pages/Shop';
import Onboarding from './pages/Onboarding';
import Tabbar from './components/Tabbar';
import { useAuth } from './contexts/AuthContext';
import './styles/style.scss';

export default function App() {
  const { isLoading, onboarded } = useAuth();
  const [screen, setScreen] = useState<'home' | 'quests' | 'leaderboard' | 'shop'>('home');

  if (isLoading) return null;
  if (!onboarded) return <Onboarding />;

  const renderScreen = () => {
    switch (screen) {
      case 'home':        return <Home />;
      case 'quests':      return <QuestsPage />;
      case 'leaderboard': return <Leaderboard />;
      case 'shop':        return <Shop />;
      default:            return <Home />;
    }
  };

  return (
    <div className="app-container">
      {renderScreen()}
      <Tabbar screen={screen} setScreen={setScreen} />
    </div>
  );
}
