'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { RoadmapNode } from '../types';
import { useRoadmapViewerStore } from '../store/useRoadmapViewerStore';
import { RoadmapNode as SharedRoadmapNode } from '@/domains/roadmaps/components/RoadmapNode';

interface NodeCardProps {
  node: RoadmapNode;
  onMouseEnter?: (nodeId: string, rect: DOMRect) => void;
  onMouseLeave?: () => void;
  isDimmed?: boolean;
}

export const NodeCard: React.FC<NodeCardProps> = ({ node, onMouseEnter, onMouseLeave, isDimmed }) => {
  const {
    nodes,
    activeNodeId,
    setActiveNode,
    progress,
    toggleNodeCompletion,
  } = useRoadmapViewerStore();

  const cardRef = useRef<HTMLDivElement>(null);

  const nodeProgress = progress[node.id];
  const isCompleted = nodeProgress?.status === 'COMPLETED';
  const isActive = activeNodeId === node.id;

  const isFirstIncomplete = useMemo(() => {
    const next = nodes.find(n => progress[n.id]?.status !== 'COMPLETED');
    return next?.id === node.id;
  }, [nodes, progress, node.id]);

  const isCurrent = isActive || (activeNodeId === null && isFirstIncomplete);

  // Auto-scroll when this node becomes active
  useEffect(() => {
    if (isActive && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [isActive]);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleNodeCompletion(node.id);
  };

  const handleCardClick = () => {
    setActiveNode(isActive ? null : node.id);
  };

  return (
    <div
      ref={cardRef}
      style={{
        position: 'absolute',
        left: `${node.x}px`,
        top: `${node.y}px`,
        width: `${node.width}px`,
        height: `${node.height}px`,
        zIndex: isActive ? 10 : 1,
      }}
    >
      <SharedRoadmapNode
        id={node.id}
        label={node.label}
        description={node.description}
        nodeType={node.type}
        status={node.status}
        difficulty={node.difficulty}
        duration={node.duration}
        color={node.color}
        fontColor={node.fontColor}
        fontFamily={node.fontFamily}
        isCompleted={isCompleted}
        isCurrent={isCurrent}
        editable={false}
        showHandles={false}
        onClick={handleCardClick}
        onCheckboxClick={handleCheckboxClick}
        isDimmed={isDimmed}
        onMouseEnter={(rect) => onMouseEnter?.(node.id, rect)}
        onMouseLeave={onMouseLeave}
        selected={isActive}
      />
    </div>
  );
};
