import { Header } from '../components/Header';
import { Headline } from '../components/Headline';
import { ShopItem } from '../components/ShopItem';
import { Tabbar } from '../components/Tabbar';
import { useAuth } from '../contexts/AuthContext';
import '../styles/style.scss';
import '../styles/shop.css';

export default function Shop() {
  const { user, logout } = useAuth();
  
  const displayName = user 
    ? (user.username || `${user.firstName} ${user.lastName || ''}`.trim() || 'Пользователь')
    : 'Пользователь';

  const handleSettings = () => {
    if (window.confirm('Вы действительно хотите выйти?')) {
      logout();
    }
  };

  const handleHome = () => {
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const shopItems = [
    {
      id: 1,
      title: 'стим ключ ура',
      description: 'бахай эти фотокарточки а мы потом придумаем зачем',
      price: '500 SNS',
      imageUrl: undefined,
    },
    {
      id: 2,
      title: 'стим ключ ура',
      description: 'бахай эти фотокарточки а мы потом придумаем зачем',
      price: '500 SNS',
      imageUrl: undefined,
    },
    {
      id: 3,
      title: 'стим ключ ура',
      description: 'бахай эти фотокарточки а мы потом придумаем зачем',
      price: '500 SNS',
      imageUrl: undefined,
    },
    {
      id: 4,
      title: 'стим ключ ура',
      description: 'бахай эти фотокарточки а мы потом придумаем зачем',
      price: '500 SNS',
      imageUrl: undefined,
    },
  ];

  const handleBuy = (itemId: number) => {
    console.log('Покупка товара:', itemId);
    // Здесь будет логика покупки
  };

  return (
    <main className="screen">
      <Header username={displayName} balance="10.000$" onSettings={handleSettings} />

      <Headline
        title="мама покупаай таксии"
        subtitle="бахай эти фотокарточки а мы потом придумаем зачем"
      />

      <section className="row gap10 mt10">
        <div className="card stat">
          <div className="small">заданий<br/>выполнено:</div>
          <div className="stat__value">70</div>
        </div>
        <div className="card stat">
          <div className="small">Daily<br/>счётчик:</div>
          <div className="stat__value">2</div>
        </div>
      </section>

      <div className="hr" />

      <div className="shop-list">
        {shopItems.map((item) => (
          <ShopItem
            key={item.id}
            title={item.title}
            description={item.description}
            price={item.price}
            imageUrl={item.imageUrl}
            onBuy={() => handleBuy(item.id)}
          />
        ))}
      </div>

      <Tabbar active="shop" onHome={handleHome} />
    </main>
  );
}

