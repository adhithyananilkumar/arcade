import type { LucideIcon } from "lucide-react";
import {
  Award,
  BarChart3,
  CalendarClock,
  ClipboardList,
  FileText,
  Gavel,
  Inbox,
  Lightbulb,
  Medal,
  Rocket,
  Scale,
  Tag,
  Trophy,
  UserCog,
  Users,
  UsersRound,
} from "lucide-react";
import type { ContentTypeSegment } from "./contentTypeRouting";

/**
 * A main dashboard tab's own features, as sub-pages in a sidebar beside the tab body. The
 * horizontal tab bar stays the main navigation; a tab with more than one feature splits them here
 * so each gets a page of its own instead of one long scroll. Sub-page ids are the `?page=` values.
 *
 * `chip` is the icon colour for a group, in the same pastel family Settings uses.
 */
export interface SubPage {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface SubPageGroup {
  title?: string;
  chip: string;
  pages: SubPage[];
}

const CHIP = {
  sky: "bg-[#bae6fd] text-[#0c4a6e] dark:bg-[#bae6fd]/15 dark:text-[#85bfe9]",
  green: "bg-[#bbf7d0] text-[#14532d] dark:bg-[#bbf7d0]/15 dark:text-[#8bc89c]",
  yellow: "bg-[#fef08a] text-[#854d0e] dark:bg-[#fef08a]/15 dark:text-[#e7a871]",
  violet: "bg-[#e9d5ff] text-[#4c1d95] dark:bg-[#e9d5ff]/15 dark:text-[#bda1ff]",
  orange: "bg-[#fed7aa] text-[#7c2d12] dark:bg-[#fed7aa]/15 dark:text-[#f79d80]",
  pink: "bg-[#fbcfe8] text-[#831843] dark:bg-[#fbcfe8]/15 dark:text-[#f0a3c8]",
};

/** The sub-pages of one main tab, or an empty list when the tab is a single feature. */
export function subPagesFor(
  segment: ContentTypeSegment,
  tab: string,
  opts: { hasCompetition?: boolean } = {},
): SubPageGroup[] {
  if (segment !== "event") return [];
  switch (tab) {
    case "settings":
      return [
        {
          chip: CHIP.sky,
          pages: [
            { id: "details", label: "Event details", icon: FileText },
            { id: "schedule", label: "Schedule", icon: CalendarClock },
            { id: "badge", label: "Completion badge", icon: Award },
          ],
        },
      ];
    case "pricing":
      return [
        {
          chip: CHIP.yellow,
          pages: [
            { id: "pricing", label: "Pricing & seats", icon: Tag },
            { id: "analytics", label: "Revenue & analytics", icon: BarChart3 },
          ],
        },
      ];
    case "participants":
      return [
        {
          chip: CHIP.green,
          pages: [
            { id: "members", label: "Registrations", icon: Users },
            { id: "collaborators", label: "Collaborators", icon: UserCog },
          ],
        },
      ];
    case "team":
      // Until the competition exists the tab is one page: the switch that creates it.
      if (!opts.hasCompetition) return [];
      return [
        {
          title: "Set up",
          chip: CHIP.violet,
          pages: [
            { id: "setup", label: "Setup & timeline", icon: Rocket },
            { id: "form", label: "Submission form", icon: ClipboardList },
            { id: "tracks", label: "Tracks", icon: Lightbulb },
            { id: "rubric", label: "Judging rubric", icon: Scale },
            { id: "prizes", label: "Prizes", icon: Trophy },
          ],
        },
        {
          title: "People",
          chip: CHIP.green,
          pages: [
            { id: "teams", label: "Teams", icon: UsersRound },
            { id: "judges", label: "Judges", icon: Gavel },
          ],
        },
        {
          title: "Judging",
          chip: CHIP.pink,
          pages: [
            { id: "submissions", label: "Submissions", icon: Inbox },
            { id: "results", label: "Leaderboard & results", icon: Medal },
          ],
        },
      ];
    default:
      return [];
  }
}

/** Older `?tab=` values that now name a main tab plus one of its pages. */
export const LEGACY_TAB_PAGES: Record<string, { tab: string; page?: string }> = {
  hackathon: { tab: "team" },
  judging: { tab: "team", page: "submissions" },
  judges: { tab: "team", page: "judges" },
  "team-setup": { tab: "team", page: "setup" },
  "team-form": { tab: "team", page: "form" },
  "team-tracks": { tab: "team", page: "tracks" },
  "team-rubric": { tab: "team", page: "rubric" },
  "team-prizes": { tab: "team", page: "prizes" },
  "team-teams": { tab: "team", page: "teams" },
  "team-submissions": { tab: "team", page: "submissions" },
  "team-judges": { tab: "team", page: "judges" },
  "team-results": { tab: "team", page: "results" },
  collaborators: { tab: "participants", page: "collaborators" },
};
