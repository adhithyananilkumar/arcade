"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Users, Plus, AlertTriangle } from "lucide-react";
import type { CollaboratorLite } from "../../lib/fetchOverviewData";
import type { ContentTypeSegment } from "../../lib/contentTypeRouting";
import { inviteCollaborator } from "../../lib/contentActions";
import { EmptyState } from "./EmptyState";

function AddCollaboratorForm({
  segment,
  contentId,
  onAdded,
  onCancel,
}: {
  segment: ContentTypeSegment;
  contentId: string;
  onAdded: () => void;
  onCancel: () => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"EDITOR" | "MANAGER" | "VIEWER">("EDITOR");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    try {
      await inviteCollaborator(segment, contentId, email.trim(), role);
      toast.success(`Invited ${email.trim()}`);
      setEmail("");
      onAdded();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not invite collaborator");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/80 bg-white/95 p-3">
      <input
        type="email"
        required
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        className="min-w-[180px] flex-1 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-[#14142b]/30 focus:bg-white"
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as typeof role)}
        className="rounded-lg border border-slate-200 bg-slate-50/50 px-2 py-2 text-sm"
      >
        <option value="EDITOR">Editor</option>
        <option value="MANAGER">Manager</option>
        <option value="VIEWER">Viewer</option>
      </select>
      <button
        type="submit"
        disabled={busy || !email.trim()}
        className="rounded-lg bg-[#14142b] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#232735] disabled:opacity-60"
      >
        {busy ? "Inviting…" : "Invite"}
      </button>
      <button type="button" onClick={onCancel} className="text-xs font-semibold text-slate-500 hover:text-[#14142b]">
        Cancel
      </button>
    </form>
  );
}

export function CollaboratorsSection({
  segment,
  contentId,
  collaborators,
  unavailable,
  canManage,
  onChanged,
}: {
  segment: ContentTypeSegment;
  contentId: string;
  collaborators?: CollaboratorLite[];
  unavailable?: boolean;
  canManage?: boolean;
  onChanged?: () => void;
}) {
  const [adding, setAdding] = useState(false);

  if (unavailable) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">
        <AlertTriangle size={14} /> Collaborators temporarily unavailable — try again shortly.
      </div>
    );
  }

  if (!collaborators || collaborators.length === 0) {
    if (adding) {
      return (
        <AddCollaboratorForm
          segment={segment}
          contentId={contentId}
          onAdded={() => {
            setAdding(false);
            onChanged?.();
          }}
          onCancel={() => setAdding(false)}
        />
      );
    }
    return (
      <EmptyState
        title="No collaborators yet"
        description="Add people who need access to this content."
        action={
          canManage ? (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#14142b] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#232735]"
            >
              <Plus size={13} /> Add collaborator
            </button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative group my-2 select-none">
        {/* Bottom-Left Outline Frame Offset */}
        <div className="pointer-events-none absolute -bottom-2.5 -left-2.5 inset-0 rounded-2xl border-2 border-[#06b6d4] transition-all duration-300 group-hover:-bottom-3.5 group-hover:-left-3.5 z-0" />

        {/* Top-Right Solid Color Panel Offset */}
        <div className="pointer-events-none absolute -top-2.5 -right-2.5 inset-0 rounded-2xl bg-[#06b6d4] transition-all duration-300 group-hover:-top-3.5 group-hover:-right-3.5 z-0" />

        {/* Main White Card Container */}
        <div className="relative z-10 overflow-x-auto rounded-2xl border border-slate-200/90 bg-white p-2 shadow-md">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {collaborators.map((c) => (
                <tr key={c.userId} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-[#14142b]">
                    <span className="inline-flex items-center gap-2">
                      <Users size={14} className="text-slate-400" /> {c.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{c.email}</td>
                  <td className="px-4 py-3 text-slate-500">{c.role}</td>
                  <td className="px-4 py-3 text-slate-500">{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {canManage &&
        (adding ? (
          <AddCollaboratorForm
            segment={segment}
            contentId={contentId}
            onAdded={() => {
              setAdding(false);
              onChanged?.();
            }}
            onCancel={() => setAdding(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-[#14142b] hover:underline"
          >
            <Plus size={13} /> Add collaborator
          </button>
        ))}
    </div>
  );
}
