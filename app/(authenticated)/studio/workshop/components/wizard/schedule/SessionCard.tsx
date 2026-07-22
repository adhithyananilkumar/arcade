import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronDown, ChevronUp, Copy, Trash2 } from 'lucide-react';
import { WorkshopSession } from '@/app/(authenticated)/studio/workshop/types';
import { SessionForm } from './SessionForm';

interface Props {
  id: string;
  session: Partial<WorkshopSession>;
  index: number;
  onUpdate: (field: string, value: any) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export const SessionCard: React.FC<Props> = ({ id, session, index, onUpdate, onDelete, onDuplicate }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white dark:bg-gray-900 border rounded-lg shadow-sm ${
        isDragging ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500' : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-t-lg">
        <div className="flex items-center space-x-3 flex-1">
          <div {...attributes} {...listeners} className="cursor-grab hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded">
            <GripVertical size={20} className="text-gray-400" />
          </div>
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            Session {index + 1}: {session.title || 'Untitled Session'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onDuplicate}
            className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Duplicate Session"
          >
            <Copy size={18} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Delete Session"
          >
            <Trash2 size={18} />
          </button>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6">
          <SessionForm session={session} onUpdate={onUpdate} />
        </div>
      )}
    </div>
  );
};
