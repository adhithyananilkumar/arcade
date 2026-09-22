// apps/learner/components/content-overview/contentOverview.types.ts
//
// The contract between the overview hub and whatever kind of content it is showing.
//
// The hub is one component, not one per content type. Courses and events differ in what they are
// made of — modules of lessons versus a run of sessions — but not in what a learner wants from the
// page between enrolling and starting: what is this, what have I done, what is next, and what have
// I written. Those four questions are the model below; an adapter answers them per content type.
//
// Extension is by adapter, never by `if (contentType === …)` inside the hub.

import type { LucideIcon } from 'lucide-react';
import type { NoteContentType } from '@/domains/learning';

export type OverviewContentType = 'COURSE' | 'EVENT';

/** One thing a learner can open: a lesson, an exam, a live session. */
export interface OverviewItem {
  id: string;
  title: string;
  /** Drives the icon and the wording, not the layout. */
  kind: 'LESSON' | 'ASSESSMENT' | 'SESSION' | 'RESOURCE';
  /** Free-text length ("12m", "1h 30m"), or null when the content does not declare one. */
  durationLabel?: string | null;
  completed: boolean;
  /**
   * Not openable yet — a session before it starts, a lesson behind an unmet prerequisite. The
   * backend owns the rule; this is the rendering hint it produced.
   */
  locked?: boolean;
  /** Where "open this" goes. Null when the item is not openable at all. */
  href: string | null;
  /** Position within the whole content, flattened across sections — the notes' anchor order. */
  order: number;
}

/** A module, a day, a track — whatever the content type groups its items into. */
export interface OverviewSection {
  id: string;
  title: string;
  items: OverviewItem[];
}

export interface OverviewPerson {
  name: string;
  avatarUrl?: string | null;
  headline?: string | null;
  bio?: string | null;
  href?: string | null;
}

/** One row of the "Series Info"-style fact list in the right rail. */
export interface OverviewFact {
  icon: LucideIcon;
  label: string;
  value: string;
}

export interface OverviewProgress {
  /** 0-100, or null when the content type has no notion of percent complete (most events). */
  percent: number | null;
  completedItems: number;
  totalItems: number;
  state: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}

/** The single most important control on the page: the one thing to do next. */
export interface OverviewResume {
  /** "Start the first lesson", "Resume: Rebasing", "Join the live session". */
  label: string;
  itemTitle?: string | null;
  href: string;
}

export interface ContentOverviewModel {
  contentType: OverviewContentType;
  contentId: string;
  /** The segment the notes API is addressed by — keeps notes working for any content type. */
  noteContentType: NoteContentType;

  title: string;
  subtitle?: string | null;
  description?: string | null;
  coverImageUrl?: string | null;
  /** "What you'll walk away with", already split into bullets. */
  outcomes: string[];

  channel?: { name: string; avatarUrl?: string | null; href?: string | null } | null;
  people: OverviewPerson[];
  facts: OverviewFact[];

  progress: OverviewProgress;
  resume: OverviewResume | null;
  sections: OverviewSection[];

  /** Where the overview hub for this content lives. */
  overviewHref: string;
  /** Where the full notes workspace for this content lives. */
  notesHref: string;
  /** Where the public landing page for this content lives, for the breadcrumb. */
  landingHref: string;

  isLoading: boolean;
  /** Non-null when the content itself could not be loaded — the hub renders this, not a blank page. */
  error: string | null;
  /** False when the viewer turns out not to hold an entitlement, so the hub can send them back. */
  isEntitled: boolean;
}
