'use client';

import { useAuthStore } from '@/store/auth.store';
import { User as UserIcon, Shield, Mail, Phone, Calendar, Activity, CheckCircle, Clock, ChevronRight, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { MyChannels } from './MyChannels';
import { CreateChannelModal } from '@/components/CreateChannelModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } }
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (!user) return null;

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

  const primaryRole = user.roles?.[0]?.name?.replace('ROLE_', '') || 'MEMBER';
  const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Just now';

  return (
    <motion.div 
      className="mx-auto max-w-6xl space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      
      {/* Header Section */}
      <motion.header variants={itemVariants} className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome back, <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{user.firstName || user.fullName?.split(' ')[0] || 'User'}</span> 👋
          </h1>
          <p className="text-gray-500 mt-1">Here is what's happening with your account today.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm border border-gray-200 hover:bg-gray-50 transition-all">
          <Edit3 size={16} />
          Edit Profile
        </button>
      </motion.header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Profile Card */}
        <motion.div variants={itemVariants} className="col-span-1 rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xl shadow-indigo-100/50 backdrop-blur-xl flex flex-col items-center text-center relative overflow-hidden">
          {/* Decorative Gradient Blob */}
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 opacity-20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-gradient-to-tr from-blue-400 to-emerald-400 opacity-20 blur-3xl" />

          <div className="relative z-10 mb-5 mt-2">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-100 to-purple-50 p-1 shadow-lg shadow-indigo-200/50">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white overflow-hidden border-4 border-white">
                {user.avatarUrl ? (
                  <img src={getAvatarUrl(user.avatarUrl)} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <UserIcon size={48} className="text-indigo-300" />
                )}
              </div>
            </div>
            {user.emailVerified && (
              <div className="absolute bottom-1 right-1 rounded-full bg-white p-1 shadow-sm" title="Verified Account">
                <CheckCircle size={22} className="text-emerald-500 fill-emerald-50" />
              </div>
            )}
          </div>
          
          <h2 className="relative z-10 text-2xl font-bold text-gray-900">{user.fullName || (user.firstName + (user.lastName ? ' ' + user.lastName : '')) || 'User'}</h2>
          <p className="relative z-10 text-sm text-gray-500 font-medium">{user.email}</p>
          
          <div className="relative z-10 mt-4 flex flex-col items-center gap-4 w-full">
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {user.roles?.map((role: any) => (
                <div key={role.id || role.name} className="flex items-center gap-1.5 rounded-full bg-indigo-50/80 px-3 py-1 text-xs font-bold text-indigo-700 tracking-wider uppercase border border-indigo-100 backdrop-blur-sm">
                  <Shield size={12} className="text-indigo-500" />
                  {role.name?.replace('ROLE_', '')}
                </div>
              ))}
              {(!user.roles || user.roles.length === 0) && (
                <div className="flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1 text-xs font-bold text-gray-500 tracking-wider uppercase border border-gray-100 backdrop-blur-sm">
                  <Shield size={12} className="text-gray-400" />
                  MEMBER
                </div>
              )}
            </div>
            
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow"
            >
              <Activity size={18} />
              Create Channel
            </button>
            <div className="w-full mt-4">
              <MyChannels />
            </div>
          </div>

          <div className="relative z-10 mt-8 w-full space-y-4 border-t border-gray-200/60 pt-6 text-left">
            {user.username && (
              <div className="group flex items-center gap-4 text-sm text-gray-600 transition-colors hover:text-gray-900">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <UserIcon size={16} />
                </div>
                <span className="font-semibold text-gray-900">@{user.username}</span>
              </div>
            )}
            <div className="group flex items-center gap-4 text-sm text-gray-600 transition-colors hover:text-gray-900">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                <Mail size={16} />
              </div>
              <span className="truncate">{user.email}</span>
            </div>
            {user.phoneNumber && (
              <div className="group flex items-center gap-4 text-sm text-gray-600 transition-colors hover:text-gray-900">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <Phone size={16} />
                </div>
                <span>{user.phoneNumber}</span>
              </div>
            )}
            <div className="group flex items-center gap-4 text-sm text-gray-600 transition-colors hover:text-gray-900">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                <Calendar size={16} />
              </div>
              <span>Joined {joinDate}</span>
            </div>
          </div>
        </motion.div>

        {/* Activity & Stats */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <motion.div variants={itemVariants} className="group relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-xl bg-indigo-100/80 p-3 text-indigo-600">
                  <Activity size={24} />
                </div>
                <button className="flex items-center text-xs font-semibold text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100">
                  View <ChevronRight size={14} />
                </button>
              </div>
              <p className="text-3xl font-bold text-gray-900">1</p>
              <h3 className="text-sm font-semibold text-gray-600 mt-1">Active Session</h3>
              <p className="text-xs text-gray-500 mt-1">Currently logged in from this device</p>
              
              <div className="absolute -bottom-4 -right-4 text-indigo-50 opacity-50 pointer-events-none">
                <Activity size={100} />
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="group relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-xl bg-emerald-100/80 p-3 text-emerald-600">
                  <Shield size={24} />
                </div>
                <button className="flex items-center text-xs font-semibold text-emerald-600 opacity-0 transition-opacity group-hover:opacity-100">
                  Review <ChevronRight size={14} />
                </button>
              </div>
              <p className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                Good <CheckCircle size={24} className="text-emerald-500" />
              </p>
              <h3 className="text-sm font-semibold text-gray-600 mt-1">Security Status</h3>
              <p className="text-xs text-gray-500 mt-1">No suspicious activity detected</p>
              
              <div className="absolute -bottom-4 -right-4 text-emerald-50 opacity-50 pointer-events-none">
                <Shield size={100} />
              </div>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants} className="flex-1 rounded-3xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
              <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">View All</button>
            </div>
            
            <div className="space-y-6">
              <div className="group relative flex gap-5">
                <div className="absolute top-8 left-6 -bottom-6 w-px bg-gray-100"></div>
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 shadow-sm border border-white group-hover:scale-110 transition-transform">
                  <Activity size={20} />
                </div>
                <div className="pt-2">
                  <p className="text-base font-semibold text-gray-900">Successful Login</p>
                  <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1"><Clock size={14} /> Just now</span>
                    <span>•</span>
                    <span className="font-medium text-gray-700">via {user.provider || 'Password'}</span>
                  </div>
                </div>
              </div>
              
              <div className="group relative flex gap-5 opacity-60 hover:opacity-100 transition-opacity">
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-500 shadow-sm border border-white group-hover:scale-110 transition-transform group-hover:bg-emerald-50 group-hover:text-emerald-600">
                  <CheckCircle size={20} />
                </div>
                <div className="pt-2">
                  <p className="text-base font-semibold text-gray-900">Account Created</p>
                  <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1"><Clock size={14} /> {joinDate}</span>
                    <span>•</span>
                    <span className="font-medium text-gray-700">Welcome to Arcade</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <CreateChannelModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {}}
      />
    </motion.div>
  );
}
