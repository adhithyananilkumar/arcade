'use client';

import React, { useEffect, useState, useCallback, useId } from 'react';
import { StageData } from '../data/defaultFrontendRoadmap';

interface ConnectorSegment {
  id: string;
  fromId: string;
  toId: string;
  pathD: string;
  arrowX: number;
  arrowY: number;
  arrowDir: 'right' | 'left' | 'down';
  color: string;
  isCompleted: boolean;
  isLoop?: boolean;
}

interface RoadmapConnectorsProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  visibleStages: StageData[];
  mode: 'desktop' | 'tablet' | 'mobile';
  completedMap: Record<string, boolean>;
}

export const RoadmapConnectors: React.FC<RoadmapConnectorsProps> = ({
  containerRef,
  visibleStages,
  mode,
  completedMap,
}) => {
  const [segments, setSegments] = useState<ConnectorSegment[]>([]);
  const gradientId = useId();

  const calculateSegments = useCallback(() => {
    const container = containerRef.current;
    if (!container || mode === 'mobile') {
      setSegments([]);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const newSegments: ConnectorSegment[] = [];

    for (let i = 0; i < visibleStages.length - 1; i++) {
      const stageA = visibleStages[i];
      const stageB = visibleStages[i + 1];

      const elA = container.querySelector(`[data-stage-id="${stageA.id}"]`);
      const elB = container.querySelector(`[data-stage-id="${stageB.id}"]`);

      if (!elA || !elB) continue;

      const rectA = elA.getBoundingClientRect();
      const rectB = elB.getBoundingClientRect();

      // Coordinates relative to container
      const a = {
        left: rectA.left - containerRect.left,
        right: rectA.right - containerRect.left,
        top: rectA.top - containerRect.top,
        bottom: rectA.bottom - containerRect.top,
        centerX: rectA.left - containerRect.left + rectA.width / 2,
        centerY: rectA.top - containerRect.top + rectA.height / 2,
        width: rectA.width,
        height: rectA.height,
      };

      const b = {
        left: rectB.left - containerRect.left,
        right: rectB.right - containerRect.left,
        top: rectB.top - containerRect.top,
        bottom: rectB.bottom - containerRect.top,
        centerX: rectB.left - containerRect.left + rectB.width / 2,
        centerY: rectB.top - containerRect.top + rectB.height / 2,
        width: rectB.width,
        height: rectB.height,
      };

      let pathD = '';
      let arrowX = 0;
      let arrowY = 0;
      let arrowDir: 'right' | 'left' | 'down' = 'right';
      let isLoop = false;

      const isCompleted = Boolean(completedMap[stageA.id] && completedMap[stageB.id]);
      const strokeColor = isCompleted ? '#10B981' : '#94A3B8';

      // Same row check
      const isSameRow = Math.abs(a.top - b.top) < 60;

      if (isSameRow && b.left > a.right) {
        // Horizontal straight arrow between cards
        const startX = a.right + 2;
        const startY = a.top + 72; // Vertically centered around card title / header
        const endX = b.left - 2;
        const endY = b.top + 72;

        pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
        arrowX = endX - 3;
        arrowY = endY;
        arrowDir = 'right';
      } else if (stageA.number === '7' && stageB.number === '8') {
        // Infographic Wrap-Around Loop from Stage 7 (end of Row 1) to Stage 8 (start of Row 2)
        isLoop = true;
        const startX = a.right + 2;
        const startY = a.top + 72;

        // Right turning boundary
        const rightTurnX = Math.max(a.right + 18, containerRect.width - 24);

        // Gap vertical center between row 1 and row 2
        const midRowY = (a.bottom + b.top) / 2;

        // Left turning boundary (aligned just to the left of Card 8)
        const leftTurnX = Math.max(12, b.left - 24);
        const endY = b.top + 28;

        // Clean routed serpentine curve with 90° rounded corners
        pathD = `M ${startX} ${startY}
                 L ${rightTurnX - 10} ${startY}
                 Q ${rightTurnX} ${startY} ${rightTurnX} ${startY + 10}
                 L ${rightTurnX} ${midRowY - 10}
                 Q ${rightTurnX} ${midRowY} ${rightTurnX - 10} ${midRowY}
                 L ${leftTurnX + 10} ${midRowY}
                 Q ${leftTurnX} ${midRowY} ${leftTurnX} ${midRowY + 10}
                 L ${leftTurnX} ${endY}`;

        arrowX = leftTurnX;
        arrowY = endY;
        arrowDir = 'down';
      } else if (mode === 'tablet') {
        // Tablet 2-column zigzag fallback
        if (isSameRow) {
          const startX = a.right + 2;
          const startY = a.top + 65;
          const endX = b.left - 2;
          const endY = b.top + 65;

          pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
          arrowX = endX - 3;
          arrowY = endY;
          arrowDir = 'right';
        } else {
          // Row to next row curve
          const startX = a.right + 2;
          const startY = a.top + 65;
          const endX = b.left - 2;
          const endY = b.top + 65;
          const midY = (startY + endY) / 2;

          pathD = `M ${startX} ${startY}
                   C ${startX + 30} ${startY}, ${endX - 30} ${endY}, ${endX} ${endY}`;
          arrowX = endX - 3;
          arrowY = endY;
          arrowDir = 'right';
        }
      } else {
        // Generic connector fallback
        const midY = (a.bottom + b.top) / 2;
        pathD = `M ${a.centerX} ${a.bottom}
                 C ${a.centerX} ${midY}, ${b.centerX} ${midY}, ${b.centerX} ${b.top}`;
        arrowX = b.centerX;
        arrowY = b.top;
        arrowDir = 'down';
      }

      newSegments.push({
        id: `${stageA.id}->${stageB.id}`,
        fromId: stageA.id,
        toId: stageB.id,
        pathD,
        arrowX,
        arrowY,
        arrowDir,
        color: strokeColor,
        isCompleted,
        isLoop,
      });
    }

    setSegments(newSegments);
  }, [containerRef, visibleStages, mode, completedMap]);

  useEffect(() => {
    calculateSegments();

    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      calculateSegments();
    });

    resizeObserver.observe(container);

    const timer1 = setTimeout(calculateSegments, 150);
    const timer2 = setTimeout(calculateSegments, 400);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [calculateSegments, containerRef, visibleStages, mode]);

  if (mode === 'mobile' || segments.length === 0) {
    return null;
  }

  return (
    <svg
      className="roadmap-svg-overlay"
      aria-hidden="true"
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <defs>
        <marker
          id={`arrow-right-${gradientId}`}
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 7 5 L 0 8.5 z" fill="#94A3B8" />
        </marker>
        <marker
          id={`arrow-right-active-${gradientId}`}
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 7 5 L 0 8.5 z" fill="#10B981" />
        </marker>
        <marker
          id={`arrow-down-${gradientId}`}
          viewBox="0 0 10 10"
          refX="5"
          refY="6"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 1.5 0 L 5 7 L 8.5 0 z" fill="#94A3B8" />
        </marker>
        <marker
          id={`arrow-down-active-${gradientId}`}
          viewBox="0 0 10 10"
          refX="5"
          refY="6"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M 1.5 0 L 5 7 L 8.5 0 z" fill="#10B981" />
        </marker>
      </defs>

      {segments.map((seg) => {
        const markerUrl =
          seg.arrowDir === 'down'
            ? seg.isCompleted
              ? `url(#arrow-down-active-${gradientId})`
              : `url(#arrow-down-${gradientId})`
            : seg.isCompleted
            ? `url(#arrow-right-active-${gradientId})`
            : `url(#arrow-right-${gradientId})`;

        return (
          <g key={seg.id} className="connector-segment-group">
            {/* Soft backdrop line */}
            <path
              d={seg.pathD}
              stroke={seg.isCompleted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(226, 232, 240, 0.9)'}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Core connector line with arrowhead marker */}
            <path
              d={seg.pathD}
              stroke={seg.isCompleted ? '#10B981' : '#94A3B8'}
              strokeWidth="1.75"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              markerEnd={markerUrl}
              className="connector-path"
            />
          </g>
        );
      })}
    </svg>
  );
};
