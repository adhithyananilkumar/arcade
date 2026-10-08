"use client";

import { goBackTo, safeReturnTo } from "@/infrastructure/state/navigationHistory";
import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { usePathname, useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ShieldAlert, FileQuestion, AlertTriangle, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/shared/design-system/ui/skeleton";
import { ApiError } from "@/infrastructure/http/api";
import { useAuthStore } from "@/infrastructure/auth/auth.store";
import { WorkspaceLoading, WorkspaceTabBody, WorkspaceTabs, type WorkspaceTab } from "@/apps/creator/studio/core/StudioWorkspaceKit";
import type { ContentTypeSegment } from "./lib/contentTypeRouting";
import { fetchOverviewData, type OverviewData } from "./lib/fetchOverviewData";
import { submitForReview } from "./lib/contentActions";
import { ContentOverviewHeader } from "./components/ContentOverviewHeader";
import type { OverviewTab } from "./components/ContentOverviewNav";
import { COURSE_TABS, CourseOverviewTab, type CourseTab } from "./components/content-types/CourseOverview";
import { EVENT_TABS, EventOverviewTab } from "./components/content-types/EventOverview";
import { ExamOverviewTab } from "./components/content-types/ExamOverview";
import { EXAM_TABS, ExamOverviewSections, type ExamTab } from "./components/sections/exam/ExamOverviewSections";
import { getExam, type ExamResponse } from "@/domains/assessments";
import { ChannelBrandingNotice, brandingSetupHref, isBrandingIncomplete } from "@/domains/channels";

const VALID_SEGMENTS: ContentTypeSegment[] = ["course", "event", "exam"];

/**
 * Every content type's dashboard is one tab bar over one body, built from the shared Content
 * Overview kit (StudioWorkspaceKit). The tab lives in the URL (`?tab=`) so a tab can be linked to —
 * e.g. the question bank editor's "Exam settings" opens an exam straight on its plans.
 */
const TABS_BY_SEGMENT: Record<ContentTypeSegment, WorkspaceTab<string>[]> = {
  course: COURSE_TABS,
  event: EVENT_TABS,
  exam: EXAM_TABS,
};

/** Older links and in-page jumps that used other names for the same tab. */
const TAB_ALIASES: Record<string, string> = { people: "participants", overview: "OVERVIEW" };

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
      <h2 className="text-base font-extrabold text-ink">{title}</h2>
      <p className="max-w-sm text-xs font-medium text-slate-500">{description}</p>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div
      className="min-h-screen w-full relative"
      style={{ background: "var(--theme-wash, linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 35%, #FFFFFF 70%))" }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-24 pb-28 sm:px-6">
        <Skeleton className="mx-auto h-12 w-80 rounded-xl" />
        <Skeleton className="mx-auto h-10 w-64 rounded-full" />
        <Skeleton className="mx-auto h-12 w-full max-w-3xl rounded-full" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="grid grid-cols-12 gap-6 py-6">
            <Skeleton className="col-span-4 h-16 rounded-2xl" />
            <Skeleton className="col-span-8 h-24 rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentOverviewPageContent() {
  const params = useParams<{ contentType: string; contentId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const rawSegment = params.contentType;
  const contentId = params.contentId;
  const segment = VALID_SEGMENTS.includes(rawSegment as ContentTypeSegment)
    ? (rawSegment as ContentTypeSegment)
    : null;
  const currentUserId = useAuthStore((s) => s.user?.id);

  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [submitting, setSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [brandingCheck, setBrandingCheck] = useState(0);
  // The exam's full configuration (duration, pass mark, proctoring, placement …) — only the
  // summary fields are on ContentSummaryLite, and the exam tabs edit the real record.
  const [exam, setExam] = useState<ExamResponse | null>(null);

  const tabs = segment ? TABS_BY_SEGMENT[segment] : [];
  const requested = searchParams?.get("tab") ?? "";
  const requestedTab = tabs.some((t) => t.id === requested) ? requested : TAB_ALIASES[requested];
  const activeTab = tabs.find((t) => t.id === requestedTab)?.id ?? tabs[0]?.id ?? "OVERVIEW";
  const activeLabel = tabs.find((t) => t.id === activeTab)?.label ?? "Content Overview";

  const selectTab = useCallback(
    (tab: string) => {
      const next = new URLSearchParams(searchParams?.toString() ?? "");
      if (tab === tabs[0]?.id) next.delete("tab");
      else next.set("tab", tab);
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [searchParams, tabs, router, pathname]
  );

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (segment !== "exam") return;
    let cancelled = false;
    getExam(contentId)
      .then((data) => {
        if (!cancelled) setExam(data);
      })
      .catch(() => {
        // The page-level fetch below already surfaces not-found/forbidden for this exam.
      });
    return () => {
      cancelled = true;
    };
  }, [segment, contentId, reloadKey]);

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
    window.dispatchEvent(new CustomEvent("studio-crumb-changed", { detail: activeTab === tabs[0]?.id ? "Content Overview" : activeLabel }));
    return () => {
      window.dispatchEvent(new CustomEvent("studio-crumb-changed", { detail: null }));
    };
  }, [activeTab, activeLabel, tabs]);

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
  const review = data.review.status === "ok" ? data.review.data : null;

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await submitForReview(segment!, contentId);
      toast.success("Submitted for review");
      reload();
    } catch (err) {
      if (isBrandingIncomplete(err)) {
        // The message says what is missing and why; the action goes straight to where it is set.
        toast.error("Set up your badges & certificates first", {
          description: (err as Error).message,
          duration: 12000,
          action: { label: "Set up", onClick: () => router.push(brandingSetupHref(content.channelId)) },
        });
        setBrandingCheck((k) => k + 1);
        return;
      }
      toast.error(err instanceof Error ? err.message : "Could not submit for review");
    } finally {
      setSubmitting(false);
    }
  }

  const queryCourseId = searchParams?.get("courseId") || searchParams?.get("fromCourse");
  const queryEventId = searchParams?.get("eventId") || searchParams?.get("fromEvent");
  const parentCourseId = queryCourseId || content.courseId || (exam?.tieType === "COURSE" ? exam.tiedContentId : null);
  const parentEventId = queryEventId || content.eventId || (exam?.tieType === "EVENT" ? exam.tiedContentId : null);

  // Linked to a course or event: named, reviewed and published by its parent.
  const tiedExam = segment === "exam" && !!(content.courseId || content.eventId || exam?.tieType);
  const tiedCourseId = content.courseId || (exam?.tieType === "COURSE" ? exam.tiedContentId : null);
  const tiedEventId = content.eventId || (exam?.tieType === "EVENT" ? exam.tiedContentId : null);
  const parentLink = !tiedExam
    ? null
    : tiedCourseId
      ? { href: `/studio/content/course/${tiedCourseId}?tab=exams`, label: `Open ${exam?.tiedContentTitle ?? "the course"}` }
      : tiedEventId
        ? { href: `/studio/content/event/${tiedEventId}?tab=exams`, label: `Open ${exam?.tiedContentTitle ?? "the event"}` }
        : null;

  // Back goes where the creator came from (the course editor, the course's Assessment & Exams tab,
  // a review...), named after it — not always to the course dashboard.
  const returnTo = safeReturnTo(searchParams?.get("returnTo"));
  const parentTitle = exam?.tiedContentTitle;
  let backNav: { href: string; label: string } | null = null;
  if (segment === "exam") {
    if (returnTo) {
      backNav = { href: returnTo, label: studioBackLabel(returnTo, parentTitle) };
    } else if (parentCourseId) {
      backNav = { href: `/studio/content/course/${parentCourseId}?tab=exams`, label: parentTitle ? `Back to ${parentTitle}` : "Back to course" };
    } else if (parentEventId) {
      backNav = { href: `/studio/content/event/${parentEventId}?tab=exams`, label: parentTitle ? `Back to ${parentTitle}` : "Back to event" };
    }
  }

  let body: React.ReactNode;
  if (segment === "course") {
    body = (
      <CourseOverviewTab
        tab={activeTab as CourseTab}
        data={data}
        contentId={contentId}
        currentUserId={currentUserId}
        onChanged={reload}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    );
  } else if (segment === "event") {
    body = (
      <EventOverviewTab
        tab={activeTab as OverviewTab}
        data={data}
        contentId={contentId}
        currentUserId={currentUserId}
        onChanged={reload}
        onSubmit={handleSubmit}
        submitting={submitting}
        onSelectTab={selectTab}
      />
    );
  } else if (activeTab === "publishing") {
    body = <ExamOverviewTab contentId={contentId} data={data} onSubmit={handleSubmit} submitting={submitting} />;
  } else {
    body = exam ? (
      <ExamOverviewSections
        exam={exam}
        tab={activeTab as Exclude<ExamTab, "publishing">}
        onExamChange={setExam}
        onSelectTab={selectTab}
      />
    ) : (
      <WorkspaceLoading />
    );
  }

  return (
    <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden w-full text-slate-900 font-sans">
      {/* Page backdrop. One layer: --theme-wash is the themed page ground (dark, high contrast);
          the light gradient is only its fallback. A separate `dark:block bg-slate-950` layer used
          to paint dark mode, but slate already flips there, so it painted a near-white page. */}
      <div
        aria-hidden
        className="theme-page-layer pointer-events-none fixed inset-0 -z-10"
        style={{
          background: `var(--theme-wash,
            radial-gradient(ellipse 55% 40% at 8% 12%, rgba(41, 98, 214, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 92% 20%, rgba(39, 197, 216, 0.10) 0%, transparent 60%),
            linear-gradient(to bottom, #FAFBFD 0%, #F6F8FD 35%, #FFFFFF 70%)
          )`,
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 pt-4 pb-12 sm:px-6 sm:pt-6 lg:pt-7">
        <ContentOverviewHeader
          segment={segment!}
          contentId={contentId}
          title={content.title}
          status={content.status}
          channelName={content.channelName}
          authorName={content.authorName}
          createdAt={content.createdAt}
          updatedAt={content.updatedAt}
          review={review}
          onJumpToPublishing={() => selectTab("publishing")}
          onSubmit={handleSubmit}
          tiedExam={tiedExam}
          tiedTo={tiedExam ? (tiedCourseId ? "course" : tiedEventId ? "event" : null) : null}
          onPreview={segment === "exam" ? () => selectTab("preview") : undefined}
          parent={parentLink}
          leading={
            backNav && (
              <Link
                href={backNav.href}
                onClick={(e) => {
                  e.preventDefault();
                  goBackTo(router, backNav.href);
                }}
                className="group inline-flex max-w-full cursor-pointer items-center gap-2 rounded-full border border-slate-200/80 bg-surface/90 px-4 py-2 text-xs font-extrabold text-slate-700 shadow-2xs backdrop-blur-md transition-all duration-200 hover:border-blue-200 hover:bg-surface hover:text-blue-600 hover:shadow-xs active:scale-[0.98] dark:hover:border-blue-500/25 dark:hover:text-blue-400"
              >
                <ArrowLeft size={15} className="text-slate-500 transition-transform duration-200 group-hover:-translate-x-1 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                <span className="truncate">{backNav.label}</span>
              </Link>
            )
          }
        />

        {/* A tied exam is published by its course or event, which shows the notice itself. */}
        {!tiedExam && <ChannelBrandingNotice channelId={content.channelId} refreshKey={brandingCheck} />}

        <div className="flex flex-col gap-6">
          <WorkspaceTabs tabs={tabs} active={activeTab} onChange={selectTab} ariaLabel={`${content.title} sections`} />
          <WorkspaceTabBody>{body}</WorkspaceTabBody>
        </div>
      </div>
    </div>
  );
}

export default function ContentOverviewPage() {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <ContentOverviewPageContent />
    </Suspense>
  );
}

/** Names the Studio page a Back link leads to. */
function studioBackLabel(href: string, parentTitle?: string | null): string {
  const named = (fallback: string) => (parentTitle ? `Back to ${parentTitle}` : fallback);
  if (href.startsWith("/studio/course/") || href.startsWith("/studio/events/")) return parentTitle ? `Back to ${parentTitle} editor` : "Back to the editor";
  if (href.startsWith("/studio/content/course/")) return named("Back to course");
  if (href.startsWith("/studio/content/event/")) return named("Back to event");
  if (href.startsWith("/console/reviews") || href.includes("/manage/reviews")) return "Back to the review";
  return "Back";
}
