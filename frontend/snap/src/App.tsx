import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import Onboarding from './pages/Onboarding';
import { Header, BottomNav, Toast, TabId } from './components/Shell';
import { AppUser, defaultUser, notifications as initNotifs, feedPosts as initPosts, Notification, FeedPost } from './data';
import './styles/style.scss';

// Stub placeholders — заменяются реальными экранами по одному
const FeedPlaceholder     = () => <div className="scroll"><div className="page-pad" style={{color:'var(--gray)',paddingTop:40,textAlign:'center'}}>Feed — в разработке</div></div>;
const RankPlaceholder     = () => <div className="scroll"><div className="page-pad" style={{color:'var(--gray)',paddingTop:40,textAlign:'center'}}>Рейтинг — в разработке</div></div>;
const QuestsPlaceholder   = () => <div className="scroll"><div className="page-pad" style={{color:'var(--gray)',paddingTop:40,textAlign:'center'}}>Квесты — в разработке</div></div>;
const MarketPlaceholder   = () => <div className="scroll"><div className="page-pad" style={{color:'var(--gray)',paddingTop:40,textAlign:'center'}}>Маркет — в разработке</div></div>;

export default function App() {
  const { isLoading, onboarded, backendUser } = useAuth();

  const [user, setUser] = useState<AppUser>(() => {
    const stored = localStorage.getItem('snapmap_user');
    return stored ? { ...defaultUser, ...JSON.parse(stored) } : defaultUser;
  });

  const [tab, setTab] = useState<TabId>('feed');
  const [posts, setPosts] = useState<FeedPost[]>(initPosts);
  const [notifs, setNotifs] = useState<Notification[]>(initNotifs);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('snapmap_user', JSON.stringify(user));
  }, [user]);

  // Применяем данные с бэкенда когда они приходят
  useEffect(() => {
    if (backendUser) {
      setUser(u => ({
        ...u,
        username: backendUser.tg_username ?? backendUser.tg_fullname ?? u.username,
        city: backendUser.city ?? u.city,
        balance: backendUser.balance,
      }));
    }
  }, [backendUser]);

  const showToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 2400);
  };

  const unreadCount = notifs.filter(n => !n.read).length;
  const dailyProgress = Math.min(1, (user.dailyDone || 0) / (user.dailyTotal || 4));

  const handleTabChange = (id: TabId) => {
    if (id === 'snap') {
      showToast('Камера — в разработке');
      return;
    }
    setTab(id);
  };

  const renderScreen = () => {
    switch (tab) {
      case 'feed':   return <FeedPlaceholder />;
      case 'rank':   return <RankPlaceholder />;
      case 'quests': return <QuestsPlaceholder />;
      case 'market': return <MarketPlaceholder />;
      default:       return <FeedPlaceholder />;
    }
  };

  if (isLoading) return null;
  if (!onboarded) return <Onboarding />;

  return (
    <div className="app-root has-floating-nav">
      <Header
        user={user}
        unread={unreadCount}
        activeQuests={4}
        onBell={() => showToast('Уведомления — в разработке')}
        onGear={() => showToast('Настройки — в разработке')}
        onProfile={() => showToast('Профиль — в разработке')}
      />
      <div className="screen-wrap">
        {renderScreen()}
        {toast && <Toast text={toast}/>}
      </div>
      <BottomNav
        active={tab}
        onChange={handleTabChange}
        activeQuests={4}
        dailyProgress={dailyProgress}
      />
    </div>
  );
}
