"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { useAuthStore } from "@/infrastructure/auth/auth.store";
import { AuthorizationService } from "@/infrastructure/auth/authorization.service";
import {
  platformReviewApi,
  type ReviewQueueItem,
  type ReviewStatus,
} from "@/domains/publishing";
import { ClipboardCheck, Inbox, Search } from "lucide-react";

function StatusBadge({ status }: { status: ReviewStatus }) {
  const map: Record<ReviewStatus, string> = {
    OPEN: "bg-blue-50 text-blue-700 border-blue-200",
    CHANGES_REQUESTED: "bg-amber-50 text-amber-700 border-amber-200",
    COMPLETED: "bg-green-50 text-green-700 border-green-200",
    CANCELLED: "bg-gray-100 text-gray-500 border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${map[status]}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

function detailHref(item: ReviewQueueItem): string {
  if (item.contentType === "COURSE" && item.supportsPreview) {
    return `/studio/published/${item.contentId}`;
  }
  return `/console/reviews/${item.id}`;
}

export default function PlatformReviewsPage() {
  const { user } = useAuthStore();
  if (!AuthorizationService.canReviewContent(user)) {
    notFound();
  }

  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("OPEN");

  const counts = useMemo(() => {
    let toBeReviewed = 0;
    let updations = 0;
    let completed = 0;
    items.forEach((i) => {
      if (i.status === "OPEN") {
        if (i.hasPreviousPublication) updations++;
        else toBeReviewed++;
      }
      if (i.status === "COMPLETED") completed++;
    });
    return { toBeReviewed, updations, completed };
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (statusFilter === "OPEN") {
        if (i.status !== "OPEN") return false;
      }
      if (statusFilter === "TO_BE_REVIEWED") {
        if (i.status !== "OPEN" || i.hasPreviousPublication) return false;
      }
      if (statusFilter === "UPDATIONS") {
        if (i.status !== "OPEN" || !i.hasPreviousPublication) return false;
      }
      if (statusFilter === "CHANGES") {
        if (i.status !== "CHANGES_REQUESTED") return false;
      }
      if (statusFilter === "COMPLETED") {
        if (i.status !== "COMPLETED") return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !(i.title || "").toLowerCase().includes(q) &&
          !(i.ownerName || "").toLowerCase().includes(q) &&
          !(i.channelName || "").toLowerCase().includes(q) &&
          !(i.contentType || "").toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [items, searchQuery, statusFilter]);

  useEffect(() => {
    setLoadError(null);
    platformReviewApi
      .list()
      .then(setItems)
      .catch((err) => {
        console.error(err);
        setItems([]);
        setLoadError("Failed to load platform reviews. Check that the API is reachable and you have review permission.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col w-full space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Platform Reviews</h1>
        <p className="text-gray-500">
          Mixed content queue for courses, roadmaps, workshops, and future types.
        </p>
      </header>

      <main className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              First publication
            </span>
            <span className="text-2xl font-bold text-gray-900 mt-1">{counts.toBeReviewed}</span>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Updates
            </span>
            <span className="text-2xl font-bold text-gray-900 mt-1">{counts.updations}</span>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Completed
            </span>
            <span className="text-2xl font-bold text-gray-900 mt-1">{counts.completed}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, owner, channel, type..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-300"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm"
          >
            <option value="OPEN">In review (all open)</option>
            <option value="TO_BE_REVIEWED">First publication</option>
            <option value="UPDATIONS">Updates</option>
            <option value="CHANGES">Changes requested</option>
            <option value="COMPLETED">Completed</option>
            <option value="ALL">All</option>
          </select>
        </div>

        {loadError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="size-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
            <Inbox className="mx-auto mb-3 text-gray-300" size={40} />
            <p className="font-medium text-gray-700">No reviews in this filter</p>
            <p className="mt-1 text-sm text-gray-500">
              Submitted content will appear here for platform review.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Channel</th>
                  <th className="px-4 py-3 font-semibold">Owner</th>
                  <th className="px-4 py-3 font-semibold">Round</th>
                  <th className="px-4 py-3 font-semibold">Submitted</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        {item.contentType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 line-clamp-1">{item.title}</div>
                      <div className="text-[11px] text-gray-400 line-clamp-1">{item.version}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.channelName}</td>
                    <td className="px-4 py-3 text-gray-600">{item.ownerName}</td>
                    <td className="px-4 py-3 text-gray-600">R{item.reviewRound}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(item.submittedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={item.status} />
                        {item.hasPreviousPublication && item.status === "OPEN" && (
                          <span className="text-[10px] font-medium text-indigo-600">Update</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={detailHref(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                      >
                        <ClipboardCheck size={14} />
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
