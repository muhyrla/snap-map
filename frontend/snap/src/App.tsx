import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './contexts/AuthContext';
import Onboarding from './pages/Onboarding';
import FeedScreen from './pages/FeedScreen';
import { QuestsListScreen, QuestDetailScreen } from './pages/QuestsScreen';
import LeaderboardScreen from './pages/Leaderboard';
import MarketScreen from './pages/MarketScreen';
import SnapFlow from './pages/SnapFlow';
import { Header, BottomNav, Toast, TabId } from './components/Shell';
import { AppUser, defaultUser, notifications as initNotifs, feedPosts as initPosts, Notification, FeedPost } from './data';
import { getStats, StatsResponse } from './services/statsService';
import { getFeed } from './services/feedService';
import { QuestDto, skipQuest, rerollQuest, getRerolls } from './services/questsService';
import { ShopItemDto, PurchaseDto } from './services/shopService';
import './styles/style.scss';

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
  const [snapQuest, setSnapQuest] = useState<QuestDto | null>(null);
  const [questsVersion, setQuestsVersion] = useState(0);

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

  // Лента с бэкенда
  const loadFeed = useCallback(() => {
    getFeed().then(setPosts).catch(() => {});
  }, []);

  useEffect(() => { loadFeed(); }, [loadFeed]);

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

  const handleSnapSuccess = useCallback((q: QuestDto) => {
    setSnapQuest(null);
    setQuestDetail(null);
    showToast(`Квест «${q.name}» засчитан! +${q.reward}`);
    // Обновляем баланс сразу (оптимистично) и подтягиваем статы/квесты с бэка
    setUser(u => ({ ...u, balance: u.balance + q.reward }));
    setQuestsVersion(v => v + 1);
    if (initDataRaw) {
      getStats(initDataRaw).then(setStats).catch(() => {});
    }
    loadFeed();
  }, [initDataRaw, loadFeed]); // eslint-disable-line

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
      // Центральная кнопка: если открыт квест — снимаем его, иначе ведём на список квестов
      if (questDetail) {
        setSnapQuest(questDetail);
      } else {
        setTab('quests');
      }
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
            onRefresh={() => { loadFeed(); showToast('Лента обновлена'); }}
          />
        );
      case 'rank':   return <LeaderboardScreen/>;
      case 'quests':
        return questDetail ? (
          <QuestDetailScreen
            q={questDetail}
            rerollsLeft={rerollsLeft}
            initData={initDataRaw}
            onBack={() => setQuestDetail(null)}
            onShoot={(q) => setSnapQuest(q)}
            onReroll={handleReroll}
            onSkip={handleSkip}
          />
        ) : (
          <QuestsListScreen
            key={questsVersion}
            initData={initDataRaw}
            dailyDone={stats?.daily_done ? Number(stats.daily_done) : user.dailyDone}
            dailyTotal={stats?.daily_total ?? user.dailyTotal}
            onOpen={setQuestDetail}
          />
        );
      case 'market':
        return (
          <MarketScreen
            balance={user.balance}
            initData={initDataRaw}
            onPurchase={(_item: ShopItemDto, _result: PurchaseDto) => {
              setUser(u => ({ ...u, balance: u.balance - _item.price }));
            }}
          />
        );
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
      {snapQuest && (
        <SnapFlow
          quest={snapQuest}
          initData={initDataRaw}
          onClose={() => setSnapQuest(null)}
          onSuccess={handleSnapSuccess}
        />
      )}
      <BottomNav
        active={tab}
        onChange={handleTabChange}
        activeQuests={4}
        dailyProgress={dailyProgress}
      />
    </div>
  );
}
