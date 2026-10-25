import React, { useState } from 'react';
import { sound } from '../utils/audio';

/**
 * LiquidLogo
 * Inspired by paper-design/liquid-logo & ruucm/shadergradient:
 * - Fluid refractive radar insignia with procedural concentric range rings
 * - Smooth 360-degree radar beam sweep
 * - Specular glass diode with chromatic dispersion glow
 * - Tactile hover speedup with micro acoustic feedback
 */
const LiquidLogo = ({ size = 26, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    sound.playBlip(980, 0.03);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      className={`liquid-logo-wrap ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: `${size + 8}px`,
        height: `${size + 8}px`,
        cursor: 'pointer',
        verticalAlign: 'middle',
        userSelect: 'none'
      }}
      aria-hidden="true"
    >
      {/* Specular Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: `${size * 1.6}px`,
          height: `${size * 1.6}px`,
          borderRadius: '50%',
          background: isHovered
            ? 'radial-gradient(circle, rgba(100, 255, 218, 0.45) 0%, rgba(0, 240, 255, 0.2) 45%, transparent 70%)'
            : 'radial-gradient(circle, rgba(100, 255, 218, 0.25) 0%, transparent 65%)',
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: 'none'
        }}
      />

      {/* Naval Radar SVG Graphic */}
      <svg
        viewBox="0 0 36 36"
        width={size}
        height={size}
        style={{
          overflow: 'visible',
          filter: isHovered ? 'drop-shadow(0 0 8px rgba(100, 255, 218, 0.8))' : 'drop-shadow(0 0 4px rgba(100, 255, 218, 0.4))',
          transition: 'filter 0.3s ease'
        }}
      >
        <defs>
          {/* Liquid Glass Radial Gradient */}
          <radialGradient id="liquidCenterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#64ffda" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
          </radialGradient>

          {/* Sweeping Conic-like Radar Gradient */}
          <linearGradient id="radarSweepBeam" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#64ffda" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#64ffda" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Outer Hull Armor Ring */}
        <circle
          cx="18"
          cy="18"
          r="16"
          stroke="var(--nav-teal)"
          strokeWidth="1.5"
          fill="rgba(10, 25, 47, 0.4)"
          opacity="0.85"
        />

        {/* Inner Tactical Range Rings */}
        <circle
          cx="18"
          cy="18"
          r="11"
          stroke="var(--nav-teal)"
          strokeWidth="0.8"
          strokeDasharray="2 2"
          opacity="0.5"
        />
        <circle
          cx="18"
          cy="18"
          r="6"
          stroke="var(--nav-teal)"
          strokeWidth="0.6"
          opacity="0.4"
        />

        {/* Tactical Crosshair Axes (N, S, E, W ticks) */}
        <line x1="18" y1="2" x2="18" y2="5" stroke="var(--nav-teal)" strokeWidth="1.2" opacity="0.9" />
        <line x1="18" y1="31" x2="18" y2="34" stroke="var(--nav-teal)" strokeWidth="1.2" opacity="0.9" />
        <line x1="2" y1="18" x2="5" y2="18" stroke="var(--nav-teal)" strokeWidth="1.2" opacity="0.9" />
        <line x1="31" y1="18" x2="34" y2="18" stroke="var(--nav-teal)" strokeWidth="1.2" opacity="0.9" />

        {/* Sweeping Radar Scanner Line */}
        <g
          style={{
            transformOrigin: '18px 18px',
            animation: `spinRadar ${isHovered ? '1.2s' : '3.6s'} linear infinite`
          }}
        >
          <line
            x1="18"
            y1="18"
            x2="33"
            y2="7"
            stroke="var(--nav-teal)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {/* Sweeping trailing beam pie */}
          <polygon
            points="18,18 33,7 34,14"
            fill="url(#radarSweepBeam)"
            opacity="0.35"
          />
        </g>

        {/* Central Liquid Glass Core Diode */}
        <circle
          cx="18"
          cy="18"
          r="3"
          fill="url(#liquidCenterGlow)"
        />
        <circle
          cx="18"
          cy="18"
          r="1.2"
          fill="#ffffff"
        />
      </svg>
    </div>
  );
};

export default LiquidLogo;
