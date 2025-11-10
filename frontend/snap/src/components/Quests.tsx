export type Difficulty = 'daily' | 'weekly' | 'special';

type QuestProps = {
  title: string;
  points: number;
  difficulty: Difficulty;
  onClick?: () => void;
};

const DIFF_MAP: Record<Difficulty, { dot: string; row: string }> = {
  daily:   { dot: 'quest__dot--daily',   row: 'quest--daily' },
  weekly:  { dot: 'quest__dot--weekly',  row: 'quest--weekly' },
  special: { dot: 'quest__dot--special', row: 'quest--special' },
};

export function Quest({ title, points, difficulty, onClick }: QuestProps) {
  const v = DIFF_MAP[difficulty];
  return (
    <button className={`quest ${v.row}`} onClick={onClick}>
      <span className={`quest__dot ${v.dot}`} />
      <span className="quest__text">
        <span className="quest__title">{title}</span>
        <span className="quest__points">+{points} очков</span>
      </span>
      <span className="quest__arrow">➜</span>
    </button>
  );
}