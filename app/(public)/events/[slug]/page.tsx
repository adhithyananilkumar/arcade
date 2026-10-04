"use client";

import { useState, useEffect } from "react";
import { ChannelAvatar } from "@/shared/design-system/ui/cards";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  Layers,
  Globe,
  Award,
  Check,
  ChevronRight,
  Heart,
  Flag,
  Share2,
  Sparkles,
  Ticket,
  Play,
  ArrowRight,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getEventBySlugOrId } from "@/domains/events";
import type { EventDto } from "@/domains/events";
import { api } from "@/infrastructure/http/api";
import { formatMoney } from "@/shared/utils/money";
import { useAuthStore } from "@/infrastructure/auth/auth.store";
import {
  EnrollmentButton,
  useMyEnrollmentForResourceQuery,
} from "@/domains/enrollment";
import { eventRoutes } from "@/shared/routes/content.routes";
import { ReportModal } from "@/shared/design-system/ui/ReportModal";
import { toast } from "sonner";

interface EventSessionItem {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  sessionNumber?: number;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  timezone?: string;
  deliveryMode?: string;
  locationDetails?: Record<string, string>;
  meetingUrl?: string;
  meetingProvider?: string;
  status?: string;
}

interface EventCollaborator {
  id: string;
  userId?: string;
  email?: string;
  name: string;
  avatarUrl?: string | null;
  role?: string;
  status?: string;
}

const TABS = ["Overview", "Schedule", "Speakers & Hosts", "Venue & Access"] as const;
type Tab = (typeof TABS)[number];

function Avatar({
  name,
  imageUrl,
  accent = "var(--color-blue)",
  size = 36,
}: {
  name: string;
  imageUrl?: string | null;
  accent?: string;
  size?: number;
}) {
  const initials = (name || "Arcade")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const commonStyle = {
    width: size,
    height: size,
    boxShadow: "0 0 0 3px rgba(20,22,28,0.04)",
  };

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className="shrink-0 rounded-full object-cover"
        style={commonStyle}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-full font-semibold text-white"
      style={{
        ...commonStyle,
        fontSize: size * 0.38,
        background: accent,
      }}
    >
      {initials}
    </span>
  );
}

function Breadcrumb({ title }: { title: string }) {
  const crumbs = [{ label: "Events", href: "/events" }];
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex flex-wrap items-center gap-2 text-[13.5px]">
        {crumbs.map((c) => (
          <li key={c.label} className="flex items-center gap-2">
            <Link
              href={c.href}
              className="font-bold text-slate-700 hover:text-ink transition-colors"
            >
              {c.label}
            </Link>
            <ChevronRight size={13} className="text-subtle/50" />
          </li>
        ))}
        <li className="font-bold text-ink truncate max-w-md">{title}</li>
      </ol>
    </nav>
  );
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "TBA";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatTime(timeStr?: string | null): string {
  if (!timeStr) return "";
  try {
    const [h, m] = timeStr.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  } catch {
    return timeStr;
  }
}

export default function EventDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const slug = params.slug as string;

  const [event, setEvent] = useState<EventDto | null>(null);
  const [sessions, setSessions] = useState<EventSessionItem[]>([]);
  const [collaborators, setCollaborators] = useState<EventCollaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("Overview");
  const [saved, setSaved] = useState(false);

  const [reportModalOpen, setReportModalOpen] = useState(false);

  const { data: myEnrollment } = useMyEnrollmentForResourceQuery(
    "EVENT",
    event?.id,
    Boolean(user)
  );

  const isEnrolled = myEnrollment?.enrollment?.accessState === "ACCESSIBLE";
  const enrollmentStatus = myEnrollment?.enrollment?.enrollmentStatus;
  const enrollButtonState: "ENROLLED" | "NOT_ENROLLED" | "PENDING" | "WAITLISTED" = isEnrolled
    ? "ENROLLED"
    : (enrollmentStatus as string) === "PENDING" || (enrollmentStatus as string) === "REQUESTED"
      ? "PENDING"
      : (enrollmentStatus as string) === "WAITLISTED"
        ? "WAITLISTED"
        : "NOT_ENROLLED";
  const pendingReason = myEnrollment?.enrollment?.requiresPayment ? "PAYMENT" : "REQUIREMENTS";

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getEventBySlugOrId(slug)
      .then((evt) => {
        setEvent(evt);
        if (evt?.id) {
          Promise.allSettled([
            api.get<EventSessionItem[]>(`/api/v1/events/${evt.id}/sessions`),
            api.get<EventCollaborator[]>(`/api/v1/content/EVENT/${evt.id}/collaborators`),
          ]).then(([sessionsRes, collabsRes]) => {
            if (sessionsRes.status === "fulfilled" && Array.isArray(sessionsRes.value)) {
              setSessions(
                [...sessionsRes.value].sort(
                  (a, b) => (a.sessionNumber ?? 0) - (b.sessionNumber ?? 0)
                )
              );
            }
            if (collabsRes.status === "fulfilled" && Array.isArray(collabsRes.value)) {
              setCollaborators(collabsRes.value);
            }
          });
        }
      })
      .catch((err) => {
        console.error("Failed to load event:", err);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleReportSubmit = async (combinedNote: string) => {
    if (!event) return;
    await api.post("/api/v1/reports", {
      contentId: event.id,
      contentType: "EVENT",
      note: combinedNote,
    });
    toast.success("Event reported. Our moderation team will review it shortly.");
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-9 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading event details...</p>
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold text-ink">Event not found</h1>
        <p className="mt-2 text-sm text-subtle">
          This event may have been unpublished or removed.
        </p>
        <Link
          href="/events"
          className="mt-6 rounded-xl bg-ink px-6 py-2.5 text-sm font-semibold text-on-ink hover:bg-slate-800 transition"
        >
          Browse All Events
        </Link>
      </main>
    );
  }

  const words = (event.title || "Event").split(" ");
  const lastWord = words.pop() || "";
  const firstPart = words.join(" ");

  const hostName = event.channelName || "Arcade Host";
  const firstSession = sessions[0];
  const earliestDate = firstSession?.startDate
    ? formatDate(firstSession.startDate)
    : formatDate(event.createdAt);

  const deliveryLabel =
    event.deliveryMode === "ONLINE"
      ? "Online Session"
      : event.deliveryMode === "OFFLINE"
        ? "On-campus"
        : event.deliveryMode === "HYBRID"
          ? "Hybrid"
          : "Interactive Event";

  const DeliveryIcon =
    event.deliveryMode === "ONLINE"
      ? Video
      : event.deliveryMode === "OFFLINE"
        ? MapPin
        : Globe;

  const targetOverviewHref = eventRoutes.overview(event.slug || event.id);

  return (
    <main className="min-h-screen w-full arcade-wash text-ink">
      <div className="mx-auto max-w-6xl px-5 pt-28 pb-28 sm:px-8 sm:pt-32 sm:pb-36">
        <div className="max-w-4xl">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-50/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-violet-700 backdrop-blur-sm dark:bg-violet-500/10 dark:text-violet-300">
                <Sparkles size={12} className="text-violet-600 dark:text-violet-400" />
                {event.eventType || "Workshop"}
              </span>
              {event.category && (
                <span className="inline-flex items-center rounded-full border border-slate-200/80 bg-surface/70 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                  {event.category}
                </span>
              )}
            </div>

            {/* The publishing channel, named in full, above the event name */}
            {event.channelName && (
              <Link
                href={event.channelId ? `/channels/${event.channelId}` : "#"}
                className="group mb-3 inline-flex max-w-full items-center gap-3 transition-opacity hover:opacity-85"
              >
                <ChannelAvatar
                  name={event.channelName}
                  iconUrl={event.channelIconUrl}
                  size={42}
                  className="bg-transparent border-0 shadow-none ring-0"
                />
                <span className="text-base sm:text-lg font-bold tracking-tight text-ink group-hover:text-blue transition-colors">
                  {event.channelName}
                </span>
              </Link>
            )}

              {/* Title with radiant gradient on last word */}
              <h1
                className="text-[2.6rem] font-bold leading-[1.08] tracking-tight text-ink sm:text-[3.8rem]"
                style={{ fontFamily: '"Clash Display", var(--font-sora), sans-serif' }}
              >
                {firstPart}{" "}
                <span className="bg-gradient-to-r from-[#00c885] via-[#0284c7] to-[#4f46e5] bg-clip-text text-transparent">
                  {lastWord}
                </span>
              </h1>

              {event.subtitle && (
                <p className="mt-3 text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
                  {event.subtitle}
                </p>
              )}

              {/* Meta Pills */}
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-[12.5px] font-medium text-ink">
                  <DeliveryIcon size={14} className="text-subtle shrink-0" />
                  <span>{deliveryLabel}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-[12.5px] font-medium text-ink">
                  <Calendar size={14} className="text-subtle shrink-0" />
                  <span>{earliestDate}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-[12.5px] font-medium text-ink">
                  <Layers size={14} className="text-subtle shrink-0" />
                  <span>
                    {sessions.length > 0
                      ? `${sessions.length} session${sessions.length > 1 ? "s" : ""}`
                      : "Schedule inside"}
                  </span>
                </span>
                {event.difficulty && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-[12.5px] font-medium text-ink">
                    <Users size={14} className="text-subtle shrink-0" />
                    <span className="capitalize">{event.difficulty.toLowerCase()}</span>
                  </span>
                )}
                {event.capacity && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-[12.5px] font-medium text-ink">
                    <Ticket size={14} className="text-subtle shrink-0" />
                    <span>{event.capacity} seats limit</span>
                  </span>
                )}
              </div>

              {/* Pricing & Enrollment Actions */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <div className="flex items-baseline gap-2 pr-1">
                  {(event.priceAmount ?? 0) > 0 ? (
                    <span className="font-serif text-3xl font-medium text-ink">
                      {formatMoney(event.priceAmount ?? 0, event.currency ?? "INR")}
                    </span>
                  ) : (
                    <span className="font-serif text-3xl font-medium text-ink">Free</span>
                  )}
                </div>

                <div className="min-w-[200px] sm:min-w-[240px]">
                  <EnrollmentButton
                    resourceType="EVENT"
                    resourceId={event.id}
                    initialState={enrollButtonState}
                    pendingReason={pendingReason}
                    targetUrl={targetOverviewHref}
                  />
                </div>

                {event.promoVideoUrl && (
                  <a
                    href={event.promoVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Watch promo video"
                    className="grid size-12 place-items-center rounded-full bg-slate-950/5 hover:bg-slate-950/10 active:scale-[0.98] border border-slate-950/10 text-slate-700 hover:text-ink backdrop-blur-md transition-all"
                  >
                    <Play size={18} />
                  </a>
                )}

                <button
                  onClick={handleShare}
                  aria-label="Share event"
                  className="grid size-12 place-items-center rounded-full bg-slate-950/5 hover:bg-slate-950/10 active:scale-[0.98] border border-slate-950/10 text-slate-700 hover:text-blue backdrop-blur-md transition-all"
                >
                  <Share2 size={18} />
                </button>

                <button
                  onClick={() => setReportModalOpen(true)}
                  aria-label="Report event"
                  className="grid size-12 place-items-center rounded-full bg-slate-950/5 hover:bg-slate-950/10 active:scale-[0.98] border border-slate-950/10 text-slate-700 hover:text-red-500 backdrop-blur-md transition-all"
                >
                  <Flag size={18} />
                </button>
              </div>
            </div>
          </div>

        {/* Tabs and Tab Content Section */}
        <div className="mt-16 sm:mt-20">
          {/* Floating Pill Nav Tabs */}
          <div className="flex justify-center">
            <nav
              aria-label="Event Sections"
              className="inline-flex items-center gap-1 rounded-full border border-line bg-paper/90 p-1.5 shadow-[0_4px_20px_rgba(20,22,28,0.04)] backdrop-blur-sm"
            >
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`rounded-full px-5 py-2 text-xs sm:text-[13.5px] font-semibold transition-all ${
                    tab === t
                      ? "bg-ink text-on-ink shadow-sm"
                      : "text-subtle hover:text-ink hover:bg-surface/50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content Display */}
          <div className="mt-12">
            {tab === "Overview" && (
              <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink mb-4">
                      About this {event.eventType?.toLowerCase() || "event"}
                    </h2>
                    {event.description ? (
                      <div className="prose max-w-none text-slate-700 leading-relaxed text-[15px] space-y-4">
                        {event.description.split("\n\n").map((para, i) => (
                          <p key={i}>{para}</p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 italic">No description provided for this event.</p>
                    )}
                  </div>

                  {/* What you'll experience */}
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-6 sm:p-7">
                    <h3 className="text-base font-bold text-ink mb-4 flex items-center gap-2">
                      <Sparkles size={18} className="text-violet-600 dark:text-violet-400" />
                      Key Highlights & Takeaways
                    </h3>
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {[
                        "Live interactive presentation and discussion",
                        "Dedicated Q&A session with the host",
                        "Exclusive event resources and downloadable materials",
                        "Access to the Event Learning Hub and discussion channel",
                        sessions.length > 1
                          ? `${sessions.length} structured sessions to build deep understanding`
                          : "Intensive focused deep-dive session",
                        "Networking opportunities with fellow participants",
                      ].map((hl, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                          <Check size={16} className="mt-0.5 shrink-0 text-emerald-600 font-bold dark:text-emerald-400" />
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Event Specifications Card */}
                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-200/80 bg-surface p-6 shadow-sm">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-5">
                      Event Details
                    </h3>
                    <dl className="space-y-4 text-sm">
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <dt className="text-subtle font-medium">Format</dt>
                        <dd className="font-semibold text-ink">{event.eventType || "Event"}</dd>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <dt className="text-subtle font-medium">Delivery Mode</dt>
                        <dd className="font-semibold text-ink">{deliveryLabel}</dd>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <dt className="text-subtle font-medium">Total Sessions</dt>
                        <dd className="font-semibold text-ink">{sessions.length || 1}</dd>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <dt className="text-subtle font-medium">Skill Level</dt>
                        <dd className="font-semibold text-ink capitalize">
                          {event.difficulty?.toLowerCase() || "All levels"}
                        </dd>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <dt className="text-subtle font-medium">Language</dt>
                        <dd className="font-semibold text-ink">{event.language || "English"}</dd>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <dt className="text-subtle font-medium">Capacity</dt>
                        <dd className="font-semibold text-ink">
                          {event.capacity ? `${event.capacity} seats limit` : "Open registration"}
                        </dd>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <dt className="text-subtle font-medium">Access Window</dt>
                        <dd className="font-semibold text-emerald-600 dark:text-emerald-400">Immediate upon enrolling</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Tags */}
                  {event.tags && event.tags.length > 0 && (
                    <div className="rounded-2xl border border-slate-200/80 bg-surface p-5 shadow-sm">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                        Tags & Topics
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {event.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === "Schedule" && (
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold tracking-tight text-ink">Event Agenda & Schedule</h2>
                  <p className="mt-1 text-sm text-subtle">
                    {sessions.length > 0
                      ? `${sessions.length} structured sessions scheduled for this event`
                      : "Sessions schedule will be posted soon"}
                  </p>
                </div>

                {sessions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
                    <Calendar size={32} className="mx-auto text-slate-400 mb-3" />
                    <h3 className="text-base font-bold text-ink">Schedule not published yet</h3>
                    <p className="mt-1 text-sm text-subtle max-w-md mx-auto">
                      The organizer hasn't added detailed session timings yet. Once enrolled, you
                      will receive updates when sessions are announced.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session, idx) => (
                      <div
                        key={session.id || idx}
                        className="rounded-2xl border border-slate-200/90 bg-surface p-6 shadow-sm transition hover:shadow-md"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                            Session {session.sessionNumber ?? idx + 1}
                          </span>
                          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                            {session.startDate && (
                              <span className="flex items-center gap-1">
                                <Calendar size={13} className="text-subtle" />
                                {formatDate(session.startDate)}
                              </span>
                            )}
                            {session.startTime && (
                              <span className="flex items-center gap-1">
                                <Clock size={13} className="text-subtle" />
                                {formatTime(session.startTime)}
                                {session.endTime ? ` - ${formatTime(session.endTime)}` : ""}
                                {session.timezone ? ` (${session.timezone})` : ""}
                              </span>
                            )}
                          </div>
                        </div>

                        <h3 className="text-lg font-bold text-ink mb-1.5">{session.title}</h3>
                        {session.description && (
                          <p className="text-sm text-slate-600 leading-relaxed mb-4">
                            {session.description}
                          </p>
                        )}

                        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Video size={13} className="text-blue" />
                            <span>
                              {session.deliveryMode || event.deliveryMode || "Online"}
                              {session.meetingProvider ? ` via ${session.meetingProvider}` : ""}
                            </span>
                          </span>

                          <span className="text-emerald-600 font-semibold flex items-center gap-1 dark:text-emerald-400">
                            <Check size={13} />
                            Join link available in Learning Hub for enrolled attendees
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "Speakers & Hosts" && (
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold tracking-tight text-ink">Presented By</h2>
                  <p className="mt-1 text-sm text-subtle">
                    Meet the team and creators behind this event
                  </p>
                </div>

                {/* Primary Organizer / Channel */}
                <div className="rounded-2xl border border-slate-200/90 bg-surface p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <ChannelAvatar name={hostName} iconUrl={event.channelIconUrl} size={64} />
                  <div className="flex-1 text-center sm:text-left">
                    <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                      Organizer & Host
                    </span>
                    <h3 className="text-xl font-bold text-ink mt-0.5">{hostName}</h3>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">
                      Publishing Channel on Arcade
                    </p>
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                      Official host of this event. Check out their channel page to discover more
                      upcoming events, courses, and educational series.
                    </p>
                  </div>
                </div>

                {/* Collaborators / Speakers list */}
                {collaborators.length > 0 && (
                  <div>
                    <h3 className="text-base font-bold text-ink mb-4">Speakers & Collaborators</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {collaborators.map((c) => (
                        <div
                          key={c.id}
                          className="rounded-xl border border-slate-200 bg-surface p-5 shadow-xs flex items-center gap-4"
                        >
                          <Avatar
                            name={c.name}
                            imageUrl={c.avatarUrl}
                            accent="var(--color-blue)"
                            size={44}
                          />
                          <div>
                            <h4 className="text-sm font-bold text-ink">{c.name}</h4>
                            <p className="text-xs text-subtle capitalize">
                              {c.role?.replace(/_/g, " ").toLowerCase() || "Speaker"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === "Venue & Access" && (
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold tracking-tight text-ink">How to Join & Venue Details</h2>
                  <p className="mt-1 text-sm text-subtle">
                    Everything you need to know before attending
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-surface p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="size-10 rounded-xl bg-violet-50 text-violet-600 grid place-items-center shrink-0 dark:bg-violet-500/10 dark:text-violet-400">
                      <DeliveryIcon size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-ink">{deliveryLabel}</h3>
                      <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                        {event.deliveryMode === "ONLINE"
                          ? "This event takes place entirely online. Meeting links, session recordings, and interactive discussion rooms unlock automatically in your Event Learning Hub upon registration."
                          : event.deliveryMode === "OFFLINE"
                            ? "This event takes place in-person on campus. Please bring your student/participant ID and arrive 15 minutes before the scheduled start time for check-in."
                            : "This event is hybrid — join in person on campus or attend remotely via live streaming."}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-6">
                    <h4 className="text-sm font-bold text-ink mb-3">Attendance Requirements</h4>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-center gap-2">
                        <Check size={15} className="text-emerald-600 shrink-0 dark:text-emerald-400" />
                        <span>Registered Arcade user account with verified email</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={15} className="text-emerald-600 shrink-0 dark:text-emerald-400" />
                        <span>A laptop or desktop with internet access for practical exercises</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={15} className="text-emerald-600 shrink-0 dark:text-emerald-400" />
                        <span>Active participation during interactive Q&A and breakout segments</span>
                      </li>
                    </ul>
                  </div>

                  {isEnrolled && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center justify-between gap-4 dark:bg-emerald-500/10 dark:border-emerald-500/25">
                      <div>
                        <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">You are registered!</p>
                        <p className="text-xs text-emerald-700 mt-0.5 dark:text-emerald-300">
                          Head to your Event Learning Hub to access session links and materials.
                        </p>
                      </div>
                      <Link
                        href={targetOverviewHref}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shrink-0"
                      >
                        Open Event Hub
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom CTA Banner */}
          <div className="mt-16 rounded-3xl bg-ink text-on-ink p-8 sm:p-12 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-12 -mr-12 size-64 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-12 -ml-12 size-64 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
                  Join the Session
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
                  Ready to attend {event.title}?
                </h2>
                <p className="mt-2 text-sm text-slate-300 max-w-xl">
                  Enroll now to reserve your seat, receive calendar invites, and gain access to the
                  event learning hub.
                </p>
              </div>

              <div className="min-w-[200px] shrink-0">
                <EnrollmentButton
                  resourceType="EVENT"
                  resourceId={event.id}
                  initialState={enrollButtonState}
                  pendingReason={pendingReason}
                  targetUrl={targetOverviewHref}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onSubmit={handleReportSubmit}
        title="Report Event"
        description="Help us understand what is wrong with this event."
        contentType="EVENT"
      />
    </main>
  );
}
