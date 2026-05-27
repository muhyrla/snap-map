import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './contexts/AuthContext';
import Onboarding from './pages/Onboarding';
import FeedScreen from './pages/FeedScreen';
import { QuestsListScreen, QuestDetailScreen } from './pages/QuestsScreen';
import { Header, BottomNav, Toast, TabId } from './components/Shell';
import { AppUser, defaultUser, notifications as initNotifs, feedPosts as initPosts, Notification, FeedPost } from './data';
import { getStats, StatsResponse } from './services/statsService';
import { QuestDto, skipQuest, rerollQuest, getRerolls } from './services/questsService';
import './styles/style.scss';

const RankPlaceholder   = () => <div className="scroll"><div className="page-pad" style={{ color: 'var(--gray)', paddingTop: 40, textAlign: 'center' }}>Рейтинг — в разработке</div></div>;
const MarketPlaceholder = () => <div className="scroll"><div className="page-pad" style={{ color: 'var(--gray)', paddingTop: 40, textAlign: 'center' }}>Маркет — в разработке</div></div>;

export default function App() {
  const { isLoading, onboarded, backendUser, initDataRaw } = useAuth();

  const [user, setUser] = useState<AppUser>(() => {
    const stored = localStorage.getItem('snapmap_user');
    return stored ? { ...defaultUser, ...JSON.parse(stored) } : defaultUser;
  });
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [tab, setTab] = useState<TabId>('feed');
  const [posts, setPosts] = useState<FeedPost[]>(initPosts);
  const [notifs, setNotifs] = useState<Notification[]>(initNotifs);
  const [toast, setToast] = useState<string | null>(null);
  const [questDetail, setQuestDetail] = useState<QuestDto | null>(null);
  const [rerollsLeft, setRerollsLeft] = useState(3);

  useEffect(() => {
    localStorage.setItem('snapmap_user', JSON.stringify(user));
  }, [user]);

  // Данные с бэкенда
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

  // Статистика с бэкенда
  useEffect(() => {
    if (!initDataRaw || !onboarded) return;
    getStats(initDataRaw).then(setStats).catch(() => {});
    getRerolls(initDataRaw).then(r => setRerollsLeft(r.rerollsLeft)).catch(() => {});
  }, [initDataRaw, onboarded]);

  const handleReroll = useCallback(async (q: QuestDto): Promise<QuestDto | null> => {
    if (!initDataRaw) return null;
    try {
      const next = await rerollQuest(initDataRaw, q.id);
      showToast(`Сменили на «${next.name}»`);
      return next;
    } catch {
      showToast('Реролов не осталось');
      return null;
    }
  }, [initDataRaw]); // eslint-disable-line

  const handleSkip = useCallback(async (q: QuestDto) => {
    if (initDataRaw) await skipQuest(initDataRaw, q.id).catch(() => {});
    setQuestDetail(null);
    showToast(`Квест «${q.name}» пропущен`);
  }, [initDataRaw]); // eslint-disable-line

  const showToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(null), 2400);
  };

  const unreadCount = notifs.filter(n => !n.read).length;
  const dailyProgress = Math.min(1, (user.dailyDone || 0) / (user.dailyTotal || 4));

  const handleLike = (id: number) => {
    setPosts(ps => ps.map(p => p.id === id
      ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) }
      : p
    ));
  };

  const handleTabChange = (id: TabId) => {
    if (id === 'snap') {
      showToast('Камера — в разработке');
      return;
    }
    setTab(id);
  };

  const renderScreen = () => {
    switch (tab) {
      case 'feed':
        return (
          <FeedScreen
            streak={stats?.streak ?? user.streak}
            questsDone={stats ? Number(stats.quests_done) : user.questsDone}
            dailyCount={stats ? Number(stats.daily_count) : user.dailyCount}
            posts={posts}
            onLike={handleLike}
            onRefresh={() => showToast('Лента обновлена')}
          />
        );
      case 'rank':   return <RankPlaceholder/>;
      case 'quests':
        return questDetail ? (
          <QuestDetailScreen
            q={questDetail}
            rerollsLeft={rerollsLeft}
            initData={initDataRaw}
            onBack={() => setQuestDetail(null)}
            onShoot={() => showToast('Камера — в разработке')}
            onReroll={handleReroll}
            onSkip={handleSkip}
          />
        ) : (
          <QuestsListScreen
            initData={initDataRaw}
            dailyDone={stats?.daily_done ? Number(stats.daily_done) : user.dailyDone}
            dailyTotal={stats?.daily_total ?? user.dailyTotal}
            onOpen={setQuestDetail}
          />
        );
      case 'market': return <MarketPlaceholder/>;
      default:       return null;
    }
  };

  if (isLoading) return null;
  if (!onboarded) return <Onboarding/>;

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
