'use client';

import { useAuthStore } from '@/store/auth.store';
import { User as UserIcon, Shield, Mail, Phone, Calendar, Activity, CheckCircle, Clock, ChevronRight, Edit3, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } 
  }
};

export default function DashboardPage() {
  const { user } = useAuthStore();

  if (!user) return null;

  const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'Recently';

  const primaryRole = 'Member';

  const getAvatarUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    if (url.startsWith('/api/v1/')) {
      return baseUrl.replace('/api/v1', '') + url;
    }
    if (!url.includes('/')) {
      return baseUrl + '/users/avatars/' + url;
    }
    return baseUrl + (url.startsWith('/') ? '' : '/') + url;
  };

  return (
    <motion.div 
      className="mx-auto max-w-6xl space-y-8 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      
      {/* Header Section */}
      <motion.header 
        variants={itemVariants} 
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-6"
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl flex items-center gap-2">
            Welcome back, <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 bg-clip-text text-transparent">{user.firstName || user.fullName?.split(' ')[0] || 'User'}</span>
            <motion.span 
              className="inline-block"
              animate={{ rotate: [0, 14, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 1 }}
            >
              👋
            </motion.span>
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1.5">Here is what is happening with your account today.</p>
        </div>
        
        <button 
          onClick={() => window.location.href = '/dashboard/profile'}
          className="self-start sm:self-auto inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Edit3 size={15} />
          Edit Profile
        </button>
      </motion.header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Profile Card */}
        <motion.div 
          variants={itemVariants} 
          className="col-span-1 rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.04)] transition-all duration-300 relative overflow-hidden flex flex-col items-center text-center"
        >
          {/* Subtle Ambient Blob */}
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 opacity-30 blur-3xl pointer-events-none" />
          
          {/* Avatar Area */}
          <div className="relative z-10 mb-6 mt-4">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-md shadow-indigo-100">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white overflow-hidden border-2 border-white">
                {user.avatarUrl ? (
                  <img src={getAvatarUrl(user.avatarUrl)} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <UserIcon size={44} className="text-indigo-400" />
                )}
              </div>
            </div>
          </div>
          
          <h2 className="relative z-10 text-xl font-bold text-slate-800 tracking-tight">
            {user.fullName || (user.firstName + (user.lastName ? ' ' + user.lastName : '')) || 'User'}
          </h2>
          <p className="relative z-10 text-xs font-semibold text-slate-400 mt-1">{user.email}</p>
          
          {/* Role Badge */}
          <div className="relative z-10 mt-4 flex items-center gap-1.5 rounded-full bg-indigo-50 px-4 py-1 text-[10px] font-bold text-indigo-700 tracking-wider uppercase border border-indigo-100/50 shadow-[0_2px_10px_rgba(99,102,241,0.02)]">
            <Award size={12} className="text-indigo-600" />
            {primaryRole}
          </div>

          {/* Profile Details List */}
          <div className="relative z-10 mt-8 w-full space-y-4 border-t border-slate-100 pt-6 text-left">
            {user.username && (
              <div className="group flex items-center gap-3.5 text-sm text-slate-500 transition-colors hover:text-slate-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100/50 group-hover:text-indigo-600 transition-all">
                  <UserIcon size={14} />
                </div>
                <span className="font-semibold text-slate-700">@{user.username}</span>
              </div>
            )}
            
            <div className="group flex items-center gap-3.5 text-sm text-slate-500 transition-colors hover:text-slate-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100/50 group-hover:text-indigo-600 transition-all">
                <Mail size={14} />
              </div>
              <span className="truncate text-slate-600 font-medium">{user.email}</span>
            </div>

            {user.mobileNumber && (
              <div className="group flex items-center gap-3.5 text-sm text-slate-500 transition-colors hover:text-slate-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100/50 group-hover:text-indigo-600 transition-all">
                  <Phone size={14} />
                </div>
                <span className="text-slate-600 font-medium">{user.mobileNumber}</span>
              </div>
            )}

            <div className="group flex items-center gap-3.5 text-sm text-slate-500 transition-colors hover:text-slate-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100/50 group-hover:text-indigo-600 transition-all">
                <Calendar size={14} />
              </div>
              <span className="text-slate-600 font-medium">Joined {joinDate}</span>
            </div>
          </div>
        </motion.div>

        {/* Stats and Activity Area */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-8">
          
          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Active Sessions Stats */}
            <motion.div 
              variants={itemVariants} 
              className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.04)] transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-2.5 text-indigo-600 group-hover:scale-105 transition-transform">
                  <Activity size={20} />
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Active
                </div>
              </div>
              
              <div className="relative z-10 mt-6">
                <p className="text-3xl font-extrabold text-slate-800 tracking-tight">1</p>
                <h3 className="text-sm font-bold text-slate-700 mt-1">Active Session</h3>
                <p className="text-xs text-slate-400 mt-1.5 font-medium leading-normal">Currently logged in from this device</p>
              </div>

              {/* Glowing Background Accent */}
              <div className="absolute -bottom-8 -right-8 text-indigo-50/50 opacity-40 pointer-events-none group-hover:scale-110 transition-transform duration-300">
                <Activity size={120} />
              </div>
            </motion.div>
            
            {/* Security Status Stats */}
            <motion.div 
              variants={itemVariants} 
              className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.03)] transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-2.5 text-emerald-600 group-hover:scale-105 transition-transform">
                  <Shield size={20} />
                </div>
                <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  Secure
                </div>
              </div>
              
              <div className="relative z-10 mt-6">
                <p className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                  Good
                  <CheckCircle size={20} className="text-emerald-500 fill-emerald-50" />
                </p>
                <h3 className="text-sm font-bold text-slate-700 mt-1">Security Status</h3>
                <p className="text-xs text-slate-400 mt-1.5 font-medium leading-normal">No suspicious activity detected</p>
              </div>

              {/* Glowing Background Accent */}
              <div className="absolute -bottom-8 -right-8 text-emerald-50/40 opacity-40 pointer-events-none group-hover:scale-110 transition-transform duration-300">
                <Shield size={120} />
              </div>
            </motion.div>
          </div>

          {/* Recent Activity Card */}
          <motion.div 
            variants={itemVariants} 
            className="flex-grow rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)]"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">Recent Activity</h3>
                <span className="rounded-md bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 text-[9px] font-extrabold text-indigo-700 uppercase tracking-wide">Live</span>
              </div>
              <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-0.5 cursor-pointer">
                View All <ChevronRight size={14} />
              </button>
            </div>
            
            <div className="space-y-6 relative pl-3">
              {/* Timeline Dotted vertical connector */}
              <div className="absolute top-2 bottom-6 left-8 w-0.5 border-l-2 border-dashed border-slate-100 z-0"></div>

              {/* Login Event */}
              <div className="group relative flex gap-6 items-start z-10">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100/50 text-indigo-600 shadow-sm group-hover:scale-105 transition-transform duration-200">
                  <Activity size={16} />
                </div>
                <div className="pt-0.5">
                  <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-900 transition-colors">Successful Login</p>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-1 font-semibold">
                    <span className="flex items-center gap-1"><Clock size={12} className="text-slate-300" /> Just now</span>
                    <span className="text-slate-200">•</span>
                    <span className="text-slate-500 font-bold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">BFF Session</span>
                  </div>
                </div>
              </div>
              
              {/* Registration Event */}
              <div className="group relative flex gap-6 items-start z-10">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-400 group-hover:scale-105 group-hover:bg-indigo-50 group-hover:border-indigo-100/50 group-hover:text-indigo-600 transition-all duration-200">
                  <CheckCircle size={16} />
                </div>
                <div className="pt-0.5">
                  <p className="text-sm font-bold text-slate-700 group-hover:text-slate-800 transition-colors">Account Created</p>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-1 font-semibold">
                    <span className="flex items-center gap-1"><Clock size={12} className="text-slate-300" /> {joinDate}</span>
                    <span className="text-slate-200">•</span>
                    <span className="text-slate-500">Welcome to Arcade Platform</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

    </motion.div>
  );
}
