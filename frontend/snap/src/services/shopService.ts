const API_BASE = process.env.REACT_APP_API_URL ?? '';

function authHeader(initData: string) {
  return { Authorization: `tma ${initData}` };
}

export interface ShopItemDto {
  id: number;
  title: string;
  description: string | null;
  price: number;
  discount: number;
  category: string;
  imageUrl: string | null;
  emoji: string | null;
}

export interface PurchaseDto {
  id: number;
  item: ShopItemDto;
  code: string;
  pricePaid: number;
  purchasedAt: string;
}

export async function getMarketItems(initData: string, category?: string): Promise<ShopItemDto[]> {
  const url = category
    ? `${API_BASE}/api/market?category=${encodeURIComponent(category)}`
    : `${API_BASE}/api/market`;
  const res = await fetch(url, { headers: authHeader(initData) });
  if (!res.ok) throw new Error('Failed to fetch market items');
  return res.json();
}

export async function purchaseItem(initData: string, itemId: number): Promise<PurchaseDto> {
  const res = await fetch(`${API_BASE}/api/market/${itemId}/purchase`, {
    method: 'POST',
    headers: authHeader(initData),
  });
  if (res.status === 400) throw new Error('insufficient_balance');
  if (!res.ok) throw new Error('Purchase failed');
  return res.json();
}

export async function getPurchases(initData: string): Promise<PurchaseDto[]> {
  const res = await fetch(`${API_BASE}/api/market/purchases`, { headers: authHeader(initData) });
  if (!res.ok) throw new Error('Failed to fetch purchases');
  return res.json();
}
