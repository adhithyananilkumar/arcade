"use client";

// Learner dock > Exams. The main exams a learner registers for — certifications (tied ones too,
// which require completing their course or event first) and standalone exams. Assessments that live
// inside a course or event are sat from that content, not listed here.
//
// Everything a card shows — status, prerequisite state, fee, windows — is computed server-side by
// ExamHubService; this page only fetches and lays it out.

import { useDeferredValue, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck, Loader2, Search } from "lucide-react";
import {
  ExamHubCardView,
  getAvailableHubExams,
  getMyHubExams,
  type ExamHubCard,
} from "@/domains/assessments";
import { examRoutes } from "@/shared/routes/content.routes";

const pageBg = {
  background: "linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 32%, #FFFFFF 70%)",
};

type Tab = "mine" | "available";

export default function ExamsHubPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("mine");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const mine = useQuery({ queryKey: ["exams", "hub", "mine"], queryFn: getMyHubExams });
  const available = useQuery({
    queryKey: ["exams", "hub", "available", deferredQuery.trim()],
    queryFn: () => getAvailableHubExams(deferredQuery),
    enabled: tab === "available",
  });

  const active = tab === "mine" ? mine : available;
  const cards = active.data ?? [];

  return (
    <main className="min-h-screen pb-32" style={pageBg}>
      <div className="mx-auto w-full max-w-6xl px-4 pt-28 sm:px-6 md:px-8 md:pt-32">
        <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              <ClipboardCheck size={12} />
              Exams
            </div>
            <h1 className="text-[1.75rem] font-bold tracking-tight text-[#14142b] sm:text-[2rem]">
              {tab === "mine" ? "Your exams" : "Find an exam"}
            </h1>
            <p className="mt-1.5 text-[13px] font-medium text-slate-500">
              Certifications and standalone exams. Course and event assessments are taken inside that
              course or event.
            </p>
          </div>

          <div className="inline-flex shrink-0 rounded-full border border-slate-200 bg-white p-1">
            {(
              [
                ["mine", "My exams", mine.data?.length],
                ["available", "Available", undefined],
              ] as const
            ).map(([id, label, count]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`cursor-pointer rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${
                  tab === id ? "bg-[#14142b] text-white" : "text-slate-600 hover:text-[#14142b]"
                }`}
              >
                {label}
                {count !== undefined && count > 0 && <span className="ml-1.5 tabular-nums opacity-70">{count}</span>}
              </button>
            ))}
          </div>
        </header>

        {tab === "available" && (
          <label className="mb-6 flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-4 py-2.5 shadow-xs focus-within:border-slate-300">
            <Search size={16} className="shrink-0 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search exams and certifications"
              className="w-full bg-transparent text-[14px] text-[#14142b] outline-none placeholder:text-slate-400"
            />
          </label>
        )}

        {active.isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-slate-400" size={26} />
          </div>
        ) : active.isError ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <p className="text-[14px] font-semibold text-rose-600">
              {(active.error as Error)?.message ?? "Could not load exams."}
            </p>
            <button
              type="button"
              onClick={() => active.refetch()}
              className="cursor-pointer rounded-full bg-[#14142b] px-5 py-2 text-[13px] font-semibold text-white hover:bg-[#232735]"
            >
              Retry
            </button>
          </div>
        ) : cards.length === 0 ? (
          <EmptyState tab={tab} searching={deferredQuery.trim().length > 0} onBrowse={() => setTab("available")} />
        ) : (
          <HubGrid cards={cards} onOpen={(id) => router.push(examRoutes.landing(id))} />
        )}
      </div>
    </main>
  );
}

function HubGrid({ cards, onOpen }: { cards: ExamHubCard[]; onOpen: (examId: string) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <ExamHubCardView key={card.examId} card={card} onOpen={() => onOpen(card.examId)} />
      ))}
    </div>
  );
}

function EmptyState({
  tab,
  searching,
  onBrowse,
}: {
  tab: Tab;
  searching: boolean;
  onBrowse: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-20 text-center">
      <ClipboardCheck size={30} className="text-slate-300" />
      <p className="text-[15px] font-semibold text-[#14142b]">
        {tab === "mine"
          ? "You haven't registered for any exams"
          : searching
          ? "No exams match your search"
          : "No exams are open right now"}
      </p>
      {tab === "mine" && (
        <>
          <p className="max-w-sm text-[13px] font-medium text-slate-500">
            Browse certifications and standalone exams, then register to sit them.
          </p>
          <button
            type="button"
            onClick={onBrowse}
            className="mt-2 cursor-pointer rounded-full bg-[#14142b] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#232735]"
          >
            Browse exams
          </button>
        </>
      )}
    </div>
  );
}
