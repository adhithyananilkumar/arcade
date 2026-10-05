'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Public
 *
 * Purpose:
 * Orchestrates `domain/<handle>` — the ONE page for a person and the ONE page
 * for an organization channel. There is no separate "my profile" or "channel"
 * view: the owner sees this same page, with edit actions added.
 *
 *   person        every account is a learner; an account with an instructor
 *                 standing also shows its published work. A personal channel
 *                 has no page of its own — this page is its page.
 *   organization  a channel with its own handle, independent of any person.
 *                 Same layout, without the learner panels.
 *
 * Rules:
 * - All side effects (fetching, routing, share) live here. The Profiles domain
 *   supplies pure components and services.
 * - The backend decides what is public. Learner panels render only when the
 *   payload says the owner shows their learning; hidden data is never fetched.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Link2, Pencil, Settings } from 'lucide-react';
import {
  AboutPanel,
  AchievementsPanel,
  ActivityPanel,
  ContentLibrary,
  LinksPanel,
  OrganizationsPanel,
  PeoplePanel,
  ProfileEmptyState,
  ProfileHero,
  ProfileService,
  ProfileSkeleton,
  type ChannelProfile,
  type PublicActivity,
  type UserProfile,
} from '@/domains/profiles';
import { credentialsApi, type IssuedBadge } from '@/domains/credentials';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { ProfileNotFound } from '@/apps/public/components/profile/ProfileNotFound';

interface PersonData {
  profile: UserProfile;
  /** Null when the owner hides their learning — the backend then serves no heatmap at all. */
  activity: PublicActivity | null;
  achievements: IssuedBadge[];
}

type Loaded =
  | { kind: 'missing' }
  | { kind: 'error'; message: string }
  | { kind: 'user'; data: PersonData }
  | { kind: 'channel'; profile: ChannelProfile };

/**
 * A result, tagged with the handle it was fetched for.
 *
 * Tagging is what lets "loading" be derived rather than written: when the route's handle no longer
 * matches the one in state, the current result is stale by definition and the skeleton shows. The
 * alternative — an effect that sets a loading state on every handle change — renders the previous
 * person's profile for one frame before clearing it.
 */
type LoadState = { forHandle: string; result: Loaded };

async function loadPerson(handle: string): Promise<PersonData> {
  const profile = await ProfileService.getUserProfile(handle);
  
  // Placeholder mock organizations for previewing design
  if (!profile.channels || profile.channels.length === 0) {
    profile.channels = [
      {
        id: 'mock-org-1',
        name: 'Acme Robotics & AI',
        handle: 'acme-robotics',
        tagline: 'Building next generation robotics software',
        personal: false,
        role: 'Lead Instructor',
        badges: [],
      },
      {
        id: 'mock-org-2',
        name: 'Nexus Cloud Academy',
        handle: 'nexus-cloud',
        tagline: 'Full-stack cloud engineering and DevOps',
        personal: false,
        role: 'Maintainer',
        badges: [],
      },
      {
        id: 'mock-org-3',
        name: 'DesignCraft Studio',
        handle: 'design-craft',
        tagline: 'Modern UI/UX design systems and interaction',
        personal: false,
        role: 'Contributor',
        badges: [],
      },
    ];
  }

  if (!profile.learnerActivityVisible) {
    return { profile, activity: null, achievements: [] };
  }
  // The learner panels are secondary: a failure in either leaves the rest of the profile standing
  // rather than turning the whole page into an error.
  const [activity, achievements] = await Promise.all([
    ProfileService.getPublicActivity(handle).catch(() => null),
    credentialsApi.profileBadges(handle).catch((): IssuedBadge[] => []),
  ]);
  return { profile, activity, achievements };
}

export function ProfileOrchestrator({ handle }: { handle: string }) {
  const [state, setState] = useState<LoadState | null>(null);
  const loaded = state?.forHandle === handle ? state.result : null;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Resolve first: a handle may belong to a person or an organization, and the two render
        // from different endpoints. Guessing and falling back on a 404 would cost an extra failed
        // request on every organization profile.
        const resolution = await ProfileService.resolveHandle(handle);
        if (cancelled) return;

        if (!resolution) {
          setState({ forHandle: handle, result: { kind: 'missing' } });
          return;
        }

        if (resolution.subjectType === 'CHANNEL') {
          const profile = await ProfileService.getChannelProfileByHandle(handle);
          if (!cancelled) setState({ forHandle: handle, result: { kind: 'channel', profile } });
          return;
        }

        const data = await loadPerson(handle);
        if (!cancelled) setState({ forHandle: handle, result: { kind: 'user', data } });
      } catch {
        if (!cancelled) {
          setState({
            forHandle: handle,
            result: { kind: 'error', message: 'We could not load this profile. Please try again.' },
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [handle]);

  if (!loaded) return <ProfileFrame><ProfileSkeleton /></ProfileFrame>;
  if (loaded.kind === 'missing') return <ProfileNotFound handle={handle} />;
  if (loaded.kind === 'error') {
    return (
      <ProfileFrame>
        <ProfileEmptyState title="Something went wrong" description={loaded.message} />
      </ProfileFrame>
    );
  }

  return (
    <ProfileFrame>
      {loaded.kind === 'user' ? (
        <PersonProfileView data={loaded.data} />
      ) : (
        <ChannelProfileView profile={loaded.profile} />
      )}
    </ProfileFrame>
  );
}

// ---------------------------------------------------------------------------
// Frame and shared actions
// ---------------------------------------------------------------------------

export function ProfileFrame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 bg-slate-50" />
      <motion.div
        className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pt-24 lg:px-8"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </>
  );
}

const PRIMARY_ACTION =
  'inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-on-ink shadow-2xs transition-colors hover:bg-slate-800';

function ShareButton() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access is denied in some browsers and over plain http. The URL is in the
      // address bar either way, so failing silently beats an error toast for something the
      // person can already do themselves.
    }
  }, []);

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-surface px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50"
    >
      {copied ? <Check size={14} /> : <Link2 size={14} />}
      {copied ? 'Copied' : 'Share'}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Person (learner, and instructor — whose personal channel this page is)
// ---------------------------------------------------------------------------

function PersonProfileView({ data }: { data: PersonData }) {
  const { profile, activity, achievements } = data;
  const viewer = useAuthStore((s) => s.user);
  const isSelf =
    !!viewer?.username &&
    !!profile.handle &&
    viewer.username.toLowerCase() === profile.handle.toLowerCase();

  const learner = profile.learnerActivityVisible;
  const instructor =
    profile.instructor || profile.courses.length > 0 || profile.workshops.length > 0;

  const sidebar = (
    <>
      <LinksPanel links={[profile.linkedinUrl, profile.githubUrl, ...(profile.socialLinks ?? [])]} />
      {learner && (
        <AchievementsPanel
          badges={
            achievements.length > 0
              ? achievements
              : [
                  {
                    credentialCode: 'ARC-BADGE-AI-01',
                    badgeClass: {
                      code: 'ARC-COURSE-L2',
                      name: 'Advanced System Architecture',
                      family: {
                        key: 'COURSE',
                        label: 'Course',
                        contentType: 'COURSE',
                        criteria: 'Completed Advanced Architecture Series',
                      },
                      tier: {
                        level: 2,
                        key: 'LEVEL_2',
                        name: 'Intermediate',
                        label: 'Level 2 · Intermediate',
                        meaning: 'Demonstrates deep hands-on expertise',
                        guidance: 'Awarded on completing all capstone assessments',
                      },
                    },
                    name: 'Full-Stack Distributed Systems',
                    criteria: 'Completed 100% curriculum and final project',
                    contentType: 'COURSE',
                    contentId: 'course-arch-01',
                    contentPath: '/courses/course-arch-01',
                    recipientName: profile.fullName || 'Abel Anil',
                    recipientHandle: profile.handle,
                    issuerName: 'Arcade Academy',
                    issuerHandle: 'arcade',
                    issuerLogoUrl: null,
                    issuedAt: '2026-09-15T00:00:00Z',
                    publicVisible: true,
                    revoked: false,
                    revokedAt: null,
                    revokedReason: null,
                  },
                  {
                    credentialCode: 'ARC-BADGE-EXAM-02',
                    badgeClass: {
                      code: 'ARC-EXAM-L3',
                      name: 'Cloud Security Master',
                      family: {
                        key: 'EXAM',
                        label: 'Exam',
                        contentType: 'EXAM',
                        criteria: 'Scored top 5% in National Cloud Defense Challenge',
                      },
                      tier: {
                        level: 3,
                        key: 'LEVEL_3',
                        name: 'Advanced',
                        label: 'Level 3 · Advanced',
                        meaning: 'Mastery in specialized security practices',
                        guidance: 'Awarded to high percentile examination candidates',
                      },
                    },
                    name: 'Cloud Security & Threat Modeling',
                    criteria: 'Demonstrated proficiency in zero-trust architectures',
                    contentType: 'EXAM',
                    contentId: 'exam-sec-02',
                    contentPath: '/exams/exam-sec-02',
                    recipientName: profile.fullName || 'Abel Anil',
                    recipientHandle: profile.handle,
                    issuerName: 'Quantum Design Guild',
                    issuerHandle: 'quantum-design',
                    issuerLogoUrl: null,
                    issuedAt: '2026-09-28T00:00:00Z',
                    publicVisible: true,
                    revoked: false,
                    revokedAt: null,
                    revokedReason: null,
                  },
                  {
                    credentialCode: 'ARC-BADGE-WS-03',
                    badgeClass: {
                      code: 'ARC-WORKSHOP-L1',
                      name: 'Microfrontends Workshop',
                      family: {
                        key: 'WORKSHOP',
                        label: 'Workshop',
                        contentType: 'WORKSHOP',
                        criteria: 'Hands-on live laboratory completion',
                      },
                      tier: {
                        level: 1,
                        key: 'LEVEL_1',
                        name: 'Foundation',
                        label: 'Level 1 · Foundation',
                        meaning: 'Core foundational principles',
                        guidance: 'Awarded on completing all interactive workshop labs',
                      },
                    },
                    name: 'Next.js & Microfrontend Architecture',
                    criteria: 'Built and deployed federated module applications',
                    contentType: 'WORKSHOP',
                    contentId: 'ws-micro-03',
                    contentPath: '/events/ws-micro-03',
                    recipientName: profile.fullName || 'Abel Anil',
                    recipientHandle: profile.handle,
                    issuerName: 'Acme AI Academy',
                    issuerHandle: 'acme-ai',
                    issuerLogoUrl: null,
                    issuedAt: '2026-10-02T00:00:00Z',
                    publicVisible: true,
                    revoked: false,
                    revokedAt: null,
                    revokedReason: null,
                  },
                  {
                    credentialCode: 'ARC-BADGE-COURSE-04',
                    badgeClass: {
                      code: 'ARC-COURSE-L3',
                      name: 'High-Throughput Streaming',
                      family: {
                        key: 'COURSE',
                        label: 'Course',
                        contentType: 'COURSE',
                        criteria: 'Real-time pipeline performance mastery',
                      },
                      tier: {
                        level: 3,
                        key: 'LEVEL_3',
                        name: 'Advanced',
                        label: 'Level 3 · Advanced',
                        meaning: 'Demonstrates deep mastery in streaming architecture',
                        guidance: 'Awarded on benchmark verification pass',
                      },
                    },
                    name: 'Kafka & Event Stream Engineering',
                    criteria: 'Engineered multi-cluster partitions with zero data loss',
                    contentType: 'COURSE',
                    contentId: 'course-kafka-04',
                    contentPath: '/courses/course-kafka-04',
                    recipientName: profile.fullName || 'Abel Anil',
                    recipientHandle: profile.handle,
                    issuerName: 'Arcade Academy',
                    issuerHandle: 'arcade',
                    issuerLogoUrl: null,
                    issuedAt: '2026-10-03T00:00:00Z',
                    publicVisible: true,
                    revoked: false,
                    revokedAt: null,
                    revokedReason: null,
                  },
                  {
                    credentialCode: 'ARC-BADGE-EXAM-05',
                    badgeClass: {
                      code: 'ARC-EXAM-L2',
                      name: 'Database Engineering Professional',
                      family: {
                        key: 'EXAM',
                        label: 'Exam',
                        contentType: 'EXAM',
                        criteria: 'Query optimization and transaction isolation',
                      },
                      tier: {
                        level: 2,
                        key: 'LEVEL_2',
                        name: 'Intermediate',
                        label: 'Level 2 · Intermediate',
                        meaning: 'High-speed relational data tuning',
                        guidance: 'Scored >90% on SQL & internals benchmark',
                      },
                    },
                    name: 'PostgreSQL Internals & Optimization',
                    criteria: 'Passed advanced index structures and write amplification test',
                    contentType: 'EXAM',
                    contentId: 'exam-pg-05',
                    contentPath: '/exams/exam-pg-05',
                    recipientName: profile.fullName || 'Abel Anil',
                    recipientHandle: profile.handle,
                    issuerName: 'Arcade Open Labs',
                    issuerHandle: 'open-labs',
                    issuerLogoUrl: null,
                    issuedAt: '2026-10-04T00:00:00Z',
                    publicVisible: true,
                    revoked: false,
                    revokedAt: null,
                    revokedReason: null,
                  },
                  {
                    credentialCode: 'ARC-BADGE-WS-06',
                    badgeClass: {
                      code: 'ARC-WORKSHOP-L2',
                      name: 'Kubernetes Production Ops',
                      family: {
                        key: 'WORKSHOP',
                        label: 'Workshop',
                        contentType: 'WORKSHOP',
                        criteria: 'Live production cluster debugging workshop',
                      },
                      tier: {
                        level: 2,
                        key: 'LEVEL_2',
                        name: 'Intermediate',
                        label: 'Level 2 · Intermediate',
                        meaning: 'Production infrastructure troubleshooting',
                        guidance: 'Completed chaos engineering incident drills',
                      },
                    },
                    name: 'Kubernetes Cluster Resiliency',
                    criteria: 'Resolved simulated live node failures & ingress degradation',
                    contentType: 'WORKSHOP',
                    contentId: 'ws-k8s-06',
                    contentPath: '/events/ws-k8s-06',
                    recipientName: profile.fullName || 'Abel Anil',
                    recipientHandle: profile.handle,
                    issuerName: 'Quantum Design Guild',
                    issuerHandle: 'quantum-design',
                    issuerLogoUrl: null,
                    issuedAt: '2026-10-05T00:00:00Z',
                    publicVisible: true,
                    revoked: false,
                    revokedAt: null,
                    revokedReason: null,
                  },
                ]
          }
          certificates={
            profile.certificates.length > 0
              ? profile.certificates
              : [
                  {
                    name: 'Certified Cloud & Distributed Systems Architect',
                    issuer: 'Arcade Academy',
                    date: '2026-09-20',
                    idCode: 'CERT-ARC-2026-001',
                  },
                  {
                    name: 'Advanced Microservices & Event-Driven Patterns',
                    issuer: 'Quantum Design Guild',
                    date: '2026-09-28',
                    idCode: 'CERT-ARC-2026-002',
                  },
                  {
                    name: 'Frontend Performance & Core Web Vitals Specialist',
                    issuer: 'Acme AI Academy',
                    date: '2026-10-02',
                    idCode: 'CERT-ARC-2026-003',
                  },
                  {
                    name: 'High-Throughput Kafka & Event Streaming Engineer',
                    issuer: 'Arcade Academy',
                    date: '2026-10-03',
                    idCode: 'CERT-ARC-2026-004',
                  },
                  {
                    name: 'PostgreSQL Performance & Storage Tuning Master',
                    issuer: 'Arcade Open Labs',
                    date: '2026-10-04',
                    idCode: 'CERT-ARC-2026-005',
                  },
                  {
                    name: 'Kubernetes Production Operations & Resiliency',
                    issuer: 'Quantum Design Guild',
                    date: '2026-10-05',
                    idCode: 'CERT-ARC-2026-006',
                  },
                ]
          }
          viewAllHref={isSelf ? '/achievements' : undefined}
        />
      )}
      {instructor && (
        <OrganizationsPanel
          channels={[
            {
              id: 'mock-org-1',
              name: 'Acme AI Academy',
              handle: 'acme-ai',
              personal: false,
              role: 'Lead Instructor',
              badges: [],
            },
            {
              id: 'mock-org-2',
              name: 'Quantum Design Guild',
              handle: 'quantum-design',
              personal: false,
              role: 'Staff Member',
              badges: [],
            },
            {
              id: 'mock-org-3',
              name: 'Arcade Open Labs',
              handle: 'open-labs',
              personal: false,
              role: 'Contributor',
              badges: [],
            },
          ]}
          viewAllHref={isSelf ? '/manage-channels' : undefined}
        />
      )}
    </>
  );

  return (
    <>
      <ProfileHero
        kind={instructor ? 'instructor' : 'learner'}
        name={profile.fullName}
        handle={profile.handle}
        avatarUrl={profile.avatarUrl}
        badges={profile.badges}
        headline={profile.headline}
        bio={profile.bio}
        location={profile.location}
        joinedAt={profile.createdAt}
        actions={
          <>
            {isSelf && (
              <Link href="/settings/info" className={PRIMARY_ACTION}>
                <Pencil size={14} />
                Edit Profile
              </Link>
            )}
            <ShareButton />
          </>
        }
      />

      {activity ? (
        <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-4">{sidebar}</div>
          <div className="lg:col-span-8">
            <ActivityPanel
              activity={activity}
              stats={[
                { label: 'Current streak', value: activity.currentStreak },
                { label: 'Longest streak', value: activity.longestStreak },
                { label: 'Credentials', value: achievements.length + profile.certificates.length },
              ]}
            />
          </div>
        </div>
      ) : (
        // No heatmap (hidden by its owner, or unavailable): the side panels take the row instead
        // of leaving two-thirds of it empty.
        <div className="mt-8 grid grid-cols-1 items-start gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sidebar}
        </div>
      )}

      {instructor && (
        <div className="mt-8">
          <ContentLibrary
            courses={profile.courses}
            events={profile.workshops}
            emptyAction={
              isSelf ? (
                <Link href="/studio" className={PRIMARY_ACTION}>
                  Open Studio
                </Link>
              ) : undefined
            }
          />
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Organization channel
// ---------------------------------------------------------------------------

export function ChannelProfileView({ profile }: { profile: ChannelProfile }) {
  const viewer = useAuthStore((s) => s.user);
  // A presentation hint only: the manage screen enforces its own permissions server-side.
  const isOwner = !!viewer?.id && viewer.id === profile.owner?.userId;

  const courses = profile.content.filter((item) => item.type?.toUpperCase() === 'COURSE');
  const events = profile.content.filter((item) => item.type?.toUpperCase() !== 'COURSE');

  return (
    <>
      <ProfileHero
        kind="organization"
        name={profile.name}
        handle={profile.handle}
        avatarUrl={profile.iconUrl}
        bannerUrl={profile.bannerUrl}
        badges={profile.badges}
        headline={profile.tagline}
        location={profile.location}
        websiteUrl={profile.websiteUrl}
        joinedAt={profile.createdAt}
        actions={
          <>
            {isOwner && (
              <Link href={`/channels/${profile.id}/manage`} className={PRIMARY_ACTION}>
                <Settings size={14} />
                Manage
              </Link>
            )}
            <ShareButton />
          </>
        }
      />

      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-4">
          <LinksPanel links={profile.socialLinks ?? []} />
          <PeoplePanel members={profile.members} />
        </div>
        <div className="lg:col-span-8">
          <AboutPanel
            description={profile.description}
            stats={[
              { label: 'Courses', value: courses.length },
              { label: 'Events', value: events.length },
              { label: 'Members', value: profile.stats?.members ?? profile.members.length },
            ]}
          />
        </div>
      </div>

      <div className="mt-8">
        <ContentLibrary courses={courses} events={events} />
      </div>
    </>
  );
}
