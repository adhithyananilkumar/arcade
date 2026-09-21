'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Public
 *
 * Purpose:
 * Orchestrates `domain/<handle>`: resolves who or what lives there, fetches the
 * matching profile, and renders it.
 *
 * Rules:
 * - All side effects (fetching, routing, share) live here. The Profiles domain
 *   supplies pure components and services.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Building2, Check, Link2, Pencil } from 'lucide-react';
import {
  CertificateCard,
  ChannelCard,
  ChannelHero,
  ContentCard,
  MemberCard,
  ProfileEmptyState,
  ProfileHero,
  ProfileService,
  ProfileSkeleton,
  ProfileTabs,
  type ChannelProfile,
  type ProfileTab,
  type UserProfile,
} from '@/domains/profiles';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { ProfileNotFound } from '@/apps/public/components/profile/ProfileNotFound';

type Loaded =
  | { kind: 'missing' }
  | { kind: 'error'; message: string }
  | { kind: 'user'; profile: UserProfile }
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

export function ProfileOrchestrator({ handle }: { handle: string }) {
  const [state, setState] = useState<LoadState | null>(null);
  const loaded = state?.forHandle === handle ? state.result : null;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Resolve first: a handle may belong to a person or an organization, and the two render
        // completely different pages from completely different endpoints. Guessing and falling
        // back on a 404 would cost an extra failed request on every channel profile.
        const resolution = await ProfileService.resolveHandle(handle);
        if (cancelled) return;

        if (!resolution) {
          setState({ forHandle: handle, result: { kind: 'missing' } });
          return;
        }

        if (resolution.subjectType === 'CHANNEL') {
          const profile = await ProfileService.getChannelProfileByHandle(handle);
          if (!cancelled) {
            setState({ forHandle: handle, result: { kind: 'channel', profile } });
          }
          return;
        }

        const profile = await ProfileService.getUserProfile(handle);
        if (!cancelled) {
          setState({ forHandle: handle, result: { kind: 'user', profile } });
        }
      } catch {
        if (!cancelled) {
          setState({
            forHandle: handle,
            result: {
              kind: 'error',
              message: 'We could not load this profile. Please try again.',
            },
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [handle]);

  if (!loaded) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 pb-20 pt-10 sm:px-6">
        <ProfileSkeleton />
      </div>
    );
  }

  if (loaded.kind === 'missing') {
    return <ProfileNotFound handle={handle} />;
  }

  if (loaded.kind === 'error') {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 pb-20 pt-24 sm:px-6">
        <ProfileEmptyState title="Something went wrong" description={loaded.message} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-10 sm:px-6">
      {loaded.kind === 'user' ? (
        <UserProfileView profile={loaded.profile} />
      ) : (
        <ChannelProfileView profile={loaded.profile} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared actions
// ---------------------------------------------------------------------------

function ShareButton() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access is denied in some browsers and over plain http. The URL is in the
      // address bar either way, so failing silently is better than an error toast for something
      // the person can already do themselves.
    }
  }, []);

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-extrabold tracking-tight text-slate-700 transition-colors hover:border-slate-900 dark:border-neutral-800 dark:bg-black dark:text-neutral-200 dark:hover:border-neutral-400"
    >
      {copied ? <Check size={14} /> : <Link2 size={14} />}
      {copied ? 'Copied' : 'Share'}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Person
// ---------------------------------------------------------------------------

function UserProfileView({ profile }: { profile: UserProfile }) {
  const router = useRouter();
  const viewer = useAuthStore((s) => s.user);
  const isSelf =
    !!viewer?.username &&
    !!profile.handle &&
    viewer.username.toLowerCase() === profile.handle.toLowerCase();

  // Tabs are derived from what the payload actually contains. An instructor with no published
  // courses gets no Courses tab rather than one that opens onto an empty state, and a profile
  // that has hidden its learner side has no Certificates tab at all.
  const tabs = useMemo<ProfileTab[]>(() => {
    const result: ProfileTab[] = [];
    if (profile.courses.length)
      result.push({ id: 'courses', label: 'Courses', count: profile.courses.length });
    if (profile.workshops.length)
      result.push({ id: 'events', label: 'Events', count: profile.workshops.length });
    if (profile.channels.length)
      result.push({ id: 'channels', label: 'Channels', count: profile.channels.length });
    if (profile.learnerActivityVisible && profile.certificates.length)
      result.push({
        id: 'certificates',
        label: 'Certificates',
        count: profile.certificates.length,
      });
    return result;
  }, [profile]);

  // Derived rather than corrected after the fact: which tabs exist depends on the profile, so a
  // selection that is no longer offered simply falls back to the first one on the same render.
  // An effect doing the same correction renders one frame of an empty panel first.
  const [selected, setSelected] = useState<string | null>(null);
  const active = tabs.some((tab) => tab.id === selected)
    ? (selected as string)
    : (tabs[0]?.id ?? '');

  return (
    <>
      <ProfileHero
        profile={profile}
        actions={
          <>
            {isSelf && (
              <button
                type="button"
                onClick={() => router.push('/settings/info')}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-[13px] font-extrabold tracking-tight text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                <Pencil size={14} />
                Edit profile
              </button>
            )}
            <ShareButton />
          </>
        }
      />

      {tabs.length === 0 ? (
        <div className="mt-12">
          <ProfileEmptyState
            icon={BookOpen}
            title="Nothing to show yet"
            description={
              isSelf
                ? 'Publish a course or an event, or join a channel, and it will appear here.'
                : `${profile.fullName} has not published anything on Arcade yet.`
            }
            action={
              isSelf ? (
                <Link
                  href="/studio"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-[13px] font-extrabold tracking-tight text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-black"
                >
                  Open Studio
                </Link>
              ) : undefined
            }
          />
        </div>
      ) : (
        <>
          <ProfileTabs
            tabs={tabs}
            activeId={active}
            onChange={setSelected}
            className="mt-10"
          />

          <div className="mt-8">
            {active === 'courses' && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {profile.courses.map((course) => (
                  <ContentCard
                    key={course.id}
                    item={course}
                    kind="COURSE"
                    href={`/courses/${course.id}`}
                  />
                ))}
              </div>
            )}

            {active === 'events' && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {profile.workshops.map((workshop) => (
                  <ContentCard key={workshop.id} item={workshop} kind="EVENT" />
                ))}
              </div>
            )}

            {active === 'channels' && (
              <div className="grid gap-5 sm:grid-cols-2">
                {profile.channels.map((channel) => (
                  <ChannelCard key={channel.id} channel={channel} />
                ))}
              </div>
            )}

            {active === 'certificates' && (
              <div className="grid gap-5 sm:grid-cols-2">
                {profile.certificates.map((certificate, index) => (
                  <CertificateCard
                    key={certificate.id ?? index}
                    certificate={certificate}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Organization channel
// ---------------------------------------------------------------------------

function ChannelProfileView({ profile }: { profile: ChannelProfile }) {
  const tabs = useMemo<ProfileTab[]>(() => {
    const result: ProfileTab[] = [];
    if (profile.content.length)
      result.push({ id: 'content', label: 'Catalog', count: profile.content.length });
    if (profile.members.length)
      result.push({ id: 'people', label: 'People', count: profile.members.length });
    return result;
  }, [profile]);

  // Same derivation as the user profile above, for the same reason.
  const [selected, setSelected] = useState<string | null>(null);
  const active = tabs.some((tab) => tab.id === selected)
    ? (selected as string)
    : (tabs[0]?.id ?? '');

  return (
    <>
      <ChannelHero channel={profile} actions={<ShareButton />} />

      {tabs.length === 0 ? (
        <div className="mt-12">
          <ProfileEmptyState
            icon={Building2}
            title="Nothing published yet"
            description={`${profile.name} has not published anything on Arcade yet.`}
          />
        </div>
      ) : (
        <>
          <ProfileTabs
            tabs={tabs}
            activeId={active}
            onChange={setSelected}
            className="mt-10"
          />

          <div className="mt-8">
            {active === 'content' && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {profile.content.map((item) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    href={
                      item.type?.toUpperCase() === 'COURSE'
                        ? `/courses/${item.id}`
                        : undefined
                    }
                  />
                ))}
              </div>
            )}

            {active === 'people' && (
              <div className="grid gap-5 sm:grid-cols-2">
                {profile.members.map((member) => (
                  <MemberCard key={member.userId} member={member} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
