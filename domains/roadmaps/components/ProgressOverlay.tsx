"use client";

import React from "react";
import { CheckCircle2, Award, Sparkles } from "lucide-react";

export interface ProgressOverlayProps {
  totalNodes: number;
  completedNodes: number;
  roadmapTitle?: string;
}

export function ProgressOverlay({
  totalNodes,
  completedNodes,
  roadmapTitle,
}: ProgressOverlayProps) {
  const percentage = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

  return (
    <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md border border-gray-200/80 rounded-2xl p-4 shadow-lg max-w-xs w-full">
      {roadmapTitle && (
        <h3 className="font-bold text-gray-900 text-sm truncate mb-1">{roadmapTitle}</h3>
      )}
      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
        <span className="flex items-center gap-1.5 font-medium">
          <CheckCircle2 size={14} className="text-emerald-500" />
          Progress
        </span>
        <span className="font-bold text-gray-900">
          {completedNodes} / {totalNodes} ({percentage}%)
        </span>
      </div>

      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
        <div
          className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {percentage === 100 && totalNodes > 0 && (
        <div className="mt-2.5 pt-2 border-t border-emerald-100 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
          <Award size={14} className="text-emerald-600" />
          <span>Roadmap Completed!</span>
          <Sparkles size={12} className="text-amber-500 ml-auto animate-pulse" />
        </div>
      )}
    </div>
  );
}
