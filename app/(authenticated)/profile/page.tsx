'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { UserService } from "@/domains/identity";
import { useActivitySummaryQuery, useDailyActivityQuery } from '@/domains/learning';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvatarUrl } from '@/shared/utils/avatar';
import {
  User as UserIcon, MapPin, Mail, Calendar, Edit3,
  Code, Star,
  Flame,
  Loader2, X, Camera, Globe,
  BadgeCheck, Lock, Trash2, Sparkles, Shield
} from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';
import { ImageCropModal } from '@/shared/design-system/ui/image-crop-modal';


function ProfilePageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const { user, updateUser } = useAuthStore();
  const { data: activitySummary } = useActivitySummaryQuery(Boolean(user));
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

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-purple-600" size={36} />
        <p className="text-sm font-semibold text-slate-400">Fetching profile details from database...</p>
      </div>
    );
  }

  const currentUser = profileData || user;

  const username = currentUser.username || currentUser.email?.split('@')[0] || 'username';

  return (
    <>
      {/* Page Background */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-slate-50 via-[#f8fafc] to-slate-100 dark:from-[#090d16] dark:via-[#0f172a] dark:to-[#090d16]"></div>
      
      {/* Ambient background glow orbs */}
      <div className="fixed top-12 left-1/4 w-[500px] h-[500px] bg-indigo-200/20 dark:bg-indigo-900/10 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="fixed top-96 right-1/4 w-[450px] h-[450px] bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-[130px] pointer-events-none z-0" />

      <motion.div 
        className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-28 relative transition-colors z-10"
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
                
                {/* Verification Tick */}
                {(() => {
                  const bioLower = (currentUser.bio || '').toLowerCase();
                  const isAdmin = 
                    currentUser.role === 'ADMIN' ||
                    currentUser.role === 'ROLE_ADMIN' ||
                    currentUser.role === 'PLATFORM_ADMIN' ||
                    currentUser.isAdmin === true ||
                    currentUser.platformRoles?.some((r: any) => ['PLATFORM_OWNER', 'PLATFORM_ADMIN'].includes((r.code || r.name || '').toUpperCase())) ||
                    currentUser.roles?.some((r: any) => (typeof r === 'string' ? r : r.code || r.name)?.toUpperCase().includes('ADMIN'));

                  const isCreator = 
                    currentUser.role === 'CREATOR' ||
                    currentUser.role === 'ROLE_CREATOR' ||
                    currentUser.role === 'INSTRUCTOR' ||
                    currentUser.isCreator === true ||
                    currentUser.platformRoles?.some((r: any) => ['CREATOR', 'INSTRUCTOR', 'TEACHER', 'AUTHOR'].includes((r.code || r.name || '').toUpperCase())) ||
                    currentUser.roles?.some((r: any) => (typeof r === 'string' ? r : r.code || r.name)?.toUpperCase().includes('CREATOR')) ||
                    bioLower.includes('creator');

                  if (isAdmin) {
                    return (
                      <span title="Verified Admin" className="inline-flex items-center">
                        <BadgeCheck className="text-white fill-[#8b5cf6] dark:fill-[#8b5cf6] drop-shadow-[0_2px_6px_rgba(139,92,246,0.4)] shrink-0 ml-1 align-middle" size={24} strokeWidth={2.2} />
                      </span>
                    );
                  }

                  if (isCreator) {
                    return (
                      <span title="Verified Creator" className="inline-flex items-center">
                        <BadgeCheck className="text-white fill-[#1d9bf0] dark:fill-[#1d9bf0] drop-shadow-[0_2px_6px_rgba(29,155,240,0.4)] shrink-0 ml-1 align-middle" size={24} strokeWidth={2.2} />
                      </span>
                    );
                  }
                  return null;
                })()}
              </h1>

              <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                <span className="text-base font-normal text-slate-500 dark:text-slate-400">
                  @{username}
                </span>
                <span className="text-slate-400 font-medium">•</span>
                {(() => {
                  const bioLower = (currentUser.bio || '').toLowerCase();
                  const isAdmin = 
                    currentUser.role === 'ADMIN' ||
                    currentUser.role === 'ROLE_ADMIN' ||
                    currentUser.role === 'PLATFORM_ADMIN' ||
                    currentUser.isAdmin === true ||
                    currentUser.platformRoles?.some((r: any) => ['PLATFORM_OWNER', 'PLATFORM_ADMIN'].includes((r.code || r.name || '').toUpperCase())) ||
                    currentUser.roles?.some((r: any) => (typeof r === 'string' ? r : r.code || r.name)?.toUpperCase().includes('ADMIN'));

                  const isCreator = 
                    currentUser.role === 'CREATOR' ||
                    currentUser.role === 'ROLE_CREATOR' ||
                    currentUser.role === 'INSTRUCTOR' ||
                    currentUser.isCreator === true ||
                    currentUser.platformRoles?.some((r: any) => ['CREATOR', 'INSTRUCTOR', 'TEACHER', 'AUTHOR'].includes((r.code || r.name || '').toUpperCase())) ||
                    currentUser.roles?.some((r: any) => (typeof r === 'string' ? r : r.code || r.name)?.toUpperCase().includes('CREATOR')) ||
                    bioLower.includes('creator');

                  if (isAdmin) {
                    return (
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <Shield size={13} className="fill-rose-500/20 text-rose-600 dark:text-rose-400" /> Admin
                      </span>
                    );
                  }

                  if (isCreator) {
                    return (
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <Sparkles size={13} className="fill-blue-500 text-blue-500" /> Creator
                      </span>
                    );
                  }

                  return (
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Star size={13} className="fill-amber-500 text-amber-500" /> Learner
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Bio */}
            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-center md:text-left">
              {currentUser.bio ? (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-1">
                  <Code size={14} className="text-purple-600 dark:text-purple-400 shrink-0 mr-1" />
                  {currentUser.bio.split('|').map((part: string, i: number, arr: string[]) => (
                    <span key={i} className="inline-flex items-center">
                      {part.trim()}
                      {i < arr.length - 1 && <span className="mx-1.5 text-slate-300 dark:text-slate-700">|</span>}
                    </span>
                  ))}
                </div>
              ) : (
                <p>Passionate learner exploring new skills and enhancing knowledge every day.</p>
              )}
            </div>

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

            {/* GitHub-style Full Width Edit Profile Button */}
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold px-4 py-2 text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
            >
              <Edit3 size={15} />
              <span>Edit profile</span>
            </button>

          </div>

          {/* ── RIGHT MAIN CONTENT (GitHub Profile Cards Column) ── */}
          <div className="flex-1 min-w-0 w-full space-y-6">



            {/* 2. Learning Streak & GitHub Contribution Matrix */}
            <div className="py-2">
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

            {/* Achievements/badges/certificates are not backed by a real system yet — removed
                rather than shown as fake data. See docs/architecture/LEARNER_IDENTITY_DOMAIN.md. */}


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
                        <input
                          type="text"
                          required
                          value={editMobileNumber}
                          onChange={(e) => setEditMobileNumber(e.target.value)}
                          placeholder="+91 XXXXX XXXXX"
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
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
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">Bio</label>
                      <p className="mb-1.5 text-[11px] text-slate-400">Use | to split lines</p>
                      <textarea
                        rows={3}
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
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
