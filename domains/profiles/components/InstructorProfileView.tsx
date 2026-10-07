'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Pencil, Link2, Check } from 'lucide-react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { UserService } from '@/domains/identity';
import { ProfileHero } from './ProfileHero';
import {
  LinksPanel,
  AchievementsPanel,
  OrganizationsPanel,
  ActivityPanel,
  ContentLibrary,
  TechStackPanel,
  ProjectsShowcasePanel,
  ProfileAnalyticsCard,
} from './ProfilePanels';
import type { UserProfile, PublicActivity } from '../types/profile.types';
import type { IssuedBadge } from '@/domains/credentials';

const PRIMARY_ACTION =
  'inline-flex items-center gap-1.5 rounded-full bg-slate-900 dark:bg-white px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white dark:text-slate-900 shadow-xs transition-colors hover:bg-slate-800 dark:hover:bg-slate-100 cursor-pointer';

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
      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 shadow-2xs transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
    >
      {copied ? <Check size={14} className="text-emerald-500" /> : <Link2 size={14} />}
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

import { ProfileEditModal } from './ProfileEditModal';
import type { TechSkill, ShowcaseProject, DomainMasteryItem } from './ProfilePanels';



export function InstructorProfileView({ data }: InstructorProfileViewProps) {
  const { profile: initialProfile, activity, achievements } = data;
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Initialize skills & projects from database/localStorage if available, or fall back to defaults
  const [skills, setSkills] = useState<TechSkill[]>(() => {
    if (profile.skills) {
      try {
        const parsed = JSON.parse(profile.skills);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    if (typeof window === 'undefined' || !profile.handle) return [];
    try {
      const saved = localStorage.getItem(`arcade_skills_${profile.handle}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [projects, setProjects] = useState<ShowcaseProject[]>(() => {
    if (profile.featuredProjects) {
      try {
        const parsed = JSON.parse(profile.featuredProjects);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    if (typeof window === 'undefined' || !profile.handle) return [];
    try {
      const saved = localStorage.getItem(`arcade_projects_${profile.handle}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [domains, setDomains] = useState<DomainMasteryItem[]>(() => {
    if (profile.domainMastery) {
      try {
        const parsed = JSON.parse(profile.domainMastery);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    if (typeof window === 'undefined' || !profile.handle) return [];
    try {
      const saved = localStorage.getItem(`arcade_domain_mastery_${profile.handle}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const viewer = useAuthStore((s) => s.user);
  const isSelf =
    !!viewer?.username &&
    !!profile.handle &&
    viewer.username.toLowerCase() === profile.handle.toLowerCase();

  const learnerActivityVisible = profile.learnerActivityVisible;
  const organizations = profile.channels ?? [];
  const publishedCourses = profile.courses ?? [];
  const publishedWorkshops = profile.workshops ?? [];

  const handleSaveDomains = (updatedDomains: DomainMasteryItem[]) => {
    setDomains(updatedDomains);
    const jsonString = JSON.stringify(updatedDomains);
    if (profile.handle) {
      localStorage.setItem(`arcade_domain_mastery_${profile.handle}`, jsonString);
    }
    if (isSelf) {
      const viewerUser = useAuthStore.getState().user;
      if (viewerUser?.firstName) {
        UserService.updateProfilePresentation(viewerUser.firstName, viewerUser.lastName ?? '', {
          domainMastery: jsonString,
        }).catch((err) => console.error('Failed to sync domain mastery to database', err));
      }
    }
  };

  // Sync if initial data changes
  useEffect(() => {
    setProfile(initialProfile);
    if (initialProfile.skills) {
      try {
        const parsed = JSON.parse(initialProfile.skills);
        if (Array.isArray(parsed)) setSkills(parsed);
      } catch {}
    }
    if (initialProfile.domainMastery) {
      try {
        const parsed = JSON.parse(initialProfile.domainMastery);
        if (Array.isArray(parsed)) setDomains(parsed);
      } catch {}
    }
    if (initialProfile.featuredProjects) {
      try {
        const parsed = JSON.parse(initialProfile.featuredProjects);
        if (Array.isArray(parsed)) setProjects(parsed);
      } catch {}
    }
  }, [initialProfile]);

  // Auto-sync legacy localStorage skills/projects/domains to database if empty on server
  useEffect(() => {
    if (isSelf) {
      const viewerUser = useAuthStore.getState().user;
      if (viewerUser?.firstName) {
        const payload: { skills?: string; featuredProjects?: string; domainMastery?: string } = {};
        if (!initialProfile.skills && skills.length > 0) {
          payload.skills = JSON.stringify(skills.map(({ icon, ...rest }) => rest));
        }
        if (!initialProfile.featuredProjects && projects.length > 0) {
          payload.featuredProjects = JSON.stringify(projects);
        }
        if (!initialProfile.domainMastery && domains.length > 0) {
          payload.domainMastery = JSON.stringify(domains);
        }
        if (Object.keys(payload).length > 0) {
          UserService.updateProfilePresentation(viewerUser.firstName, viewerUser.lastName ?? '', payload)
            .then(() => {
              setProfile((prev) => ({
                ...prev,
                ...(payload.skills ? { skills: payload.skills } : {}),
                ...(payload.featuredProjects ? { featuredProjects: payload.featuredProjects } : {}),
                ...(payload.domainMastery ? { domainMastery: payload.domainMastery } : {}),
              }));
            })
            .catch((err) => console.error('Auto-sync to database failed', err));
        }
      }
    }
  }, [isSelf, initialProfile.skills, initialProfile.featuredProjects, initialProfile.domainMastery, skills, projects, domains]);

  const handleProfileUpdated = (updated: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  return (
    <>
      {/* ── Top Hero & Banner ── */}
      <ProfileHero
        kind="instructor"
        name={profile.fullName}
        handle={profile.handle}
        avatarUrl={profile.avatarUrl}
        bannerUrl={profile.bannerUrl}
        onBannerUpdate={(bannerUrl) => setProfile((prev) => ({ ...prev, bannerUrl }))}
        badges={profile.badges}
        headline={profile.headline}
        bio={profile.bio}
        location={profile.location}
        joinedAt={profile.createdAt}
        isSelf={isSelf}
        actions={
          <>
            {isSelf && (
              <button
                type="button"
                onClick={() => setEditModalOpen(true)}
                className={PRIMARY_ACTION}
              >
                <Pencil size={14} />
                Edit Profile
              </button>
            )}
            <ShareButton />
          </>
        }
      />

      {/* ── 2-Column Responsive Dashboard Layout ── */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================= LEFT COLUMN (lg:col-span-8): Content, Activity & Projects ================= */}
        <div className="lg:col-span-8 space-y-6 min-w-0">
          
          {/* Primary Teaching Curriculum & Courses */}
          <ContentLibrary
            courses={publishedCourses}
            events={publishedWorkshops}
            emptyAction={
              isSelf ? (
                <Link href="/studio" className={PRIMARY_ACTION}>
                  Open Studio
                </Link>
              ) : undefined
            }
          />

          {/* Tech Stack & Core Competencies */}
          <TechStackPanel
            skills={skills}
            onAddClick={isSelf ? () => setEditModalOpen(true) : undefined}
          />

          {/* 52-Week Learning Heatmap & Consistency Activity */}
          {learnerActivityVisible && activity && (
            <ActivityPanel
              activity={activity}
              stats={[
                { label: 'Current streak', value: activity.currentStreak },
                { label: 'Longest streak', value: activity.longestStreak },
                { label: 'Credentials', value: achievements.length + (profile.certificates?.length ?? 0) },
              ]}
            />
          )}

          {/* Featured Projects & Repositories */}
          <ProjectsShowcasePanel
            projects={projects}
            onAddClick={isSelf ? () => setEditModalOpen(true) : undefined}
          />
        </div>

        {/* ================= RIGHT COLUMN (lg:col-span-4): Stats, Organizations, Badges ================= */}
        <div className="lg:col-span-4 space-y-6 min-w-0 lg:sticky lg:top-24">
          
          {/* Domain Mastery Progress */}
          <ProfileAnalyticsCard
            domains={domains}
            isSelf={isSelf}
            onSaveDomains={handleSaveDomains}
          />

          {/* Organizations & Channels */}
          {organizations.filter((c) => !c.personal).length > 0 && (
            <OrganizationsPanel
              channels={organizations}
              viewAllHref={isSelf ? '/manage-channels' : undefined}
            />
          )}

          {/* Achievements, Badges & Certificates */}
          <AchievementsPanel
            badges={achievements}
            certificates={profile.certificates}
            viewAllHref={isSelf ? '/achievements' : undefined}
          />

          {/* Social & Web Links */}
          <LinksPanel links={[profile.linkedinUrl, profile.githubUrl, ...(profile.socialLinks ?? [])]} />
        </div>
      </div>

      {/* ── Dedicated Profile Edit Modal ── */}
      {isSelf && (
        <ProfileEditModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          profile={profile}
          onProfileUpdated={handleProfileUpdated}
          currentSkills={skills}
          onSkillsUpdated={setSkills}
          currentProjects={projects}
          onProjectsUpdated={setProjects}
        />
      )}
    </>
  );
}
