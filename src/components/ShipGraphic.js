import React from 'react';

// Crisp military SVG silhouettes for all 5 warship classes
export const ShipIcon = ({ type, size = 32, color = 'currentColor', className = '' }) => {
  switch (type) {
    case 'carrier':
      return (
        <svg viewBox="0 0 100 24" width={size * 3.5} height={size * 0.85} fill="none" className={className} style={{ verticalAlign: 'middle' }}>
          {/* Aircraft Carrier flight deck & hull */}
          <path d="M 4 18 L 8 4 L 92 4 L 98 12 L 94 18 Z" fill="rgba(100, 255, 218, 0.15)" stroke={color} strokeWidth="1.5" />
          <line x1="15" y1="11" x2="85" y2="11" stroke={color} strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
          {/* Angled landing strip stripe */}
          <line x1="20" y1="16" x2="65" y2="6" stroke={color} strokeWidth="1" opacity="0.4" />
          {/* Island / Bridge */}
          <rect x="70" y="2" width="14" height="6" fill={color} opacity="0.8" rx="1" />
          <line x1="77" y1="2" x2="77" y2="0" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case 'cruiser':
    case 'battleship':
      return (
        <svg viewBox="0 0 90 22" width={size * 3} height={size * 0.75} fill="none" className={className} style={{ verticalAlign: 'middle' }}>
          {/* Cruiser sleek armored hull */}
          <path d="M 5 16 L 12 6 L 76 6 L 86 16 Z" fill="rgba(100, 255, 218, 0.15)" stroke={color} strokeWidth="1.5" />
          {/* Bridge superstructure */}
          <rect x="36" y="2" width="18" height="6" fill={color} opacity="0.8" rx="1" />
          <line x1="45" y1="2" x2="45" y2="0" stroke={color} strokeWidth="1.5" />
          {/* Main turrets */}
          <circle cx="20" cy="11" r="3" fill={color} opacity="0.9" />
          <line x1="20" y1="11" x2="10" y2="10" stroke={color} strokeWidth="1.5" />
          <circle cx="68" cy="11" r="3" fill={color} opacity="0.9" />
          <line x1="68" y1="11" x2="78" y2="10" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case 'destroyer':
      return (
        <svg viewBox="0 0 75 20" width={size * 2.5} height={size * 0.7} fill="none" className={className} style={{ verticalAlign: 'middle' }}>
          {/* Destroyer fast agile hull */}
          <path d="M 4 15 L 12 6 L 62 6 L 72 15 Z" fill="rgba(100, 255, 218, 0.15)" stroke={color} strokeWidth="1.5" />
          {/* Bridge */}
          <polygon points="32,6 36,2 48,2 52,6" fill={color} opacity="0.8" />
          <line x1="42" y1="2" x2="42" y2="0" stroke={color} strokeWidth="1.5" />
          {/* Missile cell */}
          <rect x="18" y="8" width="8" height="4" stroke={color} strokeWidth="1" />
        </svg>
      );
    case 'submarine':
      return (
        <svg viewBox="0 0 75 20" width={size * 2.5} height={size * 0.7} fill="none" className={className} style={{ verticalAlign: 'middle' }}>
          {/* Submarine hydrodynamic hull */}
          <path d="M 6 12 C 6 6, 20 5, 40 5 C 60 5, 70 7, 72 12 C 70 17, 60 19, 40 19 C 20 19, 6 18, 6 12 Z" fill="rgba(100, 255, 218, 0.15)" stroke={color} strokeWidth="1.5" />
          {/* Sail / Conning tower */}
          <path d="M 32 5 L 34 1 L 40 1 L 42 5 Z" fill={color} opacity="0.8" />
          <line x1="37" y1="1" x2="37" y2="-1" stroke={color} strokeWidth="1.5" />
          {/* Rudder / Propeller */}
          <line x1="72" y1="8" x2="72" y2="16" stroke={color} strokeWidth="2" />
        </svg>
      );
    case 'patrol':
    default:
      return (
        <svg viewBox="0 0 55 18" width={size * 1.8} height={size * 0.65} fill="none" className={className} style={{ verticalAlign: 'middle' }}>
          {/* Fast patrol gunboat */}
          <path d="M 4 14 L 10 5 L 45 5 L 52 14 Z" fill="rgba(100, 255, 218, 0.15)" stroke={color} strokeWidth="1.5" />
          <polygon points="22,5 25,2 34,2 37,5" fill={color} opacity="0.8" />
          <circle cx="15" cy="9" r="2.5" fill={color} opacity="0.9" />
          <line x1="15" y1="9" x2="8" y2="8" stroke={color} strokeWidth="1.5" />
        </svg>
      );
  }
};

// High-fidelity blueprint vector graphic for large-scale showcase
export const ShipGraphic = ({ type, size = 52, color = 'var(--nav-teal)', className = '' }) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <ShipIcon type={type} size={size} color={color} className={className} />
    </div>
  );
};

// Tactical health status pill for a ship
export const ShipHealthStatus = ({ ship, shots = [], isEnemy = false }) => {
  const shotMap = new Set(shots.map(s => `${s.x},${s.y}`));
  const hitCount = ship.positions ? ship.positions.filter(pos => shotMap.has(`${pos.x},${pos.y}`)).length : 0;
  const isSunk = hitCount === ship.size;

  const color = isSunk ? 'var(--nav-red)' : isEnemy ? 'var(--nav-text)' : 'var(--nav-teal)';

  return (
    <div className={`ship-health-card ${isSunk ? 'sunk' : ''}`} style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.4rem 0.6rem',
      background: isSunk ? 'rgba(255, 71, 87, 0.12)' : 'rgba(10, 25, 47, 0.6)',
      border: `1px solid ${isSunk ? 'var(--nav-red)' : 'var(--nav-lighter)'}`,
      borderRadius: '4px',
      gap: '0.5rem',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ShipIcon type={ship.icon || ship.key} size={18} color={color} />
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color, letterSpacing: '1px' }}>
            {ship.name}
          </div>
          <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--nav-slate)' }}>
            {ship.code} • {isSunk ? 'DÉTRUIT' : `${hitCount}/${ship.size} DÉGÂTS`}
          </div>
        </div>
      </div>

      {/* Segments representation */}
      <div style={{ display: 'flex', gap: '3px' }}>
        {Array.from({ length: ship.size }).map((_, i) => {
          const isHit = i < hitCount;
          return (
            <div
              key={i}
              style={{
                width: '10px',
                height: '14px',
                borderRadius: '2px',
                background: isHit ? 'var(--nav-red)' : isEnemy ? 'rgba(136, 146, 176, 0.3)' : 'var(--nav-teal)',
                boxShadow: isHit ? '0 0 6px var(--nav-red)' : isEnemy ? 'none' : '0 0 4px rgba(100, 255, 218, 0.3)',
                transition: 'all 0.2s ease'
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
