import { test, expect } from '@playwright/test';

test.describe('Домашняя страница', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.header')).toBeVisible();
    await expect(page.locator('.feed')).toBeVisible();
  });

  // Позитив 

  test('+ отображается лента постов', async ({ page }) => {
    await expect(page.locator('.feed')).toBeVisible();
  });

  test('+ после загрузки появляются посты', async ({ page }) => {
    await expect(page.locator('.post').first()).toBeVisible();
  });

  test('+ отображается счётчик "Заданий выполнено"', async ({ page }) => {
    await expect(page.getByText('Заданий выполнено')).toBeVisible();
  });

  test('+ отображается счётчик "Daily счётчик"', async ({ page }) => {
    await expect(page.getByText('Daily счётчик')).toBeVisible();
  });

  test('+ шапка (.header) присутствует на странице', async ({ page }) => {
    await expect(page.locator('.header')).toBeVisible();
  });

  test('+ навигационная панель (.tabbar) видна', async ({ page }) => {
    await expect(page.locator('.tabbar')).toBeVisible();
  });

  // Негатив 

  test('- на домашней странице нет вкладок Daily/Weekly/Special', async ({ page }) => {
    await expect(page.getByRole('button', { name: /daily/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /weekly/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /special/i })).toHaveCount(0);
  });

  test('- на домашней странице нет кнопки "Глобальный"', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Глобальный' })).toHaveCount(0);
  });

  test('- на домашней странице нет блока .shop-list', async ({ page }) => {
    await expect(page.locator('.shop-list')).toHaveCount(0);
  });
});

test.describe('Навигация между экранами (таббар)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // Позитив 

  test('+ иконка Home активна по умолчанию', async ({ page }) => {
    const homeIcon = page.locator('img[alt="Home"]');
    await expect(homeIcon).toHaveClass(/active/);
  });

  test('+ клик на Stars переходит на страницу квестов', async ({ page }) => {
    await page.locator('img[alt="Stars"]').click();
    await expect(page.getByRole('button', { name: /daily/i })).toBeVisible();
  });

  test('+ клик на Leaderboard переходит на рейтинг', async ({ page }) => {
    await page.locator('img[alt="Leaderboard"]').click();
    await expect(page.getByText('Глобальный')).toBeVisible();
  });

  test('+ клик на Shop переходит в магазин', async ({ page }) => {
    await page.locator('img[alt="Shop"]').click();
    await expect(page.locator('.shop-list')).toBeVisible();
  });

  test('+ после перехода на квесты клик на Home возвращает ленту', async ({ page }) => {
    await page.locator('img[alt="Stars"]').click();
    await expect(page.getByRole('button', { name: /daily/i })).toBeVisible();

    await page.locator('img[alt="Home"]').click();
    await expect(page.locator('.feed')).toBeVisible();
  });

  test('+ иконка Stars становится активной при переходе на квесты', async ({ page }) => {
    await page.locator('img[alt="Stars"]').click();
    await expect(page.locator('img[alt="Stars"]')).toHaveClass(/active/);
  });

  test('+ иконка Shop становится активной при переходе в магазин', async ({ page }) => {
    await page.locator('img[alt="Shop"]').click();
    await expect(page.locator('img[alt="Shop"]')).toHaveClass(/active/);
  });

  // Негатив

  test('- иконка Home теряет класс active после перехода на квесты', async ({ page }) => {
    await page.locator('img[alt="Stars"]').click();
    await expect(page.locator('img[alt="Home"]')).not.toHaveClass(/\bactive\b/);
  });

  test('- иконка Stars не активна на домашней странице', async ({ page }) => {
    await expect(page.locator('img[alt="Stars"]')).not.toHaveClass(/\bactive\b/);
  });

  test('- клики по соседним иконкам не должны блокироваться центральной кнопкой', async ({ page }) => {
    await page.locator('img[alt="Leaderboard"]').click();
    await expect(page.getByRole('button', { name: 'Глобальный' })).toBeVisible();
  });
});
