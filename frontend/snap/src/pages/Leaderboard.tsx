import { Header } from '../components/Header';
import { Headline } from '../components/Headline';
import { Tabbar } from '../components/Tabbar';
import { useAuth } from '../contexts/AuthContext';
import '../styles/style.scss';
import '../styles/leaderboard.css';

export default function Leaderboard() {
  const { user, logout } = useAuth();
  
  const displayName = user 
    ? (user.username || `${user.firstName} ${user.lastName || ''}`.trim() || 'Пользователь')
    : 'Пользователь';

  const handleSettings = () => {
    if (window.confirm('Вы действительно хотите выйти?')) {
      logout();
    }
  };

  const leaders = [
    { rank: 1, name: 'Ник', snaps: 100 },
    { rank: 2, name: 'Никки', snaps: 100 },
    { rank: 3, name: 'Николай', snaps: 100 },
    { rank: 4, name: 'Никита', snaps: 100 },
    { rank: 5, name: 'Никс', snaps: 100 },
    { rank: 6, name: 'Николь', snaps: 100 },
    { rank: 7, name: 'Никсель', snaps: 100 },
    { rank: 8, name: 'Никкис', snaps: 100 },
    { rank: 9, name: 'Николетта', snaps: 100 },
  ];

  return (
    <main className="screen">
      <Header username={displayName} balance="10.000$" onSettings={handleSettings} />

      <Headline
        title="Двигайся к цели"
        subtitle="или тебя обгонят"
      />

      <div className="headline-description">
        <p>бахай эти фотокарточки а</p>
        <p>мы потом придумаем зачем</p>
      </div>

      <div className="leaderboard-tabs">
        <button className="leaderboard-tab leaderboard-tab--active">GLOBAL</button>
        <button className="leaderboard-tab">LOCAL</button>
      </div>

      <div className="leaderboard-stats">
        <span>110203 фотографируют</span>
        <span>Всего заработано</span>
      </div>

      <div className="leaderboard-user-row">
        <span className="leaderboard-user-rank">100+</span>
        <span className="leaderboard-user-label">ты</span>
        <span className="leaderboard-user-snaps">100 снэпов</span>
      </div>

      <div className="leaderboard-list">
        {leaders.map((leader) => (
          <div key={leader.rank} className="leaderboard-item">
            <span className="leaderboard-rank">{leader.rank}</span>
            <span className="leaderboard-name">{leader.name}</span>
            <span className="leaderboard-snaps">{leader.snaps} снэпов</span>
          </div>
        ))}
      </div>

      <Tabbar active="home" />
    </main>
  );
}

