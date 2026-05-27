const API_BASE = process.env.REACT_APP_API_URL ?? '';

export interface LeaderboardEntry {
  rank: number;
  name: string;
  snaps: number;
  isMe: boolean;
}

export async function getLeaderboard(
  initData: string,
  scope: 'global' | 'local'
): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${API_BASE}/api/leaderboard?scope=${scope}`, {
    headers: { Authorization: `tma ${initData}` },
  });
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}
