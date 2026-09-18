"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { Search, ShieldCheck, Inbox, X } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/infrastructure/auth/auth.store";
import { AuthorizationService } from "@/infrastructure/auth/authorization.service";
import {
  reviewGovernanceApi,
  ChannelGovernanceCard,
  AuthorExemptionManager,
  type ChannelReviewPolicyView,
  type AuthorExemptionView,
  type GovernanceAuditView,
} from "@/domains/publishing";

/**
 * Content Governance.
 *
 * Shows every channel the caller may govern, and lets them change the layer they actually control:
 * platform administrators set whether a channel needs platform review; channel administrators set
 * whether their own organization reviews internally and which of their authors are exempt.
 *
 * Both audiences share one page because they read the same resource — and because a channel
 * administrator seeing the platform setting as read-only is the whole point. Hiding it would leave
 * them puzzled about why content still goes to review after they turned their own gate off.
 */
export default function ContentGovernancePage() {
  const { user } = useAuthStore();

  const canGovernPlatform = AuthorizationService.canGovernPlatformContent(user);
  const canGovernChannel = AuthorizationService.canGovernChannelContent(user);

  if (!canGovernPlatform && !canGovernChannel) {
    notFound();
  }

  const [channels, setChannels] = useState<ChannelReviewPolicyView[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");

  const [exemptionChannel, setExemptionChannel] = useState<ChannelReviewPolicyView | null>(null);
  const [exemptions, setExemptions] = useState<AuthorExemptionView[]>([]);
  const [exemptionsLoading, setExemptionsLoading] = useState(false);

  const [auditChannel, setAuditChannel] = useState<ChannelReviewPolicyView | null>(null);
  const [audit, setAudit] = useState<GovernanceAuditView[]>([]);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      setChannels(await reviewGovernanceApi.listChannels());
    } catch (err) {
      console.error(err);
      setChannels([]);
      setLoadError(
        "Could not load governance settings. Check that you still hold governance authority."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return channels;
    return channels.filter((c) => c.channelName.toLowerCase().includes(q));
  }, [channels, search]);

  const waivedCount = useMemo(
    () => channels.filter((c) => !c.effectivePlatformReviewRequired).length,
    [channels]
  );

  /** Replaces one channel in place so the list does not flicker on every toggle. */
  const replaceChannel = (updated: ChannelReviewPolicyView) =>
    setChannels((prev) => prev.map((c) => (c.channelId === updated.channelId ? updated : c)));

  const updatePlatformPolicy = async (
    channelId: string,
    required: boolean,
    firstPublicationOverride: boolean,
    reason: string
  ) => {
    setBusy(true);
    try {
      const updated = await reviewGovernanceApi.updatePlatformPolicy(channelId, {
        platformReviewRequired: required,
        platformReviewRequiredFirstPublication: firstPublicationOverride,
        reason,
      });
      replaceChannel(updated);
      toast.success(
        required ? "Platform review is now required." : "Platform review waived for this channel."
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update platform policy.");
    } finally {
      setBusy(false);
    }
  };

  const updateOrgPolicy = async (
    channelId: string,
    required: boolean,
    firstPublicationOverride: boolean,
    note: string
  ) => {
    setBusy(true);
    try {
      const updated = await reviewGovernanceApi.updateOrgPolicy(channelId, {
        orgReviewRequired: required,
        orgReviewRequiredFirstPublication: firstPublicationOverride,
        note,
      });
      replaceChannel(updated);
      toast.success(
        required ? "Organization review is now required." : "Organization review disabled."
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update organization policy.");
    } finally {
      setBusy(false);
    }
  };

  const openExemptions = async (channel: ChannelReviewPolicyView) => {
    setExemptionChannel(channel);
    setExemptionsLoading(true);
    try {
      setExemptions(await reviewGovernanceApi.listExemptions(channel.channelId, true));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load exemptions.");
      setExemptions([]);
    } finally {
      setExemptionsLoading(false);
    }
  };

  const openAudit = async (channel: ChannelReviewPolicyView) => {
    setAuditChannel(channel);
    try {
      setAudit(await reviewGovernanceApi.audit(channel.channelId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load governance history.");
      setAudit([]);
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-5 pb-6">
      <header className="flex-none">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-[1.2rem] font-bold tracking-tight text-[#14142b]">
              <ShieldCheck size={19} /> Content governance
            </h1>
            <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-slate-500">
              Decide which channels must clear review before their content reaches learners.
              Platform review is set by platform administration; organization review and author
              exemptions are set by each channel&apos;s own administrators.
            </p>
          </div>
          {waivedCount > 0 ? (
            <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-800">
              {waivedCount} channel{waivedCount === 1 ? "" : "s"} exempt from platform review
            </span>
          ) : null}
        </div>

        <div className="relative mt-4 max-w-sm">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search channels"
            className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-[13px] outline-none focus:border-[#14142b]"
          />
        </div>
      </header>

      {loadError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-800">
          {loadError}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2" aria-busy="true">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Inbox size={24} className="text-slate-400" />
            </div>
            <p className="text-[13px] font-medium text-slate-600">
              {search ? "No channels match that search." : "No channels to govern."}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((channel) => (
              <ChannelGovernanceCard
                key={channel.channelId}
                policy={channel}
                canGovernPlatform={canGovernPlatform}
                // Platform governors can also adjust a channel's org policy; channel admins reach
                // this page only for channels the backend already scoped to them.
                canGovernChannel={canGovernChannel || canGovernPlatform}
                busy={busy}
                onUpdatePlatformPolicy={(required, firstPub, reason) =>
                  updatePlatformPolicy(channel.channelId, required, firstPub, reason)
                }
                onUpdateOrgPolicy={(required, firstPub, note) =>
                  updateOrgPolicy(channel.channelId, required, firstPub, note)
                }
                onManageExemptions={() => openExemptions(channel)}
                onViewAudit={() => openAudit(channel)}
              />
            ))}
          </div>
        )}
      </div>

      {exemptionChannel ? (
        <AuthorExemptionManager
          channelName={exemptionChannel.channelName}
          exemptions={exemptions}
          loading={exemptionsLoading}
          busy={busy}
          canManage={canGovernChannel || canGovernPlatform}
          onClose={() => {
            setExemptionChannel(null);
            load();
          }}
          onGrant={async (authorId, reason) => {
            setBusy(true);
            try {
              await reviewGovernanceApi.grantExemption(exemptionChannel.channelId, {
                authorId,
                reason,
              });
              setExemptions(
                await reviewGovernanceApi.listExemptions(exemptionChannel.channelId, true)
              );
              toast.success("Exemption granted.");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Could not grant exemption.");
            } finally {
              setBusy(false);
            }
          }}
          onRevoke={async (exemptionId) => {
            setBusy(true);
            try {
              await reviewGovernanceApi.revokeExemption(exemptionChannel.channelId, exemptionId);
              setExemptions(
                await reviewGovernanceApi.listExemptions(exemptionChannel.channelId, true)
              );
              toast.success("Exemption revoked.");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Could not revoke exemption.");
            } finally {
              setBusy(false);
            }
          }}
        />
      ) : null}

      {auditChannel ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <header className="flex items-start justify-between gap-4 pb-4">
              <div>
                <h2 className="text-[16px] font-bold text-[#14142b]">Governance history</h2>
                <p className="mt-0.5 text-[12px] text-slate-500">{auditChannel.channelName}</p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setAuditChannel(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </header>

            {audit.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-slate-400">
                No governance changes recorded for this channel.
              </p>
            ) : (
              <ol className="divide-y divide-slate-100">
                {audit.map((entry) => (
                  <li key={entry.id} className="py-3">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-[13px] font-semibold text-[#14142b]">
                        {entry.eventType.replaceAll("_", " ").toLowerCase()}
                      </span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                        {entry.actorScope}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {entry.actorName ?? "Unknown"}
                      {entry.subjectName ? ` → ${entry.subjectName}` : ""} ·{" "}
                      {new Date(entry.createdAt).toLocaleString()}
                    </p>
                    {entry.reason ? (
                      <p className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-[12px] text-slate-700">
                        {entry.reason}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
