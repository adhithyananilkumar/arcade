/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { UserService } from "@/domains/identity";
import { useActivitySummaryQuery, useDailyActivityQuery } from '@/domains/learning';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvatarUrl } from '@/shared/utils/avatar';
import { BadgeRow, VerifiedBadge, BadgeIcon, type ProfileBadge } from '@/domains/recognition';
import {
  User as UserIcon, MapPin, Mail, Calendar, Edit3,
  Code, Star,
  Flame,
  Loader2, X, Camera, Globe,
  BadgeCheck, Lock, Trash2, Sparkles, Shield,
  Building2, ExternalLink, BookOpen, ChevronRight,
  Trophy
} from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';
import { ImageCropModal } from '@/shared/design-system/ui/image-crop-modal';
import { PhoneInput } from '@/shared/design-system/ui/phone-input';
import { useUserChannels, channelService, type ChannelContentItem } from '@/domains/channels';
import { ContentCard, ProfileEmptyState } from '@/domains/profiles';
import { credentialsApi, type MyBadges, CredentialBadge } from '@/domains/credentials';


function ProfilePageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const { user, updateUser } = useAuthStore();
  const { data: activitySummary } = useActivitySummaryQuery(Boolean(user));
  const { channels: userChannels, isLoading: isLoadingChannels } = useUserChannels({ enabled: Boolean(user) });
  const organizationChannels = useMemo(
    () => userChannels.filter((channel) => !channel.isPersonal),
    [userChannels]
  );
  const personalChannel = useMemo(
    () => userChannels.find((channel) => channel.isPersonal),
    [userChannels]
  );

  const [channelContent, setChannelContent] = useState<ChannelContentItem[]>([]);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [myBadges, setMyBadges] = useState<MyBadges | null>(null);
  const [isLoadingBadges, setIsLoadingBadges] = useState(false);
  const [viewMode, setViewMode] = useState<'activity' | 'content'>('activity');
  const [contentFilter, setContentFilter] = useState<'ALL' | 'COURSE' | 'EVENT'>('ALL');
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Sub Navigation Active Tab
  const [activeTab, setActiveTab] = useState<'courses' | 'enrolled' | 'certificates'>('courses');
  
  useEffect(() => {
    if (tabParam === 'enrolled' || tabParam === 'courses' || tabParam === 'certificates') {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);
  
  // Edit Profile Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLinkedinUrl, setEditLinkedinUrl] = useState('');
  const [editGithubUrl, setEditGithubUrl] = useState('');
  const [editMobileNumber, setEditMobileNumber] = useState('');
  const [isMobileValid, setIsMobileValid] = useState(true);
  const [editGender, setEditGender] = useState('MALE');
  const [editAddress, setEditAddress] = useState('');

  const [editEmail, setEditEmail] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);
  
  // Avatar upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const [cropSourceFile, setCropSourceFile] = useState<File | null>(null);

  // Tooltip hover coordinates
  const [hoveredCell, setHoveredCell] = useState<{ count: number; dateStr: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await UserService.getMe();
        updateUser(data);
        setProfileData(data);
        
        // Pre-fill edit inputs
        setEditFirstName(data.firstName || '');
        setEditLastName(data.lastName || '');
        setEditUsername(data.username || '');
        setEditBio(data.bio || '');
        setEditLinkedinUrl(data.linkedinUrl || '');
        setEditGithubUrl(data.githubUrl || '');
        setEditMobileNumber(data.mobileNumber || '');
        setEditGender(data.gender || 'MALE');
        setEditAddress(data.address || '');
        setEditEmail(data.email || '');
      } catch (err) {
        console.error('Failed to load profile details from DB:', err);
        toast.error('Could not load profile information.');
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Fetch personal channel published content
  useEffect(() => {
    if (!personalChannel) return;
    let cancelled = false;
    setIsLoadingContent(true);
    channelService
      .getPublishedChannelContent(personalChannel.id)
      .then((items) => {
        if (!cancelled) setChannelContent(items || []);
      })
      .catch((err) => {
        console.error('Failed to load personal channel content:', err);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingContent(false);
      });
    return () => {
      cancelled = true;
    };
  }, [personalChannel]);

  // Fetch credential badges
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setIsLoadingBadges(true);
    credentialsApi
      .mine()
      .then((res) => {
        if (!cancelled) setMyBadges(res);
      })
      .catch((err) => {
        console.warn('Failed to load credential badges:', err);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingBadges(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Handle populating fields and resetting validations when edit modal is opened
  useEffect(() => {
    if (isEditModalOpen && (profileData || user)) {
      const u = profileData || user;
      setEditFirstName(u.firstName || '');
      setEditLastName(u.lastName || '');
      setEditUsername(u.username || '');
      setEditBio(u.bio || '');
      setEditLinkedinUrl(u.linkedinUrl || '');
      setEditGithubUrl(u.githubUrl || '');
      setEditMobileNumber(u.mobileNumber || '');
      setEditGender(u.gender || 'MALE');
      setEditAddress(u.address || '');
      setEditEmail(u.email || '');
      setUsernameAvailable(null);
      setUsernameSuggestions([]);
    }
  }, [isEditModalOpen, profileData, user]);

  // Debounced effect to check username availability
  useEffect(() => {
    if (!isEditModalOpen) return;

    const currentUsername = profileData?.username || user?.username;
    if (!editUsername || editUsername === currentUsername) {
      setUsernameAvailable(null);
      setUsernameSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const res = await UserService.checkUsername(editUsername);
        setUsernameAvailable(res.available);
        setUsernameSuggestions(res.suggestions || []);
      } catch (err) {
        console.error('Failed to check username availability:', err);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 450); // 450ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [editUsername, isEditModalOpen, profileData, user]);

  useEffect(() => {
    if (!isEditModalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isEditModalOpen]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (usernameAvailable === false) {
      toast.error('The selected username is already taken. Please choose another.');
      return;
    }

    if (editMobileNumber && !isMobileValid) {
      toast.error('Enter a valid phone number for the selected country.');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await UserService.updateProfile(
        editFirstName, 
        editLastName, 
        editBio, 
        editLinkedinUrl, 
        editUsername,
        editMobileNumber,
        editGender,
        editAddress,
        editGithubUrl
      );
      updateUser(updated);
      setProfileData(updated);
      setIsEditModalOpen(false);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      console.error('Update failed:', err);
      toast.error(err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image must be less than 5MB');
      return;
    }

    setCropSourceFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAvatarCropped = async (croppedFile: File) => {
    setCropSourceFile(null);
    setIsUploadingAvatar(true);
    try {
      const updatedUser = await UserService.uploadAvatar(croppedFile);
      updateUser(updatedUser);
      setProfileData(updatedUser);
      toast.success('Avatar uploaded successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setIsRemovingAvatar(true);
    try {
      const updatedUser = await UserService.removeAvatar();
      updateUser(updatedUser);
      setProfileData(updatedUser);
      toast.success('Avatar removed successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to remove image');
    } finally {
      setIsRemovingAvatar(false);
    }
  };

  // Calendar-year window (Jan 1 to Dec 31, padded to whole weeks) for the heatmap. Bounded well
  // under the backend's 400-day range cap (see PROFILE_API_CONTRACT.md).
  const { rangeFromISO, rangeToISO, startDate, numWeeks } = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const jan1 = new Date(currentYear, 0, 1);
    const jan1Day = jan1.getDay(); // 0 = Sun, ..., 6 = Sat
    const start = new Date(jan1);
    start.setDate(jan1.getDate() - jan1Day);

    const dec31 = new Date(currentYear, 11, 31);
    const dec31Day = dec31.getDay();
    const end = new Date(dec31);
    end.setDate(dec31.getDate() + (6 - dec31Day));

    const totalDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return {
      rangeFromISO: start.toISOString().split('T')[0],
      rangeToISO: end.toISOString().split('T')[0],
      startDate: start,
      numWeeks: Math.ceil(totalDays / 7),
    };
  }, []);

  // Canonical source of learning activity — LearnerDailyActivity, backend-owned (see
  // LEARNING_ACTIVITY_STREAK.md). Not TimeLog: TimeLog is legacy session-presence data and is
  // never used as the learning-activity source for this heatmap.
  const { data: dailyActivity } = useDailyActivityQuery(rangeFromISO, rangeToISO, Boolean(user));

  const { contributionGrid, months, totalWeeks } = useMemo(() => {
    const dailyMap = new Map((dailyActivity ?? []).map(d => [d.date, d]));
    const currentYear = new Date().getFullYear();

    const grid = [];
    const monthHeaders: { name: string; col: number }[] = [];
    let lastMonth = -1;

    for (let w = 0; w < numWeeks; w++) {
      const week = [];
      for (let r = 0; r < 7; r++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + w * 7 + r);

        const m = currentDate.getMonth();
        if (m !== lastMonth && currentDate.getFullYear() === currentYear) {
          monthHeaders.push({
            name: currentDate.toLocaleDateString('en-US', { month: 'short' }),
            col: w
          });
          lastMonth = m;
        }

        const dateStr = currentDate.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });

        const targetDateISO = currentDate.toISOString().split('T')[0];
        const day = dailyMap.get(targetDateISO);

        week.push({ dateStr, count: day?.activityCount ?? 0, level: day?.intensity ?? 0 });
      }
      grid.push(week);
    }
    return { contributionGrid: grid, months: monthHeaders, totalWeeks: numWeeks };
  }, [dailyActivity, numWeeks, startDate]);

  // Backend-owned (see LEARNING_ACTIVITY_STREAK.md) — streak is a derived value computed from
  // durable LearningActivity history server-side, not recomputed client-side.
  const currentStreak = activitySummary?.currentStreak ?? 0;

  const currentUser = profileData || user;
  const username = currentUser?.username || currentUser?.email?.split('@')[0] || 'username';

  // Combine personal channel published content with any user authored courses/workshops
  const allPersonalContent = useMemo(() => {
    if (channelContent.length > 0) return channelContent;
    const items: ChannelContentItem[] = [];
    (currentUser?.courses ?? []).forEach((c: any) => {
      items.push({
        id: c.id,
        type: 'COURSE',
        title: c.title,
        description: c.description,
        coverImageUrl: c.coverImageUrl,
        status: c.status || 'PUBLISHED',
        createdAt: c.createdAt || new Date().toISOString(),
        updatedAt: c.updatedAt || new Date().toISOString(),
      });
    });
    (currentUser?.workshops ?? []).forEach((w: any) => {
      items.push({
        id: w.id,
        type: 'WORKSHOP',
        title: w.title,
        description: w.description,
        coverImageUrl: w.coverImageUrl,
        status: w.status || 'PUBLISHED',
        createdAt: w.createdAt || new Date().toISOString(),
        updatedAt: w.updatedAt || new Date().toISOString(),
      });
    });
    return items;
  }, [channelContent, currentUser?.courses, currentUser?.workshops]);

  const filteredPersonalContent = useMemo(() => {
    if (contentFilter === 'ALL') return allPersonalContent;
    if (contentFilter === 'COURSE') {
      return allPersonalContent.filter(
        (item) => item.type?.toUpperCase() === 'COURSE'
      );
    }
    return allPersonalContent.filter(
      (item) =>
        item.type?.toUpperCase() === 'WORKSHOP' ||
        item.type?.toUpperCase() === 'EVENT' ||
        item.type?.toUpperCase() === 'WEBINAR'
    );
  }, [allPersonalContent, contentFilter]);

  if (isLoading || !currentUser) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-purple-600" size={36} />
        <p className="text-sm font-semibold text-slate-400">Fetching profile details from database...</p>
      </div>
    );
  }

  return (
    <>
      {/* Page Background */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-slate-50 via-[#f8fafc] to-slate-100 dark:from-[#090d16] dark:via-[#0f172a] dark:to-[#090d16]"></div>
      
      {/* Ambient background glow orbs */}
      <div className="fixed top-12 left-1/4 w-[500px] h-[500px] bg-indigo-200/20 dark:bg-indigo-900/10 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="fixed top-96 right-1/4 w-[450px] h-[450px] bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-[130px] pointer-events-none z-0" />

      <motion.div 
        className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-16 relative transition-colors z-10"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >



        {/* ── Main GitHub 2-Column Responsive Layout ── */}
        <div className="flex flex-col md:flex-row gap-8 items-start">

          {/* ── LEFT SIDEBAR (GitHub Profile Column) ── */}
          <div className="w-full md:w-72 lg:w-80 shrink-0 space-y-5">

            <div className="relative flex w-48 h-48 sm:w-64 sm:h-64 shrink-0 group/avatar mx-auto md:mx-0">
              <div className="relative z-10 flex h-full w-full items-center justify-center rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-900 transition-transform hover:scale-[1.02]">
                {currentUser.avatarUrl ? (
                  <img src={getAvatarUrl(currentUser.avatarUrl)} alt="Avatar" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <UserIcon size={110} className="text-purple-400 dark:text-purple-300" />
                )}

                {/* Camera Hover Overlay */}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar || isRemovingAvatar}
                  className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Upload Avatar"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="animate-spin text-white mb-1" size={28} />
                  ) : (
                    <>
                      <Camera size={28} className="mb-1" />
                      <span className="text-xs font-semibold">Change avatar</span>
                    </>
                  )}
                </button>
              </div>

              {/* Remove Avatar Button */}
              {currentUser.avatarUrl && (
                <button
                  onClick={handleRemoveAvatar}
                  disabled={isRemovingAvatar || isUploadingAvatar}
                  className="absolute top-2 right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-red-500 shadow-md opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remove Avatar"
                >
                  {isRemovingAvatar ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              )}
            </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/jpeg, image/png, image/webp" 
                onChange={handleAvatarSelect}
              />

            {/* User Full Name & Role */}
            <div className="text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center md:justify-start gap-2">
                {currentUser.fullName || (currentUser.firstName + (currentUser.lastName ? ' ' + currentUser.lastName : '')) || 'User'}
                
                {/*
                  Real, granted badges — not a guess.

                  This used to infer a "verified" tick from role-code substrings and, failing
                  that, from whether the word "creator" appeared anywhere in the bio. That is not
                  verification: it could not be granted, revoked, or explained to the person
                  looking at it, and anyone could award themselves one by editing their bio.
                  Badges now come from the backend's recognition context, which owns the grant
                  lifecycle and the audit trail.
                */}
                <BadgeRow badges={(currentUser.badges ?? []) as ProfileBadge[]} size={22} />
              </h1>

              <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                <span className="text-base font-normal text-slate-500 dark:text-slate-400">
                  @{username}
                </span>
                {/*
                  What this account actually is on Arcade, decided by the backend rather than by
                  reading role names here. "Instructor" means they staff a channel or have
                  published work; everyone else is a learner, which is what every account is to
                  begin with.
                */}
                <span className="text-slate-400 font-medium">•</span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Star size={13} className="fill-amber-500 text-amber-500" />
                  {(currentUser.channelMemberships?.length ?? 0) > 0 ||
                  (currentUser.courses?.length ?? 0) > 0
                    ? 'Instructor'
                    : 'Learner'}
                </span>
              </div>
            </div>

            {/* Bio */}
            {currentUser.bio && (
              <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-center md:text-left whitespace-pre-line break-words">
                {currentUser.bio.includes('\n')
                  ? currentUser.bio
                  : currentUser.bio.split('|').map((part: string) => part.trim()).join('\n')}
              </div>
            )}

            {/* GitHub-style Full Width Edit Profile Button */}
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold px-4 py-2 text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
            >
              <Edit3 size={15} />
              <span>Edit profile</span>
            </button>

            {/* GitHub Details List */}
            <div className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium pt-1">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-slate-400 shrink-0" />
                <span>{currentUser.address || 'India'}</span>
              </div>
              {currentUser.createdAt && (
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400 shrink-0" />
                  <span>
                    Joined{' '}
                    {new Date(currentUser.createdAt).toLocaleDateString(undefined, {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
              {currentUser.email && (
                <div className="flex items-center gap-2 truncate">
                  <Mail size={16} className="text-slate-400 shrink-0" />
                  <span className="truncate">{currentUser.email}</span>
                </div>
              )}
              {currentUser.linkedinUrl && (
                <div className="flex items-center gap-2">
                  <FaLinkedin size={16} className="text-blue-600 shrink-0" />
                  <a href={currentUser.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-purple-600 dark:text-purple-400 truncate">
                    {currentUser.linkedinUrl.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {currentUser.githubUrl && (
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-slate-500 shrink-0" />
                  <a href={currentUser.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-purple-600 dark:text-purple-400 truncate">
                    {currentUser.githubUrl.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>

            {/* Achievements Section */}
            <div className="border-t border-slate-200 dark:border-slate-800/80 pt-5">
              <div className="flex items-center justify-between mb-3">
                <Link
                  href="/achievements"
                  className="group inline-flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  <Trophy size={15} className="text-amber-500" />
                  <span>Achievements</span>
                  {((currentUser.badges?.length ?? 0) + (myBadges?.earned?.length ?? 0)) > 0 && (
                    <span className="rounded-full bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 text-[11px] font-bold text-purple-700 dark:text-purple-300">
                      {(currentUser.badges?.length ?? 0) + (myBadges?.earned?.length ?? 0)}
                    </span>
                  )}
                </Link>
                <Link
                  href="/achievements"
                  className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                >
                  View all
                </Link>
              </div>

              {isLoadingBadges ? (
                <div className="flex items-center gap-2 py-2 text-xs text-slate-400">
                  <Loader2 className="animate-spin" size={14} />
                  <span>Loading achievements...</span>
                </div>
              ) : ((currentUser.badges?.length ?? 0) === 0 && (myBadges?.earned?.length ?? 0) === 0) ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                  No achievements unlocked yet.
                </p>
              ) : (
                <div className="flex flex-wrap items-center gap-5 pt-2">
                  {/* Live Recognition Badges Granted to User */}
                  {(currentUser.badges as ProfileBadge[] | undefined)?.map((badge) => (
                    <VerifiedBadge
                      key={badge.code}
                      badge={badge}
                      size={96}
                      showDetailOnHover={true}
                      className="transition-transform hover:scale-105"
                    />
                  ))}

                  {/* Live Issued Credential Badges */}
                  {myBadges?.earned?.map((b) => (
                    <Link
                      key={b.credentialCode}
                      href={`/credentials/${encodeURIComponent(b.credentialCode)}`}
                      className="transition-transform hover:scale-105"
                      title={`${b.name} (${b.badgeClass.tier.label}) - Issued by ${b.issuerName}`}
                    >
                      <CredentialBadge
                        family={b.badgeClass.family.key}
                        level={b.badgeClass.tier.level}
                        title={b.name}
                        className="w-24 h-24"
                      />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Organizations Section */}
            <div className="border-t border-slate-200 dark:border-slate-800/80 pt-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 size={15} className="text-purple-600 dark:text-purple-400" />
                  <span>Organizations</span>
                  {organizationChannels.length > 0 && (
                    <span className="ml-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      {organizationChannels.length}
                    </span>
                  )}
                </h2>
              </div>

              {isLoadingChannels ? (
                <div className="flex items-center gap-2 py-2 text-xs text-slate-400">
                  <Loader2 className="animate-spin" size={14} />
                  <span>Loading organizations...</span>
                </div>
              ) : organizationChannels.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                  No organizations joined yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {organizationChannels.map((channel) => {
                    const channelHref = channel.handle
                      ? `/${channel.handle}`
                      : `/channels/${channel.id}`;
                    return (
                      <Link
                        key={channel.id}
                        href={channelHref}
                        className="group flex items-center justify-between gap-3 p-2 rounded-xl border border-slate-200/70 dark:border-slate-800/80 bg-white/60 dark:bg-slate-850/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-purple-300 dark:hover:border-purple-900/50 transition-all shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
                            {channel.iconUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={getAvatarUrl(channel.iconUrl)}
                                alt={channel.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Building2 size={15} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {channel.name}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                              <span>Organization</span>
                              {channel.status && channel.status !== 'ACTIVE' && (
                                <>
                                  <span>•</span>
                                  <span className={channel.status === 'PENDING' ? 'text-amber-500 font-semibold' : 'text-rose-500 font-semibold'}>
                                    {channel.status}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <ExternalLink size={13} className="text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* ── RIGHT MAIN CONTENT (GitHub Profile Cards Column) ── */}
          <div className="flex-1 min-w-0 w-full space-y-6">

            {/* Toggle Switcher: Learning Activity vs Personal Channel Popular Content */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-3.5">
              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200/70 dark:border-slate-700/60 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setViewMode('activity')}
                  className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'activity'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Flame size={15} className={viewMode === 'activity' ? 'text-amber-500' : 'text-slate-400'} />
                  <span>Learning Activity</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('content')}
                  className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'content'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Sparkles size={15} className={viewMode === 'content' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'} />
                  <span>Channel & Popular Content</span>
                  {allPersonalContent.length > 0 && (
                    <span className="rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-1.5 py-0.2 text-[10px] font-bold">
                      {allPersonalContent.length}
                    </span>
                  )}
                </button>
              </div>

              {viewMode === 'activity' && currentStreak > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Flame size={15} className="text-amber-500" />
                  <span>{currentStreak} day{currentStreak === 1 ? '' : 's'} in a row</span>
                </div>
              )}

              {viewMode === 'content' && personalChannel && (
                <Link
                  href={personalChannel.handle ? `/${personalChannel.handle}` : `/channels/${personalChannel.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                >
                  <span>Go to Personal Channel</span>
                  <ChevronRight size={13} />
                </Link>
              )}
            </div>

            {/* View 1: Learning Streak & GitHub Contribution Matrix */}
            {viewMode === 'activity' && (
              <div className="py-2 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                      <Flame size={18} className="text-amber-500" />
                      <span>Learning Streak & Activity</span>
                    </h3>
                  </div>
                  {currentStreak > 0 && (
                    <div className="flex items-center gap-1.5 text-sm font-bold text-amber-600 dark:text-amber-400">
                      <Flame size={16} className="text-amber-500" />
                      <span>{currentStreak} day{currentStreak === 1 ? '' : 's'} in a row</span>
                    </div>
                  )}
                </div>

                {/* Daily Streak Checks + Heatmap Grid */}
                <div className="flex flex-col lg:flex-row items-center gap-6 pt-1">
                  {/* Heatmap Grid */}
                  <div className="flex-grow w-full overflow-hidden">
                    <div className="flex gap-3 items-start">
                      <div className="hidden sm:grid grid-rows-7 gap-[2px] text-[9px] text-slate-400 font-bold select-none shrink-0 pt-4">
                        <div className="flex items-center h-[10px]">Sun</div>
                        <div className="h-[10px]" />
                        <div className="flex items-center h-[10px]">Wed</div>
                        <div className="h-[10px]" />
                        <div className="flex items-center h-[10px]">Fri</div>
                        <div className="h-[10px]" />
                      </div>

                      <div className="flex-grow overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-1">
                        <div className="w-fit">
                          <div className="flex text-[9px] text-slate-400 font-bold mb-1.5 h-3.5 relative select-none">
                            {months.map((m, i) => (
                              <span 
                                key={`${m.name}-${m.col}-${i}`} 
                                className="absolute" 
                                style={{ left: `calc(${m.col} * (100% / ${totalWeeks || 53}))` }}
                              >
                                {m.name}
                              </span>
                            ))}
                          </div>

                          <div className="grid grid-flow-col grid-rows-7 gap-[2px]">
                            {contributionGrid.map((week, wIdx) => 
                              week.map((cell, dIdx) => (
                                <div 
                                  key={`${wIdx}-${dIdx}`}
                                  onMouseEnter={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setHoveredCell({
                                      count: cell.count,
                                      dateStr: cell.dateStr,
                                      x: rect.left + rect.width / 2,
                                      y: rect.top - 8
                                    });
                                  }}
                                  onMouseLeave={() => setHoveredCell(null)}
                                  className={`w-[10px] h-[10px] sm:w-[11px] sm:h-[11px] rounded-xs transition-all duration-150 cursor-pointer ${
                                    cell.level === 0 ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200' :
                                    cell.level === 1 ? 'bg-purple-200 dark:bg-purple-900/60 hover:scale-110' :
                                    cell.level === 2 ? 'bg-purple-400 dark:bg-purple-600 hover:scale-110' :
                                    'bg-purple-600 dark:bg-purple-500 hover:scale-110 shadow-2xs'
                                  }`}
                                />
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-3 text-xs text-slate-400 font-medium">
                      <span>Less</span>
                      <div className="w-2.5 h-2.5 rounded-xs bg-slate-100 dark:bg-slate-800" />
                      <div className="w-2.5 h-2.5 rounded-xs bg-purple-200 dark:bg-purple-900/60" />
                      <div className="w-2.5 h-2.5 rounded-xs bg-purple-400 dark:bg-purple-600" />
                      <div className="w-2.5 h-2.5 rounded-xs bg-purple-600 dark:bg-purple-500" />
                      <span>More</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* View 2: Personal Channel & Popular Content */}
            {viewMode === 'content' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Content Filter Pills */}
                {allPersonalContent.length > 0 && (
                  <div className="flex items-center gap-2">
                    {(['ALL', 'COURSE', 'EVENT'] as const).map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setContentFilter(filter)}
                        className={`rounded-lg px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${
                          contentFilter === filter
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {filter === 'ALL' ? 'All Content' : filter === 'COURSE' ? 'Courses' : 'Events & Workshops'}
                      </button>
                    ))}
                  </div>
                )}

                {/* Content Grid */}
                {isLoadingContent ? (
                  <div className="flex h-40 w-full flex-col items-center justify-center gap-2 text-slate-400">
                    <Loader2 className="animate-spin text-purple-600" size={24} />
                    <span className="text-xs font-medium">Loading channel content...</span>
                  </div>
                ) : filteredPersonalContent.length === 0 ? (
                  <ProfileEmptyState
                    icon={BookOpen}
                    title="No published content yet"
                    description="No published courses or events yet on this personal channel."
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPersonalContent.map((item) => {
                      const isCourse = item.type?.toUpperCase() === 'COURSE';
                      const href = isCourse ? `/courses/${item.id}` : `/events/${item.id}`;
                      return (
                        <ContentCard
                          key={item.id}
                          item={item}
                          kind={isCourse ? 'COURSE' : 'EVENT'}
                          href={href}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </motion.div>

      {/* Edit Profile Modal */}
      {portalReady && createPortal(
        <AnimatePresence>
          {isEditModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsEditModalOpen(false)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              />

              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-profile-title"
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 flex max-h-[min(88vh,720px)] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 px-6 py-5">
                  <div className="min-w-0">
                    <h3 id="edit-profile-title" className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                      Edit Profile Info
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      Update your details, bio, and social connections.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleEditSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">First name</label>
                        <input
                          type="text"
                          required
                          value={editFirstName}
                          onChange={(e) => setEditFirstName(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">Last name</label>
                        <input
                          type="text"
                          required
                          value={editLastName}
                          onChange={(e) => setEditLastName(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">Username</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={editUsername}
                          onChange={(e) => setEditUsername(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                          className={`${
                            usernameAvailable === true
                              ? 'border-emerald-500 focus:border-emerald-600 focus:ring-emerald-600'
                              : usernameAvailable === false
                                ? 'border-rose-500 focus:border-rose-600 focus:ring-rose-600'
                                : 'border-slate-200 dark:border-slate-700 focus:border-purple-600 focus:ring-purple-600'
                          } w-full rounded-xl border bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition focus:ring-1`}
                        />
                        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
                          {isCheckingUsername && <Loader2 className="animate-spin text-purple-600" size={14} />}
                          {usernameAvailable === true && (
                            <span className="rounded bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              Available
                            </span>
                          )}
                          {usernameAvailable === false && (
                            <span className="rounded bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                              Taken
                            </span>
                          )}
                        </div>
                      </div>
                      {usernameAvailable === false && usernameSuggestions.length > 0 && (
                        <div className="mt-2 rounded-xl border border-rose-100 dark:border-rose-950 bg-rose-50/50 dark:bg-rose-950/30 p-3 text-[12px]">
                          <p className="mb-1.5 font-bold text-rose-600 dark:text-rose-400">Username is taken. Try:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {usernameSuggestions.map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setEditUsername(s)}
                                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 transition hover:border-purple-600 hover:text-purple-600"
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <div className="mb-1.5 flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Email</label>
                          <span className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            <Lock size={9} /> Locked
                          </span>
                        </div>
                        <input type="email" disabled value={editEmail} className="w-full cursor-not-allowed select-none rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 px-3.5 py-2.5 text-sm font-medium text-slate-400 outline-none" />
                      </div>
                      <div>
                        <div className="mb-1.5 flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Gender</label>
                          <span className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            <Lock size={9} /> Locked
                          </span>
                        </div>
                        <select disabled value={editGender} className="w-full cursor-not-allowed select-none rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 px-3.5 py-2.5 text-sm font-medium text-slate-400 outline-none appearance-none">
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">LinkedIn</label>
                        <input
                          type="url"
                          value={editLinkedinUrl}
                          onChange={(e) => setEditLinkedinUrl(e.target.value)}
                          placeholder="https://linkedin.com/in/username"
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">GitHub</label>
                        <input
                          type="url"
                          value={editGithubUrl}
                          onChange={(e) => setEditGithubUrl(e.target.value)}
                          placeholder="https://github.com/username"
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">Mobile</label>
                        <PhoneInput
                          value={editMobileNumber}
                          onChange={(val, meta) => {
                            setEditMobileNumber(val);
                            setIsMobileValid(meta.isValid);
                          }}
                          onValidate={(valid) => setIsMobileValid(valid)}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">Address</label>
                        <input
                          type="text"
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          placeholder="City, State, Country"
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Bio</label>
                        <span className={`text-[11px] font-medium ${editBio.length >= 250 ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>
                          {editBio.length}/250
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        maxLength={250}
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        placeholder="Tell us a little about yourself (press Enter for new lines)..."
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition focus:border-purple-600 focus:ring-1 focus:ring-purple-600 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 py-4">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving || usernameAvailable === false}
                      className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSaving && <Loader2 size={15} className="animate-spin" />}
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Hover Tooltip for Contribution Heatmap Cells */}
      <AnimatePresence>
        {hoveredCell && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="fixed z-50 bg-slate-900 text-white text-[12px] font-bold px-4 py-2.5 rounded-xl shadow-xl pointer-events-none -translate-x-1/2 -translate-y-full flex items-center gap-1.5 whitespace-nowrap"
            style={{ left: hoveredCell.x, top: hoveredCell.y }}
          >
            <span>{hoveredCell.count === 0 ? 'No activity' : `${hoveredCell.count} ${hoveredCell.count === 1 ? 'activity' : 'activities'}`}</span>
            <span className="text-slate-400 font-semibold">on {hoveredCell.dateStr}</span>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
          </motion.div>
        )}
      </AnimatePresence>
      <ImageCropModal
        open={cropSourceFile !== null}
        file={cropSourceFile}
        aspectRatio={1}
        title="Crop Profile Avatar"
        onCancel={() => setCropSourceFile(null)}
        onCropped={handleAvatarCropped}
      />
    </>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-purple-600" /></div>}>
      <ProfilePageContent />
    </Suspense>
  );
}
