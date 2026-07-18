'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { UserService } from '@/services/user.service';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, MapPin, Link as LinkIcon, Mail, Calendar, Edit3, 
  ChevronRight, Code, GitPullRequest, Star, BookOpen, GitCommit, 
  MessageSquare, Flame, Trophy, Check, GraduationCap, Award, Compass,
  Loader2, X, Camera, Phone, Settings, Globe, CheckSquare
} from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';

const badges = [
  { name: 'Code Contributor', icon: Code, color: 'text-purple-600 dark:text-purple-400', fill: 'fill-purple-50 dark:fill-purple-500/20', stroke: 'stroke-purple-200 dark:stroke-purple-500/30' },
  { name: 'Pull Shark x10', icon: GitPullRequest, color: 'text-green-600 dark:text-green-400', fill: 'fill-green-50 dark:fill-green-500/20', stroke: 'stroke-green-200 dark:stroke-green-500/30' },
  { name: 'Star Contributor', icon: Star, color: 'text-amber-500 dark:text-amber-400', fill: 'fill-amber-50 dark:fill-amber-500/20', stroke: 'stroke-amber-200 dark:stroke-amber-500/30' },
  { name: 'Documentation Expert', icon: BookOpen, color: 'text-blue-600 dark:text-blue-400', fill: 'fill-blue-50 dark:fill-blue-500/20', stroke: 'stroke-blue-200 dark:stroke-blue-500/30' },
  { name: 'Commit Master', icon: GitCommit, color: 'text-rose-600 dark:text-rose-400', fill: 'fill-rose-50 dark:fill-rose-500/20', stroke: 'stroke-rose-200 dark:stroke-rose-500/30' },
  { name: 'Community Helper', icon: MessageSquare, color: 'text-sky-600 dark:text-sky-400', fill: 'fill-sky-50 dark:fill-sky-500/20', stroke: 'stroke-sky-200 dark:stroke-sky-500/30' },
  { name: 'Streak 7 Days', icon: Flame, color: 'text-indigo-600 dark:text-indigo-400', fill: 'fill-indigo-50 dark:fill-indigo-500/20', stroke: 'stroke-indigo-200 dark:stroke-indigo-500/30' },
  { name: 'Hacktoberfest Participant', icon: Trophy, color: 'text-orange-500 dark:text-orange-400', fill: 'fill-orange-50 dark:fill-orange-500/20', stroke: 'stroke-orange-200 dark:stroke-orange-500/30' },
];

function ProfilePageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const { user, updateUser } = useAuthStore();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Badge visibility toggle
  const [showAllBadges, setShowAllBadges] = useState(false);
  
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

  // Used to force a re-render when the TimeTracker updates local storage
  const [timeTick, setTimeTick] = useState(0);

  useEffect(() => {
    const handleTimeUpdate = () => setTimeTick(t => t + 1);
    const handleLocalTime = (e: Event) => {
      const customEvent = e as CustomEvent;
      const secondsToAdd = customEvent.detail.seconds;
      setActivityData(prev => {
        const today = new Date().toISOString().split('T')[0];
        const current = prev[today] || 0;
        return { ...prev, [today]: current + secondsToAdd };
      });
    };
    window.addEventListener('timeTrackerUpdated', handleTimeUpdate);
    window.addEventListener('localTimeIncrement', handleLocalTime);
    // Also trigger an initial tick to pick up SSR hydration differences
    setTimeTick(1);
    return () => {
      window.removeEventListener('timeTrackerUpdated', handleTimeUpdate);
      window.removeEventListener('localTimeIncrement', handleLocalTime);
    };
  }, []);
  const [editEmail, setEditEmail] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Avatar upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Settings dropdown state for contribution activity
  const [showSettings, setShowSettings] = useState(false);

  const [activityData, setActivityData] = useState<Record<string, number>>({});

  useEffect(() => {
    if (profileData?.username) {
      UserService.getUserActivity(profileData.username).then(data => {
        const dataMap: Record<string, number> = {};
        data.forEach((item: any) => {
          dataMap[item.date] = item.secondsSpent;
        });
        setActivityData(dataMap);
      }).catch(console.error);
    }
  }, [profileData?.username, timeTick]);
  const [showPrivateActivity, setShowPrivateActivity] = useState(true);
  const [activityVisibility, setActivityVisibility] = useState('Public');

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

    setIsUploadingAvatar(true);
    try {
      const updatedUser = await UserService.uploadAvatar(file);
      updateUser(updatedUser);
      setProfileData(updatedUser);
      toast.success('Avatar uploaded successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Generate 53x7 grid with real date calculation and random counts
  const contributionGrid = useMemo(() => {
    const cols = 53;
    const rows = 7;
    const today = new Date();
    const grid = [];
    
    for (let c = 0; c < cols; c++) {
      const week = [];
      for (let r = 0; r < rows; r++) {
        // Calculate offset in days relative to today
        const todayDayOfWeek = (today.getDay() + 6) % 7; // Mon=0, Sun=6
        const dayOffset = (52 - c) * 7 + (todayDayOfWeek - r);
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() - dayOffset);
        
        const dateStr = targetDate.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });

        const targetDateISO = targetDate.toISOString().split('T')[0];
        
        let count = 0; // minutes
        if (activityData[targetDateISO]) {
          count = Math.floor(activityData[targetDateISO] / 60);
        }

        let level = 0;
        if (count < 15) level = 0; // Blank
        else if (count < 30) level = 1; // Light Blue
        else if (count < 45) level = 2; // Little Dark Blue
        else level = 3; // Dark Blue

        week.push({ dateStr, count, level });
      }
      grid.push(week);
    }
    return grid;
  }, [activityData]);

  const totalMinutesSpent = useMemo(() => {
    let total = 0;
    contributionGrid.forEach(week => {
      week.forEach(cell => {
        total += cell.count;
      });
    });
    return total;
  }, [contributionGrid]);

  const currentStreak = useMemo(() => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - i);
      const targetDateISO = targetDate.toISOString().split('T')[0];
      
      let count = 0;
      if (activityData[targetDateISO]) {
        count = Math.floor(activityData[targetDateISO] / 60);
      }
      
      if (count > 0) {
        streak++;
      } else {
        if (i === 0) continue; // If today is 0, don't break the streak just yet
        break;
      }
    }
    return streak;
  }, [activityData]);

  const dynamicBadges = useMemo(() => {
    return badges.map(b => {
      if (b.name.startsWith('Streak')) {
        return { ...b, name: `Streak ${currentStreak} Days` };
      }
      return b;
    });
  }, [currentStreak]);

  const months = useMemo(() => {
    const cols = [0, 4, 9, 13, 17, 22, 26, 31, 35, 39, 44, 48, 52];
    const today = new Date();
    return cols.map(c => {
      const d = new Date(today);
      d.setDate(today.getDate() - (52 - c) * 7);
      return { name: d.toLocaleDateString(undefined, { month: 'short' }), col: c };
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-indigo-600" size={36} />
        <p className="text-sm font-semibold text-slate-400">Fetching profile details from database...</p>
      </div>
    );
  }

  const currentUser = profileData || user;
  const getAvatarUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    if (url.startsWith('/api/v1/')) {
      return baseUrl.replace('/api/v1', '') + url;
    }
    if (!url.includes('/')) {
      return baseUrl + '/users/avatars/' + url;
    }
    return baseUrl + (url.startsWith('/') ? '' : '/') + url;
  };

  const username = currentUser.username || currentUser.email?.split('@')[0] || 'username';
  const displayedBadges = showAllBadges ? dynamicBadges : dynamicBadges.slice(0, 5);

  return (
    <motion.div 
      className="mx-auto max-w-6xl w-full space-y-6 pb-16 px-4 sm:px-6 relative transition-colors"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      
      {/* ── Main Profile Header Card ── */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-100 dark:border-neutral-900 bg-white dark:bg-black px-6 py-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] transition-colors">
        {/* Decorative background blurs */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 opacity-30 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          
          {/* Avatar with Double Gradient Ring & Inline Upload Edit overlay */}
          <div className="relative group flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-md shadow-indigo-100 shrink-0">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-white overflow-hidden border-2 border-white relative">
              {currentUser.avatarUrl ? (
                <img src={getAvatarUrl(currentUser.avatarUrl)} alt="Avatar" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <UserIcon size={52} className="text-indigo-400" />
              )}

              {/* Camera Hover Overlay */}
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute inset-0 bg-black/45 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Upload Avatar"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="animate-spin text-white" size={24} />
                ) : (
                  <Camera size={24} />
                )}
              </button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/jpeg, image/png, image/webp" 
              onChange={handleAvatarSelect}
            />
          </div>

          {/* Details / Bio - Enlarged Layout */}
          <div className="flex-grow flex flex-col items-center md:items-start text-center md:text-left pt-2 w-full">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white tracking-tight leading-none transition-colors">
              {currentUser.fullName || (currentUser.firstName + (currentUser.lastName ? ' ' + currentUser.lastName : '')) || 'User'}
            </h1>
            
            <p className="text-base font-bold text-slate-400 dark:text-neutral-500 mt-1 transition-colors">
              @{username}
            </p>

            {/* Enlarged Bio */}
            {currentUser.bio && (
              <div className="mt-4 space-y-2 text-slate-700 dark:text-neutral-300 text-base font-bold leading-relaxed w-full transition-colors">
                <div className="flex flex-col gap-1 items-center md:items-start">
                  {currentUser.bio.split('|').map((part: string, i: number) => (
                    <span key={i} className="inline-block">{part.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Location / Git / Email / LinkedIn / Mobile / Gender Details list */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-sm text-slate-500 dark:text-neutral-400 font-semibold w-full pt-5 border-t border-slate-100 dark:border-neutral-900 transition-colors">
              {currentUser.address && (
                <div className="flex items-center justify-center md:justify-start gap-2.5">
                  <MapPin size={16} className="text-slate-400 shrink-0" />
                  <span className="truncate">{currentUser.address}</span>
                </div>
              )}
              
              {currentUser.githubUrl && (
                <div className="flex items-center justify-center md:justify-start gap-2.5">
                  <LinkIcon size={16} className="text-slate-400 shrink-0" />
                  <a href={currentUser.githubUrl} target="_blank" rel="noreferrer" className="hover:text-indigo-600 transition-colors truncate max-w-full">
                    {currentUser.githubUrl.replace('https://', '')}
                  </a>
                </div>
              )}
              
              <div className="flex items-center justify-center md:justify-start gap-2.5 font-bold">
                <Mail size={16} className="text-slate-400 shrink-0" />
                <span className="truncate">{currentUser.email}</span>
              </div>
              
              {currentUser.linkedinUrl && (
                <div className="flex items-center justify-center md:justify-start gap-2.5">
                  <FaLinkedin size={16} className="text-[#0077b5] shrink-0" />
                  <a href={currentUser.linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-indigo-600 transition-colors truncate">
                    {currentUser.linkedinUrl.replace('https://', '')}
                  </a>
                </div>
              )}

              {currentUser.mobileNumber && (
                <div className="flex items-center justify-center md:justify-start gap-2.5">
                  <Phone size={16} className="text-slate-400 shrink-0" />
                  <span>{currentUser.mobileNumber}</span>
                </div>
              )}




            </div>
          </div>

          {/* Edit Profile Button - Opens Modal */}
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="md:self-start inline-flex items-center gap-2 rounded-xl bg-white dark:bg-black px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-neutral-200 shadow-sm border border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-900 active:scale-[0.98] transition-all duration-200 shrink-0 cursor-pointer"
          >
            <Edit3 size={14} />
            Edit Profile
          </button>
        </div>
      </div>

      {/* ── Badges Section - Resized Smaller ── */}
      <div className="rounded-3xl border border-slate-100 dark:border-neutral-900 bg-white dark:bg-black px-6 py-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] transition-colors">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2 transition-colors">
            Badges <span className="text-slate-400 font-medium">({badges.length})</span>
          </h3>
          <button 
            onClick={() => setShowAllBadges(!showAllBadges)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-0.5 cursor-pointer focus:outline-none"
          >
            {showAllBadges ? 'Show less <' : 'View all >'}
          </button>
        </div>

        {/* Scaled-down badges grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 sm:gap-4 justify-items-center">
          <AnimatePresence>
            {displayedBadges.map((badge, idx) => {
              const BadgeIcon = badge.icon;
              return (
                <motion.div 
                  key={badge.name} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center gap-2.5 w-28 group"
                >
                  {/* SVG Hexagon Shape - Smaller Scale */}
                  <div className="relative w-14 h-14 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-slate-50/50 dark:text-neutral-900/50 fill-current stroke-[3.5] stroke-slate-200 dark:stroke-neutral-800 group-hover:stroke-indigo-300 dark:group-hover:stroke-indigo-600 group-hover:text-indigo-50/30 transition-all duration-300">
                      <polygon points="50,5 90,28 90,72 50,95 10,72 10,28" />
                    </svg>
                    
                    <svg viewBox="0 0 100 100" className={`absolute inset-1 w-[88%] h-[88%] ${badge.fill} fill-current stroke-[2.5] ${badge.stroke}`}>
                      <polygon points="50,5 90,28 90,72 50,95 10,72 10,28" />
                    </svg>
                    
                    <div className={`relative z-10 ${badge.color}`}>
                      <BadgeIcon size={16} />
                    </div>
                  </div>
                  
                  <span className="text-[10px] font-bold text-slate-500 text-center leading-tight tracking-tight px-1">
                    {badge.name}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Working GitHub-Style Contribution Section (Indigo Light Theme) ── */}
      <div className="rounded-3xl border border-slate-100 dark:border-neutral-900 bg-white dark:bg-black px-6 py-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] text-slate-700 dark:text-neutral-300 font-sans relative transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white tracking-tight transition-colors">
            {totalMinutesSpent} minutes spent in the last year
          </h3>
          
          {/* Interactive Contribution Settings Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 cursor-pointer focus:outline-none"
            >
              <span>Contribution settings</span>
              <Settings size={12} className={`transition-transform duration-200 ${showSettings ? 'rotate-90' : ''}`} />
            </button>
            
            <AnimatePresence>
              {showSettings && (
                <>
                  {/* Backdrop Clicker */}
                  <div className="fixed inset-0 z-30" onClick={() => setShowSettings(false)}></div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-100 bg-white p-2.5 shadow-xl z-40 text-xs font-semibold text-slate-600"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Visibility
                    </div>
                    <button 
                      onClick={() => { setActivityVisibility('Public'); setShowSettings(false); }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 text-left cursor-pointer"
                    >
                      <span>Public activity only</span>
                      {activityVisibility === 'Public' && <Check size={14} className="text-indigo-600" />}
                    </button>
                    <button 
                      onClick={() => { setActivityVisibility('Private'); setShowSettings(false); }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 text-left cursor-pointer"
                    >
                      <span>Include private activity</span>
                      {activityVisibility === 'Private' && <Check size={14} className="text-indigo-600" />}
                    </button>
                    
                    <div className="h-px bg-slate-100 my-1.5"></div>
                    
                    <button 
                      onClick={() => setShowPrivateActivity(!showPrivateActivity)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 text-left cursor-pointer"
                    >
                      <span>Show private counts</span>
                      {showPrivateActivity && <Check size={14} className="text-indigo-600" />}
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Outer border box for the grid - styled in clean Light Mode */}
        <div className="border border-slate-100 dark:border-neutral-800 rounded-2xl p-4 sm:p-6 bg-slate-50/50 dark:bg-neutral-900/30 transition-colors">
          <div className="flex gap-3 items-start">
            
            {/* Mon, Wed, Fri Labels */}
            <div className="hidden sm:grid grid-rows-7 gap-[2px] md:gap-[3px] text-[8px] md:text-[9px] text-slate-400 font-bold select-none shrink-0 pt-5">
              <div className="h-[7px] md:h-[10px] lg:h-[11px]"></div>
              <div className="flex items-center h-[7px] md:h-[10px] lg:h-[11px]">Mon</div>
              <div className="h-[7px] md:h-[10px] lg:h-[11px]"></div>
              <div className="flex items-center h-[7px] md:h-[10px] lg:h-[11px]">Wed</div>
              <div className="h-[7px] md:h-[10px] lg:h-[11px]"></div>
              <div className="flex items-center h-[7px] md:h-[10px] lg:h-[11px]">Fri</div>
              <div className="h-[7px] md:h-[10px] lg:h-[11px]"></div>
            </div>

            <div className="flex-grow w-full overflow-hidden flex justify-end sm:justify-start">
              <div className="w-fit">
                <div className="flex text-[9px] text-slate-400 font-bold mb-1.5 h-3.5 relative select-none">
                  {months.map((m, i) => (
                    <span 
                      key={`${m.name}-${m.col}-${i}`} 
                      className="absolute" 
                      style={{ left: `calc(${m.col} * (100% / 53))` }}
                    >
                      {m.name}
                    </span>
                  ))}
                </div>

                <div className="grid grid-flow-col grid-rows-7 gap-[1px] sm:gap-[2px] md:gap-[3px]">
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
                      className={`w-[5px] h-[5px] sm:w-[7px] sm:h-[7px] md:w-[10px] md:h-[10px] lg:w-[11px] lg:h-[11px] rounded-[1px] sm:rounded-[1.5px] border-[0.5px] border-slate-200/20 transition-all duration-200 cursor-pointer ${
                        cell.level === 0 ? 'bg-slate-100 hover:bg-indigo-50 border-slate-200 dark:bg-neutral-800 dark:border-neutral-800 dark:hover:bg-neutral-700' :
                        cell.level === 1 ? 'bg-indigo-200/70 hover:scale-105' :
                        cell.level === 2 ? 'bg-indigo-400 hover:scale-105' :
                        'bg-indigo-600 hover:scale-105 shadow-sm'
                      }`}
                    />
                  ))
                )}
              </div>
            </div>
            </div>
          </div>

          {/* Grid Footer - Interactive elements */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3 mt-4 text-[10px] text-slate-400 font-semibold pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 select-none">
              <span>Less</span>
              <div className="w-[10px] h-[10px] sm:w-[11px] sm:h-[11px] rounded-[1.5px] bg-slate-100 border border-slate-200"></div>
              <div className="w-[10px] h-[10px] sm:w-[11px] sm:h-[11px] rounded-[1.5px] bg-indigo-200/70"></div>
              <div className="w-[10px] h-[10px] sm:w-[11px] sm:h-[11px] rounded-[1.5px] bg-indigo-400"></div>
              <div className="w-[10px] h-[10px] sm:w-[11px] sm:h-[11px] rounded-[1.5px] bg-indigo-600"></div>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contribution Activity Section Header */}
      <div className="flex items-center gap-2 mt-6">
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">
          Contribution activity
        </h3>
        <span className="rounded-md bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 text-[9px] font-extrabold text-indigo-700 uppercase tracking-wide">Live</span>
      </div>

      {/* ── Sub Navigation Tabs Area ── */}
      <div className="space-y-6">
        <div className="flex border-b border-slate-100 font-sans">
          {(['courses', 'enrolled', 'certificates'] as const).map((tab) => {
            const label = tab === 'courses' ? 'Courses' : tab === 'enrolled' ? 'Enrolled' : 'Certificates';
            const TabIcon = tab === 'courses' ? Compass : tab === 'enrolled' ? GraduationCap : Award;
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex items-center gap-2 px-6 py-4 text-sm font-bold transition-colors cursor-pointer focus:outline-none ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <TabIcon size={16} />
                {label}
                {isActive && (
                  <motion.div 
                    layoutId="profile-tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="min-h-[220px]">
          <AnimatePresence mode="wait">
            {activeTab === 'courses' && (
              <motion.div
                key="courses"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {currentUser.courses && currentUser.courses.length > 0 ? (
                  currentUser.courses.map((course: any, idx: number) => (
                    <div key={idx} className="group rounded-2xl border border-slate-100 dark:border-neutral-900 bg-white dark:bg-black p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)] hover:shadow-[0_8px_35_rgba(99,102,241,0.03)] transition-all flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white tracking-tight leading-snug group-hover:text-indigo-600 transition-colors">
                          {course.title}
                        </h4>
                        <p className="text-xs text-slate-400 dark:text-neutral-500 font-medium leading-relaxed mt-2 transition-colors">
                          {course.description || 'No description provided.'}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-50 dark:border-neutral-900 flex items-center justify-between gap-4 transition-colors">
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-neutral-500 tracking-wider transition-colors">
                            <span>PROGRESS</span>
                            <span className="text-indigo-600 dark:text-indigo-400">{course.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden transition-colors">
                            <div className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${course.progress}%` }}></div>
                          </div>
                        </div>
                        <span className="text-[10px] font-extrabold text-slate-400 dark:text-neutral-500 tracking-wide uppercase shrink-0 transition-colors">{course.duration}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12 border-2 border-dashed border-slate-100 dark:border-neutral-800 rounded-2xl text-slate-400 text-sm font-semibold bg-slate-50/20 dark:bg-neutral-900/30 transition-colors">
                    No uploaded courses found in the database.
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'enrolled' && (
              <motion.div
                key="enrolled"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {currentUser.enrolledCourses && currentUser.enrolledCourses.length > 0 ? (
                  currentUser.enrolledCourses.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 dark:border-neutral-900 bg-white dark:bg-black shadow-[0_4px_20px_rgb(0,0,0,0.01)] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100/50 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 transition-colors">
                          <GraduationCap size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 dark:text-white tracking-tight leading-snug transition-colors">{item.title}</h4>
                          <p className="text-xs text-slate-400 dark:text-neutral-500 font-semibold mt-1 transition-colors">Type: {item.type} • Date: {item.date}</p>
                        </div>
                      </div>
                      <span className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 transition-colors">
                        {item.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-neutral-800 rounded-2xl text-slate-400 text-sm font-semibold bg-slate-50/20 dark:bg-neutral-900/30 transition-colors">
                    No enrolled courses found in the database.
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'certificates' && (
              <motion.div
                key="certificates"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {currentUser.certificates && currentUser.certificates.length > 0 ? (
                  currentUser.certificates.map((cert: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 dark:border-neutral-900 bg-white dark:bg-black shadow-[0_4px_20px_rgb(0,0,0,0.01)] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 text-amber-500 dark:text-amber-400 transition-colors">
                          <Award size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 dark:text-white tracking-tight leading-snug transition-colors">{cert.name}</h4>
                          <p className="text-xs text-slate-400 dark:text-neutral-500 font-semibold mt-1 transition-colors">Issued by {cert.issuer} • {cert.date}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 px-3 py-1 rounded-lg select-none transition-colors">
                        ID: {cert.idCode}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-neutral-800 rounded-2xl text-slate-400 text-sm font-semibold bg-slate-50/20 dark:bg-neutral-900/30 transition-colors">
                    No certifications found in the database.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Edit Profile Modal (Supports all old and new fields) ── */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Glass Backdrop Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            {/* Modal Body Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-lg rounded-3xl border border-slate-100 dark:border-neutral-800 bg-white dark:bg-black shadow-2xl z-10 flex flex-col max-h-[85vh] overflow-hidden transition-colors"
            >
              {/* Pinned Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 px-6 py-4.5 transition-colors">
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-white tracking-tight transition-colors">Edit Profile Info</h3>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleEditSubmit} className="flex flex-col flex-grow overflow-hidden">
                <div className="flex-grow overflow-y-auto px-6 py-5 space-y-4 scrollbar-thin scrollbar-thumb-slate-200">
                  


                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">First Name</label>
                      <input 
                        type="text" 
                        required
                        value={editFirstName}
                        onChange={(e) => setEditFirstName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-black px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Name</label>
                      <input 
                        type="text" 
                        required
                        value={editLastName}
                        onChange={(e) => setEditLastName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-black px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Username Field with Validation & Suggestions */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Username</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        required
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                        className={`w-full rounded-xl border bg-white dark:bg-black px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 transition-colors ${
                          usernameAvailable === true ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500' :

                          usernameAvailable === false ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' :
                          'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500'
                        }`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        {isCheckingUsername && <Loader2 className="animate-spin text-indigo-500" size={14} />}
                        {usernameAvailable === true && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Available</span>}
                        {usernameAvailable === false && <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">Taken</span>}
                      </div>
                    </div>
                    {usernameAvailable === false && usernameSuggestions.length > 0 && (
                      <div className="bg-rose-50/50 p-2.5 rounded-xl border border-rose-100/50 text-[11px] space-y-1.5">
                        <span className="font-bold text-rose-700">Username is taken. Try one of these:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {usernameSuggestions.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setEditUsername(s)}
                              className="bg-white border border-rose-200 hover:border-indigo-400 text-slate-700 font-bold px-2 py-0.5 rounded-lg active:scale-95 transition-all cursor-pointer"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Locked Email & Locked Gender */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                        <span className="text-[9px] font-extrabold text-slate-400 flex items-center gap-0.5 uppercase">Locked</span>
                      </div>
                      <input 
                        type="email" 
                        disabled
                        value={editEmail}
                        className="w-full rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 px-3 py-2 text-sm text-slate-400 cursor-not-allowed select-none focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gender</label>
                        <span className="text-[9px] font-extrabold text-slate-400 flex items-center gap-0.5 uppercase">Locked</span>
                      </div>
                      <select 
                        disabled
                        value={editGender}
                        className="w-full appearance-none rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 px-3 py-2.5 text-sm text-slate-400 cursor-not-allowed select-none focus:outline-none transition-colors"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">LinkedIn Profile Link</label>
                      <input 
                        type="url" 
                        value={editLinkedinUrl}
                        onChange={(e) => setEditLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-black px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">GitHub Profile Link</label>
                      <input 
                        type="url" 
                        value={editGithubUrl}
                        onChange={(e) => setEditGithubUrl(e.target.value)}
                        placeholder="https://github.com/username"
                        className="w-full rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-black px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Mobile & Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mobile Number</label>
                      <input 
                        type="text" 
                        required
                        value={editMobileNumber}
                        onChange={(e) => setEditMobileNumber(e.target.value)}
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-black px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Address</label>
                      <input 
                        type="text" 
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        placeholder="House, Street, City, State, Country"
                        className="w-full rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-black px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bio (Split using '|' for multiple lines)</label>
                    <textarea 
                      rows={3}
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-black px-3 py-2 text-sm text-slate-800 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none transition-colors"
                    />
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="border-t border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30 px-6 py-4 flex items-center justify-end gap-3 transition-colors">
                  <button 
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving || usernameAvailable === false}
                    className="px-5 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving && <Loader2 size={16} className="animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Absolute Custom Hover Tooltip */}
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
            <span>{hoveredCell.count === 0 ? '0 minutes spent' : `${hoveredCell.count} minutes spent`}</span>
            <span className="text-slate-400 font-semibold">on {hoveredCell.dateStr}</span>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>}>
      <ProfilePageContent />
    </Suspense>
  );
}
