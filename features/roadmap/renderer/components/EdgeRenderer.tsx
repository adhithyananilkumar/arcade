import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { RoadmapEdge } from '../types';
import { useRoadmapViewerStore } from '../store/useRoadmapViewerStore';

interface EdgeRendererProps {
  edges: RoadmapEdge[];
}

export const EdgeRenderer: React.FC<EdgeRendererProps> = ({ edges }) => {
  const { nodes, focusMode, activeNodeId, progress, lockedNodeIds, hoveredNodeId } = useRoadmapViewerStore();

  const nodeMap = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);

  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0, minHeight: '100%' }}>
      {edges.map((edge, index) => {
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);
        if (!sourceNode || !targetNode) return null;

        const sx = sourceNode.x + sourceNode.width / 2;
        const sy = sourceNode.y + sourceNode.height; // Connect bottom center of source
        const tx = targetNode.x + targetNode.width / 2;
        const ty = targetNode.y; // Connect top center of target

        const dx = tx - sx;
        const dy = ty - sy;

        // Smooth orthogonal routing with rounded corners
        let pathD = `M ${sx} ${sy} L ${tx} ${ty}`;
        if (Math.abs(dx) > 8 && dy > 16) {
          const my = sy + dy / 2;
          const R = Math.min(16, dy / 2, Math.abs(dx) / 2);
          const dxSign = Math.sign(dx);
          pathD = `M ${sx} ${sy} ` +
                  `L ${sx} ${my - R} ` +
                  `Q ${sx} ${my} ${sx + dxSign * R} ${my} ` +
                  `L ${tx - dxSign * R} ${my} ` +
                  `Q ${tx} ${my} ${tx} ${my + R} ` +
                  `L ${tx} ${ty}`;
        }

        const isFaded = focusMode && activeNodeId !== null && edge.source !== activeNodeId && edge.target !== activeNodeId;
        const isHovered = hoveredNodeId === edge.source || hoveredNodeId === edge.target;
        
        const sourceCompleted = progress[edge.source]?.status === 'COMPLETED';
        const targetCompleted = progress[edge.target]?.status === 'COMPLETED';
        const targetLocked = lockedNodeIds.has(edge.target);
        
        let edgeStatus: 'completed' | 'current' | 'locked' | 'upcoming' = 'upcoming';
        if (sourceCompleted && targetCompleted) {
          edgeStatus = 'completed';
        } else if (sourceCompleted && !targetLocked) {
          edgeStatus = 'current';
        } else if (targetLocked) {
          edgeStatus = 'locked';
        }

        const sourcePt = { x: sx, y: sy };
        const targetPt = { x: tx, y: ty };

        const uniqueKey = edge.id ? `${edge.id}-${index}` : `${edge.source}-${edge.target}-${index}`;

        return (
          <g key={uniqueKey} style={{ opacity: isFaded ? 0.15 : 1, transition: 'opacity 0.2s ease' }}>
            {/* Background Path (gray base) */}
            <path
              d={pathD}
              fill="none"
              stroke={edgeStatus === 'locked' ? '#E5E7EB' : '#D1D5DB'}
              strokeWidth={isHovered ? 5 : 4}
              strokeDasharray={edgeStatus === 'locked' ? "5 5" : undefined}
              strokeLinejoin="round"
              strokeLinecap="round"
              style={{ transition: 'stroke-width 0.2s, stroke 0.2s' }}
            />
            
            {/* Completed Path (Green drawing animation) */}
            {edgeStatus === 'completed' && !isFaded && (
              <motion.path
                d={pathD}
                fill="none"
                stroke="#22C55E"
                strokeWidth={isHovered ? 5 : 4}
                strokeLinejoin="round"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            )}
            
            {/* Current Path (Purple drawing & flow animation) */}
            {edgeStatus === 'current' && !isFaded && (
              <>
                <motion.path
                  d={pathD}
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth={isHovered ? 5 : 4}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
                <motion.path
                  d={pathD}
                  fill="none"
                  stroke="#818CF8"
                  strokeWidth={isHovered ? 6 : 4.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  opacity={0.8}
                  strokeDasharray="20 120"
                  animate={{ strokeDashoffset: [-140, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                />
              </>
            )}

            {/* Hover Highlight Glow */}
            {isHovered && !isFaded && (
              <path
                d={pathD}
                fill="none"
                stroke={edgeStatus === 'completed' ? '#4ADE80' : edgeStatus === 'current' ? '#818CF8' : '#9CA3AF'}
                strokeWidth={8}
                opacity={0.2}
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
                fill={sourceCompleted ? "#22C55E" : (edgeStatus === 'current' || activeNodeId === edge.source) ? "#6366F1" : "#FFFFFF"}
                stroke={sourceCompleted ? "#22C55E" : (edgeStatus === 'current' || activeNodeId === edge.source) ? "#6366F1" : "#D1D5DB"}
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
                fill={targetCompleted ? "#22C55E" : (edgeStatus === 'current' || activeNodeId === edge.target) ? "#6366F1" : "#FFFFFF"}
                stroke={targetCompleted ? "#22C55E" : (edgeStatus === 'current' || activeNodeId === edge.target) ? "#6366F1" : "#D1D5DB"}
                strokeWidth={2.5}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
};
