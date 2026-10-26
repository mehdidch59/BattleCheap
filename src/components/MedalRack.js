import React from 'react';
import { MEDALS, getUnlockedMedals } from '../utils/achievements';
import {
  CrosshairIcon,
  ZapIcon,
  ShieldIcon,
  AiChipIcon,
  SwordsIcon,
  AnchorIcon,
  MedalIcon
} from './TacticalIcons';

/**
 * Tactical SVG Icon Mapper for Medals
 */
const renderMedalIcon = (medalId, color, size = 18) => {
  switch (medalId) {
    case 'elite_shot':
      return <CrosshairIcon size={size} color={color} />;
    case 'blitzkrieg':
      return <ZapIcon size={size} color={color} />;
    case 'carrier_intact':
      return <ShieldIcon size={size} color={color} />;
    case 'admiral_slayer':
      return <AiChipIcon size={size} color={color} />;
    case 'veteran':
      return <SwordsIcon size={size} color={color} />;
    case 'naval_legend':
      return <AnchorIcon size={size} color={color} />;
    default:
      return <MedalIcon size={size} color={color} />;
  }
};

/**
 * MedalRack
 * Displays campaign medals and tactical decorations awarded to the commander
 */
const MedalRack = ({ userId = 'guest' }) => {
  const unlocked = getUnlockedMedals(userId);
  const unlockedCount = Object.keys(unlocked).length;

  return (
    <div className="medal-rack-container">
      {/* Rack Header */}
      <div className="medal-rack-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MedalIcon size={14} color="var(--nav-gold)" />
          <span className="mono" style={{ color: 'var(--nav-gold)', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: 'bold' }}>
            DÉCORATIONS & MÉDAILLES DE CAMPAGNE
          </span>
        </div>
        <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--nav-slate)' }}>
          {unlockedCount} / {MEDALS.length} DÉBLOQUÉE{unlockedCount > 1 ? 'S' : ''}
        </span>
      </div>

      {/* Responsive 6-Col Grid with Balanced Full-Width Layout */}
      <div className="medal-rack-grid">
        {MEDALS.map(medal => {
          const isUnlocked = !!unlocked[medal.id];
          const iconColor = isUnlocked ? medal.color : 'var(--nav-slate)';

          return (
            <div
              key={medal.id}
              className={`medal-cell mono ${isUnlocked ? 'unlocked' : 'locked'}`}
              style={{
                borderColor: isUnlocked ? medal.color : 'rgba(136, 146, 176, 0.16)',
                boxShadow: isUnlocked ? `0 0 12px ${medal.color}25` : 'none'
              }}
              title={`${medal.title} [${medal.rarity}] : ${medal.desc}${isUnlocked && unlocked[medal.id]?.unlockedAt ? ` (Obtenue le ${new Date(unlocked[medal.id].unlockedAt).toLocaleDateString()})` : ''}`}
            >
              {/* Cell Header: Vector Icon Box + Status/Rarity Chip */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isUnlocked ? `${medal.color}15` : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${isUnlocked ? `${medal.color}35` : 'rgba(255, 255, 255, 0.06)'}`,
                  flexShrink: 0
                }}>
                  {renderMedalIcon(medal.id, iconColor, 17)}
                </div>

                <span style={{
                  fontSize: '0.6rem',
                  letterSpacing: '0.5px',
                  color: isUnlocked ? medal.color : 'var(--nav-slate)',
                  background: isUnlocked ? `${medal.color}18` : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${isUnlocked ? `${medal.color}40` : 'rgba(136, 146, 176, 0.2)'}`,
                  padding: '2px 5px',
                  borderRadius: '3px',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap'
                }}>
                  {isUnlocked ? medal.rarity.toUpperCase() : 'VERROUILLÉE'}
                </span>
              </div>

              {/* Cell Body: Title & Objective Description */}
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'flex-start' }}>
                <div style={{
                  color: isUnlocked ? 'var(--nav-text)' : 'var(--nav-slate)',
                  fontWeight: 'bold',
                  fontSize: '0.76rem',
                  lineHeight: 1.25,
                  marginBottom: '3px'
                }}>
                  {medal.title}
                </div>
                <div style={{
                  color: 'var(--nav-slate)',
                  fontSize: '0.64rem',
                  lineHeight: 1.35
                }}>
                  {medal.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MedalRack;
