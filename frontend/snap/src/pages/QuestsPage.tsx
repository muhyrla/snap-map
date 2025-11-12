import { useState } from 'react';
import { Quest, Difficulty } from '../components/Quests';
import { TimerBar } from '../components/TimerBar';

type Tab = 'daily' | 'weekly' | 'special';
type QuestItem = { id: string; title: string; points: number; difficulty: Difficulty; tab: Tab };

const DATA: QuestItem[] = [
  { id:'1', title:'яркий алый цветок', points:115, difficulty:'weekly', tab:'weekly' },
  { id:'2', title:'пышный красный', points:115, difficulty:'weekly', tab:'weekly' },
  { id:'3', title:'синий цветок', points:208, difficulty:'weekly', tab:'weekly' },
  { id:'4', title:'желтый цветок', points:150, difficulty:'weekly', tab:'weekly' },

  { id:'5', title:'свиристели', points:115, difficulty:'daily', tab:'daily' },
  { id:'6', title:'знак пешеходного...', points:115, difficulty:'daily', tab:'daily' },
  { id:'7', title:'колесо обозрения', points:208, difficulty:'daily', tab:'daily' },
  { id:'8', title:'галоша', points:152, difficulty:'daily', tab:'daily' },

  { id:'9', title:'скурагов гег', points:315, difficulty:'special', tab:'special' },
  { id:'10', title:'беляшка гег', points:315, difficulty:'special', tab:'special' },
];

export default function QuestsPage() {
  const [tab, setTab] = useState<Tab>('daily');
  const list = DATA.filter(q => q.tab === tab);

  return (
    <main className="screen">
      <section className="profile">
        <div className="avatar">👤</div>
        <div className="user">
          <div className="name">USERNAME</div>
          <div className="small">10.000$</div>
        </div>
        <button className="gear" aria-label="settings">⚙️</button>
      </section>

      <section className="headline">
        <h1 className="title">Квесты</h1>
        <p className="subtitle">какая‑то подводка мы потом придумаем зачем</p>
      </section>

      <div className="tabs">
        <button className={`tab ${tab==='daily'?'tab--active':''}`} onClick={()=>setTab('daily')}>DAILY</button>
        <button className={`tab ${tab==='weekly'?'tab--active':''}`} onClick={()=>setTab('weekly')}>WEEKLY</button>
        <button className={`tab ${tab==='special'?'tab--active':''}`} onClick={()=>setTab('special')}>SPECIAL</button>
      </div>

      <div className="list">
        {list.map(q => (
          <Quest key={q.id} title={q.title} points={q.points} difficulty={q.difficulty} />
        ))}
      </div>

      {/* Таймер всегда прямо над таббаром; высота таббара 90px */}
      <TimerBar difficulty={tab} anchorHeight={90} />
    </main>
  );
}
