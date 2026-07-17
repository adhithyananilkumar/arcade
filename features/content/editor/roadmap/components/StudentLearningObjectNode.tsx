import React from "react";
import { Handle, Position } from "@xyflow/react";
import { BookOpen, Video, PenTool, CheckCircle, Lock, PlayCircle, Clock } from "lucide-react";
import type { NodeProgressData } from "../types";

const ICONS: Record<string, React.ReactNode> = {
  article: <BookOpen size={16} />,
  video: <Video size={16} />,
  quiz: <PenTool size={16} />,
  exercise: <PenTool size={16} />,
  unknown: <BookOpen size={16} />,
};

const COLORS: Record<string, string> = {
  article: "bg-blue-50 text-blue-700 border-blue-200",
  video: "bg-purple-50 text-purple-700 border-purple-200",
  quiz: "bg-orange-50 text-orange-700 border-orange-200",
  exercise: "bg-emerald-50 text-emerald-700 border-emerald-200",
  unknown: "bg-gray-50 text-gray-700 border-gray-200",
};

export function StudentLearningObjectNode({ data, id }: any) {
  const type = data.type || "unknown";
  const icon = ICONS[type] || ICONS.unknown;
  const colorClass = COLORS[type] || COLORS.unknown;
  
  const progress: NodeProgressData | undefined = data.progress;
  const isLocked = data.isLocked;
  const status = progress?.status || "NOT_STARTED";
  
  const formatTime = (seconds?: number) => {
    if (!seconds) return "0s";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <div
      className={`group relative min-w-[220px] rounded-xl border bg-white p-3 shadow-sm transition-all
        ${isLocked ? "opacity-60 cursor-not-allowed grayscale" : "cursor-pointer hover:shadow-md hover:border-indigo-300"}
        ${status === "COMPLETED" ? "ring-2 ring-emerald-500 border-emerald-500" : ""}
        ${status === "IN_PROGRESS" ? "ring-2 ring-indigo-400 border-indigo-400" : ""}
      `}
      onClick={() => {
        if (!isLocked && data.onClick) {
          data.onClick(id, data);
        }
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="h-3 w-3 border-2 border-white bg-indigo-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="h-3 w-3 border-2 border-white bg-indigo-500"
      />

      {/* Status Badges */}
      <div className="absolute -top-3 -right-3 z-10">
        {isLocked ? (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 border border-gray-300 text-gray-500 shadow-sm" title="Locked">
            <Lock size={12} />
          </div>
        ) : status === "COMPLETED" ? (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 border border-emerald-500 text-emerald-600 shadow-sm" title="Completed">
            <CheckCircle size={14} />
          </div>
        ) : status === "IN_PROGRESS" ? (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 border border-indigo-500 text-indigo-600 shadow-sm" title="In Progress">
            <PlayCircle size={14} />
          </div>
        ) : null}
      </div>

      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${colorClass}`}>
          {icon}
        </div>
        <div className="flex-1 overflow-hidden">
          <h3 className="truncate text-sm font-bold text-gray-900" title={data.title}>
            {data.title || "Untitled Node"}
          </h3>
          <p className="mt-0.5 truncate text-xs text-gray-500" title={data.description}>
            {data.description || "No description provided."}
          </p>
        </div>
      </div>
      
      {/* Progress Meta */}
      {status !== "NOT_STARTED" && (
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2 text-[10px] font-medium text-gray-500">
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {formatTime(progress?.timeSpentSeconds)}
          </span>
          <span className={status === "COMPLETED" ? "text-emerald-600" : "text-indigo-600"}>
            {status.replace('_', ' ')}
          </span>
        </div>
      )}
    </div>
  );
}
