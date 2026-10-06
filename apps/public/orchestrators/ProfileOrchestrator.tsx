'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Public
 *
 * Purpose:
 * Orchestrates `domain/<handle>` — resolving whether a handle belongs
 * to a learner, an instructor, or an organization channel, and delegating
 * to the appropriate specialized profile view.
 * ------------------------------------------------------------------
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Link2, Settings } from 'lucide-react';
import {
  AboutPanel,
  ContentLibrary,
  LinksPanel,
  PeoplePanel,
  ProfileEmptyState,
  ProfileHero,
  ProfileService,
  ProfileSkeleton,
  LearnerProfileView,
  InstructorProfileView,
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

type LoadState = { forHandle: string; result: Loaded };

async function loadPerson(handle: string): Promise<PersonData> {
  const profile = await ProfileService.getUserProfile(handle);

  if (!profile.learnerActivityVisible) {
    return { profile, activity: null, achievements: [] };
  }

  // The learner panels are secondary: a failure in either leaves the rest of the profile standing
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

  if (loaded.kind === 'channel') {
    return (
      <ProfileFrame>
        <ChannelProfileView profile={loaded.profile} />
      </ProfileFrame>
    );
  }

  const isInstructor =
    loaded.data.profile.instructor ||
    loaded.data.profile.courses.length > 0 ||
    loaded.data.profile.workshops.length > 0;

  return (
    <ProfileFrame>
      {isInstructor ? (
        <InstructorProfileView data={loaded.data} />
      ) : (
        <LearnerProfileView data={loaded.data} />
      )}
    </ProfileFrame>
  );
}

// ---------------------------------------------------------------------------
// Frame and shared components
// ---------------------------------------------------------------------------

export function ProfileFrame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 bg-slate-50 dark:bg-slate-950" />
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
  'inline-flex items-center gap-1.5 rounded-full bg-sky-700 px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-xs transition-colors hover:bg-sky-800 dark:bg-sky-600 dark:hover:bg-sky-700 cursor-pointer';

function ShareButton() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently ignore clipboard permissions failure
    }
  }, []);

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
    >
      {copied ? <Check size={14} /> : <Link2 size={14} />}
      {copied ? 'Copied' : 'Share'}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Organization channel view
// ---------------------------------------------------------------------------

export function ChannelProfileView({ profile }: { profile: ChannelProfile }) {
  const viewer = useAuthStore((s) => s.user);
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
        isSelf={isOwner}
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
