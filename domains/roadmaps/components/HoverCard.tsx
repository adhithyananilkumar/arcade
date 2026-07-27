"use client";

import React from "react";
import { BookOpen, CheckCircle, Clock, ExternalLink } from "lucide-react";

export interface HoverCardProps {
  label: string;
  description?: string;
  duration?: string;
  difficulty?: string;
  isCompleted?: boolean;
  resourceUrl?: string;
  onOpenResource?: () => void;
  onToggleComplete?: () => void;
}

export function HoverCard({
  label,
  description,
  duration,
  difficulty,
  isCompleted,
  resourceUrl,
  onOpenResource,
  onToggleComplete,
}: HoverCardProps) {
  return (
    <div className="w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-4 animate-in fade-in duration-150 z-50">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-bold text-gray-900 text-base leading-snug">{label}</h4>
        {isCompleted && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 shrink-0">
            <CheckCircle size={12} />
            Completed
          </span>
        )}
      </div>

      {description && (
        <p className="text-xs text-gray-600 mb-3 leading-relaxed line-clamp-3">
          {description}
        </p>
      )}

      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
        {duration && (
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {duration}
          </span>
        )}
        {difficulty && (
          <span className="capitalize font-medium px-2 py-0.5 bg-gray-100 rounded text-gray-700">
            {difficulty}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
        {onToggleComplete && (
          <button
            onClick={onToggleComplete}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
              isCompleted
                ? "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
                : "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {isCompleted ? "Mark Incomplete" : "Mark Complete"}
          </button>
        )}

        {(resourceUrl || onOpenResource) && (
          <button
            onClick={onOpenResource}
            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors ml-auto"
          >
            <BookOpen size={12} />
            Open Resource
            <ExternalLink size={10} />
          </button>
        )}
      </div>
    </div>
  );
}
