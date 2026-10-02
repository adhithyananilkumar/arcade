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
          badges={achievements}
          certificates={profile.certificates}
          viewAllHref={isSelf ? '/achievements' : undefined}
        />
      )}
      <OrganizationsPanel
        channels={profile.channels}
        viewAllHref={isSelf ? '/manage-channels' : undefined}
      />
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

      {(instructor || isSelf) && (
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
