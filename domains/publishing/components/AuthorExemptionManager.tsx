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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <header className="flex items-start justify-between gap-4 pb-4">
          <div>
            <h2 className="text-[16px] font-bold text-[#14142b]">Author review exemptions</h2>
            <p className="mt-0.5 text-[12px] text-slate-500">{channelName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <ShieldAlert size={15} className="mt-0.5 shrink-0 text-blue-700" />
          <p className="text-[12px] leading-relaxed text-blue-900">
            An exemption lets an author skip <strong>this organization&apos;s</strong> review only.
            Platform review still applies to their content unless platform administration has
            separately waived it for this channel. You cannot exempt yourself.
          </p>
        </div>

        {canManage ? (
          <div className="mt-4 rounded-xl border border-slate-200 p-4">
            <p className="text-[13px] font-semibold text-[#14142b]">Add an exemption</p>
            <div className="mt-3 space-y-2">
              <input
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                placeholder="Author user ID"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] outline-none focus:border-[#14142b]"
              />
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason (recorded in the audit trail)"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] outline-none focus:border-[#14142b]"
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
              className="mt-3 rounded-full bg-[#14142b] px-4 py-2 text-[12px] font-semibold text-white disabled:opacity-40"
            >
              Grant exemption
            </button>
          </div>
        ) : null}

        <section className="mt-5">
          <h3 className="text-[12px] font-bold uppercase tracking-wide text-slate-500">
            Active ({active.length})
          </h3>
          {loading ? (
            <p className="py-6 text-center text-[13px] text-slate-400">Loading…</p>
          ) : active.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-slate-400">
              No authors are exempt. Everyone&apos;s content goes through organization review.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-slate-100">
              {active.map((e) => (
                <li key={e.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#14142b]">{e.authorName}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
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
                      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-40"
                    >
                      <UserMinus size={12} /> Revoke
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
