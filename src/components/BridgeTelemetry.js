import React, { useState, useEffect } from 'react';
import { sound } from '../utils/audio';

/**
 * BridgeTelemetry
 * High-tech naval command bridge telemetry bar:
 * - Animated Gyrocompass heading
 * - Mediterranean Geocoordinates (Toulon military naval base / High Seas)
 * - Military Squawk transponder and acoustic telemetry
 */
const BridgeTelemetry = ({ className = '' }) => {
  const [heading, setHeading] = useState(318);
  const [ping, setPing] = useState(24);

  // Subtle compass gyro simulation drift & socket telemetry ping
  useEffect(() => {
    const interval = setInterval(() => {
      setHeading(prev => {
        const delta = Math.floor(Math.random() * 3) - 1;
        let next = (prev + delta) % 360;
        if (next < 0) next += 360;
        return next;
      });
      setPing(prev => Math.max(16, Math.min(48, prev + Math.floor(Math.random() * 7) - 3)));
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const getCompassDirection = (deg) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const idx = Math.round(deg / 22.5) % 16;
    return directions[idx];
  };

  return (
    <div
      className={`bridge-telemetry-bar mono ${className}`}
      onClick={() => sound.playBlip(920, 0.03)}
      title="Télémétrie de navigation passerelle • Liaison inertielle chiffrée"
    >
      {/* Compass / Heading */}
      <div className="compass-gyro">
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="var(--nav-teal)"
          strokeWidth="1.8"
          className="compass-gyro-dial"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" strokeDasharray="3 2" />
          <polygon points="12,3 15,12 12,10 9,12" fill="var(--nav-red)" stroke="var(--nav-red)" />
          <polygon points="12,21 9,12 12,10 15,12" fill="var(--nav-slate)" stroke="var(--nav-slate)" opacity="0.6" />
        </svg>
        <span>
          CAP {heading < 100 ? `0${heading}` : heading}° {getCompassDirection(heading)}
        </span>
      </div>

      {/* Geocoordinates */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ color: 'var(--nav-slate)' }}>POSITION :</span>
        <span style={{ color: 'var(--nav-text)' }}>43°07′N • 005°55′E (TOULON QG)</span>
      </div>

      {/* Military Transponder Squawk & Condition */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: 'var(--nav-slate)' }}>SQUAWK :</span>
        <span style={{ color: 'var(--nav-gold)', fontWeight: 'bold' }}>7700-MIL</span>
        <span style={{ opacity: 0.3 }}>|</span>
        <span style={{ color: 'var(--nav-teal)', fontWeight: 'bold' }}>DEFCON 1</span>
        <span style={{ opacity: 0.3 }}>|</span>
        <span className="mono" style={{ color: 'var(--nav-teal)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span className="status-indicator online blink-slow" style={{ width: '5px', height: '5px' }} />
          RTT {ping}ms
        </span>
      </div>
    </div>
  );
};

export default BridgeTelemetry;
