'use client';

import React, { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';

export interface PartyPopperRef {
  burst: (x?: number, y?: number) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  shape: 'rect' | 'circle' | 'ribbon' | 'triangle';
  size: number;
  rotation: number;
  rotationSpeed: number;
  scaleX: number;
  scaleXSpeed: number;
  opacity: number;
  decay: number;
  gravity: number;
  drag: number;
}

const COLORS = [
  '#FF1744', '#F50057', '#D500F9', '#651FFF', 
  '#3D5AFF', '#2979FF', '#00E5FF', '#1DE9B6', 
  '#00E676', '#76FF03', '#FFEA00', '#FF9100', 
  '#FF3D00', '#EC407A', '#AB47BC', '#7E57C2'
];

export interface PartyPopperProps {
  children?: React.ReactNode;
  className?: string;
  triggerOnHover?: boolean;
  triggerOnClick?: boolean;
}

export const PartyPopper = forwardRef<PartyPopperRef, PartyPopperProps>(({
  children,
  className = '',
  triggerOnHover = true,
  triggerOnClick = true
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const lastHoverTimeRef = useRef<number>(0);

  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }, []);

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [updateCanvasSize]);

  const burst = useCallback((targetX?: number, targetY?: number) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Origin defaults to center if not provided
    const originX = targetX !== undefined ? targetX : rect.width / 2;
    const originY = targetY !== undefined ? targetY : rect.height / 2;

    const shapes: ('rect' | 'circle' | 'ribbon' | 'triangle')[] = ['rect', 'circle', 'ribbon', 'triangle'];
    const count = 50 + Math.floor(Math.random() * 30);

    const newParticles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 12;

      newParticles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (2 + Math.random() * 3), // slight upward bias
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        size: 5 + Math.random() * 7,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        scaleX: 1,
        scaleXSpeed: (Math.random() - 0.5) * 0.1,
        opacity: 1,
        decay: 0.008 + Math.random() * 0.012,
        gravity: 0.18 + Math.random() * 0.1,
        drag: 0.96 + Math.random() * 0.02
      });
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];

    if (!animFrameRef.current) {
      const render = () => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const particles = particlesRef.current;
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];

          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity;
          p.vx *= p.drag;
          p.vy *= p.drag;

          p.rotation += p.rotationSpeed;
          p.scaleX += p.scaleXSpeed;
          if (p.scaleX > 1 || p.scaleX < -1) p.scaleXSpeed *= -1;

          p.opacity -= p.decay;

          if (p.opacity <= 0 || p.y > canvas.height + 50) {
            particles.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.scale(p.scaleX, 1);

          ctx.fillStyle = p.color;
          ctx.strokeStyle = p.color;

          if (p.shape === 'rect') {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          } else if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.shape === 'triangle') {
            ctx.beginPath();
            ctx.moveTo(0, -p.size / 2);
            ctx.lineTo(p.size / 2, p.size / 2);
            ctx.lineTo(-p.size / 2, p.size / 2);
            ctx.closePath();
            ctx.fill();
          } else if (p.shape === 'ribbon') {
            ctx.beginPath();
            ctx.lineWidth = 2.5;
            ctx.moveTo(-p.size, -p.size / 2);
            ctx.quadraticCurveTo(0, p.size / 2, p.size, -p.size / 2);
            ctx.stroke();
          }

          ctx.restore();
        }

        if (particles.length > 0) {
          animFrameRef.current = requestAnimationFrame(render);
        } else {
          animFrameRef.current = null;
        }
      };

      animFrameRef.current = requestAnimationFrame(render);
    }
  }, []);

  useImperativeHandle(ref, () => ({
    burst
  }));

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!triggerOnHover) return;
    const now = Date.now();
    // Throttle hover bursts to every 600ms
    if (now - lastHoverTimeRef.current < 600) return;
    lastHoverTimeRef.current = now;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    burst(x, y);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!triggerOnClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    burst(x, y);
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-50"
      />
      {children}
    </div>
  );
});

PartyPopper.displayName = 'PartyPopper';

export default PartyPopper;
