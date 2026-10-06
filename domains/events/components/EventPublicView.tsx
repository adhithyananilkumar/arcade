'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Events
 *
 * Purpose:
 * Dedicated public event landing & details page component for /events/[slug].
 * Adopts the signature styling of the course public page (Dancing Script
 * title flourish, ink asymmetric buttons, geometric asymmetric card corners,
 * and clean typography) while maintaining event-specific functionality.
 * ------------------------------------------------------------------
 */

import React, { useState, useEffect } from 'react';
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
  Flag,
  Share2,
  Sparkles,
  Ticket,
  Play,
  ShieldCheck,
  Radio,
  Briefcase,
} from 'lucide-react';
import { Dancing_Script } from 'next/font/google';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChannelAvatar } from '@/shared/design-system/ui/cards';
import { ContentArt } from '@/shared/design-system/art';
import { getAvatarUrl } from '@/shared/utils/avatar';
import { getEventBySlugOrId } from '@/domains/events';
import type { EventDto } from '@/domains/events';
import { api } from '@/infrastructure/http/api';
import { formatMoney } from '@/shared/utils/money';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import {
  EnrollmentButton,
  useMyEnrollmentForResourceQuery,
} from '@/domains/enrollment';
import { eventRoutes } from '@/shared/routes/content.routes';
import { ReportModal } from '@/shared/design-system/ui/ReportModal';
import { toast } from 'sonner';

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['600', '700'],
});

export interface EventSessionItem {
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

export interface EventCollaborator {
  id: string;
  userId?: string;
  email?: string;
  name: string;
  avatarUrl?: string | null;
  role?: string;
  status?: string;
}

const TABS = ['Overview', 'Schedule', 'Speakers & Hosts', 'Venue & Access'] as const;
type Tab = (typeof TABS)[number];

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'TBA';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatTime(timeStr?: string | null): string {
  if (!timeStr) return '';
  try {
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  } catch {
    return timeStr;
  }
}

function Avatar({
  name,
  imageUrl,
  accent = '#8C6453',
  size = 40,
}: {
  name: string;
  imageUrl?: string | null;
  accent?: string;
  size?: number;
}) {
  const resolvedUrl = getAvatarUrl(imageUrl);
  const initials = (name || 'Arcade')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (resolvedUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolvedUrl}
        alt={name}
        className="shrink-0 rounded-2xl object-cover border border-slate-100 dark:border-slate-800"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center rounded-2xl font-bold text-white shadow-xs"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: accent,
      }}
    >
      {initials}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative px-5 sm:px-6 py-2.5 rounded-tl-[1.25rem] rounded-br-[1.25rem] rounded-tr-md rounded-bl-md text-xs sm:text-sm font-black tracking-tight transition-all duration-200 select-none cursor-pointer min-w-[96px] text-center ${
        active
          ? 'bg-surface text-[#2962D6] dark:text-[#3B82F6] border-2 border-[#2962D6] dark:border-[#3B82F6] shadow-2xs'
          : 'bg-slate-100/80 text-slate-700 border border-slate-200/70 hover:bg-slate-200/70 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/70 dark:hover:bg-slate-800 dark:hover:text-white'
      }`}
    >
      <span className="relative z-10">{label}</span>
    </button>
  );
}

export interface EventPublicViewProps {
  slug?: string;
}

export function EventPublicView({ slug: propSlug }: EventPublicViewProps) {
  const params = useParams<{ slug?: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const slug = (propSlug || params?.slug || '') as string;

  const [event, setEvent] = useState<EventDto | null>(null);
  const [sessions, setSessions] = useState<EventSessionItem[]>([]);
  const [collaborators, setCollaborators] = useState<EventCollaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('Overview');
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const { data: myEnrollment } = useMyEnrollmentForResourceQuery(
    'EVENT',
    event?.id,
    Boolean(user)
  );

  const isEnrolled = myEnrollment?.enrollment?.accessState === 'ACCESSIBLE';
  const enrollmentStatus = myEnrollment?.enrollment?.enrollmentStatus;
  const enrollButtonState: 'ENROLLED' | 'NOT_ENROLLED' | 'PENDING' | 'WAITLISTED' = isEnrolled
    ? 'ENROLLED'
    : (enrollmentStatus as string) === 'PENDING' || (enrollmentStatus as string) === 'REQUESTED'
      ? 'PENDING'
      : (enrollmentStatus as string) === 'WAITLISTED'
        ? 'WAITLISTED'
        : 'NOT_ENROLLED';
  const pendingReason = myEnrollment?.enrollment?.requiresPayment ? 'PAYMENT' : 'REQUIREMENTS';

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
            if (sessionsRes.status === 'fulfilled' && Array.isArray(sessionsRes.value)) {
              setSessions(
                [...sessionsRes.value].sort(
                  (a, b) => (a.sessionNumber ?? 0) - (b.sessionNumber ?? 0)
                )
              );
            }
            if (collabsRes.status === 'fulfilled' && Array.isArray(collabsRes.value)) {
              setCollaborators(collabsRes.value);
            }
          });
        }
      })
      .catch((err) => {
        console.error('Failed to load event:', err);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleReportSubmit = async (combinedNote: string) => {
    if (!event) return;
    await api.post('/api/v1/reports', {
      contentId: event.id,
      contentType: 'EVENT',
      note: combinedNote,
    });
    toast.success('Event reported. Our moderation team will review it shortly.');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-transparent text-slate-900 dark:text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 rounded-full border-2 border-slate-900 dark:border-white border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-slate-400">Loading event details...</p>
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-transparent flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Event not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          This event may have been unpublished or removed.
        </p>
        <Link
          href="/events"
          className="mt-6 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition"
        >
          Browse All Events
        </Link>
      </main>
    );
  }

  const hostName = event.channelName || 'Arcade Host';
  const firstSession = sessions[0];
  const earliestDate = firstSession?.startDate
    ? formatDate(firstSession.startDate)
    : formatDate(event.createdAt);

  const deliveryLabel =
    event.deliveryMode === 'ONLINE'
      ? 'Online Session'
      : event.deliveryMode === 'OFFLINE'
        ? 'On-campus'
        : event.deliveryMode === 'HYBRID'
          ? 'Hybrid'
          : 'Interactive Event';

  const DeliveryIcon =
    event.deliveryMode === 'ONLINE'
      ? Video
      : event.deliveryMode === 'OFFLINE'
        ? MapPin
        : Globe;

  const targetOverviewHref = eventRoutes.overview(event.slug || event.id);
  const isPaid = (event.priceAmount ?? 0) > 0;
  const priceDisplay = isPaid ? formatMoney(event.priceAmount ?? 0, event.currency ?? 'INR') : 'Free';

  return (
    <main className="min-h-screen w-full bg-surface theme-page-bg theme-wallpaper-frost text-slate-900 dark:text-white">
      <div className="mx-auto max-w-6xl px-4 pt-12 pb-24 sm:px-6 sm:pt-16 sm:pb-32 lg:px-8">
        {/* ================= HERO SECTION (2-Column) ================= */}
        <section className="relative pt-4 pb-8 sm:pt-6 sm:pb-10">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12 items-start">
            {/* LEFT COLUMN: Title Flourish, Channel, Metadata & CTA */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
              {/* Publishing Channel Tag */}
              {event.channelName && (
                <div className="pt-1">
                  <Link
                    href={event.channelId ? `/channels/${event.channelId}` : '#'}
                    className="group inline-flex items-center gap-2 rounded-tl-xl rounded-br-xl rounded-tr-xs rounded-bl-xs border border-slate-200/90 bg-surface/95 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:border-blue-400 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500 transition-all select-none"
                  >
                    {getAvatarUrl(event.channelIconUrl) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getAvatarUrl(event.channelIconUrl)}
                        alt={event.channelName}
                        className="size-4.5 rounded-md object-cover"
                      />
                    ) : (
                      <span className="flex size-4.5 items-center justify-center rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                        <Radio size={11} className="stroke-[2.5]" />
                      </span>
                    )}
                    <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {event.channelName}
                    </span>
                    <ChevronRight size={12} className="text-slate-400 group-hover:translate-x-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all" />
                  </Link>
                </div>
              )}

              {/* Title in Dancing Script font with hand-drawn SVG flourish */}
              <div className="relative inline-block mt-1">
                <h1
                  className={`${dancingScript.className} text-5xl sm:text-6xl lg:text-7xl font-bold tracking-normal text-slate-900 dark:text-white leading-[1.15]`}
                >
                  {event.title}
                </h1>

                {/* Signature hand-drawn blue underline flourish */}
                <div className="flex mt-1">
                  <svg
                    className="h-4 w-56 sm:w-72 text-blue-300 dark:text-blue-400 opacity-90"
                    viewBox="0 0 200 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 8C45 3.5 155 9.5 197 5"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Subtitle / Description */}
              {event.subtitle && (
                <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 font-normal line-clamp-3 pt-1">
                  {event.subtitle}
                </p>
              )}

              {/* Hosts / Presenter Byline */}
              {collaborators.length > 0 && (
                <div className="flex items-center gap-3 pt-2">
                  <Avatar
                    name={collaborators[0].name}
                    imageUrl={collaborators[0].avatarUrl}
                    size={40}
                  />
                  <div className="text-sm">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                      Hosted by
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {collaborators[0].name}
                      {collaborators.length > 1 && (
                        <span className="text-slate-500 font-normal"> & {collaborators.length - 1} more</span>
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* Metadata Pill Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-surface/95 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300 shadow-[0_2px_8px_rgba(20,20,43,0.03)] backdrop-blur-sm">
                  <DeliveryIcon size={14} className="text-slate-400 shrink-0" />
                  {deliveryLabel}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-surface/95 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300 shadow-[0_2px_8px_rgba(20,20,43,0.03)] backdrop-blur-sm">
                  <Calendar size={14} className="text-slate-400 shrink-0" />
                  {earliestDate}
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-surface/95 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300 shadow-[0_2px_8px_rgba(20,20,43,0.03)] backdrop-blur-sm">
                  <Layers size={14} className="text-slate-400 shrink-0" />
                  {sessions.length > 0 ? `${sessions.length} sessions` : 'Live session'}
                </span>

                {event.capacity && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-surface/95 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300 shadow-[0_2px_8px_rgba(20,20,43,0.03)] backdrop-blur-sm">
                    <Ticket size={14} className="text-slate-400 shrink-0" />
                    {event.capacity} seats limit
                  </span>
                )}
              </div>

              {/* Primary Action & Pricing Row */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-3">
                {isPaid ? (
                  <div className="flex flex-col pr-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-none">
                      {priceDisplay}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 mt-1">Per ticket</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center">
                    <span className="h-11 px-4 inline-flex items-center justify-center gap-2 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300 shadow-2xs shrink-0 select-none">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Free Event
                    </span>
                  </div>
                )}

                {event.id && (
                  <div className="inline-flex items-center [&>div]:w-auto [&>div]:inline-flex [&_button]:h-11 [&_button]:!rounded-tl-2xl [&_button]:!rounded-br-2xl [&_button]:!rounded-tr-md [&_button]:!rounded-bl-md [&_button]:!py-0 [&_button]:!px-5 sm:[&_button]:!px-6 [&_button]:!flex-initial [&_button]:w-auto [&_button]:border [&_button]:border-slate-300/80 dark:[&_button]:border-slate-700/80 [&_button]:text-xs sm:[&_button]:text-sm">
                    <EnrollmentButton
                      resourceType="EVENT"
                      resourceId={event.id}
                      initialState={enrollButtonState}
                      pendingReason={pendingReason}
                      targetUrl={targetOverviewHref}
                      className="!rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md !py-0 !h-11 !px-5 sm:!px-6 !flex-initial font-bold shadow-2xs hover:shadow-xs transition-all"
                    />
                  </div>
                )}

                {event.promoVideoUrl && (
                  <a
                    href={event.promoVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Watch promo video"
                    className="h-11 w-11 shrink-0 grid place-items-center rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md border border-slate-300/80 bg-surface/95 hover:bg-slate-100 active:scale-95 text-slate-700 hover:text-blue-600 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-blue-400 shadow-2xs transition-all cursor-pointer"
                    title="Watch promo video"
                  >
                    <Play size={15} />
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share event"
                  className="h-11 w-11 shrink-0 grid place-items-center rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md border border-slate-300/80 bg-surface/95 hover:bg-slate-100 active:scale-95 text-slate-400 hover:text-blue-600 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-500 dark:hover:text-blue-400 shadow-2xs transition-all cursor-pointer"
                  title="Share event link"
                >
                  <Share2 size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => setReportModalOpen(true)}
                  aria-label="Report event"
                  className="h-11 w-11 shrink-0 grid place-items-center rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md border border-slate-300/80 bg-surface/95 hover:bg-slate-100 active:scale-95 text-slate-400 hover:text-red-600 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-500 dark:hover:text-red-400 shadow-2xs transition-all cursor-pointer"
                  title="Report this event"
                >
                  <Flag size={15} />
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Event Visual Artwork & Key Inclusions Frame */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-sm overflow-hidden rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface/95 p-3.5 shadow-[0_8px_30px_rgba(20,20,43,0.05)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95">
                {/* Generative Event Artwork */}
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-tl-[1.75rem] rounded-br-[1.75rem] rounded-tr-lg rounded-bl-lg border border-slate-200/70 dark:border-slate-800 shadow-xs">
                  <ContentArt
                    seed={event.id || event.title || 'event'}
                    kind="EVENT"
                    category={event.category || event.eventType || 'Event'}
                    title={event.title}
                  />
                  <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 rounded-full bg-slate-950/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                    <Sparkles size={11} className="text-violet-400" />
                    {event.eventType || 'Live Workshop'}
                  </div>
                </div>

                {/* Event Highlights */}
                <div className="p-3 pt-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2 font-medium">
                    <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Instant access to event materials & discussion</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Globe size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Join on mobile, tablet or desktop</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Award size={14} className="text-violet-600 dark:text-violet-400 shrink-0" />
                    <span>Interactive live Q&A & attendee networking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= TABS SECTION ================= */}
        <div className="pt-4 sm:pt-6">
          {/* Tabs Header - matching My Learning / Course Public style */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
            {TABS.map((t) => (
              <TabButton
                key={t}
                active={tab === t}
                onClick={() => setTab(t)}
                label={t}
              />
            ))}
          </div>

          {/* Tab Content Display */}
          <div key={tab} className="mt-8 arcade-fade">
            {/* OVERVIEW TAB */}
            {tab === 'Overview' && (
              <div className="space-y-8">
                {/* About this Event Card */}
                <div className="rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface/95 p-6 sm:p-8 shadow-[0_8px_30px_rgba(20,20,43,0.05)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    About this {event.eventType?.toLowerCase() || 'event'}
                  </h2>
                  {event.description ? (
                    <div className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 font-normal whitespace-pre-wrap">
                      {event.description}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 font-normal">
                      The organizer will publish detailed event information soon.
                    </p>
                  )}
                </div>

                {/* Key Highlights Card */}
                <div className="rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface/95 p-6 sm:p-8 shadow-[0_8px_30px_rgba(20,20,43,0.05)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-4">
                    Key Highlights & Takeaways
                  </h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-300">
                    {[
                      'Live interactive presentation & group discussion',
                      'Dedicated Q&A session with the host',
                      'Exclusive event resources and downloadable materials',
                      'Access to the Event Learning Hub and discussion channel',
                      sessions.length > 1
                        ? `${sessions.length} structured sessions to build deep understanding`
                        : 'Intensive focused deep-dive session',
                      'Networking opportunities with fellow participants',
                    ].map((hl, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-900 dark:bg-white" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* SCHEDULE TAB */}
            {tab === 'Schedule' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Event Agenda & Schedule
                  </h2>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">
                    {sessions.length > 0
                      ? `${sessions.length} ${sessions.length === 1 ? 'SESSION' : 'SESSIONS'} SCHEDULED`
                      : 'SCHEDULE WILL BE ANNOUNCED SOON'}
                  </p>
                </div>

                {sessions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-sm text-slate-400">
                    The organizer hasn&apos;t published the session schedule yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session, idx) => (
                      <div
                        key={session.id || idx}
                        className="rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface/95 shadow-[0_8px_30px_rgba(20,20,43,0.05)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900 p-5 sm:p-6"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 px-3 py-0.5 text-xs font-bold">
                            Session {session.sessionNumber ?? idx + 1}
                          </span>
                          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                            {session.startDate && (
                              <span className="flex items-center gap-1">
                                <Calendar size={13} className="text-slate-400" />
                                {formatDate(session.startDate)}
                              </span>
                            )}
                            {session.startTime && (
                              <span className="flex items-center gap-1">
                                <Clock size={13} className="text-slate-400" />
                                {formatTime(session.startTime)}
                                {session.endTime ? ` - ${formatTime(session.endTime)}` : ''}
                                {session.timezone ? ` (${session.timezone})` : ''}
                              </span>
                            )}
                          </div>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                          {session.title}
                        </h3>

                        {session.description && (
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {session.description}
                          </p>
                        )}

                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Video size={13} className="text-blue-600 dark:text-blue-400" />
                            <span>
                              {session.deliveryMode || event.deliveryMode || 'Online'}
                              {session.meetingProvider ? ` via ${session.meetingProvider}` : ''}
                            </span>
                          </span>

                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <Check size={13} />
                            Join link available in Learning Hub for attendees
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SPEAKERS & HOSTS TAB */}
            {tab === 'Speakers & Hosts' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Presented By
                  </h2>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">
                    Event hosts, organizers and guest speakers
                  </p>
                </div>

                {/* Primary Organizer / Channel */}
                <div className="rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface/95 shadow-[0_8px_30px_rgba(20,20,43,0.05)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900 p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <ChannelAvatar name={hostName} iconUrl={event.channelIconUrl} size={64} />
                    <div className="flex-1 text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Organizer & Host
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                        {hostName}
                      </h3>
                      <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 font-normal">
                        Official host of this event. Check out their channel page to discover more
                        upcoming events, courses, and educational series.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Collaborators / Speakers list */}
                {collaborators.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Featured Speakers & Instructors
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {collaborators.map((c) => (
                        <div
                          key={c.id}
                          className="rounded-tl-[1.75rem] rounded-br-[1.75rem] rounded-tr-lg rounded-bl-lg border border-slate-200/80 bg-surface/95 p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex items-center gap-4"
                        >
                          <Avatar
                            name={c.name}
                            imageUrl={c.avatarUrl}
                            size={44}
                          />
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{c.name}</h4>
                            <p className="text-xs text-slate-400 capitalize">
                              {c.role?.replace(/_/g, ' ').toLowerCase() || 'Speaker'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VENUE & ACCESS TAB */}
            {tab === 'Venue & Access' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    How to Join & Venue Details
                  </h2>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">
                    Everything you need to know before attending
                  </p>
                </div>

                <div className="rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface/95 p-6 sm:p-8 shadow-[0_8px_30px_rgba(20,20,43,0.05)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="size-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 grid place-items-center shrink-0">
                      <DeliveryIcon size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{deliveryLabel}</h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {event.deliveryMode === 'ONLINE'
                          ? 'This event takes place entirely online. Meeting links, session recordings, and interactive discussion rooms unlock automatically in your Event Learning Hub upon registration.'
                          : event.deliveryMode === 'OFFLINE'
                            ? 'This event takes place in-person on campus. Please bring your student/participant ID and arrive 15 minutes before the scheduled start time for check-in.'
                            : 'This event is hybrid — join in person on campus or attend remotely via live streaming.'}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                      Attendance Requirements
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      <li className="flex items-center gap-2">
                        <Check size={15} className="text-emerald-600 shrink-0 dark:text-emerald-400" />
                        <span>Registered Arcade user account with verified email</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={15} className="text-emerald-600 shrink-0 dark:text-emerald-400" />
                        <span>A laptop or desktop with internet access for interactive sessions</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={15} className="text-emerald-600 shrink-0 dark:text-emerald-400" />
                        <span>Active participation during interactive Q&A segments</span>
                      </li>
                    </ul>
                  </div>

                  {isEnrolled && (
                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">You are registered!</p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                          Head to your Event Learning Hub to access session links and materials.
                        </p>
                      </div>
                      <Link
                        href={targetOverviewHref}
                        className="rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shrink-0"
                      >
                        Open Event Hub
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
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
