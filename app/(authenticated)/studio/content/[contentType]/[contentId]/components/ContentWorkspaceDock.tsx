"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Send,
  GraduationCap,
  FileText,
  MessageSquare,
  Award,
  BookOpen,
  LayoutDashboard,
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/shared/design-system/ui/tooltip";
import type { CapabilityGroup } from "../lib/capabilities";
import type { OverviewTab } from "./ContentOverviewNav";

export type SubTabType = "overview" | "learners" | "exams" | "feedback" | "certificates" | "curriculum";

interface SectionDockItem {
  id: SubTabType;
  label: string;
  icon: typeof GraduationCap;
}

const SECTION_ITEMS: SectionDockItem[] = [
  { id: "overview", label: "Course Overview & Management", icon: LayoutDashboard },
  { id: "learners", label: "Enrolled Students", icon: GraduationCap },
  { id: "exams", label: "Assessment & Exams", icon: FileText },
  { id: "feedback", label: "Reviews & Feedbacks", icon: MessageSquare },
  { id: "certificates", label: "Certificate Recipients", icon: Award },
  { id: "curriculum", label: "Syllabus & Resources", icon: BookOpen },
];

export function ContentWorkspaceDock({
  groups,
  activeTab,
  onChange,
  activeSubTab,
  onSubTabChange,
}: {
  groups: CapabilityGroup[];
  activeTab: OverviewTab;
  onChange: (tab: OverviewTab) => void;
  activeSubTab?: SubTabType;
  onSubTabChange?: (subTab: SubTabType) => void;
}) {
  const router = useRouter();

  const hasPeople = groups.includes("people");
  const hasPublishing = groups.includes("publishing");

  return (
    <motion.nav
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", bounce: 0.3, duration: 0.8 }}
      aria-label="Content workspace navigation"
      className="fixed bottom-6 left-1/2 z-50 flex max-w-[95vw] -translate-x-1/2 items-center gap-1.5 overflow-x-auto rounded-full border border-slate-200/80 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 p-2 shadow-[0_16px_40px_rgba(20,20,43,0.15)] backdrop-blur-xl ring-1 ring-black/[0.04] scrollbar-none"
    >
      {/* 1. Back to Studio */}
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              onClick={() => router.push("/studio")}
              aria-label="Back to Content Studio"
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-slate-500 dark:text-neutral-400 transition-all duration-300 hover:bg-slate-100/90 dark:hover:bg-neutral-800 hover:text-[#14142b] dark:hover:text-white cursor-pointer"
            >
              <ArrowLeft size={19} />
            </button>
          }
        />
        <TooltipContent side="top" sideOffset={8} className="bg-white dark:bg-neutral-900 text-slate-800 dark:text-neutral-100 border border-slate-200 dark:border-neutral-800 shadow-xl font-bold text-xs px-3.5 py-2 rounded-2xl [&_.fill-foreground]:hidden">
          Content Studio
        </TooltipContent>
      </Tooltip>

      {/* 2. Section Sub-Tabs (Enrolled Students, Assessment & Exams, Reviews & Feedbacks, Certificates, Syllabus) */}
      {SECTION_ITEMS.map((item) => {
        const Icon = item.icon;
        const isSelected = (activeTab === "OVERVIEW" || activeTab === "analytics") && activeSubTab === item.id;
        return (
          <Tooltip key={item.id}>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={() => {
                    onSubTabChange?.(item.id);
                    if (activeTab !== "OVERVIEW" && activeTab !== "analytics") {
                      onChange("OVERVIEW");
                    }
                  }}
                  aria-label={item.label}
                  aria-current={isSelected ? "page" : undefined}
                  className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors duration-200 cursor-pointer ${
                    isSelected
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50/90 dark:bg-blue-950/50 font-bold"
                      : "text-slate-500 dark:text-neutral-400 hover:bg-slate-100/90 dark:hover:bg-neutral-800 hover:text-[#14142b] dark:hover:text-white"
                  }`}
                >
                  <Icon size={19} className={isSelected ? "scale-105" : "transition-transform"} />
                </button>
              }
            />
            <TooltipContent side="top" sideOffset={8} className="bg-white dark:bg-neutral-900 text-slate-800 dark:text-neutral-100 border border-slate-200 dark:border-neutral-800 shadow-xl font-bold text-xs px-3.5 py-2 rounded-2xl [&_.fill-foreground]:hidden">
              {item.label}
            </TooltipContent>
          </Tooltip>
        );
      })}

      {/* 3. People / Collaborators at the end */}
      {hasPeople && (
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={() => onChange("people")}
                aria-label="People"
                aria-current={activeTab === "people" ? "page" : undefined}
                className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors duration-200 cursor-pointer ${
                  activeTab === "people"
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50/90 dark:bg-blue-950/50 font-bold"
                    : "text-slate-500 dark:text-neutral-400 hover:bg-slate-100/90 dark:hover:bg-neutral-800 hover:text-[#14142b] dark:hover:text-white"
                }`}
              >
                <Users size={19} className={activeTab === "people" ? "scale-105" : "transition-transform"} />
              </button>
            }
          />
          <TooltipContent side="top" sideOffset={8} className="bg-white dark:bg-neutral-900 text-slate-800 dark:text-neutral-100 border border-slate-200 dark:border-neutral-800 shadow-xl font-bold text-xs px-3.5 py-2 rounded-2xl [&_.fill-foreground]:hidden">
            People
          </TooltipContent>
        </Tooltip>
      )}

      {/* 4. Publishing at the end */}
      {hasPublishing && (
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={() => onChange("publishing")}
                aria-label="Publishing"
                aria-current={activeTab === "publishing" ? "page" : undefined}
                className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors duration-200 cursor-pointer ${
                  activeTab === "publishing"
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50/90 dark:bg-blue-950/50 font-bold"
                    : "text-slate-500 dark:text-neutral-400 hover:bg-slate-100/90 dark:hover:bg-neutral-800 hover:text-[#14142b] dark:hover:text-white"
                }`}
              >
                <Send size={19} className={activeTab === "publishing" ? "scale-105" : "transition-transform"} />
              </button>
            }
          />
          <TooltipContent side="top" sideOffset={8} className="bg-white dark:bg-neutral-900 text-slate-800 dark:text-neutral-100 border border-slate-200 dark:border-neutral-800 shadow-xl font-bold text-xs px-3.5 py-2 rounded-2xl [&_.fill-foreground]:hidden">
            Publishing
          </TooltipContent>
        </Tooltip>
      )}
    </motion.nav>
  );
}
