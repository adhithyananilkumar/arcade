"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Feather,
  BarChart2,
  Rocket as RocketIcon,
  LucideIcon
} from "lucide-react";

export type HybridCardTheme =
  | "rocket-yellow"
  | "laptop-code"
  | "lightbulb-purple"
  | "browser-blue"
  | "database-violet"
  | "smartphone-teal";

export interface TaskItem {
  id: string;
  label: string;
  completed?: boolean;
}

export interface HybridTaskProjectCardProps {
  id: string;
  title: string;
  difficulty: "beginner" | "intermediate" | "advanced" | string;
  theme?: HybridCardTheme;
  tasks?: TaskItem[];
  onClick?: () => void;
  onViewDetails?: () => void;
}

// ----------------------------------------------------
// HEADER ILLUSTRATION BANNER WITH DIFFICULTY BADGE
// ----------------------------------------------------
function CardHeaderBanner({
  theme = "rocket-yellow",
  difficulty = "beginner",
}: {
  theme?: HybridCardTheme;
  difficulty?: string;
}) {
  // Difficulty Badge Pill Styling & Icon
  const diffBadgeConfig =
    difficulty === "beginner"
      ? { label: "Beginner", bg: "bg-amber-100/90 text-amber-900", Icon: Feather }
      : difficulty === "intermediate"
      ? { label: "Intermediate", bg: "bg-amber-100/90 text-amber-900", Icon: BarChart2 }
      : { label: "Advanced", bg: "bg-indigo-100/90 text-indigo-950", Icon: RocketIcon };

  const DiffIcon = diffBadgeConfig.Icon;

  // Header Background Gradient
  const headerBgGradient =
    theme === "rocket-yellow"
      ? "bg-gradient-to-br from-[#F59E0B] via-[#FBBF24] to-[#FACC15]"
      : theme === "laptop-code"
      ? "bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155]"
      : theme === "lightbulb-purple"
      ? "bg-gradient-to-br from-[#4F46E5] via-[#6366F1] to-[#8B5CF6]"
      : theme === "browser-blue"
      ? "bg-gradient-to-br from-[#1E40AF] via-[#1D4ED8] to-[#2563EB]"
      : theme === "database-violet"
      ? "bg-gradient-to-br from-[#4C1D95] via-[#581C87] to-[#7E22CE]"
      : "bg-gradient-to-br from-[#047857] via-[#0D9488] to-[#0F766E]"; // smartphone-teal

  return (
    <div className={`relative w-full h-[115px] ${headerBgGradient} rounded-t-[26px] overflow-hidden`}>
      {/* Top Right Difficulty Badge Pill */}
      <div className="absolute top-3 right-3.5 z-20">
        <span
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-extrabold shadow-sm ${diffBadgeConfig.bg}`}
        >
          <DiffIcon className="w-3.5 h-3.5" />
          {diffBadgeConfig.label}
        </span>
      </div>

      {/* --- 3D GRAPHIC ILLUSTRATIONS IN CENTER/HEADER --- */}

      {/* 1. 3D Rocket (Card 1: Single-Page CV) */}
      {theme === "rocket-yellow" && (
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-16 h-18 pointer-events-none z-10">
          <motion.div
            initial={{ y: 2 }}
            animate={{ y: [-1, 2, -1] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-full h-full"
          >
            <svg viewBox="0 0 70 80" className="w-full h-full drop-shadow-xl">
              <polygon points="35,55 28,75 35,68 42,75" fill="#FFFFFF" />
              <path d="M 35 5 Q 46 20 46 36 L 24 36 Q 24 20 35 5 Z" fill="#EF4444" />
              <rect x="24" y="34" width="22" height="26" rx="3" fill="#FFFFFF" />
              <path d="M 24 45 L 12 60 L 24 57 Z" fill="#DC2626" />
              <path d="M 46 45 L 58 60 L 46 57 Z" fill="#DC2626" />
              <circle cx="35" cy="42" r="5.5" fill="#0284C7" stroke="#E2E8F0" strokeWidth="1.5" />
            </svg>
          </motion.div>
        </div>
      )}

      {/* 2. 3D Laptop with </> (Card 2: Basic HTML Website) */}
      {theme === "laptop-code" && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-16 pointer-events-none z-10">
          <svg viewBox="0 0 90 70" className="w-full h-full drop-shadow-xl">
            {/* Screen Frame */}
            <rect x="18" y="8" width="54" height="38" rx="5" fill="#6366F1" stroke="#818CF8" strokeWidth="2" />
            {/* Screen Inner Display */}
            <rect x="22" y="12" width="46" height="30" rx="3" fill="#4338CA" />
            {/* Code Symbol </> */}
            <text x="31" y="32" fill="#EEF2FF" fontSize="15" fontFamily="monospace" fontWeight="bold">
              &lt;/&gt;
            </text>
            {/* Laptop Base */}
            <path d="M 10 46 L 80 46 L 74 52 L 16 52 Z" fill="#94A3B8" />
            <rect x="36" y="47" width="18" height="3" rx="1" fill="#64748B" />
          </svg>
        </div>
      )}

      {/* 3. Glowing 3D Lightbulb (Card 3: Personal Portfolio) */}
      {theme === "lightbulb-purple" && (
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-16 h-18 pointer-events-none z-10">
          <motion.div
            initial={{ scale: 0.98 }}
            animate={{ scale: [0.98, 1.04, 0.98] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="w-full h-full"
          >
            <svg viewBox="0 0 70 80" className="w-full h-full drop-shadow-2xl">
              {/* Glow Aura */}
              <circle cx="35" cy="30" r="25" fill="#FDE047" opacity="0.35" />
              {/* Glass Bulb */}
              <path d="M 35 10 C 48 10 54 26 44 38 L 44 48 L 26 48 L 26 38 C 16 26 22 10 35 10 Z" fill="#FACC15" />
              <ellipse cx="28" cy="22" rx="4" ry="8" fill="#FFFFFF" opacity="0.6" transform="rotate(-20 28 22)" />
              {/* Screw Base */}
              <rect x="27" y="48" width="16" height="4" fill="#94A3B8" />
              <rect x="29" y="52" width="12" height="4" fill="#64748B" />
              <rect x="31" y="56" width="8" height="3" fill="#475569" />
            </svg>
          </motion.div>
        </div>
      )}

      {/* 4. 3D Browser Window (Card 4: Task Manager App) */}
      {theme === "browser-blue" && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-16 pointer-events-none z-10">
          <svg viewBox="0 0 90 70" className="w-full h-full drop-shadow-xl">
            {/* Window Frame */}
            <rect x="15" y="10" width="60" height="42" rx="6" fill="#93C5FD" stroke="#BFDBFE" strokeWidth="2" />
            {/* Top Bar */}
            <rect x="15" y="10" width="60" height="12" rx="6" fill="#60A5FA" />
            <circle cx="23" cy="16" r="2" fill="#EF4444" />
            <circle cx="29" cy="16" r="2" fill="#F59E0B" />
            <circle cx="35" cy="16" r="2" fill="#10B981" />
            {/* Content Wireframe */}
            <rect x="22" y="27" width="22" height="18" rx="2" fill="#3B82F6" opacity="0.7" />
            <line x1="50" y1="28" x2="68" y2="28" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
            <line x1="50" y1="35" x2="65" y2="35" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* 5. 3D Database Cylinder Stack (Card 5: Weather Dashboard) */}
      {theme === "database-violet" && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-18 pointer-events-none z-10">
          <svg viewBox="0 0 70 80" className="w-full h-full drop-shadow-xl">
            {/* Top Disk */}
            <ellipse cx="35" cy="18" rx="20" ry="8" fill="#A855F7" />
            <path d="M 15 18 L 15 28 C 15 32 55 32 55 28 L 55 18 Z" fill="#8B5CF6" />
            <ellipse cx="35" cy="18" rx="20" ry="8" fill="#C084FC" />
            <circle cx="45" cy="22" r="2" fill="#4ADE80" />

            {/* Middle Disk */}
            <path d="M 15 32 L 15 42 C 15 46 55 46 55 42 L 55 32 Z" fill="#7C3AED" />
            <ellipse cx="35" cy="32" rx="20" ry="8" fill="#A855F7" />
            <circle cx="45" cy="36" r="2" fill="#4ADE80" />

            {/* Bottom Disk */}
            <path d="M 15 46 L 15 56 C 15 60 55 60 55 56 L 55 46 Z" fill="#6D28D9" />
            <ellipse cx="35" cy="46" rx="20" ry="8" fill="#8B5CF6" />
            <circle cx="45" cy="50" r="2" fill="#4ADE80" />
          </svg>
        </div>
      )}

      {/* 6. 3D Smartphone Mobile Layout (Card 6: Blog Website) */}
      {theme === "smartphone-teal" && (
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-14 h-18 pointer-events-none z-10">
          <svg viewBox="0 0 60 80" className="w-full h-full drop-shadow-xl">
            <rect x="14" y="6" width="32" height="58" rx="7" fill="#38BDF8" stroke="#7DD3FC" strokeWidth="2" />
            <rect x="18" y="10" width="24" height="50" rx="4" fill="#0284C7" />
            {/* Screen Details */}
            <line x1="22" y1="18" x2="38" y2="18" stroke="#E0F2FE" strokeWidth="3" strokeLinecap="round" />
            <line x1="22" y1="26" x2="34" y2="26" stroke="#BAE6FD" strokeWidth="2" strokeLinecap="round" />
            <rect x="22" y="32" width="16" height="12" rx="2" fill="#38BDF8" />
          </svg>
        </div>
      )}

      {/* Layered Pure White Vector Clouds */}
      <div className="absolute bottom-0 inset-x-0 h-12 pointer-events-none">
        <svg viewBox="0 0 350 50" className="w-full h-full preserve-3d" preserveAspectRatio="none">
          <path
            d="M -10 50 Q 20 25 65 30 Q 110 10 155 25 Q 200 8 245 23 Q 290 12 330 26 Q 350 20 360 50 Z"
            fill="#E2E8F0"
            opacity="0.6"
          />
          <path
            d="M -10 50 Q 15 28 55 32 Q 95 14 140 26 Q 180 10 225 24 Q 270 16 320 24 Q 345 18 360 50 Z"
            fill="#FFFFFF"
          />
        </svg>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// HYBRID TASK PROJECT CARD COMPONENT
// ----------------------------------------------------
export function HybridTaskProjectCard({
  title,
  difficulty = "beginner",
  theme = "rocket-yellow",
  tasks: initialTasks = [
    { id: "t1", label: "Complete the development", completed: false },
    { id: "t2", label: "Conduct testing and fix", completed: false },
    { id: "t3", label: "Discuss new ideas for improving", completed: true },
    { id: "t4", label: "Prepare a report on the work c...", completed: false },
  ],
  onClick,
  onViewDetails,
}: HybridTaskProjectCardProps) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);

  const toggleTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className="bg-white rounded-[26px] border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer w-full select-none"
    >
      {/* Top Header Graphic Banner with Difficulty Pill */}
      <CardHeaderBanner theme={theme} difficulty={difficulty} />

      {/* Main Content Area: Title & Tasks Checklist */}
      <div className="p-5 pt-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Project Title */}
          <h3 className="text-base font-extrabold text-slate-800 tracking-tight leading-snug mb-3 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>

          {/* Tasks Checklist */}
          <div className="flex flex-col gap-2.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={(e) => toggleTask(task.id, e)}
                className="flex items-center gap-3 cursor-pointer group/item py-0.5"
              >
                {/* Checkbox */}
                {task.completed ? (
                  <div className="w-4.5 h-4.5 rounded-[5px] shrink-0 bg-black text-white flex items-center justify-center transition-all">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-4.5 h-4.5 rounded-[5px] shrink-0 border-2 border-slate-200 bg-white group-hover/item:border-slate-400 transition-all" />
                )}

                {/* Task Label */}
                <span
                  className={`text-[11.5px] font-medium leading-tight transition-colors line-clamp-1 ${
                    task.completed
                      ? "text-slate-400 line-through"
                      : "text-slate-600 group-hover/item:text-slate-900"
                  }`}
                >
                  {task.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Yellow Footer Bar (Exact match to screenshot!) */}
      <div className="bg-[#FACC15] px-5 py-2.5 flex items-center justify-between text-slate-900 border-t border-yellow-400/40">
        {/* Left: View Details */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.();
          }}
          className="text-xs font-black text-slate-900 hover:text-black transition-colors cursor-pointer"
        >
          View Details
        </button>

        {/* Right: Chevron Arrow Controls */}
        <div className="flex items-center gap-2">
          <ChevronLeft className="w-4 h-4 text-slate-900 hover:scale-125 transition-transform cursor-pointer font-extrabold" />
          <ChevronRight className="w-4 h-4 text-slate-900 hover:scale-125 transition-transform cursor-pointer font-extrabold" />
        </div>
      </div>
    </motion.div>
  );
}
