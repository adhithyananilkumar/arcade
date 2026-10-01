'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Profiles
 *
 * Purpose:
 * The panels a profile page is assembled from: links, achievements,
 * organizations, people, the learning heatmap, and the content library.
 * Person and organization pages use the same panels, so both read as one
 * system.
 *
 * Rules:
 * - Pure. Data arrives via props; only local presentation state (search
 *   text, expanded lists, a hovered heatmap cell) lives here. Links are
 *   built from what the payload carries, never guessed from a name.
 * - The backend decides what is public. A panel whose data is absent is
 *   not rendered by the caller; nothing here filters private state.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Award,
  BookOpen,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Flame,
  Globe,
  Search,
  Sparkles,
  Trophy,
  User as UserIcon,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { BadgeRow } from '@/domains/recognition';
import { CredentialBadge, type IssuedBadge } from '@/domains/credentials';
import { getAvatarUrl } from '@/shared/utils/avatar';
import { ContentCard, ProfileEmptyState } from './ProfileCards';
import type {
  ChannelContentItem,
  ChannelMember,
  ProfileCertificate,
  ProfileChannel,
  ProfileCourse,
  ProfileWorkshop,
  PublicActivity,
} from '../types/profile.types';

const SURFACE =
  'rounded-2xl border border-slate-200/70 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900';

// ---------------------------------------------------------------------------
// Panel shell
// ---------------------------------------------------------------------------

function Panel({
  icon: Icon,
  iconClass,
  title,
  count,
  action,
  children,
}: {
  icon: LucideIcon;
  iconClass: string;
  title: string;
  count?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className={`${SURFACE} p-5`}>
      <div className="mb-3.5 flex items-center justify-between">
        <h3 className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <Icon size={16} className={iconClass} />
          <span>{title}</span>
          {!!count && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {count}
            </span>
          )}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function Muted({ children }: { children: React.ReactNode }) {
  return (
    <p className="py-2 text-xs italic text-slate-400 dark:text-slate-500">{children}</p>
  );
}

function ViewAll({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="text-xs font-semibold text-slate-500 hover:underline dark:text-slate-400"
    >
      View all
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Links
// ---------------------------------------------------------------------------

function linkIcon(url: string): React.ReactNode {
  if (/linkedin\.com/i.test(url)) return <FaLinkedin size={15} className="shrink-0 text-slate-500" />;
  if (/github\.com/i.test(url)) return <FaGithub size={15} className="shrink-0 text-slate-500" />;
  return <Globe size={15} className="shrink-0 text-slate-500" />;
}

/** Social and web links. Renders nothing when there are none, rather than an empty card. */
export function LinksPanel({ links }: { links: (string | null | undefined)[] }) {
  const unique = Array.from(new Set(links.filter((l): l is string => !!l && !!l.trim())));
  if (unique.length === 0) return null;

  return (
    <section className={`${SURFACE} space-y-3 p-5`}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Social & Web</h3>
      <div className="space-y-2 text-xs font-semibold">
        {unique.map((url) => (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:text-white"
          >
            {linkIcon(url)}
            <span className="truncate">{url.replace(/^https?:\/\//, '')}</span>
            <ExternalLink size={12} className="ml-auto shrink-0 text-slate-400" />
          </a>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Achievements (learner)
// ---------------------------------------------------------------------------

export interface AchievementsPanelProps {
  badges: IssuedBadge[];
  certificates: ProfileCertificate[];
  /** The owner's own achievements page; omitted for visitors. */
  viewAllHref?: string;
}

export function AchievementsPanel({ badges, certificates, viewAllHref }: AchievementsPanelProps) {
  return (
    <Panel
      icon={Trophy}
      iconClass="text-amber-500"
      title="Achievements"
      count={badges.length + certificates.length}
      action={viewAllHref ? <ViewAll href={viewAllHref} /> : undefined}
    >
      {badges.length === 0 && certificates.length === 0 ? (
        <Muted>No achievements unlocked yet.</Muted>
      ) : (
        <div className="space-y-4">
          {badges.length > 0 && (
            <div className="flex flex-wrap items-center gap-4 pt-1">
              {badges.slice(0, 6).map((badge) => (
                <Link
                  key={badge.credentialCode}
                  href={`/credentials/${encodeURIComponent(badge.credentialCode)}`}
                  className="transition-transform hover:scale-105"
                  title={`${badge.name} (${badge.badgeClass.tier.label})`}
                >
                  <CredentialBadge
                    family={badge.badgeClass.family.key}
                    level={badge.badgeClass.tier.level}
                    title={badge.name}
                    className="h-16 w-16"
                  />
                </Link>
              ))}
            </div>
          )}

          {certificates.length > 0 && (
            <div className="space-y-2">
              {certificates.slice(0, 3).map((certificate, index) => {
                const body = (
                  <>
                    <Award size={15} className="shrink-0 text-amber-500" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                        {certificate.name}
                      </span>
                      {certificate.issuer && (
                        <span className="block truncate text-[10px] font-medium text-slate-400">
                          {certificate.issuer}
                        </span>
                      )}
                    </span>
                  </>
                );
                const className =
                  'flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 dark:border-slate-800/80 dark:bg-slate-800/40';
                return certificate.idCode ? (
                  <Link
                    key={certificate.idCode}
                    href={`/credentials/${encodeURIComponent(certificate.idCode)}`}
                    className={`${className} transition-colors hover:bg-slate-100 dark:hover:bg-slate-800`}
                  >
                    {body}
                  </Link>
                ) : (
                  <div key={index} className={className}>
                    {body}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Organizations
// ---------------------------------------------------------------------------

/**
 * The organization channels a person belongs to. Personal channels are not listed: a personal
 * channel's page is this profile, so linking to it would link to the page the visitor is on.
 */
export function OrganizationsPanel({
  channels,
  viewAllHref,
}: {
  channels: ProfileChannel[];
  viewAllHref?: string;
}) {
  const organizations = channels.filter((channel) => !channel.personal);

  return (
    <Panel
      icon={Building2}
      iconClass="text-slate-600 dark:text-slate-300"
      title="Organizations"
      count={organizations.length}
      action={viewAllHref ? <ViewAll href={viewAllHref} /> : undefined}
    >
      {organizations.length === 0 ? (
        <Muted>No organizations joined yet.</Muted>
      ) : (
        <div className="space-y-2">
          {organizations.map((channel) => (
            <Link
              key={channel.id}
              // An organization that has not claimed a handle is still reachable by id; that
              // route resolves to the same profile view.
              href={channel.handle ? `/${channel.handle}` : `/channels/${channel.id}`}
              className="group flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 shadow-2xs transition-all hover:bg-slate-100 dark:border-slate-800/80 dark:bg-slate-800/40 dark:hover:bg-slate-800"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200/60 bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {channel.iconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={getAvatarUrl(channel.iconUrl)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Building2 size={15} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="flex items-center gap-1 truncate text-xs font-bold text-slate-800 transition-colors group-hover:text-indigo-600 dark:text-slate-200">
                    <span className="truncate">{channel.name}</span>
                    <BadgeRow badges={channel.badges} size={13} max={1} />
                  </p>
                  <p className="text-[10px] font-medium text-slate-400">{channel.role}</p>
                </div>
              </div>
              <ExternalLink
                size={12}
                className="shrink-0 text-slate-400 opacity-0 transition-opacity group-hover:text-indigo-600 group-hover:opacity-100"
              />
            </Link>
          ))}
        </div>
      )}
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// People (organization)
// ---------------------------------------------------------------------------

export function PeoplePanel({ members }: { members: ChannelMember[] }) {
  return (
    <Panel icon={Users} iconClass="text-slate-600 dark:text-slate-300" title="People" count={members.length}>
      {members.length === 0 ? (
        <Muted>No public members yet.</Muted>
      ) : (
        <div className="space-y-2">
          {members.map((member) => {
            const body = (
              <>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200/60 bg-white dark:bg-slate-800">
                  {member.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getAvatarUrl(member.avatarUrl)}
                      alt=""
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <UserIcon size={14} className="text-slate-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="flex items-center gap-1 truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span className="truncate">{member.name}</span>
                    <BadgeRow badges={member.badges} size={13} max={1} />
                  </p>
                  <p
                    className={`text-[10px] font-medium ${
                      member.owner ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'
                    }`}
                  >
                    {member.role}
                    {member.handle ? ` · @${member.handle}` : ''}
                  </p>
                </div>
              </>
            );
            const className =
              'flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 dark:border-slate-800/80 dark:bg-slate-800/40';
            return member.handle ? (
              <Link
                key={member.userId}
                href={`/${member.handle}`}
                className={`${className} transition-colors hover:bg-slate-100 dark:hover:bg-slate-800`}
              >
                {body}
              </Link>
            ) : (
              <div key={member.userId} className={className}>
                {body}
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Stat footer (shared by the heatmap and the about panel)
// ---------------------------------------------------------------------------

export interface PanelStat {
  label: string;
  value: number;
}

function StatFooter({ stats }: { stats: PanelStat[] }) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-slate-100 pt-4 text-xs dark:border-slate-800/80">
      {stats.map((stat) => (
        <div key={stat.label}>
          <span className="font-medium text-slate-400">{stat.label}:</span>{' '}
          <strong className="font-bold text-slate-900 dark:text-white">{stat.value}</strong>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Learning heatmap (learner)
// ---------------------------------------------------------------------------

const LEVEL_CLASS = [
  'bg-slate-100 dark:bg-slate-800',
  'bg-teal-200 dark:bg-teal-900/60',
  'bg-teal-400 dark:bg-teal-600',
  'bg-teal-600 dark:bg-teal-500',
];

/** Local-calendar yyyy-mm-dd, matching the backend's dates (already in the learner's zone). */
function isoDate(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

export function ActivityPanel({
  activity,
  stats,
}: {
  activity: PublicActivity;
  stats: PanelStat[];
}) {
  const [hovered, setHovered] = useState<{ count: number; label: string; x: number; y: number } | null>(
    null,
  );

  const { weeks, months } = useMemo(() => {
    const byDate = new Map(activity.days.map((day) => [day.date, day]));
    const jan1 = new Date(activity.year, 0, 1);
    const start = new Date(jan1);
    start.setDate(jan1.getDate() - jan1.getDay());
    const dec31 = new Date(activity.year, 11, 31);
    const end = new Date(dec31);
    end.setDate(dec31.getDate() + (6 - dec31.getDay()));
    const total = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;

    const grid: { key: string; label: string; count: number; level: number; inYear: boolean }[][] = [];
    const headers: { name: string; col: number }[] = [];
    let lastMonth = -1;

    for (let w = 0; w < Math.ceil(total / 7); w++) {
      const week = [];
      for (let r = 0; r < 7; r++) {
        const date = new Date(start);
        date.setDate(start.getDate() + w * 7 + r);
        const inYear = date.getFullYear() === activity.year;
        if (inYear && date.getMonth() !== lastMonth) {
          headers.push({ name: date.toLocaleDateString(undefined, { month: 'short' }), col: w });
          lastMonth = date.getMonth();
        }
        const key = isoDate(date);
        const day = byDate.get(key);
        week.push({
          key,
          label: date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
          count: day?.activityCount ?? 0,
          level: day?.intensity ?? 0,
          inYear,
        });
      }
      grid.push(week);
    }
    return { weeks: grid, months: headers };
  }, [activity]);

  return (
    <section className={`${SURFACE} flex h-full flex-col justify-between p-6`}>
      <div>
        <div className="mb-5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {activity.year} Learning Activity
            </h3>
          </div>
          {activity.currentStreak > 0 && (
            <span className="rounded-full border border-amber-200/60 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              {activity.currentStreak} day streak
            </span>
          )}
        </div>

        <div className="flex items-start gap-3">
          <div className="hidden shrink-0 select-none grid-rows-7 gap-[3px] pt-[22px] text-[9px] font-bold text-slate-400 sm:grid">
            {['Sun', '', 'Wed', '', 'Fri', '', ''].map((label, i) => (
              <div key={i} className="flex h-[11px] items-center">
                {label}
              </div>
            ))}
          </div>

          <div className="flex-grow overflow-x-auto pb-1 scrollbar-none">
            <div className="w-fit">
              <div className="relative mb-2 h-3.5 select-none text-[9px] font-bold text-slate-400">
                {months.map((month) => (
                  <span
                    key={`${month.name}-${month.col}`}
                    className="absolute"
                    style={{ left: `calc(${month.col} * (100% / ${weeks.length}))` }}
                  >
                    {month.name}
                  </span>
                ))}
              </div>
              <div className="grid grid-flow-col grid-rows-7 gap-[3px]">
                {weeks.map((week) =>
                  week.map((cell) => (
                    <div
                      key={cell.key}
                      onMouseEnter={(event) => {
                        if (!cell.inYear) return;
                        const rect = event.currentTarget.getBoundingClientRect();
                        setHovered({
                          count: cell.count,
                          label: cell.label,
                          x: rect.left + rect.width / 2,
                          y: rect.top - 8,
                        });
                      }}
                      onMouseLeave={() => setHovered(null)}
                      className={`h-[11px] w-[11px] rounded-xs ${
                        cell.inYear ? LEVEL_CLASS[Math.min(cell.level, 3)] : 'bg-transparent'
                      }`}
                    />
                  )),
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 text-xs font-medium text-slate-400">
          <span>Less</span>
          {LEVEL_CLASS.map((cls) => (
            <div key={cls} className={`h-2.5 w-2.5 rounded-xs ${cls}`} />
          ))}
          <span>More</span>
        </div>
      </div>

      <StatFooter stats={stats} />

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="pointer-events-none fixed z-50 flex -translate-x-1/2 -translate-y-full items-center gap-1.5 whitespace-nowrap rounded-xl bg-slate-900 px-4 py-2.5 text-[12px] font-bold text-white shadow-xl"
            style={{ left: hovered.x, top: hovered.y }}
          >
            <span>
              {hovered.count === 0
                ? 'No activity'
                : `${hovered.count} ${hovered.count === 1 ? 'activity' : 'activities'}`}
            </span>
            <span className="font-semibold text-slate-400">on {hovered.label}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ---------------------------------------------------------------------------
// About (organization) — takes the heatmap's place on an organization page
// ---------------------------------------------------------------------------

export function AboutPanel({
  description,
  stats,
}: {
  description?: string | null;
  stats: PanelStat[];
}) {
  return (
    <section className={`${SURFACE} flex h-full flex-col justify-between p-6`}>
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Building2 size={18} className="text-slate-600 dark:text-slate-300" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">About</h3>
        </div>
        {description ? (
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {description}
          </p>
        ) : (
          <Muted>This organization has not added a description yet.</Muted>
        )}
      </div>
      <StatFooter stats={stats} />
    </section>
  );
}

// ---------------------------------------------------------------------------
// Content library (instructor / organization)
// ---------------------------------------------------------------------------

type LibraryItem = ProfileCourse | ProfileWorkshop | ChannelContentItem;
type LibraryTab = 'courses' | 'events';

const PAGE = 6;

export interface ContentLibraryProps {
  courses: LibraryItem[];
  events: LibraryItem[];
  /** Shown under an empty tab; the orchestrator words it for owner vs visitor. */
  emptyAction?: React.ReactNode;
}

export function ContentLibrary({ courses, events, emptyAction }: ContentLibraryProps) {
  const [tab, setTab] = useState<LibraryTab>(courses.length === 0 && events.length > 0 ? 'events' : 'courses');
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const list = tab === 'courses' ? courses : events;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (item) =>
        item.title?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q),
    );
  }, [list, query]);
  const visible = query || expanded ? filtered : filtered.slice(0, PAGE);

  const switchTo = (next: LibraryTab) => {
    setTab(next);
    setQuery('');
    setExpanded(false);
  };

  const tabButton = (id: LibraryTab, label: string, Icon: LucideIcon, count: number) => {
    const active = tab === id;
    return (
      <button
        type="button"
        onClick={() => switchTo(id)}
        className={`flex h-full flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3.5 text-xs font-bold transition-all sm:flex-initial ${
          active
            ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        <Icon size={13} className={active ? '' : 'text-slate-400'} />
        <span>{label}</span>
        <span
          className={`rounded-full px-1.5 text-[10px] font-bold ${
            active
              ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-200'
              : 'bg-slate-200/60 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
          }`}
        >
          {count}
        </span>
      </button>
    );
  };

  const kind = tab === 'courses' ? 'COURSE' : 'EVENT';
  const noun = tab === 'courses' ? 'courses' : 'events';

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col justify-between gap-4 p-5 pb-2 sm:p-6 lg:flex-row lg:items-center">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 sm:text-base dark:text-white">
              Content & Curriculum
            </h3>
            <p className="text-xs text-slate-400">
              {tab === 'courses' ? 'Published courses' : 'Live sessions & events'}
            </p>
          </div>
        </div>

        <div className="flex w-full items-center justify-end gap-2.5 lg:w-auto">
          <div className="flex h-9 w-full items-center gap-1 rounded-xl bg-slate-100 p-1 sm:w-auto dark:bg-slate-800">
            {tabButton('courses', 'Courses', BookOpen, courses.length)}
            {tabButton('events', 'Events', CalendarDays, events.length)}
          </div>

          <div
            className={`relative flex h-9 items-center rounded-xl bg-slate-100 p-1 transition-all duration-300 dark:bg-slate-800 ${
              searchOpen || query ? 'w-48 sm:w-60' : 'w-9'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setSearchOpen(true);
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
              className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              aria-label={`Search ${noun}`}
            >
              <Search size={14} />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => {
                if (!query) setSearchOpen(false);
              }}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search titles..."
              className={`h-full bg-transparent pr-7 text-xs text-slate-900 placeholder-slate-400 transition-all duration-200 focus:outline-none dark:text-white ${
                searchOpen || query ? 'w-full pl-1 opacity-100' : 'pointer-events-none w-0 pl-0 opacity-0'
              }`}
            />
            {(searchOpen || query) && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSearchOpen(false);
                }}
                className="absolute right-2 cursor-pointer p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 pt-2 sm:p-6">
        {filtered.length === 0 ? (
          <ProfileEmptyState
            icon={tab === 'courses' ? BookOpen : CalendarDays}
            title={query ? `No matching ${noun} found` : `No ${noun} published yet`}
            description={
              query
                ? `Nothing matched "${query}". Try clearing the search.`
                : `Published ${noun} will appear here.`
            }
            action={query ? undefined : emptyAction}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((item) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  kind={kind}
                  href={kind === 'COURSE' ? `/courses/${item.id}` : `/events/${item.id}`}
                />
              ))}
            </div>

            {!query && filtered.length > PAGE && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setExpanded((value) => !value)}
                  className="group inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50 px-6 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:bg-slate-100 hover:text-teal-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-teal-400"
                >
                  <span>
                    {expanded ? `Show fewer ${noun}` : `Show all ${noun} (${filtered.length - PAGE} more)`}
                  </span>
                  {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
