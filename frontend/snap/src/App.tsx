import { useState } from 'react';
import Home from './pages/Home';
import QuestsPage from './pages/QuestsPage';
import Tabbar from './components/Tabbar';
import './styles/style.scss';

export default function App() {
  const [screen, setScreen] = useState<'home' | 'quests'>('home');
  return (
    <div className="app-container">
      {screen === 'home' ? <Home /> : <QuestsPage />}
      <Tabbar screen={screen} setScreen={setScreen} />
    </div>
  );
}
