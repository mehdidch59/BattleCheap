import React, { useRef, useState } from 'react';

/**
 * TiltCard
 * Rock-solid 3D perspective tilt without hover jitter
 * - Outer container handles mouse tracking with a static getBoundingClientRect()
 * - Inner card rotates smoothly in 3D space
 * - Subtle, premium angle (max 3.5 deg) with soft specular shine
 */
const TiltCard = ({
  children,
  className = '',
  style = {},
  accent = 'teal', // 'teal' | 'gold' | 'red' | 'blue'
  maxTilt = 3.5,   // Subtle tilt angle to prevent jitter
  hasShine = true,
  onClick
}) => {
  const containerRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
  });
  const [shineStyle, setShineStyle] = useState({
    opacity: 0,
    background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12) 0%, transparent 60%)'
  });

  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleMouseMove = (e) => {
    if (prefersReducedMotion || !containerRef.current) return;

    // Use containerRef which NEVER transforms, avoiding jitter loop
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const percentX = (x - centerX) / centerX;
    const percentY = (y - centerY) / centerY;

    const rotateX = -percentY * maxTilt;
    const rotateY = percentX * maxTilt;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`,
      transition: 'transform 0.08s ease-out'
    });

    if (hasShine) {
      const shineColors = {
        teal: 'rgba(100, 255, 218, 0.12)',
        gold: 'rgba(255, 204, 0, 0.12)',
        red: 'rgba(255, 71, 87, 0.12)',
        blue: 'rgba(0, 240, 255, 0.12)'
      };
      const color = shineColors[accent] || shineColors.teal;

      setShineStyle({
        opacity: 1,
        background: `radial-gradient(circle at ${((x / rect.width) * 100).toFixed(1)}% ${((y / rect.height) * 100).toFixed(1)}%, ${color} 0%, transparent 60%)`,
        transition: 'opacity 0.15s ease-out'
      });
    }
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
      transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
    });
    setShineStyle(prev => ({
      ...prev,
      opacity: 0,
      transition: 'opacity 0.35s ease-out'
    }));
  };

  return (
    <div
      ref={containerRef}
      className={`tilt-card-wrapper ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        perspective: '1000px',
        ...style
      }}
    >
      <div
        className={`tilt-card-inner tilt-${accent}`}
        style={{
          ...tiltStyle,
          position: 'relative',
          transformStyle: 'preserve-3d',
          height: '100%',
          borderRadius: 'inherit'
        }}
      >
        {/* Specular Light Sheen Overlay */}
        {hasShine && (
          <div
            className="tilt-shine-layer"
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 'inherit',
              pointerEvents: 'none',
              zIndex: 2,
              ...shineStyle
            }}
          />
        )}

        {/* Card Content */}
        <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default TiltCard;
