import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/design-system/ui/button';
import { useRoadmapViewerStore } from '../store/useRoadmapViewerStore';
import { ZoomIn, ZoomOut, Search } from 'lucide-react';

interface ViewerHeaderProps {
  title: string;
  description: string;
  completionPercentage: number;
  totalNodes: number;
  difficulty: string;
  estimatedDuration: string;
  completedNodesCount: number;
  currentNodeLabel: string | null;
  remainingNodesCount: number;
}

export const ViewerHeader: React.FC<ViewerHeaderProps> = ({
  title,
  description,
  completionPercentage,
  totalNodes,
  difficulty,
  estimatedDuration,
  completedNodesCount,
  currentNodeLabel,
  remainingNodesCount,
}) => {
  const { zoomLevel, setZoomLevel, focusMode, setFocusMode } = useRoadmapViewerStore();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex-1 flex flex-col">
        <h1 className="text-xl font-bold text-gray-900 leading-tight">{title}</h1>
        <p className="text-sm text-gray-500 line-clamp-1 mt-1 mb-2 max-w-2xl">{description}</p>
        <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
          <span className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            {difficulty}
          </span>
          <span className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-md">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {estimatedDuration}
          </span>
          <span className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-md">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            {totalNodes} Topics
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        {/* Progress Tracker */}
        <div className="flex items-center gap-4 border-r border-gray-200 pr-6">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {completedNodesCount} of {totalNodes} Completed
            </span>
            <div className="flex gap-2 text-xs font-semibold mt-0.5">
              <span className="text-green-600">{completedNodesCount} Completed</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-500">{remainingNodesCount} Remaining</span>
            </div>
            {currentNodeLabel && (
              <span className="text-[11px] text-indigo-600 font-bold mt-0.5 line-clamp-1 max-w-[180px]">
                Active: {currentNodeLabel}
              </span>
            )}
          </div>
          
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2.5">
              <div className="w-28 h-2.5 bg-gray-100 rounded-full overflow-hidden relative">
                <motion.div 
                  className="h-full bg-green-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
              <span className="text-sm font-bold text-gray-900 min-w-[35px] text-right">
                {Math.round(completionPercentage)}%
              </span>
            </div>
          </div>
        </div>

        {/* Zoom and Focus Controls */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setZoomLevel(zoomLevel - 0.1)} title="Zoom Out">
            <ZoomOut className="w-4 h-4 text-gray-600" />
          </Button>
          <span className="text-sm font-semibold text-gray-600 min-w-[4ch] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <Button variant="ghost" size="icon" onClick={() => setZoomLevel(zoomLevel + 0.1)} title="Zoom In">
            <ZoomIn className="w-4 h-4 text-gray-600" />
          </Button>
          
          <Button 
            variant={focusMode ? "default" : "outline"}
            className={focusMode ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm" : "shadow-sm"}
            onClick={() => setFocusMode(!focusMode)}
          >
            {focusMode ? 'Focus Mode' : 'Standard View'}
          </Button>
        </div>
      </div>
    </header>
  );
};
