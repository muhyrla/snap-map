import { Difficulty } from '../components/Quests';

export type Tab = 'daily' | 'weekly' | 'special';

export interface QuestItem {
  id: string;
  title: string;
  points: number;
  difficulty: Difficulty;
  tab: Tab;
}

// Моки данных квестов
const QUESTS_MOCK: QuestItem[] = [
  { id:'1', title:'яркий алый цветок', points:115, difficulty:'weekly', tab:'weekly' },
  { id:'2', title:'пышный красный', points:115, difficulty:'weekly', tab:'weekly' },
  { id:'3', title:'синий цветок', points:208, difficulty:'weekly', tab:'weekly' },
  { id:'4', title:'желтый цветок', points:150, difficulty:'weekly', tab:'weekly' },

  { id:'5', title:'свиристели', points:115, difficulty:'daily', tab:'daily' },
  { id:'6', title:'знак пешеходного', points:115, difficulty:'daily', tab:'daily' },
  { id:'7', title:'колесо обозрения', points:208, difficulty:'daily', tab:'daily' },
  { id:'8', title:'галоша', points:152, difficulty:'daily', tab:'daily' },
  { id:'9', title: 'МИШИН НОСЯРА', points:0.5, difficulty:'weekly', tab:'daily' },

  { id:'10', title:'скурагов гег', points:315, difficulty:'special', tab:'special' },
  { id:'11', title:'беляшка гег', points:315, difficulty:'special', tab:'special' },
  { id:'12', title:'бутылка карачинской', points:777, difficulty:'special', tab:'special'},
];

/**
 * Получить все квесты
 * Сейчас возвращает моки, позже можно заменить на реальный API вызов
 */
export async function getQuests(): Promise<QuestItem[]> {
  // TODO: Заменить на реальный API вызов
  // Пример:
  // const response = await fetch('/api/quests');
  // return response.json();
  
  return Promise.resolve(QUESTS_MOCK);
}

/**
 * Получить квесты по типу таба
 * @param tab - тип таба ('daily' | 'weekly' | 'special')
 */
export async function getQuestsByTab(tab: Tab): Promise<QuestItem[]> {
  const allQuests = await getQuests();
  return allQuests.filter(quest => quest.tab === tab);
}

