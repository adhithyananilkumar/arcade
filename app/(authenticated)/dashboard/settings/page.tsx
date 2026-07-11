'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { UserService } from '@/services/user.service';
import { User as UserIcon, Camera, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [firstName, setFirstName] = useState(user?.firstName || user?.fullName?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.lastName || user?.fullName?.split(' ')[1] || '');
  
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const getAvatarUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    // Prepend API URL for relative paths
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    // If the url already includes /api/v1, we need to be careful not to duplicate it.
    // The backend returns "/api/v1/users/avatars/..."
    if (url.startsWith('/api/v1/')) {
      return baseUrl.replace('/api/v1', '') + url;
    }
    if (!url.includes('/')) {
      return baseUrl + '/users/avatars/' + url;
    }
    return baseUrl + (url.startsWith('/') ? '' : '/') + url;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccess(false);
    setProfileError('');
    
    try {
      const updatedUser = await UserService.updateProfile(firstName, lastName);
      updateUser(updatedUser);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setAvatarError('Image must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    setAvatarError('');

    try {
      const updatedUser = await UserService.uploadAvatar(file);
      updateUser(updatedUser);
    } catch (err: any) {
      setAvatarError(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setIsUploadingAvatar(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <motion.div 
      className="max-w-4xl space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar */}
        <div className="col-span-1">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Picture</h3>
            
            <div className="flex flex-col items-center">
              <div className="relative group mb-4">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-indigo-50 text-indigo-300 border-4 border-white shadow-md overflow-hidden transition-all group-hover:shadow-lg">
                  {user.avatarUrl ? (
                    <img src={getAvatarUrl(user.avatarUrl)} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon size={56} />
                  )}
                  
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm">
                      <Loader2 className="animate-spin text-indigo-600" size={32} />
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute bottom-0 right-0 rounded-full bg-indigo-600 p-2.5 text-white shadow-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  <Camera size={18} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/jpeg, image/png, image/webp" 
                  onChange={handleAvatarSelect}
                />
              </div>
              
              <p className="text-xs text-gray-500 text-center mt-2">
                Allowed: JPG, PNG, WEBP.<br/>Max size of 5MB.
              </p>
              
              {avatarError && (
                <p className="text-xs text-red-600 font-medium mt-3 text-center">{avatarError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Profile Form */}
        <div className="col-span-1 md:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Personal Information</h3>
            
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2.5 border"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
                <input
                  id="email"
                  type="email"
                  disabled
                  value={user.email || ''}
                  className="block w-full rounded-xl border-gray-200 bg-gray-50 text-gray-500 shadow-sm sm:text-sm px-4 py-2.5 border cursor-not-allowed"
                />
                <p className="text-xs text-gray-500">Email address cannot be changed right now.</p>
              </div>

              {profileError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 font-medium">
                  {profileError}
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-4 border-t border-gray-100">
                {profileSuccess && (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 animate-in fade-in">
                    <CheckCircle2 size={16} /> Saved Successfully
                  </span>
                )}
                
                <button
                  type="submit"
                  disabled={isSavingProfile || (firstName === user.firstName && lastName === user.lastName)}
                  className="inline-flex justify-center rounded-xl border border-transparent bg-indigo-600 py-2.5 px-6 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
                >
                  {isSavingProfile ? <Loader2 className="animate-spin h-5 w-5" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
        
      </div>

      {/* Security & Sessions Section */}
      <div className="mt-8">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 p-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Active Sessions</h3>
              <p className="text-sm text-gray-500 mt-1">
                These are devices that have logged into your account. Revoke any sessions that you do not recognize.
              </p>
            </div>
            <Link 
              href="/dashboard/settings/security"
              className="rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              View Audit Logs
            </Link>
          </div>
          <ActiveSessionsList />
        </div>
      </div>
    </motion.div>
  );
}

function ActiveSessionsList() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      // Inline dynamic import to avoid circular dependency issues at the top of the file
      const { SessionService } = await import('@/services/session.service');
      const data = await SessionService.getSessions();
      setSessions(data);
    } catch (err) {
      console.error('Failed to load sessions', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async (familyId: string) => {
    if (!confirm('Are you sure you want to revoke this session? It will be logged out immediately.')) return;
    
    setRevokingId(familyId);
    try {
      const { SessionService } = await import('@/services/session.service');
      await SessionService.revokeSession(familyId);
      setSessions(sessions.filter(s => s.familyId !== familyId));
    } catch (err) {
      alert('Failed to revoke session');
    } finally {
      setRevokingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={24} />
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {sessions.map((session, i) => (
        <li key={session.familyId} className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              {/* Could map user agent to icons here, defaulting to generic monitor */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 flex items-center gap-2">
                Session (IP: {session.ipAddress || 'Unknown'})
                {i === 0 && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Current</span>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Started {new Date(session.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => handleRevoke(session.familyId)}
            disabled={revokingId === session.familyId}
            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50 transition-colors"
          >
            {revokingId === session.familyId ? 'Revoking...' : 'Revoke'}
          </button>
        </li>
      ))}
      
      {sessions.length === 0 && (
        <div className="p-8 text-center text-gray-500 text-sm">No active sessions found.</div>
      )}
    </ul>
  );
}
