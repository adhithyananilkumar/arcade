'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import BorderBeam from '@/components/ui/border-beam';
import {
  Compass,
  Zap,
  Lightbulb,
  Award,
  Search,
  ChevronLeft,
  ChevronRight,
  Layers,
  Smartphone,
  Cloud,
  ShieldCheck,
  BarChart3,
  Cpu,
  Brain,
  Database,
  Network,
  Palette,
  Bot,
  LineChart,
  PieChart,
  Code2,
  Terminal,
  Binary,
  Atom,
  LayoutGrid,
  Shield,
  FileCode,
  FileCode2,
  Server,
  Coffee,
  Globe,
  Webhook,
  CheckCircle2,
  Activity,
  Lock,
  GitMerge,
  Gauge,
  Sparkles,
  Layout,
  Wrench,
  LucideIcon
} from 'lucide-react';

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
  description?: string;
}

// 7 Infographic Theme Colors for Roadmaps with hover halo accents, BorderBeam colors and dashed cut line colors
const INFOGRAPHIC_COLORS = [
  { bg: 'bg-[#FF5A4E]', iconColor: 'text-[#FF5A4E]', haloBg: 'bg-[#FF5A4E]/25', glowBorder: 'group-hover:border-[#FF5A4E]/40', colorFrom: '#FF5A4E', colorTo: '#FF85A1', dashedBorder: 'border-[#FF5A4E]', notchBorder: 'border-[#FF5A4E]' }, // Coral Red
  { bg: 'bg-[#4361EE]', iconColor: 'text-[#4361EE]', haloBg: 'bg-[#4361EE]/25', glowBorder: 'group-hover:border-[#4361EE]/40', colorFrom: '#4361EE', colorTo: '#06B6D4', dashedBorder: 'border-[#4361EE]', notchBorder: 'border-[#4361EE]' }, // Royal Blue
  { bg: 'bg-[#2EC4B6]', iconColor: 'text-[#2EC4B6]', haloBg: 'bg-[#2EC4B6]/25', glowBorder: 'group-hover:border-[#2EC4B6]/40', colorFrom: '#2EC4B6', colorTo: '#06B6D4', dashedBorder: 'border-[#2EC4B6]', notchBorder: 'border-[#2EC4B6]' }, // Mint Teal
  { bg: 'bg-[#FF9F1C]', iconColor: 'text-[#FF9F1C]', haloBg: 'bg-[#FF9F1C]/25', glowBorder: 'group-hover:border-[#FF9F1C]/40', colorFrom: '#FF9F1C', colorTo: '#FFD166', dashedBorder: 'border-[#FF9F1C]', notchBorder: 'border-[#FF9F1C]' }, // Warm Orange
  { bg: 'bg-[#FF85A1]', iconColor: 'text-[#FF85A1]', haloBg: 'bg-[#FF85A1]/25', glowBorder: 'group-hover:border-[#FF85A1]/40', colorFrom: '#FF85A1', colorTo: '#7209B7', dashedBorder: 'border-[#FF85A1]', notchBorder: 'border-[#FF85A1]' }, // Soft Pink
  { bg: 'bg-[#FFD166]', iconColor: 'text-[#D9A636]', haloBg: 'bg-[#FFD166]/35', glowBorder: 'group-hover:border-[#FFD166]/60', colorFrom: '#FFD166', colorTo: '#FF9F1C', dashedBorder: 'border-[#FFD166]', notchBorder: 'border-[#FFD166]' }, // Golden Yellow
  { bg: 'bg-[#7209B7]', iconColor: 'text-[#7209B7]', haloBg: 'bg-[#7209B7]/25', glowBorder: 'group-hover:border-[#7209B7]/40', colorFrom: '#7209B7', colorTo: '#4361EE', dashedBorder: 'border-[#7209B7]', notchBorder: 'border-[#7209B7]' }  // Deep Purple
];

// Topic Icon Mapping
const TOPIC_ICONS: Record<string, LucideIcon> = {
  'full-stack': Layers,
  'android': Smartphone,
  'devops': Cloud,
  'devsecops': ShieldCheck,
  'data-analyst': BarChart3,
  'ai-engineer': Cpu,
  'ai-data-scientist': Brain,
  'data-engineer': Database,
  'machine-learning': Network,
  'product-design': Palette,
  'postgresql': Database,
  'ios': Smartphone,
  'claude-code': Bot,
  'python-data-analysis': LineChart,
  'vibe-coding': Sparkles,
  'power-bi': PieChart,
  'leetcode': Code2,
  'python': Terminal,
  'computer-science': Binary,
  'sql': Database,
  'openclaw': Wrench,
  'react': Atom,
  'vue': LayoutGrid,
  'angular': Shield,
  'javascript': FileCode,
  'typescript': FileCode2,
  'nodejs': Server,
  'system-design': Network,
  'java': Coffee,
  'aspnet-core': Globe,
  'api-design': Webhook,
  'spring-boot': Zap,
  'flutter': Smartphone,
  'c-programming': Terminal,
  'cpp': Code2,
  'rust': ShieldCheck,
  'frontend': Layout,
  'backend': Server,
  'devops-proj': Cloud,
  'html': FileCode,
  'css': Palette,
  'javascript-proj': FileCode,
  'nodejs-proj': Server,
  'code-review': CheckCircle2,
  'web-vitals': Activity,
  'api-security': Lock,
  'clean-code': Sparkles,
  'cicd-auto': GitMerge,
  'db-tuning': Gauge
};

export const MAIN_CATEGORIES: { id: MainCategory; label: string; icon: LucideIcon; color: string }[] = [
  { id: 'Role based Roadmaps', label: 'Role based Roadmaps', icon: Compass, color: 'text-[#06B6D4]' },
  { id: 'Skill based Roadmaps', label: 'Skill based Roadmaps', icon: Zap, color: 'text-[#2563EB]' },
  { id: 'Project ideas', label: 'Project ideas', icon: Lightbulb, color: 'text-[#F59E0B]' },
  { id: 'Best practices', label: 'Best practices', icon: Award, color: 'text-[#10B981]' }
];

export const CATEGORY_ITEMS: Record<MainCategory, CardItem[]> = {
  'Role based Roadmaps': [
    { id: 'full-stack', title: 'Full Stack', category: 'Role based Roadmaps', description: 'Master client & server engineering' },
    { id: 'android', title: 'Android', category: 'Role based Roadmaps', description: 'Kotlin, Jetpack Compose & Android SDK' },
    { id: 'devops', title: 'DevOps', category: 'Role based Roadmaps', description: 'CI/CD, Kubernetes, Cloud & Infrastructure' },
    { id: 'devsecops', title: 'DevSecOps', category: 'Role based Roadmaps', description: 'Security integration in modern CI/CD' },
    { id: 'data-analyst', title: 'Data Analyst', category: 'Role based Roadmaps', description: 'SQL, Python, Excel & Tableau' },
    { id: 'ai-engineer', title: 'AI Engineer', category: 'Role based Roadmaps', description: 'LLMs, RAG, Agents & Fine-tuning' },
    { id: 'ai-data-scientist', title: 'AI and Data Scientist', category: 'Role based Roadmaps', description: 'Statistics, ML models & Neural Nets' },
    { id: 'data-engineer', title: 'Data Engineer', category: 'Role based Roadmaps', description: 'ETL Pipelines, Spark & Data Warehousing' },
    { id: 'machine-learning', title: 'Machine Learning', category: 'Role based Roadmaps', description: 'Scikit-Learn, PyTorch & Model Deployment' },
    { id: 'product-design', title: 'Product Design', isNew: true, category: 'Role based Roadmaps', description: 'UI/UX Design Systems, Figma & Prototyping' },
    { id: 'postgresql', title: 'PostgreSQL', category: 'Role based Roadmaps', description: 'Relational DBs, Query Tuning & Indexing' },
    { id: 'ios', title: 'iOS', category: 'Role based Roadmaps', description: 'Swift, SwiftUI & iOS App Architecture' }
  ],
  'Skill based Roadmaps': [
    { id: 'claude-code', title: 'Claude Code', category: 'Skill based Roadmaps', description: 'Agentic AI coding & prompt engineering' },
    { id: 'python-data-analysis', title: 'Python for Data Analysis', category: 'Skill based Roadmaps', description: 'Pandas, NumPy & Visualization' },
    { id: 'vibe-coding', title: 'Vibe Coding', category: 'Skill based Roadmaps', description: 'Rapid prototyping with LLM assistants' },
    { id: 'power-bi', title: 'Power BI', isNew: true, category: 'Skill based Roadmaps', description: 'Business Analytics & DAX modeling' },
    { id: 'leetcode', title: 'LeetCode', category: 'Skill based Roadmaps', description: 'Algorithms & Data Structure patterns' },
    { id: 'python', title: 'Python', category: 'Skill based Roadmaps', description: 'Core language, OOP & ecosystem' },
    { id: 'computer-science', title: 'Computer Science', category: 'Skill based Roadmaps', description: 'OS, Networking & Fundamentals' },
    { id: 'sql', title: 'SQL', category: 'Skill based Roadmaps', description: 'Database Queries, Joins & Optimization' },
    { id: 'openclaw', title: 'OpenClaw', category: 'Skill based Roadmaps', description: 'Web scraping & automation tools' },
    { id: 'react', title: 'React', category: 'Skill based Roadmaps', description: 'Hooks, State Management & Next.js' },
    { id: 'vue', title: 'Vue', category: 'Skill based Roadmaps', description: 'Composition API, Pinia & Nuxt' },
    { id: 'angular', title: 'Angular', category: 'Skill based Roadmaps', description: 'TypeScript, RxJS & Enterprise Apps' },
    { id: 'javascript', title: 'JavaScript', category: 'Skill based Roadmaps', description: 'ES6+, Async/Await & Event Loop' },
    { id: 'typescript', title: 'TypeScript', category: 'Skill based Roadmaps', description: 'Type Systems, Generics & Tooling' },
    { id: 'nodejs', title: 'Node.js', category: 'Skill based Roadmaps', description: 'Event-driven I/O, Express & Microservices' },
    { id: 'system-design', title: 'System Design', category: 'Skill based Roadmaps', description: 'Scalability, Load Balancers & Caching' },
    { id: 'java', title: 'Java', category: 'Skill based Roadmaps', description: 'JVM, Multithreading & Enterprise Java' },
    { id: 'aspnet-core', title: 'ASP.NET Core', category: 'Skill based Roadmaps', description: 'C#, Web APIs & Entity Framework' },
    { id: 'api-design', title: 'API Design', category: 'Skill based Roadmaps', description: 'REST, GraphQL, gRPC & OpenAPI' },
    { id: 'spring-boot', title: 'Spring Boot', category: 'Skill based Roadmaps', description: 'Dependency Injection, Security & Data JPA' },
    { id: 'flutter', title: 'Flutter', category: 'Skill based Roadmaps', description: 'Dart, Cross-platform UI & State' },
    { id: 'c-programming', title: 'C Programming', category: 'Skill based Roadmaps', description: 'Pointers, Memory & Low-level C' },
    { id: 'cpp', title: 'C++', category: 'Skill based Roadmaps', description: 'Modern C++, STL & Memory Management' },
    { id: 'rust', title: 'Rust', category: 'Skill based Roadmaps', description: 'Ownership, Memory Safety & Concurrency' }
  ],
  'Project ideas': [
    { id: 'frontend', title: 'Frontend', category: 'Project ideas', description: 'Real-world UI & Web app project builds' },
    { id: 'backend', title: 'Backend', category: 'Project ideas', description: 'API servers, DB integrations & Authentication' },
    { id: 'devops-proj', title: 'DevOps', category: 'Project ideas', description: 'Dockerized deployments & CI/CD workflows' },
    { id: 'html', title: 'HTML', category: 'Project ideas', description: 'Semantic markup & Accessibility challenges' },
    { id: 'css', title: 'CSS', category: 'Project ideas', description: 'Responsive layouts & CSS animation projects' },
    { id: 'javascript-proj', title: 'JavaScript', category: 'Project ideas', description: 'Vanilla JS DOM apps & interactive tools' },
    { id: 'nodejs-proj', title: 'Node.js', category: 'Project ideas', description: 'CLI utilities, WebSockets & Server builds' }
  ],
  'Best practices': [
    { id: 'code-review', title: 'Code Review', category: 'Best practices', description: 'Peer feedback, Pull Request guidelines & standards' },
    { id: 'web-vitals', title: 'Web Vitals', category: 'Best practices', description: 'LCP, CLS, FID & Web performance tuning' },
    { id: 'api-security', title: 'API Security', category: 'Best practices', description: 'OAuth2, JWT, Rate Limiting & OWASP Top 10' },
    { id: 'clean-code', title: 'Clean Code', category: 'Best practices', description: 'SOLID principles, Refactoring & Code Quality' },
    { id: 'cicd-auto', title: 'CI/CD Automation', category: 'Best practices', description: 'GitHub Actions, Automated Testing & Releases' },
    { id: 'db-tuning', title: 'Database Tuning', category: 'Best practices', description: 'Indexing strategies, Query optimization & Caching' }
  ]
};

export default function ScriptHeaderInfographicRoadmapPage() {
  const [activeCategory, setActiveCategory] = useState<MainCategory>('Role based Roadmaps');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pageIndex, setPageIndex] = useState<number>(0);

  const rawItems = CATEGORY_ITEMS[activeCategory] || CATEGORY_ITEMS['Role based Roadmaps'];

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return rawItems;
    const q = searchQuery.toLowerCase();
    return rawItems.filter(
      item => item.title.toLowerCase().includes(q) || (item.description && item.description.toLowerCase().includes(q))
    );
  }, [rawItems, searchQuery]);

  // Paginate items: 12 items max per page (3 rows of 4 nodes)
  const totalPages = Math.ceil(filteredItems.length / 12);
  const currentItems = useMemo(() => {
    return filteredItems.slice(pageIndex * 12, (pageIndex + 1) * 12);
  }, [filteredItems, pageIndex]);

  const handleCategorySelect = (cat: MainCategory) => {
    setActiveCategory(cat);
    setSearchQuery('');
    setPageIndex(0);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setPageIndex(0);
  };

  return (
    <div className="w-full min-h-screen flex-1 bg-[#F8FAFC] text-slate-900 font-sans pb-32 pt-12 sm:pt-16 relative">

      {/* Fixed Full Viewport Soft Off-White Background Overlay */}
      <div className="fixed inset-0 bg-[#F8FAFC] -z-10 pointer-events-none" />

      {/* Import Google Script Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Caveat:wght@700&display=swap');
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

        {/* ── TOP HEADER SECTION ───────────────────────────────────────────── */}
        <div className="flex flex-col items-start max-w-6xl pb-8">

          {/* Cursive Main Heading */}
          <div className="relative z-10 flex flex-col items-start space-y-1">
            {/* Line 1: "Clear Steps" (Arcade Logo Gradient script font) + "for a —" (slate text) */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-[#2962D6] via-[#2C83F5] to-[#27C5D8] bg-clip-text text-transparent tracking-wide"
                style={{ fontFamily: "'Dancing Script', 'Caveat', cursive" }}
              >
                Clear Steps
              </span>
              <span className="text-slate-600 font-medium text-xl sm:text-2xl font-sans">
                for a —
              </span>
            </div>

            {/* Line 2: "Structured Roadmap" (Dark navy cursive script with Arcade logo gradient brush stroke underline) */}
            <div className="relative inline-block pb-3 pt-1">
              <span
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tight block"
                style={{ fontFamily: "'Dancing Script', 'Caveat', cursive" }}
              >
                Structured Roadmap
              </span>

              {/* Curved Arcade Logo Gradient Brush Underline */}
              <svg
                className="absolute left-0 bottom-0 w-full h-4 pointer-events-none"
                viewBox="0 0 300 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="arcade-heading-line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2962D6" />
                    <stop offset="45%" stopColor="#2C83F5" />
                    <stop offset="100%" stopColor="#27C5D8" />
                  </linearGradient>
                </defs>
                <path
                  d="M 5,12 C 80,18 220,18 295,8"
                  stroke="url(#arcade-heading-line-gradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Subtitle Description */}
          <p className="text-slate-500 font-medium text-sm sm:text-base mt-2 max-w-2xl">
            Select a category below to explore single-topic roadmaps and specialized career learning tracks.
          </p>

          {/* Horizontal Category Pill Tabs + Search Input */}
          <div className="flex flex-wrap items-center justify-between gap-4 w-full mt-8 pt-1">

            {/* Minimalist Text Tabs with Underline Indicator matching reference image */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-8">
              {MAIN_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                const Icon = cat.icon;

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`relative flex items-center gap-2 pb-3 pt-1 font-bold text-sm sm:text-base transition-colors cursor-pointer ${isActive ? 'text-[#2962D6]' : 'text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    <Icon
                      size={18}
                      className={`transition-colors ${isActive ? 'text-[#2962D6]' : 'text-slate-400'
                        }`}
                    />
                    <span>{cat.label}</span>

                    {/* Active Underline Line Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2962D6] rounded-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search Input Box (Matching screenshot proportions: sm:w-72 / 288px) */}
            <div className="relative w-full sm:w-72 ml-auto">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${activeCategory}...`}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white rounded-full border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/30 focus:border-[#06B6D4]"
              />
            </div>

          </div>

        </div>

        {/* ── INFOGRAPHIC ROADMAP CANVAS: 4 CIRCLES PER LINE (PAGINATED 12 PER PAGE) ──────── */}
        <div className="py-12 relative min-h-[500px]">

          {/* Empty Search Result */}
          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <p className="text-lg font-bold text-slate-500">No matching roadmaps found for &quot;{searchQuery}&quot;</p>
              <button
                onClick={() => handleSearchChange('')}
                className="mt-3 px-4 py-2 bg-[#06B6D4] text-white text-xs font-bold rounded-full"
              >
                Reset Search
              </button>
            </div>
          )}

          {/* ROADMAP CARDS GRID */}
          {currentItems.length > 0 && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory + searchQuery + pageIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6"
              >
                {currentItems.map((item, idx) => {
                  const globalIdx = pageIndex * 12 + idx;
                  return (
                    <RoadmapCard
                      key={item.id}
                      item={item}
                      index={globalIdx}
                    />
                  );
                })}
              </motion.div>
            </AnimatePresence>
          )}

          {/* ── PAGINATION CONTROLS ───────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-6 mt-16 pt-6 border-t border-slate-200/80">
              <button
                type="button"
                onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
                disabled={pageIndex === 0}
                className="w-12 h-12 rounded-full border border-slate-200/80 bg-white text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 flex items-center justify-center transition-all shadow-sm cursor-pointer hover:scale-105"
                aria-label="Previous Page"
              >
                <ChevronLeft size={20} />
              </button>

              <span className="text-sm sm:text-base font-semibold text-slate-600">
                Page {pageIndex + 1} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPageIndex((prev) => Math.min(totalPages - 1, prev + 1))}
                disabled={pageIndex === totalPages - 1}
                className="w-12 h-12 rounded-full border border-slate-200/80 bg-white text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 flex items-center justify-center transition-all shadow-sm cursor-pointer hover:scale-105"
                aria-label="Next Page"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

// ── INDIVIDUAL ROADMAP CARD COMPONENT ──────────────────────────────────────────
function RoadmapCard({
  item,
  index
}: {
  item: CardItem;
  index: number;
}) {
  const colorTheme = INFOGRAPHIC_COLORS[index % INFOGRAPHIC_COLORS.length];
  const IconComp = TOPIC_ICONS[item.id] || Compass;

  return (
    <Link href={`/roadmap/${item.id}`} className="block w-full">
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group h-full bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 card-scalloped-left transition-all duration-300 cursor-pointer flex flex-col items-center text-center relative overflow-hidden"
      >
        {/* Fixed Theme Colored Hairline Scalloped Left Edge Line (2px width) */}
        <div className={`absolute top-0 bottom-0 left-0 w-[2px] ${colorTheme.bg} pointer-events-none z-10`} />
        {/* BorderBeam Animation on Card Hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <BorderBeam
            size={180}
            duration={8}
            borderWidth={2}
            colorFrom={colorTheme.colorFrom}
            colorTo={colorTheme.colorTo}
          />
        </div>

        {/* Signature Circular Badge with Outer Translucent Halo Ring Animation */}
        <div className="relative flex items-center justify-center my-1">
          {/* Animated Outer Translucent Halo Ring (expands smoothly when card is hovered) */}
          <div
            className={`absolute -inset-1.5 sm:-inset-2 rounded-full ${colorTheme.haloBg} opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 ease-out pointer-events-none`}
          />

          {/* Outer Solid Circle */}
          <div className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full ${colorTheme.bg} border-4 border-white shadow-md flex items-center justify-center relative z-10 transition-transform duration-300 group-hover:scale-105 shrink-0`}>
            {/* Inner White Circle */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white flex items-center justify-center shadow-inner">
              <IconComp size={22} className={colorTheme.iconColor} />
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-extrabold text-base sm:text-lg text-[#0F172A] group-hover:text-[#06B6D4] transition-colors mt-4 leading-snug">
          {item.title}
        </h3>

        {/* Description */}
        {item.description && (
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Footer / Action link */}
        <div className="mt-5 mb-2 w-full flex items-center justify-center text-xs font-bold text-slate-400 group-hover:text-[#06B6D4] transition-colors gap-1">
          <span>Explore Roadmap</span>
          <ChevronRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
        </div>

        {/* Signature Ribbon Flag V-Notch Cutout at Bottom-Right of Card (Bow Card Design) */}
        <div className="absolute bottom-0 right-6 w-10 h-3 pointer-events-none z-20">
          <svg className="w-full h-full" viewBox="0 0 40 12" preserveAspectRatio="none">
            <polygon points="0,12 20,0 40,12 40,12 0,12" fill="#F8FAFC" />
            <path d="M 0,12 L 20,0 L 40,12" fill="none" stroke="#E2E8F0" strokeWidth="1.5" />
          </svg>
        </div>
      </motion.div>
    </Link>
  );
}
