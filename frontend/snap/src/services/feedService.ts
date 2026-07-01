import { FeedPost } from '../data';

const API_BASE = process.env.REACT_APP_API_URL ?? '';

/**
 * Загружает ленту подтверждённых снимков с бэкенда.
 * Бросает ошибку при сбое запроса — экран сам покажет нужное состояние.
 */
export async function getFeed(limit = 30): Promise<FeedPost[]> {
  const res = await fetch(`${API_BASE}/api/feed?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch feed');
  return res.json();
}
