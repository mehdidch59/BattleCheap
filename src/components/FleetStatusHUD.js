import React from 'react';
import { ShipHealthStatus } from './ShipGraphic';

const FleetStatusHUD = ({
  playerShips = [],
  enemyShips = [],
  myShots = [],
  opponentShots = [],
  turnCount = 1
}) => {
  // Player accuracy
  const totalMyShots = myShots.length;
  const myHits = myShots.filter(s => s.hit).length;
  const myAccuracy = totalMyShots > 0 ? Math.round((myHits / totalMyShots) * 100) : 0;

  // Count surviving ships
  const shotMapOpponent = new Set(opponentShots.map(s => `${s.x},${s.y}`));
  const playerSurviving = playerShips.filter(ship =>
    !ship.positions.every(p => shotMapOpponent.has(`${p.x},${p.y}`))
  ).length;

  const shotMapMe = new Set(myShots.map(s => `${s.x},${s.y}`));
  const enemySurviving = enemyShips.filter(ship =>
    !ship.positions.every(p => shotMapMe.has(`${p.x},${p.y}`))
  ).length;

  return (
    <div className="fleet-status-hud tactical-panel" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--nav-lighter)',
        paddingBottom: '0.6rem',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="status-indicator online blink-slow"></span>
          <span className="mono" style={{ color: 'var(--nav-teal)', fontWeight: 'bold', fontSize: '0.85rem' }}>
            TÉLÉMÉTRIE DE FLOTTE & STATUT TACTIQUE
          </span>
        </div>
        <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--nav-slate)' }}>
          CYCLE DE COMBAT : <span style={{ color: 'var(--nav-text)', fontWeight: 'bold' }}>#{turnCount}</span>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1rem'
      }}>
        <div style={{ background: 'rgba(2, 12, 27, 0.6)', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--nav-lighter)', textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--nav-slate)' }}>FLOTTE ALLIÉE</div>
          <div className="mono" style={{ fontSize: '1.2rem', color: 'var(--nav-teal)', fontWeight: 'bold' }}>
            {playerSurviving} / {playerShips.length}
          </div>
        </div>

        <div style={{ background: 'rgba(2, 12, 27, 0.6)', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--nav-lighter)', textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--nav-slate)' }}>FORCES ENNEMIES</div>
          <div className="mono" style={{ fontSize: '1.2rem', color: 'var(--nav-red)', fontWeight: 'bold' }}>
            {enemySurviving} / {enemyShips.length}
          </div>
        </div>

        <div style={{ background: 'rgba(2, 12, 27, 0.6)', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--nav-lighter)', textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--nav-slate)' }}>SALVES TIRÉES</div>
          <div className="mono" style={{ fontSize: '1.2rem', color: 'var(--nav-text)', fontWeight: 'bold' }}>
            {totalMyShots}
          </div>
        </div>

        <div style={{ background: 'rgba(2, 12, 27, 0.6)', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--nav-lighter)', textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--nav-slate)' }}>PRÉCISION DU TIR</div>
          <div className="mono" style={{ fontSize: '1.2rem', color: myAccuracy >= 40 ? 'var(--nav-teal)' : 'var(--nav-gold)', fontWeight: 'bold' }}>
            {myAccuracy}%
          </div>
        </div>
      </div>

      {/* Fleets Ships Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {/* Friendly Ships */}
        <div>
          <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--nav-teal)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>FORMATION NAVALE ALLIÉE</span>
            <span>{playerSurviving} OPÉRATIONNEL(S)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {playerShips.map(ship => (
              <ShipHealthStatus key={ship.id} ship={ship} shots={opponentShots} isEnemy={false} />
            ))}
          </div>
        </div>

        {/* Hostile Ships */}
        <div>
          <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--nav-red)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>FLOTTILLE ENNEMIE</span>
            <span>{enemyShips.length - enemySurviving} DÉTRUIT(S)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {enemyShips.map(ship => (
              <ShipHealthStatus key={ship.id} ship={ship} shots={myShots} isEnemy={true} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FleetStatusHUD;
