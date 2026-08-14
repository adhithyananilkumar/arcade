"use client";

import { BookOpen, Target, CheckCircle2, Clock, Video, Code, Award, Sparkles, Layers } from "lucide-react";

export function CourseCurriculumSection() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 1. Curriculum & Structure Overview Card */}
      <div className="rounded-[24px] border-[1.5px] border-blue-400/80 bg-gradient-to-b from-blue-50/40 via-white to-white p-6 sm:p-7 shadow-[4px_-4px_0px_0px_#BFDBFE] flex flex-col justify-between gap-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black tracking-tight text-slate-900 flex items-center gap-2">
              <BookOpen size={18} className="text-blue-600" />
              Curriculum & Structure Breakdown
            </h3>
            <span className="rounded-full border border-blue-200 bg-blue-100 text-blue-800 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider">
              12 Modules
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500">
            Comprehensive course syllabus and learning progression
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex flex-col p-3 rounded-2xl border border-blue-100 bg-white shadow-2xs">
            <span className="text-[10px] font-black uppercase text-blue-600">Lessons</span>
            <span className="text-xl font-black text-slate-900">48</span>
          </div>
          <div className="flex flex-col p-3 rounded-2xl border border-blue-100 bg-white shadow-2xs">
            <span className="text-[10px] font-black uppercase text-blue-600">Duration</span>
            <span className="text-xl font-black text-slate-900">6h 30m</span>
          </div>
          <div className="flex flex-col p-3 rounded-2xl border border-blue-100 bg-white shadow-2xs">
            <span className="text-[10px] font-black uppercase text-blue-600">Code Labs</span>
            <span className="text-xl font-black text-slate-900">14</span>
          </div>
          <div className="flex flex-col p-3 rounded-2xl border border-blue-100 bg-white shadow-2xs">
            <span className="text-[10px] font-black uppercase text-blue-600">Capstones</span>
            <span className="text-xl font-black text-slate-900">3</span>
          </div>
        </div>

        {/* Content Ratio Progress Bar */}
        <div className="flex flex-col gap-2 pt-2 border-t border-blue-100">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Learning Format Ratio</span>
            <span className="text-[11px] font-extrabold text-blue-600">60% Video · 25% Labs · 15% Capstone</span>
          </div>
          <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100 flex p-0.5 border border-slate-200">
            <div className="h-full bg-blue-500 rounded-l-full" style={{ width: "60%" }} title="Video Lectures" />
            <div className="h-full bg-emerald-500" style={{ width: "25%" }} title="Hands-on Labs" />
            <div className="h-full bg-purple-500 rounded-r-full" style={{ width: "15%" }} title="Capstone Projects" />
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 pt-1">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-blue-500" /> Video Lectures</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-500" /> Interactive Labs</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-purple-500" /> Capstones</span>
          </div>
        </div>
      </div>

      {/* 2. Skills Acquired & Outcomes Card */}
      <div className="rounded-[24px] border-[1.5px] border-purple-400/80 bg-gradient-to-b from-purple-50/40 via-white to-white p-6 sm:p-7 shadow-[4px_-4px_0px_0px_#E9D5FF] flex flex-col justify-between gap-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black tracking-tight text-slate-900 flex items-center gap-2">
              <Target size={18} className="text-purple-600" />
              Target Skills & Outcomes
            </h3>
            <span className="rounded-full border border-purple-200 bg-purple-100 text-purple-800 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider">
              Intermediate - Advanced
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500">
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
                className="inline-flex items-center gap-1.5 rounded-full border border-purple-200/90 bg-purple-50/80 px-3.5 py-1.5 text-xs font-extrabold text-purple-900 shadow-2xs"
              >
                <IconComp size={13} className="text-purple-600" />
                {skill.label}
              </span>
            );
          })}
        </div>

        {/* Prerequisites Line */}
        <div className="flex items-center gap-2.5 p-3 rounded-2xl border border-purple-100 bg-purple-50/50 text-xs font-semibold text-slate-700">
          <Sparkles size={16} className="text-purple-600 shrink-0" />
          <span><strong className="text-slate-900 font-extrabold">Prerequisite:</strong> Basic knowledge of modern web development and programming concepts.</span>
        </div>
      </div>
    </div>
  );
}
