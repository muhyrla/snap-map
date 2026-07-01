import { FeedPost, feedPosts as feedMock } from '../data';

const API_BASE = process.env.REACT_APP_API_URL ?? '';

/**
 * Загружает ленту подтверждённых снимков с бэкенда.
 * При ошибке/пустом ответе возвращает мок из data.ts, чтобы экран не был пустым.
 */
export async function getFeed(limit = 30): Promise<FeedPost[]> {
  try {
    const res = await fetch(`${API_BASE}/api/feed?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch feed');
    const data: FeedPost[] = await res.json();
    return data.length > 0 ? data : feedMock;
  } catch {
    return feedMock;
  }
}
