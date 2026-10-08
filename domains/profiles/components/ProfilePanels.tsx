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

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted || typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}
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
  'rounded-2xl border border-slate-200/80 bg-surface shadow-xs';

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
        <h3 className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
          <Icon size={16} className={iconClass} />
          <span>{title}</span>
          {!!count && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
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
    <p className="py-2 text-xs italic text-slate-400">{children}</p>
  );
}

function ViewAll({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="text-xs font-semibold text-slate-500 hover:underline"
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
            className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
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
  /** Optional href override, or if omitted/modal clicked, opens the Achievements Modal. */
  viewAllHref?: string;
}

export function AchievementsPanel({ badges, certificates }: AchievementsPanelProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const totalCount = badges.length + certificates.length;

  if (totalCount === 0) {
    return null;
  }

  return (
    <>
      <Panel
        icon={Trophy}
        iconClass="text-amber-500"
        title="Achievements"
        count={totalCount}
        action={
          totalCount > 0 ? (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 hover:underline cursor-pointer transition-colors dark:hover:text-indigo-400"
            >
              View all
            </button>
          ) : undefined
        }
      >
        {badges.length === 0 && certificates.length === 0 ? (
          <Muted>No achievements unlocked yet.</Muted>
        ) : (
          <div className="space-y-4">
            {badges.length > 0 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
                {badges.map((badge) => (
                  <Link
                    key={badge.credentialCode}
                    href={`/credentials/${encodeURIComponent(badge.credentialCode)}`}
                    className="shrink-0 transition-transform hover:scale-105"
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
                        <span className="block truncate text-xs font-bold text-slate-800">
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
                    'flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5';
                  return certificate.idCode ? (
                    <Link
                      key={certificate.idCode}
                      href={`/credentials/${encodeURIComponent(certificate.idCode)}`}
                      className={`${className} transition-colors hover:bg-slate-100`}
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

      {/* Public Achievements Modal */}
      <Portal>
        <AnimatePresence>
          {modalOpen && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setModalOpen(false)}
                className="fixed inset-0 arcade-modal-backdrop"
              />

              {/* Modal Dialog Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col arcade-modal-box border border-slate-200/90 bg-surface p-6 shadow-2xl"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      All Public Achievements
                    </h2>
                    <p className="text-xs text-slate-500">
                      {badges.length} Credential Badges · {certificates.length} Verified Certificates
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-tl-lg rounded-br-lg rounded-tr-xs rounded-bl-xs p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto py-5 space-y-6">
                  {/* Badges Section */}
                  {badges.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                        Credential Badges ({badges.length})
                      </h3>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {badges.map((badge) => (
                          <Link
                            key={badge.credentialCode}
                            href={`/credentials/${encodeURIComponent(badge.credentialCode)}`}
                            className="flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50/70 p-4 text-center transition-all hover:scale-[1.02] hover:border-amber-200 hover:bg-amber-50/40 dark:hover:border-amber-500/40 dark:hover:bg-amber-500/10"
                          >
                            <CredentialBadge
                              family={badge.badgeClass.family.key}
                              level={badge.badgeClass.tier.level}
                              title={badge.name}
                              className="h-20 w-20"
                            />
                            <span className="mt-3 block text-xs font-bold text-slate-800">
                              {badge.name}
                            </span>
                            <span className="mt-1 block text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                              {badge.badgeClass.tier.label}
                            </span>
                            {badge.issuerName && (
                              <span className="mt-0.5 block text-[10px] text-slate-400">
                                by {badge.issuerName}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certificates Section */}
                  {certificates.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                        Verified Certificates ({certificates.length})
                      </h3>
                      <div className="space-y-2.5">
                        {certificates.map((certificate, index) => {
                          const body = (
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                                  <Award size={20} />
                                </div>
                                <div>
                                  <span className="block text-sm font-bold text-slate-800">
                                    {certificate.name}
                                  </span>
                                  <div className="flex items-center gap-2 text-xs text-slate-400">
                                    {certificate.issuer && <span>Issued by {certificate.issuer}</span>}
                                    {certificate.date && <span>• {certificate.date}</span>}
                                  </div>
                                </div>
                              </div>
                              {certificate.idCode && (
                                <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                  <span>Verify</span>
                                  <ExternalLink size={13} />
                                </div>
                              )}
                            </div>
                          );
                          const className =
                            'block rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 transition-all hover:border-slate-200 hover:bg-slate-100';
                          return certificate.idCode ? (
                            <Link
                              key={certificate.idCode}
                              href={`/credentials/${encodeURIComponent(certificate.idCode)}`}
                              className={className}
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
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </Portal>
    </>
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
  fullWidth = false,
}: {
  channels: ProfileChannel[];
  viewAllHref?: string;
  fullWidth?: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const organizations = channels.filter((channel) => !channel.personal);

  return (
    <>
      <Panel
        icon={Building2}
        iconClass="text-slate-600"
        title="Organizations"
        count={organizations.length}
        action={
          organizations.length > 0 ? (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 hover:underline cursor-pointer transition-colors dark:hover:text-indigo-400"
            >
              View all
            </button>
          ) : undefined
        }
      >
        {organizations.length === 0 ? (
          <Muted>No organizations joined yet.</Muted>
        ) : (
          <div className={fullWidth ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-2'}>
            {organizations.slice(0, fullWidth ? 6 : 3).map((channel) => (
              <Link
                key={channel.id}
                // An organization that has not claimed a handle is still reachable by id; that
                // route resolves to the same profile view.
                href={channel.handle ? `/${channel.handle}` : `/channels/${channel.id}`}
                className="group flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 shadow-2xs transition-all hover:bg-slate-100"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200/60 bg-surface text-slate-600">
                    {channel.iconUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={getAvatarUrl(channel.iconUrl)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Building2 size={15} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 truncate text-xs font-bold text-slate-800 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      <span className="truncate">{channel.name}</span>
                      <BadgeRow badges={channel.badges} size={13} max={1} />
                    </p>
                    <p className="text-[10px] font-medium text-slate-400">{channel.role}</p>
                  </div>
                </div>
                <ExternalLink
                  size={12}
                  className="shrink-0 text-slate-400 opacity-0 transition-opacity group-hover:text-indigo-600 group-hover:opacity-100 dark:group-hover:text-indigo-400"
                />
              </Link>
            ))}
          </div>
        )}
      </Panel>

      {/* Public Organizations Modal */}
      <Portal>
        <AnimatePresence>
          {modalOpen && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setModalOpen(false)}
                className="fixed inset-0 arcade-modal-backdrop"
              />

              {/* Modal Dialog Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 flex max-h-[85vh] w-full max-w-xl flex-col arcade-modal-box border border-slate-200/90 bg-surface p-6 shadow-2xl"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Organizations
                    </h2>
                    <p className="text-xs text-slate-500">
                      Member of {organizations.length} {organizations.length === 1 ? 'organization' : 'organizations'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-tl-lg rounded-br-lg rounded-tr-xs rounded-bl-xs p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto py-4 space-y-2.5">
                  {organizations.map((channel) => (
                    <Link
                      key={channel.id}
                      href={channel.handle ? `/${channel.handle}` : `/channels/${channel.id}`}
                      className="group flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 transition-all hover:border-slate-200 hover:bg-slate-100"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200/60 bg-surface text-slate-600 shadow-2xs">
                          {channel.iconUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={getAvatarUrl(channel.iconUrl)} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Building2 size={18} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            <span className="truncate">{channel.name}</span>
                            <BadgeRow badges={channel.badges} size={14} max={2} />
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span>{channel.role}</span>
                            {channel.handle && <span>• @{channel.handle}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        <span>Visit</span>
                        <ExternalLink size={13} />
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}

// ---------------------------------------------------------------------------
// People (organization)
// ---------------------------------------------------------------------------

export function PeoplePanel({ members }: { members: ChannelMember[] }) {
  return (
    <Panel icon={Users} iconClass="text-slate-600" title="People" count={members.length}>
      {members.length === 0 ? (
        <Muted>No public members yet.</Muted>
      ) : (
        <div className="space-y-2">
          {members.map((member) => {
            const body = (
              <>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200/60 bg-surface">
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
                  <p className="flex items-center gap-1 truncate text-xs font-bold text-slate-800">
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
              'flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5';
            return member.handle ? (
              <Link
                key={member.userId}
                href={`/${member.handle}`}
                className={`${className} transition-colors hover:bg-slate-100`}
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
    <div className="flex flex-wrap items-center gap-3 pt-2">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2 text-xs shadow-2xs"
        >
          <span className="font-medium text-slate-400">{stat.label}:</span>
          <strong className="font-bold text-slate-900">{stat.value}</strong>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Learning heatmap (learner)
// ---------------------------------------------------------------------------

const LEVEL_CLASS = [
  'bg-slate-100 hover:bg-slate-200/90 border border-slate-200/60',
  'bg-emerald-200/90 dark:bg-emerald-950/90 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300',
  'bg-emerald-400 dark:bg-emerald-600 border border-emerald-500 text-white shadow-2xs',
  'bg-emerald-500 dark:bg-emerald-500 border border-emerald-600 text-white shadow-xs',
  'bg-emerald-600 dark:bg-emerald-400 border border-emerald-700 dark:border-emerald-300 text-white ring-1 ring-emerald-400/40 shadow-sm',
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

  const { weeks, months, totalActivities, totalActiveDays } = useMemo(() => {
    const byDate = new Map(activity.days.map((day) => [day.date, day]));
    const jan1 = new Date(activity.year, 0, 1);
    const start = new Date(jan1);
    start.setDate(jan1.getDate() - jan1.getDay());
    const dec31 = new Date(activity.year, 11, 31);
    const end = new Date(dec31);
    end.setDate(dec31.getDate() + (6 - dec31.getDay()));
    const total = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;

    let activitiesSum = 0;
    let activeDaysCount = 0;

    for (const d of activity.days) {
      if ((d.activityCount ?? 0) > 0) {
        activitiesSum += d.activityCount;
        activeDaysCount++;
      }
    }

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
    return {
      weeks: grid,
      months: headers,
      totalActivities: activitiesSum,
      totalActiveDays: activeDaysCount,
    };
  }, [activity]);

  return (
    <section className={`${SURFACE} flex h-full flex-col justify-between p-6 sm:p-7`}>
      <div>
        {/* Header */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 text-amber-500 ring-1 ring-amber-500/20 dark:from-amber-500/20 dark:to-orange-500/20 dark:text-amber-400">
              <Flame size={19} className="fill-amber-500/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  {activity.year} Learning Activity
                </h3>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  {totalActiveDays} {totalActiveDays === 1 ? 'day' : 'days'} active
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400">
                Daily engaged learning sessions, labs, and assessment milestones
              </p>
            </div>
          </div>
          {activity.currentStreak > 0 && (
            <span className="flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 px-3.5 py-1 text-xs font-bold text-amber-700 shadow-2xs dark:border-amber-500/30 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-950/40 dark:text-amber-300">
              <Flame size={13} className="fill-amber-500 text-amber-500 animate-pulse" />
              {activity.currentStreak} day streak
            </span>
          )}
        </div>

        {/* Heatmap Card Framing */}
        <div className="my-4 rounded-2xl border border-slate-100/90 bg-slate-50/50 p-4 sm:p-5">
          <div className="flex items-start justify-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
            {/* Day labels aligned to rows */}
            <div className="hidden shrink-0 select-none grid-rows-7 gap-[4px] pt-[24px] text-[10px] font-semibold text-slate-400 sm:grid">
              {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((label, i) => (
                <div key={i} className="flex h-[13px] items-center justify-end pr-1">
                  {label}
                </div>
              ))}
            </div>

            {/* Weeks & Months */}
            <div className="shrink-0" style={{ width: `${weeks.length * 17 - 4}px` }}>
              {/* Month headers positioned by column */}
              <div className="relative mb-2 h-4 select-none text-[10px] font-bold text-slate-400">
                {months.map((month) => (
                  <span
                    key={`${month.name}-${month.col}`}
                    className="absolute"
                    style={{ left: `${month.col * 17}px` }}
                  >
                    {month.name}
                  </span>
                ))}
              </div>

              {/* 7x53 Cells Grid */}
              <div className="grid grid-flow-col grid-rows-7 gap-[4px]">
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
                      className={`h-[13px] w-[13px] rounded-[3px] transition-all duration-150 hover:scale-130 hover:z-10 cursor-pointer ${
                        cell.inYear
                          ? LEVEL_CLASS[Math.min(cell.level, LEVEL_CLASS.length - 1)]
                          : 'bg-transparent cursor-default'
                      }`}
                    />
                  )),
                )}
              </div>
            </div>
          </div>

          {/* Sub-footer inside framing: Activity Counter + Legend */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100/80 pt-3 text-xs text-slate-400">
            <div className="text-[11px] font-medium">
              <span className="font-bold text-slate-700">
                {totalActivities}
              </span>{' '}
              {totalActivities === 1 ? 'activity' : 'activities'} logged in {activity.year}
            </div>
            <div className="flex items-center gap-1.5 font-semibold">
              <span className="text-[11px]">Less</span>
              {LEVEL_CLASS.map((cls, idx) => (
                <div key={idx} className={`h-3 w-3 rounded-[3px] ${cls}`} />
              ))}
              <span className="text-[11px]">More</span>
            </div>
          </div>
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
            className="pointer-events-none fixed z-50 flex -translate-x-1/2 -translate-y-full items-center gap-1.5 whitespace-nowrap rounded-xl bg-slate-900 px-4 py-2.5 text-[12px] font-bold text-on-ink shadow-xl dark:border"
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
          <Building2 size={18} className="text-slate-600" />
          <h3 className="text-sm font-bold text-slate-900">About</h3>
        </div>
        {description ? (
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
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
            ? 'bg-surface text-slate-900 shadow-xs'
            : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Icon size={13} className={active ? '' : 'text-slate-400'} />
        <span>{label}</span>
        <span
          className={`rounded-full px-1.5 text-[10px] font-bold ${
            active
              ? 'bg-slate-100 text-slate-900'
              : 'bg-slate-200/60 text-slate-600'
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
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-surface shadow-xs">
      <div className="flex flex-col justify-between gap-4 p-5 pb-2 sm:p-6 lg:flex-row lg:items-center">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 sm:text-base">
              Content & Curriculum
            </h3>
            <p className="text-xs text-slate-400">
              {tab === 'courses' ? 'Published courses' : 'Live sessions & events'}
            </p>
          </div>
        </div>

        <div className="flex w-full items-center justify-end gap-2.5 lg:w-auto">
          <div className="flex h-9 w-full items-center gap-1 rounded-xl bg-slate-100 p-1 sm:w-auto">
            {tabButton('courses', 'Courses', BookOpen, courses.length)}
            {tabButton('events', 'Events', CalendarDays, events.length)}
          </div>

          <div
            className={`relative flex h-9 items-center rounded-xl bg-slate-100 p-1 transition-all duration-300 ${
              searchOpen || query ? 'w-48 sm:w-60' : 'w-9'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setSearchOpen(true);
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
              className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:text-slate-900"
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
              className={`h-full bg-transparent pr-7 text-xs text-slate-900 placeholder-slate-400 transition-all duration-200 focus:outline-none ${
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
                className="absolute right-2 cursor-pointer p-0.5 text-slate-400 hover:text-slate-600"
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
                  className="group inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50 px-6 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:bg-slate-100 hover:text-teal-600 dark:hover:text-teal-400"
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
