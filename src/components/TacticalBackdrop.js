import React, { useEffect, useRef } from 'react';

/**
 * TacticalBackdrop
 * Inspired by Poimandres (react-three-fiber) & motionsites.ai:
 * - Interactive HTML5 Canvas with ambient volumetric cursor spotlight
 * - Slow-sweeping naval sonar beam with phosphorescent fade
 * - Reactive tactical node particle constellation (mouse proximity repulsion)
 * - 60 FPS, zero layout thrashing, respects prefers-reduced-motion
 */
const TacticalBackdrop = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId;
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Mouse coordinates with smooth lerping
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      isHovering: false
    };

    // Radar sonar sweep state
    let sonarAngle = 0;
    const sonarSpeed = prefersReducedMotion ? 0 : 0.006;

    // Particle nodes
    const PARTICLE_COUNT = 38;
    const particles = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      // Re-initialize particles within new bounds
      if (particles.length === 0) {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            radius: Math.random() * 1.5 + 1,
            alpha: Math.random() * 0.3 + 0.15,
            blinkSpeed: Math.random() * 0.02 + 0.01,
            blinkPhase: Math.random() * Math.PI * 2
          });
        }
      }
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isHovering = true;
    };

    const handleMouseLeave = () => {
      mouse.isHovering = false;
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    // Render loop
    const render = () => {
      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;

      ctx.clearRect(0, 0, width, height);

      // 1. Ambient Volumetric Spotlight following cursor
      if (mouse.x > -500) {
        const glowRadius = Math.max(width * 0.35, 380);
        const radialGradient = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, glowRadius
        );
        radialGradient.addColorStop(0, 'rgba(100, 255, 218, 0.055)');
        radialGradient.addColorStop(0.4, 'rgba(10, 35, 70, 0.035)');
        radialGradient.addColorStop(1, 'rgba(2, 11, 24, 0)');

        ctx.fillStyle = radialGradient;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Slow Radar Sonar Sweep in background
      if (!prefersReducedMotion) {
        sonarAngle = (sonarAngle + sonarSpeed) % (Math.PI * 2);
        const centerX = width * 0.5;
        const centerY = height * 0.45;
        const sonarRadius = Math.max(width, height) * 0.75;

        ctx.save();
        ctx.translate(centerX, centerY);

        // Sonar sweep gradient wedge (45-degree phosphor trail)
        const wedgeAngle = Math.PI / 4;
        const stepCount = 18;
        for (let i = 0; i < stepCount; i++) {
          const stepFrac = i / stepCount;
          const a = sonarAngle - stepFrac * wedgeAngle;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, sonarRadius, a, a + (wedgeAngle / stepCount) + 0.01);
          ctx.closePath();
          ctx.fillStyle = `rgba(100, 255, 218, ${0.018 * (1 - stepFrac)})`;
          ctx.fill();
        }

        // Crisp leading radar sweep line
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(sonarAngle) * sonarRadius, Math.sin(sonarAngle) * sonarRadius);
        ctx.strokeStyle = 'rgba(100, 255, 218, 0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
      }

      // 3. Floating Tactical Particle Constellation
      ctx.lineWidth = 0.5;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
          p.blinkPhase += p.blinkSpeed;

          // Boundary bounce
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;

          // Mouse repulsion physics
          if (mouse.x > -500) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.hypot(dx, dy);
            const repelDist = 140;

            if (dist < repelDist && dist > 1) {
              const force = (1 - dist / repelDist) * 1.8;
              p.x += (dx / dist) * force;
              p.y += (dy / dist) * force;
            }
          }
        }

        // Draw particle dot
        const currentAlpha = p.alpha + Math.sin(p.blinkPhase) * 0.12;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 255, 218, ${Math.max(0.05, currentAlpha)})`;
        ctx.fill();

        // Connect near neighbor particles with subtle lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const lineAlpha = (1 - dist / 110) * 0.12;
            ctx.strokeStyle = `rgba(100, 255, 218, ${lineAlpha})`;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="tactical-backdrop"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
};

export default TacticalBackdrop;
