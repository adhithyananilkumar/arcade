'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface GraphDataPoint {
  id: string;
  label: string;
  value: number; // 0 to 100
  hint?: string;
  status?: 'done' | 'current' | 'locked';
  tone?: string;
}

export interface SimpleGraphProps {
  data: GraphDataPoint[];
  height?: number;
  className?: string;
  strokeColor?: string;
  nodeColor?: string;
  showGrid?: boolean;
  animated?: boolean;
  onPointClick?: (point: GraphDataPoint) => void;
}

/** Smooth Cubic Bezier curve control points calculation */
function getControlPoint(
  current: [number, number],
  previous: [number, number] | undefined,
  next: [number, number] | undefined,
  reverse?: boolean
): [number, number] {
  const p = previous || current;
  const n = next || current;
  const smoothing = 0.22;
  const lengthX = n[0] - p[0];
  const lengthY = n[1] - p[1];
  const angle = Math.atan2(lengthY, lengthX) + (reverse ? Math.PI : 0);
  const length = Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)) * smoothing;
  const x = current[0] + Math.cos(angle) * length;
  const y = current[1] + Math.sin(angle) * length;
  return [x, y];
}

function createSmoothPath(points: [number, number][]): string {
  if (points.length === 0) return '';
  return points.reduce((acc, point, i, a) => {
    if (i === 0) return `M ${point[0]},${point[1]}`;
    const [cpsX, cpsY] = getControlPoint(a[i - 1], a[i - 2], point);
    const [cpeX, cpeY] = getControlPoint(point, a[i - 1], a[i + 1], true);
    return `${acc} C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`;
  }, '');
}

export function SimpleGraph({
  data,
  height = 320,
  className = '',
  strokeColor = '#4C6FFF',
  nodeColor = '#818CF8',
  showGrid = true,
  animated = true,
  onPointClick,
}: SimpleGraphProps) {
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);
  const [activePointId, setActivePointId] = useState<string | null>(
    () => data.find((d) => d.status === 'current')?.id || data[0]?.id || null
  );

  const viewWidth = 1000;
  const paddingX = 80;
  const paddingTop = 50;
  const paddingBottom = 50;
  const viewHeight = height;

  // Calculate coordinates matching exact waveform height & distribution
  const points = useMemo(() => {
    if (!data.length) return [];
    const stepX = (viewWidth - paddingX * 2) / (data.length - 1 || 1);
    const availableHeight = viewHeight - paddingTop - paddingBottom;

    return data.map((d, index) => {
      const x = paddingX + index * stepX;
      const normalizedValue = Math.max(0, Math.min(100, d.value));
      const y = viewHeight - paddingBottom - (normalizedValue / 100) * availableHeight;
      return { ...d, x, y, index };
    });
  }, [data, viewWidth, viewHeight, paddingX, paddingTop, paddingBottom]);

  const coords: [number, number][] = useMemo(
    () => points.map((p) => [p.x, p.y]),
    [points]
  );

  const linePath = useMemo(() => createSmoothPath(coords), [coords]);

  const activePoint = points.find(
    (p) => p.id === (hoveredPointId || activePointId)
  );

  return (
    <div className={`relative w-full select-none overflow-visible bg-transparent ${className}`}>
      <div className="relative w-full overflow-x-auto">
        <div className="min-w-[650px] sm:min-w-[850px] relative">
          <svg
            className="w-full h-auto overflow-visible"
            viewBox={`0 0 ${viewWidth} ${viewHeight}`}
            fill="none"
          >
            {/* Smooth Animated Line Curve */}
            <motion.path
              d={linePath}
              fill="none"
              stroke={strokeColor}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={animated ? { pathLength: 0, opacity: 0 } : false}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* Circular Node Dots: Solid fill with crisp white outer ring border */}
            {points.map((p) => {
              const isHovered = hoveredPointId === p.id;
              const isActive = activePointId === p.id;
              const pointNodeColor = p.tone || nodeColor;

              return (
                <g
                  key={`point-${p.id}`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPointId(p.id)}
                  onMouseLeave={() => setHoveredPointId(null)}
                  onClick={() => {
                    setActivePointId(p.id);
                    if (onPointClick) onPointClick(p);
                  }}
                >
                  {/* Circular Node Dot with Crisp White Outer Ring Border */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered || isActive ? '12' : '10'}
                    fill={pointNodeColor}
                    stroke="#FFFFFF"
                    strokeWidth="3.5"
                    className="transition-all duration-300 drop-shadow-[0_4px_10px_rgba(0,0,0,0.15)]"
                  />
                </g>
              );
            })}
          </svg>

          {/* Floating Callout Tooltip Card on Hover / Selection */}
          <AnimatePresence>
            {activePoint && (
              <motion.div
                key={activePoint.id}
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute z-20 pointer-events-none -translate-x-1/2"
                style={{
                  left: `${(activePoint.x / viewWidth) * 100}%`,
                  top: `${Math.max(10, activePoint.y - 75)}px`,
                }}
              >
                <div className="flex flex-col items-center">
                  <div className="rounded-xl border border-slate-200/90 bg-white/95 px-3.5 py-2 shadow-xl backdrop-blur-md text-center min-w-[120px]">
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      <span
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: activePoint.tone || '#4C6FFF' }}
                      >
                        {activePoint.label}
                      </span>
                    </div>
                    {activePoint.hint && (
                      <p className="text-[11px] font-medium text-slate-500">
                        {activePoint.hint}
                      </p>
                    )}
                  </div>
                  {/* Tooltip Pointer Arrow */}
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default SimpleGraph;
