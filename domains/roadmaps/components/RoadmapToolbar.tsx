import React from 'react';
import { 
  MousePointer2, Hand, Plus, GitFork, Link as LinkIcon, 
  LayoutGrid, Maximize, Target, Map, Grid, Palette, 
  Search, Undo, Redo, Save, Trash2
} from 'lucide-react';

export type ToolbarMode = 'pointer' | 'hand' | 'connect';

interface RoadmapToolbarProps {
  activeTool?: ToolbarMode;
  onChangeActiveTool?: (tool: ToolbarMode) => void;
  onAddTopic: () => void;
  onAddChild?: () => void;
  onDeleteSelected: () => void;
  onFitView: () => void;
  onCenterSelection?: () => void;
  onAutoLayout?: () => void;
  onToggleMinimap?: () => void;
  onToggleGrid?: () => void;
  onOpenBackgroundSettings?: () => void;
  onOpenSearch?: () => void;
  hasSelection: boolean;
  saveState: 'saved' | 'saving' | 'unsaved' | 'error' | 'conflict';
  onSave: () => void;
  readOnly?: boolean;
  // Legacy props preserved for compatibility until RoadmapCanvas is migrated
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

function ToolButton({ 
  icon: Icon, label, shortcut, active, onClick, disabled, className = "" 
}: { 
  icon: any, label: string, shortcut?: string, active?: boolean, onClick?: () => void, disabled?: boolean, className?: string 
}) {
  return (
    <div className="group relative flex items-center justify-center">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center justify-center w-10 h-10 rounded-[10px] transition-all duration-200 
          ${disabled ? 'opacity-50 cursor-not-allowed text-gray-500' : 
            active ? 'bg-indigo-500 text-white shadow-md scale-100' : 
            'text-gray-400 hover:bg-white/10 hover:text-white hover:-translate-y-[2px] hover:shadow-lg active:scale-95'
          } ${className}`}
      >
        <Icon size={18} strokeWidth={active ? 2.5 : 2} />
      </button>
      
      {/* Tooltip */}
      <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
        <div className="flex flex-col items-center justify-center px-3 py-1.5 bg-gray-900/95 backdrop-blur-sm text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap border border-gray-700/50">
          <span>{label}</span>
          {shortcut && <span className="text-gray-400 text-[10px] mt-0.5 tracking-widest">{shortcut}</span>}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900/95" />
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="w-[1px] h-6 bg-white/10 mx-1" />;
}

export function RoadmapToolbar({
  activeTool = 'pointer',
  onChangeActiveTool = () => {},
  onAddTopic,
  onAddChild,
  onDeleteSelected,
  onFitView,
  onCenterSelection,
  onAutoLayout,
  onToggleMinimap,
  onToggleGrid,
  onOpenBackgroundSettings,
  onOpenSearch,
  hasSelection,
  saveState,
  onSave,
  readOnly,
  searchQuery,
  onSearchChange
}: RoadmapToolbarProps) {
  
  if (readOnly) {
    return (
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 p-2 bg-[#1E1E1E]/80 backdrop-blur-xl border border-white/10 rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.25)] pointer-events-auto">
        <ToolButton icon={MousePointer2} label="Pointer Tool" shortcut="V" active={activeTool === 'pointer'} onClick={() => onChangeActiveTool('pointer')} />
        <ToolButton icon={Hand} label="Hand Tool" shortcut="H" active={activeTool === 'hand'} onClick={() => onChangeActiveTool('hand')} />
        <Divider />
        <ToolButton icon={Plus} label="Add Topic" shortcut="A" onClick={onAddTopic} />
        <Divider />
        <ToolButton icon={Maximize} label="Fit View" shortcut="F" onClick={onFitView} />
        <ToolButton icon={Map} label="Toggle Minimap" shortcut="M" onClick={onToggleMinimap} />
        <ToolButton icon={Palette} label="Canvas Settings" shortcut="B" onClick={onOpenBackgroundSettings} />
      </div>
    );
  }

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center p-2 bg-[#1E1E1E]/85 backdrop-blur-xl border border-white/10 rounded-[20px] shadow-[0_16px_40px_rgba(0,0,0,0.3)] pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Selection Group */}
      <div className="flex items-center gap-0.5">
        <ToolButton icon={MousePointer2} label="Pointer Tool" shortcut="V" active={activeTool === 'pointer'} onClick={() => onChangeActiveTool('pointer')} />
        <ToolButton icon={Hand} label="Hand Tool" shortcut="H" active={activeTool === 'hand'} onClick={() => onChangeActiveTool('hand')} />
      </div>

      <Divider />

      {/* Creation Group */}
      <div className="flex items-center gap-0.5">
        <ToolButton icon={Plus} label="Add Topic" shortcut="A" onClick={onAddTopic} />
        <ToolButton icon={GitFork} label="Add Child" shortcut="Shift + A" onClick={onAddChild} disabled={!hasSelection} />
        <ToolButton icon={LinkIcon} label="Connect Topics" shortcut="C" active={activeTool === 'connect'} onClick={() => onChangeActiveTool('connect')} />
      </div>

      <Divider />

      {/* Layout Group */}
      <div className="flex items-center gap-0.5">
        <ToolButton icon={LayoutGrid} label="Auto Layout" shortcut="L" onClick={onAutoLayout} />
        <ToolButton icon={Maximize} label="Fit View" shortcut="F" onClick={onFitView} />
        <ToolButton icon={Target} label="Center Selection" shortcut="Shift + F" onClick={onCenterSelection} disabled={!hasSelection} />
      </div>

      <Divider />

      {/* View Group */}
      <div className="flex items-center gap-0.5">
        <ToolButton icon={Map} label="Toggle Minimap" shortcut="M" onClick={onToggleMinimap} />
        <ToolButton icon={Grid} label="Toggle Grid" shortcut="G" onClick={onToggleGrid} />
        <ToolButton icon={Palette} label="Canvas Settings" shortcut="B" onClick={onOpenBackgroundSettings} />
      </div>

      <Divider />

      {/* Utilities Group */}
      <div className="flex items-center gap-0.5">
        <ToolButton icon={Search} label="Search Topics" shortcut="Ctrl + K" onClick={onOpenSearch} />
        <ToolButton icon={Undo} label="Undo" shortcut="Ctrl + Z" />
        <ToolButton icon={Redo} label="Redo" shortcut="Ctrl + Shift + Z" />
        {hasSelection && (
          <ToolButton icon={Trash2} label="Delete Selected" shortcut="Backspace" onClick={onDeleteSelected} className="hover:!bg-red-500/20 hover:!text-red-400" />
        )}
      </div>

      <Divider />

      {/* Save Status */}
      <div className="flex items-center px-2 pr-1 gap-2">
        {saveState === 'saved' && <span className="text-[11px] font-semibold text-gray-500 tracking-wide uppercase">Saved</span>}
        {saveState === 'saving' && <span className="text-[11px] font-semibold text-indigo-400 animate-pulse tracking-wide uppercase">Saving</span>}
        {saveState === 'unsaved' && <span className="text-[11px] font-semibold text-amber-400 tracking-wide uppercase">Unsaved</span>}
        
        <button 
          onClick={onSave}
          disabled={saveState === 'saved' || saveState === 'saving'}
          className={`flex items-center justify-center w-10 h-10 rounded-[10px] transition-all duration-200 ${
            saveState === 'saved' || saveState === 'saving'
              ? 'text-gray-600 cursor-not-allowed opacity-50' 
              : 'text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 active:scale-95'
          }`} 
          title="Save (Ctrl+S)"
        >
          <Save size={18} strokeWidth={2} />
        </button>
      </div>

    </div>
  );
}
