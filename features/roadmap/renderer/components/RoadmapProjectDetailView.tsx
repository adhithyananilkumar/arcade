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

  // Step card color themes matching the 4 step color palette (Blue, Amber, Purple, Emerald)
  const stepColorThemes = [
    {
      cardBg: "bg-[#eff6ff]",
      cardBorder: "border-[#bfdbfe]",
      cardBorderDone: "border-[#93c5fd]",
      numberCircle: "bg-[#2563eb] text-white",
      titleColor: "text-[#1e3a8a]",
      descColor: "text-[#1e40af]/80",
      stepLabel: "text-[#3b82f6]",
      doneBadge: "bg-[#dbeafe] text-[#1e40af]",
    },
    {
      cardBg: "bg-[#fffbeb]",
      cardBorder: "border-[#fde68a]",
      cardBorderDone: "border-[#fcd34d]",
      numberCircle: "bg-[#d97706] text-white",
      titleColor: "text-[#78350f]",
      descColor: "text-[#92400e]/80",
      stepLabel: "text-[#f59e0b]",
      doneBadge: "bg-[#fef3c7] text-[#92400e]",
    },
    {
      cardBg: "bg-[#faf5ff]",
      cardBorder: "border-[#e9d5ff]",
      cardBorderDone: "border-[#d8b4fe]",
      numberCircle: "bg-[#9333ea] text-white",
      titleColor: "text-[#581c87]",
      descColor: "text-[#6b21a8]/80",
      stepLabel: "text-[#a855f7]",
      doneBadge: "bg-[#f3e8ff] text-[#6b21a8]",
    },
    {
      cardBg: "bg-[#ecfdf5]",
      cardBorder: "border-[#a7f3d0]",
      cardBorderDone: "border-[#6ee7b7]",
      numberCircle: "bg-[#059669] text-white",
      titleColor: "text-[#064e3b]",
      descColor: "text-[#065f46]/80",
      stepLabel: "text-[#10b981]",
      doneBadge: "bg-[#d1fae5] text-[#065f46]",
    },
  ];

  const requirementsList = [
    {
      title: "Semantic HTML5",
      icon: Code2,
      cardBg: "bg-[#eff6ff] border-[#bfdbfe]",
      numberCircle: "bg-[#2563eb] text-white",
      textColor: "text-[#1e3a8a]",
      descColor: "text-[#1e40af]/80",
      description:
        "Utilize meaningful landmark tags (<header>, <nav>, <main>, <section>, <article>, <footer>) instead of generic <div> containers.",
    },
    {
      title: "SEO Meta Tags",
      icon: Globe,
      cardBg: "bg-[#fffbeb] border-[#fde68a]",
      numberCircle: "bg-[#d97706] text-white",
      textColor: "text-[#78350f]",
      descColor: "text-[#92400e]/80",
      description:
        "Include essential document meta tags in <head>: title, description, viewport configuration, and charset for search indexing.",
    },
    {
      title: "Open Graph (OG) Tags",
      icon: Share2,
      cardBg: "bg-[#faf5ff] border-[#e9d5ff]",
      numberCircle: "bg-[#9333ea] text-white",
      textColor: "text-[#581c87]",
      descColor: "text-[#6b21a8]/80",
      description:
        "Configure og:title, og:description, and og:image tags to ensure rich snippet previews when sharing your resume link.",
    },
    {
      title: "Favicon & Icons",
      icon: Compass,
      cardBg: "bg-[#ecfdf5] border-[#a7f3d0]",
      numberCircle: "bg-[#059669] text-white",
      textColor: "text-[#064e3b]",
      descColor: "text-[#065f46]/80",
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
        {/* Badges Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {techTags.map((tag) => (
              <span
                key={tag}
                className="bg-[#eff6ff] text-[#4338ca] border border-[#dbeafe] rounded-full px-3.5 py-0.5 text-xs font-bold tracking-wide shadow-2xs"
              >
                {tag}
              </span>
            ))}
          </div>

          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/90 rounded-full px-4 py-0.5 text-xs font-extrabold uppercase tracking-wider shadow-2xs">
            {project.difficulty || "BEGINNER"}
          </span>
        </div>

        {/* Title in Running Letters (Handwritten/Cursive Script) */}
        <div className="flex flex-col gap-1">
          <div className="relative inline-block self-start">
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-normal text-[#2563eb] leading-tight tracking-normal select-none"
              style={{ fontFamily: "'Dancing Script', 'Caveat', 'Brush Script MT', cursive" }}
            >
              {project.title.toLowerCase()}
            </h1>
            {/* Curved Blue Underline Accent */}
            <svg className="w-48 sm:w-60 h-3 text-[#2563eb] -mt-1" viewBox="0 0 200 12" fill="none">
              <path
                d="M 5 6 C 60 11, 140 11, 195 4"
                stroke="#2563eb"
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
      <div className="relative overflow-hidden rounded-2xl bg-[#faf5ff] border border-[#e9d5ff] p-5 sm:p-6 shadow-xs">
        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#9333ea]" />
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-full bg-[#9333ea] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <Target className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-black uppercase tracking-wider text-[#581c87]">
              Project Goal & Focus
            </span>
            <p className="text-xs sm:text-sm text-[#581c87]/90 leading-relaxed font-medium">
              "The goal of this project is to teach you how to create a structured, single-page CV
              using only HTML. You will focus on laying out your education, skills, and career
              history in a clean, semantic manner. Styling will be addressed in a later project."
            </p>
          </div>
        </div>
      </div>

      {/* 4. Interactive Live CV Mockup Preview */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Target Visual Layout Specification
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Your HTML webpage output should match the structural hierarchy below:
            </p>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-bold">
            <button
              onClick={() => setPreviewTab("preview")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                previewTab === "preview"
                  ? "bg-white text-slate-900 shadow-2xs font-extrabold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Rendered Preview
            </button>
            <button
              onClick={() => setPreviewTab("specs")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                previewTab === "specs"
                  ? "bg-white text-slate-900 shadow-2xs font-extrabold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Structure Specs
            </button>
          </div>
        </div>

        {/* Browser Mockup Window Container */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
          {/* Browser Window Chrome Topbar */}
          <div className="bg-slate-50/90 border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400 border border-rose-500/20 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500/20 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-500/20 inline-block" />
            </div>

            <div className="flex-1 max-w-sm mx-auto bg-white border border-slate-200/90 rounded-lg px-3 py-1 text-[11px] font-mono text-slate-500 text-center truncate shadow-2xs flex items-center justify-center gap-1.5">
              <Globe className="w-3 h-3 text-slate-400" />
              <span>http://localhost:3000/index.html</span>
            </div>

            <div className="text-[11px] font-semibold text-slate-400 hidden sm:block">
              HTML5 Canvas
            </div>
          </div>

          {/* Canvas Content */}
          <div className="p-6 sm:p-10 bg-gradient-to-b from-slate-50/40 via-white to-white min-h-[460px]">
            {previewTab === "preview" ? (
              <div className="max-w-3xl mx-auto bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-10 shadow-sm flex flex-col gap-6 text-slate-800">
                {/* CV Top Header */}
                <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      Alex Rivera
                    </h3>
                    <p className="text-sm font-bold text-emerald-700">Junior Frontend Developer</p>
                    <p className="text-xs text-slate-500 max-w-md mt-1 leading-relaxed">
                      Passionate and detail-oriented web developer dedicated to building semantic,
                      accessible, and high-performance user interfaces.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>San Francisco, CA 94105</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>(415) 555-0199</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-blue-600 font-medium">alex.rivera@example.com</span>
                    </div>
                  </div>
                </div>

                {/* Technical Skills Section */}
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5" /> Technical Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "HTML5 Semantics",
                      "CSS3 Flexbox & Grid",
                      "JavaScript (ES6+)",
                      "Web Accessibility (WCAG)",
                      "Responsive UI",
                      "Git & GitHub",
                      "SEO Fundamentals",
                      "Lighthouse Auditing",
                    ].map((skill) => (
                      <span
                        key={skill}
                        className="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 transition-colors text-slate-700 text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-200/70"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Experience Timeline Section */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" /> Professional Experience
                  </h4>

                  <div className="flex flex-col gap-4 border-l-2 border-slate-100 pl-4 ml-1">
                    {/* Role 1 */}
                    <div className="flex flex-col gap-1 relative">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 absolute -left-[21px] top-1.5 ring-4 ring-blue-50" />
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900">
                          Frontend Developer Intern — TechFlow Labs
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          Jun 2024 – Present
                        </span>
                      </div>
                      <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside mt-1 leading-relaxed">
                        <li>
                          Refactored 12+ legacy landing pages to 100% semantic HTML5, boosting
                          Lighthouse accessibility scores from 72 to 98.
                        </li>
                        <li>
                          Implemented Open Graph meta tags across blog articles, enhancing social
                          click-through rate by 14%.
                        </li>
                      </ul>
                    </div>

                    {/* Role 2 */}
                    <div className="flex flex-col gap-1 relative">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300 absolute -left-[21px] top-1.5 ring-4 ring-slate-50" />
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900">
                          Web Coordinator — University Coding Club
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          Sep 2023 – May 2024
                        </span>
                      </div>
                      <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside mt-1 leading-relaxed">
                        <li>
                          Maintained club website schedule and workshop announcements for 400+
                          active members.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Education Section */}
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" /> Education
                  </h4>
                  <div className="flex flex-wrap items-center justify-between gap-1 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        B.S. in Computer Science — University of Technology
                      </p>
                      <p className="text-[11px] text-slate-500">Dean's Honor List • GPA 3.85/4.0</p>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">2021 – 2025</span>
                  </div>
                </div>

                {/* Online Profiles Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                  <span className="font-bold text-slate-500">Across the Web:</span>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-slate-700 font-semibold hover:text-blue-600 cursor-pointer">
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                      <span>linkedin.com/in/alexrivera</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-slate-700 font-semibold hover:text-blue-600 cursor-pointer">
                      <LinkIcon className="w-3.5 h-3.5 text-slate-700" />
                      <span>github.com/alexrivera</span>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto bg-slate-900 text-slate-200 rounded-xl p-6 font-mono text-xs leading-relaxed space-y-3 shadow-inner">
                <p className="text-emerald-400 font-bold">// HTML5 Semantic Structure Outline</p>
                <div className="pl-2 border-l border-slate-700 space-y-1 text-slate-300">
                  <p>&lt;!DOCTYPE html&gt;</p>
                  <p>&lt;html lang="en"&gt;</p>
                  <p className="pl-4 text-purple-300">&lt;head&gt; (meta charset, viewport, SEO, OG, favicon, title) &lt;/head&gt;</p>
                  <p className="pl-4 text-sky-300">&lt;body&gt;</p>
                  <p className="pl-8 text-amber-300">&lt;header&gt; (Name, Job Title, Bio & Contact Details) &lt;/header&gt;</p>
                  <p className="pl-8 text-emerald-300">&lt;main&gt;</p>
                  <p className="pl-12 text-slate-400">&lt;section id="skills"&gt; ... &lt;/section&gt;</p>
                  <p className="pl-12 text-slate-400">&lt;section id="experience"&gt; ... &lt;/section&gt;</p>
                  <p className="pl-12 text-slate-400">&lt;section id="education"&gt; ... &lt;/section&gt;</p>
                  <p className="pl-8 text-emerald-300">&lt;/main&gt;</p>
                  <p className="pl-8 text-rose-300">&lt;footer&gt; (Social profiles & copyright) &lt;/footer&gt;</p>
                  <p className="pl-4 text-sky-300">&lt;/body&gt;</p>
                  <p>&lt;/html&gt;</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Key Requirements Grid (Styled with Coordinated Pastel Colors) */}
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
            const Icon = req.icon;
            return (
              <div
                key={req.title}
                className={`${req.cardBg} border rounded-2xl p-5 shadow-xs transition-all flex flex-col gap-2.5`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${req.numberCircle} flex items-center justify-center shrink-0 shadow-xs font-bold text-xs`}>
                    {idx + 1}
                  </div>
                  <h3 className={`text-sm font-bold ${req.textColor}`}>{req.title}</h3>
                </div>
                <p className={`text-xs leading-relaxed font-normal ${req.descColor}`}>
                  {req.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Step-by-Step Task Checklist (Using 4-Color Pastel Theme Matching Image 2) */}
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
              const theme = stepColorThemes[idx % stepColorThemes.length];

              return (
                <motion.div
                  key={task.id}
                  whileHover={{ scale: 1.003 }}
                  onClick={() => toggleTask(task.id)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 shadow-2xs ${
                    isDone
                      ? `${theme.cardBg} ${theme.cardBorderDone} opacity-90`
                      : `${theme.cardBg} ${theme.cardBorder} hover:shadow-xs`
                  }`}
                >
                  {/* Step Number Circle (e.g. 1 Blue, 2 Amber, 3 Purple, 4 Green) */}
                  <div className="mt-0.5 shrink-0 flex items-center justify-center">
                    {isDone ? (
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    ) : (
                      <div
                        className={`w-7 h-7 rounded-full ${theme.numberCircle} flex items-center justify-center font-bold text-xs shadow-xs`}
                      >
                        {idx + 1}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-black uppercase tracking-wider ${theme.stepLabel}`}>
                        Step {idx + 1}
                      </span>
                      {isDone && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${theme.doneBadge}`}>
                          Done
                        </span>
                      )}
                    </div>

                    <h3
                      className={`text-sm font-bold leading-snug ${
                        isDone ? "line-through opacity-70" : theme.titleColor
                      }`}
                    >
                      {task.title}
                    </h3>

                    <p className={`text-xs leading-relaxed ${theme.descColor}`}>
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

      {/* 9. Next Steps / Conclusion Banner */}
      <div className="rounded-2xl bg-slate-900 text-white p-5 sm:p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-white">What's Next?</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
              Completing this semantic HTML project builds the fundamental document hierarchy. Next,
              you will learn CSS Flexbox, Grid, and responsive layout styling to transform this
              document into a modern portfolio!
            </p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer shrink-0"
        >
          <span>View Next Project</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};
