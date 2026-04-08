import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Headline } from '../components/Headline';
import { ShopItem } from '../components/ShopItem';
import { useAuth } from '../contexts/AuthContext';
import { getShopItems, getShopStats, buyItem, ShopItem as ShopItemType, ShopStats } from '../services/shopService';
import '../styles/style.scss';

export default function Shop() {
  const { user, logout } = useAuth();
  const [shopItems, setShopItems] = useState<ShopItemType[]>([]);
  const [shopStats, setShopStats] = useState<ShopStats | null>(null);
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
    Promise.all([getShopItems(), getShopStats()]).then(([items, stats]) => {
      setShopItems(items);
      setShopStats(stats);
      setIsLoading(false);
    });
  }, []);

  const handleBuy = async (itemId: number) => {
    try {
      const result = await buyItem(itemId);
      if (result.success) {
        alert(result.message || 'Товар успешно куплен!');
        // Можно обновить список товаров или баланс пользователя
      } else {
        alert(result.message || 'Ошибка при покупке товара');
      }
    } catch (error) {
      console.error('Ошибка покупки:', error);
      alert('Произошла ошибка при покупке товара');
    }
  };

  if (isLoading) {
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

        <section className="headline">
          <p className="subtitle">
            <span className="subtitle--bold">Двигайся к цели</span> или тебя обгонят
          </p>
        </section>
      </div>

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
    </main>
  );
}

