"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Shield, Users, X } from "lucide-react";
import { ChannelStaffService, type ChannelStaff } from "@/domains/channels";

interface Props {
  onClose: () => void;
  channelId: string;
}

/**
 * The Exam Studio's "who can edit this" — read-only, unlike `ContentCollaboratorsModal`. Exam has
 * no per-item collaborator/invite system of its own (access is entirely channel-scoped, via
 * `channel.exams.manage[.own]`); this shows the real channel roster instead of a fake invite form
 * for a feature that doesn't exist. Inviting/removing staff stays where it already lives — the
 * channel's own team-management page — linked from the footer rather than duplicated here.
 *
 * Mounted only while open (the caller does `{open && <ChannelAccessModal .../>}`, no `isOpen`
 * prop) so each open is a fresh mount: `loading`/`error` start correct without an effect having to
 * reset them synchronously.
 */
export function ChannelAccessModal({ onClose, channelId }: Props) {
  const [staff, setStaff] = useState<ChannelStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    ChannelStaffService.getStaff(channelId)
      .then((data) => {
        if (!cancelled) setStaff(data);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load the channel's team.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [channelId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-[#14142b]">
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#14142b]">Who can edit this exam</h2>
              <p className="text-xs text-slate-500">
                Anyone on the channel&apos;s team with exam permissions can edit it — there&apos;s
                no separate per-exam invite list.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-8 text-slate-400">
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : error ? (
            <p className="py-8 text-center text-sm text-rose-500">{error}</p>
          ) : staff.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
              <Users size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No team members found.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
              {staff.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-[#14142b]">
                      {(member.userName || member.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="block text-sm font-semibold text-[#14142b]">{member.userName}</span>
                      <span className="block text-xs text-slate-400">{member.email}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-end gap-1">
                    {member.roles.map((role) => (
                      <span
                        key={role.id}
                        className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                      >
                        <Shield size={11} />
                        {role.displayName}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 px-6 py-3">
          <Link
            href={`/channels/${channelId}/manage`}
            onClick={onClose}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Manage the channel&apos;s team →
          </Link>
        </div>
      </div>
    </div>
  );
}
