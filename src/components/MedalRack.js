import React from 'react';
import { MEDALS, getUnlockedMedals } from '../utils/achievements';

/**
 * MedalRack
 * Displays campaign medals and tactical decorations awarded to the commander
 */
const MedalRack = ({ userId = 'guest' }) => {
  const unlocked = getUnlockedMedals(userId);
  const unlockedCount = Object.keys(unlocked).length;

  return (
    <div className="medal-rack-container" style={{ marginTop: '1.25rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--nav-lighter)',
        paddingBottom: '0.4rem',
        marginBottom: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="mono" style={{ color: 'var(--nav-gold)', fontSize: '0.72rem', letterSpacing: '1px', fontWeight: 'bold' }}>
            DÉCORATIONS & MÉDAILLES DE CAMPAGNE
          </span>
        </div>
        <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--nav-slate)' }}>
          {unlockedCount} / {MEDALS.length} DÉBLOQUÉE{unlockedCount > 1 ? 'S' : ''}
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
        gap: '0.5rem'
      }}>
        {MEDALS.map(medal => {
          const isUnlocked = !!unlocked[medal.id];
          return (
            <div
              key={medal.id}
              className={`medal-cell mono ${isUnlocked ? 'unlocked' : 'locked'}`}
              style={{
                background: isUnlocked ? 'rgba(2, 12, 27, 0.7)' : 'rgba(2, 12, 27, 0.4)',
                border: `1px solid ${isUnlocked ? medal.color : 'rgba(136, 146, 176, 0.15)'}`,
                borderRadius: '5px',
                padding: '0.5rem 0.6rem',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                boxShadow: isUnlocked ? `0 0 10px ${medal.color}22` : 'none',
                opacity: isUnlocked ? 1 : 0.6
              }}
              title={`${medal.title} [${medal.rarity}] : ${medal.desc}${isUnlocked && unlocked[medal.id]?.unlockedAt ? ` (Obtenue le ${new Date(unlocked[medal.id].unlockedAt).toLocaleDateString()})` : ''}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '1.15rem' }}>{medal.icon}</span>
                <span style={{
                  fontSize: '0.58rem',
                  color: isUnlocked ? medal.color : 'var(--nav-slate)',
                  background: isUnlocked ? `${medal.color}18` : 'transparent',
                  border: `1px solid ${isUnlocked ? `${medal.color}44` : 'rgba(136, 146, 176, 0.2)'}`,
                  padding: '1px 4px',
                  borderRadius: '2px',
                  fontWeight: 'bold'
                }}>
                  {isUnlocked ? medal.rarity.toUpperCase() : 'VERROUILLÉE'}
                </span>
              </div>

              <div>
                <div style={{
                  color: isUnlocked ? 'var(--nav-text)' : 'var(--nav-slate)',
                  fontWeight: 'bold',
                  fontSize: '0.72rem',
                  lineHeight: 1.2
                }}>
                  {medal.title}
                </div>
                <div style={{
                  color: 'var(--nav-slate)',
                  fontSize: '0.62rem',
                  marginTop: '2px',
                  lineHeight: 1.3
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
