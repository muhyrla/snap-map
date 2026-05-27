import React, { useState, useEffect, useRef } from 'react';
import { IconBolt, IconBell, IconGear, IconHome, IconStar, IconCamera, IconTarget, IconCart } from '../icons';
import { AppUser, levelFor } from '../data';

// ─── AnimatedNumber ───────────────────────────────────────────────────────────

interface AnimatedNumberProps { value: number; duration?: number; className?: string; style?: React.CSSProperties; }

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, duration = 700, className = 'big-num', style }) => {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    fromRef.current = display;
    startRef.current = null;
    let raf: number;
    const tick = (t: number) => {
      if (startRef.current == null) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(fromRef.current + (value - fromRef.current) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]); // eslint-disable-line

  return <span className={className} style={style}>{display.toLocaleString('ru-RU')}</span>;
};

// ─── ProgressRing ─────────────────────────────────────────────────────────────

interface ProgressRingProps { size?: number; stroke?: number; value?: number; color?: string; bg?: string; className?: string; }

export const ProgressRing: React.FC<ProgressRingProps> = ({ size = 40, stroke = 3, value = 0.5, color = 'var(--blue)', bg = 'rgba(141,153,174,0.25)', className = 'progress-ring' }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - value * c;
  return (
    <svg className={className} width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={bg} strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset .5s ease' }}/>
    </svg>
  );
};

// ─── AvatarWithLevel ──────────────────────────────────────────────────────────

interface AvatarProps { user: AppUser; size?: number; fontSize?: number; gradient?: string; showLevel?: boolean; big?: boolean; }

export const AvatarWithLevel: React.FC<AvatarProps> = ({ user, size = 32, fontSize = 12, gradient = 'linear-gradient(135deg,#007AFF,#5856D6)', showLevel = true, big = false }) => {
  const lvl = levelFor(user.questsDone);
  return (
    <div className="avatar-wrap">
      <div className="avatar" style={{ width: size, height: size, flexBasis: size, fontSize, background: gradient, color: '#fff' }}>{user.username[0]}</div>
      {showLevel && <span className={`level-pip${big ? ' lg' : ''}`}>{big ? `LVL ${lvl}` : lvl}</span>}
    </div>
  );
};

// ─── PhotoTile ────────────────────────────────────────────────────────────────

interface PhotoTileProps { image?: string; emoji?: string; aspect?: string; children?: React.ReactNode; style?: React.CSSProperties; }

export const PhotoTile: React.FC<PhotoTileProps> = ({ image, emoji, aspect = '4/3', children, style }) => {
  const isUrl = typeof image === 'string' && image.startsWith('url(');
  return (
    <div className="photo" style={{ aspectRatio: aspect, backgroundImage: image, ...style }}>
      {!isUrl && emoji && (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'42px', filter:'drop-shadow(0 2px 6px rgba(0,0,0,0.4))' }}>{emoji}</div>
      )}
      {children}
    </div>
  );
};

// ─── Toast ────────────────────────────────────────────────────────────────────

export const Toast: React.FC<{ text: string }> = ({ text }) => <div className="toast">{text}</div>;

// ─── Dialog ───────────────────────────────────────────────────────────────────

interface DialogProps { title: string; text?: string; confirmLabel?: string; cancelLabel?: string; confirmDanger?: boolean; onConfirm: () => void; onCancel: () => void; }

export const Dialog: React.FC<DialogProps> = ({ title, text, confirmLabel = 'OK', cancelLabel = 'Отмена', confirmDanger, onConfirm, onCancel }) => (
  <div className="overlay" onClick={onCancel}>
    <div className="dialog" onClick={e => e.stopPropagation()}>
      <div className="h2" style={{ marginBottom: 8 }}>{title}</div>
      {text && <div className="muted" style={{ marginBottom: 18 }}>{text}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn outlined block" onClick={onCancel}>{cancelLabel}</button>
        <button className={`btn block ${confirmDanger ? '' : 'primary'}`} style={confirmDanger ? { background: 'var(--red)', color: '#fff' } : undefined} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </div>
  </div>
);

// ─── Header ───────────────────────────────────────────────────────────────────

interface HeaderProps { user: AppUser; unread: number; activeQuests: number; onBell: () => void; onGear: () => void; onProfile: () => void; }

export const Header: React.FC<HeaderProps> = ({ user, unread, onBell, onGear, onProfile }) => (
  <header className="app-header">
    <div className="user-pill" onClick={onProfile} role="button" style={{ alignItems: 'center', cursor: 'pointer' }}>
      <AvatarWithLevel user={user} size={38} fontSize={14}/>
      <div className="stack" style={{ gap: 3, minWidth: 0 }}>
        <span className="user-name" style={{ fontSize: 13, fontWeight: 600 }}>{user.username}</span>
        <div className="row" style={{ gap: 5 }}>
          <span className="balance-chip" style={{ fontSize: 10, padding: '2px 7px', gap: 3 }}>
            <IconBolt size={11}/><AnimatedNumber value={user.balance} className=""/>
          </span>
        </div>
      </div>
    </div>
    <div className="stack" style={{ alignItems: 'center' }}>
      <div className="brand">SnapMap</div>
    </div>
    <div className="header-actions">
      <button className="icon-btn" onClick={onBell} aria-label="Уведомления">
        <IconBell size={20}/>
        {unread > 0 && <span className="badge-dot">{unread}</span>}
      </button>
      <button className="icon-btn" onClick={onGear} aria-label="Настройки">
        <IconGear size={20}/>
      </button>
    </div>
  </header>
);

// ─── BottomNav ────────────────────────────────────────────────────────────────

export type TabId = 'feed' | 'rank' | 'snap' | 'quests' | 'market';

interface BottomNavProps { active: TabId; onChange: (id: TabId) => void; activeQuests: number; dailyProgress: number; }

export const BottomNav: React.FC<BottomNavProps> = ({ active, onChange, activeQuests }) => {
  const tabs: { id: TabId; label: string; Icon: React.FC<any>; center?: boolean; badge?: number }[] = [
    { id: 'feed',   label: 'Лента',   Icon: IconHome },
    { id: 'rank',   label: 'Рейтинг', Icon: IconStar },
    { id: 'snap',   label: 'SnapMap', Icon: IconCamera, center: true },
    { id: 'quests', label: 'Квесты',  Icon: IconTarget, badge: activeQuests },
    { id: 'market', label: 'Маркет',  Icon: IconCart },
  ];

  return (
    <nav className="bottom-nav floating">
      {tabs.map(t => {
        const isActive = active === t.id;
        return (
          <button key={t.id} className={`nav-tab${isActive ? ' active' : ''}${t.center ? ' center' : ''}`} onClick={() => onChange(t.id)}>
            <span className="nav-icon">
              <t.Icon size={22}/>
              {t.badge ? <span className="tab-badge">{t.badge}</span> : null}
            </span>
            <span>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
