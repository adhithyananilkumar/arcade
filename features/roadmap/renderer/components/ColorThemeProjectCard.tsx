"use client";

import React from "react";
import { motion } from "framer-motion";
import { Flame, ArrowRight, Clock, Layers, LucideIcon } from "lucide-react";

export type CardColorTheme = "yellow" | "white" | "green" | "blue" | "purple" | "rose";

export interface ColorThemeProjectCardProps {
  id: string;
  title: string;
  description: string;
  difficulty?: string;
  category?: string;
  membersCount?: string;
  timeAgo?: string;
  colorTheme?: CardColorTheme;
  icon?: LucideIcon;
  techStack?: string[];
  taskCount?: number;
  onJoin?: () => void;
  onShare?: () => void;
}

export function ColorThemeProjectCard({
  title,
  description,
  difficulty = "beginner",
  category = "HTML",
  membersCount = "12,300 Learners",
  timeAgo = "Est. 2-3 Hours",
  icon: Icon = Flame,
  techStack = ["HTML5", "CSS3", "JavaScript"],
  taskCount = 4,
  onJoin,
}: ColorThemeProjectCardProps) {
  const isBeginner = difficulty.toLowerCase() === "beginner";
  const isIntermediate = difficulty.toLowerCase() === "intermediate";

  // Visual header gradient and theme styling matching each difficulty tier
  const bannerConfig = isBeginner
    ? {
        bannerBg: "from-emerald-500/18 via-teal-500/10 to-emerald-500/5",
        accentHex: "#10b981",
        glowBg: "bg-emerald-500/15",
        iconColor: "text-emerald-600",
        textColor: "text-emerald-600",
        hoverBorder: "group-hover:border-emerald-400",
        hoverShadow: "group-hover:shadow-[0_16px_32px_-12px_rgba(16,185,129,0.2)]",
        titleHover: "group-hover:text-emerald-700",
        btnHover: "group-hover:bg-emerald-600",
      }
    : isIntermediate
    ? {
        bannerBg: "from-amber-500/18 via-orange-500/10 to-amber-500/5",
        accentHex: "#f59e0b",
        glowBg: "bg-amber-500/15",
        iconColor: "text-amber-600",
        textColor: "text-amber-600",
        hoverBorder: "group-hover:border-amber-400",
        hoverShadow: "group-hover:shadow-[0_16px_32px_-12px_rgba(245,158,11,0.2)]",
        titleHover: "group-hover:text-amber-700",
        btnHover: "group-hover:bg-amber-600",
      }
    : {
        bannerBg: "from-indigo-500/18 via-purple-500/10 to-indigo-500/5",
        accentHex: "#8b5cf6",
        glowBg: "bg-purple-500/15",
        iconColor: "text-purple-600",
        textColor: "text-purple-600",
        hoverBorder: "group-hover:border-purple-400",
        hoverShadow: "group-hover:shadow-[0_16px_32px_-12px_rgba(139,92,246,0.2)]",
        titleHover: "group-hover:text-purple-700",
        btnHover: "group-hover:bg-purple-600",
      };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 400, damping: 26 }}
      style={{
        clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 0 100%)",
      }}
      className={`bg-white rounded-tl-[24px] rounded-b-[24px] border border-slate-200/90 shadow-xs transition-all duration-300 flex flex-col justify-between select-none w-full h-full min-h-[300px] group cursor-pointer relative ${bannerConfig.hoverBorder} ${bannerConfig.hoverShadow}`}
    >
      {/* Natural Curved Page Flip at Top-Right */}
      <div className="absolute top-0 right-0 w-[24px] h-[24px] z-30 pointer-events-none transition-transform duration-300 group-hover:scale-110 origin-top-right">
        <svg viewBox="0 0 24 24" className="w-full h-full" style={{ filter: "drop-shadow(-2px 2px 2.5px rgba(0,0,0,0.14))" }}>
          <path
            d="M 0 0 C 4 12, 12 20, 24 24 L 0 24 Z"
            fill="url(#natural-page-curl-grad)"
            stroke="#94a3b8"
            strokeWidth="0.5"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="natural-page-curl-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Decorative Wavy Sculpted Banner Header */}
      <div className={`relative w-full h-[75px] bg-gradient-to-br ${bannerConfig.bannerBg} p-3 pb-0 flex flex-col justify-between overflow-hidden`}>
        {/* Ambient radial blur glow behind icon */}
        <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full ${bannerConfig.glowBg} blur-lg pointer-events-none`} />

        {/* Top Header Row with Category & Milestone Counter */}
        <div className="flex items-center justify-between z-10 relative pr-1">
          <span className="text-[9px] font-mono font-bold text-slate-700 tracking-wider uppercase bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-slate-200/70 shadow-2xs">
            {category}
          </span>

          <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-slate-200/70 text-[9.5px] font-bold text-slate-600 shadow-2xs">
            <Layers className="w-2.5 h-2.5 text-slate-400" />
            <span>{taskCount} Milestones</span>
          </div>
        </div>

        {/* Sculpted Bottom Curved Wave Cutout */}
        <div className="absolute -bottom-[1px] inset-x-0 h-4 pointer-events-none">
          <svg viewBox="0 0 400 20" className="w-full h-full preserve-3d" preserveAspectRatio="none">
            <path
              d="M 0 20 C 120 20, 180 0, 260 0 C 330 0, 370 20, 400 20 L 400 20 L 0 20 Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>
      </div>

      {/* Unboxed Floating Icon & Clean Difficulty Label Row */}
      <div className="px-3.5 -mt-3.5 z-20 flex items-center justify-between relative">
        <div className="flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
          <Icon className={`w-5 h-5 stroke-[2.2] ${bannerConfig.iconColor}`} />
        </div>

        <span className={`text-[10px] font-black uppercase tracking-wider ${bannerConfig.textColor}`}>
          {difficulty}
        </span>
      </div>

      {/* Main Body Section (Compact Structured Uniform Heights) */}
      <div className="p-3.5 pt-1.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Project Title */}
          <h3 className={`text-[13.5px] font-extrabold text-slate-900 tracking-tight leading-snug min-h-[36px] line-clamp-2 transition-colors ${bannerConfig.titleHover}`}>
            {title}
          </h3>

          {/* Project Description */}
          <p className="text-[11px] text-slate-500 font-normal leading-relaxed mt-0.5 h-[32px] line-clamp-2">
            {description}
          </p>

          {/* Tech Stack Micro-Pills */}
          <div className="h-[22px] flex items-center gap-1 mt-1.5 overflow-hidden">
            {techStack && techStack.slice(0, 3).map((tech, i) => (
              <span
                key={i}
                className="bg-slate-50 text-slate-600 text-[9px] font-mono font-medium px-1.5 py-0.2 rounded-sm border border-slate-200/70 shrink-0"
              >
                {tech}
              </span>
            ))}
            {techStack && techStack.length > 3 && (
              <span className="text-[9px] font-mono text-slate-400 shrink-0">
                +{techStack.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Footer Meta & Action Button (Without Divider Line) */}
        <div className="mt-2.5 pt-1 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[10px] font-medium text-slate-500">
            {/* Overlapping Avatars & Count */}
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-1 overflow-hidden">
                <img
                  className="inline-block h-4 w-4 rounded-full ring-1.5 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="User"
                />
                <img
                  className="inline-block h-4 w-4 rounded-full ring-1.5 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="User"
                />
                <img
                  className="inline-block h-4 w-4 rounded-full ring-1.5 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                  alt="User"
                />
              </div>
              <span className="text-slate-600 font-semibold truncate">{membersCount}</span>
            </div>

            {/* Time Estimate */}
            <div className="flex items-center gap-1 text-slate-400 shrink-0">
              <Clock className="w-2.5 h-2.5" />
              <span>{timeAgo}</span>
            </div>
          </div>

          {/* Lengthy Interactive Button */}
          <div className="flex items-center justify-end">
            <div
              onClick={(e) => {
                e.stopPropagation();
                onJoin?.();
              }}
              className={`min-w-[140px] py-1.5 px-5 rounded-xl bg-slate-900 text-white font-bold text-[11px] inline-flex items-center justify-between gap-2 transition-all duration-300 shadow-xs hover:shadow-sm cursor-pointer ${bannerConfig.btnHover}`}
            >
              <span>Start Project</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
