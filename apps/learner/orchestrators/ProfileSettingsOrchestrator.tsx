'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Learner
 *
 * Purpose:
 * The settings surface for a person's public profile: their handle, how they
 * are introduced, whether their learner side is shown, and any handle appeals
 * they have open.
 *
 * Rules:
 * - All side effects live here. The Profiles domain supplies pure components
 *   and the services they are driven by.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AtSign, ExternalLink, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  HandleAppealForm,
  HandleAppealList,
  HandleField,
  HandleService,
  type HandleAppeal,
} from '@/domains/profiles';
import { UserService } from '@/domains/identity';
import { useAuthStore } from '@/infrastructure/auth/auth.store';

export function ProfileSettingsOrchestrator() {
  const { user, updateUser } = useAuthStore();

  const [appeals, setAppeals] = useState<HandleAppeal[]>([]);
  const [appealsLoading, setAppealsLoading] = useState(true);
  const [appealFor, setAppealFor] = useState<string | null>(null);

  // Drafts are null until the field is touched, and read through to the store otherwise. Mirroring
  // the store into state with an effect would either clobber what is being typed when the session
  // refreshes, or go stale when it does not.
  const [headlineDraft, setHeadlineDraft] = useState<string | null>(null);
  const [locationDraft, setLocationDraft] = useState<string | null>(null);
  const headline = headlineDraft ?? user?.headline ?? '';
  const location = locationDraft ?? user?.location ?? '';
  const [savingPresentation, setSavingPresentation] = useState(false);
  const [togglingActivity, setTogglingActivity] = useState(false);

  const loadAppeals = useCallback(async () => {
    setAppealsLoading(true);
    try {
      setAppeals(await HandleService.myAppeals());
    } catch {
      // A failed appeals fetch must not take the whole settings page down — the handle field
      // above it is the part people actually came for and works independently.
      setAppeals([]);
    } finally {
      setAppealsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch-on-mount: the request is the effect's whole purpose and its result has to land in
    // state. Same pattern as ProtectedLayout and the profile page.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAppeals();
  }, [loadAppeals]);

  const claimHandle = async (handle: string) => {
    const result = await HandleService.claimForMe(handle);
    updateUser({ username: result.handle });
    toast.success(`Your profile is now at /${result.handle}`);
  };

  const savePresentation = async () => {
    if (!user) return;
    setSavingPresentation(true);
    try {
      const updated = await UserService.updateProfilePresentation(
        user.firstName ?? '',
        user.lastName ?? '',
        { headline: headline.trim(), location: location.trim() },
      );
      updateUser(updated);
      // Drop the drafts so the fields read from the store again — otherwise a value the server
      // normalised (trimmed, truncated) would keep showing what was typed instead of what saved.
      setHeadlineDraft(null);
      setLocationDraft(null);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not save your profile.',
      );
    } finally {
      setSavingPresentation(false);
    }
  };

  const toggleLearnerActivity = async () => {
    if (!user) return;
    const next = !(user.showLearnerActivity ?? true);
    setTogglingActivity(true);
    try {
      const updated = await UserService.updateProfilePresentation(
        user.firstName ?? '',
        user.lastName ?? '',
        { showLearnerActivity: next },
      );
      updateUser(updated);
      toast.success(
        next
          ? 'Your learning now shows on your profile'
          : 'Your learning is now hidden from your profile',
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not update that setting.',
      );
    } finally {
      setTogglingActivity(false);
    }
  };

  const fileAppeal = async (input: {
    justification: string;
    evidenceUrl?: string;
  }) => {
    if (!appealFor) return;
    await HandleService.fileAppeal({ handle: appealFor, ...input });
    setAppealFor(null);
    toast.success('Appeal filed. An Arcade administrator will review it.');
    loadAppeals();
  };

  const withdrawAppeal = async (appealId: string) => {
    try {
      await HandleService.withdrawAppeal(appealId);
      toast.success('Appeal withdrawn');
      loadAppeals();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not withdraw that appeal.',
      );
    }
  };

  const handle = user?.username ?? null;
  const showLearnerActivity = user?.showLearnerActivity ?? true;

  return (
    <div className="space-y-8">
      {/* --- Handle ---------------------------------------------------- */}
      <section className="rounded-[20px] border border-slate-100 bg-white p-6 dark:border-neutral-900 dark:bg-black">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 dark:bg-neutral-900">
            <AtSign size={16} className="text-slate-400 dark:text-neutral-500" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-extrabold tracking-tight text-slate-900 dark:text-white">
              Your handle
            </h2>
            <p className="mt-1 text-[12.5px] font-medium leading-relaxed text-slate-500 dark:text-neutral-400">
              This is your address on Arcade. People and organizations share one
              namespace, so a handle is unique across the whole platform.
            </p>
            {handle && (
              <Link
                href={`/${handle}`}
                className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-extrabold text-indigo-500 transition-colors hover:text-indigo-600 dark:text-indigo-400"
              >
                View your profile <ExternalLink size={12} />
              </Link>
            )}
          </div>
        </div>

        <div className="mt-6">
          <HandleField
            currentHandle={handle}
            onClaim={claimHandle}
            onAppeal={(contested) => setAppealFor(contested)}
            label="Handle"
            description={
              handle
                ? 'Changing this changes your profile URL. The old one stops working immediately.'
                : 'You have not claimed a handle yet — your profile has no public address until you do.'
            }
          />
        </div>
      </section>

      {appealFor && (
        <HandleAppealForm
          handle={appealFor}
          onSubmit={fileAppeal}
          onCancel={() => setAppealFor(null)}
        />
      )}

      {/* --- Presentation ---------------------------------------------- */}
      <section className="rounded-[20px] border border-slate-100 bg-white p-6 dark:border-neutral-900 dark:bg-black">
        <h2 className="text-[15px] font-extrabold tracking-tight text-slate-900 dark:text-white">
          How you&apos;re introduced
        </h2>
        <p className="mt-1 text-[12.5px] font-medium leading-relaxed text-slate-500 dark:text-neutral-400">
          Shown at the top of your profile, under your name.
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="profile-headline"
              className="block text-[12.5px] font-extrabold tracking-tight text-slate-700 dark:text-neutral-200"
            >
              Headline
            </label>
            <input
              id="profile-headline"
              value={headline}
              onChange={(e) => setHeadlineDraft(e.target.value)}
              maxLength={160}
              placeholder="Systems engineer, teaching distributed systems"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13.5px] font-semibold text-slate-900 outline-none transition-colors focus:border-slate-900 placeholder:font-medium placeholder:text-slate-300 dark:border-neutral-800 dark:bg-black dark:text-white dark:focus:border-neutral-400 dark:placeholder:text-neutral-700"
            />
            <p className="mt-1.5 text-right text-[11.5px] font-bold tabular-nums text-slate-300 dark:text-neutral-600">
              {headline.length}/160
            </p>
          </div>

          <div>
            <label
              htmlFor="profile-location"
              className="block text-[12.5px] font-extrabold tracking-tight text-slate-700 dark:text-neutral-200"
            >
              Location
            </label>
            <p className="mt-1 text-[12px] font-medium text-slate-400 dark:text-neutral-500">
              Public. Separate from the billing address in your personal info,
              which never appears on your profile.
            </p>
            <input
              id="profile-location"
              value={location}
              onChange={(e) => setLocationDraft(e.target.value)}
              maxLength={120}
              placeholder="Kerala, India"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13.5px] font-semibold text-slate-900 outline-none transition-colors focus:border-slate-900 placeholder:font-medium placeholder:text-slate-300 dark:border-neutral-800 dark:bg-black dark:text-white dark:focus:border-neutral-400 dark:placeholder:text-neutral-700"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={savePresentation}
              disabled={savingPresentation}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-[13px] font-extrabold tracking-tight text-white transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              {savingPresentation ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </section>

      {/* --- Learner activity ------------------------------------------ */}
      <section className="rounded-[20px] border border-slate-100 bg-white p-6 dark:border-neutral-900 dark:bg-black">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-extrabold tracking-tight text-slate-900 dark:text-white">
              Show my learning on my profile
            </h2>
            <p className="mt-1 max-w-xl text-[12.5px] font-medium leading-relaxed text-slate-500 dark:text-neutral-400">
              Everyone on Arcade is a learner first. If you also teach, your
              profile leads with what you have published — this decides whether
              the certificates you have earned appear alongside it. Turning it
              off removes them from the page entirely, not just from view.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={showLearnerActivity}
            onClick={toggleLearnerActivity}
            disabled={togglingActivity}
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
              showLearnerActivity
                ? 'bg-slate-900 dark:bg-white'
                : 'bg-slate-200 dark:bg-neutral-800'
            }`}
          >
            <span className="sr-only">
              {showLearnerActivity ? 'Hide' : 'Show'} my learning on my profile
            </span>
            <span
              className={`inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow transition-transform dark:bg-black ${
                showLearnerActivity ? 'translate-x-6' : 'translate-x-1'
              }`}
            >
              {togglingActivity ? (
                <Loader2 size={11} className="animate-spin text-slate-400" />
              ) : showLearnerActivity ? (
                <Eye size={11} className="text-slate-400" />
              ) : (
                <EyeOff size={11} className="text-slate-400" />
              )}
            </span>
          </button>
        </div>
      </section>

      {/* --- Appeals ---------------------------------------------------- */}
      <section>
        <h2 className="text-[15px] font-extrabold tracking-tight text-slate-900 dark:text-white">
          Handle appeals
        </h2>
        <p className="mt-1 text-[12.5px] font-medium leading-relaxed text-slate-500 dark:text-neutral-400">
          Claims you have filed on handles held by someone else, including those
          filed for channels you run.
        </p>

        <div className="mt-5">
          {appealsLoading ? (
            <div className="flex items-center gap-2 text-[12.5px] font-bold text-slate-400 dark:text-neutral-500">
              <Loader2 size={14} className="animate-spin" /> Loading appeals…
            </div>
          ) : (
            <HandleAppealList appeals={appeals} onWithdraw={withdrawAppeal} />
          )}
        </div>
      </section>
    </div>
  );
}
