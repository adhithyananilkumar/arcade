'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
  { name: 'Code Contributor', icon: Code, color: 'text-purple-600', fill: 'fill-purple-50', stroke: 'stroke-purple-200' },
  { name: 'Pull Shark x10', icon: GitPullRequest, color: 'text-green-600', fill: 'fill-green-50', stroke: 'stroke-green-200' },
  { name: 'Star Contributor', icon: Star, color: 'text-amber-500', fill: 'fill-amber-50', stroke: 'stroke-amber-200' },
  { name: 'Documentation Expert', icon: BookOpen, color: 'text-blue-600', fill: 'fill-blue-50', stroke: 'stroke-blue-200' },
  { name: 'Commit Master', icon: GitCommit, color: 'text-rose-600', fill: 'fill-rose-50', stroke: 'stroke-rose-200' },
  { name: 'Community Helper', icon: MessageSquare, color: 'text-sky-600', fill: 'fill-sky-50', stroke: 'stroke-sky-200' },
  { name: 'Streak 7 Days', icon: Flame, color: 'text-indigo-600', fill: 'fill-indigo-50', stroke: 'stroke-indigo-200' },
  { name: 'Hacktoberfest Participant', icon: Trophy, color: 'text-orange-500', fill: 'fill-orange-50', stroke: 'stroke-orange-200' },
];

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Badge visibility toggle
  const [showAllBadges, setShowAllBadges] = useState(false);
  
  // Sub Navigation Active Tab
  const [activeTab, setActiveTab] = useState<'courses' | 'enrolled' | 'certificates'>('courses');
  
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
  
  // Avatar upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Settings dropdown state for contribution activity
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
        const dayOffset = (52 - c) * 7 + (6 - r);
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() - dayOffset);
        
        const dateStr = targetDate.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });

        let level = 0;
        const rand = Math.random();
        if (c >= 38 && c <= 50) { // simulate active periods
          if (rand < 0.15) level = 0;
          else if (rand < 0.45) level = 1;
          else if (rand < 0.75) level = 2;
          else if (rand < 0.92) level = 3;
          else level = 4;
        } else {
          if (rand < 0.65) level = 0;
          else if (rand < 0.82) level = 1;
          else if (rand < 0.94) level = 2;
          else if (rand < 0.98) level = 3;
          else level = 4;
        }

        let count = 0;
        if (level === 1) count = Math.floor(Math.random() * 3) + 1;
        else if (level === 2) count = Math.floor(Math.random() * 4) + 4;
        else if (level === 3) count = Math.floor(Math.random() * 5) + 8;
        else if (level === 4) count = Math.floor(Math.random() * 6) + 13;

        week.push({ dateStr, count, level });
      }
      grid.push(week);
    }
    return grid;
  }, []);

  const months = useMemo(() => [
    { name: 'Jul', col: 0 },
    { name: 'Aug', col: 4 },
    { name: 'Sep', col: 9 },
    { name: 'Oct', col: 13 },
    { name: 'Nov', col: 17 },
    { name: 'Dec', col: 22 },
    { name: 'Jan', col: 26 },
    { name: 'Feb', col: 31 },
    { name: 'Mar', col: 35 },
    { name: 'Apr', col: 39 },
    { name: 'May', col: 44 },
    { name: 'Jun', col: 48 },
    { name: 'Jul', col: 52 },
  ], []);

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
  const displayedBadges = showAllBadges ? badges : badges.slice(0, 5);

  return (
    <motion.div 
      className="mx-auto max-w-4xl space-y-8 pb-16 px-4 sm:px-6 relative"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      
      {/* ── Main Profile Header Card ── */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
        {/* Decorative background blurs */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 opacity-30 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          
          {/* Avatar with Double Gradient Ring & Inline Upload Edit overlay */}
          <div className="relative group flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-md shadow-indigo-100 shrink-0">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-white overflow-hidden border-2 border-white relative">
              {currentUser.avatarUrl ? (
                <img src={getAvatarUrl(currentUser.avatarUrl)} alt="Avatar" className="h-full w-full object-cover" />
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
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight leading-none">
              {currentUser.fullName || (currentUser.firstName + (currentUser.lastName ? ' ' + currentUser.lastName : '')) || 'User'}
            </h1>
            
            <p className="text-base font-bold text-slate-400 mt-1">
              @{username}
            </p>

            {/* Enlarged Bio */}
            <div className="mt-4 space-y-2 text-slate-700 text-base font-bold leading-relaxed w-full">
              {currentUser.bio ? (
                <div className="flex flex-col gap-1 items-center md:items-start">
                  {currentUser.bio.split('|').map((part: string, i: number) => (
                    <span key={i} className="inline-block">{part.trim()}</span>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 italic">No bio added yet.</div>
              )}
            </div>

            {/* Location / Git / Email / LinkedIn / Mobile / Gender Details list */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-sm text-slate-500 font-semibold w-full pt-5 border-t border-slate-100">
              <div className="flex items-center justify-center md:justify-start gap-2.5">
                <MapPin size={16} className="text-slate-400 shrink-0" />
                <span>Bangalore, India</span>
              </div>
              
              <div className="flex items-center justify-center md:justify-start gap-2.5">
                <LinkIcon size={16} className="text-slate-400 shrink-0" />
                <a href={currentUser.githubUrl || `https://github.com/${username}`} target="_blank" rel="noreferrer" className="hover:text-indigo-600 transition-colors truncate max-w-full">
                  {currentUser.githubUrl ? currentUser.githubUrl.replace('https://', '') : `github.com/${username}`}
                </a>
              </div>
              
              <div className="flex items-center justify-center md:justify-start gap-2.5 font-bold">
                <Mail size={16} className="text-slate-400 shrink-0" />
                <span className="truncate">{currentUser.email}</span>
              </div>
              
              <div className="flex items-center justify-center md:justify-start gap-2.5">
                <FaLinkedin size={16} className="text-[#0077b5] shrink-0" />
                {currentUser.linkedinUrl ? (
                  <a href={currentUser.linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-indigo-600 transition-colors truncate">
                    {currentUser.linkedinUrl.replace('https://', '')}
                  </a>
                ) : (
                  <span className="text-slate-400 italic">No LinkedIn profile</span>
                )}
              </div>

              {currentUser.mobileNumber && (
                <div className="flex items-center justify-center md:justify-start gap-2.5">
                  <Phone size={16} className="text-slate-400 shrink-0" />
                  <span>{currentUser.mobileNumber}</span>
                </div>
              )}

              {currentUser.gender && (
                <div className="flex items-center justify-center md:justify-start gap-2.5 capitalize">
                  <UserIcon size={16} className="text-slate-400 shrink-0" />
                  <span>{currentUser.gender.toLowerCase()}</span>
                </div>
              )}

              {currentUser.address && (
                <div className="flex items-center justify-center md:justify-start gap-2.5 sm:col-span-2">
                  <MapPin size={16} className="text-slate-400 shrink-0" />
                  <span className="truncate">{currentUser.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Edit Profile Button - Opens Modal */}
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="md:self-start inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] transition-all duration-200 shrink-0 cursor-pointer"
          >
            <Edit3 size={14} />
            Edit Profile
          </button>
        </div>
      </div>

      {/* ── Badges Section - Resized Smaller ── */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
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
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-slate-50/50 fill-current stroke-[3.5] stroke-slate-200 group-hover:stroke-indigo-300 group-hover:text-indigo-50/30 transition-all duration-300">
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
      <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)] text-slate-700 font-sans relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">
            175 contributions in the last year
          </h3>
          
          {/* Interactive Contribution Settings Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 cursor-pointer focus:outline-none"
            >
              <span>Contribution settings</span>
              <Settings size={12} className={`transition-transform duration-200 ${isSettingsOpen ? 'rotate-90' : ''}`} />
            </button>
            
            <AnimatePresence>
              {isSettingsOpen && (
                <>
                  {/* Backdrop Clicker */}
                  <div className="fixed inset-0 z-30" onClick={() => setIsSettingsOpen(false)}></div>
                  
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
                      onClick={() => { setActivityVisibility('Public'); setIsSettingsOpen(false); }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 text-left cursor-pointer"
                    >
                      <span>Public activity only</span>
                      {activityVisibility === 'Public' && <Check size={14} className="text-indigo-600" />}
                    </button>
                    <button 
                      onClick={() => { setActivityVisibility('Private'); setIsSettingsOpen(false); }}
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
        <div className="border border-slate-100 rounded-2xl p-4 sm:p-6 bg-slate-50/50">
          <div className="flex gap-3 items-start">
            
            {/* Mon, Wed, Fri Labels */}
            <div className="grid grid-rows-7 gap-[3px] text-[9px] text-slate-400 font-bold select-none shrink-0 pt-5">
              <div className="h-[10px] sm:h-[11px]"></div>
              <div className="flex items-center h-[10px] sm:h-[11px]">Mon</div>
              <div className="h-[10px] sm:h-[11px]"></div>
              <div className="flex items-center h-[10px] sm:h-[11px]">Wed</div>
              <div className="h-[10px] sm:h-[11px]"></div>
              <div className="flex items-center h-[10px] sm:h-[11px]">Fri</div>
              <div className="h-[10px] sm:h-[11px]"></div>
            </div>

            {/* Grid Area with Months top row */}
            <div className="flex-grow overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
              {/* Months labels */}
              <div className="flex text-[9px] text-slate-400 font-bold mb-1.5 h-3.5 relative select-none">
                {months.map((m) => (
                  <span 
                    key={`${m.name}-${m.col}`} 
                    className="absolute" 
                    style={{ left: `calc(${m.col} * (100% / 53))` }}
                  >
                    {m.name}
                  </span>
                ))}
              </div>

              {/* 53 x 7 grid (aligned columns) */}
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
                          x: rect.left + window.scrollX + rect.width / 2,
                          y: rect.top + window.scrollY - 36
                        });
                      }}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`w-[10px] h-[10px] sm:w-[11px] sm:h-[11px] rounded-[1.5px] border-[0.5px] border-slate-200/20 transition-all duration-200 cursor-pointer ${
                        cell.level === 0 ? 'bg-slate-50 hover:bg-indigo-50 border-slate-100' :
                        cell.level === 1 ? 'bg-indigo-100/70 hover:scale-105' :
                        cell.level === 2 ? 'bg-indigo-300/80 hover:scale-105' :
                        cell.level === 3 ? 'bg-indigo-500 hover:scale-105' :
                        'bg-indigo-700 hover:scale-105 shadow-sm'
                      }`}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Grid Footer - Interactive elements */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 text-[10px] text-slate-400 font-semibold pt-3 border-t border-slate-100">
            <span className="hover:text-indigo-600 hover:underline cursor-pointer flex items-center gap-1">
              <Globe size={12} />
              Learn how we count contributions
            </span>
            <div className="flex items-center gap-1.5 select-none">
              <span>Less</span>
              <div className="w-[10px] h-[10px] sm:w-[11px] sm:h-[11px] rounded-[1.5px] bg-slate-50 border border-slate-100"></div>
              <div className="w-[10px] h-[10px] sm:w-[11px] sm:h-[11px] rounded-[1.5px] bg-indigo-100/70"></div>
              <div className="w-[10px] h-[10px] sm:w-[11px] sm:h-[11px] rounded-[1.5px] bg-indigo-300/80"></div>
              <div className="w-[10px] h-[10px] sm:w-[11px] sm:h-[11px] rounded-[1.5px] bg-indigo-500"></div>
              <div className="w-[10px] h-[10px] sm:w-[11px] sm:h-[11px] rounded-[1.5px] bg-indigo-700"></div>
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
                    <div key={idx} className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)] hover:shadow-[0_8px_35_rgba(99,102,241,0.03)] transition-all flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 tracking-tight leading-snug group-hover:text-indigo-600 transition-colors">
                          {course.title}
                        </h4>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed mt-2">
                          {course.description || 'No description provided.'}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between gap-4">
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 tracking-wider">
                            <span>PROGRESS</span>
                            <span className="text-indigo-600">{course.progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${course.progress}%` }}></div>
                          </div>
                        </div>
                        <span className="text-[10px] font-extrabold text-slate-400 tracking-wide uppercase shrink-0">{course.duration}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-sm font-semibold bg-slate-50/20">
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
                    <div key={idx} className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100/50 text-indigo-600">
                          <GraduationCap size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 tracking-tight leading-snug">{item.title}</h4>
                          <p className="text-xs text-slate-400 font-semibold mt-1">Type: {item.type} • Date: {item.date}</p>
                        </div>
                      </div>
                      <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 border border-emerald-100">
                        {item.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-sm font-semibold bg-slate-50/20">
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
                    <div key={idx} className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-100 text-amber-500">
                          <Award size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 tracking-tight leading-snug">{cert.name}</h4>
                          <p className="text-xs text-slate-400 font-semibold mt-1">Issued by {cert.issuer} • {cert.date}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1 rounded-lg select-none">
                        ID: {cert.idCode}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-sm font-semibold bg-slate-50/20">
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
              className="relative w-full max-w-lg rounded-3xl border border-slate-100 bg-white shadow-2xl z-10 flex flex-col max-h-[85vh] overflow-hidden"
            >
              {/* Pinned Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4.5">
                <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">Edit Profile Info</h3>
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
                  
                  {/* Photo Upload Area inside Edit Modal */}
                  <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 mb-2">
                    <div className="relative h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-sm shrink-0">
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-white overflow-hidden border border-white">
                        {currentUser.avatarUrl ? (
                          <img src={getAvatarUrl(currentUser.avatarUrl)} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          <UserIcon size={24} className="text-indigo-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-slate-700">Profile Picture</span>
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="inline-flex items-center gap-1 text-[11px] font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg active:scale-95 transition-all border border-indigo-100/50 cursor-pointer disabled:opacity-50"
                      >
                        {isUploadingAvatar ? (
                          <>
                            <Loader2 className="animate-spin" size={12} />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Camera size={12} />
                            <span>Change Photo</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">First Name</label>
                      <input 
                        type="text" 
                        required
                        value={editFirstName}
                        onChange={(e) => setEditFirstName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Name</label>
                      <input 
                        type="text" 
                        required
                        value={editLastName}
                        onChange={(e) => setEditLastName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
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
                        onChange={(e) => setEditUsername(e.target.value)}
                        className={`w-full rounded-xl border px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 ${
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
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 cursor-not-allowed select-none focus:outline-none"
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
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-400 cursor-not-allowed select-none focus:outline-none"
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
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">GitHub Profile Link</label>
                      <input 
                        type="url" 
                        value={editGithubUrl}
                        onChange={(e) => setEditGithubUrl(e.target.value)}
                        placeholder="https://github.com/username"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Mobile & Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mobile Number</label>
                      <input 
                        type="text" 
                        value={editMobileNumber}
                        onChange={(e) => setEditMobileNumber(e.target.value)}
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Address</label>
                      <input 
                        type="text" 
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        placeholder="House, Street, City, State, Country"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bio (split using '|' for multiple lines)</label>
                    <textarea 
                      rows={3}
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Pinned Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50 rounded-b-3xl shrink-0">
                  <button 
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving && <Loader2 className="animate-spin" size={14} />}
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
            className="absolute z-50 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none -translate-x-1/2 flex items-center gap-1"
            style={{ left: hoveredCell.x, top: hoveredCell.y }}
          >
            <span>{hoveredCell.count === 0 ? 'No contributions' : `${hoveredCell.count} contributions`}</span>
            <span className="text-slate-400 font-semibold">on {hoveredCell.dateStr}</span>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
