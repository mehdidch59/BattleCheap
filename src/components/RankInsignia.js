import React from 'react';

/**
 * RankInsignia
 * Vector SVG Naval Insignia Badges for all 4 officer tiers
 */
const RankInsignia = ({ rankId, size = 32, className = '' }) => {
  switch (rankId) {
    case 'amiral':
      // Four golden/cyan stars arranged in diamond with laurel wreath
      return (
        <svg viewBox="0 0 48 48" width={size} height={size} fill="none" className={className} aria-label="Insigne d'Amiral">
          {/* Circular Laurel Wreath */}
          <circle cx="24" cy="24" r="21" stroke="#64ffda" strokeWidth="1.2" strokeDasharray="4 2" opacity="0.6" />
          <circle cx="24" cy="24" r="18" stroke="rgba(100, 255, 218, 0.25)" strokeWidth="1" />
          {/* 4 Admiral Stars */}
          {/* Top Star */}
          <polygon points="24,10 25.5,14 29.5,14 26.5,16.5 27.5,20.5 24,18 20.5,20.5 21.5,16.5 18.5,14 22.5,14" fill="#64ffda" />
          {/* Bottom Star */}
          <polygon points="24,28 25.5,32 29.5,32 26.5,34.5 27.5,38.5 24,36 20.5,38.5 21.5,34.5 18.5,32 22.5,32" fill="#64ffda" />
          {/* Left Star */}
          <polygon points="15,19 16.5,23 20.5,23 17.5,25.5 18.5,29.5 15,27 11.5,29.5 12.5,25.5 9.5,23 13.5,23" fill="#64ffda" />
          {/* Right Star */}
          <polygon points="33,19 34.5,23 38.5,23 35.5,25.5 36.5,29.5 33,27 29.5,29.5 30.5,25.5 27.5,23 31.5,23" fill="#64ffda" />
        </svg>
      );

    case 'vaisseau':
      // Gold crossed anchors with 3 officer stripes
      return (
        <svg viewBox="0 0 48 48" width={size} height={size} fill="none" className={className} aria-label="Insigne de Capitaine de Vaisseau">
          {/* Outer Shield */}
          <polygon points="24,4 42,10 42,28 24,44 6,28 6,10" fill="rgba(255, 204, 0, 0.12)" stroke="#ffcc00" strokeWidth="1.5" />
          {/* Crossed Anchor */}
          <circle cx="24" cy="16" r="3.5" fill="none" stroke="#ffcc00" strokeWidth="1.5" />
          <line x1="24" y1="19.5" x2="24" y2="35" stroke="#ffcc00" strokeWidth="2" />
          <line x1="17" y1="23" x2="31" y2="23" stroke="#ffcc00" strokeWidth="2" />
          <path d="M 14,29 C 14,37 34,37 34,29" fill="none" stroke="#ffcc00" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'fregate':
      // Silver anchor flanked by laurel leaves
      return (
        <svg viewBox="0 0 48 48" width={size} height={size} fill="none" className={className} aria-label="Insigne de Capitaine de Frégate">
          <circle cx="24" cy="24" r="20" fill="rgba(192, 192, 192, 0.1)" stroke="#c0c0c0" strokeWidth="1.5" />
          <circle cx="24" cy="15" r="3" fill="none" stroke="#c0c0c0" strokeWidth="1.5" />
          <line x1="24" y1="18" x2="24" y2="33" stroke="#c0c0c0" strokeWidth="1.8" />
          <line x1="18" y1="21" x2="30" y2="21" stroke="#c0c0c0" strokeWidth="1.8" />
          <path d="M 15,27 C 15,35 33,35 33,27" fill="none" stroke="#c0c0c0" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );

    case 'enseigne':
    default:
      // Bronze naval anchor
      return (
        <svg viewBox="0 0 48 48" width={size} height={size} fill="none" className={className} aria-label="Insigne d'Enseigne">
          <rect x="6" y="6" width="36" height="36" rx="6" fill="rgba(205, 127, 50, 0.1)" stroke="#cd7f32" strokeWidth="1.5" />
          <circle cx="24" cy="16" r="3" fill="none" stroke="#cd7f32" strokeWidth="1.5" />
          <line x1="24" y1="19" x2="24" y2="33" stroke="#cd7f32" strokeWidth="1.8" />
          <line x1="19" y1="22" x2="29" y2="22" stroke="#cd7f32" strokeWidth="1.8" />
          <path d="M 16,28 C 16,34 32,34 32,28" fill="none" stroke="#cd7f32" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
  }
};

export default RankInsignia;
