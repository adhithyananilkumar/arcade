import React from 'react';
import { 
  Plus, Trash2, Undo, Redo, LayoutGrid, Maximize, Save, Share, Search 
} from 'lucide-react';

interface RoadmapToolbarProps {
  onAddTopic: () => void;
  onDeleteSelected: () => void;
  onFitView: () => void;
  hasSelection: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  saveState: 'saved' | 'saving' | 'unsaved' | 'error' | 'conflict';
  onSave: () => void;
  readOnly?: boolean;
}

export function RoadmapToolbar({
  onAddTopic,
  onDeleteSelected,
  onFitView,
  hasSelection,
  searchQuery,
  onSearchChange,
  saveState,
  onSave,
  readOnly
}: RoadmapToolbarProps) {
  return (
    <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between gap-4 pointer-events-none">
      <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 pointer-events-auto">
        {!readOnly && (
          <button
            onClick={onAddTopic}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Add Topic
          </button>
        )}
        
        <div className="w-px h-5 bg-gray-200 mx-1" />
        
        <button
          onClick={onFitView}
          className="p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-colors"
          title="Fit to Screen"
        >
          <Maximize size={18} />
        </button>

        {!readOnly && hasSelection && (
          <>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <button
              onClick={onDeleteSelected}
              className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
              title="Delete Selected"
            >
              <Trash2 size={18} />
            </button>
          </>
        )}
      </div>

      <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 pointer-events-auto flex-1 max-w-sm">
        <div className="relative flex-1 flex items-center">
          <Search size={16} className="absolute left-3 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search topics..."
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 pointer-events-auto">
        <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Undo (Coming soon)">
          <Undo size={16} />
        </button>
        <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Redo (Coming soon)">
          <Redo size={16} />
        </button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Auto Layout (Coming soon)">
          <LayoutGrid size={16} />
        </button>
        <button onClick={onFitView} className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Fit View">
          <Maximize size={16} />
        </button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <div className="flex items-center gap-2 px-2">
          {saveState === 'saved' && <span className="text-xs font-medium text-gray-400">Saved</span>}
          {saveState === 'saving' && <span className="text-xs font-medium text-indigo-500 animate-pulse">Saving...</span>}
          {saveState === 'unsaved' && <span className="text-xs font-medium text-amber-500">Unsaved Changes</span>}
          {saveState === 'error' && <span className="text-xs font-medium text-red-500">Error Saving</span>}
          {saveState === 'conflict' && <span className="text-xs font-medium text-red-600 font-bold">Conflict</span>}
          
          <button 
            onClick={onSave}
            disabled={saveState === 'saved' || saveState === 'saving' || readOnly}
            className={`p-1.5 rounded-lg transition-colors ${
              saveState === 'saved' || saveState === 'saving' || readOnly
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-indigo-600 hover:bg-indigo-50'
            }`} 
            title="Save"
          >
            <Save size={16} />
          </button>
        </div>
      </div>

    </div>
  );
}
