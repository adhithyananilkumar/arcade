'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { Button } from '@/shared/design-system/ui/button';
import { Textarea } from '@/shared/design-system/ui/textarea';
import { Input } from '@/shared/design-system/ui/input';
import { toast } from 'sonner';
import { Sparkles, User, Briefcase, Star, X } from 'lucide-react';
import { UserService } from '@/domains/identity';
import { channelService } from '@/domains/channels';

export function StaffOnboardingModal() {
  const { user, updateUser } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  
  const [specialities, setSpecialities] = useState('');
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCheckedOwnership, setHasCheckedOwnership] = useState(false);

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setBio(user?.bio || '');
      setSpecialities(user?.specialities?.join(', ') || '');
      setExperience(user?.experienceYears?.toString() || '');
    };
    window.addEventListener('openStaffOnboarding', handleOpen);
    return () => window.removeEventListener('openStaffOnboarding', handleOpen);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (user.staffOnboardingCompleted) return;

    // Check if user is staff in any channel or has a platform staff role
    const isStaff = user.channelMemberships?.some(m => 
      m.roles.some(r => r.code === 'CONTENT_CREATOR' || r.code === 'CHANNEL_ADMIN' || r.code === 'REVIEWER')
    ) || user.platformRoles?.some(r => r.code === 'PLATFORM_ADMIN');

    if (isStaff) {
      setIsOpen(true);
      setBio(user.bio || '');
    } else if (!hasCheckedOwnership) {
      // User might be the owner of an org or personal channel
      // Owners do not get a ChannelStaff record, so we must check channel ownership directly
      channelService.getMyChannels().then(channels => {
        if (channels.length > 0) {
          setIsOpen(true);
          setBio(user.bio || '');
        }
        setHasCheckedOwnership(true);
      }).catch(() => {
        setHasCheckedOwnership(true);
      });
    }
  }, [user, hasCheckedOwnership]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const nameParts = (user.fullName || '').split(' ');
      const fallbackFirstName = nameParts[0] || 'User';
      const fallbackLastName = nameParts.slice(1).join(' ') || '';

      const updatedProfile = await UserService.updateProfile(
        user.firstName || fallbackFirstName,
        user.lastName || fallbackLastName,
        bio,
        user.linkedinUrl,
        user.username,
        user.mobileNumber,
        user.gender,
        user.address,
        user.githubUrl,
        user.avatarUrl,
        user.onboardingCompleted,
        specialities.split(',').map(s => s.trim()).filter(Boolean),
        parseInt(experience) || 0,
        true // staffOnboardingCompleted
      );

      updateUser(updatedProfile);
      setIsOpen(false);
      toast.success('Instructor profile created successfully!');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 relative">
        {user.staffOnboardingCompleted && (
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X size={20} />
          </button>
        )}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-500/20">
            <Sparkles className="h-7 w-7 text-sky-600 dark:text-sky-400" />
          </div>
          <h2 className="font-serif text-[28px] font-light text-slate-900 dark:text-white leading-tight">
            Welcome, {user.firstName || user.fullName}!
          </h2>
          <p className="mt-2.5 text-[15px] text-slate-500 dark:text-slate-400">
            Set up your instructor profile so learners can get to know you and your expertise.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[14px] font-medium text-slate-700 dark:text-slate-300">
              <User size={16} className="text-slate-400" />
              Your Bio
            </label>
            <Textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="I am a designer at..."
              className="min-h-[110px] resize-none rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-[15px] focus:ring-sky-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[14px] font-medium text-slate-700 dark:text-slate-300">
              <Briefcase size={16} className="text-slate-400" />
              Specialities <span className="text-slate-400 text-[12px] font-normal">(comma separated)</span>
            </label>
            <Input 
              value={specialities}
              onChange={(e) => setSpecialities(e.target.value)}
              placeholder="e.g. Design Systems, Prototyping"
              className="rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-[15px] h-12 focus:ring-sky-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[14px] font-medium text-slate-700 dark:text-slate-300">
              <Star size={16} className="text-slate-400" />
              Years of Experience
            </label>
            <Input 
              type="number"
              min="0"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="e.g. 5"
              className="rounded-xl border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-[15px] h-12 focus:ring-sky-500"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="mt-6 w-full rounded-xl h-12 text-[15px] font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving Profile...' : 'Save Profile'}
          </Button>
        </form>
      </div>
    </div>
  );
}
