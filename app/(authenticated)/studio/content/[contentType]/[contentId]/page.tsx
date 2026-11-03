"use client";

import { goBackTo, safeReturnTo } from "@/infrastructure/state/navigationHistory";
import { useEffect, useMemo, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { usePathname, useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ShieldAlert, FileQuestion, AlertTriangle, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/shared/design-system/ui/skeleton";
import { ApiError } from "@/infrastructure/http/api";
import { useAuthStore } from "@/infrastructure/auth/auth.store";
import { useQuery } from "@tanstack/react-query";
import { WorkspaceLoading, WorkspaceTabBody, WorkspaceTabs, type WorkspaceTab } from "@/apps/creator/studio/core/StudioWorkspaceKit";
import { SideNav, SideNavTabs, type SideNavItem, type SideNavSection } from "@/shared/design-system/ui/side-nav";
import { CompetitionAdminService } from "@/domains/events";
import { LEGACY_TAB_PAGES, subPagesFor, type SubPage, type SubPageGroup } from "./lib/overviewNav";
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
 * Every content type's dashboard is one horizontal tab bar over one body, built from the shared
 * Content Overview kit (StudioWorkspaceKit). A tab that holds several features splits them into
 * sub-pages in a sidebar beside the body — the same SideNav Settings uses (see lib/overviewNav).
 * The tab and page live in the URL (`?tab=&page=`) so they can be linked to — e.g. the question
 * bank editor's "Exam settings" opens an exam straight on its plans.
 */
const TABS_BY_SEGMENT: Record<ContentTypeSegment, WorkspaceTab<string>[]> = {
  course: COURSE_TABS,
  event: EVENT_TABS,
  exam: EXAM_TABS,
};

/** Older links and in-page jumps that used other names for the same tab. */
const TAB_ALIASES: Record<string, string> = { people: "participants", overview: "OVERVIEW", manage: "participants", members: "participants" };

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

  // An event's team-competition pages exist only once it has a competition; until then the group
  // offers the one page that sets it up.
  const competitionQuery = useQuery({
    queryKey: ["competition", contentId, "admin"],
    queryFn: () => CompetitionAdminService.get(contentId),
    enabled: segment === "event",
    retry: false,
  });
  const competition = competitionQuery.data ?? null;

  // The team-competition tab is named after the event's own format ("Buildathon").
  // Memoised: the breadcrumb effect below depends on it, and a fresh array every render made that
  // effect (and the shell it notifies) re-run in a loop.
  const formatLabel = competition?.settings.formatLabel ?? null;
  const tabs = useMemo(
    () => (segment ? TABS_BY_SEGMENT[segment] : []).map((t) => (t.id === "team" && formatLabel ? { ...t, label: formatLabel } : t)),
    [segment, formatLabel],
  );
  const requested = searchParams?.get("tab") ?? "";
  const legacy = LEGACY_TAB_PAGES[requested];
  const requestedTab = tabs.some((t) => t.id === requested) ? requested : legacy?.tab ?? TAB_ALIASES[requested];
  const activeTab = tabs.find((t) => t.id === requestedTab)?.id ?? tabs[0]?.id ?? "OVERVIEW";
  const activeLabel = tabs.find((t) => t.id === activeTab)?.label ?? "Content Overview";

  // The active tab's own features, as sidebar pages (empty for single-feature tabs).
  const subGroups: SubPageGroup[] = segment ? subPagesFor(segment, activeTab, { hasCompetition: !!competition }) : [];
  const subPages = subGroups.flatMap((g) => g.pages);
  const requestedPage = searchParams?.get("page") ?? legacy?.page ?? "";
  const activePage = subPages.find((p) => p.id === requestedPage)?.id ?? subPages[0]?.id ?? null;

  const hrefFor = (tab: string, page?: string | null) => {
    const next = new URLSearchParams(searchParams?.toString() ?? "");
    if (tab === tabs[0]?.id) next.delete("tab");
    else next.set("tab", tab);
    if (page) next.set("page", page);
    else next.delete("page");
    const query = next.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  // Accepts a tab id, or an older single id that names a tab and one of its pages ("team-form").
  const selectTab = (tab: string) => {
    const mapped = LEGACY_TAB_PAGES[tab];
    router.replace(mapped ? hrefFor(mapped.tab, mapped.page) : hrefFor(tab), { scroll: false });
  };

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
        page={activePage}
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
    // Desktop: an app frame — the title, actions and tab bar stay put and only the content pane
    // (and the sidebar, if it overflows) scrolls. Phones keep ordinary page scrolling.
    <div className="relative flex min-h-screen w-full flex-1 flex-col overflow-x-clip font-sans text-slate-900 lg:h-[100dvh] lg:min-h-0 lg:flex-none lg:overflow-hidden">
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

      <div
        className={`relative z-10 mx-auto flex w-full flex-col gap-5 px-4 pt-4 pb-12 sm:px-6 sm:pt-6 lg:min-h-0 lg:flex-1 lg:pb-0 lg:pt-7 ${
          subPages.length > 0 ? "max-w-7xl" : "max-w-6xl"
        }`}
      >
        <ContentOverviewHeader
          trailing={
            // A tied exam is published by its course or event, which shows the notice itself.
            !tiedExam && <ChannelBrandingNotice channelId={content.channelId} refreshKey={brandingCheck} variant="icon" />
          }
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

        <div className="flex flex-col gap-6 lg:min-h-0 lg:flex-1">
          <div className="shrink-0">
            <WorkspaceTabs tabs={tabs} active={activeTab} onChange={selectTab} ariaLabel={`${content.title} sections`} />
          </div>
          {subPages.length === 0 ? (
            // The content sits in a softly opaque panel; its slim scrollbar lives inside the panel.
            <div className="lg:min-h-0 lg:flex-1 lg:overflow-hidden lg:rounded-[28px] lg:border lg:border-slate-200/60 lg:bg-surface/65 lg:shadow-[0_12px_40px_-16px_rgba(20,20,43,0.14)] lg:backdrop-blur-xl">
              <div className="arcade-scrollbar-mini lg:h-full lg:overflow-y-auto lg:px-8 lg:pb-10">
                <WorkspaceTabBody>{body}</WorkspaceTabBody>
              </div>
            </div>
          ) : (
            // This tab's own features, one page each, in the Settings-style sidebar. The sidebar
            // stays put; the page beside it scrolls on its own.
            <div className="flex flex-col gap-6 pt-6 sm:pt-8 lg:min-h-0 lg:flex-1 lg:flex-row lg:gap-10">
                <SideNavTabs
                  className="lg:hidden"
                  items={subGroups.flatMap((g) => g.pages.map((p) => subNavItem(p, g, activeTab, hrefFor)))}
                  activeKey={activePage}
                  ariaLabel={`${activeLabel} pages`}
                />
                <aside className="arcade-scrollbar-mini hidden w-[240px] shrink-0 lg:block lg:overflow-y-auto lg:pb-8">
                  <SideNav
                    sections={subGroups.map<SideNavSection>((g) => ({
                      title: g.title,
                      items: g.pages.map((p) => subNavItem(p, g, activeTab, hrefFor)),
                    }))}
                    activeKey={activePage}
                    ariaLabel={`${activeLabel} pages`}
                  />
                </aside>
                <div className="min-w-0 flex-1 lg:min-h-0 lg:flex-1 lg:overflow-hidden lg:rounded-[28px] lg:border lg:border-slate-200/60 lg:bg-surface/65 lg:shadow-[0_12px_40px_-16px_rgba(20,20,43,0.14)] lg:backdrop-blur-xl">
                  <div className="arcade-scrollbar-mini lg:h-full lg:overflow-y-auto lg:px-8 lg:py-8">{body}</div>
                </div>
              </div>
          )}
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

function subNavItem(
  page: SubPage,
  group: SubPageGroup,
  tab: string,
  hrefFor: (tab: string, page?: string | null) => string,
): SideNavItem {
  return { key: page.id, label: page.label, href: hrefFor(tab, page.id), icon: page.icon, iconClassName: group.chip };
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
