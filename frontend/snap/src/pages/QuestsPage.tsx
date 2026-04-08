import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Quest } from '../components/Quests';
import { TimerBar } from '../components/TimerBar';
import { getQuestsByTab, Tab, QuestItem } from '../services/questsService';

export default function QuestsPage() {
  const [tab, setTab] = useState<Tab>('daily');
  const [list, setList] = useState<QuestItem[]>([]);

  useEffect(() => {
    getQuestsByTab(tab).then(setList);
  }, [tab]);

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
