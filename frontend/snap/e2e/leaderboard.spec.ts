import { test, expect } from '@playwright/test';

test.describe('Таблица лидеров', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('img[alt="Leaderboard"]');
    await expect(page.locator('.leaderboard-list')).toBeVisible();
  });

  // Позитив

  test('+ показывает список лидеров после загрузки', async ({ page }) => {
    await expect(page.getByText('Ник')).toBeVisible();
  });

  test('+ показывает текущего пользователя', async ({ page }) => {
    await expect(page.getByText('ты')).toBeVisible();
  });

  test('+ ранг 100 отображается как "100+"', async ({ page }) => {
    await expect(page.getByText('100+')).toBeVisible();
  });

  test('+ кнопка "Глобальный" активна по умолчанию', async ({ page }) => {
    const globalBtn = page.getByRole('button', { name: 'Глобальный' });
    await expect(globalBtn).toHaveClass(/active/);
  });

  test('+ переключение на "Местный" делает его активным', async ({ page }) => {
    await page.getByRole('button', { name: 'Местный' }).click();
    await expect(page.getByRole('button', { name: 'Местный' })).toHaveClass(/active/);
  });

  test('+ показывает колонки "Место в рейтинге" и "Кол-во снэпов"', async ({ page }) => {
    await expect(page.getByText('Место в рейтинге')).toBeVisible();
    await expect(page.getByText('Кол-во снэпов')).toBeVisible();
  });

  test('+ первый лидер имеет ранг 1', async ({ page }) => {
    const firstRank = page.locator('.rank-number').first();
    await expect(firstRank).toHaveText('1');
  });

  test('+ отображаются снэпы у лидеров', async ({ page }) => {
    await expect(page.locator('.leaderboard-snaps').first()).toContainText('снэпов');
  });

  // Негатив 

  test('- кнопка "Местный" не активна по умолчанию', async ({ page }) => {
    const localBtn = page.getByRole('button', { name: 'Местный' });
    await expect(localBtn).not.toHaveClass(/active/);
  });

  test('- страница лидерборда не содержит вкладки квестов', async ({ page }) => {
    await expect(page.getByRole('button', { name: /daily/i })).toHaveCount(0);
  });

  test('- страница лидерборда не содержит товары магазина', async ({ page }) => {
    await expect(page.locator('.shop-item')).toHaveCount(0);
  });

  test('- в локальном режиме кнопка "Глобальный" не активна', async ({ page }) => {
    await page.getByRole('button', { name: 'Местный' }).click();
    await expect(page.getByRole('button', { name: 'Глобальный' })).not.toHaveClass(/active/);
  });
});
