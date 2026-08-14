"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, LayoutGrid, BarChart3, Users, UsersRound, Tag, Send, Activity } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/shared/design-system/ui/tooltip";
import type { CapabilityGroup } from "../lib/capabilities";
import { GROUP_LABEL } from "../lib/capabilities";
import type { OverviewTab } from "./ContentOverviewNav";

const GROUP_ICON: Record<CapabilityGroup, typeof BarChart3> = {
  analytics: BarChart3,
  people: Users,
  members: UsersRound,
  pricing: Tag,
  publishing: Send,
  more: Activity,
};

// Page-local floating dock, same visual pattern as the channel management
// dock (fixed pill, bottom-center) — its icon set is generated from this
// specific content item's own capability groups, not the global app dock.
export function ContentWorkspaceDock({
  groups,
  activeTab,
  onChange,
}: {
  groups: CapabilityGroup[];
  activeTab: OverviewTab;
  onChange: (tab: OverviewTab) => void;
}) {
  const router = useRouter();
  const items: { id: OverviewTab; label: string; icon: typeof BarChart3 }[] = [
    { id: "OVERVIEW", label: "Overview", icon: LayoutGrid },
    ...groups.map((g) => ({ id: g, label: GROUP_LABEL[g], icon: GROUP_ICON[g] })),
  ];

  return (
    <motion.nav
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", bounce: 0.3, duration: 0.8 }}
      aria-label="Content workspace navigation"
      className="fixed bottom-6 left-1/2 z-50 flex max-w-[95vw] -translate-x-1/2 items-center gap-1.5 overflow-x-auto rounded-full border border-slate-200/80 bg-white/90 p-2 shadow-[0_16px_40px_rgba(20,20,43,0.15)] ring-1 ring-black/[0.04] backdrop-blur-xl scrollbar-none"
    >
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              onClick={() => router.push("/studio")}
              aria-label="Back to Content Studio"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-slate-500 transition-colors duration-300 hover:bg-slate-100/90 hover:text-[#14142b]"
            >
              <ArrowLeft size={19} />
            </button>
          }
        />
        <TooltipContent side="top" sideOffset={8}>
          Content Studio
        </TooltipContent>
      </Tooltip>

      <div className="mx-1 h-6 w-px shrink-0 bg-slate-200" />

      {items.map((item) => {
        const Icon = item.icon;
        const active = activeTab === item.id;
        return (
          <Tooltip key={item.id}>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={() => onChange(item.id)}
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors duration-300 ${
                    active ? "text-indigo-600" : "text-slate-500 hover:bg-slate-100/90 hover:text-[#14142b]"
                  }`}
                >
                  <Icon size={19} strokeWidth={active ? 2.3 : 1.8} />
                </button>
              }
            />
            <TooltipContent side="top" sideOffset={8}>
              {item.label}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </motion.nav>
  );
}
