"use client";

import React from "react";
import { motion } from "framer-motion";
import { Flame, ArrowRight, LucideIcon } from "lucide-react";

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
  onJoin?: () => void;
  onShare?: () => void;
}

export function ColorThemeProjectCard({
  title,
  description,
  difficulty = "beginner",
  category = "HTML",
  membersCount = "3 members",
  timeAgo = "Edited 2h ago",
  colorTheme = "yellow",
  icon: Icon = Flame,
  onJoin,
  onShare,
}: ColorThemeProjectCardProps) {
  // Compact Soft Light Pastel Color Theme Configurations
  const themeConfig = {
    yellow: {
      cardBg: "bg-[#FEF9C3]/90 border border-amber-200/90 text-amber-950 shadow-2xs hover:shadow-sm",
      iconBg: "bg-amber-100/90 text-amber-800",
      avatarBorder: "border-amber-200/60",
      mutedText: "text-amber-900/80",
      primaryBtn: "bg-amber-900 hover:bg-amber-950 text-amber-50 font-black shadow-2xs",
      secondaryBtn: "bg-white/90 border border-amber-200/80 text-amber-900 hover:bg-white font-bold",
    },
    white: {
      cardBg: "bg-white border border-slate-200/90 text-slate-900 shadow-2xs hover:shadow-sm",
      iconBg: "bg-slate-100 text-slate-800",
      avatarBorder: "border-slate-200/60",
      mutedText: "text-slate-500",
      primaryBtn: "bg-slate-900 hover:bg-black text-white font-black shadow-2xs",
      secondaryBtn: "bg-slate-100/80 border border-slate-200/60 text-slate-700 hover:bg-slate-100 font-bold",
    },
    green: {
      cardBg: "bg-[#DCFCE7]/90 border border-emerald-200/90 text-emerald-950 shadow-2xs hover:shadow-sm",
      iconBg: "bg-emerald-100/90 text-emerald-800",
      avatarBorder: "border-emerald-200/60",
      mutedText: "text-emerald-900/80",
      primaryBtn: "bg-emerald-800 hover:bg-emerald-900 text-emerald-50 font-black shadow-2xs",
      secondaryBtn: "bg-white/90 border border-emerald-200/80 text-emerald-900 hover:bg-white font-bold",
    },
    blue: {
      cardBg: "bg-[#E0F2FE]/90 border border-sky-200/90 text-sky-950 shadow-2xs hover:shadow-sm",
      iconBg: "bg-sky-100/90 text-sky-800",
      avatarBorder: "border-sky-200/60",
      mutedText: "text-sky-900/80",
      primaryBtn: "bg-sky-800 hover:bg-sky-900 text-sky-50 font-black shadow-2xs",
      secondaryBtn: "bg-white/90 border border-sky-200/80 text-sky-900 hover:bg-white font-bold",
    },
    purple: {
      cardBg: "bg-[#F3E8FF]/90 border border-purple-200/90 text-purple-950 shadow-2xs hover:shadow-sm",
      iconBg: "bg-purple-100/90 text-purple-800",
      avatarBorder: "border-purple-200/60",
      mutedText: "text-purple-900/80",
      primaryBtn: "bg-purple-800 hover:bg-purple-900 text-purple-50 font-black shadow-2xs",
      secondaryBtn: "bg-white/90 border border-purple-200/80 text-purple-900 hover:bg-white font-bold",
    },
    rose: {
      cardBg: "bg-[#FFE4E6]/90 border border-rose-200/90 text-rose-950 shadow-2xs hover:shadow-sm",
      iconBg: "bg-rose-100/90 text-rose-800",
      avatarBorder: "border-rose-200/60",
      mutedText: "text-rose-900/80",
      primaryBtn: "bg-rose-800 hover:bg-rose-900 text-rose-50 font-black shadow-2xs",
      secondaryBtn: "bg-white/90 border border-rose-200/80 text-rose-900 hover:bg-white font-bold",
    },
  }[colorTheme];

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`rounded-[22px] p-4 transition-all duration-200 flex flex-col justify-between select-none w-full min-h-[195px] ${themeConfig.cardBg}`}
    >
      {/* Top Row: Difficulty & Tech Tag Badges + Icon */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {difficulty && (
            <span className="bg-[#DCFCE7] text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider border border-emerald-300/60">
              {difficulty}
            </span>
          )}
          {category && (
            <span className="bg-[#DCFCE7] text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider border border-emerald-300/60">
              {category}
            </span>
          )}
        </div>

        <div className={`w-7 h-7 rounded-full ${themeConfig.iconBg} flex items-center justify-center shadow-2xs shrink-0`}>
          <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-extrabold tracking-tight mt-2.5 leading-snug">
        {title}
      </h3>

      {/* Avatars & Members Metadata Row */}
      <div className="flex items-center justify-between mt-2 text-[10.5px] font-extrabold">
        <div className="flex items-center gap-1.5">
          {/* 3 Overlapping Avatar Circles */}
          <div className="flex -space-x-1.5 overflow-hidden">
            <img
              className={`inline-block h-4.5 w-4.5 rounded-full ring-2 ${themeConfig.avatarBorder}`}
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="User"
            />
            <img
              className={`inline-block h-4.5 w-4.5 rounded-full ring-2 ${themeConfig.avatarBorder}`}
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
              alt="User"
            />
            <img
              className={`inline-block h-4.5 w-4.5 rounded-full ring-2 ${themeConfig.avatarBorder}`}
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
              alt="User"
            />
          </div>
          <span>{membersCount}</span>
        </div>

        {/* Edited / Time info */}
        <span className={themeConfig.mutedText}>{timeAgo}</span>
      </div>

      {/* Description Body Paragraph */}
      <p className={`text-[11px] leading-relaxed font-normal my-2 line-clamp-2 ${themeConfig.mutedText}`}>
        {description}
      </p>

      {/* Bottom Action Button: View Project */}
      <div className="pt-1 mt-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onJoin?.();
          }}
          className={`w-full py-1.5 px-4 rounded-full text-[11px] font-black text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${themeConfig.primaryBtn}`}
        >
          <span>View Project</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>
    </motion.div>
  );
}
