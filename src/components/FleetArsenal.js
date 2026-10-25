import React, { useState } from 'react';
import { SHIPS_CONFIG } from '../utils/gameAI';
import ShipBlueprint from './ShipBlueprint';
import { sound } from '../utils/audio';

const FLEET_SPECS = {
  0: {
    role: 'Frappe Aéronavale Lourde',
    nato: 'AIRCRAFT CARRIER',
    armor: 'Composite Kevlar-Acier 100mm',
    weaponry: 'Aéronefs F/A-18 & Missiles Sea Sparrow',
    speed: '30 Nœuds',
    stealth: 'Basse (Signature Radar Élevée)'
  },
  1: {
    role: 'Escorte Antiaérienne & Missiles',
    nato: 'GUIDED MISSILE CRUISER',
    armor: 'Blindage Renforcé Double-Coque',
    weaponry: '122 Cellules VLS Tomahawk / SM-2',
    speed: '32 Nœuds',
    stealth: 'Moyenne (Contre-mesures actives)'
  },
  2: {
    role: 'Lutte Anti-Sous-Marine & Escadre',
    nato: 'DESTROYER MULTI-RÔLE',
    armor: 'Blindage Modulaire Haute Résistance',
    weaponry: 'Torpilles Mk-46 & Lanceur ASROC',
    speed: '31 Nœuds',
    stealth: 'Élevée (Coque furtive profilée)'
  },
  3: {
    role: 'Infiltration Furtive & Torpilles',
    nato: 'NUCLEAR ATTACK SUBMARINE',
    armor: 'Coque Titane Hyperbare',
    weaponry: '4 Tubes Torpilles 533mm Mk-48 ADCAP',
    speed: '25+ Nœuds (En immersion)',
    stealth: 'Maximale (Signature Acoustique Nulle)'
  },
  4: {
    role: 'Reconnaissance & Interception Rapide',
    nato: 'PATROL TORPEDO BOAT',
    armor: 'Alliage Léger Aluminium Renforcé',
    weaponry: '2 Tubes Torpilles Légères & Canon 20mm',
    speed: '41 Nœuds (Interception Éclair)',
    stealth: 'Élevée (Profil ultra-bas sur l\'eau)'
  }
};

const FleetArsenal = () => {
  const [selectedShipId, setSelectedShipId] = useState(0);

  const ship = SHIPS_CONFIG.find(s => s.id === selectedShipId) || SHIPS_CONFIG[0];
  const specs = FLEET_SPECS[ship.id] || FLEET_SPECS[0];

  const handleSelect = (id) => {
    sound.playBlip(750, 0.04);
    setSelectedShipId(id);
  };

  return (
    <div className="fleet-arsenal-container">
      {/* Header */}
      <div className="arsenal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="status-indicator online blink-slow" style={{ width: '8px', height: '8px' }} />
          <h4 style={{ margin: 0, fontSize: '0.95rem', letterSpacing: '1.5px', color: 'var(--nav-text)' }}>
            ARSENAL NAVAL DE LA FLOTTE
          </h4>
        </div>
        <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--nav-teal)' }}>
          5 CLASSES OPÉRATIONNELLES
        </span>
      </div>

      {/* Ship Class Selector Tabs (Stable, non-jitter hover) */}
      <div className="arsenal-tabs">
        {SHIPS_CONFIG.map(s => {
          const isActive = s.id === ship.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSelect(s.id)}
              className={`arsenal-tab-btn ${isActive ? 'active' : ''}`}
            >
              <span className="tab-dot" style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isActive ? 'var(--nav-teal)' : 'var(--nav-slate)',
                boxShadow: isActive ? '0 0 6px var(--nav-teal)' : 'none',
                display: 'inline-block'
              }} />
              <span style={{ fontWeight: isActive ? 'bold' : 'normal' }}>{s.name}</span>
              <span className="mono tab-badge" style={{
                fontSize: '0.68rem',
                opacity: isActive ? 1 : 0.7,
                background: isActive ? 'rgba(100, 255, 218, 0.2)' : 'rgba(255,255,255,0.06)',
                padding: '1px 6px',
                borderRadius: '3px'
              }}>
                {s.size} CASES
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Blueprint Stage */}
      <div className="arsenal-blueprint-stage">
        {/* Top Blueprint Telemetry Info */}
        <div className="blueprint-telemetry mono">
          <div className="blueprint-tag">
            <span style={{ color: 'var(--nav-slate)' }}>DÉSIGNATION :</span>{' '}
            <strong style={{ color: 'var(--nav-teal)', letterSpacing: '1px' }}>{ship.name.toUpperCase()}</strong>
          </div>
          <div className="blueprint-tag">
            <span style={{ color: 'var(--nav-slate)' }}>MATRICULE :</span>{' '}
            <span style={{ color: 'var(--nav-text)', fontWeight: 'bold' }}>{ship.code}</span>
          </div>
          <div className="blueprint-tag">
            <span style={{ color: 'var(--nav-slate)' }}>CLASSIFICATION OTAN :</span>{' '}
            <span style={{ color: 'var(--nav-slate)' }}>{specs.nato}</span>
          </div>
        </div>

        {/* High-Resolution Vector Blueprint Graphic Display */}
        <div className="blueprint-graphic-wrap">
          <ShipBlueprint type={ship.icon} color="var(--nav-teal)" />
        </div>

        {/* Footprint Cell Gauge */}
        <div className="blueprint-cells-gauge">
          <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--nav-slate)', marginRight: '10px' }}>
            EMPREINTE RADAR ({ship.size} CASES) :
          </span>
          <div style={{ display: 'inline-flex', gap: '5px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '3px',
                  border: `1px solid ${i < ship.size ? 'var(--nav-teal)' : 'var(--nav-lighter)'}`,
                  background: i < ship.size ? 'rgba(100, 255, 218, 0.25)' : 'rgba(255,255,255,0.02)',
                  boxShadow: i < ship.size ? '0 0 8px rgba(100, 255, 218, 0.25)' : 'none',
                  display: 'inline-block'
                }}
              />
            ))}
          </div>
        </div>

        {/* Technical Specs Bento Grid */}
        <div className="blueprint-specs-grid mono">
          <div className="spec-card">
            <div className="spec-label">MISSION & RÔLE</div>
            <div className="spec-value">{specs.role}</div>
          </div>
          <div className="spec-card">
            <div className="spec-label">SYSTÈME D'ARMES</div>
            <div className="spec-value">{specs.weaponry}</div>
          </div>
          <div className="spec-card">
            <div className="spec-label">VITESSE D'ENGAGEMENT</div>
            <div className="spec-value">{specs.speed}</div>
          </div>
          <div className="spec-card">
            <div className="spec-label">INDICE DE DISCRÉTION</div>
            <div className="spec-value">{specs.stealth}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FleetArsenal;
