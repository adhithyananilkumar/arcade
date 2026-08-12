"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ShieldAlert, FileQuestion, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/shared/design-system/ui/skeleton";
import { ApiError } from "@/infrastructure/http/api";
import type { ContentTypeSegment } from "./lib/contentTypeRouting";
import { CONTENT_CAPABILITIES } from "./lib/capabilities";
import { fetchOverviewData, type OverviewData } from "./lib/fetchOverviewData";
import { ContentOverviewHeader } from "./components/ContentOverviewHeader";
import { ContentOverviewNav, type OverviewTab } from "./components/ContentOverviewNav";
import { KeyInfoCard } from "./components/sections/KeyInfoCard";
import { MetricsGrid } from "./components/sections/MetricsGrid";
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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
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

  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [activeTab, setActiveTab] = useState<OverviewTab>("OVERVIEW");

  useEffect(() => {
    if (!segment) {
      setState({ status: "unsupported-type" });
      return;
    }
    let cancelled = false;
    setState({ status: "loading" });
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
  }, [segment, contentId]);

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
    return (
      <CenteredState icon={AlertTriangle} title="Couldn't load this content" description={state.message} />
    );
  }

  const { data } = state;
  const content = data.content!;
  const capabilities = CONTENT_CAPABILITIES[segment!];
  const channelSuspended = false; // ContentSummaryLite doesn't carry suspension flags today — Edit stays enabled, matching per-domain editor gating.

  const metrics =
    segment === "course"
      ? getCourseMetrics(data)
      : segment === "event"
        ? getEventMetrics(data)
        : getRoadmapMetrics(data);

  return (
    <div
      className="relative flex min-h-screen flex-1 flex-col"
      style={{ background: "linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 35%, #FFFFFF 70%)" }}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
        <ContentOverviewHeader
          segment={segment!}
          title={content.title}
          status={content.status}
          channelName={content.channelName}
          authorName={content.authorName}
          contentId={contentId}
          channelSuspended={channelSuspended}
        />

        <ContentOverviewNav capabilities={capabilities} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "OVERVIEW" ? (
          <div className="flex flex-col gap-6">
            <KeyInfoCard
              status={content.status}
              channelName={content.channelName}
              authorName={content.authorName}
              createdAt={content.createdAt}
              updatedAt={content.updatedAt}
            />
            <MetricsGrid metrics={metrics} />
          </div>
        ) : segment === "course" ? (
          <CourseOverviewTab tab={activeTab} data={data} />
        ) : segment === "event" ? (
          <EventOverviewTab tab={activeTab} data={data} />
        ) : (
          <RoadmapOverviewTab tab={activeTab} data={data} />
        )}
      </div>
    </div>
  );
}
