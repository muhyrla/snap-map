import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getLeaderboard, LeaderboardEntry } from '../services/leaderboardService';
import { leaderboardGlobal, leaderboardLocal } from '../data';
import { IconBolt } from '../icons';

const Medal: React.FC<{ rank: number }> = ({ rank }) => {
  const colors: Record<number, string> = { 1: '#F5C518', 2: '#C7CCD1', 3: '#C8814B' };
  return (
    <div className="rank-medal" style={{ background: colors[rank] || '#E6E9EE', boxShadow: 'inset 0 -3px 0 rgba(0,0,0,0.12)' }}>
      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
    </div>
  );
};

export default function LeaderboardScreen() {
  const { initDataRaw, backendUser } = useAuth();
  const [tab, setTab] = useState<'global' | 'local'>('global');
  const [list, setList] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (initDataRaw) {
      getLeaderboard(initDataRaw, tab)
        .then(setList)
        .catch(() => setList(tab === 'global' ? leaderboardGlobal : leaderboardLocal))
        .finally(() => setLoading(false));
    } else {
      setList(tab === 'global' ? leaderboardGlobal : leaderboardLocal);
      setLoading(false);
    }
  }, [tab, initDataRaw]);

  const top3 = list.slice(0, 3);
  const rest = list.slice(3);
  const me = list.find(r => r.isMe);
  const city = backendUser?.city ?? 'локальный';
  const subtitle = tab === 'global'
    ? `Россия · ${list.length.toLocaleString('ru-RU')} фотографа`
    : `${city} · ${list.length.toLocaleString('ru-RU')} фотографа`;

  return (
    <div className="screen">
      <div className="scroll" style={{ paddingBottom: 160 }}>
        <div className="page-pad">
          <div className="h1" style={{ marginBottom: 4 }}>Рейтинг</div>
          <div className="muted" style={{ marginBottom: 14 }}>{subtitle}</div>

          <div className="seg" style={{ marginBottom: 18 }}>
            <button className={tab === 'global' ? 'on' : ''} onClick={() => setTab('global')}>Глобальный</button>
            <button className={tab === 'local'  ? 'on' : ''} onClick={() => setTab('local')}>Местный</button>
          </div>

          {loading ? (
            [1,2,3].map(i => <div key={i} className="skel" style={{ height: 56, borderRadius: 16, marginBottom: 10 }}/>)
          ) : (
            <>
              {/* Топ-3 */}
              <div className="card pad" style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>Топ-3</div>
                <div className="stack" style={{ gap: 10 }}>
                  {top3.map(r => (
                    <div key={r.rank} className="row" style={{ gap: 12 }}>
                      <Medal rank={r.rank}/>
                      <div className="avatar" style={{ background: r.rank === 1 ? '#F5C518' : r.rank === 2 ? '#C7CCD1' : '#C8814B' }}>{r.name[0]}</div>
                      <div className="grow" style={{ fontWeight: 700, fontSize: 15 }}>{r.name}</div>
                      <div style={{ fontWeight: 700, color: 'var(--blue)', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <IconBolt size={13}/>{r.snaps}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Остальные */}
              <div className="card" style={{ overflow: 'hidden' }}>
                {rest.map((r, i) => (
                  <div key={r.rank} className="row" style={{
                    padding: '12px 14px', gap: 12,
                    background: r.isMe ? 'var(--blue-soft)' : 'transparent',
                    borderTop: i > 0 ? '1px solid rgba(141,153,174,0.15)' : 'none',
                  }}>
                    <div style={{ width: 28, textAlign: 'center', fontWeight: 700, color: r.isMe ? 'var(--blue)' : 'var(--gray)', fontSize: 14 }}>{r.rank}</div>
                    <div className="avatar" style={{ width: 32, height: 32, flexBasis: 32, fontSize: 12, background: r.isMe ? 'var(--blue)' : 'linear-gradient(135deg,#C8CFDB,#8D99AE)' }}>{r.name[0]}</div>
                    <div className="grow" style={{ fontWeight: r.isMe ? 700 : 500, fontSize: 14, color: r.isMe ? 'var(--blue)' : 'var(--dark)' }}>
                      {r.name}{r.isMe && <span style={{ fontSize: 11, fontWeight: 500, marginLeft: 6, color: 'var(--blue)' }}>· вы</span>}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--dark)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <IconBolt size={12}/>{r.snaps}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Фиксированная плашка */}
      {me && (
        <div style={{
          position: 'absolute', left: 12, right: 12, bottom: 96,
          background: 'var(--blue)', color: '#fff',
          padding: '12px 16px', borderRadius: 18,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontWeight: 600, fontSize: 14,
          boxShadow: '0 10px 28px rgba(0,122,255,0.35)', zIndex: 15,
        }}>
          <span>Ваша позиция: #{me.rank}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconBolt size={14}/>{me.snaps}</span>
        </div>
      )}
    </div>
  );
}
