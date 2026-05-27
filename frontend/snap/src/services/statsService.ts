const API_BASE = process.env.REACT_APP_API_URL ?? '';

export interface StatsResponse {
  streak: number;
  daily_count: number;
  daily_done: number;
  daily_total: number;
  quests_done: number;
}

export async function getStats(initData: string): Promise<StatsResponse> {
  const res = await fetch(`${API_BASE}/api/me/stats`, {
    headers: { Authorization: `tma ${initData}` },
  });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}
