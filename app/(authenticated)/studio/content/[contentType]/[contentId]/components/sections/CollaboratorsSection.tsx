import { Users } from "lucide-react";
import type { CollaboratorLite } from "../../lib/fetchOverviewData";

export function CollaboratorsSection({ collaborators }: { collaborators?: CollaboratorLite[] }) {
  if (!collaborators || collaborators.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 p-8 text-center text-sm text-slate-500">
        No collaborators yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white/95 shadow-[0_4px_16px_rgba(20,20,43,0.04)]">
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
  );
}
