import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { RoadmapEdge } from '../types';
import { useRoadmapViewerStore } from '../store/useRoadmapViewerStore';

interface EdgeRendererProps {
  edges: RoadmapEdge[];
  dimmedNodeIds?: Set<string>;
}

export const EdgeRenderer: React.FC<EdgeRendererProps> = ({ edges, dimmedNodeIds }) => {
  const { nodes, focusMode, activeNodeId, progress, hoveredNodeId } = useRoadmapViewerStore();

  const nodeMap = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);

  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0, minHeight: '100%' }}>
      {edges.map((edge, index) => {
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);
        if (!sourceNode || !targetNode) return null;

        const sx_raw = sourceNode.x;
        const sy_raw = sourceNode.y;
        const sw = sourceNode.width;
        const sh = sourceNode.height;
        const tx_raw = targetNode.x;
        const ty_raw = targetNode.y;
        const tw = targetNode.width;
        const th = targetNode.height;

        // Determine connection anchor points from saved handle IDs
        const srcH = edge.sourceHandle || 'bottom';
        const tgtH = edge.targetHandle || 'top';

        let sx: number, sy: number, tx: number, ty: number;

        // Source anchor
        if (srcH === 'source-right') {
          sx = sx_raw + sw; sy = sy_raw + sh / 2;
        } else if (srcH === 'target-left') {
          sx = sx_raw;     sy = sy_raw + sh / 2;
        } else if (srcH === 'top') {
          sx = sx_raw + sw / 2; sy = sy_raw;
        } else { // bottom (default)
          sx = sx_raw + sw / 2; sy = sy_raw + sh;
        }

        // Target anchor
        if (tgtH === 'target-left') {
          tx = tx_raw;         ty = ty_raw + th / 2;
        } else if (tgtH === 'source-right') {
          tx = tx_raw + tw;    ty = ty_raw + th / 2;
        } else if (tgtH === 'bottom') {
          tx = tx_raw + tw / 2; ty = ty_raw + th;
        } else { // top (default)
          tx = tx_raw + tw / 2; ty = ty_raw;
        }

        const dx = tx - sx;
        const dy = ty - sy;

        // Smooth orthogonal path with rounded corners. Gutter avoidance logic.
        let pathD = `M ${sx} ${sy} L ${tx} ${ty}`;
        const R = Math.min(16, Math.abs(dx) / 2, Math.abs(dy) / 2 || 100);

        if (Math.abs(dx) > 8 && Math.abs(dy) > 8) {
          const dxSign = Math.sign(dx);
          const dySign = Math.sign(dy);

          if (srcH === 'bottom' && tgtH === 'top') {
            // Standard vertical flow - route through the gutter midpoint
            const midY = sy + (dy / 2);
            pathD = `M ${sx} ${sy} ` +
                    `L ${sx} ${midY - R * dySign} ` +
                    `Q ${sx} ${midY} ${sx + dxSign * R} ${midY} ` +
                    `L ${tx - dxSign * R} ${midY} ` +
                    `Q ${tx} ${midY} ${tx} ${midY + R * dySign} ` +
                    `L ${tx} ${ty}`;
          } else if ((srcH === 'source-right' || srcH === 'target-left') && (tgtH === 'source-right' || tgtH === 'target-left')) {
            // Horizontal flow - route through horizontal gutter midpoint
            const midX = sx + (dx / 2);
            pathD = `M ${sx} ${sy} ` +
                    `L ${midX - R * dxSign} ${sy} ` +
                    `Q ${midX} ${sy} ${midX} ${sy + dySign * R} ` +
                    `L ${midX} ${ty - dySign * R} ` +
                    `Q ${midX} ${ty} ${midX + R * dxSign} ${ty} ` +
                    `L ${tx} ${ty}`;
          } else {
            // Mixed or fallback - simple L shape
            if (srcH === 'bottom' || srcH === 'top') {
              pathD = `M ${sx} ${sy} L ${sx} ${ty - R * dySign} Q ${sx} ${ty} ${sx + dxSign * R} ${ty} L ${tx} ${ty}`;
            } else {
              pathD = `M ${sx} ${sy} L ${tx - R * dxSign} ${sy} Q ${tx} ${sy} ${tx} ${sy + dySign * R} L ${tx} ${ty}`;
            }
          }
        } else if (Math.abs(dx) > 8) { // purely horizontal
          pathD = `M ${sx} ${sy} L ${tx} ${ty}`;
        } else if (Math.abs(dy) > 8) { // purely vertical
          pathD = `M ${sx} ${sy} L ${tx} ${ty}`;
        }

        const isFaded = focusMode && activeNodeId !== null && edge.source !== activeNodeId && edge.target !== activeNodeId;
        const isHovered = hoveredNodeId === edge.source || hoveredNodeId === edge.target;
        const isEdgeDimmed = dimmedNodeIds && (dimmedNodeIds.has(edge.source) || dimmedNodeIds.has(edge.target));
        
        const sourceCompleted = progress[edge.source]?.status === 'COMPLETED';
        const targetCompleted = progress[edge.target]?.status === 'COMPLETED';
        
        let edgeStatus: 'completed' | 'current' | 'upcoming' = 'upcoming';
        if (sourceCompleted && targetCompleted) {
          edgeStatus = 'completed';
        } else if (sourceCompleted) {
          edgeStatus = 'current';
        }

        const BG_MAP: Record<string, string> = {
          'bg-white':        '#d1d5db',
          'bg-indigo-50':    '#c7d2fe',
          'bg-indigo-600':   '#4f46e5',
          'bg-rose-500':     '#f43f5e',
          'bg-amber-500':    '#f59e0b',
          'bg-emerald-500':  '#10b981',
          'bg-sky-500':      '#0ea5e9',
          'bg-slate-800':    '#1e293b',
        };

        const themeColor = sourceNode.color ? (BG_MAP[sourceNode.color] || '#6366f1') : '#d1d5db';

        const sourcePt = { x: sx, y: sy };
        const targetPt = { x: tx, y: ty };

        const uniqueKey = edge.id ? `${edge.id}-${index}` : `${edge.source}-${edge.target}-${index}`;

        return (
          <motion.g 
            key={uniqueKey} 
            animate={{ opacity: isFaded ? 0.15 : isEdgeDimmed ? 0.1 : 1 }}
            transition={{ duration: 0.2 }}
          >
            {/* Background Path */}
            <motion.path
              animate={{ d: pathD }}
              transition={{ duration: 0.3 }}
              fill="none"
              stroke={edgeStatus === 'completed' ? '#22C55E' : themeColor}
              strokeWidth={isHovered ? 5 : 4}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            
            {/* Completed Path */}
            {edgeStatus === 'completed' && !isFaded && (
              <>
                <motion.path
                  animate={{ d: pathD, pathLength: 1 }}
                  transition={{ d: { duration: 0.3 }, pathLength: { duration: 0.8, ease: "easeInOut" } }}
                  initial={{ pathLength: 0 }}
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth={isHovered ? 5 : 4}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.4))' }}
                />
                <motion.path
                  animate={{ d: pathD, strokeDashoffset: [-116, 0] }}
                  transition={{ d: { duration: 0.3 }, strokeDashoffset: { duration: 1.6, repeat: Infinity, ease: "linear" } }}
                  fill="none"
                  stroke="#4ADE80"
                  strokeWidth={isHovered ? 5.5 : 4.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  opacity={0.8}
                  strokeDasharray="16 100"
                />
              </>
            )}
            
            {/* Current Path */}
            {edgeStatus === 'current' && !isFaded && (
              <>
                <motion.path
                  animate={{ d: pathD, pathLength: 1, opacity: [0.6, 1, 0.6] }}
                  transition={{ 
                    d: { duration: 0.3 },
                    pathLength: { duration: 0.6, ease: "easeOut" },
                    opacity: { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
                  }}
                  initial={{ pathLength: 0 }}
                  fill="none"
                  stroke={themeColor}
                  strokeWidth={isHovered ? 5 : 4}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <motion.path
                  animate={{ d: pathD, strokeDashoffset: [-140, 0] }}
                  transition={{ d: { duration: 0.3 }, strokeDashoffset: { duration: 1.8, repeat: Infinity, ease: "linear" } }}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth={isHovered ? 6 : 4.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  opacity={0.8}
                  strokeDasharray="20 120"
                />
              </>
            )}

            {/* Hover Highlight Glow */}
            {isHovered && !isFaded && (
              <motion.path
                animate={{ d: pathD }}
                transition={{ duration: 0.3 }}
                fill="none"
                stroke={edgeStatus === 'completed' ? '#4ADE80' : themeColor}
                strokeWidth={8}
                opacity={0.25}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}

            {/* Connection point milestones */}
            {sourcePt && (
              <motion.circle
                cx={sourcePt.x}
                cy={sourcePt.y}
                r={4}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                fill={sourceCompleted ? "#22C55E" : themeColor}
                stroke={sourceCompleted ? "#22C55E" : themeColor}
                strokeWidth={2.5}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
            )}
            
            {targetPt && (
              <motion.circle
                cx={targetPt.x}
                cy={targetPt.y}
                r={4}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                fill={targetCompleted ? "#22C55E" : themeColor}
                stroke={targetCompleted ? "#22C55E" : themeColor}
                strokeWidth={2.5}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
            )}
          </motion.g>
        );
      })}
    </svg>
  );
};
