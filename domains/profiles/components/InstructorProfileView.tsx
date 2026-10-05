'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { Pencil, Link2, Check } from 'lucide-react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { ProfileHero } from './ProfileHero';
import {
  LinksPanel,
  AchievementsPanel,
  OrganizationsPanel,
  ActivityPanel,
  ContentLibrary,
} from './ProfilePanels';
import type { UserProfile, PublicActivity } from '../types/profile.types';
import type { IssuedBadge } from '@/domains/credentials';

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
      // Clipboard access is denied in some browsers and over plain http.
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

export interface InstructorProfileViewProps {
  data: {
    profile: UserProfile;
    activity: PublicActivity | null;
    achievements: IssuedBadge[];
  };
}

export function InstructorProfileView({ data }: InstructorProfileViewProps) {
  const { profile, activity, achievements } = data;
  const viewer = useAuthStore((s) => s.user);
  const isSelf =
    !!viewer?.username &&
    !!profile.handle &&
    viewer.username.toLowerCase() === profile.handle.toLowerCase();

  const learnerActivityVisible = profile.learnerActivityVisible;
  const organizations = profile.channels ?? [];

  return (
    <>
      <ProfileHero
        kind="instructor"
        name={profile.fullName}
        handle={profile.handle}
        avatarUrl={profile.avatarUrl}
        bannerUrl={profile.bannerUrl}
        badges={profile.badges}
        headline={profile.headline}
        bio={profile.bio}
        location={profile.location}
        joinedAt={profile.createdAt}
        isSelf={isSelf}
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

      <div className="mt-8 space-y-6">
        <LinksPanel links={[profile.linkedinUrl, profile.githubUrl, ...(profile.socialLinks ?? [])]} />

        {/* Row 1: Achievements (Left) & Organizations (Right) */}
        {(() => {
          const hasAchievements = learnerActivityVisible && (achievements.length + (profile.certificates?.length ?? 0) > 0);
          const hasOrganizations = organizations.filter((c) => !c.personal).length > 0;

          if (hasAchievements && hasOrganizations) {
            return (
              <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
                <AchievementsPanel
                  badges={achievements}
                  certificates={profile.certificates}
                  viewAllHref={isSelf ? '/achievements' : undefined}
                />
                <OrganizationsPanel
                  channels={organizations}
                  viewAllHref={isSelf ? '/manage-channels' : undefined}
                />
              </div>
            );
          }
          if (hasAchievements) {
            return (
              <div className="max-w-xl">
                <AchievementsPanel
                  badges={achievements}
                  certificates={profile.certificates}
                  viewAllHref={isSelf ? '/achievements' : undefined}
                />
              </div>
            );
          }
          if (hasOrganizations) {
            return (
              <OrganizationsPanel
                channels={organizations}
                viewAllHref={isSelf ? '/manage-channels' : undefined}
                fullWidth={true}
              />
            );
          }
          return null;
        })()}

        {/* Row 2: Full-Width Learning Activity Heatmap */}
        {learnerActivityVisible && activity && (
          <div className="mt-8">
            <ActivityPanel
              activity={activity}
              stats={[
                { label: 'Current streak', value: activity.currentStreak },
                { label: 'Longest streak', value: activity.longestStreak },
                { label: 'Credentials', value: achievements.length + profile.certificates.length },
              ]}
            />
          </div>
        )}
      </div>

      {/* Row 3: Content & Curriculum */}
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
    </>
  );
}
