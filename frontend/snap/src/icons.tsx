import React from 'react';

interface IconProps {
  size?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
  className?: string;
}

const Icon: React.FC<IconProps & { children: React.ReactNode }> = ({
  children, size = 22, fill = 'none', stroke = 'currentColor', strokeWidth = 1.8, ...rest
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {children}
  </svg>
);

export const IconHome: React.FC<IconProps> = (p) => <Icon {...p}><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/></Icon>;
export const IconStar: React.FC<IconProps> = (p) => <Icon {...p}><path d="m12 3 2.6 5.4 5.9.85-4.3 4.17 1 5.88L12 16.6l-5.2 2.7 1-5.88L3.5 9.25l5.9-.85L12 3Z"/></Icon>;
export const IconCamera: React.FC<IconProps> = (p) => <Icon {...p}><path d="M3 8.5A1.5 1.5 0 0 1 4.5 7H7l1.5-2h7L17 7h2.5A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5v-9Z"/><circle cx="12" cy="13" r="3.5"/></Icon>;
export const IconTarget: React.FC<IconProps> = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></Icon>;
export const IconCart: React.FC<IconProps> = (p) => <Icon {...p}><path d="M3 5h2.4L7 16h11l2-8H6.6"/><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/></Icon>;
export const IconBell: React.FC<IconProps> = (p) => <Icon {...p}><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Z"/><path d="M10 20a2 2 0 0 0 4 0"/></Icon>;
export const IconGear: React.FC<IconProps> = (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 13a7.6 7.6 0 0 0 0-2l2-1.5-2-3.4-2.3.9a7.7 7.7 0 0 0-1.7-1l-.4-2.4h-3.8l-.4 2.4a7.7 7.7 0 0 0-1.7 1l-2.3-.9-2 3.4 2 1.5a7.6 7.6 0 0 0 0 2l-2 1.5 2 3.4 2.3-.9a7.7 7.7 0 0 0 1.7 1l.4 2.4h3.8l.4-2.4a7.7 7.7 0 0 0 1.7-1l2.3.9 2-3.4-2-1.5Z"/></Icon>;
export const IconBolt: React.FC<IconProps> = (p) => <Icon {...p} fill="currentColor" stroke="none"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/></Icon>;
export const IconChevR: React.FC<IconProps> = (p) => <Icon {...p}><path d="m9 5 7 7-7 7"/></Icon>;
export const IconChevL: React.FC<IconProps> = (p) => <Icon {...p}><path d="m15 5-7 7 7 7"/></Icon>;
export const IconHeart: React.FC<IconProps> = (p) => <Icon {...p}><path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.65-7 10-7 10Z"/></Icon>;
export const IconShare: React.FC<IconProps> = (p) => <Icon {...p}><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M16 6 12 2 8 6"/><path d="M12 2v14"/></Icon>;
export const IconCheck: React.FC<IconProps> = (p) => <Icon {...p}><path d="m5 12 5 5L20 7"/></Icon>;
export const IconCross: React.FC<IconProps> = (p) => <Icon {...p}><path d="M6 6 18 18M18 6 6 18"/></Icon>;
export const IconRefresh: React.FC<IconProps> = (p) => <Icon {...p}><path d="M3 12a9 9 0 0 1 15.5-6.5L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.5L3 16"/><path d="M3 21v-5h5"/></Icon>;
export const IconCopy: React.FC<IconProps> = (p) => <Icon {...p}><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></Icon>;
export const IconFlash: React.FC<IconProps> = (p) => <Icon {...p}><path d="m13 2-9 12h6l-1 8 9-12h-6Z"/></Icon>;
export const IconLock: React.FC<IconProps> = (p) => <Icon {...p}><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></Icon>;
export const IconLocation: React.FC<IconProps> = (p) => <Icon {...p}><path d="M12 22s7-7 7-13a7 7 0 1 0-14 0c0 6 7 13 7 13Z"/><circle cx="12" cy="9" r="2.5"/></Icon>;
export const IconGlobe: React.FC<IconProps> = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></Icon>;
export const IconSignal: React.FC<IconProps> = () => (
  <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
    <rect x="0" y="8" width="3" height="4" rx="0.5"/><rect x="4" y="6" width="3" height="6" rx="0.5"/>
    <rect x="8" y="3" width="3" height="9" rx="0.5"/><rect x="12" y="0" width="3" height="12" rx="0.5" opacity="0.5"/>
  </svg>
);
export const IconWifi: React.FC<IconProps> = () => (
  <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M1 4a11 11 0 0 1 14 0M3 7a7 7 0 0 1 10 0M5.5 9.5a3 3 0 0 1 5 0"/>
    <circle cx="8" cy="11" r="0.8" fill="currentColor"/>
  </svg>
);
export const IconBattery: React.FC<IconProps> = () => (
  <svg width="22" height="12" viewBox="0 0 22 12" fill="none" stroke="currentColor" strokeWidth="1.2">
    <rect x="1" y="1" width="18" height="10" rx="2"/>
    <rect x="3" y="3" width="14" height="6" rx="1" fill="currentColor" stroke="none"/>
    <rect x="20" y="4" width="1.5" height="4" rx="0.7" fill="currentColor" stroke="none"/>
  </svg>
);
