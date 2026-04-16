import { test, expect } from '@playwright/test';

test.describe('Магазин', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('img[alt="Shop"]');
    await page.waitForSelector('.shop-item');
    await expect(page.locator('.shop-list')).toBeVisible();
  });

  // Позитив

  test('+ отображается ровно 4 товара', async ({ page }) => {
    const items = page.locator('.shop-item');
    await expect(items).toHaveCount(4);
  });

  test('+ каждый товар содержит бейдж скидки -50%', async ({ page }) => {
    const badges = page.locator('.shop-item__badge');
    await expect(badges).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      await expect(badges.nth(i)).toHaveText('-50%');
    }
  });

  test('+ каждый товар содержит цену в snapcoin', async ({ page }) => {
    const prices = page.locator('.shop-item__price-tag');
    await expect(prices).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      await expect(prices.nth(i)).toContainText('snapcoin');
    }
  });

  test('+ каждый товар содержит заголовок', async ({ page }) => {
    const titles = page.locator('.shop-item__title');
    await expect(titles).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      const text = await titles.nth(i).innerText();
      expect(text.trim().length).toBeGreaterThan(0);
    }
  });

  test('+ отображается плейсхолдер для товаров без изображения', async ({ page }) => {
    const placeholders = page.locator('.shop-item__placeholder');
    await expect(placeholders).toHaveCount(4);
  });

  test('+ шапка страницы (Header) отображается', async ({ page }) => {
    await expect(page.locator('.header')).toBeVisible();
  });

  test('+ таббар навигации отображается на странице магазина', async ({ page }) => {
    await expect(page.locator('.tabbar')).toBeVisible();
  });

  // Негатив

  test('- на странице магазина нет вкладок квестов (Daily/Weekly/Special)', async ({ page }) => {
    await expect(page.getByRole('button', { name: /daily/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /weekly/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /special/i })).toHaveCount(0);
  });

  test('- на странице магазина нет таблицы лидеров', async ({ page }) => {
    await expect(page.locator('.leaderboard-list')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Глобальный' })).toHaveCount(0);
  });

  test('- на странице магазина нет ленты постов', async ({ page }) => {
    await expect(page.locator('.feed')).toHaveCount(0);
  });

  test('- товары не отображаются до завершения загрузки', async ({ page }) => {
    const newPage = await page.context().newPage();
    await newPage.goto('/');
    await newPage.click('img[alt="Shop"]');
    const loadingText = newPage.getByText('Загрузка...');
    await newPage.waitForSelector('.shop-item');
    await expect(loadingText).not.toBeVisible();
    await newPage.close();
  });

  test('- на странице магазина нет элемента ранга лидеров', async ({ page }) => {
    await expect(page.locator('.rank-number')).toHaveCount(0);
  });
});
