const API_BASE = process.env.REACT_APP_API_URL ?? '';

function authHeader(initData: string) {
  return { Authorization: `tma ${initData}` };
}

export interface QuestDto {
  id: number;
  name: string;
  type: 'daily' | 'weekly' | 'special';
  emoji: string | null;
  description: string | null;
  difficulty: number | null;
  reward: number;
  expectedLabel: string | null;
  isCompleted: boolean;
  isSkipped: boolean;
}

export async function getQuests(initData: string, type: 'daily' | 'weekly' | 'special'): Promise<QuestDto[]> {
  const res = await fetch(`${API_BASE}/api/quests?type=${type}`, { headers: authHeader(initData) });
  if (!res.ok) throw new Error('Failed to fetch quests');
  return res.json();
}

export async function skipQuest(initData: string, questId: number): Promise<void> {
  await fetch(`${API_BASE}/api/quests/${questId}/skip`, {
    method: 'POST',
    headers: authHeader(initData),
  });
}

export async function rerollQuest(initData: string, currentQuestId: number): Promise<QuestDto> {
  const res = await fetch(`${API_BASE}/api/quests/reroll`, {
    method: 'POST',
    headers: { ...authHeader(initData), 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentQuestId }),
  });
  if (!res.ok) throw new Error('No rerolls left');
  return res.json();
}

export async function getRerolls(initData: string): Promise<{ rerollsLeft: number }> {
  const res = await fetch(`${API_BASE}/api/quests/rerolls`, { headers: authHeader(initData) });
  if (!res.ok) throw new Error('Failed to fetch rerolls');
  return res.json();
}
