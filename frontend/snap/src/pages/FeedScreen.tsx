import React, { useState, useEffect, useRef } from 'react';
import { FeedPost as FeedPostType, colorMap } from '../data';
import { PhotoTile, AnimatedNumber } from '../components/Shell';
import { IconHeart, IconShare } from '../icons';

// ─── Countdown до полуночи ────────────────────────────────────────────────────

const useMidnightCountdown = () => {
  const getSecsLeft = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return Math.floor((midnight.getTime() - now.getTime()) / 1000);
  };
  const [secs, setSecs] = useState(getSecsLeft);
  useEffect(() => {
    const t = setInterval(() => setSecs(getSecsLeft()), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return `${h}ч ${String(m).padStart(2, '0')}м`;
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const FeedSkeleton = () => (
  <div className="card pad" style={{ marginBottom: 14 }}>
    <div className="row" style={{ gap: 10, marginBottom: 10 }}>
      <div className="skel" style={{ width: 36, height: 36, borderRadius: '50%' }}/>
      <div style={{ flex: 1 }}>
        <div className="skel" style={{ height: 10, width: '40%', marginBottom: 6 }}/>
        <div className="skel" style={{ height: 8, width: '20%' }}/>
      </div>
    </div>
    <div className="skel" style={{ aspectRatio: '4/3', marginBottom: 10 }}/>
    <div className="skel" style={{ height: 10, width: '80%', marginBottom: 6 }}/>
    <div className="skel" style={{ height: 10, width: '60%' }}/>
  </div>
);

// ─── FeedPost ─────────────────────────────────────────────────────────────────

interface FeedPostProps { post: FeedPostType; onLike: (id: number) => void; }

const FeedPost: React.FC<FeedPostProps> = ({ post, onLike }) => {
  const [pop, setPop] = useState(false);
  const handleLike = () => {
    setPop(true);
    setTimeout(() => setPop(false), 400);
    onLike(post.id);
  };
  return (
    <article className="card" style={{ marginBottom: 14, overflow: 'hidden' }}>
      <header className="row" style={{ gap: 10, padding: '14px 16px 12px' }}>
        <div className="avatar" style={{ background: post.avatar, fontSize: 13 }}>{post.name[0]}</div>
        <div className="grow">
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--dark)' }}>{post.name}</div>
          <div style={{ fontSize: 11, color: 'var(--gray)' }}>{post.city} · {post.time}</div>
        </div>
      </header>
      <div style={{ position: 'relative', padding: '0 10px' }}>
        <PhotoTile image={post.image} aspect="4/3" style={{ borderRadius: 18 }}>
          <span className="quest-chip">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: colorMap[post.questColor] }}/>
            {post.quest}
          </span>
        </PhotoTile>
      </div>
      <div style={{ padding: '12px 16px 16px' }}>
        <div className="muted" style={{ color: 'var(--dark)', marginBottom: 12, fontSize: 14, lineHeight: 1.4 }}>{post.caption}</div>
        <div className="row" style={{ gap: 18 }}>
          <button className="row" style={{ gap: 6, color: post.liked ? 'var(--red)' : 'var(--gray)' }} onClick={handleLike}>
            <span className={pop ? 'heart-pop' : ''} style={{ display: 'inline-flex' }}>
              <IconHeart size={22} fill={post.liked ? 'var(--red)' : 'none'} stroke={post.liked ? 'var(--red)' : 'currentColor'}/>
            </span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{post.likes}</span>
          </button>
          <button className="row" style={{ gap: 6, color: 'var(--gray)' }}>
            <IconShare size={22}/>
          </button>
        </div>
      </div>
    </article>
  );
};

// ─── FeedScreen ───────────────────────────────────────────────────────────────

interface FeedScreenProps {
  streak: number;
  questsDone: number;
  dailyCount: number;
  posts: FeedPostType[];
  onLike: (id: number) => void;
  onRefresh?: () => void;
}

const FeedScreen: React.FC<FeedScreenProps> = ({ streak, questsDone, dailyCount, posts, onLike, onRefresh }) => {
  const [loading, setLoading] = useState(true);
  const [pulling, setPulling] = useState(false);
  const [pullDist, setPullDist] = useState(0);
  const startY = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const countdown = useMidnightCountdown();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current != null) {
      const d = e.touches[0].clientY - startY.current;
      if (d > 0) setPullDist(Math.min(d, 80));
    }
  };
  const onTouchEnd = () => {
    if (pullDist > 60) {
      setPulling(true);
      setPullDist(50);
      setTimeout(() => {
        setPulling(false);
        setPullDist(0);
        onRefresh?.();
      }, 1200);
    } else {
      setPullDist(0);
    }
    startY.current = null;
  };

  return (
    <div
      className="scroll"
      ref={scrollRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ transform: pullDist ? `translateY(${pullDist}px)` : 'none', transition: startY.current ? undefined : 'transform .25s ease' }}
    >
      {(pullDist > 6 || pulling) && (
        <div className="center" style={{ height: 40, marginTop: -40, color: 'var(--blue)' }}>
          <div className="spinner" style={{ width: 24, height: 24, borderTopColor: 'var(--blue)', borderColor: 'rgba(0,122,255,0.2)', borderTopWidth: 3, borderWidth: 3 }}/>
        </div>
      )}

      <div className="page-pad">
        {/* Streak card */}
        <div className="card pad" style={{ marginBottom: 14, background: 'linear-gradient(135deg, #FFE5B0 0%, #FFB7B0 100%)', boxShadow: '0 8px 24px rgba(255,140,80,0.15)' }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 10 }}>
            <div>
              <div className="row" style={{ gap: 8, alignItems: 'baseline' }}>
                <AnimatedNumber value={streak} className="big-num" style={{ fontSize: 46, color: '#7A2E00', lineHeight: 1 }}/>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#9A4400' }}>дней подряд</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#9A4400', fontWeight: 600, marginBottom: 2 }}>До сброса</div>
              <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: '#7A2E00' }}>{countdown}</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: '#7A2E00', fontWeight: 500, lineHeight: 1.35 }}>
            Сделай ещё хотя бы один снэп сегодня, чтобы не сбрасывать
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div className="card" style={{ padding: '14px 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--gray)', marginBottom: 4, fontWeight: 600, letterSpacing: '-0.01em' }}>Всего квестов</div>
            <AnimatedNumber value={questsDone} className="big-num" style={{ fontSize: 26, color: 'var(--dark)' }}/>
          </div>
          <div className="card" style={{ padding: '14px 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--gray)', marginBottom: 4, fontWeight: 600, letterSpacing: '-0.01em' }}>Сегодня</div>
            <AnimatedNumber value={dailyCount} className="big-num" style={{ fontSize: 26, color: 'var(--blue)' }}/>
          </div>
        </div>

        {/* Posts */}
        {loading
          ? <><FeedSkeleton/><FeedSkeleton/><FeedSkeleton/></>
          : posts.map(p => <FeedPost key={p.id} post={p} onLike={onLike}/>)
        }
      </div>
    </div>
  );
};

export default FeedScreen;
