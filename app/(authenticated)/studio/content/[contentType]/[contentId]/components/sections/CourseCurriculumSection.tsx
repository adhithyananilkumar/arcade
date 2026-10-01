"use client";

import { BookOpen, Target, CheckCircle2, Clock, Code, Award, Sparkles, Layers } from "lucide-react";

export function CourseCurriculumSection() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 1. Curriculum & Structure Overview Card */}
      <div className="rounded-[22px] border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] backdrop-blur-md flex flex-col justify-between gap-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen size={18} className="text-[#205ca8] dark:text-blue-400" />
              Curriculum & Structure Breakdown
            </h3>
            <span className="rounded-full border border-blue-200/80 bg-blue-50 text-[#205ca8] dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300 px-3 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider">
              12 Modules
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Comprehensive course syllabus and learning progression
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex flex-col p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
            <span className="text-[10px] font-mono font-bold uppercase text-[#205ca8] dark:text-blue-400">Lessons</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">48</span>
          </div>
          <div className="flex flex-col p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
            <span className="text-[10px] font-mono font-bold uppercase text-[#205ca8] dark:text-blue-400">Duration</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">6h 30m</span>
          </div>
          <div className="flex flex-col p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
            <span className="text-[10px] font-mono font-bold uppercase text-[#205ca8] dark:text-blue-400">Code Labs</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">14</span>
          </div>
          <div className="flex flex-col p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
            <span className="text-[10px] font-mono font-bold uppercase text-[#205ca8] dark:text-blue-400">Capstones</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">3</span>
          </div>
        </div>

        {/* Content Ratio Progress Bar */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Learning Format Ratio</span>
            <span className="text-[11px] font-mono font-bold text-[#205ca8] dark:text-blue-400">60% Video · 25% Labs · 15% Capstone</span>
          </div>
          <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 flex p-0.5 border border-slate-200/80 dark:border-slate-700">
            <div className="h-full bg-blue-500 rounded-l-full" style={{ width: "60%" }} title="Video Lectures" />
            <div className="h-full bg-teal-500" style={{ width: "25%" }} title="Hands-on Labs" />
            <div className="h-full bg-indigo-500 rounded-r-full" style={{ width: "15%" }} title="Capstone Projects" />
          </div>
          <div className="flex items-center gap-4 text-[10px] font-medium text-slate-500 dark:text-slate-400 pt-1">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-blue-500" /> Video Lectures</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-teal-500" /> Interactive Labs</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-indigo-500" /> Capstones</span>
          </div>
        </div>
      </div>

      {/* 2. Skills Acquired & Outcomes Card */}
      <div className="rounded-[22px] border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] backdrop-blur-md flex flex-col justify-between gap-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Target size={18} className="text-[#205ca8] dark:text-blue-400" />
              Target Skills & Outcomes
            </h3>
            <span className="rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider">
              Intermediate - Advanced
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Mastered competencies and key learning objectives
          </p>
        </div>

        {/* Skill Pills Badge Matrix */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: "System Design", icon: Layers },
            { label: "TypeScript & React", icon: Code },
            { label: "Microservices Architecture", icon: Sparkles },
            { label: "API Security & OAuth", icon: CheckCircle2 },
            { label: "Capstone Projects", icon: Award },
            { label: "CI/CD Deployment", icon: Clock },
          ].map((skill) => {
            const IconComp = skill.icon;
            return (
              <span
                key={skill.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 px-3.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                <IconComp size={13} className="text-[#205ca8] dark:text-blue-400" />
                {skill.label}
              </span>
            );
          })}
        </div>

        {/* Prerequisites Line */}
        <div className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs font-medium text-slate-700 dark:text-slate-300">
          <Sparkles size={16} className="text-[#205ca8] dark:text-blue-400 shrink-0" />
          <span><strong className="text-slate-900 dark:text-white font-bold">Prerequisite:</strong> Basic knowledge of modern web development and programming concepts.</span>
        </div>
      </div>
    </div>
  );
}
