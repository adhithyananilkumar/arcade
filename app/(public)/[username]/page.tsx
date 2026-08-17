'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { UserService } from "@/domains/identity";
import { motion } from 'framer-motion';
import {
  User as UserIcon, MapPin, Calendar,
  Code, Star, Award,
  Shield, BadgeCheck, Sparkles
} from 'lucide-react';
import PublicProfileLoading from './loading';
import Lottie from 'lottie-react';
import notFoundAnimation from '@/public/404 page not found.json';
import { getAvatarUrl } from '@/shared/utils/avatar';



function statusBadgeClasses(status?: string) {
  switch ((status || '').toUpperCase()) {
    case 'PUBLISHED':
      return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
    case 'DRAFT':
      return 'bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 border-slate-200 dark:border-neutral-700';
    case 'IN_REVIEW':
    case 'PENDING':
      return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30';
    case 'ARCHIVED':
      return 'bg-slate-100 dark:bg-neutral-800 text-slate-400 dark:text-neutral-500 border-slate-200 dark:border-neutral-700';
    default:
      return 'bg-slate-50 dark:bg-neutral-900 text-slate-500 dark:text-neutral-500 border-slate-100 dark:border-neutral-800';
  }
}

function AuthoredContentCard({ item }: { item: any }) {
  return (
    <div className="group relative overflow-hidden rounded-[20px] border border-slate-100 dark:border-neutral-900 bg-white dark:bg-black p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col justify-between cursor-pointer">
      <div className="relative z-10">
        <h4 className="text-[15px] font-extrabold text-slate-800 dark:text-white tracking-tight leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {item.title}
        </h4>
        <p className="text-[12px] text-slate-500 dark:text-neutral-400 font-bold leading-relaxed mt-2 line-clamp-3">
          {item.description || 'No description provided.'}
        </p>
      </div>

      <div className="relative z-10 mt-6 pt-4 border-t border-slate-50 dark:border-neutral-900 flex items-center justify-between gap-4">
        <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold border ${statusBadgeClasses(item.status)}`}>
          {(item.status || 'UNKNOWN').replace(/_/g, ' ')}
        </span>
        <span className="text-[10px] font-extrabold text-slate-400 dark:text-neutral-500 tracking-wide uppercase shrink-0">
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : ''}
        </span>
      </div>
    </div>
  );
}


export default function PublicProfilePage() {
  const params = useParams();
  const usernameParam = params.username as string;
  
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState<'courses' | 'roadmaps' | 'workshops' | 'enrolled' | 'certificates'>('courses');
  const lottieRef = useRef<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await UserService.getPublicProfile(usernameParam);
        setProfileData(data);
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

  if (isLoading) {
    return <PublicProfileLoading />;
  }

  if (error || !profileData) {
    return (
      <div className="flex flex-col md:flex-row items-center justify-center min-h-[60vh] py-12 gap-8 md:gap-16 text-slate-600 px-4">
        {/* Left Side: Animation */}
        <div className="w-64 h-64 md:w-96 md:h-96 shrink-0">
          <Lottie 
            lottieRef={lottieRef}
            animationData={notFoundAnimation} 
            loop={false} 
            onDOMLoaded={() => {
              if (lottieRef.current) {
                lottieRef.current.setSpeed(0.5);
              }
            }}
          />
        </div>

        {/* Right Side: Text */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h1 className="text-7xl md:text-9xl font-black text-slate-800 tracking-tight leading-none">404</h1>
          <h2 className="text-2xl md:text-4xl font-bold text-slate-600 mt-2 md:mt-4">Page not found</h2>
          <p className="mt-4 text-slate-500 font-medium max-w-sm">The page or user you're looking for doesn't exist or might have been removed.</p>
          <Link href="/" className="mt-8 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm active:scale-95">
            Back
          </Link>
        </div>
      </div>
    );
  }


  const username = profileData.username || 'username';

  return (
    <>
      {/* Global Background (Pure White / Dark) */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-white dark:bg-[#020617]"></div>
      <motion.div 
        className="mx-auto max-w-6xl w-full space-y-6 pb-16 px-4 sm:px-6 relative transition-colors z-10 pt-8"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >

      {/* ── Main Profile Header Card ── */}
      <div className="relative px-6 py-6 transition-colors mb-8">
        
        

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10 w-full">
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 w-full md:w-auto">
            {/* Avatar Container */}
            <div className="relative flex h-[120px] w-[120px] shrink-0">
              <div className="relative z-10 flex h-full w-full items-center justify-center rounded-full bg-white dark:bg-black p-1 shadow-sm border border-slate-100 dark:border-neutral-800 transition-colors">
                <div className="flex h-full w-full items-center justify-center rounded-full overflow-hidden bg-slate-50 dark:bg-neutral-900 relative group transition-colors">
                  {profileData.avatarUrl ? (
                    <img src={getAvatarUrl(profileData.avatarUrl)} alt="Avatar" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <UserIcon size={52} className="text-purple-400" />
                  )}

                  
                </div>
              </div>
              
            </div>

            {/* Details / Bio */}
            <div className="flex-grow flex flex-col items-center md:items-start text-center md:text-left pt-5 w-full relative">
              <div className="flex items-center gap-3">
                <h1 className="text-[28px] sm:text-[32px] font-extrabold text-[#111827] dark:text-white tracking-tight leading-none transition-colors flex items-center gap-2">
                  {profileData.fullName || (profileData.firstName + (profileData.lastName ? ' ' + profileData.lastName : '')) || 'User'}
                  
                  {/* Verification Tick */}
                  {(() => {
                    const bioLower = (profileData.bio || '').toLowerCase();
                    const isAdmin = 
                      profileData.role === 'ADMIN' ||
                      profileData.role === 'ROLE_ADMIN' ||
                      profileData.role === 'PLATFORM_ADMIN' ||
                      profileData.isAdmin === true ||
                      profileData.platformRoles?.some((r: any) => ['PLATFORM_OWNER', 'PLATFORM_ADMIN'].includes((r.code || r.name || '').toUpperCase())) ||
                      profileData.roles?.some((r: any) => (typeof r === 'string' ? r : r.code || r.name)?.toUpperCase().includes('ADMIN'));

                    const isCreator = 
                      profileData.role === 'CREATOR' ||
                      profileData.role === 'ROLE_CREATOR' ||
                      profileData.role === 'INSTRUCTOR' ||
                      profileData.isCreator === true ||
                      profileData.platformRoles?.some((r: any) => ['CREATOR', 'INSTRUCTOR', 'TEACHER', 'AUTHOR'].includes((r.code || r.name || '').toUpperCase())) ||
                      profileData.roles?.some((r: any) => (typeof r === 'string' ? r : r.code || r.name)?.toUpperCase().includes('CREATOR')) ||
                      bioLower.includes('creator');

                    if (isAdmin) {
                      return (
                        <span title="Verified Admin" className="inline-flex items-center">
                          <BadgeCheck className="text-white fill-[#8b5cf6] dark:fill-[#8b5cf6] drop-shadow-[0_2px_6px_rgba(139,92,246,0.4)] shrink-0 ml-1.5 align-middle" size={26} strokeWidth={2.2} />
                        </span>
                      );
                    }

                    if (isCreator) {
                      return (
                        <span title="Verified Creator" className="inline-flex items-center">
                          <BadgeCheck className="text-white fill-[#1d9bf0] dark:fill-[#1d9bf0] drop-shadow-[0_2px_6px_rgba(29,155,240,0.4)] shrink-0 ml-1.5 align-middle" size={26} strokeWidth={2.2} />
                        </span>
                      );
                    }
                    return null;
                  })()}
                </h1>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <p className="text-[14px] font-semibold text-purple-600 dark:text-purple-400 transition-colors">
                  @{username}
                </p>
                {(() => {
                  const bioLower = (profileData.bio || '').toLowerCase();
                  const isAdmin = 
                    profileData.role === 'ADMIN' ||
                    profileData.role === 'ROLE_ADMIN' ||
                    profileData.role === 'PLATFORM_ADMIN' ||
                    profileData.isAdmin === true ||
                    profileData.platformRoles?.some((r: any) => ['PLATFORM_OWNER', 'PLATFORM_ADMIN'].includes((r.code || r.name || '').toUpperCase())) ||
                    profileData.roles?.some((r: any) => (typeof r === 'string' ? r : r.code || r.name)?.toUpperCase().includes('ADMIN'));

                  const isCreator = 
                    profileData.role === 'CREATOR' ||
                    profileData.role === 'ROLE_CREATOR' ||
                    profileData.role === 'INSTRUCTOR' ||
                    profileData.isCreator === true ||
                    profileData.platformRoles?.some((r: any) => ['CREATOR', 'INSTRUCTOR', 'TEACHER', 'AUTHOR'].includes((r.code || r.name || '').toUpperCase())) ||
                    profileData.roles?.some((r: any) => (typeof r === 'string' ? r : r.code || r.name)?.toUpperCase().includes('CREATOR')) ||
                    bioLower.includes('creator');

                  if (isAdmin) {
                    return (
                      <span className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <Shield size={13} className="fill-rose-500/20 text-rose-600 dark:text-rose-400" /> Admin
                      </span>
                    );
                  }

                  if (isCreator) {
                    return (
                      <span className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <Sparkles size={13} className="fill-blue-500 text-blue-500" /> Creator
                      </span>
                    );
                  }

                  return (
                    <span className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Star size={13} className="fill-amber-500 text-amber-500" /> Learner
                    </span>
                  );
                })()}
              </div>

              {/* Bio */}
              {profileData.bio && (
                <div className="mt-5 flex items-start gap-1.5 text-[#4b5563] dark:text-neutral-400 text-[13px] font-bold leading-relaxed w-full transition-colors">
                  <Code size={15} className="text-purple-600 shrink-0 mt-[1px]" />
                  <div className="flex flex-wrap items-center md:items-start">
                    {profileData.bio.split('|').map((part: string, i: number, arr: string[]) => (
                      <span key={i} className="inline-flex items-center">
                        {part.trim()}
                        {i < arr.length - 1 && <span className="mx-1.5 text-slate-300 dark:text-neutral-600">|</span>}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Location / Joined */}
              <div className="mt-4 flex flex-wrap items-center gap-6 text-[13px] text-slate-500 dark:text-neutral-500 font-bold w-full transition-colors">
                <div className="flex items-center gap-1.5">
                  <MapPin size={15} className="shrink-0 text-slate-400" />
                  <span className="truncate">{profileData.address || 'India'}</span>
                </div>
                
                {profileData.createdAt && (
                  <div className="flex items-center gap-1.5">
                    <Calendar size={15} className="shrink-0 text-slate-400" />
                    <span className="truncate">
                      Joined{' '}
                      {new Date(profileData.createdAt).toLocaleDateString(undefined, {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges and a public activity/streak heatmap are not shown here: badges/achievements are
          not backed by a real system, and the backend-owned streak (LearnerActivitySummary) is
          self-service-only by deliberate privacy decision — see
          docs/architecture/PUBLIC_PROFILE_SECURITY.md. TimeLog was previously (incorrectly) used
          as a public per-day activity source for any username; that endpoint has been removed. */}

      {/* ── Pinned Certificates Section ── */}
      <div className="mt-12 mb-8 px-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <Award size={18} className="text-slate-900 dark:text-white" />
            Pinned Certificates
          </h3>
          <span className="text-[11px] font-bold text-slate-400 bg-slate-50 dark:bg-neutral-800 px-2.5 py-1 rounded-md">
            Max 10
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profileData.certificates && profileData.certificates.length > 0 ? (
            profileData.certificates.slice(0, 10).map((cert: any, idx: number) => (
              <div key={idx} className="group flex items-center justify-between p-4 rounded-[20px] border border-slate-100 dark:border-neutral-900 bg-white dark:bg-black shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white transition-colors group-hover:scale-105 duration-300">
                    <Award size={20} />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-extrabold text-slate-800 dark:text-white tracking-tight leading-snug group-hover:text-black dark:group-hover:text-slate-200 transition-colors">{cert.name}</h4>
                    <p className="text-[11px] text-slate-400 dark:text-neutral-500 font-bold mt-0.5">Issued by {cert.issuer}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-neutral-500 bg-slate-50 dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 px-2 py-0.5 rounded-md">
                    {cert.date}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 text-center py-10 border-2 border-dashed border-slate-100 dark:border-neutral-800 rounded-3xl text-slate-400 text-sm font-bold bg-slate-50/20 dark:bg-neutral-900/30">
              No pinned certificates yet.
            </div>
          )}
        </div>
      </div>

    </motion.div>
            {activeTab === 'roadmaps' && (
              <motion.div
                key="roadmaps"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {profileData.roadmaps && profileData.roadmaps.length > 0 ? (
                  profileData.roadmaps.map((roadmap: any, idx: number) => (
                    <AuthoredContentCard key={idx} item={roadmap} />
                  ))
                ) : (
                  <div className="col-span-2 text-center py-10 border-2 border-dashed border-slate-100 dark:border-neutral-800 rounded-3xl text-slate-400 text-sm font-bold bg-slate-50/20 dark:bg-neutral-900/30">
                    No authored roadmaps found for this user.
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'workshops' && (
              <motion.div
                key="workshops"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {profileData.workshops && profileData.workshops.length > 0 ? (
                  profileData.workshops.map((workshop: any, idx: number) => (
                    <AuthoredContentCard key={idx} item={workshop} />
                  ))
                ) : (
                  <div className="col-span-2 text-center py-10 border-2 border-dashed border-slate-100 dark:border-neutral-800 rounded-3xl text-slate-400 text-sm font-bold bg-slate-50/20 dark:bg-neutral-900/30">
                    No authored workshops found for this user.
                  </div>
                )}
              </motion.div>
            )}


    </>
  );
}
