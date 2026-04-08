import { getQuests, getQuestsByTab, QuestItem } from './questsService';

describe('questsService', () => {
  // ─── Позитивные тесты ────────────────────────────────────────────────────

  test('getQuests() возвращает все квесты (12 штук)', async () => {
    const quests = await getQuests();
    expect(quests).toHaveLength(12);
  });

  test('getQuestsByTab("daily") возвращает только daily-квесты (tab === "daily")', async () => {
    const quests = await getQuestsByTab('daily');
    expect(quests.length).toBeGreaterThan(0);
    quests.forEach((q: QuestItem) => {
      expect(q.tab).toBe('daily');
    });
  });

  test('getQuestsByTab("weekly") возвращает только weekly-квесты', async () => {
    const quests = await getQuestsByTab('weekly');
    expect(quests.length).toBeGreaterThan(0);
    quests.forEach((q: QuestItem) => {
      expect(q.tab).toBe('weekly');
    });
  });

  test('getQuestsByTab("special") возвращает только special-квесты', async () => {
    const quests = await getQuestsByTab('special');
    expect(quests.length).toBeGreaterThan(0);
    quests.forEach((q: QuestItem) => {
      expect(q.tab).toBe('special');
    });
  });

  test('каждый квест содержит поля: id, title, points, difficulty, tab', async () => {
    const quests = await getQuests();
    quests.forEach((q: QuestItem) => {
      expect(q).toHaveProperty('id');
      expect(q).toHaveProperty('title');
      expect(q).toHaveProperty('points');
      expect(q).toHaveProperty('difficulty');
      expect(q).toHaveProperty('tab');
    });
  });

  test('daily-список содержит квест с title "свиристели"', async () => {
    const quests = await getQuestsByTab('daily');
    const titles = quests.map((q: QuestItem) => q.title);
    expect(titles).toContain('свиристели');
  });

  // ─── Негативные тесты ────────────────────────────────────────────────────

  test('(негативный) getQuestsByTab("nonexistent" as any) возвращает пустой массив', async () => {
    const quests = await getQuestsByTab('nonexistent' as any);
    expect(quests).toHaveLength(0);
  });

  test('(негативный) points у каждого квеста — число (typeof "number")', async () => {
    const quests = await getQuests();
    quests.forEach((q: QuestItem) => {
      expect(typeof q.points).toBe('number');
    });
  });

  test('(негативный) getQuestsByTab("daily") НЕ содержит квест "скурагов гег"', async () => {
    const quests = await getQuestsByTab('daily');
    const titles = quests.map((q: QuestItem) => q.title);
    expect(titles).not.toContain('скурагов гег');
  });
});
