'use client';

import React from 'react';
import { LessonCard } from './LessonCard';
import { RoadmapNode, JourneyNodeAttachment } from '../types';

interface RoadCardProps {
  node: RoadmapNode;
  attachment: JourneyNodeAttachment;
  onMouseEnter?: (nodeId: string, rect: DOMRect) => void;
  onMouseLeave?: () => void;
  isDimmed?: boolean;
  isOpen?: boolean;
}

export const RoadCard: React.FC<RoadCardProps> = ({
  node,
  attachment,
  isDimmed,
  isOpen = true,
}) => {
  return (
    <LessonCard
      node={node}
      attachment={attachment}
      isActive={isOpen}
      isDimmed={isDimmed}
    />
  );
};
