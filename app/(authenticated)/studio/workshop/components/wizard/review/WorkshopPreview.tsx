'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Award,
  BadgeCheck,
  BookOpen,
  Briefcase,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  GraduationCap,
  Heart,
  Play,
  Radio,
  Settings,
  Share2,
  Sparkles,
  Star,
  Users,
  Volume2,
  MapPin,
  Calendar,
  PlayCircle,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { WorkshopPreviewDto, PricingModel } from '@/app/(authenticated)/studio/workshop/types';
import { getMyRegistrationStatus, registerForWorkshop } from '@/app/workshop/api/registration';

interface Props {
  preview: WorkshopPreviewDto;
  onRegister?: () => Promise<void>;
}

/* ------------------------------------------------------------------ */
/*  Decorations                                                        */
/* ------------------------------------------------------------------ */

function FlowerMark({
  size = 24,
  className,
  color = 'currentColor',
}: {
  size?: number;
  className?: string;
  color?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
      <path
        fill={color}
        d="M16 3.2c1.7 0 3.1 1.2 3.4 2.8a3.5 3.5 0 0 1 4.8 1.4 3.5 3.5 0 0 1 1.4 4.8 3.5 3.5 0 0 1 0 5.6 3.5 3.5 0 0 1-1.4 4.8 3.5 3.5 0 0 1-4.8 1.4 3.5 3.5 0 0 1-6.8 0 3.5 3.5 0 0 1-4.8-1.4 3.5 3.5 0 0 1-1.4-4.8 3.5 3.5 0 0 1 0-5.6 3.5 3.5 0 0 1 1.4-4.8 3.5 3.5 0 0 1 4.8-1.4A3.5 3.5 0 0 1 16 3.2Z"
      />
      <circle cx="16" cy="16" r="4.2" fill="#ffffff" />
    </svg>
  );
}

function BurstMark({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="9" cy="9" r="5" fill="var(--color-blue)" />
      <circle cx="15" cy="9" r="5" fill="var(--color-teal)" fillOpacity="0.85" />
      <circle cx="9" cy="15" r="5" fill="var(--color-amber)" fillOpacity="0.9" />
      <circle cx="15" cy="15" r="5" fill="var(--color-purple)" fillOpacity="0.85" />
    </svg>
  );
}

function Avatar({
  name,
  imageUrl,
  accent = 'var(--color-blue)',
  size = 36,
  onDark = false,
}: {
  name: string;
  imageUrl?: string | null;
  accent?: string;
  size?: number;
  onDark?: boolean;
}) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const commonStyle = {
    width: size,
    height: size,
    boxShadow: onDark ? '0 0 0 3px rgba(255,255,255,0.08)' : '0 0 0 3px rgba(20,22,28,0.04)',
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
      className="grid shrink-0 place-items-center rounded-full font-semibold text-paper"
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

function WorkshopBadge({ label = 'Workshop', accent = 'var(--color-blue)' }: { label?: string; accent?: string }) {
  const scallops = Array.from({ length: 12 });
  return (
    <div className="relative shrink-0">
      <svg width="164" height="188" viewBox="0 0 164 188" aria-hidden="true">
        <defs>
          <linearGradient id="badgeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={accent} />
            <stop offset="1" stopColor="var(--color-purple)" />
          </linearGradient>
        </defs>
        <path d="M60 118 L44 180 L70 162 L80 128 Z" fill="var(--color-coral)" />
        <path d="M104 118 L120 180 L94 162 L84 128 Z" fill="var(--color-teal)" />
        {scallops.map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const cx = 82 + Math.cos(a) * 52;
          const cy = 74 + Math.sin(a) * 52;
          return <circle key={i} cx={cx} cy={cy} r="12" fill="url(#badgeGrad)" />;
        })}
        <circle cx="82" cy="74" r="56" fill="url(#badgeGrad)" />
        <circle cx="82" cy="74" r="45" fill="var(--color-ink)" />
        <circle
          cx="82"
          cy="74"
          r="45"
          fill="none"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="1.5"
          strokeDasharray="3 5"
        />
      </svg>
      <div className="absolute inset-x-0 top-[44px] flex flex-col items-center text-paper">
        <Award size={30} className="text-amber" />
        <span className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-white/80">{label}</span>
        <span className="text-[10px] text-white/45">Certified</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Instructor Default Specs                                           */
/* ------------------------------------------------------------------ */

const INSTRUCTOR = {
  name: 'Maya Okafor',
  role: 'Senior Product Designer',
  channel: 'Maya Okafor',
  org: 'Pixelcraft Studio',
  accent: 'var(--color-purple)',
  bio: 'Maya has spent twelve years designing products used by millions — leading design at two Series B startups and shipping systems at Meta and Notion. She teaches design as a craft you build in public, not a set of screens you decorate.',
  expertise: ['Design systems', 'Interaction & motion', 'Figma', 'Prototyping', 'Design critique'],
  stats: [
    { k: '8', label: 'workshops', c: 'var(--color-blue)', icon: BookOpen },
    { k: '12,500', label: 'students', c: 'var(--color-amber)', icon: Users },
    { k: '4.9', label: 'avg rating', c: 'var(--color-teal)', icon: Star },
    { k: '12 yrs', label: 'experience', c: 'var(--color-purple)', icon: GraduationCap },
  ],
};

const REVIEWS = [
  {
    name: 'Adam Wathan',
    role: 'Founder, Tailwind',
    quote: "I've been using this developer series to get my team aligned on rapid component workflows.",
    dark: true,
    accent: 'var(--color-blue)',
  },
  {
    name: 'Ian Callahan',
    role: 'Harvard Art Museums',
    quote: 'Genuinely the clearest explanation of real-world collaborative sessions I have seen.',
    dark: false,
    accent: 'var(--color-amber)',
  },
  {
    name: 'Aaron Francis',
    role: 'Co-founder, Try Hard Studios',
    quote: 'Takes the pain out of learning complex delivery models — the pacing is spot on.',
    dark: false,
    accent: 'var(--color-purple)',
  },
  {
    name: 'Chandresh Patel',
    role: 'CEO, Bacancy',
    quote: 'pacing, organization, and visual design components are completely top tier.',
    dark: false,
    accent: 'var(--color-teal)',
  },
  {
    name: 'Fathom Analytics',
    role: 'Team account',
    quote: 'This session has been integral to how we think about product strategy onboarding.',
    dark: true,
    accent: 'var(--color-coral)',
  },
  {
    name: 'Priya Menon',
    role: 'Design Lead, Freshworks',
    quote: 'Highly interactive. The direct Q&A session with the host alone was worth it.',
    dark: false,
    accent: 'var(--color-blue)',
  },
];

/* ------------------------------------------------------------------ */
/*  Breadcrumb                                                        */
/* ------------------------------------------------------------------ */

function Breadcrumb({ title }: { title: string }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex flex-wrap items-center gap-1.5 text-[13px]">
        <li className="flex items-center gap-1.5">
          <Link
            href="/workshops"
            className="rounded-full px-2.5 py-1 font-medium text-subtle transition-colors hover:bg-mist hover:text-ink"
          >
            Workshops
          </Link>
          <ChevronRight size={13} className="text-subtle/40" />
        </li>
        <li className="rounded-full bg-ink/[0.04] px-2.5 py-1 font-semibold text-ink">{title}</li>
      </ol>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Workshop Hero                                                     */
/* ------------------------------------------------------------------ */

function WorkshopHero({
  preview,
  onRegister,
  registration,
  isRegistering,
}: {
  preview: WorkshopPreviewDto;
  onRegister: () => void;
  registration: any;
  isRegistering: boolean;
}) {
  const [saved, setSaved] = useState(false);
  const { basicInfo, pricing } = preview;

  const title = basicInfo.title || 'Untitled Workshop';
  const words = title.split(' ');
  const lastWord = words.pop() || '';
  const firstPart = words.join(' ');

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  // Render correct action button based on registration state
  const renderActionButton = () => {
    if (registration) {
      const status = registration.registrationStatus;
      if (status === 'APPROVED' || status === 'COMPLETED') {
        return (
          <span className="inline-flex h-11 items-center gap-2 rounded-full bg-green-500 px-6 font-semibold text-white shadow-sm">
            <Check size={18} /> Registered
          </span>
        );
      }
      if (status === 'WAITLISTED') {
        return (
          <span className="inline-flex h-11 items-center gap-2 rounded-full bg-amber-500 px-6 font-semibold text-white shadow-sm">
            On Waitlist
          </span>
        );
      }
      if (status === 'PENDING') {
        return (
          <span className="inline-flex h-11 items-center gap-2 rounded-full bg-blue-500 px-6 font-semibold text-white shadow-sm">
            Pending Approval
          </span>
        );
      }
      return (
        <span className="inline-flex h-11 items-center gap-2 rounded-full bg-red-500 px-6 font-semibold text-white shadow-sm">
          Cancelled
        </span>
      );
    }

    return (
      <button
        onClick={onRegister}
        disabled={isRegistering}
        className="flex h-11 items-center gap-2 rounded-full bg-ink px-6 font-semibold text-paper transition-all hover:bg-ink/90 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed"
      >
        {isRegistering ? 'Registering...' : 'Register now'}
      </button>
    );
  };

  return (
    <section className="arcade-fade">
      <Breadcrumb title={title} />

      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left */}
        <div>
          <span className="inline-block px-3.5 py-1 bg-[#4c6fff]/10 text-[#4c6fff] text-xs font-bold uppercase tracking-wider rounded-full mb-3">
            {basicInfo.category || 'Workshop'}
          </span>
          <h1
            className="mt-4 text-[2.75rem] font-normal leading-[1.05] tracking-tight text-ink text-balance sm:text-[4rem]"
            style={{ fontFamily: '"Clash Display", var(--font-sora), sans-serif', fontWeight: 700 }}
          >
            {firstPart}{' '}
            <span className="relative whitespace-nowrap italic text-[#4c6fff]">
              {lastWord}
              <FlowerMark
                size={26}
                color="var(--color-ink)"
                className="arcade-spin absolute -right-8 -top-2 hidden sm:block"
              />
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 12"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M2 9C40 3 160 3 198 8" stroke="var(--color-amber)" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
            .
          </h1>

          <div className="mt-6 flex items-center gap-3">
            <Avatar name={INSTRUCTOR.name} accent={INSTRUCTOR.accent} size={46} />
            <div>
              <p className="text-[15px] font-semibold text-ink">{INSTRUCTOR.name}</p>
              <p className="flex items-center gap-1.5 text-[13px] text-subtle">
                <Radio size={13} className="text-blue" /> @{INSTRUCTOR.channel.toLowerCase().replace(/\s+/g, '')}
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-2 text-[13px] font-medium text-ink">
              <span className="size-1.5 rounded-full bg-blue" />
              <MapPin size={13} className="text-subtle" />{' '}
              {basicInfo.deliveryMode === 'ONLINE' ? 'Online Workshop' : 'In-Person'}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-2 text-[13px] font-medium text-ink">
              <span className="size-1.5 rounded-full bg-amber" />
              <Users size={13} className="text-subtle" />{' '}
              {basicInfo.difficulty?.charAt(0) + basicInfo.difficulty?.slice(1).toLowerCase()} Level
            </span>
            {basicInfo.language && (
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-2 text-[13px] font-medium text-ink">
                <span className="size-1.5 rounded-full bg-teal" />
                <GraduationCap size={13} className="text-subtle" /> {basicInfo.language}
              </span>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-baseline gap-2 pr-1">
              {pricing?.pricingModel === PricingModel.FREE ? (
                <span className="font-serif text-3xl font-medium text-ink">Free</span>
              ) : (
                <span className="font-serif text-3xl font-medium text-ink">
                  {formatCurrency(pricing?.price || 0, pricing?.currency || 'USD')}
                </span>
              )}
            </div>
            {renderActionButton()}
            <button
              onClick={() => setSaved((s) => !s)}
              aria-pressed={saved}
              aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
              className="grid size-11 place-items-center rounded-full border border-line bg-paper text-subtle transition-colors hover:text-coral"
            >
              <Heart
                size={18}
                fill={saved ? 'var(--color-coral)' : 'none'}
                color={saved ? 'var(--color-coral)' : 'currentColor'}
              />
            </button>
          </div>
        </div>

        {/* Right */}
        <div className="relative">
          <div
            className="absolute -right-4 -top-5 hidden size-24 rounded-full opacity-70 blur-2xl lg:block"
            style={{ background: '#4c6fff' }}
            aria-hidden="true"
          />
          <div className="relative rounded-3xl bg-[#14142b] p-3.5 shadow-[0_28px_60px_rgba(20,22,28,0.28)]">
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center overflow-hidden rounded-full bg-[#4c6fff] text-xs font-bold text-white">
                  {INSTRUCTOR.name[0]}
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-white">Workshop Preview</p>
                  <p className="text-[11px] text-white/50">@mayaokafor</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-white/45">
                <Volume2 size={15} />
                <Settings size={15} />
              </div>
            </div>

            <div className="relative grid h-56 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#1d2130] to-[#262a38]">
              {basicInfo.coverImageUrl ? (
                <img
                  src={basicInfo.coverImageUrl}
                  alt={title}
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
              ) : (
                <div
                  className="absolute -left-6 -top-6 size-24 rounded-full opacity-40 blur-2xl"
                  style={{ background: '#9b5de5' }}
                  aria-hidden="true"
                />
              )}
              <button
                aria-label="Play workshop intro"
                className="grid size-16 place-items-center rounded-full bg-white/12 ring-1 ring-white/20 backdrop-blur-sm transition-transform hover:scale-105 z-10"
              >
                <Play size={22} className="translate-x-0.5 text-white" fill="currentColor" />
              </button>
            </div>

            <div className="mt-3.5 h-1 rounded-full bg-white/12">
              <div className="h-full w-[35%] rounded-full bg-[#ff6b4a]" />
            </div>
            <div className="mt-2.5 flex items-center justify-between px-0.5 text-[11px] text-white/50">
              <span>0:15 / 1:30</span>
              <span className="flex items-center gap-3">
                <Share2 size={13} />
                <Clock size={13} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Workshop Tabs                                                     */
/* ------------------------------------------------------------------ */

type Tab = 'Overview' | 'Syllabus' | 'Instructor' | 'Certificate';
const TABS: Tab[] = ['Overview', 'Syllabus', 'Instructor', 'Certificate'];

function WorkshopTabs({ preview }: { preview: WorkshopPreviewDto }) {
  const [tab, setTab] = useState<Tab>('Overview');
  const [openMod, setOpenMod] = useState(0);
  const { basicInfo, schedule, settings } = preview;

  const highlights = useMemo(() => {
    const list = [
      `Delivery Mode: ${basicInfo.deliveryMode === 'ONLINE' ? 'Online Interactive' : 'In-Person Class'}`,
      `Level: ${basicInfo.difficulty?.charAt(0) + basicInfo.difficulty?.slice(1).toLowerCase()}`,
      `Language: ${basicInfo.language || 'English'}`,
    ];
    if (settings?.certificateEnabled) {
      list.push('Shareable Certificate of Completion');
    }
    if (settings?.recordingAvailable) {
      list.push('Session video recordings included');
    }
    if (basicInfo.capacity) {
      list.push(`Class size limit: ${basicInfo.capacity} seats`);
    }
    return list;
  }, [basicInfo, settings]);

  return (
    <div>
      <div className="flex justify-center">
        <div className="inline-flex flex-wrap justify-center gap-1 rounded-full border border-line bg-paper p-1.5">
          {TABS.map((t) => {
            if (t === 'Certificate' && !settings?.certificateEnabled) return null;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                aria-pressed={tab === t}
                className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-colors sm:px-5 ${
                  tab === t ? 'bg-ink text-paper' : 'text-subtle hover:text-ink'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <div key={tab} className="arcade-fade mt-10">
        {tab === 'Overview' && (
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-3xl border border-line bg-paper p-7">
              <h3 className="font-serif text-2xl font-light text-ink">About this workshop</h3>
              <p className="mt-4 text-[15px] leading-relaxed text-subtle whitespace-pre-wrap">
                {basicInfo.description || 'No description provided.'}
              </p>
            </div>
            <div className="rounded-3xl border border-line bg-paper p-7">
              <h3 className="font-serif text-2xl font-light text-ink">Details & Highlights</h3>
              <ul className="mt-4 flex flex-col gap-3">
                {highlights.map((h) => (
                  <li key={h} className="flex items-center gap-3 text-[15px] text-ink">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-teal/12">
                      <Check size={13} className="text-teal" />
                    </span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === 'Syllabus' && (
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 flex flex-wrap items-center justify-center gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-1.5 text-[13px] font-medium text-ink">
                <BookOpen size={14} className="text-[#4c6fff]" /> {schedule?.length || 0} session
                {schedule?.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {schedule && schedule.length > 0 ? (
                schedule.map((session, idx) => {
                  const open = openMod === idx;
                  const sDate = new Date(session.startDate).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  const sTime = `${new Date(session.startDate).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })} - ${new Date(session.endDate).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`;

                  return (
                    <div
                      key={session.id || idx}
                      className="overflow-hidden rounded-2xl border border-line bg-paper transition-colors hover:border-ink/15"
                    >
                      <button
                        onClick={() => setOpenMod(open ? -1 : idx)}
                        aria-expanded={open}
                        className="flex w-full items-center gap-4 px-5 py-4 text-left"
                      >
                        <span
                          className="grid size-10 shrink-0 place-items-center rounded-xl font-serif text-base font-medium text-paper bg-[#4c6fff]"
                        >
                          {idx + 1}
                        </span>
                        <span className="flex-1">
                          <span className="block text-[11px] font-semibold uppercase tracking-wide text-subtle">
                            Session {idx + 1} · {sDate}
                          </span>
                          <span className="block text-[15px] font-semibold text-ink">{session.title}</span>
                        </span>
                        <span className="hidden text-xs text-subtle sm:block">
                          {sTime}
                        </span>
                        <ChevronDown
                          size={17}
                          className="text-subtle transition-transform"
                          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
                        />
                      </button>
                      {open && (
                        <div className="border-t border-line px-5 py-4 bg-mist/20 text-sm text-subtle space-y-3">
                          {session.description && <p>{session.description}</p>}
                          <div className="flex flex-col sm:flex-row gap-4 text-xs font-semibold uppercase text-ink">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-blue" /> Date: {sDate}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-amber" /> Time: {sTime} ({session.timezone})
                            </span>
                            {session.deliveryMode === 'ONLINE' && (
                              <span className="flex items-center gap-1.5">
                                <PlayCircle className="w-4 h-4 text-teal" /> Online meeting via{' '}
                                {session.meetingProvider}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-subtle text-sm italic">No scheduled sessions listed.</p>
              )}
            </div>
          </div>
        )}

        {tab === 'Instructor' && (
          <div className="mx-auto max-w-3xl rounded-3xl border border-line bg-paper p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <Avatar name={INSTRUCTOR.name} accent={INSTRUCTOR.accent} size={72} />
              <div className="flex-1">
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-purple/10 px-2.5 py-1 text-[12px] font-medium text-purple">
                  <BadgeCheck size={13} /> {INSTRUCTOR.org}
                </div>
                <h3 className="font-serif text-2xl font-light text-ink">{INSTRUCTOR.name}</h3>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-subtle">
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase size={13} /> {INSTRUCTOR.role}
                  </span>
                  <span className="text-subtle/40">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Radio size={13} className="text-blue" /> {INSTRUCTOR.channel}
                  </span>
                </p>
              </div>
              <button className="rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-paper transition-transform hover:-translate-y-0.5">
                Follow channel
              </button>
            </div>

            <p className="mt-6 text-[15px] leading-relaxed text-subtle">{INSTRUCTOR.bio}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {INSTRUCTOR.expertise.map((e) => (
                <span
                  key={e}
                  className="rounded-full border border-line bg-mist px-3 py-1.5 text-[12px] font-medium text-ink"
                >
                  {e}
                </span>
              ))}
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 border-t border-line pt-6 sm:grid-cols-4">
              {INSTRUCTOR.stats.map(({ k, label, c, icon: Icon }) => (
                <div key={label}>
                  <Icon size={16} style={{ color: c }} />
                  <p className="mt-2 font-serif text-xl font-medium text-ink">{k}</p>
                  <p className="text-[12px] text-subtle">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'Certificate' && settings?.certificateEnabled && (
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-10 rounded-3xl border border-line bg-paper p-8 sm:flex-row sm:items-center">
            <WorkshopBadge label="Workshop" accent="var(--color-blue)" />
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber/15 px-2.5 py-1 text-[12px] font-semibold text-ink">
                <Sparkles size={13} className="text-amber" /> Workshop badge
              </span>
              <h3 className="mt-3 font-serif text-2xl font-light text-ink">Earn a badge that&apos;s one of a kind</h3>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-subtle">
                Finish all sessions in <span className="font-medium text-ink">{basicInfo.title}</span> to unlock this verified badge on your profile.
                Share your certified completion token with employers and peers globally.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reviews                                                           */
/* ------------------------------------------------------------------ */

function ReviewsBlock() {
  return (
    <section aria-labelledby="reviews-heading">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wide text-subtle">
          <Star size={13} className="text-amber" fill="var(--color-amber)" strokeWidth={0} /> Reviews
        </span>
        <h2 id="reviews-heading" className="font-serif text-3xl font-light text-ink text-balance sm:text-4xl">
          Loved by builders globally
        </h2>
        <div className="flex items-center gap-3">
          <span className="font-serif text-3xl font-light text-ink">4.9</span>
          <div className="text-left">
            <div className="flex gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={14} className="text-amber" fill="var(--color-amber)" strokeWidth={0} />
              ))}
            </div>
            <p className="mt-0.5 text-xs text-subtle">812 ratings</p>
          </div>
        </div>
      </div>

      <div className="[column-gap:1rem] sm:columns-2 lg:columns-3">
        {REVIEWS.map((r) => (
          <div
            key={r.name}
            className={`mb-4 break-inside-avoid rounded-2xl p-6 ${r.dark ? 'bg-ink' : 'border border-line bg-paper'}`}
          >
            <p className={`text-[15px] leading-relaxed ${r.dark ? 'font-medium text-paper' : 'text-ink'}`}>
              &ldquo;{r.quote}&rdquo;
            </p>
            <div
              className={`mt-5 flex items-center justify-between border-t pt-4 ${r.dark ? 'border-white/10' : 'border-line'}`}
            >
              <div>
                <p className={`text-[13px] font-semibold ${r.dark ? 'text-paper' : 'text-ink'}`}>{r.name}</p>
                <p className={`text-[11px] ${r.dark ? 'text-white/50' : 'text-subtle'}`}>{r.role}</p>
              </div>
              <Avatar name={r.name} accent={r.accent} size={32} onDark={r.dark} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Register CTA                                                      */
/* ------------------------------------------------------------------ */

function RegisterCta({
  title,
  onRegister,
  registration,
  isRegistering,
}: {
  title: string;
  onRegister: () => void;
  registration: any;
  isRegistering: boolean;
}) {
  const renderCtaButton = () => {
    if (registration) {
      const status = registration.registrationStatus;
      return (
        <span className="flex h-12 items-center gap-2 rounded-full bg-white px-8 font-semibold text-ink shadow-md">
          <Check size={18} /> Successfully Enrolled
        </span>
      );
    }
    return (
      <button
        onClick={onRegister}
        disabled={isRegistering}
        className="flex h-12 items-center gap-2 rounded-full bg-white px-8 font-semibold text-ink transition-all hover:bg-white/90 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed"
      >
        {isRegistering ? 'Registering...' : 'Register now'}
      </button>
    );
  };

  return (
    <section className="arcade-cta-wash relative overflow-hidden rounded-[2rem] px-8 py-14 text-center sm:px-16 sm:py-16">
      <FlowerMark
        size={120}
        color="rgba(255,255,255,0.06)"
        className="arcade-spin pointer-events-none absolute -right-8 -top-8"
      />
      <h2 className="mx-auto max-w-2xl font-serif text-3xl font-light leading-tight text-paper text-balance sm:text-4xl">
        Take your craft to the <span className="italic text-amber">next level.</span>
      </h2>
      <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/60">
        Join our interactive session for {title} — collaborate, practice, and build with builders globally.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {renderCtaButton()}
        <button className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-white/10">
          See sessions details →
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                    */
/* ------------------------------------------------------------------ */

export const WorkshopPreview: React.FC<Props> = ({ preview, onRegister }) => {
  const { basicInfo } = preview;
  const [registration, setRegistration] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  const loadRegistration = useCallback(async () => {
    if (!basicInfo.id) {
      setLoadingStatus(false);
      return;
    }
    try {
      const data = await getMyRegistrationStatus(basicInfo.id);
      setRegistration(data);
    } catch (err) {
      console.error('Failed to fetch registration status:', err);
    } finally {
      setLoadingStatus(false);
    }
  }, [basicInfo.id]);

  useEffect(() => {
    loadRegistration();
  }, [loadRegistration]);

  const handleRegister = async () => {
    if (!onRegister && !basicInfo.id) {
      toast.success('This is a preview. Registration would happen here!');
      return;
    }

    setIsRegistering(true);
    try {
      if (onRegister) {
        await onRegister();
      } else {
        await registerForWorkshop(basicInfo.id!);
        toast.success('Successfully registered for workshop!');
      }
      await loadRegistration();
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.message?.includes('401')) {
        toast.error('Please log in to register.');
      } else if (err.message?.includes('409') || err.message?.includes('already registered')) {
        toast.error('You are already registered for this workshop.');
      } else {
        toast.error(err.message || 'Failed to register. Please try again.');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  if (loadingStatus) {
    return (
      <main className="min-h-screen bg-transparent text-ink flex items-center justify-center">
        <div className="size-8 rounded-full border-2 border-ink border-t-transparent animate-spin" />
      </main>
    );
  }

  const title = basicInfo.title || 'Untitled Workshop';

  return (
    <main className="min-h-screen bg-transparent text-ink font-sans">
      {/* Hero Wash */}
      <div className="arcade-wash">
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-12 sm:px-8 sm:pt-16">
          <WorkshopHero
            preview={preview}
            onRegister={handleRegister}
            registration={registration}
            isRegistering={isRegistering}
          />
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <WorkshopTabs preview={preview} />
        <div className="mt-20">
          <ReviewsBlock />
        </div>
        <div className="mt-16">
          <RegisterCta
            title={title}
            onRegister={handleRegister}
            registration={registration}
            isRegistering={isRegistering}
          />
        </div>
      </div>
    </main>
  );
};
