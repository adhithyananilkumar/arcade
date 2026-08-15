"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/shared/design-system/ui/sheet";
import { Button } from "@/shared/design-system/ui/button";
import {
  CheckCircle,
  Circle,
  Code2,
  Clock,
  Users,
  Terminal,
  BookOpen,
  Sparkles,
  Play,
  Share2,
  Check,
  ChevronRight,
  Copy,
  ExternalLink
} from "lucide-react";

export interface ProjectTaskItem {
  id: string;
  phase: string;
  label: string;
  description: string;
  codeSnippet?: string;
}

export interface ProjectDetailData {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  membersCount: string;
  timeAgo: string;
  colorTheme?: string;
  prerequisites?: string[];
  techStack?: string[];
  tasks: ProjectTaskItem[];
  starterCode?: string;
}

interface ProjectDetailDrawerProps {
  project: ProjectDetailData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectDetailDrawer: React.FC<ProjectDetailDrawerProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  if (!project) return null;

  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    [`${project.id}-t1`]: true,
  });
  const [activeTab, setActiveTab] = useState<"plan" | "starter" | "resources">("plan");
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

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl p-0 border-l border-slate-200/80 shadow-2xl flex flex-col bg-slate-50/50"
      >
        {/* Header Section */}
        <div className="bg-white p-6 border-b border-slate-200/80 shrink-0">
          <SheetHeader className="text-left gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 text-[10.5px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                  {project.difficulty}
                </span>
                <span className="bg-slate-100 text-slate-700 text-[10.5px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                  {project.category}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {project.membersCount}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {project.timeAgo}
                </span>
              </div>
            </div>

            <SheetTitle className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
              {project.title}
            </SheetTitle>

            <SheetDescription className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed mt-1">
              {project.description}
            </SheetDescription>

            {/* Tech Stack Pills */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {(project.techStack || ["HTML5", "CSS3", "JavaScript", "Responsive Design"]).map(
                (tech) => (
                  <span
                    key={tech}
                    className="bg-slate-100/80 border border-slate-200/60 text-slate-600 text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-md"
                  >
                    {tech}
                  </span>
                )
              )}
            </div>

            {/* Overall Implementation Progress Bar */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Implementation Progress</span>
                <span className="text-blue-600 font-extrabold">
                  {completedCount} / {totalTasks} Tasks ({progressPercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/60">
                <div
                  className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </SheetHeader>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 border-b border-slate-100 pb-0">
            <button
              onClick={() => setActiveTab("plan")}
              className={`px-4 py-2 text-xs font-black border-b-2 transition-all cursor-pointer ${
                activeTab === "plan"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              📋 Task & Implementation Plan
            </button>

            <button
              onClick={() => setActiveTab("starter")}
              className={`px-4 py-2 text-xs font-black border-b-2 transition-all cursor-pointer ${
                activeTab === "starter"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              💻 Starter Code
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* TAB 1: FULL IMPLEMENTATION PLAN CHECKLIST */}
          {activeTab === "plan" && (
            <div className="flex flex-col gap-5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Step-by-Step Execution Plan
              </h3>

              {project.tasks.map((task, idx) => {
                const isChecked = !!completedTasks[task.id];
                return (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                      isChecked
                        ? "bg-emerald-50/60 border-emerald-200/80 shadow-3xs"
                        : "bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs"
                    }`}
                  >
                    {/* Interactive Square Checkbox */}
                    <div className="mt-0.5">
                      {isChecked ? (
                        <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-md border-2 border-slate-300 bg-white" />
                      )}
                    </div>

                    {/* Task Details */}
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          Phase {idx + 1}: {task.phase}
                        </span>
                        {isChecked && (
                          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Completed
                          </span>
                        )}
                      </div>

                      <h4
                        className={`text-sm font-extrabold leading-snug ${
                          isChecked ? "text-slate-500 line-through" : "text-slate-900"
                        }`}
                      >
                        {task.label}
                      </h4>

                      <p className="text-xs text-slate-600 font-normal leading-relaxed mt-0.5">
                        {task.description}
                      </p>

                      {/* Optional Code Snippet inside task */}
                      {task.codeSnippet && (
                        <div className="mt-2.5 bg-slate-900 text-slate-100 rounded-xl p-3 text-[11px] font-mono overflow-x-auto border border-slate-800">
                          <pre>{task.codeSnippet}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: STARTER CODE */}
          {activeTab === "starter" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Starter Template Code
                </h3>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 bg-slate-900 hover:bg-black text-white text-xs font-extrabold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
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

              <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 text-xs font-mono overflow-x-auto border border-slate-800 shadow-inner">
                <pre>{project.starterCode || `// Starter Code for ${project.title}\n<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>${project.title}</title>\n  <style>\n    body { font-family: system-ui, sans-serif; padding: 2rem; }\n  </style>\n</head>\n<body>\n  <h1>${project.title}</h1>\n  <div id="app"></div>\n</body>\n</html>`}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Bar */}
        <div className="bg-white p-4 border-t border-slate-200/80 shrink-0 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl font-extrabold text-xs cursor-pointer px-4"
          >
            Close
          </Button>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => alert(`Starting interactive lab for ${project.title}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-2 px-5 py-2.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Start Interactive Lab
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
