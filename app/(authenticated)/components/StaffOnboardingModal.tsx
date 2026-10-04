'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/design-system/ui/dialog';
import { toast } from 'sonner';
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
      <DialogContent
        className="max-w-[530px] w-[92vw] p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xl"
        style={{
          backgroundColor: 'var(--theme-surface, #FAFBFD)',
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(224, 236, 255, 0.45) 0%, transparent 70%),
            radial-gradient(ellipse 60% 40% at 95% 90%, rgba(233, 225, 254, 0.25) 0%, transparent 65%),
            linear-gradient(180deg, #FAFBFD 0%, #F5F7FC 100%)
          `,
        }}
      >
        <DialogHeader className="space-y-1.5 pb-4 border-b border-slate-200/80 text-left">
          <DialogTitle className="text-2xl sm:text-[26px] font-normal font-serif italic text-ink tracking-tight leading-snug">
            Your instructor profile.
          </DialogTitle>
          <span className="block h-0.5 w-10 bg-[#205ca8]/60 rounded-full mt-1 mb-1" />
          <DialogDescription className="text-xs sm:text-[13px] text-slate-500 leading-relaxed">
            This is what learners see next to your name on the courses you publish.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          {/* SHORT BIO */}
          <div className="space-y-1">
            <label
              htmlFor="staff-bio"
              className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold"
            >
              SHORT BIO
            </label>
            <textarea
              id="staff-bio"
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="What you do, and what you teach."
              className="w-full py-2 bg-transparent border-b border-slate-300 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#205ca8] dark:focus:border-sky-400 transition-colors resize-none min-h-[64px] leading-relaxed"
            />
          </div>

          {/* SPECIALITIES + YEARS OF EXP. */}
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1">
              <label
                htmlFor="staff-specialities"
                className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold"
              >
                SPECIALITIES
              </label>
              <input
                type="text"
                id="staff-specialities"
                value={specialities}
                onChange={(e) => setSpecialities(e.target.value)}
                placeholder="e.g. Design systems"
                className="w-full py-2 bg-transparent border-b border-slate-300 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#205ca8] dark:focus:border-sky-400 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="staff-experience"
                className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold whitespace-nowrap"
              >
                YEARS OF EXP.
              </label>
              <input
                type="number"
                id="staff-experience"
                min="0"
                max="80"
                step="1"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g. 5"
                className="w-full py-2 bg-transparent border-b border-slate-300 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#205ca8] dark:focus:border-sky-400 transition-colors"
              />
              {!experienceIsValid && (
                <p className="text-[11px] text-red-600 font-medium mt-1 dark:text-red-400">
                  Enter a whole number between 0 and 80.
                </p>
              )}
            </div>
          </div>

          {/* BUTTONS */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => void handleDismiss()}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              {manualOpen ? 'Cancel' : 'Not now'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !experienceIsValid}
              className="relative inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-ink hover:bg-[#205ca8] text-on-ink font-medium text-xs sm:text-sm tracking-wide shadow-2xs transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="size-3.5 border-2 border-white/30 border-t-surface rounded-full animate-spin" />
                  <span>Saving…</span>
                </>
              ) : (
                'Save profile'
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
