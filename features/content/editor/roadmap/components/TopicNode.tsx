import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { BookOpen } from 'lucide-react';

export function TopicNode({ id, data, selected }: NodeProps) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data.label as string);
  const inputRef = useRef<HTMLInputElement>(null);

  const bgColor = (data.color as string) || 'bg-white';
  const hasCustomColor = !!data.color;

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    setLabel(data.label as string);
  }, [data.label]);

  const handleDoubleClick = () => {
    setEditing(true);
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
      setLabel(data.label as string);
      setEditing(false);
    }
  };

  return (
    <div
      className={`group relative min-w-[160px] rounded-xl border-2 px-4 py-3 shadow-sm transition-all ${
        selected ? 'border-indigo-500 ring-4 ring-indigo-500/20' : 'border-gray-200 hover:border-gray-300'
      } ${bgColor}`}
      onDoubleClick={handleDoubleClick}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 border-2 border-white bg-indigo-500" />
      
      <div className="flex items-center gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${hasCustomColor ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'}`}>
          <BookOpen size={16} className={hasCustomColor ? 'text-white' : ''} />
        </div>
        
        <div className="flex-1 overflow-hidden">
          {editing ? (
            <input
              ref={inputRef}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-sm font-semibold outline-none ring-0 text-gray-900"
            />
          ) : (
            <div className={`text-sm font-semibold truncate ${hasCustomColor ? 'text-white' : 'text-gray-900'}`}>
              {label}
            </div>
          )}
          {!!data.description && !editing && (
            <div className={`text-[10px] truncate ${hasCustomColor ? 'text-white/80' : 'text-gray-500'}`}>
              {String(data.description)}
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 border-2 border-white bg-indigo-500" />
    </div>
  );
}
