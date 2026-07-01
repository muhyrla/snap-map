const API_BASE = process.env.REACT_APP_API_URL ?? '';

function authHeader(initData: string) {
  return { Authorization: `tma ${initData}`, 'Content-Type': 'application/json' };
}

// ─── Квесты ───────────────────────────────────────────────────────────────────

export interface AdminQuest {
  id: number;
  name: string;
  metadata: string | null;      // expectedLabel — цель для ИИ-проверки фото
  difficulty: number | null;
  reward: number | null;
  duration_days: number | null;
  type: 'daily' | 'weekly' | 'special';
  emoji: string | null;
  description: string | null;
}

export interface AdminQuestInput {
  name: string;
  metadata?: string | null;
  difficulty?: number | null;
  reward?: number | null;
  durationDays?: number | null;
  type?: 'daily' | 'weekly' | 'special';
  emoji?: string | null;
  description?: string | null;
}

export async function getAdminQuests(initData: string): Promise<AdminQuest[]> {
  const res = await fetch(`${API_BASE}/api/admin/quests`, { headers: authHeader(initData) });
  if (!res.ok) throw new Error('Failed to load quests');
  return res.json();
}

export async function createQuest(initData: string, body: AdminQuestInput): Promise<any> {
  const res = await fetch(`${API_BASE}/api/admin/quests`, {
    method: 'POST',
    headers: authHeader(initData),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create quest');
  return res.json();
}

export async function updateQuest(initData: string, id: number, body: AdminQuestInput): Promise<AdminQuest> {
  const res = await fetch(`${API_BASE}/api/admin/quests/${id}`, {
    method: 'PATCH',
    headers: authHeader(initData),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to update quest');
  return res.json();
}

export async function deleteQuest(initData: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/quests/${id}`, {
    method: 'DELETE',
    headers: authHeader(initData),
  });
  if (!res.ok && res.status !== 204) throw new Error('Failed to delete quest');
}

// ─── Товары магазина ──────────────────────────────────────────────────────────

export interface AdminShopItem {
  id: number;
  title: string;
  description: string | null;
  price: number;
  discount: number;
  category: string;
  imageUrl: string | null;
  emoji: string | null;
  active: boolean;
}

export interface AdminShopInput {
  title: string;
  description?: string | null;
  price?: number;
  discount?: number;
  category?: string;
  imageUrl?: string | null;
  emoji?: string | null;
  active?: boolean;
}

export async function getAdminShop(initData: string): Promise<AdminShopItem[]> {
  const res = await fetch(`${API_BASE}/api/admin/shop`, { headers: authHeader(initData) });
  if (!res.ok) throw new Error('Failed to load shop items');
  return res.json();
}

export async function createShopItem(initData: string, body: AdminShopInput): Promise<AdminShopItem> {
  const res = await fetch(`${API_BASE}/api/admin/shop`, {
    method: 'POST',
    headers: authHeader(initData),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create item');
  return res.json();
}

export async function updateShopItem(initData: string, id: number, body: AdminShopInput): Promise<AdminShopItem> {
  const res = await fetch(`${API_BASE}/api/admin/shop/${id}`, {
    method: 'PATCH',
    headers: authHeader(initData),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to update item');
  return res.json();
}

export async function deleteShopItem(initData: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/shop/${id}`, {
    method: 'DELETE',
    headers: authHeader(initData),
  });
  if (!res.ok && res.status !== 204) throw new Error('Failed to delete item');
}
