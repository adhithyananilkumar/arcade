"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ShieldAlert, FileQuestion, AlertTriangle, ArrowRight, Clock, Users } from "lucide-react";
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
import { KeyInfoCard } from "./components/sections/KeyInfoCard";
import { MetricsGrid } from "./components/sections/MetricsGrid";
import { ReadinessCard } from "./components/sections/ReadinessCard";
import { CourseOverviewTab, getCourseMetrics } from "./components/content-types/CourseOverview";
import { EventOverviewTab, getEventMetrics } from "./components/content-types/EventOverview";
import { RoadmapOverviewTab, getRoadmapMetrics } from "./components/content-types/RoadmapOverview";

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
      <Icon size={28} className="text-slate-300" />
      <h2 className="text-base font-bold text-[#14142b]">{title}</h2>
      <p className="max-w-sm text-sm text-slate-500">{description}</p>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 pb-28 sm:px-6">
      <Skeleton className="h-4 w-32" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-40 w-full rounded-xl" />
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
      ? data.statusHistory.data.slice(0, 3).map((e, i) => ({ id: `${e.createdAt}-${i}`, title: e.label, actorName: e.actorName, createdAt: e.createdAt }))
      : segment === "roadmap" && data.roadmapActivity?.status === "ok"
        ? data.roadmapActivity.data.slice(0, 3).map((e) => ({ id: e.id, title: e.description, actorName: e.userName, createdAt: e.createdAt }))
        : [];

  return (
    <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden bg-[#fafafa]">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[20%] h-[70%] w-[50%] animate-pulse rounded-full bg-indigo-500/15 blur-[120px] duration-10000" />
        <div className="absolute -right-[10%] top-[10%] h-[60%] w-[45%] animate-pulse rounded-full bg-rose-500/15 blur-[120px] duration-7000" />
        <div className="absolute -bottom-[20%] left-[20%] h-[60%] w-[60%] animate-pulse rounded-full bg-emerald-500/15 blur-[120px] duration-10000" />
      </div>
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-28 pb-28 sm:px-6">
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
          onJumpToPublishing={() => setActiveTab("publishing")}
        />

        <ContentWorkspaceDock groups={groups} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "OVERVIEW" ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-6 lg:col-span-2">
              {segment === "event" && data.eventReadiness?.status === "ok" && (
                <ReadinessCard readiness={data.eventReadiness.data} continueHref={editorHref("event", contentId)} />
              )}
              {metrics.length > 0 && <MetricsGrid metrics={metrics} />}
              <KeyInfoCard
                status={content.status}
                channelName={content.channelName}
                authorName={content.authorName}
                createdAt={content.createdAt}
                updatedAt={content.updatedAt}
              />
            </div>
            <div className="flex flex-col gap-6">
              <div className="group rounded-2xl border border-white/40 bg-white/40 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-white/60 hover:bg-white/60 hover:shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-1.5 text-sm font-bold text-[#14142b]">
                    <Users size={14} /> People
                  </h2>
                  {groups.includes("people") && (
                    <button
                      onClick={() => setActiveTab("people")}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#14142b] hover:underline"
                    >
                      View all <ArrowRight size={11} />
                    </button>
                  )}
                </div>
                {collaboratorsPreview.length === 0 ? (
                  <p className="text-xs text-slate-500">No collaborators yet.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {collaboratorsPreview.map((c) => (
                      <li key={c.userId} className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#14142b]">{c.name}</span>
                        <span className="text-slate-400">{c.role}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="group rounded-2xl border border-white/40 bg-white/40 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-white/60 hover:bg-white/60 hover:shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-1.5 text-sm font-bold text-[#14142b]">
                    <Clock size={14} /> Recent activity
                  </h2>
                  {groups.includes("more") ? (
                    <button
                      onClick={() => setActiveTab("more")}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#14142b] hover:underline"
                    >
                      View all <ArrowRight size={11} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTab("publishing")}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#14142b] hover:underline"
                    >
                      View all <ArrowRight size={11} />
                    </button>
                  )}
                </div>
                {activityPreview.length === 0 ? (
                  <p className="text-xs text-slate-500">No activity yet.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {activityPreview.map((e) => (
                      <li key={e.id} className="text-xs">
                        <span className="font-medium text-[#14142b]">{e.title}</span>
                        <span className="text-slate-400"> · {e.actorName}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
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
      </div>
    </div>
  );
}
