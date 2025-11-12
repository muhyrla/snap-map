import { useEffect, useMemo, useState } from 'react';

export type Difficulty = 'daily' | 'weekly' | 'special';

type Props = {
  difficulty: Difficulty;      // влияет на период
  anchorHeight?: number;       // высота tabbar, по умолчанию 90px
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

export function TimerBar({ difficulty, anchorHeight = 90 }: Props) {
  // конечная дата = ближайшая «кратная» смена от начала суток
  const periodDays = PERIOD_BY_DIFF[difficulty];

  const target = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msFromStart = now.getTime() - startOfDay.getTime();
    const periodMs = periodDays * 24 * 60 * 60 * 1000;
    const passedPeriods = Math.floor(msFromStart / periodMs);
    const nextEdge = startOfDay.getTime() + (passedPeriods + 1) * periodMs;
    return new Date(nextEdge);
  }, [periodDays]);

  const [left, setLeft] = useState(target.getTime() - Date.now());
  useEffect(() => {
    const id = setInterval(() => setLeft(target.getTime() - Date.now()), 1000 * 30);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div className="timerbar" style={{ bottom: `calc(${anchorHeight}px + env(safe-area-inset-bottom))` }}>
      <div className="small center">задания обновятся через</div>
      <div className="timer">{formatLeft(left)}</div>
    </div>
  );
}