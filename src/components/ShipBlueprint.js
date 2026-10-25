import React from 'react';

/**
 * ShipBlueprint
 * Ultra-crisp architectural CAD naval vector wireframe
 * Displays high-detail schematics for all 5 warships (CVN, Cruiser, Destroyer, Submarine, Patrol)
 * Sized to fill the stage (viewBox 0 0 640 130) with technical callouts and measurement axes
 */
const ShipBlueprint = ({ type, color = 'var(--nav-teal)' }) => {
  switch (type) {
    case 'carrier':
      return (
        <svg viewBox="0 0 640 130" width="100%" height="auto" style={{ maxWidth: '560px', display: 'block', margin: '0 auto' }}>
          <defs>
            <pattern id="carrier-grid" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(100, 255, 218, 0.05)" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Background Blueprint Grid Zone */}
          <rect x="20" y="10" width="600" height="110" fill="url(#carrier-grid)" rx="4" />

          {/* Reference Centerline Axis */}
          <line x1="20" y1="65" x2="620" y2="65" stroke="rgba(100, 255, 218, 0.15)" strokeWidth="1" strokeDasharray="6 4" />

          {/* Aircraft Carrier Hull & Flight Deck */}
          {/* Main Flight Deck Outline */}
          <path
            d="M 45,95 L 75,108 L 545,108 L 600,85 L 610,65 L 595,45 L 540,25 L 120,25 L 45,40 Z"
            fill="rgba(100, 255, 218, 0.08)"
            stroke={color}
            strokeWidth="1.8"
          />

          {/* Angled Flight Deck Stripe (Runway 14°) */}
          <line x1="85" y1="104" x2="490" y2="34" stroke={color} strokeWidth="1.2" strokeDasharray="8 6" opacity="0.8" />
          <line x1="95" y1="107" x2="500" y2="37" stroke={color} strokeWidth="0.8" opacity="0.5" />

          {/* Catapult Lines (Bow Catapults 1 & 2) */}
          <line x1="420" y1="30" x2="560" y2="30" stroke={color} strokeWidth="1.2" />
          <line x1="410" y1="42" x2="575" y2="42" stroke={color} strokeWidth="1.2" />
          <circle cx="560" cy="30" r="2.5" fill={color} />
          <circle cx="575" cy="42" r="2.5" fill={color} />

          {/* Arresting Gear Cables (Aft) */}
          {[110, 130, 150, 170].map((x, i) => (
            <line key={i} x1={x} y1="75" x2={x + 20} y2="105" stroke={color} strokeWidth="1" opacity="0.7" />
          ))}

          {/* Island Superstructure & Bridge (Starboard) */}
          <rect x="430" y="16" width="65" height="15" fill={color} opacity="0.85" rx="2" />
          <rect x="445" y="11" width="35" height="5" fill={color} opacity="0.9" rx="1" />
          <line x1="462" y1="11" x2="462" y2="3" stroke={color} strokeWidth="1.5" />
          <circle cx="462" cy="2" r="2" fill={color} />
          {/* Radome Dome */}
          <circle cx="485" cy="12" r="3.5" fill="none" stroke={color} strokeWidth="1" />

          {/* Aircraft Elevators */}
          <rect x="360" y="22" width="22" height="6" fill="rgba(100, 255, 218, 0.25)" stroke={color} strokeWidth="1" />
          <rect x="505" y="22" width="22" height="6" fill="rgba(100, 255, 218, 0.25)" stroke={color} strokeWidth="1" />
          <rect x="230" y="98" width="24" height="6" fill="rgba(100, 255, 218, 0.25)" stroke={color} strokeWidth="1" />

          {/* Parked Jet Silhouettes */}
          <path d="M 270,42 L 274,38 L 278,42 L 276,46 L 272,46 Z" fill={color} opacity="0.75" />
          <path d="M 310,48 L 314,44 L 318,48 L 316,52 L 312,52 Z" fill={color} opacity="0.75" />

          {/* Dimension Line & Callouts */}
          <line x1="45" y1="120" x2="610" y2="120" stroke="rgba(100, 255, 218, 0.4)" strokeWidth="1" />
          <line x1="45" y1="116" x2="45" y2="124" stroke="rgba(100, 255, 218, 0.6)" strokeWidth="1" />
          <line x1="610" y1="116" x2="610" y2="124" stroke="rgba(100, 255, 218, 0.6)" strokeWidth="1" />
          <text x="328" y="123" fill="var(--nav-slate)" fontSize="8" fontFamily="'JetBrains Mono', monospace" textAnchor="middle" letterSpacing="1">
            ◄── LONGUEUR HORS-TOUT : 333 MÈTRES (5 CASES) ──►
          </text>
        </svg>
      );

    case 'cruiser':
    case 'battleship':
      return (
        <svg viewBox="0 0 640 130" width="100%" height="auto" style={{ maxWidth: '530px', display: 'block', margin: '0 auto' }}>
          <defs>
            <pattern id="cruiser-grid" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(100, 255, 218, 0.05)" strokeWidth="0.5" />
            </pattern>
          </defs>

          <rect x="30" y="10" width="580" height="110" fill="url(#cruiser-grid)" rx="4" />
          <line x1="30" y1="65" x2="610" y2="65" stroke="rgba(100, 255, 218, 0.15)" strokeWidth="1" strokeDasharray="6 4" />

          {/* Cruiser Sleek Armored Hull */}
          <path
            d="M 55,90 L 105,102 L 515,102 L 585,80 L 595,65 L 585,50 L 515,28 L 105,28 L 55,40 Z"
            fill="rgba(100, 255, 218, 0.08)"
            stroke={color}
            strokeWidth="1.8"
          />

          {/* Forward 127mm Gun Turret */}
          <circle cx="510" cy="65" r="9" fill={color} opacity="0.8" />
          <line x1="510" y1="65" x2="550" y2="65" stroke={color} strokeWidth="2.5" />

          {/* Forward VLS Missile Cell Bank (61 cells) */}
          <rect x="450" y="52" width="38" height="26" fill="rgba(100, 255, 218, 0.2)" stroke={color} strokeWidth="1" />
          <line x1="462" y1="52" x2="462" y2="78" stroke={color} strokeWidth="0.8" opacity="0.6" />
          <line x1="475" y1="52" x2="475" y2="78" stroke={color} strokeWidth="0.8" opacity="0.6" />

          {/* Bridge & AEGIS Superstructure */}
          <path d="M 330,42 L 430,46 L 430,84 L 330,88 Z" fill={color} opacity="0.75" />
          {/* SPY-1 Phased Array Octagonal Radar Plates */}
          <polygon points="415,50 425,54 425,76 415,80 405,76 405,54" fill="#020b18" stroke={color} strokeWidth="1.2" />
          <line x1="380" y1="42" x2="380" y2="24" stroke={color} strokeWidth="1.5" />
          <line x1="365" y1="28" x2="395" y2="28" stroke={color} strokeWidth="1.2" />

          {/* Dual Exhaust Stacks */}
          <rect x="275" y="54" width="22" height="22" fill={color} opacity="0.85" rx="2" />
          <rect x="225" y="54" width="22" height="22" fill={color} opacity="0.85" rx="2" />

          {/* Aft VLS Missile Bank */}
          <rect x="160" y="52" width="38" height="26" fill="rgba(100, 255, 218, 0.2)" stroke={color} strokeWidth="1" />

          {/* Aft Gun Turret & Helo Deck */}
          <circle cx="120" cy="65" r="8" fill={color} opacity="0.8" />
          <line x1="120" y1="65" x2="85" y2="65" stroke={color} strokeWidth="2.5" />
          <circle cx="75" cy="65" r="14" fill="none" stroke={color} strokeWidth="1" strokeDasharray="4 3" />
          <text x="75" y="68" fill={color} fontSize="9" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">H</text>

          {/* Dimension Line */}
          <line x1="55" y1="118" x2="595" y2="118" stroke="rgba(100, 255, 218, 0.4)" strokeWidth="1" />
          <text x="325" y="121" fill="var(--nav-slate)" fontSize="8" fontFamily="'JetBrains Mono', monospace" textAnchor="middle" letterSpacing="1">
            ◄── LONGUEUR : 173 MÈTRES (4 CASES D'ENCOMBREMENT) ──►
          </text>
        </svg>
      );

    case 'destroyer':
      return (
        <svg viewBox="0 0 640 130" width="100%" height="auto" style={{ maxWidth: '490px', display: 'block', margin: '0 auto' }}>
          <defs>
            <pattern id="destroyer-grid" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(100, 255, 218, 0.05)" strokeWidth="0.5" />
            </pattern>
          </defs>

          <rect x="40" y="10" width="560" height="110" fill="url(#destroyer-grid)" rx="4" />
          <line x1="40" y1="65" x2="600" y2="65" stroke="rgba(100, 255, 218, 0.15)" strokeWidth="1" strokeDasharray="6 4" />

          {/* Destroyer Stealth Hull */}
          <path
            d="M 75,88 L 125,98 L 490,98 L 565,75 L 575,65 L 565,55 L 490,32 L 125,32 L 75,42 Z"
            fill="rgba(100, 255, 218, 0.08)"
            stroke={color}
            strokeWidth="1.8"
          />

          {/* Forward Gun Turret */}
          <circle cx="490" cy="65" r="8" fill={color} opacity="0.8" />
          <line x1="490" y1="65" x2="530" y2="65" stroke={color} strokeWidth="2.2" />

          {/* Forward VLS Bank */}
          <rect x="440" y="55" width="28" height="20" fill="rgba(100, 255, 218, 0.2)" stroke={color} strokeWidth="1" />

          {/* Stealth Superstructure */}
          <polygon points="320,44 415,48 415,82 320,86" fill={color} opacity="0.8" />
          <line x1="375" y1="44" x2="375" y2="25" stroke={color} strokeWidth="1.5" />
          <polygon points="368,25 382,25 375,18" fill={color} />

          {/* Torpedo Tubes & Smoke Stack */}
          <rect x="265" y="56" width="22" height="18" fill={color} opacity="0.85" rx="2" />
          <line x1="260" y1="48" x2="285" y2="44" stroke={color} strokeWidth="2" />
          <line x1="260" y1="82" x2="285" y2="86" stroke={color} strokeWidth="2" />

          {/* Helo Hangar & Flight Deck */}
          <rect x="155" y="50" width="40" height="30" fill="rgba(100, 255, 218, 0.15)" stroke={color} strokeWidth="1" />
          <circle cx="110" cy="65" r="12" fill="none" stroke={color} strokeWidth="1" strokeDasharray="3 3" />
          <text x="110" y="68" fill={color} fontSize="8" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">H</text>

          {/* Dimension Line */}
          <line x1="75" y1="116" x2="575" y2="116" stroke="rgba(100, 255, 218, 0.4)" strokeWidth="1" />
          <text x="325" y="120" fill="var(--nav-slate)" fontSize="8" fontFamily="'JetBrains Mono', monospace" textAnchor="middle" letterSpacing="1">
            ◄── LONGUEUR : 155 MÈTRES (3 CASES) ──►
          </text>
        </svg>
      );

    case 'submarine':
      return (
        <svg viewBox="0 0 640 130" width="100%" height="auto" style={{ maxWidth: '480px', display: 'block', margin: '0 auto' }}>
          <defs>
            <pattern id="sub-grid" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(100, 255, 218, 0.05)" strokeWidth="0.5" />
            </pattern>
          </defs>

          <rect x="50" y="10" width="540" height="110" fill="url(#sub-grid)" rx="4" />
          <line x1="50" y1="65" x2="590" y2="65" stroke="rgba(100, 255, 218, 0.15)" strokeWidth="1" strokeDasharray="6 4" />

          {/* Submarine Teardrop Hull */}
          <path
            d="M 95,65 C 95,44, 150,40, 320,40 C 490,40, 545,46, 560,65 C 545,84, 490,90, 320,90 C 150,90, 95,86, 95,65 Z"
            fill="rgba(100, 255, 218, 0.08)"
            stroke={color}
            strokeWidth="1.8"
          />

          {/* Sail / Conning Tower */}
          <path d="M 370,40 L 380,18 L 420,18 L 428,40 Z" fill={color} opacity="0.85" />
          {/* Masts & Periscopes */}
          <line x1="392" y1="18" x2="392" y2="8" stroke={color} strokeWidth="1.5" />
          <line x1="404" y1="18" x2="404" y2="6" stroke={color} strokeWidth="1.5" />
          <line x1="414" y1="18" x2="414" y2="10" stroke={color} strokeWidth="1.2" />

          {/* Bow Sonar Dome Partition */}
          <path d="M 525,48 C 535,55, 535,75, 525,82" fill="none" stroke={color} strokeWidth="1.2" strokeDasharray="3 2" />
          {/* Torpedo Shutter Hatches (4x) */}
          <line x1="510" y1="56" x2="520" y2="56" stroke={color} strokeWidth="2" />
          <line x1="510" y1="62" x2="520" y2="62" stroke={color} strokeWidth="2" />
          <line x1="510" y1="68" x2="520" y2="68" stroke={color} strokeWidth="2" />
          <line x1="510" y1="74" x2="520" y2="74" stroke={color} strokeWidth="2" />

          {/* VLS Silos on Deck (Behind Sail) */}
          {[335, 345, 355].map((x, idx) => (
            <circle key={idx} cx={x} cy="52" r="3" fill="none" stroke={color} strokeWidth="1" />
          ))}

          {/* Stern Cruciform Rudders & Propeller Screw */}
          <line x1="95" y1="50" x2="95" y2="80" stroke={color} strokeWidth="2.5" />
          <polygon points="95,44 110,48 110,54 95,54" fill={color} />
          <polygon points="95,86 110,82 110,76 95,76" fill={color} />
          {/* 7-bladed skew screw */}
          <circle cx="86" cy="65" r="4" fill={color} />
          <line x1="86" y1="55" x2="86" y2="75" stroke={color} strokeWidth="2" />

          {/* Dimension Line */}
          <line x1="86" y1="114" x2="560" y2="114" stroke="rgba(100, 255, 218, 0.4)" strokeWidth="1" />
          <text x="323" y="118" fill="var(--nav-slate)" fontSize="8" fontFamily="'JetBrains Mono', monospace" textAnchor="middle" letterSpacing="1">
            ◄── LONGUEUR : 115 MÈTRES (3 CASES) ──►
          </text>
        </svg>
      );

    case 'patrol':
    default:
      return (
        <svg viewBox="0 0 640 130" width="100%" height="auto" style={{ maxWidth: '420px', display: 'block', margin: '0 auto' }}>
          <defs>
            <pattern id="patrol-grid" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(100, 255, 218, 0.05)" strokeWidth="0.5" />
            </pattern>
          </defs>

          <rect x="80" y="10" width="480" height="110" fill="url(#patrol-grid)" rx="4" />
          <line x1="80" y1="65" x2="560" y2="65" stroke="rgba(100, 255, 218, 0.15)" strokeWidth="1" strokeDasharray="6 4" />

          {/* Fast Patrol Boat Planing Hull */}
          <path
            d="M 160,88 L 205,96 L 440,96 L 485,74 L 495,65 L 485,56 L 440,34 L 205,34 L 160,42 Z"
            fill="rgba(100, 255, 218, 0.08)"
            stroke={color}
            strokeWidth="1.8"
          />

          {/* Forward 20mm Autocannon */}
          <circle cx="430" cy="65" r="6" fill={color} opacity="0.8" />
          <line x1="430" y1="65" x2="465" y2="65" stroke={color} strokeWidth="2" />

          {/* Armored Wheelhouse Cabin */}
          <polygon points="310,48 375,52 375,78 310,82" fill={color} opacity="0.8" />
          <rect x="330" y="55" width="20" height="20" fill="#020b18" stroke={color} strokeWidth="1" />
          <line x1="345" y1="48" x2="345" y2="34" stroke={color} strokeWidth="1.5" />
          <circle cx="345" cy="32" r="2.5" fill={color} />

          {/* Twin Deck Torpedo Tubes (Port & Starboard) */}
          <rect x="240" y="40" width="48" height="6" fill="rgba(100, 255, 218, 0.3)" stroke={color} strokeWidth="1" rx="1" />
          <rect x="240" y="84" width="48" height="6" fill="rgba(100, 255, 218, 0.3)" stroke={color} strokeWidth="1" rx="1" />

          {/* Stern Transom Depth Charge Rack */}
          <line x1="175" y1="52" x2="175" y2="78" stroke={color} strokeWidth="2.5" />
          <circle cx="170" cy="58" r="3" fill={color} />
          <circle cx="170" cy="72" r="3" fill={color} />

          {/* Dimension Line */}
          <line x1="160" y1="112" x2="495" y2="112" stroke="rgba(100, 255, 218, 0.4)" strokeWidth="1" />
          <text x="328" y="116" fill="var(--nav-slate)" fontSize="8" fontFamily="'JetBrains Mono', monospace" textAnchor="middle" letterSpacing="1">
            ◄── LONGUEUR : 24 MÈTRES (2 CASES) ──►
          </text>
        </svg>
      );
  }
};

export default ShipBlueprint;
