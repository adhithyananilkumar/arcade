"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Code2,
  Check,
  Copy,
  Layers,
  Sparkles,
  ExternalLink,
  BookOpen,
  Clock,
  Users,
  Target,
  FileCode,
  Globe,
  Share2,
  Compass,
  CheckSquare,
  Award,
  Terminal,
  Eye,
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Link as LinkIcon,
  Layout,
} from "lucide-react";

export interface RoadmapProjectTask {
  id: string;
  title: string;
  description: string;
  completed?: boolean;
}

export interface RoadmapProjectDetail {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  membersCount: string;
  timeAgo: string;
  colorTheme?: string;
  overview: string;
  userStories: string[];
  tasks: RoadmapProjectTask[];
  starterCode?: string;
}

interface RoadmapProjectDetailViewProps {
  project: RoadmapProjectDetail;
  onBack: () => void;
}

export const RoadmapProjectDetailView: React.FC<RoadmapProjectDetailViewProps> = ({
  project,
  onBack,
}) => {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    [`${project.id}-t1`]: false,
  });

  const [copiedCode, setCopiedCode] = useState(false);
  const [previewTab, setPreviewTab] = useState<"preview" | "specs">("preview");

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const totalTasks = project.tasks.length;
  const completedCount = project.tasks.filter((t) => completedTasks[t.id]).length;
  const progressPercent = Math.round((completedCount / (totalTasks || 1)) * 100);

  const handleCopyCode = () => {
    if (project.starterCode) {
      navigator.clipboard.writeText(project.starterCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const techTags = ["HTML5", "Semantic HTML", "Responsive Layout", "SEO"];

  // Color configurations strictly matching the reference images:
  // Step 1: Blue, Step 2: Amber/Orange, Step 3: Purple, Step 4: Mint/Green
  const stepThemes = [
    {
      bg: "#eff6ff",
      border: "#bfdbfe",
      borderDone: "#93c5fd",
      circleBg: "#2563eb",
      stepColor: "#2563eb",
      titleColor: "#1e3a8a",
      descColor: "#1e40af",
      badgeBg: "#dbeafe",
      badgeText: "#1e3a8a",
    },
    {
      bg: "#fffbeb",
      border: "#fde68a",
      borderDone: "#fcd34d",
      circleBg: "#d97706",
      stepColor: "#d97706",
      titleColor: "#78350f",
      descColor: "#92400e",
      badgeBg: "#fef3c7",
      badgeText: "#78350f",
    },
    {
      bg: "#faf5ff",
      border: "#e9d5ff",
      borderDone: "#d8b4fe",
      circleBg: "#9333ea",
      stepColor: "#9333ea",
      titleColor: "#581c87",
      descColor: "#6b21a8",
      badgeBg: "#f3e8ff",
      badgeText: "#581c87",
    },
    {
      bg: "#ecfdf5",
      border: "#a7f3d0",
      borderDone: "#6ee7b7",
      circleBg: "#059669",
      stepColor: "#059669",
      titleColor: "#064e3b",
      descColor: "#065f46",
      badgeBg: "#d1fae5",
      badgeText: "#064e3b",
    },
  ];

  const requirementsList = [
    {
      title: "Semantic HTML5",
      icon: Code2,
      bg: "#eff6ff",
      border: "#bfdbfe",
      circleBg: "#2563eb",
      titleColor: "#1e3a8a",
      descColor: "#1e40af",
      description:
        "Utilize meaningful landmark tags (<header>, <nav>, <main>, <section>, <article>, <footer>) instead of generic <div> containers.",
    },
    {
      title: "SEO Meta Tags",
      icon: Globe,
      bg: "#fffbeb",
      border: "#fde68a",
      circleBg: "#d97706",
      titleColor: "#78350f",
      descColor: "#92400e",
      description:
        "Include essential document meta tags in <head>: title, description, viewport configuration, and charset for search indexing.",
    },
    {
      title: "Open Graph (OG) Tags",
      icon: Share2,
      bg: "#faf5ff",
      border: "#e9d5ff",
      circleBg: "#9333ea",
      titleColor: "#581c87",
      descColor: "#6b21a8",
      description:
        "Configure og:title, og:description, and og:image tags to ensure rich snippet previews when sharing your resume link.",
    },
    {
      title: "Favicon & Icons",
      icon: Compass,
      bg: "#ecfdf5",
      border: "#a7f3d0",
      circleBg: "#059669",
      titleColor: "#064e3b",
      descColor: "#065f46",
      description:
        "Link a custom favicon icon in the <head> element so the browser tab renders a branded, professional tab icon.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-28 pointer-events-auto flex flex-col gap-8 text-left select-none relative z-10 font-sans"
    >
      {/* 1. Header Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <button
            onClick={onBack}
            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 text-slate-700 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 shadow-xs transition-all cursor-pointer font-bold text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Projects</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-md">
            {project.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100/80 px-3 py-1 rounded-full border border-slate-200/60">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{project.timeAgo || "Est. 2-3 Hours"}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100/80 px-3 py-1 rounded-full border border-slate-200/60">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{project.membersCount || "25,850 Learners"}</span>
          </div>
        </div>
      </div>

      {/* 2. Hero Section */}
      <div className="flex flex-col gap-4">
        {/* Badges Bar (Mapped to 4 Colors: Blue, Yellow, Purple, Green) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {techTags.map((tag, idx) => {
              const tagColorThemes = [
                { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" }, // 1. Blue
                { bg: "#fffbeb", border: "#fde68a", text: "#d97706" }, // 2. Yellow/Amber
                { bg: "#faf5ff", border: "#e9d5ff", text: "#9333ea" }, // 3. Purple
                { bg: "#ecfdf5", border: "#a7f3d0", text: "#059669" }, // 4. Mint/Green
              ];
              const color = tagColorThemes[idx % tagColorThemes.length];

              return (
                <span
                  key={tag}
                  style={{
                    backgroundColor: color.bg,
                    borderColor: color.border,
                    color: color.text,
                  }}
                  className="border rounded-full px-4 py-1 text-xs font-extrabold tracking-wide shadow-2xs"
                >
                  {tag}
                </span>
              );
            })}
          </div>

          <span
            style={{
              backgroundColor: "#fffbeb",
              borderColor: "#fde68a",
              color: "#92400e",
            }}
            className="border rounded-full px-4 py-1 text-xs font-black uppercase tracking-wider shadow-2xs"
          >
            {project.difficulty || "BEGINNER"}
          </span>
        </div>

        {/* Title in Running Letters (Handwritten/Cursive Script) in BLACK */}
        <div className="flex flex-col gap-1">
          <div className="relative inline-block self-start">
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-normal leading-tight tracking-normal select-none"
              style={{
                fontFamily: "'Dancing Script', 'Caveat', 'Brush Script MT', cursive",
                color: "#000000",
              }}
            >
              {project.title.toLowerCase()}
            </h1>
            {/* Curved Black Underline Accent */}
            <svg className="w-48 sm:w-60 h-3 -mt-1" viewBox="0 0 200 12" fill="none">
              <path
                d="M 5 6 C 60 11, 140 11, 195 4"
                stroke="#000000"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-3xl mt-1">
            {project.overview || project.description}
          </p>
        </div>
      </div>

      {/* 3. Objective Callout Card */}
      <div
        style={{
          backgroundColor: "#faf5ff",
          borderColor: "#e9d5ff",
        }}
        className="relative overflow-hidden rounded-2xl border p-5 sm:p-6 shadow-xs"
      >
        <div className="absolute top-0 left-0 bottom-0 w-1.5" style={{ backgroundColor: "#9333ea" }} />
        <div className="flex items-start gap-3.5">
          <div
            style={{ backgroundColor: "#9333ea" }}
            className="w-9 h-9 rounded-full text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5"
          >
            <Target className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-1">
            <span
              style={{ color: "#581c87" }}
              className="text-xs font-black uppercase tracking-wider"
            >
              Project Goal & Focus
            </span>
            <p
              style={{ color: "#581c87" }}
              className="text-xs sm:text-sm leading-relaxed font-medium"
            >
              "The goal of this project is to teach you how to create a structured, single-page CV
              using only HTML. You will focus on laying out your education, skills, and career
              history in a clean, semantic manner. Styling will be addressed in a later project."
            </p>
          </div>
        </div>
      </div>

      {/* 4. Interactive Live CV Mockup Preview (Redesigned & Highly Designful) */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="bg-blue-50 text-blue-700 border border-blue-200/80 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                Specification Canvas
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 mt-1">
              <Eye className="w-5 h-5 text-blue-600" />
              Target Visual Layout Specification
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Your HTML output should structure content matching this professional resume architecture:
            </p>
          </div>

          {/* Segmented Tab Switcher */}
          <div className="flex items-center bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 text-xs font-bold shadow-2xs">
            <button
              onClick={() => setPreviewTab("preview")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                previewTab === "preview"
                  ? "bg-white text-slate-900 shadow-xs font-extrabold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Layout className="w-3.5 h-3.5 text-blue-600" />
              <span>Visual Layout</span>
            </button>
            <button
              onClick={() => setPreviewTab("specs")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                previewTab === "specs"
                  ? "bg-white text-slate-900 shadow-xs font-extrabold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-purple-600" />
              <span>HTML Architecture</span>
            </button>
          </div>
        </div>

        {/* Browser Mockup Window Container */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl">
          {/* Browser Window Chrome Topbar */}
          <div className="bg-slate-50/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400 border border-rose-500/20 inline-block shadow-2xs" />
              <span className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500/20 inline-block shadow-2xs" />
              <span className="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-500/20 inline-block shadow-2xs" />
            </div>

            <div className="flex-1 max-w-md mx-auto bg-white border border-slate-200/90 rounded-xl px-4 py-1.5 text-[11px] font-mono text-slate-600 text-center truncate shadow-2xs flex items-center justify-center gap-2">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>http://localhost:3000/alex-rivera-cv.html</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-2xs">
                W3C Valid
              </span>
            </div>
          </div>

          {/* Canvas Background Area */}
          <div className="p-4 sm:p-8 lg:p-10 bg-gradient-to-b from-slate-100/60 via-slate-50/30 to-white min-h-[500px]">
            {previewTab === "preview" ? (
              /* High-End Modern CV Sheet */
              <div className="max-w-4xl mx-auto bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-lg flex flex-col gap-8 text-slate-800 relative overflow-hidden">
                {/* Decorative Top Gradient Stripe */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

                {/* CV Header: Profile Avatar, Title, and Contact Grid with Subtle Transparent Black Doodles */}
                <header className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/80 overflow-hidden">
                  {/* Background Floating Hand-drawn Doodles - Transparent Black */}
                  <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
                    {/* Top Right Floating Diamond Doodle */}
                    <svg className="absolute top-2.5 right-44 w-7 h-7 text-black/20 rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M 6 3 L 18 3 L 22 9 L 12 21 L 2 9 Z" />
                      <path d="M 2 9 L 22 9" />
                      <path d="M 12 21 L 9 9 L 6 3" />
                      <path d="M 12 21 L 15 9 L 18 3" />
                    </svg>

                    {/* Sparkle Cluster near Center */}
                    <svg className="absolute top-3 left-[340px] w-6 h-6 text-black/20 -rotate-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M 12 2 L 13.5 8.5 L 20 10 L 13.5 11.5 L 12 18 L 10.5 11.5 L 4 10 L 10.5 8.5 Z" />
                      <circle cx="19" cy="4" r="1" fill="currentColor" />
                      <circle cx="5" cy="18" r="1" fill="currentColor" />
                    </svg>

                    {/* Squiggle Waves Doodle */}
                    <svg className="absolute bottom-2.5 left-64 w-12 h-5 text-black/20" viewBox="0 0 32 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M 2 6 Q 8 1 14 6 T 26 6" />
                      <path d="M 2 11 Q 8 6 14 11 T 26 11" />
                    </svg>

                    {/* Cute Botanical Sprout in bottom right */}
                    <svg className="absolute -bottom-1 right-2 w-14 h-14 text-black/15 rotate-12" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M 6 34 C 14 26, 24 20, 34 12" />
                      <path d="M 16 28 C 14 22, 18 20, 20 25" />
                      <path d="M 24 20 C 22 14, 26 12, 28 17" />
                      <path d="M 30 14 C 28 8, 33 7, 34 12" />
                    </svg>

                    {/* Little Splash Drops on Top Left */}
                    <svg className="absolute top-2 left-2 w-6 h-6 text-black/20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M 4 14 C 4 14, 2 10, 5 8 C 8 10, 6 14, 4 14 Z" />
                      <path d="M 12 8 C 12 8, 11 5, 13 4 C 15 5, 14 8, 12 8 Z" />
                    </svg>

                    {/* Hand-drawn Cute Lightbulb/Idea Doodle */}
                    <svg className="absolute bottom-2 right-[270px] w-6 h-6 text-black/20 -rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M 9 18h6" />
                      <path d="M 10 21h4" />
                      <path d="M 12 2a6 6 0 0 0-4.5 10c.8.9 1.5 2 1.5 3h6c0-1 .7-2.1 1.5-3A6 6 0 0 0 12 2z" />
                    </svg>

                    {/* Hand-drawn Cute Starburst */}
                    <svg className="absolute top-8 right-6 w-5 h-5 text-black/20 rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14" />
                    </svg>
                  </div>

                  {/* Left Side: Avatar + Info */}
                  <div className="relative z-10 flex items-start sm:items-center gap-4">
                    {/* Avatar Initials Badge with Doodle Crown */}
                    <div className="relative">
                      {/* Hand-drawn Doodle Crown on Avatar - Transparent Black */}
                      <svg className="absolute -top-4 -left-2 w-8 h-7 text-black/30 -rotate-12 pointer-events-none z-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M 3 17 L 5 7 L 10 12 L 15 6 L 19 17 Z" />
                        <circle cx="5" cy="5" r="1.2" fill="currentColor" />
                        <circle cx="15" cy="4" r="1.2" fill="currentColor" />
                        <circle cx="10" cy="10" r="1.2" fill="currentColor" />
                      </svg>

                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 text-white font-black text-xl sm:text-2xl flex items-center justify-center shadow-md ring-4 ring-blue-50 shrink-0">
                        AR
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                          Alex Rivera
                        </h3>

                        {/* Hand-drawn 8-point sparkle star - Transparent Black */}
                        <svg className="w-5 h-5 text-black/25 pointer-events-none" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                          <path d="M 10 2 L 10 18 M 2 10 L 18 10 M 4 4 L 16 16 M 4 16 L 16 4" />
                        </svg>
                      </div>

                      <div className="flex items-center gap-2">
                        <p className="text-sm sm:text-base font-bold text-indigo-700">
                          Junior Frontend Developer & UI Specialist
                        </p>
                        {/* Little Doodle Sparkle - Transparent Black */}
                        <svg className="w-4 h-4 text-black/25 pointer-events-none" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                          <path d="M 8 1 L 9.5 5.5 L 14 7 L 9.5 8.5 L 8 13 L 6.5 8.5 L 2 7 L 6.5 5.5 Z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Contact Info */}
                  <div className="relative z-10 flex flex-col gap-2 shrink-0 text-xs">
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-medium">San Francisco, CA 94105</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-medium">(415) 555-0199</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Mail className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="font-semibold text-slate-800">alex.rivera@example.com</span>
                    </div>
                  </div>
                </header>

                {/* 2-Column CV Main Body Grid */}
                <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* LEFT COLUMN: Skills, Education, & Web Links (5 Cols) */}
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    {/* Technical Skills Section */}
                    <section className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200/70">
                        <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Code2 className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                          Technical Skills
                        </h4>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: "HTML5 Semantics", color: "bg-blue-50 text-blue-700 border-blue-200" },
                          { name: "CSS3 Flexbox", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
                          { name: "CSS Grid Layout", color: "bg-purple-50 text-purple-700 border-purple-200" },
                          { name: "JavaScript (ES6+)", color: "bg-amber-50 text-amber-800 border-amber-200" },
                          { name: "Web Accessibility (a11y)", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                          { name: "Responsive UI Design", color: "bg-sky-50 text-sky-700 border-sky-200" },
                          { name: "Git & Version Control", color: "bg-rose-50 text-rose-700 border-rose-200" },
                          { name: "SEO Meta Standards", color: "bg-teal-50 text-teal-700 border-teal-200" },
                        ].map((skill) => (
                          <span
                            key={skill.name}
                            className={`border rounded-lg px-2.5 py-1 text-xs font-semibold shadow-2xs transition-all hover:scale-[1.02] cursor-default ${skill.color}`}
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </section>

                    {/* Education Section */}
                    <section className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200/70">
                        <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <GraduationCap className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                          Education
                        </h4>
                      </div>

                      <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-1.5 shadow-2xs">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-black text-slate-900">
                            B.S. in Computer Science
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                            2021 – 2025
                          </span>
                        </div>
                        <p className="text-xs font-bold text-indigo-600">University of Technology</p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Dean's Honor List • Focus on Web Engineering & HCI
                        </p>
                      </div>
                    </section>

                    {/* Across the Web Section */}
                    <section className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200/70">
                        <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                          <Globe className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                          Across the Web
                        </h4>
                      </div>

                      <div className="flex flex-col gap-2 text-xs">
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/70 transition-colors">
                          <span className="flex items-center gap-2 font-bold text-slate-700">
                            <Globe className="w-4 h-4 text-blue-600" />
                            <span>LinkedIn Profile</span>
                          </span>
                          <span className="text-[11px] text-blue-600 font-medium">
                            /in/alexrivera
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 transition-colors">
                          <span className="flex items-center gap-2 font-bold text-slate-700">
                            <LinkIcon className="w-4 h-4 text-slate-800" />
                            <span>GitHub Repositories</span>
                          </span>
                          <span className="text-[11px] text-slate-600 font-mono">
                            @alexrivera
                          </span>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* RIGHT COLUMN: Professional Experience Timeline (7 Cols) */}
                  <div className="lg:col-span-7 flex flex-col gap-4">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200/70">
                      <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Briefcase className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                        Professional Experience
                      </h4>
                    </div>

                    <div className="flex flex-col gap-5 border-l-2 border-indigo-100 pl-5 ml-2 mt-1">
                      {/* Job 1 */}
                      <div className="flex flex-col gap-2 relative">
                        <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 absolute -left-[27px] top-1 ring-4 ring-indigo-50 shadow-xs" />
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className="text-sm font-black text-slate-900">
                            Frontend Developer Intern
                          </span>
                          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                            Jun 2024 – Present
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-600">
                          TechFlow Labs • San Francisco, CA
                        </p>
                        <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-outside ml-4 leading-relaxed mt-1">
                          <li>
                            Re-architected 15+ marketing landing pages using 100% semantic HTML5
                            landmarks, accelerating SEO discovery and accessibility scores to 99/100.
                          </li>
                          <li>
                            Implemented dynamic Open Graph (OG) and Twitter card meta configurations,
                            increasing rich preview engagement across socials by 22%.
                          </li>
                          <li>
                            Collaborated with UI designers in Figma to faithfully translate wireframes
                            into pixel-perfect responsive layouts.
                          </li>
                        </ul>
                      </div>

                      {/* Job 2 */}
                      <div className="flex flex-col gap-2 relative pt-2">
                        <span className="w-3.5 h-3.5 rounded-full bg-slate-300 absolute -left-[27px] top-3 ring-4 ring-slate-100" />
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className="text-sm font-black text-slate-900">
                            Web Coordinator & Developer
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                            Sep 2023 – May 2024
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-600">
                          University Coding Club • Campus Chapter
                        </p>
                        <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-outside ml-4 leading-relaxed mt-1">
                          <li>
                            Built and maintained the single-page event portal used by 500+ active
                            engineering students during annual hackathons.
                          </li>
                          <li>
                            Conducted weekly beginner workshops on semantic markup and CSS styling.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </main>

                {/* CV Footer */}
                <footer className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-slate-400 text-[11px]">
                  <span>Designed & Built with Semantic HTML5</span>
                  <span>Portfolio Version 1.0 • 2025</span>
                </footer>
              </div>
            ) : (
              /* High-End Interactive DOM Architecture Tree */
              <div className="max-w-3xl mx-auto bg-slate-950 text-slate-100 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold font-mono text-emerald-400">
                      DOM Hierarchy Architecture Map
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">index.html</span>
                </div>

                <div className="font-mono text-xs leading-loose space-y-2 text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
                    <span className="text-purple-400 font-bold">&lt;head&gt;</span>
                    <span className="text-slate-400 text-[11px] pl-4">
                      ├── &lt;meta charset="UTF-8"&gt;<br />
                      ├── &lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;<br />
                      ├── &lt;title&gt;Alex Rivera — Frontend Developer CV&lt;/title&gt;<br />
                      ├── &lt;meta name="description" content="..."&gt;<br />
                      ├── &lt;meta property="og:title" content="..."&gt;<br />
                      └── &lt;link rel="icon" type="image/x-icon" href="/favicon.ico"&gt;
                    </span>
                    <span className="text-purple-400 font-bold">&lt;/head&gt;</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1">
                    <span className="text-sky-400 font-bold">&lt;body&gt;</span>
                    <div className="pl-4 space-y-2">
                      <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                        <span className="text-amber-400 font-bold">&lt;header&gt;</span>
                        <p className="text-[11px] text-slate-400">
                          Bio avatar, Name &lt;h1&gt;, Job Title &lt;p&gt;, and Contact info list
                        </p>
                        <span className="text-amber-400 font-bold">&lt;/header&gt;</span>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                        <span className="text-emerald-400 font-bold">&lt;main&gt;</span>
                        <div className="pl-4 space-y-1 text-[11px] text-slate-400">
                          <p>&lt;section id="skills"&gt; Technical Skills list &lt;/section&gt;</p>
                          <p>&lt;section id="experience"&gt; Career history &lt;/section&gt;</p>
                          <p>&lt;section id="education"&gt; Degree & coursework &lt;/section&gt;</p>
                          <p>&lt;section id="links"&gt; Online web profiles &lt;/section&gt;</p>
                        </div>
                        <span className="text-emerald-400 font-bold">&lt;/main&gt;</span>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                        <span className="text-rose-400 font-bold">&lt;footer&gt;</span>
                        <p className="text-[11px] text-slate-400">Copyright & build metadata</p>
                        <span className="text-rose-400 font-bold">&lt;/footer&gt;</span>
                      </div>
                    </div>
                    <span className="text-sky-400 font-bold">&lt;/body&gt;</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Key Requirements Grid (Styled with Coordinated Pastel Colors & Direct Color Styles) */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            Core Implementation Requirements
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Ensure your project adheres to the following industry standards:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {requirementsList.map((req, idx) => {
            return (
              <div
                key={req.title}
                style={{
                  backgroundColor: req.bg,
                  borderColor: req.border,
                }}
                className="border rounded-2xl p-5 shadow-xs transition-all flex flex-col gap-2.5"
              >
                <div className="flex items-center gap-3">
                  <div
                    style={{ backgroundColor: req.circleBg }}
                    className="w-8 h-8 rounded-full text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-xs"
                  >
                    {idx + 1}
                  </div>
                  <h3
                    style={{ color: req.titleColor }}
                    className="text-sm font-bold"
                  >
                    {req.title}
                  </h3>
                </div>
                <p
                  style={{ color: req.descColor }}
                  className="text-xs leading-relaxed font-normal"
                >
                  {req.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Step-by-Step Task Checklist (Using 4-Color Theme Matching Image 2) */}
      {project.tasks && project.tasks.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#2563eb] text-white flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  Guided Step-by-Step Checklist
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Check off tasks as you build to track your completion
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-32 bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/60 hidden sm:block">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-600 via-amber-500 to-emerald-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-xs font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                {completedCount} / {totalTasks} Completed ({progressPercent}%)
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {project.tasks.map((task, idx) => {
              const isDone = !!completedTasks[task.id];
              const theme = stepThemes[idx % stepThemes.length];

              return (
                <motion.div
                  key={task.id}
                  whileHover={{ scale: 1.003 }}
                  onClick={() => toggleTask(task.id)}
                  style={{
                    backgroundColor: theme.bg,
                    borderColor: isDone ? theme.borderDone : theme.border,
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 shadow-2xs ${
                    isDone ? "opacity-90" : "hover:shadow-xs"
                  }`}
                >
                  {/* Step Number Circle (1 Blue, 2 Amber, 3 Purple, 4 Green) */}
                  <div className="mt-0.5 shrink-0 flex items-center justify-center">
                    {isDone ? (
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    ) : (
                      <div
                        style={{ backgroundColor: theme.circleBg }}
                        className="w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-xs"
                      >
                        {idx + 1}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span
                        style={{ color: theme.stepColor }}
                        className="text-[11px] font-black uppercase tracking-wider"
                      >
                        Step {idx + 1}
                      </span>
                      {isDone && (
                        <span
                          style={{
                            backgroundColor: theme.badgeBg,
                            color: theme.badgeText,
                          }}
                          className="text-[10px] font-black px-2 py-0.5 rounded-md"
                        >
                          Done
                        </span>
                      )}
                    </div>

                    <h3
                      style={{ color: isDone ? undefined : theme.titleColor }}
                      className={`text-sm sm:text-base font-extrabold leading-snug ${
                        isDone ? "line-through opacity-70 text-slate-500" : ""
                      }`}
                    >
                      {task.title}
                    </h3>

                    <p
                      style={{ color: isDone ? undefined : theme.descColor }}
                      className={`text-xs leading-relaxed font-medium ${
                        isDone ? "opacity-70 text-slate-500" : ""
                      }`}
                    >
                      {task.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. Submission Checklist */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col gap-3">
        <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          Submission & Quality Verification
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Before publishing or turning in your project, verify all points below:
        </p>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {[
            "Semantically valid HTML5 structure with no unclosed tags.",
            "Complete contact details and social media links present.",
            "Essential SEO meta tags configured in the <head> tag.",
            "Open Graph (OG) tags defined for rich link previews.",
            "Valid favicon linked in <head> for browser branding.",
            "Passed W3C HTML validator without fatal errors.",
          ].map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 font-medium"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 8. Starter Code Boilerplate Editor Box */}
      {project.starterCode && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-600" />
              Starter Code Boilerplate
            </h2>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-300" />
                  <span>Copy Starter Code</span>
                </>
              )}
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-lg text-slate-100">
            {/* Editor Title Bar */}
            <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span className="text-[11px] font-mono text-slate-400 ml-2">index.html</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                HTML5 Template
              </span>
            </div>

            {/* Code Body */}
            <div className="p-4 sm:p-5 text-xs font-mono overflow-x-auto leading-relaxed text-slate-200">
              <pre>{project.starterCode}</pre>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
