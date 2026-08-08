'use client';

import React from 'react';
import { Target, ZoomIn, ZoomOut, RotateCcw, Map } from 'lucide-react';
import { Button } from '@/shared/design-system/ui/button';

interface RoadControlsProps {
  onFocusCurrent: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  completionPercentage: number;
  completedNodesCount: number;
  totalNodesCount: number;
}

export const RoadControls: React.FC<RoadControlsProps> = ({
  onFocusCurrent,
  onZoomIn,
  onZoomOut,
  onResetView,
  completionPercentage,
  completedNodesCount,
  totalNodesCount,
}) => {
  return (
    <>
      {/* Floating Bottom-Right Interactive Camera Control Bar */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-white/90 backdrop-blur-md border border-gray-200/80 p-1.5 rounded-2xl shadow-2xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={onFocusCurrent}
          className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl px-3 h-9"
          title="Jump to current lesson"
        >
          <Target className="w-4 h-4 text-indigo-600 animate-pulse" />
          <span>Focus Active</span>
        </Button>

        <div className="w-px h-5 bg-gray-200" />

        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomIn}
          className="w-9 h-9 text-gray-700 hover:bg-gray-100 rounded-xl"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomOut}
          className="w-9 h-9 text-gray-700 hover:bg-gray-100 rounded-xl"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onResetView}
          className="w-9 h-9 text-gray-700 hover:bg-gray-100 rounded-xl"
          title="Reset Camera"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Floating Mini Progress Badge on Top-Right of Canvas */}
      <div className="absolute top-4 right-6 z-30 bg-white/90 backdrop-blur-md border border-gray-200/80 px-4 py-2 rounded-2xl shadow-lg flex items-center gap-3">
        <div className="relative w-8 h-8 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-gray-200"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-emerald-500"
              strokeDasharray={`${completionPercentage}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute text-[10px] font-extrabold text-gray-800">
            {Math.round(completionPercentage)}%
          </span>
        </div>

        <div>
          <div className="text-[11px] font-bold text-gray-900 leading-tight">
            Journey Progress
          </div>
          <div className="text-[10px] text-gray-500 font-medium">
            {completedNodesCount} of {totalNodesCount} completed
          </div>
        </div>
      </div>
    </>
  );
};
