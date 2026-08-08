'use client';

import React, { useState } from 'react';
import {
  Compass,
  Zap,
  Lightbulb,
  Award,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type MainCategory =
  | 'Role based Roadmaps'
  | 'Skill based Roadmaps'
  | 'Project ideas'
  | 'Best practices';

export interface CardItem {
  id: string;
  title: string;
  isNew?: boolean;
  category: MainCategory;
}

// 6 Color Themes matching the 6 cards in Image 2
const RADIAL_CARD_THEMES = [
  {
    // 1. Top Center Card: Sky Blue
    bg: 'bg-[#E0F2FE]',
    border: 'border-[#38BDF8]',
    text: 'text-[#0369A1]',
    corner: '#0284C7',
    ring: 'border-[#0284C7]'
  },
  {
    // 2. Top Left Card: Pastel Green
    bg: 'bg-[#DCFCE7]',
    border: 'border-[#4ADE80]',
    text: 'text-[#15803D]',
    corner: '#16A34A',
    ring: 'border-[#16A34A]'
  },
  {
    // 3. Top Right Card: Peach / Soft Orange
    bg: 'bg-[#FFEDD5]',
    border: 'border-[#FB923C]',
    text: 'text-[#C2410C]',
    corner: '#EA580C',
    ring: 'border-[#EA580C]'
  },
  {
    // 4. Bottom Left Card: Lavender / Light Purple
    bg: 'bg-[#F3E8FF]',
    border: 'border-[#C084FC]',
    text: 'text-[#7E22CE]',
    corner: '#9333EA',
    ring: 'border-[#9333EA]'
  },
  {
    // 5. Bottom Right Card: Soft Pink
    bg: 'bg-[#FCE7F3]',
    border: 'border-[#F472B6]',
    text: 'text-[#BE185D]',
    corner: '#E11D48',
    ring: 'border-[#E11D48]'
  },
  {
    // 6. Bottom Center Card: Warm Cream / Gold
    bg: 'bg-[#FEF3C7]',
    border: 'border-[#FBBF24]',
    text: 'text-[#B45309]',
    corner: '#D97706',
    ring: 'border-[#D97706]'
  }
];

export const MAIN_CATEGORIES: { id: MainCategory; label: string; icon: React.ElementType }[] = [
  { id: 'Role based Roadmaps', label: 'Role based Roadmaps', icon: Compass },
  { id: 'Skill based Roadmaps', label: 'Skill based Roadmaps', icon: Zap },
  { id: 'Project ideas', label: 'Project ideas', icon: Lightbulb },
  { id: 'Best practices', label: 'Best practices', icon: Award }
];

export const CATEGORY_ITEMS: Record<MainCategory, CardItem[]> = {
  'Role based Roadmaps': [
    { id: 'full-stack', title: 'Full Stack', category: 'Role based Roadmaps' },
    { id: 'android', title: 'Android', category: 'Role based Roadmaps' },
    { id: 'devops', title: 'DevOps', category: 'Role based Roadmaps' },
    { id: 'devsecops', title: 'DevSecOps', category: 'Role based Roadmaps' },
    { id: 'data-analyst', title: 'Data Analyst', category: 'Role based Roadmaps' },
    { id: 'ai-engineer', title: 'AI Engineer', category: 'Role based Roadmaps' },
    { id: 'ai-data-scientist', title: 'AI and Data Scientist', category: 'Role based Roadmaps' },
    { id: 'data-engineer', title: 'Data Engineer', category: 'Role based Roadmaps' },
    { id: 'machine-learning', title: 'Machine Learning', category: 'Role based Roadmaps' },
    { id: 'product-design', title: 'Product Design', isNew: true, category: 'Role based Roadmaps' },
    { id: 'postgresql', title: 'PostgreSQL', category: 'Role based Roadmaps' },
    { id: 'ios', title: 'iOS', category: 'Role based Roadmaps' }
  ],
  'Skill based Roadmaps': [
    { id: 'claude-code', title: 'Claude Code', category: 'Skill based Roadmaps' },
    { id: 'python-data-analysis', title: 'Python for Data Analysis', category: 'Skill based Roadmaps' },
    { id: 'vibe-coding', title: 'Vibe Coding', category: 'Skill based Roadmaps' },
    { id: 'power-bi', title: 'Power BI', isNew: true, category: 'Skill based Roadmaps' },
    { id: 'leetcode', title: 'LeetCode', category: 'Skill based Roadmaps' },
    { id: 'python', title: 'Python', category: 'Skill based Roadmaps' },
    { id: 'computer-science', title: 'Computer Science', category: 'Skill based Roadmaps' },
    { id: 'sql', title: 'SQL', category: 'Skill based Roadmaps' },
    { id: 'openclaw', title: 'OpenClaw', category: 'Skill based Roadmaps' },
    { id: 'react', title: 'React', category: 'Skill based Roadmaps' },
    { id: 'vue', title: 'Vue', category: 'Skill based Roadmaps' },
    { id: 'angular', title: 'Angular', category: 'Skill based Roadmaps' },
    { id: 'javascript', title: 'JavaScript', category: 'Skill based Roadmaps' },
    { id: 'typescript', title: 'TypeScript', category: 'Skill based Roadmaps' },
    { id: 'nodejs', title: 'Node.js', category: 'Skill based Roadmaps' },
    { id: 'system-design', title: 'System Design', category: 'Skill based Roadmaps' },
    { id: 'java', title: 'Java', category: 'Skill based Roadmaps' },
    { id: 'aspnet-core', title: 'ASP.NET Core', category: 'Skill based Roadmaps' },
    { id: 'api-design', title: 'API Design', category: 'Skill based Roadmaps' },
    { id: 'spring-boot', title: 'Spring Boot', category: 'Skill based Roadmaps' },
    { id: 'flutter', title: 'Flutter', category: 'Skill based Roadmaps' },
    { id: 'c-programming', title: 'C Programming', category: 'Skill based Roadmaps' },
    { id: 'cpp', title: 'C++', category: 'Skill based Roadmaps' },
    { id: 'rust', title: 'Rust', category: 'Skill based Roadmaps' }
  ],
  'Project ideas': [
    { id: 'frontend', title: 'Frontend', category: 'Project ideas' },
    { id: 'backend', title: 'Backend', category: 'Project ideas' },
    { id: 'devops-proj', title: 'DevOps', category: 'Project ideas' },
    { id: 'html', title: 'HTML', category: 'Project ideas' },
    { id: 'css', title: 'CSS', category: 'Project ideas' },
    { id: 'javascript-proj', title: 'JavaScript', category: 'Project ideas' },
    { id: 'nodejs-proj', title: 'Node.js', category: 'Project ideas' }
  ],
  'Best practices': [
    { id: 'code-review', title: 'Code Review', category: 'Best practices' },
    { id: 'web-vitals', title: 'Web Vitals', category: 'Best practices' },
    { id: 'api-security', title: 'API Security', category: 'Best practices' },
    { id: 'clean-code', title: 'Clean Code', category: 'Best practices' },
    { id: 'cicd-auto', title: 'CI/CD Automation', category: 'Best practices' },
    { id: 'db-tuning', title: 'Database Tuning', category: 'Best practices' }
  ]
};

export default function SerpentineRoadmapPage() {
  const [activeCategory, setActiveCategory] = useState<MainCategory>('Role based Roadmaps');
  const [pageIndex, setPageIndex] = useState<number>(0);

  const allCategoryItems = CATEGORY_ITEMS[activeCategory] || CATEGORY_ITEMS['Role based Roadmaps'];
  
  // Show 6 items per page arranged in the 6 radial positions
  const totalPages = Math.ceil(allCategoryItems.length / 6);
  const current6Items = allCategoryItems.slice(pageIndex * 6, (pageIndex + 1) * 6);

  const handleCategorySelect = (category: MainCategory) => {
    setActiveCategory(category);
    setPageIndex(0);
  };

  // Assign items to 6 specific radial positions
  const topCenterItem = current6Items[0];
  const topLeftItem = current6Items[1];
  const topRightItem = current6Items[2];
  const bottomLeftItem = current6Items[3];
  const bottomRightItem = current6Items[4];
  const bottomCenterItem = current6Items[5];

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 font-sans pb-32 pt-20 sm:pt-24 relative overflow-hidden">
      {/* Inject Google Fonts for Handwritten Script */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Caveat:wght@700&display=swap');
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Top Header Navigation Section (Stacked Vertical Layout) ────────────── */}
        <div className="flex flex-col items-start gap-6 pb-8 border-b border-slate-200/80">

          {/* Handwritten Reference Match Header */}
          <div className="relative space-y-2 max-w-3xl">
            {/* Soft Watercolor Teal Brushstroke Background Wash */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#27C5D8]/20 via-[#2C83F5]/10 to-transparent blur-2xl pointer-events-none -z-10 rounded-full" />

            <div className="relative z-10 flex flex-col items-start">
              {/* Top Row: "Clear Steps" (Teal cursive script) + "for a —" (slate sans-serif) */}
              <div className="flex items-baseline gap-3 flex-wrap">
                <span
                  className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#06B6D4] tracking-wide"
                  style={{ fontFamily: "'Dancing Script', 'Caveat', cursive" }}
                >
                  Clear Steps
                </span>
                <span className="text-slate-600 font-medium text-lg sm:text-2xl font-sans">
                  for a —
                </span>
              </div>

              {/* Bottom Row: "Structured Roadmap" (Deep Navy cursive script) with Curved Brush Underline */}
              <div className="relative inline-block pt-1 pb-3">
                <span
                  className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tight block"
                  style={{ fontFamily: "'Dancing Script', 'Caveat', cursive" }}
                >
                  Structured Roadmap
                </span>

                {/* Curved Teal Brush Stroke Underline */}
                <svg
                  className="absolute left-0 -bottom-1 w-full h-4 text-[#06B6D4] pointer-events-none"
                  viewBox="0 0 300 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M 5,12 C 80,18 220,18 295,8"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            <p className="text-sm font-semibold text-slate-500 leading-relaxed pt-1">
              Select a category below to explore single-topic roadmaps and specialized career learning tracks.
            </p>
          </div>

          {/* Category Selector Pills Positioned Directly UNDER the Heading */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {MAIN_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              const Icon = cat.icon;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#2962D6] via-[#2C83F5] to-[#27C5D8] text-white shadow-lg shadow-blue-500/25 scale-105'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-white' : 'text-[#2962D6]'} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* ── Direct Radial Concept Layout (Pure White Background) ────── */}
        <div className="relative w-full my-10 min-h-[750px] flex flex-col justify-between bg-white">

          {/* SVG Arrow Marker Definition */}
          <svg className="absolute w-0 h-0 pointer-events-none">
            <defs>
              <marker id="conceptArrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#1E293B" />
              </marker>
            </defs>
          </svg>

          {/* ── TOP SECTION: 1 Top Center Card ───────────────────────────── */}
          <div className="flex justify-center relative z-20">
            {topCenterItem && (
              <NotepadCard
                item={topCenterItem}
                theme={RADIAL_CARD_THEMES[0]}
              />
            )}
          </div>

          {/* ── MIDDLE SECTION: Top-Left Card, CENTER TITLE & ARROWS, Top-Right Card ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center my-4 relative z-20 max-w-6xl mx-auto w-full">

            {/* Left Card */}
            <div className="flex justify-center lg:justify-start">
              {topLeftItem && (
                <NotepadCard
                  item={topLeftItem}
                  theme={RADIAL_CARD_THEMES[1]}
                />
              )}
            </div>

            {/* DEAD CENTER SECTION: Heading placed IN THE MIDDLE between Top Arrows & Bottom Arrows */}
            <div className="flex flex-col items-center justify-center text-center px-4 py-2">
              
              {/* 1. TOP ARROWS Pointing Upward (↖  ↑  ↗) */}
              <div className="w-full flex items-center justify-center gap-6 mb-2 text-slate-800 pointer-events-none">
                <svg className="w-12 h-8" viewBox="0 0 50 30" fill="none">
                  <path d="M 45,25 C 30,25 15,15 5,5" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 4" markerEnd="url(#conceptArrow)" />
                </svg>
                <svg className="w-6 h-10" viewBox="0 0 20 40" fill="none">
                  <path d="M 10,35 L 10,5" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 4" markerEnd="url(#conceptArrow)" />
                </svg>
                <svg className="w-12 h-8" viewBox="0 0 50 30" fill="none">
                  <path d="M 5,25 C 20,25 35,15 45,5" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 4" markerEnd="url(#conceptArrow)" />
                </svg>
              </div>

              {/* 2. HEADING TITLE IN THE MIDDLE */}
              <motion.div
                key={activeCategory}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center justify-center gap-3 text-slate-900 my-1"
              >
                <span className="text-3xl text-slate-900 font-black">★</span>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-wider uppercase text-center font-sans text-slate-900 leading-tight">
                  {activeCategory}
                </h2>
                <span className="text-3xl text-slate-900 font-black">★</span>
              </motion.div>

              {/* 3. BOTTOM ARROWS Pointing Downward (↙  ↓  ↘) */}
              <div className="w-full flex items-center justify-center gap-6 mt-2 text-slate-800 pointer-events-none">
                <svg className="w-12 h-8" viewBox="0 0 50 30" fill="none">
                  <path d="M 45,5 C 30,5 15,15 5,25" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 4" markerEnd="url(#conceptArrow)" />
                </svg>
                <svg className="w-6 h-10" viewBox="0 0 20 40" fill="none">
                  <path d="M 10,5 L 10,35" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 4" markerEnd="url(#conceptArrow)" />
                </svg>
                <svg className="w-12 h-8" viewBox="0 0 50 30" fill="none">
                  <path d="M 5,5 C 20,5 35,15 45,25" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 4" markerEnd="url(#conceptArrow)" />
                </svg>
              </div>

            </div>

            {/* Right Card */}
            <div className="flex justify-center lg:justify-end">
              {topRightItem && (
                <NotepadCard
                  item={topRightItem}
                  theme={RADIAL_CARD_THEMES[2]}
                />
              )}
            </div>

          </div>

          {/* ── LOWER MIDDLE SECTION: Bottom-Left Card & Bottom-Right Card ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center my-4 relative z-20 max-w-5xl mx-auto w-full justify-between">

            {/* Bottom Left Card */}
            <div className="flex justify-center lg:justify-start">
              {bottomLeftItem && (
                <NotepadCard
                  item={bottomLeftItem}
                  theme={RADIAL_CARD_THEMES[3]}
                />
              )}
            </div>

            {/* Bottom Right Card */}
            <div className="flex justify-center lg:justify-end">
              {bottomRightItem && (
                <NotepadCard
                  item={bottomRightItem}
                  theme={RADIAL_CARD_THEMES[4]}
                />
              )}
            </div>

          </div>

          {/* ── BOTTOM SECTION: 1 Bottom Center Card ──────────────────────── */}
          <div className="flex justify-center relative z-20">
            {bottomCenterItem && (
              <NotepadCard
                item={bottomCenterItem}
                theme={RADIAL_CARD_THEMES[5]}
              />
            )}
          </div>

          {/* Pagination Controls if more than 6 items exist */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8 pt-4 border-t border-slate-300/40 relative z-30">
              <button
                type="button"
                onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
                disabled={pageIndex === 0}
                className="p-2 rounded-full bg-white border border-slate-300 text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>

              <span className="text-xs font-bold text-slate-600">
                Page {pageIndex + 1} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPageIndex((prev) => Math.min(totalPages - 1, prev + 1))}
                disabled={pageIndex === totalPages - 1}
                className="p-2 rounded-full bg-white border border-slate-300 text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

// ── Clean Spiral Notepad Card Component ──
function NotepadCard({
  item,
  theme
}: {
  item: CardItem;
  theme: typeof RADIAL_CARD_THEMES[0];
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -4, rotate: 0.5 }}
      className={`relative ${theme.bg} p-6 pl-10 rounded-3xl border-2 ${theme.border} shadow-lg hover:shadow-xl transition-all cursor-pointer overflow-hidden flex flex-col justify-center w-full max-w-xs sm:max-w-sm min-h-[130px] group`}
    >
      {/* 1. Spiral Binder Wire Rings C C C C on the Left Border */}
      <div className="absolute -left-3.5 top-4 bottom-4 flex flex-col justify-between pointer-events-none z-20">
        {[1, 2, 3, 4, 5].map((ringIdx) => (
          <div
            key={ringIdx}
            className={`w-4 h-4 rounded-full border-2 ${theme.ring} bg-white shadow-sm flex items-center justify-center`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          </div>
        ))}
      </div>

      {/* 2. 3-Petal Cloud/Flower Corner Accent Shape on Top-Right Corner */}
      <svg className="absolute top-0 right-0 w-11 h-11 pointer-events-none z-10" viewBox="0 0 40 40">
        <path
          d="M 40,0 L 40,32 C 35,32 32,27 32,22 C 32,17 25,17 20,22 C 15,27 10,22 10,17 C 10,7 22,0 40,0 Z"
          fill={theme.corner}
        />
      </svg>

      {/* Card Header Content */}
      <div className="flex items-center gap-2 flex-wrap pr-6 z-10">
        <h3 className={`font-black text-base sm:text-lg ${theme.text} tracking-tight leading-snug font-sans uppercase`}>
          {item.title}
        </h3>

        {item.isNew && (
          <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span>New</span>
          </span>
        )}
      </div>
    </motion.div>
  );
}
