import React from 'react';
import { X, Palette } from 'lucide-react';
import { Node } from '@xyflow/react';

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onClose: () => void;
  onUpdate: (id: string, data: any) => void;
}

const COLORS = [
  { label: 'Default', value: 'bg-white' },
  { label: 'Indigo', value: 'bg-indigo-600' },
  { label: 'Rose', value: 'bg-rose-500' },
  { label: 'Amber', value: 'bg-amber-500' },
  { label: 'Emerald', value: 'bg-emerald-500' },
  { label: 'Sky', value: 'bg-sky-500' },
];

export function PropertiesPanel({ selectedNode, onClose, onUpdate }: PropertiesPanelProps) {
  if (!selectedNode) return null;

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(selectedNode.id, { label: e.target.value });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(selectedNode.id, { description: e.target.value });
  };

  const handleColorChange = (colorClass: string) => {
    onUpdate(selectedNode.id, { color: colorClass });
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 shadow-sm flex flex-col h-full z-10 shrink-0">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 text-sm">Topic Properties</h3>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
          <X size={16} />
        </button>
      </div>
      
      <div className="p-4 space-y-5 overflow-y-auto flex-1">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
            Topic Name
          </label>
          <input
            type="text"
            value={(selectedNode.data.label as string) || ''}
            onChange={handleLabelChange}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
            Description
          </label>
          <textarea
            rows={3}
            value={(selectedNode.data.description as string) || ''}
            onChange={handleDescriptionChange}
            placeholder="Add a brief description..."
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
            <Palette size={14} /> Color
          </label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => {
              const isActive = (selectedNode.data.color as string || 'bg-white') === c.value;
              return (
                <button
                  key={c.value}
                  onClick={() => handleColorChange(c.value)}
                  title={c.label}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${c.value} ${
                    isActive ? 'border-gray-900 scale-110 shadow-sm' : 'border-gray-200 hover:scale-105'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
