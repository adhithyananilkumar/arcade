'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { BookOpen, HelpCircle, FileText, Link, PlaySquare, Folder, AlertTriangle } from 'lucide-react';

export type NodeType = 'lesson' | 'quiz' | 'assignment' | 'resource' | 'video' | 'section';
export type NodeStatus = 'draft' | 'review' | 'published' | 'archived';

const TYPE_ICONS = {
  lesson: BookOpen,
  quiz: HelpCircle,
  assignment: FileText,
  resource: Link,
  video: PlaySquare,
  section: Folder,
};

const STATUS_STYLES = {
  draft: 'bg-gray-100 text-gray-600 border-gray-200',
  review: 'bg-amber-100 text-amber-700 border-amber-200',
  published: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  archived: 'bg-rose-100 text-rose-700 border-rose-200',
};

import { RoadmapNode } from './RoadmapNode';

export function LearningNode({ id, data, selected }: NodeProps) {
  const nodeType = (data.nodeType as string) || 'lesson';
  const status = (data.status as string) || 'draft';
  const duration = (data.duration as string) || '';
  const difficulty = (data.difficulty as string) || '';
  const validationError = data.validationError as string | undefined;
  const isReadOnly = !!data.readOnly;

  const handleRename = (nodeId: string, newLabel: string) => {
    if (data.onRename && typeof data.onRename === 'function') {
      data.onRename(nodeId, newLabel);
    }
  };

  return (
    <RoadmapNode
      id={id}
      label={(data.label as string) || ''}
      description={(data.description as string) || ''}
      nodeType={nodeType}
      status={status}
      difficulty={difficulty}
      duration={duration}
      color={(data.color as string) || undefined}
      fontColor={(data.fontColor as string) || undefined}
      fontFamily={(data.fontFamily as string) || undefined}
      isCompleted={!!data.completed}
      isCurrent={false}
      editable={!isReadOnly}
      showHandles={true}
      onRename={handleRename}
      validationError={validationError}
      selected={selected}
      hideCheckbox={true}
    />
  );
}
