import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Headline } from '../components/Headline';
import { useAuth } from '../contexts/AuthContext';
import { getLeaderboard, LeaderboardData, LeaderboardUser } from '../services/leaderboardService';
import '../styles/style.scss';

export default function Leaderboard() {
  const { user, logout } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [leaderboardType, setLeaderboardType] = useState<'global' | 'local'>('global');
  const [isLoading, setIsLoading] = useState(true);
  
  const displayName = user 
    ? (user.username || `${user.firstName} ${user.lastName || ''}`.trim() || 'Пользователь')
    : 'Пользователь';

  const handleSettings = () => {
    if (window.confirm('Вы действительно хотите выйти?')) {
      logout();
    }
  };

  useEffect(() => {
    setIsLoading(true);
    getLeaderboard(leaderboardType).then((data) => {
      setLeaderboardData(data);
      setIsLoading(false);
    });
  }, [leaderboardType]);

  const handleTabChange = (type: 'global' | 'local') => {
    setLeaderboardType(type);
  };

  if (isLoading || !leaderboardData) {
    return (
      <main className="screen">
        <div className="screen-header-block">
          <Header />
        </div>
        <div>Загрузка...</div>
      </main>
    );
  }

  return (
    <main className="screen">
      <div className="screen-header-block">
        <Header />

        <div className="leaderboard-toggle">
          <button 
            className={`leaderboard-toggle-btn ${leaderboardType === 'global' ? 'active' : ''}`}
            onClick={() => handleTabChange('global')}
          >
            Глобальный
          </button>
          <button 
            className={`leaderboard-toggle-btn ${leaderboardType === 'local' ? 'active' : ''}`}
            onClick={() => handleTabChange('local')}
          >
            Местный
          </button>
        </div>
      </div>

      <div className="leaderboard-columns">
        <span className="col-left">Место в рейтинге</span>
        <span className="col-right">Кол-во снэпов</span>
      </div>

      {leaderboardData.currentUser && (
        <div className="leaderboard-user-row">
          <div className="leaderboard-user-rank">
            {leaderboardData.currentUser.rank >= 100 ? '100+' : leaderboardData.currentUser.rank}
          </div>
          <span className="leaderboard-user-label">{leaderboardData.currentUser.name}</span>
          <span className="leaderboard-user-snaps">{leaderboardData.currentUser.snaps} снэпов</span>
        </div>
      )}

      <div className="leaderboard-list">
        {leaderboardData.leaders.map((leader) => (
          <div key={leader.rank} className="leaderboard-item">
            <div className={`leaderboard-rank medal-${leader.rank}`}>
              <span className="rank-number">{leader.rank}</span>
            </div>
            <span className="leaderboard-name">{leader.name}</span>
            <span className="leaderboard-snaps">{leader.snaps} снэпов</span>
          </div>
        ))}
      </div>
    </main>
  );
}

