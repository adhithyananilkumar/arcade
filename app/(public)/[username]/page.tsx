'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { UserService } from '@/services/user.service';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, MapPin, Link as LinkIcon, Mail, Calendar, Edit3, 
  ChevronRight, Code, GitPullRequest, Star, BookOpen, GitCommit, 
  MessageSquare, Flame, Trophy, Check, GraduationCap, Award, Compass,
  Loader2, X, Camera, Phone, Settings, Globe, CheckSquare, Shield
} from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';
import Image from 'next/image';
import PublicProfileLoading from './loading';

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

export default function PublicProfilePage() {
  const params = useParams();
  const usernameParam = params.username as string;
  
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState<'courses' | 'enrolled' | 'certificates'>('courses');
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{ count: number; dateStr: string; x: number; y: number } | null>(null);
  const [activityData, setActivityData] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await UserService.getPublicProfile(usernameParam);
        setProfileData(data);
        const activity = await UserService.getUserActivity(usernameParam);
        const dataMap: Record<string, number> = {};
        activity.forEach((item: any) => {
          dataMap[item.date] = item.secondsSpent;
        });
        setActivityData(dataMap);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('User not found.');
        } else {
          setError('Could not load profile information.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    if (usernameParam) loadProfile();
  }, [usernameParam]);

  useEffect(() => {
    const handleLocalTime = (e: Event) => {
      const customEvent = e as CustomEvent;
      const secondsToAdd = customEvent.detail.seconds;
      setActivityData(prev => {
        const today = new Date().toISOString().split('T')[0];
        const current = prev[today] || 0;
        return { ...prev, [today]: current + secondsToAdd };
      });
    };
    
    window.addEventListener('localTimeIncrement', handleLocalTime);
    return () => {
      window.removeEventListener('localTimeIncrement', handleLocalTime);
    };
  }, []);

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

        let count = 0;
        if (activityData[targetDateISO]) {
          count = Math.floor(activityData[targetDateISO] / 60);
        }

        let level = 0;
        if (count < 15) level = 0;
        else if (count < 30) level = 1;
        else if (count < 45) level = 2;
        else level = 3;

        week.push({ dateStr, count, level });
      }
      grid.push(week);
    }
    return grid;
  }, [activityData]);

  const totalMinutesSpent = useMemo(() => {
    let total = 0;
    contributionGrid.forEach(week => week.forEach(cell => { total += cell.count; }));
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
        if (i === 0) continue;
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
    return <PublicProfileLoading />;
  }

  if (error || !profileData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-600">
        <Compass size={48} className="text-slate-300 mb-4" />
        <h1 className="text-2xl font-bold text-slate-800">Profile Not Found</h1>
        <p className="mt-2 text-sm">{error || "The user you are looking for doesn't exist."}</p>
      </div>
    );
  }

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

  const username = profileData.username || 'username';
  const displayedBadges = showAllBadges ? dynamicBadges : dynamicBadges.slice(0, 5);

  return (
    <div className="flex w-full justify-center" style={{ fontFamily: 'var(--font-geist-sans)' }}>
      <motion.div 
        className="w-full max-w-4xl space-y-8 pb-16 px-4 sm:px-6 relative"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        
        {/* ── Main Profile Header Card ── */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
        {/* Decorative background blurs */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 opacity-30 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          
          {/* Avatar with Double Gradient Ring */}
          <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-md shadow-indigo-100 shrink-0">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-white overflow-hidden border-2 border-white relative">
              {profileData.avatarUrl ? (
                <img src={getAvatarUrl(profileData.avatarUrl)} alt="Avatar" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <UserIcon size={52} className="text-indigo-400" />
              )}
            </div>
          </div>

          {/* Details / Bio - Enlarged Layout */}
          <div className="flex-grow flex flex-col items-center md:items-start text-center md:text-left pt-2 w-full">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight leading-none">
              {profileData.fullName || (profileData.firstName + (profileData.lastName ? ' ' + profileData.lastName : '')) || 'User'}
            </h1>
            
            <p className="text-base font-bold text-slate-400 mt-1">
              @{username}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
              <div className="flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1 text-xs font-bold text-gray-500 tracking-wider uppercase border border-gray-100 backdrop-blur-sm">
                <Shield size={12} className="text-gray-400" />
                MEMBER
              </div>
              {profileData.workingAt && (
                <div className="flex items-center gap-1.5 rounded-full bg-blue-50/80 px-3 py-1 text-xs font-bold text-blue-700 tracking-wider uppercase border border-blue-100 backdrop-blur-sm">
                  <Award size={12} className="text-blue-500" />
                  Working at {profileData.workingAt}
                </div>
              )}
            </div>

            {/* Enlarged Bio */}
            {profileData.bio && (
              <div className="mt-4 space-y-2 text-slate-700 text-base font-bold leading-relaxed w-full">
                <div className="flex flex-col gap-1 items-center md:items-start">
                  {profileData.bio.split('|').map((part: string, i: number) => (
                    <span key={i} className="inline-block">{part.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Location / Git / LinkedIn Details list */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-sm text-slate-500 font-semibold w-full pt-5 border-t border-slate-100">
              {profileData.address && (
                <div className="flex items-center justify-center md:justify-start gap-2.5">
                  <MapPin size={16} className="text-slate-400 shrink-0" />
                  <span className="truncate">{profileData.address}</span>
                </div>
              )}
              {profileData.githubUrl && (
                <div className="flex items-center justify-center md:justify-start gap-2.5">
                  <LinkIcon size={16} className="text-slate-400 shrink-0" />
                  <a href={profileData.githubUrl} target="_blank" rel="noopener noreferrer" className="truncate hover:text-indigo-600 transition-colors">
                    {profileData.githubUrl.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                </div>
              )}
              {profileData.linkedinUrl && (
                <div className="flex items-center justify-center md:justify-start gap-2.5">
                  <FaLinkedin size={16} className="text-slate-400 shrink-0" />
                  <a href={profileData.linkedinUrl} target="_blank" rel="noopener noreferrer" className="truncate hover:text-indigo-600 transition-colors">
                    {profileData.linkedinUrl.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                </div>
              )}
              <div className="flex items-center justify-center md:justify-start gap-2.5 text-slate-400">
                <Calendar size={16} className="shrink-0" />
                Joined {profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'Unknown'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Badges Section (Horizontal scrollable) ── */}
      <div className="relative">
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Badges</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500">
              {badges.length}
            </span>
          </div>
          {badges.length > 5 && (
            <button 
              onClick={() => setShowAllBadges(!showAllBadges)}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
            >
              {showAllBadges ? 'Show less' : 'View all >'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
          <AnimatePresence>
            {displayedBadges.map((badge, idx) => {
              const BadgeIcon = badge.icon;
              return (
                <motion.div 
                  key={badge.name}
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  transition={{ delay: idx * 0.04 }}
                  className="group relative flex flex-col items-center justify-center gap-3 p-4 rounded-3xl bg-white border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:border-indigo-100 hover:shadow-[0_8px_30px_rgba(99,102,241,0.06)] hover:-translate-y-1 transition-all duration-300 cursor-default"
                >
                  <div className={`p-3.5 rounded-2xl ${badge.fill} border border-white shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <BadgeIcon size={24} className={`${badge.color} ${badge.stroke}`} strokeWidth={2.5} />
                  </div>
                  <span className="text-xs font-bold text-slate-600 text-center leading-tight">
                    {badge.name}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Contribution Graph Area ── */}
      <div className="relative">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            {totalMinutesSpent} minutes spent in the last year
          </h3>
        </div>

        <div className="border border-slate-100 rounded-2xl p-4 sm:p-6 bg-slate-50/50">
          <div className="flex gap-3 items-start">
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

      {/* ── Sub Navigation Tabs Area ── */}
      <div className="flex items-center gap-2 mt-6">
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">
          Contribution activity
        </h3>
        <span className="rounded-md bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 text-[9px] font-extrabold text-indigo-700 uppercase tracking-wide">Live</span>
      </div>

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
                    layoutId="public-profile-tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

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
                {profileData.courses && profileData.courses.length > 0 ? (
                  profileData.courses.map((course: any, idx: number) => (
                    <div key={idx} className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)] hover:shadow-[0_8px_35_rgba(99,102,241,0.03)] transition-all flex flex-col justify-between">
                      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-slate-50/50 dark:text-neutral-900/50 fill-current stroke-[3.5] stroke-slate-200 dark:stroke-neutral-800 group-hover:stroke-indigo-300 dark:group-hover:stroke-indigo-600 group-hover:text-indigo-50/30 transition-all duration-300">
                        <path d="M0 0h100v100H0z" />
                      </svg>
                      <div className="relative z-10">
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
                    No uploaded courses found for this user.
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
                {profileData.enrolledCourses && profileData.enrolledCourses.length > 0 ? (
                  profileData.enrolledCourses.map((item: any, idx: number) => (
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
                    No enrolled courses found for this user.
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
                {profileData.certificates && profileData.certificates.length > 0 ? (
                  profileData.certificates.map((cert: any, idx: number) => (
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
                    No certifications found for this user.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

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
    </div>
  );
}
