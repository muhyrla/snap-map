export interface AppUser {
  username: string;
  city: string;
  balance: number;
  questsDone: number;
  dailyCount: number;
  dailyDone: number;
  dailyTotal: number;
  topTen: number;
  likes: number;
  streak: number;
}

export interface Quest {
  id: string;
  title: string;
  reward: number;
  color: 'green' | 'orange' | 'purple';
  desc: string;
  emoji: string;
}

export interface FeedPost {
  id: number;
  name: string;
  city: string;
  time: string;
  avatar: string;
  image: string;
  quest: string;
  questColor: string;
  caption: string;
  likes: number;
  liked: boolean;
  comments: number;
}

export interface MarketItem {
  id: string;
  title: string;
  price: number;
  discount: number;
  category: string;
  img: string;
  emoji: string;
}

export interface Notification {
  id: string;
  type: 'snap' | 'ok' | 'fail' | 'quest' | 'special' | 'market';
  text: string;
  time: string;
  read: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  snaps: number;
  isMe?: boolean;
}

export interface UserPhoto {
  id: string;
  img: string;
  status: 'ok' | 'wait' | 'fail';
}

export interface Achievement {
  id: string;
  name: string;
  emoji: string;
  got: boolean;
}

export const colorMap: Record<string, string> = {
  green: '#34C759',
  orange: '#FF9500',
  purple: '#AF52DE',
  red: '#DE1A1A',
};

export const levelFor = (questsDone: number) => Math.floor(questsDone / 10) + 1;
export const levelProgress = (questsDone: number) => questsDone % 10;
const levelTitles = ['Новичок','Любитель','Охотник','Искатель','Снайпер','Виртуоз','Мастер','Гуру','Легенда','Бог снэпов'];
export const levelTitle = (lvl: number) => levelTitles[Math.min(lvl - 1, levelTitles.length - 1)];

const ph = (seed: string, w = 600, h = 450) => `url("https://picsum.photos/seed/snapmap-${seed}/${w}/${h}")`;

export const defaultUser: AppUser = {
  username: 'Михурла',
  city: 'Омск',
  balance: 1250,
  questsDone: 52,
  dailyCount: 17,
  dailyDone: 2,
  dailyTotal: 4,
  topTen: 3,
  likes: 211,
  streak: 7,
};

export const leaderboardGlobal: LeaderboardEntry[] = [
  { rank: 1,  name: 'Рустам',          snaps: 999 },
  { rank: 2,  name: 'Осерлис',         snaps: 978 },
  { rank: 3,  name: 'Захар',           snaps: 869 },
  { rank: 4,  name: 'Морфи',           snaps: 758 },
  { rank: 5,  name: 'Михурла',         snaps: 674, isMe: true },
  { rank: 6,  name: 'Александр',       snaps: 523 },
  { rank: 7,  name: 'Камчатский краб', snaps: 479 },
  { rank: 8,  name: 'Никитос',         snaps: 435 },
  { rank: 9,  name: 'Полина_88',       snaps: 401 },
  { rank: 10, name: 'Аркадий',         snaps: 388 },
];

export const leaderboardLocal: LeaderboardEntry[] = [
  { rank: 1, name: 'Рустам',    snaps: 999 },
  { rank: 2, name: 'Михурла',   snaps: 674, isMe: true },
  { rank: 3, name: 'Соня_к',    snaps: 612 },
  { rank: 4, name: 'Денчик',    snaps: 540 },
  { rank: 5, name: 'омичка_22', snaps: 487 },
  { rank: 6, name: 'фотограф',  snaps: 432 },
  { rank: 7, name: 'Зефирка',   snaps: 401 },
];

export const feedPosts: FeedPost[] = [
  { id: 1, name: 'Тоня_омск',       city: 'Омск', time: '2 ч назад',  avatar: '#FF9500', image: ph('feed-pigeon'), quest: 'Поймай шляпу',          questColor: 'green',  caption: 'Шляпа улетела, но голубя на ограде поймала. Засчитают?',                      likes: 124, liked: false, comments: 12 },
  { id: 2, name: 'Морфи',           city: 'Омск', time: '4 ч назад',  avatar: '#34C759', image: ph('feed-duck'),   quest: 'Лавочка у воды',         questColor: 'green',  caption: 'Лавочки не было, но утка свидетельствует, что я тут был.',                    likes: 88,  liked: false, comments: 5  },
  { id: 3, name: 'Захар',           city: 'Омск', time: '7 ч назад',  avatar: '#AF52DE', image: ph('feed-rowan'),  quest: 'Свиристели на ветке',     questColor: 'orange', caption: 'Свиристелей не нашёл, нашёл цвет рябины. Зачёт?',                             likes: 56,  liked: false, comments: 3  },
  { id: 4, name: 'Рустам',          city: 'Омск', time: '11 ч назад', avatar: '#007AFF', image: ph('feed-shop'),   quest: 'Магазинчик на Ленина',    questColor: 'green',  caption: 'Витрина живёт своей жизнью. Касса работает, кассирша не очень.',              likes: 211, liked: true,  comments: 24 },
  { id: 5, name: 'Камчатский краб', city: 'Омск', time: '1 д назад',  avatar: '#DE1A1A', image: ph('feed-wheel'),  quest: 'Колесо обозрения',        questColor: 'orange', caption: 'Колесо обозрения с самой высокой точки самокатной парковки.',                 likes: 312, liked: false, comments: 41 },
];

export const quests: { daily: Quest[]; weekly: Quest[]; special: Quest[] } = {
  daily: [
    { id: 'd1', title: 'Фото парка ветеранов',  reward: 115, color: 'green', emoji: '🌳', desc: 'Найди в городе мемориал или аллею воинской славы.' },
    { id: 'd2', title: 'Магазинчик на Ленина',  reward: 90,  color: 'green', emoji: '🏪', desc: 'Сфотографируй любой маленький магазин на улице Ленина.' },
    { id: 'd3', title: 'Поймай шляпу',          reward: 150, color: 'green', emoji: '🎩', desc: 'Человек в шляпе — любой. Главное чтобы шляпа была настоящая.' },
    { id: 'd4', title: 'Лавочка у воды',        reward: 75,  color: 'green', emoji: '🪑', desc: 'Найди скамейку, с которой открывается вид на реку или пруд.' },
  ],
  weekly: [
    { id: 'w1', title: 'Свиристели на ветке',       reward: 200, color: 'orange', emoji: '🐦', desc: 'Зимняя стайка свиристелей на рябине.' },
    { id: 'w2', title: 'Знак пешеходного перехода', reward: 180, color: 'orange', emoji: '🚸', desc: 'Знак «пешеходный переход» в необычном ракурсе.' },
    { id: 'w3', title: 'Колесо обозрения',          reward: 250, color: 'orange', emoji: '🎡', desc: 'Колесо обозрения целиком в кадре.' },
    { id: 'w4', title: 'Галоша',                    reward: 190, color: 'orange', emoji: '👞', desc: 'Резиновая галоша в естественной среде. Лужа приветствуется.' },
  ],
  special: [
    { id: 's1', title: 'Скуратов-генг', reward: 315, color: 'purple', emoji: '🎨', desc: 'Уличная художественная композиция или граффити с местными мотивами.' },
    { id: 's2', title: 'Беляшка-генг', reward: 315, color: 'purple', emoji: '🥟', desc: 'Беляш и его уличный продавец в одном кадре.' },
  ],
};

export const market: MarketItem[] = [
  { id: 'm1', title: 'Кофе в «Coffee Anytime»',  price: 150, discount: 50, category: 'Скидки',         img: ph('m-coffee',    400, 400), emoji: '☕' },
  { id: 'm2', title: 'Билет в кино',             price: 80,  discount: 40, category: 'Скидки',         img: ph('m-cinema',    400, 400), emoji: '🎬' },
  { id: 'm3', title: 'Набор инструментов',       price: 300, discount: 25, category: 'Мерч',           img: ph('m-tools',     400, 400), emoji: '🧰' },
  { id: 'm4', title: 'Круассан с шоколадом',     price: 150, discount: 50, category: 'Скидки',         img: ph('m-croissant', 400, 400), emoji: '🥐' },
  { id: 'm5', title: 'Беляши у политеха',        price: 40,  discount: 30, category: 'Скидки',         img: ph('m-belyash',   400, 400), emoji: '🥟' },
  { id: 'm6', title: 'Стрижка в «Бороде»',       price: 220, discount: 0,  category: 'Услуги',         img: ph('m-barber',    400, 400), emoji: '💈' },
  { id: 'm7', title: 'Промокод Steam 500₽',      price: 500, discount: 0,  category: 'Цифровые коды',  img: ph('m-steam',     400, 400), emoji: '🎮' },
  { id: 'm8', title: 'Бесплатный самокат 30 мин',price: 60,  discount: 0,  category: 'Бесплатный товар',img: ph('m-scooter',  400, 400), emoji: '🛴' },
];

export const notifications: Notification[] = [
  { id: 'n1', type: 'snap',    text: 'Начислено +115 снэпов за квест «Поймай шляпу»',   time: '5 мин назад',  read: false },
  { id: 'n2', type: 'ok',      text: 'Ваше фото принято! Квест выполнен.',              time: '12 мин назад', read: false },
  { id: 'n3', type: 'quest',   text: 'Новые ежедневные квесты уже доступны!',           time: '1 ч назад',    read: false },
  { id: 'n4', type: 'special', text: 'Новый специальный квест: Скуратов-генг',          time: '3 ч назад',    read: false },
  { id: 'n5', type: 'fail',    text: 'Фото отклонено. Попробуйте ещё раз.',             time: 'вчера',        read: true  },
  { id: 'n6', type: 'market',  text: 'Награда получена: Кофе в «Coffee Anytime»',      time: '2 дня назад',  read: true  },
  { id: 'n7', type: 'snap',    text: 'Начислено +200 снэпов за «Свиристели на ветке»', time: '3 дня назад',  read: true  },
];

export const userPhotos: UserPhoto[] = [
  { id: 'p1', img: ph('u-1', 300, 300), status: 'ok'   },
  { id: 'p2', img: ph('u-2', 300, 300), status: 'ok'   },
  { id: 'p3', img: ph('u-3', 300, 300), status: 'wait' },
  { id: 'p4', img: ph('u-4', 300, 300), status: 'ok'   },
  { id: 'p5', img: ph('u-5', 300, 300), status: 'fail' },
  { id: 'p6', img: ph('u-6', 300, 300), status: 'ok'   },
  { id: 'p7', img: ph('u-7', 300, 300), status: 'ok'   },
  { id: 'p8', img: ph('u-8', 300, 300), status: 'ok'   },
  { id: 'p9', img: ph('u-9', 300, 300), status: 'wait' },
];

export const achievements: Achievement[] = [
  { id: 'a1',  name: 'Первый снэп',   emoji: '🌱', got: true  },
  { id: 'a2',  name: '10 квестов',    emoji: '🔥', got: true  },
  { id: 'a3',  name: '50 квестов',    emoji: '⭐', got: true  },
  { id: 'a4',  name: 'Топ-10 города', emoji: '🏆', got: true  },
  { id: 'a5',  name: 'Стрик 7 дней',  emoji: '📅', got: true  },
  { id: 'a6',  name: '100 лайков',    emoji: '💖', got: true  },
  { id: 'a7',  name: 'Стрик 30 дней', emoji: '🌟', got: false },
  { id: 'a8',  name: 'Все недельные', emoji: '🎯', got: false },
  { id: 'a9',  name: '500 квестов',   emoji: '👑', got: false },
  { id: 'a10', name: 'Все спец.',     emoji: '💎', got: false },
  { id: 'a11', name: '5 городов',     emoji: '🗺️', got: false },
  { id: 'a12', name: 'Топ-3 страны',  emoji: '🥇', got: false },
];
