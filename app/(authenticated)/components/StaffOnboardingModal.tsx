'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { Button } from '@/shared/design-system/ui/button';
import { Textarea } from '@/shared/design-system/ui/textarea';
import { Input } from '@/shared/design-system/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/design-system/ui/dialog';
import { toast } from 'sonner';
import { Sparkles, User, Briefcase, Star } from 'lucide-react';
import { UserService } from '@/domains/identity';
import { channelService } from '@/domains/channels';

/**
 * Event other surfaces dispatch to reopen this form on demand — see the "Instructor profile"
 * button in account settings.
 */
export const OPEN_STAFF_ONBOARDING_EVENT = 'openStaffOnboarding';

/**
 * A one-time prompt asking people who publish content to fill in the instructor profile that
 * appears next to their name on course pages.
 *
 * Mounted in the authenticated layout, so it can greet someone wherever they land after
 * signing in. Two things it deliberately does NOT do: it never blocks — "Not now" is always
 * available, because a profile blurb is not worth trapping someone in a modal over — and it
 * only asks once, because `staffOnboardingCompleted` is set either way.
 */
export function StaffOnboardingModal() {
  const { user, updateUser } = useAuthStore();

  /** Set when the settings page asks for the form; never auto-prompts in that case. */
  const [manualOpen, setManualOpen] = useState(false);
  /** Set when the prompt has been answered or waved away in this session. */
  const [dismissed, setDismissed] = useState(false);
  /** null until the ownership lookup answers; only ever set from an async callback. */
  const [ownsChannel, setOwnsChannel] = useState<boolean | null>(null);

  const [specialities, setSpecialities] = useState('');
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  /** Which user the form fields currently hold values for — see the hydration note below. */
  const [hydratedFor, setHydratedFor] = useState<string | null>(null);

  const hasStaffRole = Boolean(
    user?.channelMemberships?.some((m) =>
      m.roles.some((r) => ['CONTENT_CREATOR', 'CHANNEL_ADMIN', 'REVIEWER'].includes(r.code))
    ) || user?.platformRoles?.some((r) => r.code === 'PLATFORM_ADMIN')
  );

  const shouldAutoPrompt =
    Boolean(user) && !user?.staffOnboardingCompleted && (hasStaffRole || ownsChannel === true);
  const isOpen = manualOpen || (shouldAutoPrompt && !dismissed);

  // Manual reopen, from account settings.
  useEffect(() => {
    const handleOpen = () => setManualOpen(true);
    window.addEventListener(OPEN_STAFF_ONBOARDING_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_STAFF_ONBOARDING_EVENT, handleOpen);
  }, []);

  /**
   * A channel owner holds no ChannelStaff record, so ownership is the only way to find them.
   * Runs at most once per session — this component is mounted on every authenticated page, so
   * a lookup per navigation would be a request per page view for everyone who is not staff.
   */
  useEffect(() => {
    if (!user || user.staffOnboardingCompleted || hasStaffRole || ownsChannel !== null) return;
    let cancelled = false;
    channelService
      .getMyChannels()
      .then((channels) => {
        if (!cancelled) setOwnsChannel(channels.length > 0);
      })
      .catch(() => {
        // Not being able to list channels is no reason to bother someone with a form.
        if (!cancelled) setOwnsChannel(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, hasStaffRole, ownsChannel]);

  /**
   * Fill the form from the profile the first time it opens for a given user.
   *
   * Adjusting state during render rather than in an effect: this derives form state from
   * props, so doing it in an effect would render once with stale values and again with the
   * real ones. React re-runs this component immediately without committing the first pass.
   */
  if (user && isOpen && hydratedFor !== user.id) {
    setHydratedFor(user.id);
    setBio(user.bio || '');
    setSpecialities(user.specialities?.join(', ') || '');
    setExperience(user.experienceYears != null ? String(user.experienceYears) : '');
  }

  if (!user) return null;

  const parsedExperience = experience.trim() === '' ? undefined : Number(experience);
  const experienceIsValid =
    parsedExperience === undefined ||
    (Number.isInteger(parsedExperience) && parsedExperience >= 0 && parsedExperience <= 80);

  const persist = async (fields: {
    bio?: string;
    specialities?: string[];
    experienceYears?: number;
    staffOnboardingCompleted: boolean;
  }) => {
    const nameParts = (user.fullName || '').split(' ');
    const firstName = user.firstName || nameParts[0] || 'User';
    const lastName = user.lastName || nameParts.slice(1).join(' ') || '';

    // A dedicated partial update — the general updateProfile takes every field positionally,
    // and sending it from here would overwrite whatever this form does not know about.
    const updated = await UserService.updateInstructorProfile(firstName, lastName, {
      ...fields,
    });
    updateUser(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!experienceIsValid) {
      toast.error('Enter your years of experience as a whole number between 0 and 80.');
      return;
    }

    setIsSubmitting(true);
    try {
      await persist({
        bio: bio.trim(),
        specialities: specialities
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        experienceYears: parsedExperience,
        staffOnboardingCompleted: true,
      });
      setManualOpen(false);
      setDismissed(true);
      setHydratedFor(null);
      toast.success('Instructor profile saved');
    } catch {
      toast.error('Could not save your profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Dismissing still marks the prompt as seen, so it greets someone once rather than on every
   * sign-in. They can reopen it any time from account settings.
   */
  const handleDismiss = async () => {
    setManualOpen(false);
    setDismissed(true);
    setHydratedFor(null);
    if (manualOpen || user.staffOnboardingCompleted) return;
    try {
      await persist({ staffOnboardingCompleted: true });
    } catch {
      // Worst case it asks again next time; not worth an error toast.
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) void handleDismiss();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-500/20">
            <Sparkles className="h-7 w-7 text-sky-600 dark:text-sky-400" />
          </div>
          <DialogTitle className="text-center font-serif text-[26px] font-light leading-tight">
            {manualOpen
              ? 'Your instructor profile'
              : `Welcome, ${user.firstName || user.fullName || 'there'}!`}
          </DialogTitle>
          <DialogDescription className="text-center text-[15px]">
            This is what learners see next to your name on the courses you publish.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
          <div className="space-y-1.5">
            <label
              htmlFor="staff-bio"
              className="flex items-center gap-2 text-[14px] font-medium text-slate-700 dark:text-slate-300"
            >
              <User size={16} className="text-slate-400" />
              Short bio
            </label>
            <Textarea
              id="staff-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="What you do, and what you teach."
              className="min-h-[110px] resize-none rounded-xl border-slate-300 bg-slate-50 text-[15px] focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-800/50"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="staff-specialities"
              className="flex items-center gap-2 text-[14px] font-medium text-slate-700 dark:text-slate-300"
            >
              <Briefcase size={16} className="text-slate-400" />
              Specialities{' '}
              <span className="text-[12px] font-normal text-slate-400">(comma separated)</span>
            </label>
            <Input
              id="staff-specialities"
              value={specialities}
              onChange={(e) => setSpecialities(e.target.value)}
              placeholder="e.g. Design systems, Prototyping"
              className="h-12 rounded-xl border-slate-300 bg-slate-50 text-[15px] focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-800/50"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="staff-experience"
              className="flex items-center gap-2 text-[14px] font-medium text-slate-700 dark:text-slate-300"
            >
              <Star size={16} className="text-slate-400" />
              Years of experience
            </label>
            <Input
              id="staff-experience"
              type="number"
              min="0"
              max="80"
              step="1"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="e.g. 5"
              className="h-12 rounded-xl border-slate-300 bg-slate-50 text-[15px] focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-800/50"
            />
            {!experienceIsValid && (
              <p className="text-[12px] font-medium text-red-600">
                Enter a whole number between 0 and 80.
              </p>
            )}
          </div>

          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => void handleDismiss()}
              disabled={isSubmitting}
              className="h-12 rounded-xl text-[15px]"
            >
              {manualOpen ? 'Cancel' : 'Not now'}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !experienceIsValid}
              className="h-12 rounded-xl bg-sky-600 text-[15px] font-semibold text-white shadow-md transition-all hover:bg-sky-700 hover:shadow-lg active:scale-[0.98] disabled:opacity-60 sm:min-w-[160px]"
            >
              {isSubmitting ? 'Saving…' : 'Save profile'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
