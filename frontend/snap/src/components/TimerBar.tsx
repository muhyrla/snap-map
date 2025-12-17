import { useEffect, useMemo, useState } from 'react';

export type Difficulty = 'daily' | 'weekly' | 'special';

type Props = {
  difficulty: Difficulty;      // влияет на период
};

const PERIOD_BY_DIFF: Record<Difficulty, number> = {
  daily:   1,   // дней
  weekly:  7,
  special: 15,
};

function formatLeft(ms: number) {
  if (ms < 0) ms = 0;
  const totalMin = Math.floor(ms / 60000);
  const d = Math.floor(totalMin / (60 * 24));
  const h = Math.floor((totalMin % (60 * 24)) / 60);
  const m = totalMin % 60;
  return `${d}д ${h}ч ${m}м`;
}

export function TimerBar({ difficulty }: Props) {
  // конечная дата = ближайшая «кратная» смена от начала суток/недели/месяца
  const periodDays = PERIOD_BY_DIFF[difficulty];

  const target = useMemo(() => {
    const now = new Date();
    let startOf: Date;

    if (difficulty === 'weekly') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      startOf = new Date(now.getFullYear(), now.getMonth(), diff);
    } else if (difficulty === 'special') {
      startOf = new Date(now.getFullYear(), now.getMonth(), 1);
    } else { // daily
      startOf = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    const msFromStart = now.getTime() - startOf.getTime();
    const periodMs = periodDays * 24 * 60 * 60 * 1000;
    const passedPeriods = Math.floor(msFromStart / periodMs);
    const nextEdge = startOf.getTime() + (passedPeriods + 1) * periodMs;
    return new Date(nextEdge);
  }, [difficulty, periodDays]);

  const [left, setLeft] = useState(target.getTime() - Date.now());
  useEffect(() => {
    const id = setInterval(() => setLeft(target.getTime() - Date.now()), 1000 * 30);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div className="timerbar">
      <div className="timer">{formatLeft(left)}</div>
    </div>
  );
}
