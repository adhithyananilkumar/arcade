"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Code2,
  Check,
  Copy,
  Layers,
  Sparkles,
  ExternalLink,
  BookOpen
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

  // Tech tags list
  const techTags = ["HTML", "Semantic HTML", "Layout", "SEO"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-5xl mx-auto px-4 sm:px-8 pt-2 pb-28 pointer-events-auto flex flex-col gap-6 text-left select-none relative z-10"
    >
      {/* 1. Top Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <button
          onClick={onBack}
          className="hover:text-blue-600 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Projects</span>
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-extrabold truncate">{project.title}</span>
      </div>

      {/* Main Single-Page Project Document Container */}
      <div className="w-full flex flex-col gap-8 bg-transparent">
        
        {/* 2. Tag Badges Bar (Tech Stack + Difficulty) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {techTags.map((tag) => (
              <span
                key={tag}
                className="bg-emerald-50 text-emerald-700 border border-emerald-200/90 rounded-md px-2.5 py-0.5 text-xs font-extrabold tracking-wide"
              >
                {tag}
              </span>
            ))}
          </div>

          <span className="bg-amber-50 text-amber-800 border border-amber-200/90 rounded-md px-3 py-0.5 text-xs font-black uppercase tracking-wider">
            {project.difficulty || "Beginner"}
          </span>
        </div>

        {/* 3. Document Title & Subtitle */}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {project.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            {project.overview || project.description}
          </p>
        </div>

        {/* 4. Goal Callout Banner */}
        <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-5 text-sm text-purple-950 italic font-medium leading-relaxed shadow-2xs">
          "The goal of this project is to teach you how to create a structured, single-page CV using only HTML. You will focus on laying out your education, skills, and career history in a clean, semantic manner. Styling will be addressed in a later project."
        </div>

        {/* 5. Project Description & Visual Mockup Preview Box */}
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-700 leading-relaxed font-normal">
            In this project, you are required to create a single-page CV (Curriculum Vitae) using only HTML. Your webpage should look like the following image:
          </p>

          {/* Visual Mockup Preview Box */}
          <div className="border-2 border-slate-300/90 rounded-2xl p-6 sm:p-8 bg-white shadow-xs flex flex-col gap-5 text-left text-xs font-sans text-slate-800">
            {/* Top Divider */}
            <div className="w-full border-t-2 border-slate-400 my-1" />

            {/* Header Bio */}
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Name</h2>
              <p className="text-sm font-bold text-emerald-700 mt-0.5">Junior Frontend Developer</p>
              <div className="text-slate-600 text-xs mt-2 leading-relaxed font-medium">
                <p>123 Your Street</p>
                <p>Your City, ST 12345</p>
                <p>(123) 456-7890</p>
                <p className="text-slate-500">no_reply@example.com</p>
              </div>
            </div>

            {/* Skills */}
            <div className="flex flex-col gap-1">
              <h3 className="text-xs font-black text-emerald-700 uppercase tracking-wider">Skills</h3>
              <p className="text-slate-700 font-medium">
                HTML, CSS, JavaScript, Accessibility, Figma to Design, Responsive Web Design, Technical Writing, Presentation
              </p>
            </div>

            {/* Education */}
            <div className="flex flex-col gap-1">
              <h3 className="text-xs font-black text-emerald-700 uppercase tracking-wider">Education</h3>
              <p className="text-blue-600 font-bold">School Name, Location - Degree</p>
              <p className="text-slate-400 text-[11px]">Month 20xx to Month 20xx</p>
              <p className="text-slate-600 font-medium">List of exciting things you did at university</p>
            </div>

            {/* Experience */}
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-black text-emerald-700 uppercase tracking-wider">Experience</h3>

              <div>
                <p className="text-blue-600 font-bold">Company Name, Location - Job Title</p>
                <p className="text-slate-400 text-[11px]">Month 20xx to Month 20xx</p>
                <ul className="list-disc list-inside text-slate-600 font-medium space-y-0.5 mt-1">
                  <li>List of achievements</li>
                  <li>List of achievements</li>
                  <li>List of achievements</li>
                </ul>
                <p className="text-slate-700 font-bold mt-1 text-[11px]">Skills: List of skills used or gained at this company</p>
              </div>

              <div className="mt-2">
                <p className="text-blue-600 font-bold">Company Name, Location - Job Title</p>
                <p className="text-slate-400 text-[11px]">Month 20xx to Month 20xx</p>
                <ul className="list-disc list-inside text-slate-600 font-medium space-y-0.5 mt-1">
                  <li>List of achievements</li>
                  <li>List of achievements</li>
                  <li>List of achievements</li>
                </ul>
                <p className="text-slate-700 font-bold mt-1 text-[11px]">Skills: List of skills used or gained at this company</p>
              </div>
            </div>

            {/* Across the Internet */}
            <div className="flex flex-col gap-1">
              <h3 className="text-xs font-black text-emerald-700 uppercase tracking-wider">Across the Internet</h3>
              <p className="text-slate-700 font-medium">Add your LinkedIn, GitHub profile links</p>
            </div>
          </div>
        </div>

        {/* 6. Key Requirements Section */}
        <div className="flex flex-col gap-3 pt-2">
          <h2 className="text-base font-black text-slate-900 tracking-tight">
            Key requirements for this project:
          </h2>

          <ul className="flex flex-col gap-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
            <li className="flex items-start gap-2">
              <span className="text-slate-400 font-black">•</span>
              <span><strong className="text-slate-900 font-extrabold">Semantic HTML:</strong> Use appropriate HTML tags to structure your CV.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400 font-black">•</span>
              <span><strong className="text-slate-900 font-extrabold">SEO Meta Tags:</strong> Include essential meta tags for SEO.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400 font-black">•</span>
              <span><strong className="text-slate-900 font-extrabold">Open Graph (OG) Tags:</strong> Add OG tags for better social media sharing.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400 font-black">•</span>
              <span><strong className="text-slate-900 font-extrabold">Favicon:</strong> Add a favicon for your CV page.</span>
            </li>
          </ul>

          <p className="text-xs text-slate-500 italic mt-1">
            The structure of your CV should be easily understandable and ready for styling in a future project.
          </p>
        </div>

        {/* 7. Interactive Step-by-Step Task Checklist */}
        {project.tasks && project.tasks.length > 0 && (
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Step-by-Step Implementation Checklist:
              </h2>
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                {completedCount} / {totalTasks} Done ({progressPercent}%)
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {project.tasks.map((task, idx) => {
                const isDone = !!completedTasks[task.id];
                return (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isDone
                        ? "bg-emerald-50/60 border-emerald-200/90 shadow-2xs"
                        : "bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isDone ? (
                        <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-md border-2 border-slate-300 bg-white" />
                      )}
                    </div>

                    <div className="flex-1 flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Step {idx + 1}
                        </span>
                        {isDone && (
                          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded-full">
                            Completed
                          </span>
                        )}
                      </div>

                      <h3
                        className={`text-xs sm:text-sm font-extrabold leading-snug ${
                          isDone ? "text-slate-400 line-through" : "text-slate-900"
                        }`}
                      >
                        {task.title}
                      </h3>

                      <p className="text-xs text-slate-500 font-normal leading-relaxed mt-0.5">
                        {task.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 8. Submission Checklist Section */}
        <div className="flex flex-col gap-3 pt-2">
          <h2 className="text-base font-black text-slate-900 tracking-tight">
            Submission Checklist:
          </h2>

          <ul className="flex flex-col gap-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
            {[
              "Semantically correct HTML structure.",
              "Single-page layout with sections for education, skills, and career history.",
              "SEO meta tags in the head section.",
              "OG tags for better social media sharing.",
              "A favicon linked in the head section.",
            ].map((checkItem, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-slate-400 font-black">•</span>
                <span>{checkItem}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 9. Starter Code Setup */}
        {project.starterCode && (
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Code2 className="w-4 h-4 text-purple-600" /> Starter Code Boilerplate
              </h2>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-black text-white text-xs font-extrabold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Code
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 sm:p-5 text-xs font-mono overflow-x-auto border border-slate-800 shadow-inner">
              <pre>{project.starterCode}</pre>
            </div>
          </div>
        )}

        {/* 10. Conclusion & Learning Outcome Summary */}
        <div className="pt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
          By completing this project, you'll gain a solid understanding of how to create a single-page CV using HTML, apply basic SEO principles, and prepare your webpage for future styling. This foundation will enable you to move on to styling the CV using CSS in subsequent projects.
        </div>

      </div>
    </motion.div>
  );
};

