import React from 'react';
import { X, PlaySquare, FileText, Link as LinkIcon, BookOpen, HelpCircle } from 'lucide-react';
import type { Node } from '@xyflow/react';
import type { NodeType } from './LearningNode';

interface NodeLearningViewerProps {
  node: Node;
  onClose: () => void;
}

const TYPE_ICONS = {
  lesson: BookOpen,
  quiz: HelpCircle,
  assignment: FileText,
  resource: LinkIcon,
  video: PlaySquare,
  section: BookOpen,
};

export function NodeLearningViewer({ node, onClose }: NodeLearningViewerProps) {
  const nodeType = (node.data.nodeType as NodeType) || 'lesson';
  const label = node.data.label as string;
  const description = node.data.description as string;
  const duration = node.data.duration as string;
  const completed = !!node.data.completed;
  
  const Icon = TYPE_ICONS[nodeType] || BookOpen;

  return (
    <div className="w-96 border-l border-gray-200 bg-white shadow-xl flex flex-col h-full absolute right-0 top-0 bottom-0 z-20 overflow-y-auto animate-in slide-in-from-right">
      <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Icon size={20} />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-lg leading-tight">{label || 'Untitled Topic'}</h2>
            {duration && <span className="text-sm font-medium text-gray-500">{duration}</span>}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 -mr-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 p-6 flex flex-col">
        {description ? (
          <div className="prose prose-sm prose-indigo max-w-none text-gray-600">
            <p>{description}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-400 mb-3 shadow-sm border border-gray-100">
              <FileText size={24} />
            </div>
            <p className="text-gray-500 font-medium">No detailed content provided.</p>
            <p className="text-sm text-gray-400 mt-1">Select another topic to continue learning.</p>
          </div>
        )}
      </div>
      
      <div className="p-6 border-t border-gray-100 bg-gray-50">
        <button
          onClick={() => {
            if (node.data.onUpdate && typeof node.data.onUpdate === 'function') {
              node.data.onUpdate(node.id, { completed: !completed });
            }
          }}
          className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
            completed 
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shadow-inner'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
          }`}
        >
          {completed ? (
            <>
              Completed!
            </>
          ) : (
            <>
              Mark as Complete
            </>
          )}
        </button>
      </div>
    </div>
  );
}
