'use client';

import React, { useEffect, useRef } from 'react';

interface ParticleWaveBackgroundProps {
  className?: string;
}

export function ParticleWaveBackground({ className = '' }: ParticleWaveBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let isVisible = true;
    let time = 0;

    // Interactive mouse tracking with smooth interpolation (LERP)
    let targetMouseX = 0;
    let targetMouseY = 0;
    let smoothMouseX = 0;
    let smoothMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      // Normalized coordinates from -1 to 1 relative to canvas
      targetMouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetMouseY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    };

    const handleMouseLeave = () => {
      targetMouseX = 0;
      targetMouseY = 0;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    // Resize handler
    const updateDimensions = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    resizeObserver.observe(canvas);

    // Pause when page is hidden
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Responsive grid resolution
    const getGridConfig = () => {
      if (width < 640) {
        return { cols: 38, rows: 26, spreadX: 700, spreadY: 500, waveHeight: 75 };
      } else if (width < 1024) {
        return { cols: 52, rows: 34, spreadX: 980, spreadY: 640, waveHeight: 95 };
      } else {
        return { cols: 72, rows: 44, spreadX: 1420, spreadY: 860, waveHeight: 115 };
      }
    };

    // Base 3D rotation angles
    const basePitch = 56 * (Math.PI / 180); // Tilt downward
    const baseYaw = -18 * (Math.PI / 180);  // Diagonal perspective
    const baseRoll = 8 * (Math.PI / 180);   // Slant

    const fov = 750;
    const cameraDist = 650;

    // Main render loop
    const render = () => {
      if (!isVisible || width === 0 || height === 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      time += 0.012;

      // Smooth cursor interpolation
      smoothMouseX += (targetMouseX - smoothMouseX) * 0.06;
      smoothMouseY += (targetMouseY - smoothMouseY) * 0.06;

      // Dynamic 3D rotation with subtle interactive parallax
      const pitch = basePitch + smoothMouseY * (7 * (Math.PI / 180));
      const yaw = baseYaw + smoothMouseX * (10 * (Math.PI / 180));
      const roll = baseRoll - smoothMouseX * (4 * (Math.PI / 180));

      const cosX = Math.cos(pitch);
      const sinX = Math.sin(pitch);
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const cosZ = Math.cos(roll);
      const sinZ = Math.sin(roll);

      const { cols, rows, spreadX, spreadY, waveHeight } = getGridConfig();
      const centerX = (width * dpr) * 0.52;
      const centerY = (height * dpr) * 0.54;

      for (let i = 0; i < cols; i++) {
        const u = (i / (cols - 1)) * 2 - 1; // -1 to 1

        for (let j = 0; j < rows; j++) {
          const v = (j / (rows - 1)) * 2 - 1; // -1 to 1

          // Radial vignette falloff so the particle field seamlessly vanishes at outer boundaries
          const distFromCenter = Math.sqrt(u * u * 0.9 + v * v * 1.1);
          if (distFromCenter >= 1.02) continue;

          // Smooth cosine falloff
          const vignette = Math.max(0, Math.cos((distFromCenter / 1.02) * (Math.PI / 2)));
          if (vignette <= 0.01) continue;

          // Localized interactive cursor displacement ripple
          const dx = u - smoothMouseX;
          const dy = v - smoothMouseY;
          const mouseDistSq = dx * dx + dy * dy;
          const cursorElevation = Math.exp(-mouseDistSq / 0.16) * 32;

          // Coherent flowing 3D wave mathematics
          const wave1 = Math.sin(u * 3.4 + time * 1.1) * Math.cos(v * 2.6 + time * 0.85);
          const wave2 = Math.sin((u + v) * 3.8 - time * 1.35) * 0.45;
          const wave3 = Math.cos(Math.sqrt(u * u + v * v) * 4.6 - time * 1.6) * 0.35;
          const wave4 = Math.sin(u * 6.2 - v * 2.8 + time * 0.9) * 0.2;

          const totalWave = wave1 + wave2 + wave3 + wave4;
          const zWorld = totalWave * waveHeight + cursorElevation;

          const xWorld = u * spreadX;
          const yWorld = v * spreadY;

          // 3D Matrix Transformations
          // 1. Rotate around Y (Yaw)
          const x1 = xWorld * cosY + zWorld * sinY;
          const y1 = yWorld;
          const z1 = -xWorld * sinY + zWorld * cosY;

          // 2. Rotate around X (Pitch)
          const x2 = x1;
          const y2 = y1 * cosX - z1 * sinX;
          const z2 = y1 * sinX + z1 * cosX;

          // 3. Rotate around Z (Roll)
          const x3 = x2 * cosZ - y2 * sinZ;
          const y3 = x2 * sinZ + y2 * cosZ;
          const z3 = z2;

          // Perspective projection
          const scale = fov / (fov + z3 + cameraDist);
          const screenX = centerX + x3 * scale * dpr;
          const screenY = centerY + y3 * scale * dpr;

          // Screen bounds check
          if (screenX < 0 || screenX > canvas.width || screenY < 0 || screenY > canvas.height) {
            continue;
          }

          // Screen margin soft fade
          const marginX = canvas.width * 0.06;
          const marginY = canvas.height * 0.06;
          let edgeFade = 1;
          if (screenX < marginX) edgeFade *= screenX / marginX;
          else if (screenX > canvas.width - marginX) edgeFade *= (canvas.width - screenX) / marginX;
          if (screenY < marginY) edgeFade *= screenY / marginY;
          else if (screenY > canvas.height - marginY) edgeFade *= (canvas.height - screenY) / marginY;

          // Depth-based size and opacity
          const normDepth = Math.max(0, Math.min(1, (totalWave + 1.8) / 3.6));
          const cursorGlow = Math.exp(-mouseDistSq / 0.16) * 0.35;
          const alpha = Math.min(1, (0.18 + normDepth * 0.72 + cursorGlow) * vignette * edgeFade);
          const radius = Math.max(0.6, (0.8 + normDepth * 1.35) * scale * dpr);

          // Color palette: soft whites, cyan, and light sky-blues
          ctx.beginPath();
          ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);

          if (normDepth > 0.72 || cursorGlow > 0.15) {
            // Bright crest & cursor-reactive particles
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, alpha * 0.95)})`;
          } else if (normDepth > 0.42) {
            // Mid sky-blue particles
            ctx.fillStyle = `rgba(186, 230, 253, ${alpha * 0.85})`;
          } else {
            // Subtle deep cyan-blue trough particles
            ctx.fillStyle = `rgba(96, 165, 250, ${alpha * 0.65})`;
          }

          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ display: 'block' }}
    />
  );
}
