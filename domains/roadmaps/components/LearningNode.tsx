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

export function LearningNode({ id, data, selected }: NodeProps) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState((data.label as string) || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const nodeType = (data.nodeType as NodeType) || 'lesson';
  const status = (data.status as NodeStatus) || 'draft';
  const duration = (data.duration as string) || '';
  const bgColor = (data.color as string) || (nodeType === 'section' ? 'bg-indigo-50' : 'bg-white');
  const hasCustomColor = !!data.color && data.color !== 'bg-white' && data.color !== 'bg-indigo-50';
  const validationError = data.validationError as string | undefined;
  const isReadOnly = !!data.readOnly;

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    setLabel((data.label as string) || '');
  }, [data.label]);

  const handleDoubleClick = () => {
    if (!isReadOnly) {
      setEditing(true);
    }
  };

  const saveEdit = () => {
    setEditing(false);
    if (data.onRename && typeof data.onRename === 'function') {
      data.onRename(id, label);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') {
      setLabel((data.label as string) || '');
      setEditing(false);
    }
  };

  const Icon = TYPE_ICONS[nodeType] || BookOpen;
  
  if (nodeType === 'section') {
    return (
      <div
        className={`group relative min-w-[200px] rounded-xl border-2 px-5 py-4 shadow-sm transition-all ${
          selected ? 'border-indigo-500 ring-4 ring-indigo-500/20' : 'border-indigo-200 hover:border-indigo-300'
        } ${bgColor}`}
        onDoubleClick={handleDoubleClick}
      >
        <Handle type="target" position={Position.Top} className="w-3 h-3 border-2 border-white bg-indigo-500" />
        
        {validationError && (
          <div className="absolute -top-2 -right-2 bg-red-100 border border-red-300 text-red-600 rounded-full p-1 shadow-sm z-10" title={validationError}>
            <AlertTriangle size={12} />
          </div>
        )}

        <div className="flex flex-col items-center justify-center text-center">
          <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700`}>
            <Icon size={20} />
          </div>
          {editing ? (
            <input
              ref={inputRef}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={handleKeyDown}
              className="w-full bg-white bg-opacity-50 text-center text-base font-bold outline-none ring-1 ring-indigo-500 rounded px-1 text-gray-900"
            />
          ) : (
            <div className={`text-base font-bold truncate w-full ${hasCustomColor ? 'text-white' : 'text-gray-900'}`}>
              {label || 'Untitled Section'}
            </div>
          )}
        </div>
        <Handle type="source" position={Position.Bottom} className="w-3 h-3 border-2 border-white bg-indigo-500" />
      </div>
    );
  }

  return (
    <div
      className={`group relative min-w-[240px] rounded-xl border-2 shadow-sm transition-all overflow-visible ${
        selected ? 'border-indigo-500 ring-4 ring-indigo-500/20 z-10' : 'border-gray-200 hover:border-gray-300'
      } ${bgColor}`}
      onDoubleClick={handleDoubleClick}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 border-2 border-white bg-indigo-500" />
      
      {validationError && (
        <div className="absolute -top-2 -right-2 bg-red-100 border border-red-300 text-red-600 rounded-full p-1 shadow-sm z-20" title={validationError}>
          <AlertTriangle size={14} />
        </div>
      )}
      
      <div className="p-3">
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-sm border ${hasCustomColor ? 'bg-white/20 border-white/20 text-white' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
            <Icon size={20} />
          </div>
          
          <div className="flex-1 overflow-hidden">
            {editing ? (
              <input
                ref={inputRef}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onBlur={saveEdit}
                onKeyDown={handleKeyDown}
                className="w-full bg-white/50 text-sm font-bold outline-none ring-1 ring-indigo-500 rounded px-1 -ml-1 text-gray-900"
              />
            ) : (
              <div className={`text-sm font-bold truncate leading-tight mb-1 ${hasCustomColor ? 'text-white' : 'text-gray-900'}`}>
                {label || <span className="italic opacity-50">Untitled {nodeType}</span>}
              </div>
            )}
            
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${STATUS_STYLES[status]}`}>
                {status}
              </span>
              
              {duration && (
                <span className={`text-[10px] font-medium ${hasCustomColor ? 'text-white/80' : 'text-gray-500'}`}>
                  {duration}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 border-2 border-white bg-indigo-500" />
    </div>
  );
}
