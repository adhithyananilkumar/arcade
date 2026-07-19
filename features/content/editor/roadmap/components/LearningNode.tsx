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

export function LearningNode({ id, data, selected, dragging }: NodeProps) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState((data.label as string) || '');
  const [isCheckAnimating, setIsCheckAnimating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const nodeType = (data.nodeType as NodeType) || 'lesson';
  const status = (data.status as NodeStatus) || 'draft';
  const duration = (data.duration as string) || '';
  const bgColor = (data.color as string) || (nodeType === 'section' ? 'bg-indigo-50' : 'bg-white');
  const fontFamily = (data.fontFamily as string) || 'font-sans';
  const fontColor = (data.fontColor as string) || 'text-gray-900';
  const description = (data.description as string) || '';
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

  const completed = !!data.completed;

  const toggleCompleted = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newCompleted = !completed;
    
    if (newCompleted) {
      setIsCheckAnimating(true);
      setTimeout(() => setIsCheckAnimating(false), 600);
    }
    
    if (data.onUpdate && typeof data.onUpdate === 'function') {
      data.onUpdate(id, { completed: newCompleted });
    }
  };

  const handleClass = `w-4 h-4 rounded-full border-2 border-white bg-indigo-500 transition-all duration-200 ${selected ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'}`;

  const renderCheckbox = (inline: boolean = false) => (
    <div className={inline ? "relative z-20 flex shrink-0 items-center justify-center" : "absolute -top-3 -left-3 z-20"}>
      {/* Background Ripple (Ping) Effect */}
      {isCheckAnimating && (
        <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75 duration-500" />
      )}
      {/* Main Checkbox */}
      <div 
        onClick={toggleCompleted}
        className={`relative flex items-center justify-center w-6 h-6 rounded-full border-2 cursor-pointer shadow-sm bg-white ${
          isCheckAnimating ? 'animate-spring-check' : 'transition-colors'
        } ${completed ? 'border-emerald-500 text-emerald-500' : 'border-gray-300 text-transparent hover:border-indigo-400'}`}
      >
        <svg 
          className={`w-4 h-4 transition-transform duration-300 ${completed ? 'scale-100' : 'scale-0'}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* Spring Animation Styles */}
      <style>{`
        @keyframes springCheck {
          0% { transform: scale(1); }
          40% { transform: scale(0.85); }
          70% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .animate-spring-check {
          animation: springCheck 500ms cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );

  const Icon = TYPE_ICONS[nodeType] || BookOpen;
  
  if (nodeType === 'section') {
    return (
      <div
        className={`group relative min-w-[200px] rounded-2xl border-2 px-6 py-5 shadow-sm transition-all duration-200 overflow-visible ${bgColor} ${fontFamily} ${
          selected ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)] z-10 scale-[1.02]' : 'border-indigo-200 hover:border-indigo-300'
        } ${dragging ? 'shadow-xl scale-[1.05] z-20 cursor-grabbing' : ''} ${completed ? 'opacity-70' : ''}`}
        onDoubleClick={handleDoubleClick}
      >
        <Handle type="source" position={Position.Top} id="top" className={handleClass} />
        <Handle type="source" position={Position.Left} id="left" className={handleClass} />
        <Handle type="source" position={Position.Right} id="right" className={handleClass} />
        
        {validationError && (
          <div className="absolute -top-2 -right-2 bg-red-100 border border-red-300 text-red-600 rounded-full p-1 shadow-sm z-10" title={validationError}>
            <AlertTriangle size={12} />
          </div>
        )}

        <div className="flex flex-col items-center justify-center text-center">
          <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100`}>
            {renderCheckbox(true)}
          </div>
          {editing ? (
            <input
              ref={inputRef}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={handleKeyDown}
              className="w-full bg-white bg-opacity-50 text-center text-base font-semibold outline-none ring-1 ring-indigo-500 rounded px-1 text-gray-900"
            />
          ) : (
            <div className="flex flex-col w-full text-center items-center">
              <div className={`text-base font-semibold truncate w-full ${fontColor}`}>
                {label || 'Untitled Section'}
              </div>
              {description && (
                <div className={`text-xs mt-1 opacity-80 line-clamp-2 w-full ${fontColor}`}>
                  {description}
                </div>
              )}
            </div>
          )}
        </div>
        <Handle type="source" position={Position.Bottom} id="bottom" className={handleClass} />
      </div>
    );
  }

  return (
    <div
      className={`group relative flex items-center gap-3 px-4 py-2 rounded-2xl border-2 transition-all duration-200 ${bgColor} ${fontFamily} overflow-visible ${
        selected ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)] z-10 scale-[1.02]' : completed ? 'border-emerald-400 shadow-sm' : 'border-gray-300 shadow-sm hover:border-gray-400'
      } ${dragging ? 'shadow-xl scale-[1.05] z-20 cursor-grabbing' : ''} ${completed ? 'opacity-90' : ''}`}
      onDoubleClick={handleDoubleClick}
    >
      <Handle type="source" position={Position.Top} id="top" className={handleClass} />
      <Handle type="source" position={Position.Left} id="left" className={handleClass} />
      <Handle type="source" position={Position.Right} id="right" className={handleClass} />
      
      {validationError && (
        <div className="absolute -top-2 -right-2 bg-red-100 border border-red-300 text-red-600 rounded-full p-1 shadow-sm z-20" title={validationError}>
          <AlertTriangle size={14} />
        </div>
      )}
      
      {renderCheckbox(true)}
      
      <div className="flex-1 overflow-hidden">
        {editing ? (
          <input
            ref={inputRef}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyDown}
            className="w-32 bg-white/50 text-sm font-semibold outline-none ring-1 ring-indigo-500 rounded px-1 -ml-1 text-gray-900"
          />
        ) : (
          <div className="flex flex-col w-full text-left">
            <div className={`text-sm font-semibold truncate leading-tight ${completed ? 'text-emerald-800' : fontColor}`}>
              {label || <span className="italic opacity-50">Untitled {nodeType}</span>}
            </div>
            {description && (
              <div className={`text-xs mt-0.5 opacity-80 line-clamp-2 ${completed ? 'text-emerald-700' : fontColor}`}>
                {description}
              </div>
            )}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} id="bottom" className={handleClass} />
    </div>
  );
}
