import { getFeed, FeedPost } from './feedService';

describe('feedService', () => {
  // ─── Позитивные тесты ────────────────────────────────────────────────────

  test('getFeed() возвращает непустой массив постов', async () => {
    const posts = await getFeed();
    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBeGreaterThan(0);
  });

  test('каждый пост содержит поля id и username', async () => {
    const posts = await getFeed();
    posts.forEach((post: FeedPost) => {
      expect(post).toHaveProperty('id');
      expect(post).toHaveProperty('username');
    });
  });

  test('первый пост имеет id="1" и username="Пользователь"', async () => {
    const posts = await getFeed();
    expect(posts[0].id).toBe('1');
    expect(posts[0].username).toBe('Пользователь');
  });

  test('посты содержат теги (tag)', async () => {
    const posts = await getFeed();
    posts.forEach((post: FeedPost) => {
      expect(post.tag).toBeTruthy();
    });
  });

  // ─── Негативные тесты ────────────────────────────────────────────────────

  test('(негативный) массив постов не пустой — проверка через not.toHaveLength(0)', async () => {
    const posts = await getFeed();
    expect(posts).not.toHaveLength(0);
  });

  test('(негативный) поля id и username у каждого поста определены (не undefined)', async () => {
    const posts = await getFeed();
    posts.forEach((post: FeedPost) => {
      expect(post.id).not.toBeUndefined();
      expect(post.username).not.toBeUndefined();
    });
  });
});
