import React, { useEffect, useRef } from 'react';

/**
 * VictoryCelebration
 * Lightweight procedural fireworks & spark shower on victory
 * Pure Canvas 2D, zero bundle overhead, respects prefers-reduced-motion
 */
const VictoryCelebration = ({ onComplete }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      if (onComplete) onComplete();
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const colors = ['#64ffda', '#ffcc00', '#ffffff', '#00f0ff', '#ffaa00'];
    const particles = [];
    const PARTICLE_COUNT = 90;

    // Create 3 burst origins across the upper canvas
    const origins = [
      { x: width * 0.3, y: height * 0.35 },
      { x: width * 0.5, y: height * 0.25 },
      { x: width * 0.7, y: height * 0.35 }
    ];

    origins.forEach(origin => {
      for (let i = 0; i < PARTICLE_COUNT / origins.length; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2.5;
        particles.push({
          x: origin.x,
          y: origin.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          radius: Math.random() * 2.5 + 1.5,
          alpha: 1,
          decay: Math.random() * 0.015 + 0.008,
          gravity: 0.12
        });
      }
    });

    let animationId;
    const startTime = performance.now();
    const DURATION_MS = 3400;

    const render = (now) => {
      const elapsed = now - startTime;
      if (elapsed > DURATION_MS) {
        ctx.clearRect(0, 0, width, height);
        if (onComplete) onComplete();
        return;
      }

      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.985; // air drag
        p.alpha = Math.max(0, p.alpha - p.decay);

        if (p.alpha > 0.01) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fill();
        }
      });

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="victory-celebration-canvas"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 1200
      }}
    />
  );
};

export default VictoryCelebration;
