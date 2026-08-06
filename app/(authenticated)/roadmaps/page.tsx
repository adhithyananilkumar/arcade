'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  BookOpen,
  ChevronRight,
  X,
  Layers,
  Clock,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RoadmapStep {
  stepNumber: number;
  title: string;
  category: string;
  description: string;
  topics: string[];
  duration: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED';
  side: 'left' | 'right';
  yOffset: number; // Percentage down the road
}

const ROADMAP_STEPS: RoadmapStep[] = [
  {
    stepNumber: 1,
    title: 'Frontend & UI Fundamentals',
    category: 'Foundation Stage',
    description: 'Master core web technologies, semantic HTML5, CSS Grid/Flexbox layouts, modern JavaScript (ES6+), and responsive design principles.',
    topics: ['HTML5 & Accessibility (ARIA)', 'CSS Grid, Flexbox & Tailwind CSS', 'JavaScript Engine & Async ES6+', 'DOM Manipulation & Browser APIs'],
    duration: '3 Weeks',
    status: 'COMPLETED',
    side: 'right',
    yOffset: 12
  },
  {
    stepNumber: 2,
    title: 'React.js & State Management',
    category: 'Frontend Engineering',
    description: 'Build interactive single-page apps with React, custom Hooks, Zustand state management, and component design patterns.',
    topics: ['React Components & Props', 'Hooks (useState, useEffect, useMemo)', 'Zustand & Context State', 'Framer Motion Animations'],
    duration: '4 Weeks',
    status: 'IN_PROGRESS',
    side: 'left',
    yOffset: 34
  },
  {
    stepNumber: 3,
    title: 'Backend APIs & Database Architecture',
    category: 'Server Infrastructure',
    description: 'Design RESTful APIs, relational database schemas with PostgreSQL, Prisma ORM, JWT authentication, and server-side validation.',
    topics: ['Node.js & Express.js Core', 'PostgreSQL & Prisma ORM', 'JWT & OAuth Authentication', 'API Security & Rate Limiting'],
    duration: '4 Weeks',
    status: 'LOCKED',
    side: 'right',
    yOffset: 56
  },
  {
    stepNumber: 4,
    title: 'Next.js App Router & Full-Stack Systems',
    category: 'Full-Stack Integration',
    description: 'Combine frontend and backend with Next.js App Router, Server Components, Server Actions, and SSR/SSG caching strategies.',
    topics: ['Next.js App Router Architecture', 'Server Components & Actions', 'Optimistic UI & Hydration', 'Vercel Deployment & Edge CDN'],
    duration: '3 Weeks',
    status: 'LOCKED',
    side: 'left',
    yOffset: 78
  },
  {
    stepNumber: 5,
    title: 'DevOps, CI/CD & Cloud Deployment',
    category: 'Production Mastery',
    description: 'Automate build workflows with GitHub Actions, containerize applications with Docker, and deploy scalable cloud infrastructure.',
    topics: ['Docker & Containerization', 'GitHub Actions CI/CD', 'AWS & Cloud Hosting', 'Monitoring & Analytics'],
    duration: '2 Weeks',
    status: 'LOCKED',
    side: 'right',
    yOffset: 94
  }
];

export default function SerpentineRoadmapPage() {
  const [activeStep, setActiveStep] = useState<RoadmapStep | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]);
  const [selectedTrack, setSelectedTrack] = useState('Full-Stack Web Development');

  const toggleStepComplete = (stepNum: number) => {
    if (completedSteps.includes(stepNum)) {
      setCompletedSteps(completedSteps.filter((s) => s !== stepNum));
    } else {
      setCompletedSteps([...completedSteps, stepNum]);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-32 pt-20 sm:pt-24 relative overflow-hidden">
      {/* Inject Google Fonts for Cursive Handwritten Header */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Caveat:wght@700&display=swap');
      `}</style>

      {/* Background Subtle Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(41, 98, 214, 0.4) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Top Header Navigation Bar ──────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-slate-200/80">

          {/* Handwritten Reference Match Header */}
          <div className="relative space-y-2 max-w-2xl">
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
              Follow the guided serpentine pathway milestone by milestone. Click on any step node to open lesson topics and track your learning progress.
            </p>
          </div>

          {/* Track Selector Dropdown / Pills with Arcade Logo Theme Gradient */}
          <div className="flex flex-wrap items-center gap-2">
            {['Full-Stack Web Development', 'AI & Machine Learning', 'UI/UX Design Systems'].map((track) => {
              const active = selectedTrack === track;
              return (
                <button
                  key={track}
                  type="button"
                  onClick={() => setSelectedTrack(track)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${active
                    ? 'bg-gradient-to-r from-[#2962D6] via-[#2C83F5] to-[#27C5D8] text-white shadow-lg shadow-blue-500/25 scale-105'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                >
                  {track}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Main Winding Road Container ────────────────────────────────── */}
        <div className="relative my-12 min-h-[1100px] flex items-center justify-center">

          {/* SVG Winding Asphalt Road Graphic */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
            viewBox="0 0 1000 1100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="roadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="50%" stopColor="#0F172A" />
                <stop offset="100%" stopColor="#1E293B" />
              </linearGradient>

              {/* Arcade Logo Brand Gradient for Pin Lines & Connectors */}
              <linearGradient id="arcadeBrandGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2962D6" />
                <stop offset="50%" stopColor="#2C83F5" />
                <stop offset="100%" stopColor="#27C5D8" />
              </linearGradient>

              <filter id="roadShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#0F172A" floodOpacity="0.18" />
              </filter>
            </defs>

            {/* Road Base Outer Stroke */}
            <path
              d="M 500,30 C 750,150 780,220 500,320 C 220,420 220,520 500,620 C 780,720 780,820 500,920 C 350,970 500,1050 500,1080"
              fill="none"
              stroke="#0F172A"
              strokeWidth="56"
              strokeLinecap="round"
              filter="url(#roadShadow)"
            />

            {/* Road Asphalt Inner Fill */}
            <path
              d="M 500,30 C 750,150 780,220 500,320 C 220,420 220,520 500,620 C 780,720 780,820 500,920 C 350,970 500,1050 500,1080"
              fill="none"
              stroke="url(#roadGradient)"
              strokeWidth="48"
              strokeLinecap="round"
            />

            {/* Dashed Road Center Line */}
            <path
              d="M 500,30 C 750,150 780,220 500,320 C 220,420 220,520 500,620 C 780,720 780,820 500,920 C 350,970 500,1050 500,1080"
              fill="none"
              stroke="#F8FAFC"
              strokeWidth="3.5"
              strokeDasharray="14 14"
              strokeLinecap="round"
              opacity="0.8"
            />
          </svg>

          {/* ── Roadmap Steps Positioned Along the Road ────────────────────── */}
          <div className="relative w-full h-[1100px] z-10 max-w-5xl mx-auto">
            {ROADMAP_STEPS.map((step) => {
              const isCompleted = completedSteps.includes(step.stepNumber);
              const topPos = `${step.yOffset}%`;

              return (
                <div
                  key={step.stepNumber}
                  className="absolute left-0 right-0 flex items-center justify-center pointer-events-none"
                  style={{ top: topPos }}
                >
                  <div className="w-full max-w-4xl relative flex items-center justify-between px-6">

                    {/* LEFT SIDE CONTENT */}
                    <div className="w-1/2 pr-12 text-right pointer-events-auto">
                      {step.side === 'left' && (
                        <motion.div
                          whileHover={{ scale: 1.03 }}
                          onClick={() => setActiveStep(step)}
                          className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xl cursor-pointer hover:border-[#2C83F5] transition-all text-right ml-auto max-w-md group"
                        >
                          <div className="flex items-center justify-end gap-2 text-xs font-black uppercase text-[#2962D6] tracking-wider mb-1">
                            <span>{step.category}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#27C5D8]" />
                          </div>
                          <h3 className="text-xl font-black text-slate-900 group-hover:text-[#2962D6] transition-colors">
                            {step.title}
                          </h3>
                          <p className="text-xs font-semibold text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                            {step.description}
                          </p>
                          <div className="mt-4 flex items-center justify-end gap-2 text-xs font-bold text-slate-400 group-hover:text-slate-900">
                            <span>View {step.topics.length} Lessons</span>
                            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* CENTER NUMBERED BADGE NODE ON THE ROAD (Arcade Logo Gradient Theme) */}
                    <div className="relative shrink-0 pointer-events-auto z-20">
                      <button
                        type="button"
                        onClick={() => setActiveStep(step)}
                        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center font-black text-2xl sm:text-3xl text-white shadow-[0_12px_30px_rgba(41,98,214,0.35)] transition-all duration-300 border-4 border-white cursor-pointer relative bg-gradient-to-r from-[#2962D6] via-[#2C83F5] to-[#27C5D8] ${isCompleted
                          ? 'ring-8 ring-[#2C83F5]/30 scale-110'
                          : 'hover:scale-110 hover:ring-8 hover:ring-[#2C83F5]/30'
                          }`}
                      >
                        {step.stepNumber}

                        {/* Connector Pin Line with Arcade Brand Gradient */}
                        <div
                          className={`absolute top-1/2 -translate-y-1/2 w-8 h-1 bg-gradient-to-r from-[#2962D6] to-[#27C5D8] ${step.side === 'left' ? 'right-full' : 'left-full'
                            }`}
                        />
                      </button>
                    </div>

                    {/* RIGHT SIDE CONTENT */}
                    <div className="w-1/2 pl-12 text-left pointer-events-auto">
                      {step.side === 'right' && (
                        <motion.div
                          whileHover={{ scale: 1.03 }}
                          onClick={() => setActiveStep(step)}
                          className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xl cursor-pointer hover:border-[#2C83F5] transition-all text-left max-w-md group"
                        >
                          <div className="flex items-center justify-start gap-2 text-xs font-black uppercase text-[#2962D6] tracking-wider mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#27C5D8]" />
                            <span>{step.category}</span>
                          </div>
                          <h3 className="text-xl font-black text-slate-900 group-hover:text-[#2962D6] transition-colors">
                            {step.title}
                          </h3>
                          <p className="text-xs font-semibold text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                            {step.description}
                          </p>
                          <div className="mt-4 flex items-center justify-start gap-2 text-xs font-bold text-slate-400 group-hover:text-slate-900">
                            <span>View {step.topics.length} Lessons</span>
                            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                          </div>
                        </motion.div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* ── Slide-Over Modal / Drawer for Active Step Details ────────────────── */}
      <AnimatePresence>
        {activeStep && (
          <div className="fixed inset-0 z-50 flex items-center justify-end p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveStep(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-full max-w-lg h-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col justify-between"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#2962D6] via-[#2C83F5] to-[#27C5D8] text-white flex items-center justify-center font-black text-xl shadow-md">
                    {activeStep.stepNumber}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#2962D6] block">
                      {activeStep.category}
                    </span>
                    <h2 className="font-extrabold text-base text-slate-900 leading-tight">
                      {activeStep.title}
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveStep(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-none">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Overview</h3>
                  <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed">
                    {activeStep.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Curriculum & Topics</h3>
                  <div className="space-y-2">
                    {activeStep.topics.map((topic, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/50 flex items-center justify-between gap-3 text-xs font-extrabold text-slate-800"
                      >
                        <div className="flex items-center gap-2.5">
                          <BookOpen size={16} className="text-[#2C83F5]" />
                          <span>{topic}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">15 mins</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => toggleStepComplete(activeStep.stepNumber)}
                  className={`flex-1 py-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${completedSteps.includes(activeStep.stepNumber)
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-gradient-to-r from-[#2962D6] via-[#2C83F5] to-[#27C5D8] hover:opacity-95 text-white shadow-lg'
                    }`}
                >
                  <CheckCircle2 size={16} />
                  <span>
                    {completedSteps.includes(activeStep.stepNumber) ? 'Marked as Completed' : 'Mark Step as Complete'}
                  </span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
