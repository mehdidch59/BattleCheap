import React from 'react';

export const RadarIcon = ({ size = 24, color = 'var(--nav-teal)', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" className={className}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" strokeDasharray="3 2" />
    <circle cx="12" cy="12" r="2" fill={color} />
    <line x1="12" y1="12" x2="20" y2="4" />
    <path d="M 12 2 L 12 22 M 2 12 L 22 12" opacity="0.3" strokeDasharray="2 2" />
  </svg>
);

export const AiChipIcon = ({ size = 24, color = 'var(--nav-gold)', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" className={className}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="8" y="8" width="8" height="8" rx="1" fill={color} fillOpacity="0.2" />
    <line x1="1" y1="9" x2="4" y2="9" />
    <line x1="1" y1="15" x2="4" y2="15" />
    <line x1="20" y1="9" x2="23" y2="9" />
    <line x1="20" y1="15" x2="23" y2="15" />
    <line x1="9" y1="1" x2="9" y2="4" />
    <line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" />
    <line x1="15" y1="20" x2="15" y2="23" />
  </svg>
);

export const SatelliteIcon = ({ size = 24, color = 'var(--nav-teal)', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" className={className}>
    <circle cx="12" cy="12" r="2" fill={color} />
    <path d="M 4.93 4.93 A 10 10 0 0 1 19.07 4.93" />
    <path d="M 7.76 7.76 A 6 6 0 0 1 16.24 7.76" />
    <path d="M 12 14 L 12 22" />
    <path d="M 9 22 L 15 22" />
  </svg>
);

export const MedalIcon = ({ size = 20, color = 'var(--nav-teal)', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" className={className}>
    <circle cx="12" cy="14" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    <polygon points="12 11 13.5 14 16.5 14 14 16 15 19 12 17 9 19 10 16 7.5 14 10.5 14" fill={color} />
  </svg>
);

export const CrosshairIcon = ({ size = 20, color = 'var(--nav-red)', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" className={className}>
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="3" x2="12" y2="7" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <line x1="3" y1="12" x2="7" y2="12" />
    <line x1="17" y1="12" x2="21" y2="12" />
    <circle cx="12" cy="12" r="2" fill={color} />
  </svg>
);

export const SkullIcon = ({ size = 20, color = 'var(--nav-red)', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" className={className}>
    <path d="M 9 21 L 9 18 M 15 21 L 15 18 M 9 21 L 15 21" />
    <path d="M 5 11 A 7 7 0 1 1 19 11 C 19 14.5 16 16.5 16 18 L 8 18 C 8 16.5 5 14.5 5 11 Z" />
    <circle cx="9" cy="11" r="1.5" fill={color} />
    <circle cx="15" cy="11" r="1.5" fill={color} />
  </svg>
);

export const SoundWaveIcon = ({ size = 20, color = 'var(--nav-teal)', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" className={className}>
    <line x1="3" y1="12" x2="3" y2="12.01" strokeWidth="3" />
    <line x1="7" y1="8" x2="7" y2="16" />
    <line x1="11" y1="5" x2="11" y2="19" />
    <line x1="15" y1="9" x2="15" y2="15" />
    <line x1="19" y1="6" x2="19" y2="18" />
    <line x1="23" y1="12" x2="23" y2="12.01" strokeWidth="3" />
  </svg>
);

export const ShieldIcon = ({ size = 20, color = 'var(--nav-teal)', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" className={className}>
    <path d="M 12 2 L 20 6 L 20 12 C 20 17 16 21 12 22 C 8 21 4 17 4 12 L 4 6 Z" />
  </svg>
);

export const SoundOnIcon = ({ size = 18, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" className={className}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill={color} fillOpacity="0.2" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

export const SoundMuteIcon = ({ size = 18, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" className={className}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill={color} fillOpacity="0.2" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

export const ClipboardIcon = ({ size = 16, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" className={className}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

export const LinkIcon = ({ size = 16, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" className={className}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

export const FlagIcon = ({ size = 16, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" className={className}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

export const BookManualIcon = ({ size = 16, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" className={className}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

export const DiceIcon = ({ size = 16, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="8" cy="8" r="1.2" fill={color} />
    <circle cx="16" cy="8" r="1.2" fill={color} />
    <circle cx="12" cy="12" r="1.2" fill={color} />
    <circle cx="8" cy="16" r="1.2" fill={color} />
    <circle cx="16" cy="16" r="1.2" fill={color} />
  </svg>
);

export const RotateIcon = ({ size = 16, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21.5 2v6h-6" />
    <path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.19" />
  </svg>
);

export const UndoIcon = ({ size = 16, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);

export const CheckIcon = ({ size = 16, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const UserBadgeIcon = ({ size = 16, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" className={className}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="2.5" />
    <path d="M15 8h4 M15 12h4 M6 16c0-1.5 1.5-2.5 3-2.5s3 1 3 2.5" />
  </svg>
);

export const EditIcon = ({ size = 14, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" className={className}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export const CloseIcon = ({ size = 16, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const SwordsIcon = ({ size = 16, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
    <line x1="13" y1="19" x2="19" y2="13" />
    <line x1="16" y1="16" x2="20" y2="20" />
    <line x1="19" y1="21" x2="21" y2="19" />
    <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
    <line x1="5" y1="14" x2="9" y2="18" />
    <line x1="7" y1="17" x2="3" y2="21" />
    <line x1="2" y1="19" x2="4" y2="21" />
  </svg>
);

export const ZapIcon = ({ size = 18, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill={color} fillOpacity="0.2" />
  </svg>
);

export const AnchorIcon = ({ size = 18, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="5" r="3" />
    <line x1="12" y1="8" x2="12" y2="21" />
    <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
    <path d="M8 12h8" />
  </svg>
);
