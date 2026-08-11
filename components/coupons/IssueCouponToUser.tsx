"use client";

import React, { useEffect, useState } from "react";
import { Search, UserPlus, Loader2 } from "lucide-react";
import { couponService, UserSearchHit } from "@/domains/coupons/services/couponService";

type IssueCouponToUserProps = {
  couponCode: string;
  issuedToLabel?: string | null;
  disabled?: boolean;
  onIssued: (label: string, userId: string) => void;
};

export function IssueCouponToUser({
  couponCode,
  issuedToLabel,
  disabled,
  onIssued,
}: IssueCouponToUserProps) {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<UserSearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || query.trim().length < 1) {
      setHits([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await couponService.searchUsers(query.trim());
        if (!cancelled) setHits(res);
      } catch {
        if (!cancelled) setHits([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, open]);

  const handleIssue = async (user: UserSearchHit) => {
    setIssuing(true);
    setError(null);
    try {
      await couponService.issueToUser(couponCode, user.id);
      onIssued(user.label, user.id);
      setOpen(false);
      setQuery("");
      setHits([]);
    } catch (err: any) {
      setError(err?.message || "Failed to issue coupon.");
    } finally {
      setIssuing(false);
    }
  };

  if (issuedToLabel) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-800">
        Issued to <span className="font-semibold">{issuedToLabel}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {!open ? (
        <button
          type="button"
          disabled={disabled || issuing}
          onClick={() => setOpen(true)}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-[#14142b] hover:bg-slate-50 disabled:opacity-50"
        >
          <UserPlus size={14} />
          Issue to user
        </button>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any platform user…"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-2 text-[12px] outline-none focus:border-[#14142b]"
            />
          </div>
          <div className="mt-2 max-h-40 overflow-y-auto">
            {searching && (
              <p className="flex items-center gap-1 px-2 py-2 text-[11px] text-slate-400">
                <Loader2 size={12} className="animate-spin" /> Searching…
              </p>
            )}
            {!searching && query.trim() && hits.length === 0 && (
              <p className="px-2 py-2 text-[11px] text-slate-400">No users found</p>
            )}
            {hits.map((user) => (
              <button
                key={user.id}
                type="button"
                disabled={issuing}
                onClick={() => void handleIssue(user)}
                className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-[12px] hover:bg-slate-50 disabled:opacity-50"
              >
                <span className="font-semibold text-[#14142b]">{user.label}</span>
                <span className="font-mono text-[10px] text-slate-400">{user.id.slice(0, 8)}…</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setQuery("");
              setHits([]);
              setError(null);
            }}
            className="mt-1 w-full rounded-lg px-2 py-1.5 text-[11px] font-semibold text-slate-500 hover:bg-slate-50"
          >
            Cancel
          </button>
          {error && <p className="mt-1 px-1 text-[11px] text-rose-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
