export interface LeaderboardUser {
  rank: number;
  name: string;
  snaps: number;
  userId?: number;
}

export interface LeaderboardStats {
  totalUsers: number;
  totalEarned: number;
}

export interface LeaderboardData {
  leaders: LeaderboardUser[];
  currentUser: LeaderboardUser | null;
  stats: LeaderboardStats;
}

// Моки данных для leaderboard
const LEADERBOARD_MOCK: LeaderboardUser[] = [
  { rank: 1, name: 'Ник', snaps: 100 },
  { rank: 2, name: 'Никки', snaps: 95 },
  { rank: 3, name: 'Николай', snaps: 90 },
  { rank: 4, name: 'Никита', snaps: 85 },
  { rank: 5, name: 'Никс', snaps: 80 },
  { rank: 6, name: 'Николь', snaps: 75 },
  { rank: 7, name: 'Никсель', snaps: 70 },
  { rank: 8, name: 'Никкис', snaps: 65 },
  { rank: 9, name: 'Николетта', snaps: 60 },
];

const CURRENT_USER_MOCK: LeaderboardUser = {
  rank: 100,
  name: 'ты',
  snaps: 100,
};

const STATS_MOCK: LeaderboardStats = {
  totalUsers: 110203,
  totalEarned: 0, // Можно добавить реальное значение
};

export async function getLeaderboard(type: 'global' | 'local' = 'global'): Promise<LeaderboardData> {
  // const response = await fetch(`/api/leaderboard?type=${type}`);
  // return response.json();
  
  return Promise.resolve({
    leaders: LEADERBOARD_MOCK,
    currentUser: CURRENT_USER_MOCK,
    stats: STATS_MOCK,
  });
}

