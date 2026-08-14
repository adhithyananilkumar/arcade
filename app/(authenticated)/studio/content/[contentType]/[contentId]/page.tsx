"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ShieldAlert, FileQuestion, AlertTriangle, ArrowRight, Clock, Users, CheckCircle2, FileText } from "lucide-react";
import { Skeleton } from "@/shared/design-system/ui/skeleton";
import { ApiError } from "@/infrastructure/http/api";
import { useAuthStore } from "@/infrastructure/auth/auth.store";
import type { ContentTypeSegment } from "./lib/contentTypeRouting";
import { editorHref } from "./lib/contentTypeRouting";
import { availableGroups } from "./lib/capabilities";
import { fetchOverviewData, type OverviewData } from "./lib/fetchOverviewData";
import { submitForReview } from "./lib/contentActions";
import { ContentOverviewHeader } from "./components/ContentOverviewHeader";
import type { OverviewTab } from "./components/ContentOverviewNav";
import { ContentWorkspaceDock } from "./components/ContentWorkspaceDock";
import { MetricsGrid } from "./components/sections/MetricsGrid";
import { ReadinessCard } from "./components/sections/ReadinessCard";
import { ActivitySection, getActivityTheme, cleanActivityTitle } from "./components/sections/ActivitySection";
import { CourseOverviewTab, getCourseMetrics } from "./components/content-types/CourseOverview";
import { EventOverviewTab, getEventMetrics } from "./components/content-types/EventOverview";
import { RoadmapOverviewTab, getRoadmapMetrics } from "./components/content-types/RoadmapOverview";
import { KeyInfoCard } from "./components/sections/KeyInfoCard";
import { LearnersAnalyticsSection } from "./components/sections/LearnersAnalyticsSection";

const VALID_SEGMENTS: ContentTypeSegment[] = ["course", "roadmap", "event"];

type LoadState =
  | { status: "loading" }
  | { status: "unsupported-type" }
  | { status: "not-found" }
  | { status: "forbidden" }
  | { status: "error"; message: string }
  | { status: "ready"; data: OverviewData };

function CenteredState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof ShieldAlert;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-24 text-center">
      <div className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon size={24} />
      </div>
      <h2 className="text-base font-extrabold text-[#14142b]">{title}</h2>
      <p className="max-w-sm text-xs font-medium text-slate-500">{description}</p>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div
      className="min-h-screen w-full relative"
      style={{ background: "linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 35%, #FFFFFF 70%)" }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-24 pb-28 sm:px-6">
        <Skeleton className="h-4 w-32 rounded-full" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-full" />
        </div>
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-3xl" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-40 w-full rounded-3xl" />
      </div>
    </div>
  );
}

export default function ContentOverviewPage() {
  const params = useParams<{ contentType: string; contentId: string }>();
  const rawSegment = params.contentType;
  const contentId = params.contentId;
  const segment = VALID_SEGMENTS.includes(rawSegment as ContentTypeSegment)
    ? (rawSegment as ContentTypeSegment)
    : null;
  const currentUserId = useAuthStore((s) => s.user?.id);

  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [activeTab, setActiveTab] = useState<OverviewTab>("OVERVIEW");
  const [submitting, setSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!segment) {
      setState({ status: "unsupported-type" });
      return;
    }
    let cancelled = false;
    setState((prev) => (prev.status === "ready" ? prev : { status: "loading" }));
    fetchOverviewData(segment, contentId)
      .then((data) => {
        if (cancelled) return;
        if (!data.content) {
          setState({ status: "not-found" });
          return;
        }
        setState({ status: "ready", data });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 403) {
          setState({ status: "forbidden" });
        } else if (err instanceof ApiError && err.status === 404) {
          setState({ status: "not-found" });
        } else {
          setState({ status: "error", message: err instanceof Error ? err.message : "Something went wrong" });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [segment, contentId, reloadKey]);

  useEffect(() => {
    const label =
      activeTab === "OVERVIEW"
        ? "Content Overview"
        : activeTab === "people"
          ? "People"
          : activeTab === "publishing"
            ? "Publishing"
            : activeTab === "analytics"
              ? "Analytics"
              : activeTab === "more"
                ? "More"
                : activeTab;
    window.dispatchEvent(new CustomEvent("studio-crumb-changed", { detail: label }));
    return () => {
      window.dispatchEvent(new CustomEvent("studio-crumb-changed", { detail: null }));
    };
  }, [activeTab]);

  if (state.status === "loading") return <OverviewSkeleton />;

  if (state.status === "unsupported-type") {
    return (
      <CenteredState
        icon={FileQuestion}
        title="Unsupported content type"
        description="This content type doesn't have an overview page yet."
      />
    );
  }

  if (state.status === "not-found") {
    return (
      <CenteredState
        icon={FileQuestion}
        title="Content not found"
        description="This item doesn't exist, or you don't have access to it."
      />
    );
  }

  if (state.status === "forbidden") {
    return (
      <CenteredState
        icon={ShieldAlert}
        title="You don't have access to this content"
        description="Ask an owner or collaborator on this channel for access."
      />
    );
  }

  if (state.status === "error") {
    return <CenteredState icon={AlertTriangle} title="Couldn't load this content" description={state.message} />;
  }

  const { data } = state;
  const content = data.content!;
  const groups = availableGroups(segment!);
  const review = data.review.status === "ok" ? data.review.data : null;

  const metrics =
    segment === "course" ? getCourseMetrics(data) : segment === "event" ? getEventMetrics(data) : getRoadmapMetrics(data);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await submitForReview(segment!, contentId);
      toast.success("Submitted for review");
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit for review");
    } finally {
      setSubmitting(false);
    }
  }

  const collaboratorsPreview = data.collaborators.status === "ok" ? data.collaborators.data.slice(0, 3) : [];
  const activityPreview =
    data.statusHistory.status === "ok"
      ? data.statusHistory.data.slice(0, 3).map((e, i) => ({ id: `${e.createdAt}-${i}`, title: cleanActivityTitle(e.label), actorName: e.actorName, createdAt: e.createdAt }))
      : segment === "roadmap" && data.roadmapActivity?.status === "ok"
        ? data.roadmapActivity.data.slice(0, 3).map((e) => ({ id: e.id, title: e.description, actorName: e.userName, createdAt: e.createdAt }))
        : [];

  return (
    <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden w-full bg-gradient-to-b from-blue-50/50 via-slate-50 to-indigo-50/40">
      {/* Decorative ambient light glows */}
      <div className="absolute top-10 left-1/4 h-96 w-96 rounded-full bg-blue-400/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pt-10 pb-28 sm:px-6 sm:pt-12 lg:pt-14">
        <ContentOverviewHeader
          segment={segment!}
          contentId={contentId}
          title={content.title}
          status={content.status}
          coverImageUrl={content.coverImageUrl}
          channelName={content.channelName}
          authorName={content.authorName}
          createdAt={content.createdAt}
          updatedAt={content.updatedAt}
          review={review}
          showMetadataRail={activeTab === "OVERVIEW"}
          showStatusSubtext={activeTab === "publishing"}
          onJumpToPublishing={() => setActiveTab("publishing")}
        />

        {activeTab === "OVERVIEW" ? (
          <div className="flex flex-col gap-6">
            {segment === "event" && data.eventReadiness?.status === "ok" && (
              <ReadinessCard readiness={data.eventReadiness.data} continueHref={editorHref("event", contentId)} />
            )}

            <LearnersAnalyticsSection />
          </div>
        ) : activeTab === "analytics" ? (
          <LearnersAnalyticsSection />
        ) : segment === "course" ? (
          <CourseOverviewTab
            tab={activeTab}
            data={data}
            contentId={contentId}
            currentUserId={currentUserId}
            onChanged={reload}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        ) : segment === "event" ? (
          <EventOverviewTab
            tab={activeTab}
            data={data}
            contentId={contentId}
            currentUserId={currentUserId}
            onChanged={reload}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        ) : (
          <RoadmapOverviewTab
            tab={activeTab}
            data={data}
            contentId={contentId}
            currentUserId={currentUserId}
            onChanged={reload}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}

        <ContentWorkspaceDock groups={groups} activeTab={activeTab} onChange={setActiveTab} />
      </div>
    </div>
  );
}

