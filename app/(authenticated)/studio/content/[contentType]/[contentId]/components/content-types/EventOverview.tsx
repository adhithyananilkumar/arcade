import type { OverviewData } from "../../lib/fetchOverviewData";
import type { OverviewTab } from "../ContentOverviewNav";
import type { Metric } from "../sections/MetricsGrid";
import { MetricsGrid } from "../sections/MetricsGrid";
import { CollaboratorsSection } from "../sections/CollaboratorsSection";
import { ActivitySection } from "../sections/ActivitySection";

function humanizeKey(key: string): string {
  const spaced = key.replace(/([a-z])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

// Analytics comes back as a loosely-typed Map<String,Object> from the backend
// (see EventParticipantController#getAnalytics) — only surface primitive
// values so we never render a raw object/array as a "metric".
function analyticsToMetrics(analytics?: Record<string, unknown>): Metric[] {
  if (!analytics) return [];
  return Object.entries(analytics)
    .filter(([, value]) => typeof value === "number" || typeof value === "string")
    .map(([key, value]) => ({ label: humanizeKey(key), value: value as string | number }));
}

export function getEventMetrics(data: OverviewData): Metric[] {
  const metrics: Metric[] = [];
  if (data.eventParticipants) {
    metrics.push({ label: "Registrations", value: data.eventParticipants.length });
  }
  return metrics;
}

export function EventOverviewTab({ tab, data }: { tab: OverviewTab; data: OverviewData }) {
  if (tab === "ANALYTICS") {
    const metrics = analyticsToMetrics(data.eventAnalytics);
    if (metrics.length === 0) {
      return (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 p-8 text-center text-sm text-slate-500">
          No analytics available yet.
        </div>
      );
    }
    return <MetricsGrid metrics={metrics} />;
  }

  if (tab === "REGISTRATIONS") {
    const participants = data.eventParticipants;
    if (!participants || participants.length === 0) {
      return (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 p-8 text-center text-sm text-slate-500">
          No registrations yet.
        </div>
      );
    }
    return (
      <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white/95 shadow-[0_4px_16px_rgba(20,20,43,0.04)]">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Registered</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p) => (
              <tr key={p.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3 font-medium text-[#14142b]">{p.name}</td>
                <td className="px-4 py-3 text-slate-500">{p.email}</td>
                <td className="px-4 py-3 text-slate-500">{p.status}</td>
                <td className="px-4 py-3 text-slate-500">
                  {p.registrationDate ? new Date(p.registrationDate).toLocaleDateString("en-IN") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (tab === "COLLABORATORS") {
    return <CollaboratorsSection collaborators={data.collaborators} />;
  }

  if (tab === "PUBLISHING") {
    return (
      <ActivitySection
        emptyLabel="No publishing history yet."
        entries={data.statusHistory?.map((entry, i) => ({
          id: `${entry.createdAt}-${i}`,
          title: entry.label,
          actorName: entry.actorName,
          createdAt: entry.createdAt,
        }))}
      />
    );
  }

  return null;
}
