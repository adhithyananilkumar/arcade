"use client";

// The published exam catalogue — certifications and standalone exams — as a grid of cards. Used by
// Explore's Exams tab (search results) and by the exams category page (one category, or All). A
// signed-in learner gets their registration state on each card; a visitor gets the public
// catalogue.

import { useDeferredValue } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ExamHubCardView,
  getAvailableHubExams,
  getPublicExams,
} from "@/domains/assessments";
import { useAuthStore } from "@/infrastructure/auth/auth.store";
import { examRoutes } from "@/shared/routes/content.routes";
import ExploreEmptyState from "./ExploreEmptyState";

export default function ExamsView({
  searchQuery,
  onClearSearch,
  categoryId,
  unmatchedCategory = false,
}: {
  searchQuery: string;
  onClearSearch: () => void;
  /** Narrows to one Explore category; omitted for every category. */
  categoryId?: string;
  /** The selected category exists only as a built-in department, so no exam can be in it. */
  unmatchedCategory?: boolean;
}) {
  const router = useRouter();
  const signedIn = Boolean(useAuthStore((s) => s.user));
  const q = useDeferredValue(searchQuery.trim());

  const exams = useQuery({
    queryKey: ["exams", "catalogue", signedIn ? "learner" : "public", q, categoryId ?? "all"],
    queryFn: () => (signedIn ? getAvailableHubExams(q, categoryId) : getPublicExams(q, categoryId)),
    enabled: !unmatchedCategory,
  });

  if (unmatchedCategory) {
    return (
      <ExploreEmptyState
        title="No exams in this category yet"
        description="Exams appear here once creators publish them under this category."
      />
    );
  }

  if (exams.isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-80 rounded-3xl bg-slate-200/70" />
        ))}
      </div>
    );
  }

  if (exams.isError) {
    return (
      <ExploreEmptyState
        title="Exams could not be loaded"
        description="Something went wrong while fetching the exam catalogue."
        actionLabel="Try again"
        onAction={() => exams.refetch()}
      />
    );
  }

  const cards = exams.data ?? [];
  if (cards.length === 0) {
    return q ? (
      <ExploreEmptyState
        title="No matching exams"
        description={`No exams matched "${q}". Try a different search term.`}
        actionLabel="Clear search"
        onAction={onClearSearch}
      />
    ) : (
      <ExploreEmptyState
        title={categoryId ? "No exams in this category yet" : "No exams published yet"}
        description="Certifications and standalone exams appear here once creators publish them."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3">
      {cards.map((card, idx) => (
        <ExamHubCardView
          key={card.examId}
          card={card}
          index={idx}
          onOpen={() => router.push(examRoutes.landing(card.examId))}
        />
      ))}
    </div>
  );
}
