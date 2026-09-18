"use client";

import { useState } from "react";
import { Building2, Globe2, Lock, Users, History } from "lucide-react";
import type { ChannelReviewPolicyView } from "../api/reviewGovernance";

interface ChannelGovernanceCardProps {
  policy: ChannelReviewPolicyView;
  /** True when the viewer holds `platform.content.governance`. */
  canGovernPlatform: boolean;
  /** True when the viewer may change THIS channel's own org policy. */
  canGovernChannel: boolean;
  busy?: boolean;
  onUpdatePlatformPolicy: (
    required: boolean,
    firstPublicationOverride: boolean,
    reason: string
  ) => void;
  onUpdateOrgPolicy: (required: boolean, firstPublicationOverride: boolean, note: string) => void;
  onManageExemptions: () => void;
  onViewAudit: () => void;
}

function Toggle({
  checked,
  disabled,
  onChange,
  label,
  hint,
  lockedNote,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
  label: string;
  hint?: string;
  lockedNote?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-semibold text-[#14142b]">{label}</span>
          {disabled ? <Lock size={11} className="text-slate-400" /> : null}
        </div>
        {hint ? <p className="mt-0.5 text-[12px] text-slate-500">{hint}</p> : null}
        {disabled && lockedNote ? (
          <p className="mt-1 text-[11px] font-medium text-slate-400">{lockedNote}</p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
          checked ? "bg-[#14142b]" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

/**
 * One channel's review governance.
 *
 * The visual separation between the two blocks is deliberate and load-bearing. A channel
 * administrator sees the platform block rendered read-only with an explicit "Managed by platform
 * administration" note, rather than having it hidden — hiding it would leave them wondering why
 * their content still goes to review after they turned their own review off.
 *
 * Pure presentational: all mutations go out through callbacks. The backend re-checks authority on
 * every one regardless of what these flags allow.
 */
export function ChannelGovernanceCard({
  policy,
  canGovernPlatform,
  canGovernChannel,
  busy = false,
  onUpdatePlatformPolicy,
  onUpdateOrgPolicy,
  onManageExemptions,
  onViewAudit,
}: ChannelGovernanceCardProps) {
  const [pendingWaiver, setPendingWaiver] = useState(false);
  const [reason, setReason] = useState("");

  const platformRequired = policy.effectivePlatformReviewRequired;
  const orgRequired = policy.effectiveOrgReviewRequired;

  const handlePlatformToggle = (next: boolean) => {
    if (!next) {
      // Disabling platform review is the most consequential setting in the pipeline, so it is
      // never a single click: a reason is mandatory and is stored on the audit trail.
      setPendingWaiver(true);
      return;
    }
    onUpdatePlatformPolicy(true, false, "");
  };

  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_24px_rgba(20,20,43,0.05)]">
      <header className="flex items-start justify-between gap-3 pb-3">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-bold text-[#14142b]">{policy.channelName}</h3>
          <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
            {policy.personalChannel ? "Personal channel" : "Organization channel"}
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          {!platformRequired ? (
            <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800">
              Platform waived
            </span>
          ) : null}
          {!policy.personalChannel && !orgRequired ? (
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">
              Org waived
            </span>
          ) : null}
        </div>
      </header>

      {/* ── Platform-governed ───────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-1">
        <div className="flex items-center gap-1.5 pt-3">
          <Globe2 size={13} className="text-slate-500" />
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Platform governance
          </span>
        </div>
        <Toggle
          label="Platform review required"
          hint="Content from this channel must be approved by a platform reviewer before it goes live."
          checked={platformRequired}
          disabled={!canGovernPlatform || busy}
          lockedNote="Managed by platform administration."
          onChange={handlePlatformToggle}
        />
        {!platformRequired ? (
          <div className="pb-3">
            <Toggle
              label="Still require it for the first publication"
              hint="Trust this channel's updates, but check its debut."
              checked={Boolean(policy.platformReviewRequiredFirstPublication)}
              disabled={!canGovernPlatform || busy}
              onChange={(next) =>
                onUpdatePlatformPolicy(false, next, policy.platformExemptionReason ?? "")
              }
            />
            {policy.platformExemptionReason ? (
              <p className="pb-3 text-[11px] leading-relaxed text-slate-500">
                <span className="font-semibold">Reason:</span> {policy.platformExemptionReason}
                {policy.platformPolicyUpdatedByName
                  ? ` — ${policy.platformPolicyUpdatedByName}`
                  : ""}
                {policy.platformPolicyUpdatedAt
                  ? `, ${new Date(policy.platformPolicyUpdatedAt).toLocaleDateString()}`
                  : ""}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {pendingWaiver ? (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-[13px] font-semibold text-amber-900">
            Waive platform review for {policy.channelName}?
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-amber-800">
            Content from this channel will reach learners without platform oversight. This is
            recorded permanently in the governance audit trail.
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Reason (required)"
            className="mt-3 w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-amber-500"
          />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={!reason.trim() || busy}
              onClick={() => {
                onUpdatePlatformPolicy(false, false, reason.trim());
                setPendingWaiver(false);
                setReason("");
              }}
              className="rounded-full bg-amber-900 px-4 py-2 text-[12px] font-semibold text-white disabled:opacity-40"
            >
              Waive platform review
            </button>
            <button
              type="button"
              onClick={() => {
                setPendingWaiver(false);
                setReason("");
              }}
              className="rounded-full border border-amber-300 px-4 py-2 text-[12px] font-semibold text-amber-900"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {/* ── Channel-governed ────────────────────────────────────────────── */}
      {!policy.personalChannel ? (
        <div className="mt-3 rounded-xl border border-slate-200 px-4 py-1">
          <div className="flex items-center gap-1.5 pt-3">
            <Building2 size={13} className="text-slate-500" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Organization governance
            </span>
          </div>
          <Toggle
            label="Organization review required"
            hint="This channel's own reviewers approve content before it goes to the platform."
            checked={orgRequired}
            disabled={!canGovernChannel || busy}
            lockedNote="Managed by this channel's administrators."
            onChange={(next) => onUpdateOrgPolicy(next, false, policy.orgPolicyNote ?? "")}
          />
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 py-3">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-slate-400" />
              <span className="text-[12px] text-slate-600">
                {policy.activeExemptionCount} author
                {policy.activeExemptionCount === 1 ? "" : "s"} exempt from organization review
              </span>
            </div>
            <button
              type="button"
              onClick={onManageExemptions}
              disabled={!canGovernChannel}
              className="rounded-full border border-slate-300 px-3 py-1.5 text-[11px] font-semibold text-[#14142b] hover:bg-slate-50 disabled:opacity-40"
            >
              Manage
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-[12px] leading-relaxed text-slate-500">
          Personal channels have no organization review stage — the owner is the sole author, so
          there is no internal gate to configure.
        </p>
      )}

      <button
        type="button"
        onClick={onViewAudit}
        className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-[#14142b]"
      >
        <History size={13} /> Governance history
      </button>
    </article>
  );
}
