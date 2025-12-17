export interface FeedPost {
  id: string;
  username: string;
  tag?: string;
  text?: string;
  imageUrl?: string;
}

// Моки данных ленты
const FEED_MOCK: FeedPost[] = [
  {
    id: '1',
    username: 'Пользователь',
    tag: 'Синий цветок',
    text: 'Описание пызыщдадывазд выывадываывыждадывадывыжыж адлыыжвал',
    imageUrl: '/posti/post1.jpeg',
  },
  {
    id: '2',
    username: 'Пользователь',
    tag: 'Красный цветок',
    text: 'Ещё один тестовый пост для ленты.',
    imageUrl: '/posti/post2.jpeg',
  },
];

/**
 * Получить данные ленты
 * Сейчас возвращает моки, позже можно заменить на реальный API вызов
 */
export async function getFeed(): Promise<FeedPost[]> {
  // TODO: Заменить на реальный API вызов
  // Пример:
  // const response = await fetch('/api/feed');
  // return response.json();
  
  return Promise.resolve(FEED_MOCK);
}

