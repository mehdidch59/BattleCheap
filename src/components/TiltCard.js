import React, { useRef, useState } from 'react';

/**
 * TiltCard
 * Inspired by modern motion portfolios (motionin.design, motionsites.ai):
 * - Interactive 3D spatial tilt using CSS perspective & rotate3d
 * - Dynamic specular reflection sheen tracking the cursor
 * - Spring-damped return transition on mouse leave
 */
const TiltCard = ({
  children,
  className = '',
  style = {},
  accent = 'teal', // 'teal' | 'gold' | 'red' | 'blue'
  maxTilt = 7,     // Max tilt angle in degrees
  hasShine = true,
  onClick
}) => {
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
  });
  const [shineStyle, setShineStyle] = useState({
    opacity: 0,
    background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)'
  });

  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleMouseMove = (e) => {
    if (prefersReducedMotion || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const percentX = (x - centerX) / centerX;
    const percentY = (y - centerY) / centerY;

    const rotateX = -percentY * maxTilt;
    const rotateY = percentX * maxTilt;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.012, 1.012, 1)`,
      transition: 'transform 0.08s ease-out'
    });

    if (hasShine) {
      const shineColors = {
        teal: 'rgba(100, 255, 218, 0.14)',
        gold: 'rgba(255, 204, 0, 0.14)',
        red: 'rgba(255, 71, 87, 0.14)',
        blue: 'rgba(0, 240, 255, 0.14)'
      };
      const color = shineColors[accent] || shineColors.teal;

      setShineStyle({
        opacity: 1,
        background: `radial-gradient(circle at ${((x / rect.width) * 100).toFixed(1)}% ${((y / rect.height) * 100).toFixed(1)}%, ${color} 0%, transparent 65%)`,
        transition: 'opacity 0.2s ease-out'
      });
    }
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
    });
    setShineStyle(prev => ({
      ...prev,
      opacity: 0,
      transition: 'opacity 0.4s ease-out'
    }));
  };

  return (
    <div
      ref={cardRef}
      className={`tilt-card tilt-${accent} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        ...tiltStyle,
        position: 'relative',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        ...style
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
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default TiltCard;
