import { getShopItems, getShopStats, buyItem, ShopItem } from './shopService';

describe('shopService', () => {
  // ─── Позитивные тесты ────────────────────────────────────────────────────

  test('getShopItems() возвращает 4 товара', async () => {
    const items = await getShopItems();
    expect(items).toHaveLength(4);
  });

  test('каждый товар содержит поля id, title, description, price, priceValue', async () => {
    const items = await getShopItems();
    items.forEach((item: ShopItem) => {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('title');
      expect(item).toHaveProperty('description');
      expect(item).toHaveProperty('price');
      expect(item).toHaveProperty('priceValue');
    });
  });

  test('getShopStats() возвращает { completedQuests: 70, dailyCounter: 2 }', async () => {
    const stats = await getShopStats();
    expect(stats.completedQuests).toBe(70);
    expect(stats.dailyCounter).toBe(2);
  });

  test('buyItem(1) возвращает { success: true }', async () => {
    const result = await buyItem(1);
    expect(result.success).toBe(true);
  });

  test('buyItem(1) возвращает message "Товар успешно куплен!"', async () => {
    const result = await buyItem(1);
    expect(result.message).toBe('Товар успешно куплен!');
  });

  test('priceValue каждого товара > 0', async () => {
    const items = await getShopItems();
    items.forEach((item: ShopItem) => {
      expect(item.priceValue).toBeGreaterThan(0);
    });
  });

  // ─── Негативные тесты ────────────────────────────────────────────────────

  test('(негативный) buyItem(9999) тоже возвращает success=true (мок всегда успешен)', async () => {
    const result = await buyItem(9999);
    expect(result.success).toBe(true);
  });

  test('(негативный) completedQuests >= 0', async () => {
    const stats = await getShopStats();
    expect(stats.completedQuests).toBeGreaterThanOrEqual(0);
  });
});
