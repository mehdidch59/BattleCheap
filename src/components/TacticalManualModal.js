import React from 'react';
import { SHIPS_CONFIG } from '../utils/gameAI';
import { RANKS } from '../utils/ranks';
import { ShipIcon } from './ShipGraphic';
import RankInsignia from './RankInsignia';
import { sound } from '../utils/audio';

/**
 * TacticalManualModal
 * Interactive Naval Command Field Manual & Rules of Engagement
 */
const TacticalManualModal = ({ onClose }) => {
  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 11, 24, 0.88)',
        backdropFilter: 'blur(8px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sound.playBlip();
          onClose();
        }
      }}
    >
      <div
        className="tactical-panel"
        style={{
          maxWidth: '750px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.75rem',
          boxShadow: '0 0 40px rgba(0, 0, 0, 0.9), 0 0 15px rgba(100, 255, 218, 0.2)'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--nav-teal)',
          paddingBottom: '0.75rem',
          marginBottom: '1.25rem'
        }}>
          <div>
            <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--nav-teal)', letterSpacing: '1.5px' }}>
              Q.G. NAVAL STRATÉGIQUE • PROTOCOLE DEFCON 1
            </div>
            <h3 style={{ margin: '3px 0 0', color: 'var(--nav-text)', fontSize: '1.35rem', letterSpacing: '2px' }}>
              MANUEL D'ENGAGEMENT TACTIQUE
            </h3>
          </div>
          <button
            onClick={() => { sound.playBlip(); onClose(); }}
            className="btn btn-secondary mono"
            style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}
          >
            ✕ FERMER
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Section 1: Flotte d'Intervention */}
          <div>
            <h4 className="mono" style={{ color: 'var(--nav-teal)', fontSize: '0.95rem', borderBottom: '1px solid var(--nav-lighter)', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
              1. UNITÉS NAVALES D'INTERVENTION
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem' }}>
              {SHIPS_CONFIG.map(ship => (
                <div key={ship.id} style={{ background: 'rgba(2, 12, 27, 0.6)', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--nav-lighter)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span className="mono" style={{ color: 'var(--nav-text)', fontWeight: 'bold', fontSize: '0.8rem' }}>{ship.name}</span>
                    <span className="mono" style={{ color: 'var(--nav-teal)', fontSize: '0.72rem' }}>{ship.size} CASES</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShipIcon shipId={ship.id} size={ship.size} color="var(--nav-teal)" />
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {Array.from({ length: ship.size }).map((_, i) => (
                        <div key={i} style={{ width: '8px', height: '8px', background: 'var(--nav-teal)', borderRadius: '1px' }} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Balistique & Stratégie */}
          <div>
            <h4 className="mono" style={{ color: 'var(--nav-teal)', fontSize: '0.95rem', borderBottom: '1px solid var(--nav-lighter)', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
              2. THÉORIE DU TIR & BALISTIQUE
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="manual-columns">
              <div style={{ background: 'rgba(2, 12, 27, 0.6)', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--nav-lighter)' }}>
                <div className="mono" style={{ color: 'var(--nav-gold)', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '4px' }}>
                  ■ STRATÉGIE DU DAMIER (PARITÉ)
                </div>
                <p style={{ color: 'var(--nav-slate)', fontSize: '0.78rem', margin: 0, lineHeight: 1.5 }}>
                  Le plus petit bâtiment mesurant 2 cases, tirer uniquement sur les cases de même parité mathématique <code>(x + y) % 2 === 0</code> garantit qu'aucun navire ne peut échapper à votre détection, divisant l'effort par deux.
                </p>
              </div>

              <div style={{ background: 'rgba(2, 12, 27, 0.6)', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--nav-lighter)' }}>
                <div className="mono" style={{ color: 'var(--nav-gold)', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '4px' }}>
                  ■ TRAQUE CARDINALE EN CROIX
                </div>
                <p style={{ color: 'var(--nav-slate)', fontSize: '0.78rem', margin: 0, lineHeight: 1.5 }}>
                  Dès qu'un tir touche une coque adverse, concentrez immédiatement les salves suivantes sur les 4 directions cardinales (Nord, Sud, Est, Ouest) pour identifier l'axe d'alignement et achever la cible.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Rangs Militaires OTAN */}
          <div>
            <h4 className="mono" style={{ color: 'var(--nav-teal)', fontSize: '0.95rem', borderBottom: '1px solid var(--nav-lighter)', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
              3. HIÉRARCHIE & RANGS NAVALS
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.6rem' }}>
              {RANKS.map(rank => (
                <div key={rank.id} style={{ background: rank.badgeBg, border: `1px solid ${rank.badgeBorder}`, padding: '0.6rem', borderRadius: '4px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                    <RankInsignia rankId={rank.id} size={30} />
                  </div>
                  <div className="mono" style={{ color: rank.color, fontWeight: 'bold', fontSize: '0.75rem' }}>
                    {rank.code} • {rank.shortTitle}
                  </div>
                  <div className="mono" style={{ color: 'var(--nav-slate)', fontSize: '0.68rem', marginTop: '2px' }}>
                    {rank.maxWins === Infinity ? '16+ victoires' : `${rank.minWins} - ${rank.maxWins} victoires`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Raccourcis Clavier du Front */}
          <div>
            <h4 className="mono" style={{ color: 'var(--nav-teal)', fontSize: '0.95rem', borderBottom: '1px solid var(--nav-lighter)', paddingBottom: '0.4rem', marginBottom: '0.75rem' }}>
              4. RACCOURCIS CLAVIER TACTIQUES
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
              {[
                { key: 'M', desc: 'Activer / Couper le son' },
                { key: 'Espace / Tab', desc: 'Basculer radar Offensif / Défensif' },
                { key: 'R', desc: 'Pivoter navire (Déploiement)' },
                { key: 'A', desc: 'Auto-déploiement aléatoire de la flotte' },
                { key: 'Z', desc: 'Annuler dernier navire placé' },
                { key: 'Entrée', desc: 'Valider le déploiement de flotte' }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(2, 12, 27, 0.6)', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid var(--nav-lighter)' }}>
                  <span className="mono" style={{ background: 'rgba(100, 255, 218, 0.15)', border: '1px solid var(--nav-teal)', color: 'var(--nav-teal)', padding: '2px 6px', borderRadius: '3px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                    {item.key}
                  </span>
                  <span className="mono" style={{ color: 'var(--nav-slate)', fontSize: '0.7rem' }}>
                    {item.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TacticalManualModal;
