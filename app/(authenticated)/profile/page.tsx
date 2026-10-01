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
import { BadgeRow, type ProfileBadge } from '@/domains/recognition';
import {
  User as UserIcon, MapPin, Mail, Calendar, Edit3,
  Code, Star,
  Flame,
  Loader2, X, Camera, Globe,
  BadgeCheck, Lock, Trash2, Sparkles, Shield,
  Building2, ExternalLink, BookOpen, ChevronRight, ChevronDown, ChevronUp,
  Trophy, Search, LayoutGrid, CalendarDays, Award
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
  const [activeHubTab, setActiveHubTab] = useState<'courses' | 'events'>('courses');
  const [contentSearchQuery, setContentSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isCoursesExpanded, setIsCoursesExpanded] = useState(false);
  const [isEventsExpanded, setIsEventsExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
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

  const coursesList = useMemo(() => {
    return allPersonalContent.filter((item) => item.type?.toUpperCase() === 'COURSE');
  }, [allPersonalContent]);

  const eventsList = useMemo(() => {
    return allPersonalContent.filter((item) => item.type?.toUpperCase() !== 'COURSE');
  }, [allPersonalContent]);

  const displayedContent = useMemo(() => {
    let list = allPersonalContent;
    if (activeHubTab === 'courses') list = coursesList;
    if (activeHubTab === 'events') list = eventsList;

    if (!contentSearchQuery.trim()) return list;
    const query = contentSearchQuery.toLowerCase().trim();
    return list.filter(
      (item) =>
        item.title?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
    );
  }, [allPersonalContent, coursesList, eventsList, activeHubTab, contentSearchQuery]);

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
      <div className="fixed inset-0 pointer-events-none z-0 bg-[#f8fafc] dark:bg-[#0b0f19]"></div>

      <motion.div 
        className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-16 relative transition-colors z-10"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >



        {/* ── 1. Hero Identity Banner (Clean Minimal Surface) ── */}
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          {/* Minimal Muted Header Stripe */}
          <div className="h-24 sm:h-28 w-full bg-slate-100/70 dark:bg-slate-800/40 relative border-b border-slate-100 dark:border-slate-800/80">
            <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
          </div>

          <div className="px-6 sm:px-8 pb-6 pt-0">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-5 -mt-12 sm:-mt-14 mb-4">
              {/* Avatar Box with Hover Trigger */}
              <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 shrink-0 group/avatar">
                <div className="relative z-10 flex h-full w-full items-center justify-center rounded-2xl overflow-hidden border-4 border-white dark:border-slate-900 shadow-md bg-slate-100 dark:bg-slate-800 transition-transform duration-200 group-hover/avatar:scale-[1.02]">
                  {currentUser.avatarUrl ? (
                    <img src={getAvatarUrl(currentUser.avatarUrl)} alt="Avatar" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <UserIcon size={56} className="text-teal-600 dark:text-teal-400" />
                  )}

                  {/* Camera Hover Trigger */}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar || isRemovingAvatar}
                    className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 cursor-pointer disabled:opacity-50"
                    title="Change avatar"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="animate-spin text-white mb-1" size={22} />
                    ) : (
                      <>
                        <Camera size={22} className="mb-0.5" />
                        <span className="text-[11px] font-bold">Edit</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Quick Remove Button */}
                {currentUser.avatarUrl && (
                  <button
                    onClick={handleRemoveAvatar}
                    disabled={isRemovingAvatar || isUploadingAvatar}
                    className="absolute -top-1 -right-1 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-500 shadow-md opacity-0 group-hover/avatar:opacity-100 transition-opacity hover:bg-red-50"
                    title="Remove avatar"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 w-full sm:w-auto">
                {personalChannel && (
                  <Link
                    href={personalChannel.handle ? `/${personalChannel.handle}` : `/channels/${personalChannel.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs"
                  >
                    <span>View Channel</span>
                    <ChevronRight size={14} className="text-slate-400" />
                  </Link>
                )}

                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold px-4 py-2 text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
                >
                  <Edit3 size={14} />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>

            {/* Profile Info Header */}
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {currentUser.fullName || (currentUser.firstName + (currentUser.lastName ? ' ' + currentUser.lastName : '')) || 'User'}
                </h1>
                <BadgeRow badges={(currentUser.badges ?? []) as ProfileBadge[]} size={22} />
                
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/60 px-2.5 py-0.5 text-[11px] font-bold text-teal-700 dark:text-teal-300">
                  <Star size={11} className="fill-teal-500 text-teal-500" />
                  {(currentUser.channelMemberships?.length ?? 0) > 0 || (currentUser.courses?.length ?? 0) > 0
                    ? 'Instructor'
                    : 'Learner'}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="font-semibold text-slate-700 dark:text-slate-300">@{username}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-slate-400" />
                  {currentUser.address || 'India'}
                </span>
                {currentUser.createdAt && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-slate-400" />
                      Joined {new Date(currentUser.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </span>
                  </>
                )}
                {currentUser.email && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 truncate max-w-[200px]">
                      <Mail size={13} className="text-slate-400" />
                      {currentUser.email}
                    </span>
                  </>
                )}
              </div>

              {currentUser.bio && (
                <p className="pt-2 text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed whitespace-pre-line">
                  {currentUser.bio.includes('\n')
                    ? currentUser.bio
                    : currentUser.bio.split('|').map((part: string) => part.trim()).join('\n')}
                </p>
              )}
            </div>
          </div>
        </div>


        {/* ── 3. Top Overview Section (Sidebar Profile Meta + Learning Activity) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">

          {/* ── LEFT COLUMN (Sidebar Panels - 4 of 12 cols) ── */}
          <div className="lg:col-span-4 space-y-6">

            {/* Social & Web Links */}
            {(currentUser.linkedinUrl || currentUser.githubUrl) && (
              <div className="p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Social & Web</h3>
                <div className="space-y-2 text-xs font-semibold">
                  {currentUser.linkedinUrl && (
                    <a
                      href={currentUser.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      <FaLinkedin size={15} className="text-slate-500 shrink-0" />
                      <span className="truncate">{currentUser.linkedinUrl.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink size={12} className="ml-auto text-slate-400 shrink-0" />
                    </a>
                  )}
                  {currentUser.githubUrl && (
                    <a
                      href={currentUser.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      <Globe size={15} className="text-slate-500 shrink-0" />
                      <span className="truncate">{currentUser.githubUrl.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink size={12} className="ml-auto text-slate-400 shrink-0" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Achievements Section */}
            <div className="p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <div className="flex items-center justify-between mb-3.5">
                <Link
                  href="/achievements"
                  className="group inline-flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white hover:text-slate-600 transition-colors"
                >
                  <Trophy size={16} className="text-amber-500" />
                  <span>Achievements</span>
                  {(myBadges?.earned?.length ?? 0) > 0 && (
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      {myBadges?.earned?.length ?? 0}
                    </span>
                  )}
                </Link>
                <Link href="/achievements" className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:underline">
                  View all
                </Link>
              </div>

              {isLoadingBadges ? (
                <div className="flex items-center gap-2 py-3 text-xs text-slate-400">
                  <Loader2 className="animate-spin" size={14} />
                  <span>Loading achievements...</span>
                </div>
              ) : (myBadges?.earned?.length ?? 0) > 0 ? (
                <div className="flex flex-wrap items-center gap-4 pt-1">
                  {myBadges?.earned?.slice(0, 3).map((b) => (
                    <Link
                      key={b.credentialCode}
                      href={`/credentials/${encodeURIComponent(b.credentialCode)}`}
                      className="transition-transform hover:scale-105"
                      title={`${b.name} (${b.badgeClass.tier.label})`}
                    >
                      <CredentialBadge
                        family={b.badgeClass.family.key}
                        level={b.badgeClass.tier.level}
                        title={b.name}
                        className="w-16 h-16"
                      />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2">
                  No achievements unlocked yet.
                </p>
              )}
            </div>

            {/* Organizations Section */}
            <div className="p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <div className="flex items-center justify-between mb-3.5">
                <Link
                  href="/manage-channels"
                  className="group inline-flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white hover:text-slate-600 transition-colors"
                >
                  <Building2 size={16} className="text-slate-600 dark:text-slate-300" />
                  <span>Organizations</span>
                  {organizationChannels.length > 0 && (
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      {organizationChannels.length}
                    </span>
                  )}
                </Link>
                <Link href="/manage-channels" className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:underline">
                  View all
                </Link>
              </div>

              {isLoadingChannels ? (
                <div className="flex items-center gap-2 py-3 text-xs text-slate-400">
                  <Loader2 className="animate-spin" size={14} />
                  <span>Loading organizations...</span>
                </div>
              ) : organizationChannels.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2">
                  No organizations joined yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {/* Real Organizations (Latest 3) */}
                  {organizationChannels.slice(0, 3).map((channel) => {
                    const channelHref = channel.handle
                      ? `/${channel.handle}`
                      : `/channels/${channel.id}`;
                    return (
                      <Link
                        key={channel.id}
                        href={channelHref}
                        className="group flex items-center justify-between gap-3 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60">
                            {channel.iconUrl ? (
                              <img src={getAvatarUrl(channel.iconUrl)} alt={channel.name} className="h-full w-full object-cover" />
                            ) : (
                              <Building2 size={15} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 transition-colors">
                              {channel.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">Organization</p>
                          </div>
                        </div>
                        <ExternalLink size={12} className="text-slate-400 group-hover:text-indigo-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* ── RIGHT TOP: Learning Heatmap Panel (8 of 12 cols) ── */}
          <div className="lg:col-span-8">
            <div className="p-6 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-5">
                  <div className="flex items-center gap-2">
                    <Flame size={18} className="text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Annual Learning Activity</h3>
                  </div>
                  {currentStreak > 0 && (
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 px-2.5 py-1 rounded-full">
                      {currentStreak} Day Streak 🔥
                    </span>
                  )}
                </div>

                {/* Heatmap Grid */}
                <div className="w-full overflow-hidden">
                  <div className="flex gap-3 items-start">
                    <div className="hidden sm:grid grid-rows-7 gap-[3px] text-[9px] text-slate-400 font-bold select-none shrink-0 pt-4">
                      <div className="flex items-center h-[11px]">Sun</div>
                      <div className="h-[11px]" />
                      <div className="flex items-center h-[11px]">Wed</div>
                      <div className="h-[11px]" />
                      <div className="flex items-center h-[11px]">Fri</div>
                      <div className="h-[11px]" />
                    </div>

                    <div className="flex-grow overflow-x-auto scrollbar-none pb-1">
                      <div className="w-fit">
                        <div className="flex text-[9px] text-slate-400 font-bold mb-2 h-3.5 relative select-none">
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

                        <div className="grid grid-flow-col grid-rows-7 gap-[3px]">
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
                                className={`w-[11px] h-[11px] rounded-xs transition-all duration-150 cursor-pointer ${
                                  cell.level === 0 ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200' :
                                  cell.level === 1 ? 'bg-teal-200 dark:bg-teal-900/60 hover:scale-110' :
                                  cell.level === 2 ? 'bg-teal-400 dark:bg-teal-600 hover:scale-110' :
                                  'bg-teal-600 dark:bg-teal-500 hover:scale-110 shadow-2xs'
                                }`}
                              />
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-4 text-xs text-slate-400 font-medium">
                    <span>Less</span>
                    <div className="w-2.5 h-2.5 rounded-xs bg-slate-100 dark:bg-slate-800" />
                    <div className="w-2.5 h-2.5 rounded-xs bg-teal-200 dark:bg-teal-900/60" />
                    <div className="w-2.5 h-2.5 rounded-xs bg-teal-400 dark:bg-teal-600" />
                    <div className="w-2.5 h-2.5 rounded-xs bg-teal-600 dark:bg-teal-500" />
                    <span>More</span>
                  </div>
                </div>
              </div>

              {/* Quick Stat Bar inside Learning activity box */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-slate-400 font-medium">Total Courses:</span>{' '}
                    <strong className="text-slate-900 dark:text-white font-bold">{coursesList.length}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Total Events:</span>{' '}
                    <strong className="text-slate-900 dark:text-white font-bold">{eventsList.length}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Credentials:</span>{' '}
                    <strong className="text-slate-900 dark:text-white font-bold">{myBadges?.earned?.length ?? 0}</strong>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400">
                  Updated in real-time
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── 4. Dynamic Full-Width Content Library Section (Clean Minimal Container) ── */}
        <div className="rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">

          {/* Seamless Integrated Header with Title & Navigation Tabs */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 sm:p-6 pb-2">
            {/* Title & Eyebrow */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Content & Curriculum
                </h3>
                <p className="text-xs text-slate-400">
                  {activeHubTab === 'courses' ? 'Comprehensive course catalog' : 'Interactive sessions & live events'}
                </p>
              </div>
            </div>

            {/* Right: Tabs & Search Filter */}
            <div className="flex items-center justify-end gap-2.5 w-full lg:w-auto">
              <div className="flex h-9 items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => { setActiveHubTab('courses'); setContentSearchQuery(''); }}
                  className={`h-full flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeHubTab === 'courses'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <BookOpen size={13} className={activeHubTab === 'courses' ? 'text-slate-900 dark:text-white' : 'text-slate-400'} />
                  <span>Courses</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeHubTab === 'courses'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200'
                      : 'bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {coursesList.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveHubTab('events'); setContentSearchQuery(''); }}
                  className={`h-full flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeHubTab === 'events'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <CalendarDays size={13} className={activeHubTab === 'events' ? 'text-slate-900 dark:text-white' : 'text-slate-400'} />
                  <span>Events</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeHubTab === 'events'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200'
                      : 'bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {eventsList.length}
                  </span>
                </button>
              </div>

              {/* Dynamic Expandable Search with matching height h-9 */}
              <div
                className={`relative h-9 flex items-center transition-all duration-300 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 ${
                  isSearchExpanded || contentSearchQuery
                    ? 'w-48 sm:w-60'
                    : 'w-9 sm:w-9'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchExpanded(true);
                    setTimeout(() => searchInputRef.current?.focus(), 50);
                  }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Search publications"
                >
                  <Search size={14} />
                </button>

                <input
                  ref={searchInputRef}
                  type="text"
                  value={contentSearchQuery}
                  onFocus={() => setIsSearchExpanded(true)}
                  onBlur={() => {
                    if (!contentSearchQuery) setIsSearchExpanded(false);
                  }}
                  onChange={(e) => setContentSearchQuery(e.target.value)}
                  placeholder="Search titles..."
                  className={`h-full bg-transparent pr-7 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all duration-200 ${
                    isSearchExpanded || contentSearchQuery
                      ? 'w-full pl-1 opacity-100'
                      : 'w-0 pl-0 opacity-0 pointer-events-none'
                  }`}
                />

                {(isSearchExpanded || contentSearchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setContentSearchQuery('');
                      setIsSearchExpanded(false);
                    }}
                    className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Body Content Area */}
          <div className="p-5 sm:p-6 pt-2">
            {/* TAB 1: ALL COURSES (Full-Width Responsive 3-Column Grid with Smooth Expander) */}
            {activeHubTab === 'courses' && (
              <div>
                {!contentSearchQuery && coursesList.length > 6 && (
                  <div className="flex justify-end pb-3">
                    <span className="text-xs font-semibold text-slate-400">
                      Showing {isCoursesExpanded ? coursesList.length : 6} of {coursesList.length}
                    </span>
                  </div>
                )}

                {isLoadingContent ? (
                  <div className="flex h-48 w-full flex-col items-center justify-center gap-2 text-slate-400">
                    <Loader2 className="animate-spin text-teal-600" size={24} />
                    <span className="text-xs font-medium">Loading courses...</span>
                  </div>
                ) : displayedContent.length === 0 ? (
                  <ProfileEmptyState
                    icon={BookOpen}
                    title={contentSearchQuery ? "No matching courses found" : "No courses published yet"}
                    description={contentSearchQuery ? `No courses matched "${contentSearchQuery}". Try clearing search.` : "Published course series will appear here."}
                  />
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {(contentSearchQuery || isCoursesExpanded ? displayedContent : displayedContent.slice(0, 6)).map((item) => (
                        <ContentCard
                          key={item.id}
                          item={item}
                          kind="COURSE"
                          href={`/courses/${item.id}`}
                        />
                      ))}
                    </div>

                    {/* Smooth Expander for > 6 Courses */}
                    {!contentSearchQuery && coursesList.length > 6 && (
                      <div className="mt-8 flex justify-center">
                        <button
                          type="button"
                          onClick={() => setIsCoursesExpanded((prev) => !prev)}
                          className="group inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-6 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                        >
                          <span>
                            {isCoursesExpanded
                              ? 'Show fewer courses'
                              : `Show all courses (${coursesList.length - 6} more)`}
                          </span>
                          {isCoursesExpanded ? (
                            <ChevronUp size={15} className="transition-transform group-hover:-translate-y-0.5" />
                          ) : (
                            <ChevronDown size={15} className="transition-transform group-hover:translate-y-0.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* TAB 2: EVENTS & WORKSHOPS (Full-Width Responsive 3-Column Grid with Smooth Expander) */}
            {activeHubTab === 'events' && (
              <div>
                {!contentSearchQuery && eventsList.length > 6 && (
                  <div className="flex justify-end pb-3">
                    <span className="text-xs font-semibold text-slate-400">
                      Showing {isEventsExpanded ? eventsList.length : 6} of {eventsList.length}
                    </span>
                  </div>
                )}

                {isLoadingContent ? (
                  <div className="flex h-48 w-full flex-col items-center justify-center gap-2 text-slate-400">
                    <Loader2 className="animate-spin text-purple-600" size={24} />
                    <span className="text-xs font-medium">Loading events...</span>
                  </div>
                ) : displayedContent.length === 0 ? (
                  <ProfileEmptyState
                    icon={CalendarDays}
                    title={contentSearchQuery ? "No matching events found" : "No events hosted yet"}
                    description={contentSearchQuery ? `No events matched "${contentSearchQuery}". Try clearing search.` : "Scheduled live workshops will appear here."}
                  />
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {(contentSearchQuery || isEventsExpanded ? displayedContent : displayedContent.slice(0, 6)).map((item) => (
                        <ContentCard
                          key={item.id}
                          item={item}
                          kind="EVENT"
                          href={`/events/${item.id}`}
                        />
                      ))}
                    </div>

                    {/* Smooth Expander for > 6 Events */}
                    {!contentSearchQuery && eventsList.length > 6 && (
                      <div className="mt-8 flex justify-center">
                        <button
                          type="button"
                          onClick={() => setIsEventsExpanded((prev) => !prev)}
                          className="group inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-6 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-purple-600 dark:hover:text-purple-400 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                        >
                          <span>
                            {isEventsExpanded
                              ? 'Show fewer events'
                              : `Show all events (${eventsList.length - 6} more)`}
                          </span>
                          {isEventsExpanded ? (
                            <ChevronUp size={15} className="transition-transform group-hover:-translate-y-0.5" />
                          ) : (
                            <ChevronDown size={15} className="transition-transform group-hover:translate-y-0.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </>
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
