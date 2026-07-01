const API_BASE = process.env.REACT_APP_API_URL ?? '';

function authHeader(initData: string): HeadersInit {
  return {
    Authorization: `tma ${initData}`,
    'Content-Type': 'application/json',
  };
}

export interface MeResponse {
  id: number;
  tg_id: number;
  tg_username: string | null;
  tg_avatar: string | null;
  tg_fullname: string | null;
  city: string | null;
  balance: number;
  onboarded: boolean;
  role: 'USER' | 'ADMIN';
}

export async function getMe(initData: string): Promise<MeResponse> {
  const res = await fetch(`${API_BASE}/api/me`, { headers: authHeader(initData) });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

export async function patchMe(
  initData: string,
  city: string
): Promise<{ id: number; city: string; onboarded: boolean }> {
  const res = await fetch(`${API_BASE}/api/me`, {
    method: 'PATCH',
    headers: authHeader(initData),
    body: JSON.stringify({ city }),
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}
