import React, { useState, useEffect, useCallback } from 'react';
import { QuestDto, getQuests, skipQuest, rerollQuest, getRerolls } from '../services/questsService';
import { quests as mockQuests } from '../data';
import { Dialog } from '../components/Shell';
import { IconBolt, IconChevL, IconChevR, IconRefresh, IconCamera } from '../icons';
import { ProgressRing } from '../components/Shell';

// ─── Helpers ──────────────────────────────────────────────────────────────────

type QuestTab = 'daily' | 'weekly' | 'special';

const typeColor: Record<QuestTab, string> = {
  daily:   '#34C759',
  weekly:  '#FF9500',
  special: '#AF52DE',
};

const diffLabel = (type: QuestTab) =>
  type === 'daily' ? 'Лёгкий' : type === 'weekly' ? 'Средний' : 'Специальный';

const tabMeta: Record<QuestTab, { label: string; resetSecs: number }> = {
  daily:   { label: 'Ежедневные',   resetSecs: 0 },
  weekly:  { label: 'Еженедельные', resetSecs: 0 },
  special: { label: 'Специальные',  resetSecs: 0 },
};

// Считаем секунды до следующего сброса
const secsUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.floor((midnight.getTime() - now.getTime()) / 1000);
};

const secsUntilMonday = () => {
  const now = new Date();
  const monday = new Date(now);
  const day = now.getDay();
  const daysUntil = day === 0 ? 1 : 8 - day;
  monday.setDate(now.getDate() + daysUntil);
  monday.setHours(0, 0, 0, 0);
  return Math.floor((monday.getTime() - now.getTime()) / 1000);
};

// ─── Countdown ────────────────────────────────────────────────────────────────

const Countdown: React.FC<{ secs: number; color: string }> = ({ secs: initSecs, color }) => {
  const [s, setS] = useState(initSecs);
  useEffect(() => {
    const t = setInterval(() => setS(v => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  const str = d > 0 ? `${d}д ${pad(h)}ч ${pad(m)}м ${pad(sec)}с` : `${pad(h)}ч ${pad(m)}м ${pad(sec)}с`;
  return <span className="mono" style={{ color, fontWeight: 700 }}>{str}</span>;
};

// ─── QuestRow ─────────────────────────────────────────────────────────────────

const QuestRow: React.FC<{ q: QuestDto; onTap: (q: QuestDto) => void }> = ({ q, onTap }) => {
  const color = typeColor[q.type];
  return (
    <button onClick={() => onTap(q)} className="card row"
      style={{ padding: '14px 16px', marginBottom: 10, gap: 14, textAlign: 'left', width: '100%', borderRadius: 18, opacity: q.isCompleted || q.isSkipped ? 0.5 : 1 }}>
      <span style={{ width: 42, height: 42, borderRadius: 14, flex: '0 0 42px', background: `linear-gradient(135deg, ${color}, ${color}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: `0 4px 12px ${color}33` }}>
        {q.emoji ?? '📷'}
      </span>
      <span className="grow stack" style={{ gap: 3 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--dark)', letterSpacing: '-0.01em' }}>{q.name}</span>
        <span style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          <IconBolt size={11}/>{q.reward}
        </span>
      </span>
      {q.isCompleted && <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700 }}>✓</span>}
      {!q.isCompleted && !q.isSkipped && <IconChevR size={18} style={{ color: 'var(--gray)' }}/>}
    </button>
  );
};

// ─── QuestsListScreen ─────────────────────────────────────────────────────────

interface ListProps {
  initData: string | null;
  dailyDone: number;
  dailyTotal: number;
  onOpen: (q: QuestDto) => void;
}

export const QuestsListScreen: React.FC<ListProps> = ({ initData, dailyDone, dailyTotal, onOpen }) => {
  const [tab, setTab] = useState<QuestTab>('daily');
  const [questMap, setQuestMap] = useState<Record<QuestTab, QuestDto[]>>({ daily: [], weekly: [], special: [] });
  const [loading, setLoading] = useState(true);

  const loadTab = useCallback(async (t: QuestTab) => {
    setLoading(true);
    try {
      if (initData) {
        const data = await getQuests(initData, t);
        setQuestMap(m => ({ ...m, [t]: data }));
      } else {
        // моковые данные
        const mock = mockQuests[t].map((q, i) => ({
          id: i + 1, name: q.title, type: t, emoji: q.emoji,
          description: q.desc, difficulty: null, reward: q.reward,
          expectedLabel: null,
          isCompleted: false, isSkipped: false,
        } as QuestDto));
        setQuestMap(m => ({ ...m, [t]: mock }));
      }
    } catch {
      const mock = mockQuests[t].map((q, i) => ({
        id: i + 1, name: q.title, type: t, emoji: q.emoji,
        description: q.desc, difficulty: null, reward: q.reward,
        isCompleted: false, isSkipped: false,
      } as QuestDto));
      setQuestMap(m => ({ ...m, [t]: mock }));
    } finally {
      setLoading(false);
    }
  }, [initData]);

  useEffect(() => { loadTab(tab); }, [tab, loadTab]);

  const list = questMap[tab];
  const dailyProgress = Math.min(1, dailyDone / dailyTotal);
  const resetSecs = tab === 'daily' ? secsUntilMidnight() : secsUntilMonday();
  const color = typeColor[tab];

  const desc: Record<QuestTab, string> = {
    daily:   'Лёгкие задания на каждый день. Обновляются каждые сутки в полночь.',
    weekly:  'Более сложные квесты на неделю. Награда крупнее, но и снять сложнее.',
    special: 'Тематические события. Открыты ограниченное время — успевайте!',
  };

  return (
    <div className="scroll">
      <div className="page-pad">
        <div className="h1" style={{ marginBottom: 4 }}>Квесты</div>
        <div className="muted" style={{ marginBottom: 14 }}>{desc[tab]}</div>

        {/* Дневной прогресс */}
        {tab === 'daily' && (
          <div className="card pad" style={{ marginBottom: 14, background: dailyDone >= dailyTotal ? 'linear-gradient(135deg, #34C759, #28A745)' : 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)', color: '#fff', boxShadow: '0 8px 24px rgba(0,122,255,0.22)' }}>
            <div className="row" style={{ gap: 14, marginBottom: 12 }}>
              <div className="ring-wrap" style={{ width: 46, height: 46, position: 'relative' }}>
                <div className="center" style={{ width: 46, height: 46, fontWeight: 800, fontSize: 13, letterSpacing: '-0.02em' }}>
                  {dailyDone}/{dailyTotal}
                </div>
                <ProgressRing size={46} stroke={3.5} value={dailyProgress} color="#fff" bg="rgba(255,255,255,0.25)"/>
              </div>
              <div className="grow">
                <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.85, marginBottom: 2 }}>Сегодня</div>
                <div className="h2" style={{ color: '#fff', fontSize: 18 }}>
                  {dailyDone >= dailyTotal ? 'Все ежедневные взяты! 🎉' : `Осталось ${dailyTotal - dailyDone} квеста`}
                </div>
              </div>
            </div>
            <div className="progress-bar" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <div style={{ width: `${dailyProgress * 100}%`, background: '#fff' }}/>
            </div>
          </div>
        )}

        {/* Табы */}
        <div className="seg" style={{ marginBottom: 14 }}>
          {(['daily', 'weekly', 'special'] as QuestTab[]).map(t => (
            <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
              {tabMeta[t].label}
            </button>
          ))}
        </div>

        {/* Таймер */}
        <div className="card row" style={{ padding: '12px 16px', marginBottom: 14, gap: 10, borderRadius: 16 }}>
          <IconRefresh size={18} style={{ color }}/>
          <span style={{ fontSize: 13, color: 'var(--gray)', fontWeight: 500 }}>Обновление через</span>
          <span className="grow" style={{ textAlign: 'right' }}>
            <Countdown secs={resetSecs} color={color}/>
          </span>
        </div>

        {/* Список */}
        {loading
          ? [1,2,3].map(i => <div key={i} className="skel" style={{ height: 70, borderRadius: 18, marginBottom: 10 }}/>)
          : list.map(q => <QuestRow key={q.id} q={q} onTap={onOpen}/>)
        }
      </div>
    </div>
  );
};

// ─── QuestDetailScreen ────────────────────────────────────────────────────────

interface DetailProps {
  q: QuestDto;
  rerollsLeft: number;
  initData: string | null;
  onBack: () => void;
  onShoot: (q: QuestDto) => void;
  onReroll: (q: QuestDto) => Promise<QuestDto | null>;
  onSkip: (q: QuestDto) => void;
}

export const QuestDetailScreen: React.FC<DetailProps> = ({ q: initialQ, rerollsLeft: initRerolls, initData, onBack, onShoot, onReroll, onSkip }) => {
  const [q, setQ] = useState(initialQ);
  const [rerollsLeft, setRerollsLeft] = useState(initRerolls);
  const [confirmSkip, setConfirmSkip] = useState(false);
  const [rolling, setRolling] = useState(false);

  const color = typeColor[q.type];

  const handleReroll = async () => {
    if (rerollsLeft <= 0 || rolling) return;
    setRolling(true);
    const next = await onReroll(q);
    if (next) {
      setQ(next);
      setRerollsLeft(r => r - 1);
    }
    setRolling(false);
  };

  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      <div className="scroll">
        <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="icon-btn" onClick={onBack}><IconChevL size={22}/></button>
          <span className="reroll-pill">
            <IconRefresh size={14}/> {rerollsLeft} из 3
          </span>
        </div>

        <div className="page-pad" style={{ paddingTop: 14 }}>
          <div className="row" style={{ gap: 8, marginBottom: 8 }}>
            <span className="diff-dot" style={{ background: color }}/>
            <span style={{ fontSize: 13, fontWeight: 600, color }}>{diffLabel(q.type)}</span>
          </div>

          <div className="h1" style={{ marginBottom: 14, fontSize: 28 }}>{q.name}</div>

          <div className="quest-hero" style={{ marginBottom: 14, background: `linear-gradient(135deg, ${color}22, ${color}10)` }}>
            <span style={{ fontSize: 72 }}>{q.emoji ?? '📷'}</span>
          </div>

          {q.description && (
            <div style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--dark)', marginBottom: 14 }}>{q.description}</div>
          )}

          <div className="row" style={{ gap: 10, marginBottom: 18 }}>
            <span className="pill blue" style={{ fontSize: 14, fontWeight: 700, padding: '8px 14px' }}>
              <IconBolt size={14}/>{q.reward}
            </span>
          </div>

          <button className="btn primary block lg" onClick={() => onShoot(q)} style={{ marginBottom: 10 }}>
            <IconCamera size={18}/> Сделать снимок
          </button>
          <button className="btn outlined block" onClick={handleReroll} disabled={rerollsLeft === 0 || rolling} style={{ marginBottom: 10 }}>
            <IconRefresh size={16}/> {rolling ? 'Меняем...' : `Сменить квест${rerollsLeft === 0 ? ' (больше нет)' : ''}`}
          </button>
          <button className="btn danger block" onClick={() => setConfirmSkip(true)}>
            Пропустить квест
          </button>
        </div>
      </div>

      {confirmSkip && (
        <Dialog
          title="Вы уверены?"
          text="Квест сгорит — вернуть его уже не получится. Награда обнулится."
          confirmLabel="Пропустить"
          cancelLabel="Отмена"
          confirmDanger
          onCancel={() => setConfirmSkip(false)}
          onConfirm={() => { setConfirmSkip(false); onSkip(q); }}
        />
      )}
    </div>
  );
};
