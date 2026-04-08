export interface ShopItem {
  id: number;
  title: string;
  description: string;
  price: string;
  priceValue: number; // числовое значение для проверки баланса
  imageUrl?: string;
  category?: string;
}

export interface ShopStats {
  completedQuests: number;
  dailyCounter: number;
}

// Моки данных для магазина
const SHOP_ITEMS_MOCK: ShopItem[] = [
  {
    id: 1,
    title: 'стим ключ ура',
    description: 'бахай эти фотокарточки а мы потом придумаем зачем',
    price: '500 SNS',
    priceValue: 500,
    imageUrl: undefined,
  },
  {
    id: 2,
    title: 'стим ключ ура',
    description: 'бахай эти фотокарточки а мы потом придумаем зачем',
    price: '500 SNS',
    priceValue: 500,
    imageUrl: undefined,
  },
  {
    id: 3,
    title: 'стим ключ ура',
    description: 'бахай эти фотокарточки а мы потом придумаем зачем',
    price: '500 SNS',
    priceValue: 500,
    imageUrl: undefined,
  },
  {
    id: 4,
    title: 'стим ключ ура',
    description: 'бахай эти фотокарточки а мы потом придумаем зачем',
    price: '500 SNS',
    priceValue: 500,
    imageUrl: undefined,
  },
];

const SHOP_STATS_MOCK: ShopStats = {
  completedQuests: 70,
  dailyCounter: 2,
};

export async function getShopItems(): Promise<ShopItem[]> {
  // const response = await fetch('/api/shop/items');
  // return response.json();
  
  return Promise.resolve(SHOP_ITEMS_MOCK);
}

export async function getShopStats(): Promise<ShopStats> {
  // const response = await fetch('/api/shop/stats');
  // return response.json();
  
  return Promise.resolve(SHOP_STATS_MOCK);
}

export async function buyItem(itemId: number): Promise<{ success: boolean; message?: string }> {
  // const response = await fetch('/api/shop/buy', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ itemId }),
  // });
  // return response.json();
  
  // Мок успешной покупки
  console.log('Покупка товара:', itemId);
  return Promise.resolve({ success: true, message: 'Товар успешно куплен!' });
}

