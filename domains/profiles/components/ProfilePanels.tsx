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

import React, { useEffect, useMemo, useRef, useState, isValidElement } from 'react';
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
  Briefcase,
  GraduationCap,
  FolderGit2,
  TrendingUp,
  Code2,
  Terminal,
  Cpu,
  Layers,
  Zap,
  CheckCircle2,
  Check,
  Trash2,
  Star,
  GitFork,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react';
import { FaGithub, FaLinkedin, FaReact, FaPython, FaDocker, FaAws, FaNodeJs, FaRust, FaGitAlt } from 'react-icons/fa';
import { SiTypescript, SiNextdotjs, SiTailwindcss, SiPostgresql, SiKubernetes, SiRedis, SiFigma, SiGo, SiGraphql } from 'react-icons/si';
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
  'rounded-tl-[1.75rem] rounded-br-[1.75rem] rounded-tr-md rounded-bl-md border border-slate-200/80 bg-surface/95 shadow-xs';

// ---------------------------------------------------------------------------
// Panel shell
// ---------------------------------------------------------------------------

function Panel({
  title,
  count,
  action,
  children,
}: {
  icon?: LucideIcon;
  iconClass?: string;
  title: string;
  count?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className={`${SURFACE} p-5`}>
      <div className="mb-3.5 flex items-center justify-between">
        <h3 className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <span>{title}</span>
          {!!count && (
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
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
    <section className={`${SURFACE} space-y-3.5 p-5`}>
      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Social & Web</h3>
      <div className="space-y-2 text-xs font-semibold">
        {unique.map((url) => (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2 text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
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

  if (totalCount === 0) return null;

  return (
    <>
      <Panel
        icon={Trophy}
        iconClass="text-amber-500"
        title="Achievements & Badges"
        count={totalCount}
        action={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="text-xs font-semibold text-slate-500 hover:text-indigo-600 hover:underline cursor-pointer transition-colors dark:hover:text-indigo-400"
          >
            View all
          </button>
        }
      >
        {totalCount === 0 ? (
          <div className="space-y-3 py-1">
            <div className="flex items-center justify-center gap-8 px-1">
              <div className="flex flex-col items-center gap-1.5 opacity-60">
                <div className="size-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-dashed border-amber-300 dark:border-amber-700/60 flex items-center justify-center text-amber-500">
                  <Trophy size={20} />
                </div>
                <span className="text-[10px] font-bold text-slate-500 text-center">Course Ace</span>
              </div>

              <div className="flex flex-col items-center gap-1.5 opacity-60">
                <div className="size-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-dashed border-indigo-300 dark:border-indigo-700/60 flex items-center justify-center text-indigo-500">
                  <Award size={20} />
                </div>
                <span className="text-[10px] font-bold text-slate-500 text-center">Certified</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center pt-1 font-medium">
              Complete courses & checkpoint exams to unlock verified digital badges.
            </p>
          </div>
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
                        <span className="block truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                          {certificate.name}
                        </span>
                        {certificate.issuer && (
                          <span className="block truncate text-[10px] font-medium text-slate-400 dark:text-slate-500">
                            {certificate.issuer}
                          </span>
                        )}
                      </span>
                    </>
                  );
                  const className =
                    'flex items-center gap-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-2.5';
                  return certificate.idCode ? (
                    <Link
                      key={certificate.idCode}
                      href={`/credentials/${encodeURIComponent(certificate.idCode)}`}
                      className={`${className} transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/80`}
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
                className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
              />

              {/* Modal Dialog Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-surface dark:bg-slate-900 p-6 shadow-2xl"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-950/50 dark:text-amber-400">
                      <Trophy size={20} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        All Public Achievements
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {badges.length} Credential Badges · {certificates.length} Verified Certificates
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto py-5 space-y-6">
                  {/* Badges Section */}
                  {badges.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Credential Badges ({badges.length})
                      </h3>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {badges.map((badge) => (
                          <Link
                            key={badge.credentialCode}
                            href={`/credentials/${encodeURIComponent(badge.credentialCode)}`}
                            className="flex flex-col items-center rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4 text-center transition-all hover:scale-[1.02] hover:border-amber-200 dark:hover:border-amber-500/40 hover:bg-amber-50/40 dark:hover:bg-amber-500/10"
                          >
                            <CredentialBadge
                              family={badge.badgeClass.family.key}
                              level={badge.badgeClass.tier.level}
                              title={badge.name}
                              className="h-20 w-20"
                            />
                            <span className="mt-3 block text-xs font-bold text-slate-800 dark:text-slate-200">
                              {badge.name}
                            </span>
                            <span className="mt-1 block text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                              {badge.badgeClass.tier.label}
                            </span>
                            {badge.issuerName && (
                              <span className="mt-0.5 block text-[10px] text-slate-400 dark:text-slate-500">
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
                      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
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
                                  <span className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                                    {certificate.name}
                                  </span>
                                  <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
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
                            'block rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3.5 transition-all hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800';
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
                className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
              />

              {/* Modal Dialog Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 flex max-h-[85vh] w-full max-w-xl flex-col rounded-3xl border border-slate-200/90 bg-surface p-6 shadow-2xl"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Organizations
                      </h2>
                      <p className="text-xs text-slate-500">
                        Member of {organizations.length} {organizations.length === 1 ? 'organization' : 'organizations'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
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
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Learning Activity
          </h3>
          {activity.currentStreak > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 select-none">
              <Flame size={14} className="fill-amber-500 text-amber-500 shrink-0" />
              <span>{activity.currentStreak} day streak</span>
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
                      className={`h-[13px] w-[13px] rounded-full transition-all duration-150 hover:scale-130 hover:z-10 cursor-pointer ${
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
                <div key={idx} className={`h-3 w-3 rounded-full ${cls}`} />
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
        <div className="mb-4">
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
    <section className="overflow-hidden rounded-tl-[1.75rem] rounded-br-[1.75rem] rounded-tr-md rounded-bl-md border border-slate-200/80 bg-surface/95 shadow-xs">
      <div className="flex flex-col justify-between gap-4 p-5 pb-0 sm:px-6 sm:pt-6 sm:pb-0 lg:flex-row lg:items-center">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Content & Curriculum
          </h3>
          <p className="text-xs text-slate-400">
            {tab === 'courses' ? 'Published courses' : 'Live sessions & events'}
          </p>
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

      <div className="p-5 pt-3 sm:px-6 sm:pt-3 sm:pb-6">
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

// ---------------------------------------------------------------------------
// Tech Stack & Skills Cloud
// ---------------------------------------------------------------------------

export interface TechSkill {
  name: string;
  category: 'languages' | 'frameworks' | 'cloud' | 'databases' | 'tools';
  icon: React.ReactNode;
  accent: string;
  primary?: boolean;
}

const DEFAULT_TECH_STACK: TechSkill[] = [
  { name: 'TypeScript', category: 'languages', icon: <SiTypescript size={14} className="text-[#3178C6]" />, accent: '#3178C6', primary: true },
  { name: 'React', category: 'frameworks', icon: <FaReact size={14} className="text-[#61DAFB]" />, accent: '#61DAFB', primary: true },
  { name: 'Next.js', category: 'frameworks', icon: <SiNextdotjs size={14} className="text-slate-900 dark:text-white" />, accent: '#000000', primary: true },
  { name: 'Python', category: 'languages', icon: <FaPython size={14} className="text-[#3776AB]" />, accent: '#3776AB', primary: true },
  { name: 'Docker', category: 'cloud', icon: <FaDocker size={14} className="text-[#2496ED]" />, accent: '#2496ED', primary: true },
  { name: 'Kubernetes', category: 'cloud', icon: <SiKubernetes size={14} className="text-[#326CE5]" />, accent: '#326CE5', primary: true },
  { name: 'AWS', category: 'cloud', icon: <FaAws size={14} className="text-[#FF9900]" />, accent: '#FF9900', primary: true },
  { name: 'TailwindCSS', category: 'frameworks', icon: <SiTailwindcss size={14} className="text-[#06B6D4]" />, accent: '#06B6D4', primary: true },
  { name: 'PostgreSQL', category: 'databases', icon: <SiPostgresql size={14} className="text-[#4169E1]" />, accent: '#4169E1', primary: true },
  { name: 'Node.js', category: 'frameworks', icon: <FaNodeJs size={14} className="text-[#5FA04E]" />, accent: '#5FA04E', primary: true },
  { name: 'Go', category: 'languages', icon: <SiGo size={14} className="text-[#00ADD8]" />, accent: '#00ADD8' },
  { name: 'Rust', category: 'languages', icon: <FaRust size={14} className="text-[#DEA584]" />, accent: '#DEA584' },
  { name: 'Redis', category: 'databases', icon: <SiRedis size={14} className="text-[#DC382D]" />, accent: '#DC382D' },
  { name: 'GraphQL', category: 'frameworks', icon: <SiGraphql size={14} className="text-[#E10098]" />, accent: '#E10098' },
  { name: 'Git', category: 'tools', icon: <FaGitAlt size={14} className="text-[#F05032]" />, accent: '#F05032' },
  { name: 'Figma', category: 'tools', icon: <SiFigma size={14} className="text-[#F24E1E]" />, accent: '#F24E1E' },
];

export function getSkillIcon(name: string, customIcon?: React.ReactNode): React.ReactNode {
  if (customIcon && isValidElement(customIcon)) {
    return customIcon;
  }
  const n = (name || '').toLowerCase().trim();
  if (n.includes('typescript') || n === 'ts') return <SiTypescript size={14} className="text-[#3178C6]" />;
  if (n.includes('react')) return <FaReact size={14} className="text-[#61DAFB]" />;
  if (n.includes('next')) return <SiNextdotjs size={14} className="text-slate-900 dark:text-white" />;
  if (n.includes('python') || n === 'py') return <FaPython size={14} className="text-[#3776AB]" />;
  if (n.includes('docker')) return <FaDocker size={14} className="text-[#2496ED]" />;
  if (n.includes('kubernetes') || n.includes('k8s')) return <SiKubernetes size={14} className="text-[#326CE5]" />;
  if (n.includes('aws') || n.includes('amazon')) return <FaAws size={14} className="text-[#FF9900]" />;
  if (n.includes('tailwind')) return <SiTailwindcss size={14} className="text-[#06B6D4]" />;
  if (n.includes('postgres') || n.includes('sql')) return <SiPostgresql size={14} className="text-[#4169E1]" />;
  if (n.includes('node') || n.includes('express')) return <FaNodeJs size={14} className="text-[#5FA04E]" />;
  if (n === 'go' || n.includes('golang')) return <SiGo size={14} className="text-[#00ADD8]" />;
  if (n.includes('rust')) return <FaRust size={14} className="text-[#DEA584]" />;
  if (n.includes('redis')) return <SiRedis size={14} className="text-[#DC382D]" />;
  if (n.includes('graphql')) return <SiGraphql size={14} className="text-[#E10098]" />;
  if (n.includes('git') || n.includes('github')) return <FaGitAlt size={14} className="text-[#F05032]" />;
  if (n.includes('figma') || n.includes('design')) return <SiFigma size={14} className="text-[#F24E1E]" />;
  return <Code2 size={14} className="text-indigo-500" />;
}

export function TechStackPanel({
  skills = [],
  onAddClick,
}: {
  skills?: TechSkill[];
  onAddClick?: () => void;
}) {
  const [filter, setFilter] = useState<string>('all');

  // Categories in preset order that actually have at least 1 skill
  const availableCategories = useMemo(() => {
    const order: TechSkill['category'][] = ['languages', 'frameworks', 'cloud', 'databases'];
    const presentCats = new Set<string>();
    skills.forEach((s) => {
      if (s.category) presentCats.add(s.category);
    });
    return order.filter((c) => presentCats.has(c));
  }, [skills]);

  // Reset filter to 'all' if the selected category is no longer present
  useEffect(() => {
    if (filter !== 'all' && !availableCategories.includes(filter as TechSkill['category'])) {
      setFilter('all');
    }
  }, [availableCategories, filter]);

  const filtered = useMemo(() => {
    if (filter === 'all') return skills;
    return skills.filter((s) => s.category === filter);
  }, [skills, filter]);

  if (skills.length === 0 && !onAddClick) {
    return null;
  }

  // If only 1 category exists, show only that category tab; if multiple, show 'all' + categories
  const tabs = useMemo(() => {
    if (availableCategories.length === 0) return [];
    if (availableCategories.length === 1) return availableCategories;
    return ['all', ...availableCategories];
  }, [availableCategories]);

  const showTabs = tabs.length > 0 && skills.length > 0;

  return (
    <section className={`${SURFACE} p-5 sm:p-6`}>
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2.5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Skills & Technologies</h3>

        {showTabs && (
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg text-[11px] font-semibold">
            {tabs.map((tab) => {
              const isActive = filter === tab || (filter === 'all' && tabs.length === 1);
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilter(tab)}
                  className={`px-2.5 py-0.5 rounded-md capitalize transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {skills.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            No skills or technologies added to your profile yet.
          </p>
          {onAddClick && (
            <button
              type="button"
              onClick={onAddClick}
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-3.5 py-1.5 text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              + Add your skills
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {filtered.map((skill) => (
            <div
              key={skill.name}
              className="group flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-1.5 text-xs font-bold text-slate-800 transition-all hover:scale-[1.03] hover:border-slate-300 hover:bg-white dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800 shadow-2xs select-none"
            >
              <span className="shrink-0 transition-transform group-hover:rotate-6">
                {getSkillIcon(skill.name, skill.icon)}
              </span>
              <span>{skill.name}</span>
              {skill.primary && (
                <span className="size-1.5 rounded-full bg-emerald-500" title="Primary Skill" />
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Work Experience Timeline
// ---------------------------------------------------------------------------

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  period: string;
  location?: string;
  current?: boolean;
  description: string;
  highlights?: string[];
  skills?: string[];
}

export function ExperienceTimelinePanel({
  items = [],
  companyName
}: {
  items?: ExperienceItem[];
  companyName?: string | null;
}) {
  if (items.length === 0) return null;

  return (
    <section className={`${SURFACE} p-6`}>
      <div className="mb-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Work Experience</h3>
        <p className="text-xs text-slate-400">Career journey and past roles</p>
      </div>

      <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {items.map((item) => (
          <div key={item.id} className="relative">
            <div className={`absolute -left-[27px] top-1 size-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
              item.current ? 'bg-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-950/60' : 'bg-slate-400'
            }`} />

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-base font-black text-slate-950 dark:text-white">{item.role}</h4>
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{item.company}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {item.period}
                </span>
              </div>

              {item.location && (
                <p className="text-xs text-slate-400 font-medium">{item.location}</p>
              )}

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {item.description}
              </p>

              {item.highlights && item.highlights.length > 0 && (
                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
                  {item.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              )}

              {item.skills && item.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {item.skills.map((s) => (
                    <span key={s} className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Education & Academics Panel
// ---------------------------------------------------------------------------

export interface EducationItem {
  institution: string;
  degree: string;
  field: string;
  period: string;
  honors?: string;
}

export function EducationPanel({ items = [] }: { items?: EducationItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className={`${SURFACE} p-6`}>
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Education & Academics</h3>
        <p className="text-xs text-slate-400">Academic background and degrees</p>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {items.map((edu, idx) => (
          <div key={idx} className="py-3.5 first:pt-0 last:pb-0 space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-slate-950 dark:text-white">{edu.institution}</h4>
              <span className="text-xs font-semibold text-slate-400">{edu.period}</span>
            </div>
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              {edu.degree} • {edu.field}
            </p>
            {edu.honors && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                {edu.honors}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Projects & Capstone Showcase
// ---------------------------------------------------------------------------

export interface ShowcaseProject {
  id: string;
  title: string;
  description: string;
  stars?: number;
  forks?: number;
  tags: string[];
  repoUrl?: string;
  demoUrl?: string;
}

export function ProjectsShowcasePanel({
  projects = [],
  onAddClick,
}: {
  projects?: ShowcaseProject[];
  onAddClick?: () => void;
}) {
  if (projects.length === 0 && !onAddClick) {
    return null;
  }

  return (
    <section className={`${SURFACE} p-6`}>
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Featured Projects & Repositories</h3>
          <p className="text-xs text-slate-400">Open source deliverables and capstones</p>
        </div>
        {projects.length > 0 && onAddClick && (
          <button
            type="button"
            onClick={onAddClick}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            + Add Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            No featured projects or repositories showcased yet.
          </p>
          {onAddClick && (
            <button
              type="button"
              onClick={onAddClick}
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-3.5 py-1.5 text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              + Add featured project / GitHub repo
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map((p) => (
            <div
              key={p.id}
              className="flex flex-col justify-between p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all group"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {p.title}
                  </h4>
                  {p.repoUrl && (
                    <a
                      href={p.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      <ArrowUpRight size={14} />
                    </a>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 font-normal leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1">
                  {p.tags.slice(0, 3).map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-600 shadow-2xs">
                      {t}
                    </span>
                  ))}
                </div>

                {p.stars != null && (
                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    <span>{p.stars}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Profile Analytics Card (Right Sidebar Top)
// ---------------------------------------------------------------------------

export interface DomainMasteryItem {
  id: string;
  name: string;
  pct: number;
  color?: string;
}

/**
 * Sorts domain masteries with percentage as first priority (descending)
 * and character/alphabetical order as second priority (ascending A-Z).
 */
export function sortDomains(domains: DomainMasteryItem[]): DomainMasteryItem[] {
  return [...domains].sort((a, b) => {
    // 1. Percentage descending (highest percentage first)
    if (b.pct !== a.pct) {
      return b.pct - a.pct;
    }
    // 2. Character order ascending (alphabetical A-Z)
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });
}

const DOMAIN_COLORS = [
  'bg-indigo-600 dark:bg-indigo-400',
  'bg-emerald-600 dark:bg-emerald-400',
  'bg-amber-600 dark:bg-amber-400',
  'bg-violet-600 dark:bg-violet-400',
  'bg-sky-600 dark:bg-sky-400',
  'bg-rose-600 dark:bg-rose-400',
];

export function ProfileAnalyticsCard({
  domains = [],
  isSelf = false,
  onSaveDomains,
}: {
  domains?: DomainMasteryItem[];
  isSelf?: boolean;
  onSaveDomains?: (domains: DomainMasteryItem[]) => void;
}) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewAllModalOpen, setViewAllModalOpen] = useState(false);

  const sortedDomains = useMemo(() => sortDomains(domains), [domains]);

  if (sortedDomains.length === 0 && !isSelf) {
    return null;
  }

  const visibleDomains = sortedDomains.slice(0, 5);
  const hasMore = sortedDomains.length > 5;

  return (
    <>
      <section className={`${SURFACE} p-5 space-y-3.5`}>
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Domain Mastery
            </h3>
            {sortedDomains.length > 0 && (
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.2 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                {sortedDomains.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isSelf && (
              <button
                type="button"
                onClick={() => setEditModalOpen(true)}
                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline cursor-pointer transition-colors"
              >
                Edit
              </button>
            )}
            {hasMore && isSelf && <span className="text-slate-300 dark:text-slate-700">·</span>}
            {hasMore && (
              <button
                type="button"
                onClick={() => setViewAllModalOpen(true)}
                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline cursor-pointer transition-colors"
              >
                View all
              </button>
            )}
          </div>
        </div>

        {domains.length === 0 ? (
          <div className="py-4 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-400">No domain masteries set yet.</p>
            {isSelf && (
              <button
                type="button"
                onClick={() => setEditModalOpen(true)}
                className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                + Add Domain Mastery
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-3 pt-1">
              {visibleDomains.map((d, index) => {
                const colorClass = d.color || DOMAIN_COLORS[index % DOMAIN_COLORS.length];
                return (
                  <div key={d.id || d.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span className="truncate">{d.name}</span>
                      <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">{d.pct}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${Math.min(100, Math.max(0, d.pct))}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {hasMore && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => setViewAllModalOpen(true)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  View all {sortedDomains.length} domains →
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Domain Mastery Edit Modal */}
      {isSelf && (
        <DomainMasteryModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          initialDomains={sortedDomains}
          onSave={(updated) => {
            onSaveDomains?.(sortDomains(updated));
            setEditModalOpen(false);
          }}
        />
      )}

      {/* Public View All Domains Modal */}
      <ViewAllDomainsModal
        open={viewAllModalOpen}
        onClose={() => setViewAllModalOpen(false)}
        domains={sortedDomains}
        isSelf={isSelf}
        onOpenEdit={() => {
          setViewAllModalOpen(false);
          setEditModalOpen(true);
        }}
      />
    </>
  );
}

function ViewAllDomainsModal({
  open,
  onClose,
  domains,
  isSelf,
  onOpenEdit,
}: {
  open: boolean;
  onClose: () => void;
  domains: DomainMasteryItem[];
  isSelf?: boolean;
  onOpenEdit?: () => void;
}) {
  const [query, setQuery] = useState('');

  const sorted = useMemo(() => sortDomains(domains), [domains]);

  const filtered = useMemo(() => {
    if (!query.trim()) return sorted;
    return sorted.filter((d) => d.name.toLowerCase().includes(query.trim().toLowerCase()));
  }, [sorted, query]);

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
            />

            {/* Modal Dialog Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col rounded-3xl border border-slate-200/90 bg-surface shadow-2xl overflow-hidden dark:border-slate-800"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    All Domain Masteries ({domains.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Engineering proficiencies and specialization breakdown
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Search Bar */}
              {domains.length > 6 && (
                <div className="p-4 pb-0">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search domains..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Scrollable Domains List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {filtered.map((d, index) => {
                  const colorClass = d.color || DOMAIN_COLORS[index % DOMAIN_COLORS.length];
                  return (
                    <div key={d.id || d.name} className="space-y-1.5 p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                        <span className="truncate">{d.name}</span>
                        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">{d.pct}%</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-slate-200/70 dark:bg-slate-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colorClass}`}
                          style={{ width: `${Math.min(100, Math.max(0, d.pct))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                {filtered.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-6">
                    No domains matched "{query}".
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/60 dark:bg-slate-900/60">
                {isSelf ? (
                  <button
                    type="button"
                    onClick={onOpenEdit}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Edit Domains
                  </button>
                ) : <div />}

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-slate-900 dark:bg-white px-5 py-2 text-xs font-bold text-white dark:text-slate-900 shadow-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

const SUGGESTED_DOMAINS = [
  'Frontend Architecture',
  'Backend & APIs',
  'Cloud & DevOps',
  'System Design',
  'Machine Learning & AI',
  'Cybersecurity & IAM',
  'Mobile Engineering',
  'Data Engineering',
];

function DomainMasteryModal({
  open,
  onClose,
  initialDomains,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initialDomains: DomainMasteryItem[];
  onSave: (domains: DomainMasteryItem[]) => void;
}) {
  const [list, setList] = useState<DomainMasteryItem[]>(initialDomains);
  const [customName, setCustomName] = useState('');
  const [customPct, setCustomPct] = useState(70);

  useEffect(() => {
    if (open) {
      setList(initialDomains);
    }
  }, [open, initialDomains]);

  const addDomain = (name: string, pct = 70) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (list.some((d) => d.name.toLowerCase() === trimmed.toLowerCase())) {
      return;
    }
    const color = DOMAIN_COLORS[list.length % DOMAIN_COLORS.length];
    setList([...list, { id: `dm-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`, name: trimmed, pct, color }]);
    setCustomName('');
  };

  const updateDomainPct = (id: string, pct: number) => {
    setList(list.map((d) => (d.id === id ? { ...d, pct: Math.min(100, Math.max(0, pct)) } : d)));
  };

  const removeDomain = (id: string) => {
    setList(list.filter((d) => d.id !== id));
  };

  const handleSave = () => {
    onSave(sortDomains(list));
  };

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col rounded-3xl border border-slate-200/90 bg-surface shadow-2xl overflow-hidden dark:border-slate-800"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Edit Domain Mastery
                  </h3>
                  <p className="text-xs text-slate-400">
                    Set your engineering domains and proficiency percentages
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                
                {/* Active Domains List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Your Domains ({list.length})
                  </h4>

                  {list.length === 0 ? (
                    <div className="py-6 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                      <p className="text-xs text-slate-400">
                        No domains added yet. Pick from the suggestions below or type a custom domain.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {list.map((item, index) => {
                        const colorClass = item.color || DOMAIN_COLORS[index % DOMAIN_COLORS.length];
                        return (
                          <div
                            key={item.id}
                            className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40 space-y-2"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {item.name}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 min-w-[36px] text-right">
                                  {item.pct}%
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeDomain(item.id)}
                                  className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <input
                                type="range"
                                min={0}
                                max={100}
                                step={5}
                                value={item.pct}
                                onChange={(e) => updateDomainPct(item.id, Number(e.target.value))}
                                className="flex-1 accent-indigo-600 cursor-pointer h-1.5 rounded-lg bg-slate-200 dark:bg-slate-700"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Add Custom Domain Form */}
                <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Add Custom Domain
                  </h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addDomain(customName, customPct);
                        }
                      }}
                      placeholder="e.g. Distributed Systems, Kubernetes..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-[11px] font-semibold text-slate-500">Initial:</span>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          value={customPct}
                          onChange={(e) => setCustomPct(Number(e.target.value))}
                          className="flex-1 accent-indigo-600 cursor-pointer h-1.5 rounded-lg bg-slate-200 dark:bg-slate-700"
                        />
                        <span className="font-mono text-xs font-bold text-indigo-600 min-w-[32px]">
                          {customPct}%
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => addDomain(customName, customPct)}
                        disabled={!customName.trim()}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors disabled:opacity-40 cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
                <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Suggestions (Click to add)
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_DOMAINS.map((sug) => {
                      const exists = list.some((d) => d.name.toLowerCase() === sug.toLowerCase());
                      return (
                        <button
                          key={sug}
                          type="button"
                          disabled={exists}
                          onClick={() => addDomain(sug, 75)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                            exists
                              ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-default opacity-60'
                              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 cursor-pointer shadow-2xs'
                          }`}
                        >
                          {exists ? `✓ ${sug}` : `+ ${sug}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/60 dark:bg-slate-900/60">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white px-5 py-2 text-xs font-bold text-white dark:text-slate-900 shadow-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Check size={14} />
                  <span>Save Mastery</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

// ---------------------------------------------------------------------------
// Suggested Peers / Similar Learners Panel
// ---------------------------------------------------------------------------

export function SuggestedPeersPanel() {
  const peers = [
    { name: 'Sarah Chen', handle: 'sarahchen', title: 'Full Stack & DevOps', avatar: null, shared: 'React, Docker' },
    { name: 'Marcus Brody', handle: 'marcusb', title: 'Cloud Architect', avatar: null, shared: 'AWS, Kubernetes' },
    { name: 'Ananya Sharma', handle: 'ananyasharma', title: 'ML & Python Dev', avatar: null, shared: 'Python, System Design' },
  ];

  return (
    <section className={`${SURFACE} p-5 space-y-3.5`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Similar Learners</h3>
        <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">Explore</span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {peers.map((peer) => (
          <div key={peer.handle} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                {peer.name[0]}
              </div>
              <div className="min-w-0">
                <Link href={`/${peer.handle}`} className="text-xs font-bold text-slate-900 dark:text-white hover:underline truncate block">
                  {peer.name}
                </Link>
                <span className="text-[10px] text-slate-400 truncate block">
                  {peer.shared}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-400 transition-colors shrink-0 cursor-pointer"
            >
              Connect
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

