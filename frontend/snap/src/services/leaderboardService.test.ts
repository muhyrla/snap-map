import { getLeaderboard, LeaderboardUser } from './leaderboardService';

describe('leaderboardService', () => {
  // ─── Позитивные тесты ────────────────────────────────────────────────────

  test('getLeaderboard() возвращает объект с полем leaders (массив)', async () => {
    const data = await getLeaderboard();
    expect(data).toHaveProperty('leaders');
    expect(Array.isArray(data.leaders)).toBe(true);
  });

  test('leaders содержит 9 лидеров', async () => {
    const { leaders } = await getLeaderboard();
    expect(leaders).toHaveLength(9);
  });

  test('первый лидер: rank=1, name="Ник", snaps=100', async () => {
    const { leaders } = await getLeaderboard();
    expect(leaders[0].rank).toBe(1);
    expect(leaders[0].name).toBe('Ник');
    expect(leaders[0].snaps).toBe(100);
  });

  test('currentUser: rank=100, name="ты"', async () => {
    const { currentUser } = await getLeaderboard();
    expect(currentUser).not.toBeNull();
    expect(currentUser!.rank).toBe(100);
    expect(currentUser!.name).toBe('ты');
  });

  test('stats.totalUsers = 110203', async () => {
    const { stats } = await getLeaderboard();
    expect(stats.totalUsers).toBe(110203);
  });

  test('работает с параметром "global"', async () => {
    const data = await getLeaderboard('global');
    expect(data).toHaveProperty('leaders');
    expect(Array.isArray(data.leaders)).toBe(true);
  });

  test('работает с параметром "local"', async () => {
    const data = await getLeaderboard('local');
    expect(data).toHaveProperty('leaders');
    expect(Array.isArray(data.leaders)).toBe(true);
  });

  test('лидеры упорядочены по возрастанию rank', async () => {
    const { leaders } = await getLeaderboard();
    for (let i = 1; i < leaders.length; i++) {
      expect(leaders[i].rank).toBeGreaterThan(leaders[i - 1].rank);
    }
  });

  // ─── Негативные тесты ────────────────────────────────────────────────────

  test('(негативный) имена лидеров не пустые (truthy)', async () => {
    const { leaders } = await getLeaderboard();
    leaders.forEach((leader: LeaderboardUser) => {
      expect(leader.name).toBeTruthy();
    });
  });

  test('(негативный) snaps у каждого лидера — число (typeof "number")', async () => {
    const { leaders } = await getLeaderboard();
    leaders.forEach((leader: LeaderboardUser) => {
      expect(typeof leader.snaps).toBe('number');
    });
  });
});
