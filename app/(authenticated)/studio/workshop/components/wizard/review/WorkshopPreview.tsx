'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BadgeCheck,
  BookOpen,
  Briefcase,
  Check,
  ChevronDown,
  Clock,
  GraduationCap,
  PlayCircle,
  Radio,
  Sparkles,
  Star,
  Users,
  MapPin,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { WorkshopPreviewDto, PricingModel } from '@/app/(authenticated)/studio/workshop/types';
import { getMyRegistrationStatus, registerForWorkshop } from '@/app/(public)/workshop/api/registration';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/design-system/ui/dialog';

import {
  LearningLayout,
  LearningHero,
  LearningTabs,
  LearningReviews,
  LearningCta,
  LearningBadge,
  Avatar
} from '@/shared/design-system/ui/learning';

interface Props {
  preview: WorkshopPreviewDto;
  onRegister?: () => Promise<void>;
}

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

export const WorkshopPreview: React.FC<Props> = ({ preview, onRegister }) => {
  const { basicInfo, schedule, settings, pricing } = preview;
  const [registration, setRegistration] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [openMod, setOpenMod] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

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

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportNote, setReportNote] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  const handleReportSubmit = async () => {
    if (!reportNote.trim()) {
      toast.error('Please provide a note about the issue.');
      return;
    }
    setIsReporting(true);
    try {
      const { api } = await import('@/infrastructure/http/api');
      await api.post('/api/v1/reports', {
        contentId: basicInfo.id,
        contentType: 'WORKSHOP',
        note: reportNote
      });
      toast.success('Workshop reported. Our moderation team will review it shortly.');
      setReportModalOpen(false);
      setReportNote('');
    } catch (err: any) {
      console.error('Failed to report workshop:', err);
      toast.error(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsReporting(false);
    }
  };

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

  const title = basicInfo.title || 'Untitled Workshop';

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
        onClick={handleRegister}
        disabled={isRegistering}
        className="flex h-11 items-center gap-2 rounded-full bg-ink px-6 font-semibold text-paper transition-all hover:bg-ink/90 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed"
      >
        {isRegistering ? 'Registering...' : 'Register now'}
      </button>
    );
  };

  const renderCtaButton = () => {
    if (registration) {
      const status = registration.registrationStatus;
      return (
        <span className="flex h-12 items-center gap-2 rounded-full bg-white px-8 font-semibold text-ink shadow-md">
          <Check size={18} /> {status === 'WAITLISTED' ? 'On Waitlist' : status === 'PENDING' ? 'Pending Approval' : 'Successfully Enrolled'}
        </span>
      );
    }
    return (
      <button
        onClick={handleRegister}
        disabled={isRegistering}
        className="flex h-12 items-center gap-2 rounded-full bg-white px-8 font-semibold text-ink transition-all hover:bg-white/90 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed"
      >
        {isRegistering ? 'Registering...' : 'Register now'}
      </button>
    );
  };

  if (loadingStatus) {
    return (
      <main className="min-h-screen bg-transparent text-ink flex items-center justify-center">
        <div className="size-8 rounded-full border-2 border-ink border-t-transparent animate-spin" />
      </main>
    );
  }

  const heroContent = (
    <LearningHero
      breadcrumbs={[
        { label: "Workshops", href: "/workshops" }
      ]}
      category={basicInfo.category || 'Workshop'}
      title={title}
      authorName={INSTRUCTOR.name}
      authorUsername={INSTRUCTOR.channel}
      authorAccent={INSTRUCTOR.accent}
      metaChips={[
        { icon: MapPin, label: basicInfo.deliveryMode === 'ONLINE' ? 'Online Workshop' : 'In-Person', dotColor: "var(--color-blue)" },
        { icon: Users, label: `${basicInfo.difficulty?.charAt(0) + basicInfo.difficulty?.slice(1).toLowerCase()} Level`, dotColor: "var(--color-amber)" },
        ...(basicInfo.language ? [{ icon: GraduationCap, label: basicInfo.language, dotColor: "var(--color-teal)" }] : []),
      ]}
      pricingModel={pricing?.pricingModel}
      priceAmount={pricing?.price}
      currency={pricing?.currency || "USD"}
      isWishlisted={isWishlisted}
      onWishlistToggle={() => setIsWishlisted(!isWishlisted)}
      onReportClick={() => setReportModalOpen(true)}
      previewImageUrl={basicInfo.coverImageUrl}
      previewLabel="Workshop Preview"
      previewVideoDuration="0:15 / 1:30"
      accentColor="#4c6fff"
      actionButton={renderActionButton()}
    />
  )

  const tabsContent = (
    <LearningTabs
      tabs={[
        {
          id: "Overview",
          label: "Overview",
          content: (
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
          )
        },
        {
          id: "Syllabus",
          label: "Syllabus",
          content: (
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
          )
        },
        {
          id: "Instructor",
          label: "Instructor",
          content: (
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
          )
        },
        ...(settings?.certificateEnabled ? [{
          id: "Certificate",
          label: "Certificate",
          content: (
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-10 rounded-3xl border border-line bg-paper p-8 sm:flex-row sm:items-center">
              <LearningBadge label="Workshop" accent="var(--color-blue)" />
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
          )
        }] : [])
      ]}
    />
  )

  const reviewsContent = <LearningReviews reviews={REVIEWS} headingText="Loved by builders globally" />

  const ctaContent = (
    <LearningCta
      title={<>Take your craft to the <span className="italic text-amber">next level.</span></>}
      description={`Join our interactive session for ${title} — collaborate, practice, and build with builders globally.`}
      primaryAction={renderCtaButton()}
      secondaryAction={
        <button className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-white/10">
          See sessions details →
        </button>
      }
    />
  )

  const modals = (
    <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report Workshop</DialogTitle>
          <DialogDescription>
            Please provide details about what is wrong with this workshop.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <textarea
            className="min-h-[100px] w-full rounded-md border border-ink/20 p-3 text-sm focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
            placeholder="Tell us what's wrong..."
            value={reportNote}
            onChange={(e) => setReportNote(e.target.value)}
          />
        </div>
        <DialogFooter>
          <button
            onClick={() => setReportModalOpen(false)}
            className="rounded-full px-4 py-2 text-sm font-semibold text-subtle hover:text-ink"
          >
            Cancel
          </button>
          <button
            onClick={handleReportSubmit}
            disabled={isReporting}
            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-700 disabled:opacity-50"
          >
            {isReporting ? 'Submitting...' : 'Submit Report'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return (
    <LearningLayout
      hero={heroContent}
      tabs={tabsContent}
      reviews={reviewsContent}
      cta={ctaContent}
      modals={modals}
    />
  )
};
