import { test, expect } from '@playwright/test';

test.describe('Страница квестов', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('img[alt="Stars"]');
    await expect(page.getByRole('button', { name: /daily/i })).toBeVisible();
    await expect(page.locator('.list')).toBeVisible();
  });

  // Позитив

  test('+ по умолчанию активна вкладка Daily', async ({ page }) => {
    const dailyBtn = page.getByRole('button', { name: /daily/i });
    await expect(dailyBtn).toHaveClass(/tab--active/);
  });

  test('+ показывает daily-квесты после загрузки', async ({ page }) => {
    await expect(page.getByText(/свиристели/i)).toBeVisible();
  });

  test('+ переключение на Weekly показывает weekly-квесты', async ({ page }) => {
    await page.getByRole('button', { name: /weekly/i }).click();
    await expect(page.getByText(/яркий алый цветок/i)).toBeVisible();
  });

  test('+ переключение на Special показывает special-квесты', async ({ page }) => {
    await page.getByRole('button', { name: /special/i }).click();
    await expect(page.getByText(/скурагов гег/i)).toBeVisible();
  });

  test('+ вкладка Weekly становится активной после клика', async ({ page }) => {
    const weeklyBtn = page.getByRole('button', { name: /weekly/i });
    await weeklyBtn.click();
    await expect(weeklyBtn).toHaveClass(/tab--active/);
  });

  test('+ вкладка Special становится активной после клика', async ({ page }) => {
    const specialBtn = page.getByRole('button', { name: /special/i });
    await specialBtn.click();
    await expect(specialBtn).toHaveClass(/tab--active/);
  });

  test('+ таймер обновления отображается', async ({ page }) => {
    await expect(page.locator('.timerbar')).toBeVisible();
  });

  test('+ таймер показывает формат с днями, часами и минутами', async ({ page }) => {
    const timerText = await page.locator('.timer').innerText();
    expect(timerText).toMatch(/\d+д \d+ч \d+м/);
  });

  test('+ квест содержит количество очков (snapcoin)', async ({ page }) => {
    await expect(page.getByText(/snapcoin/i).first()).toBeVisible();
  });

  test('+ можно последовательно переключить все три вкладки', async ({ page }) => {
    await page.getByRole('button', { name: /weekly/i }).click();
    await expect(page.getByText(/яркий алый цветок/i)).toBeVisible();

    await page.getByRole('button', { name: /special/i }).click();
    await expect(page.getByText(/скурагов гег/i)).toBeVisible();

    await page.getByRole('button', { name: /daily/i }).click();
    await expect(page.getByText(/свиристели/i)).toBeVisible();
  });

  // Негатив 

  test('- daily-квесты не видны при активной вкладке Weekly', async ({ page }) => {
    await page.getByRole('button', { name: /weekly/i }).click();
    await expect(page.getByText(/яркий алый цветок/i)).toBeVisible();
    await expect(page.getByText(/знак пешеходного/i)).not.toBeVisible();
  });

  test('- special-квесты не видны при активной вкладке Daily', async ({ page }) => {
    await expect(page.getByText(/свиристели/i)).toBeVisible();
    await expect(page.getByText(/скурагов гег/i)).toHaveCount(0);
  });

  test('- weekly-квесты не видны при активной вкладке Special', async ({ page }) => {
    await page.getByRole('button', { name: /special/i }).click();
    await expect(page.getByText(/скурагов гег/i)).toBeVisible();
    await expect(page.getByText(/яркий алый цветок/i)).toHaveCount(0);
  });

  test('- Daily не имеет класс active когда активна Weekly', async ({ page }) => {
    const dailyBtn = page.getByRole('button', { name: /daily/i });
    const weeklyBtn = page.getByRole('button', { name: /weekly/i });
    await weeklyBtn.click();
    await expect(weeklyBtn).toHaveClass(/tab--active/);
    await expect(dailyBtn).not.toHaveClass(/tab--active/);
  });

  test('- после перехода на Weekly daily-квест "свиристели" не отображается', async ({ page }) => {
    await page.getByRole('button', { name: /weekly/i }).click();
    await expect(page.getByText(/свиристели/i)).toHaveCount(0);
  });
});
