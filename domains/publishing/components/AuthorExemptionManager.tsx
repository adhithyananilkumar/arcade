"use client";

import { useState } from "react";
import { X, UserMinus, ShieldAlert } from "lucide-react";
import type { AuthorExemptionView } from "../api/reviewGovernance";

interface AuthorExemptionManagerProps {
  channelName: string;
  exemptions: AuthorExemptionView[];
  loading?: boolean;
  busy?: boolean;
  canManage: boolean;
  onGrant: (authorId: string, reason: string) => void;
  onRevoke: (exemptionId: string) => void;
  onClose: () => void;
}

/**
 * Manages which authors skip their organization's internal review.
 *
 * The scope note is not decoration. An administrator granting this needs to understand that it
 * removes the organization's own gate and nothing else — platform review still applies — because
 * the alternative reading ("this author can now publish freely") would be a serious
 * misunderstanding of what they just did.
 *
 * Pure presentational; all mutations go through callbacks and are re-authorized server-side.
 */
export function AuthorExemptionManager({
  channelName,
  exemptions,
  loading = false,
  busy = false,
  canManage,
  onGrant,
  onRevoke,
  onClose,
}: AuthorExemptionManagerProps) {
  const [authorId, setAuthorId] = useState("");
  const [reason, setReason] = useState("");

  const active = exemptions.filter((e) => e.active);
  const revoked = exemptions.filter((e) => !e.active);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 arcade-modal-backdrop" onClick={onClose} />
      <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto arcade-modal-box rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface p-6 shadow-xl">
        <header className="flex items-start justify-between gap-4 pb-4">
          <div>
            <h2 className="text-base font-bold text-ink">Author review exemptions</h2>
            <p className="mt-0.5 text-xs text-slate-500">{channelName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-tl-lg rounded-br-lg rounded-tr-xs rounded-bl-xs p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink transition-colors cursor-pointer dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/40">
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            An exemption lets an author skip <strong className="text-ink">this organization&apos;s</strong> review only.
            Platform review still applies to their content unless platform administration has
            separately waived it for this channel. You cannot exempt yourself.
          </p>
        </div>

        {canManage ? (
          <div className="mt-4 rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-ink">Add an exemption</p>
            <div className="mt-3 space-y-2">
              <input
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                placeholder="Author user ID"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-slate-400 focus:border-ink/30 focus:bg-surface focus:ring-4 focus:ring-slate-200/60"
              />
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason (recorded in the audit trail)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-slate-400 focus:border-ink/30 focus:bg-surface focus:ring-4 focus:ring-slate-200/60"
              />
            </div>
            <button
              type="button"
              disabled={!authorId.trim() || busy}
              onClick={() => {
                onGrant(authorId.trim(), reason.trim());
                setAuthorId("");
                setReason("");
              }}
              className="mt-3 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-on-ink shadow-sm transition-colors hover:bg-ink-hover disabled:opacity-50 cursor-pointer"
            >
              Grant exemption
            </button>
          </div>
        ) : null}

        <section className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Active ({active.length})
          </h3>
          {loading ? (
            <p className="py-6 text-center text-sm text-slate-400">Loading…</p>
          ) : active.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              No authors are exempt. Everyone&apos;s content goes through organization review.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-slate-100 dark:divide-slate-800">
              {active.map((e) => (
                <li key={e.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">{e.authorName}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Granted by {e.grantedByName ?? "Unknown"} on{" "}
                      {new Date(e.grantedAt).toLocaleDateString()}
                      {e.reason ? ` — ${e.reason}` : ""}
                    </p>
                  </div>
                  {canManage ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onRevoke(e.id)}
                      className="inline-flex shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50 cursor-pointer dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300"
                    >
                      Revoke
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        {revoked.length > 0 ? (
          <section className="mt-5">
            <h3 className="text-[12px] font-bold uppercase tracking-wide text-slate-400">
              Previously exempt ({revoked.length})
            </h3>
            <ul className="mt-2 divide-y divide-slate-100">
              {revoked.map((e) => (
                <li key={e.id} className="py-2.5">
                  <p className="text-[12px] text-slate-500">
                    <span className="font-semibold text-slate-600">{e.authorName}</span> — revoked{" "}
                    {e.revokedAt ? new Date(e.revokedAt).toLocaleDateString() : ""}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
