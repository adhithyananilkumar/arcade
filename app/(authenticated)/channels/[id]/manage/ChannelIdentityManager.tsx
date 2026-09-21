'use client';

/**
 * Channel -> Manage -> Identity.
 *
 * An organization channel's public face: the handle it is served from, the
 * presentation fields on its standalone profile, and any appeal it has filed
 * for a handle somebody else holds.
 *
 * A personal channel never reaches this tab. It has no page of its own — its
 * owner's profile is its page, and its catalog renders there — so it has no
 * handle to claim and nothing to appeal for. The tab is omitted rather than
 * shown disabled, because "you cannot have this" is not a setting.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AtSign, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  HandleAppealForm,
  HandleAppealList,
  HandleField,
  HandleService,
  type HandleAppeal,
} from '@/domains/profiles';
import { channelService, type Channel } from '@/domains/channels';

export function ChannelIdentityManager({
  channel,
  canEdit,
  onUpdate,
}: {
  channel: Channel;
  canEdit: boolean;
  onUpdate: (channel: Channel) => void;
}) {
  const [appeals, setAppeals] = useState<HandleAppeal[]>([]);
  const [appealsLoading, setAppealsLoading] = useState(true);
  const [appealFor, setAppealFor] = useState<string | null>(null);

  const [tagline, setTagline] = useState(channel.tagline ?? '');
  const [location, setLocation] = useState(channel.location ?? '');
  const [websiteUrl, setWebsiteUrl] = useState(channel.websiteUrl ?? '');
  const [saving, setSaving] = useState(false);

  const loadAppeals = useCallback(async () => {
    setAppealsLoading(true);
    try {
      setAppeals(await HandleService.channelAppeals(channel.id));
    } catch {
      // The appeals list is secondary to the handle field above it; a failure to load it must
      // not take the whole tab down.
      setAppeals([]);
    } finally {
      setAppealsLoading(false);
    }
  }, [channel.id]);

  useEffect(() => {
    loadAppeals();
  }, [loadAppeals]);

  useEffect(() => {
    setTagline(channel.tagline ?? '');
    setLocation(channel.location ?? '');
    setWebsiteUrl(channel.websiteUrl ?? '');
  }, [channel.tagline, channel.location, channel.websiteUrl]);

  const claimHandle = async (handle: string) => {
    const result = await HandleService.claimForChannel(channel.id, handle);
    onUpdate({ ...channel, handle: result.handle });
    toast.success(`${channel.name} is now at /${result.handle}`);
  };

  const savePresentation = async () => {
    setSaving(true);
    try {
      const updated = await channelService.updateProfileFields(channel.id, {
        tagline: tagline.trim(),
        location: location.trim(),
        websiteUrl: websiteUrl.trim(),
      });
      onUpdate(updated);
      toast.success('Channel profile updated');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not save those details.',
      );
    } finally {
      setSaving(false);
    }
  };

  const fileAppeal = async (input: {
    justification: string;
    evidenceUrl?: string;
  }) => {
    if (!appealFor) return;
    await HandleService.fileAppeal({
      handle: appealFor,
      claimantType: 'CHANNEL',
      claimantId: channel.id,
      ...input,
    });
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

  return (
    <div className="space-y-6">
      <section className="rounded-[20px] border border-slate-100 bg-white p-6 dark:border-neutral-900 dark:bg-black">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 dark:bg-neutral-900">
            <AtSign size={16} className="text-slate-400 dark:text-neutral-500" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-extrabold tracking-tight text-slate-900 dark:text-white">
              Channel handle
            </h2>
            <p className="mt-1 text-[12.5px] font-medium leading-relaxed text-slate-500 dark:text-neutral-400">
              This channel&apos;s address on Arcade. People and organizations
              share one namespace, so a handle is unique across the whole
              platform — if your organization&apos;s name is already taken, you
              can appeal for it below.
            </p>
            {channel.handle && (
              <Link
                href={`/${channel.handle}`}
                className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-extrabold text-indigo-500 transition-colors hover:text-indigo-600 dark:text-indigo-400"
              >
                View public page <ExternalLink size={12} />
              </Link>
            )}
          </div>
        </div>

        <div className="mt-6">
          {canEdit ? (
            <HandleField
              currentHandle={channel.handle}
              channelId={channel.id}
              onClaim={claimHandle}
              onAppeal={(contested) => setAppealFor(contested)}
              label="Handle"
              description={
                channel.handle
                  ? 'Changing this changes the channel URL. The old one stops working immediately.'
                  : 'This channel has no public address until a handle is claimed.'
              }
            />
          ) : (
            <p className="text-[13px] font-semibold text-slate-500 dark:text-neutral-400">
              {channel.handle
                ? `@${channel.handle}`
                : 'No handle claimed yet.'}{' '}
              <span className="font-medium text-slate-400 dark:text-neutral-500">
                Only staff who can manage channel settings may change this.
              </span>
            </p>
          )}
        </div>
      </section>

      {appealFor && (
        <HandleAppealForm
          handle={appealFor}
          onSubmit={fileAppeal}
          onCancel={() => setAppealFor(null)}
        />
      )}

      {canEdit && (
        <section className="rounded-[20px] border border-slate-100 bg-white p-6 dark:border-neutral-900 dark:bg-black">
          <h2 className="text-[15px] font-extrabold tracking-tight text-slate-900 dark:text-white">
            Public profile
          </h2>
          <p className="mt-1 text-[12.5px] font-medium leading-relaxed text-slate-500 dark:text-neutral-400">
            Shown on the channel&apos;s standalone page, under its name.
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="channel-tagline"
                className="block text-[12.5px] font-extrabold tracking-tight text-slate-700 dark:text-neutral-200"
              >
                Tagline
              </label>
              <input
                id="channel-tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                maxLength={160}
                placeholder="Engineering education, since 1998"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13.5px] font-semibold text-slate-900 outline-none transition-colors focus:border-slate-900 placeholder:font-medium placeholder:text-slate-300 dark:border-neutral-800 dark:bg-black dark:text-white dark:focus:border-neutral-400"
              />
              <p className="mt-1.5 text-right text-[11.5px] font-bold tabular-nums text-slate-300 dark:text-neutral-600">
                {tagline.length}/160
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="channel-location"
                  className="block text-[12.5px] font-extrabold tracking-tight text-slate-700 dark:text-neutral-200"
                >
                  Location
                </label>
                <input
                  id="channel-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  maxLength={120}
                  placeholder="Kerala, India"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13.5px] font-semibold text-slate-900 outline-none transition-colors focus:border-slate-900 placeholder:font-medium placeholder:text-slate-300 dark:border-neutral-800 dark:bg-black dark:text-white dark:focus:border-neutral-400"
                />
              </div>

              <div>
                <label
                  htmlFor="channel-website"
                  className="block text-[12.5px] font-extrabold tracking-tight text-slate-700 dark:text-neutral-200"
                >
                  Website
                </label>
                <input
                  id="channel-website"
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13.5px] font-semibold text-slate-900 outline-none transition-colors focus:border-slate-900 placeholder:font-medium placeholder:text-slate-300 dark:border-neutral-800 dark:bg-black dark:text-white dark:focus:border-neutral-400"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={savePresentation}
                disabled={saving}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-[13px] font-extrabold tracking-tight text-white transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-[15px] font-extrabold tracking-tight text-slate-900 dark:text-white">
          Handle appeals
        </h2>
        <p className="mt-1 text-[12.5px] font-medium leading-relaxed text-slate-500 dark:text-neutral-400">
          Claims this channel has filed on handles held by someone else.
        </p>

        <div className="mt-5">
          {appealsLoading ? (
            <div className="flex items-center gap-2 text-[12.5px] font-bold text-slate-400 dark:text-neutral-500">
              <Loader2 size={14} className="animate-spin" /> Loading appeals…
            </div>
          ) : (
            <HandleAppealList
              appeals={appeals}
              onWithdraw={canEdit ? withdrawAppeal : undefined}
              emptyTitle="No appeals filed"
              emptyDescription="If this organization's name is already taken by another account, you can appeal for it from the handle field above."
            />
          )}
        </div>
      </section>
    </div>
  );
}
