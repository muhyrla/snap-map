import { useState } from 'react';
import { Header } from '../components/Header';
import { Quest, Difficulty } from '../components/Quests';
import { TimerBar } from '../components/TimerBar';
import { tab } from '@testing-library/user-event/dist/tab';

type Tab = 'daily' | 'weekly' | 'special';
type QuestItem = { id: string; title: string; points: number; difficulty: Difficulty; tab: Tab };

const DATA: QuestItem[] = [
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

export default function QuestsPage() {
  const [tab, setTab] = useState<Tab>('daily');
  const list = DATA.filter(q => q.tab === tab);

  return (
    <main className="screen">
      <div className="screen-header-block">
        <Header />

        <section className="headline">
          <p className="subtitle">
            <span className="subtitle--bold">Двигайся к цели</span> или тебя обгонят
          </p>
        </section>
      </div>

      <div className="tabs">
        <button className={`tab ${tab==='daily'?'tab--active':''}`} onClick={()=>setTab('daily')}>Daily</button>
        <button className={`tab ${tab==='weekly'?'tab--active':''}`} onClick={()=>setTab('weekly')}>Weekly</button>
        <button className={`tab ${tab==='special'?'tab--active':''}`} onClick={()=>setTab('special')}>Special</button>
      </div>

      <div className="list">
        {list.map(q => (
          <Quest key={q.id} title={q.title} points={q.points} difficulty={q.difficulty} />
        ))}
      </div>

      <TimerBar difficulty={tab} />
    </main>
  );
}
