'use client';

import { ContentArt } from '@/shared/design-system/art';
import { useEffect, useMemo, useState, useRef } from 'react';
import { courseRoutes } from '@/shared/routes/content.routes';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Home,
  GraduationCap,
  Compass,
  CalendarDays,
  Bell,
  UserIcon,
  Settings,
  Tv,
  LayoutDashboard,
  ShieldCheck,
  Users,
  FolderKanban,
  BadgeCheck,
  AtSign,
  Wallet,
  Inbox,
  ClipboardCheck,
  FileClock,
  Palette,
  Lock,
  KeySquare,
  BookOpen,
  ArrowRight,
  Loader2,
  SearchX,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';
import { useUserChannels, useStudioAccess } from '@/domains/channels';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { usePublicCoursesPage } from '@/shared/hooks/usePublicCourses';
import { getPublishedEvents } from '@/domains/events';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/design-system/ui/command';

interface NavEntry {
  id: string;
  label: string;
  subtitle?: string;
  href: string;
  icon: React.ElementType;
  keywords?: string[];
  /** Shown even with an empty query. */
  suggested?: boolean;
}

interface NavSection {
  heading: string;
  items: NavEntry[];
}

function matches(entry: NavEntry, query: string) {
  if (!query) return true;
  const haystack = `${entry.label} ${entry.subtitle ?? ''} ${(entry.keywords ?? []).join(' ')}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export interface SuperSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuery?: string;
}

/**
 * The dashboard's "super search" — one modal that reaches everywhere a signed-in user can go:
 * courses and events (live search), the learner's own pages, and — only when the account actually
 * holds the capability — Content Studio and the relevant Console sections.
 *
 * <p>Styled to match the rest of the app's own idiom rather than inventing a new one: flat rows
 * with a single restrained accent (`LearnerNavbar`'s profile menu), and a thumbnail + title +
 * subtitle row for courses (the home page's own "Recommended for you" list).
 *
 * <p>Role-awareness here is presentational only, exactly like the navbar it mirrors: every entry
 * links to a route that independently re-checks access. Hiding an entry from a learner is a
 * convenience, not the security boundary.
 */
export const POPULAR_TOPICS = [
  'Full-Stack Web',
  'Machine Learning',
  'UI/UX Design',
  'Cloud & DevOps',
  'System Design',
  'Python',
  'Cybersecurity',
];

export function SuperSearchModal({ open, onOpenChange, initialQuery = '' }: SuperSearchModalProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [query, setQuery] = useState(initialQuery);

  const effectiveQuery = selectedTopic ? `${selectedTopic}${query ? ' ' + query : ''}` : query;
  const debouncedQuery = useDebouncedValue(effectiveQuery, 250);
  const hasQuery = debouncedQuery.trim().length > 0;

  useEffect(() => {
    if (open) {
      const match = POPULAR_TOPICS.find((t) => t.toLowerCase() === initialQuery.trim().toLowerCase());
      if (match) {
        setSelectedTopic(match);
        setQuery('');
      } else {
        setSelectedTopic(null);
        setQuery(initialQuery);
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setSelectedTopic(null);
      setQuery('');
    }
  }, [open, initialQuery]);

  const selectTopic = (tag: string) => {
    setSelectedTopic(tag);
    setQuery('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 30);
  };

  const removeTopic = () => {
    setSelectedTopic(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 30);
  };

  const { channels: userChannels } = useUserChannels();
  const channelCount = userChannels.length;
  const singleChannel = channelCount === 1 ? userChannels[0] : null;
  const { hasAccess: showStudio } = useStudioAccess();
  const showConsole = AuthorizationService.canAccessConsole(user);

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  // Live search — courses and events. Both are cheap, server-filtered pages, not the full catalogue.
  const { courses, isLoading: coursesLoading } = usePublicCoursesPage({
    search: debouncedQuery,
    size: 5,
    enabled: hasQuery,
  });

  const { data: eventResults, isLoading: eventsLoading } = useQuery({
    queryKey: ['super-search-events', debouncedQuery],
    queryFn: () => getPublishedEvents({ search: debouncedQuery, size: 4 }),
    enabled: hasQuery,
    staleTime: 30_000,
  });

  const learnerSections: NavSection[] = useMemo(() => {
    const sections: NavSection[] = [
      {
        heading: 'Navigate',
        items: [
          { id: 'home', label: 'Home', href: '/', icon: Home, suggested: true },
          { id: 'my-learning', label: 'My Learning', subtitle: 'Continue your enrolled courses', href: '/learning', icon: GraduationCap, suggested: true },
          { id: 'explore', label: 'Explore Courses', subtitle: 'Browse the full catalogue', href: '/search', icon: Compass, suggested: true, keywords: ['catalogue', 'browse'] },
          { id: 'events', label: 'Events', href: '/events', icon: CalendarDays, suggested: true },
          { id: 'notifications', label: 'Notifications', href: '/notifications', icon: Bell },
          { id: 'profile', label: 'Profile', href: '/profile', icon: UserIcon },
        ],
      },
    ];

    if (channelCount > 0) {
      sections.push({
        heading: channelCount === 1 ? 'Your Channel' : 'Your Channels',
        items: [
          {
            id: 'channel',
            label: channelCount === 1 ? 'Channel' : 'Channels',
            subtitle: channelCount === 1 ? 'View your channel' : 'Manage your channels',
            href: singleChannel ? `/channels/${singleChannel.id}/manage` : '/manage-channels',
            icon: Tv,
            suggested: true,
          },
        ],
      });
    }

    if (showStudio || showConsole) {
      const items: NavEntry[] = [];
      if (showStudio) {
        items.push(
          { id: 'studio', label: 'Content Studio', subtitle: 'Create and edit courses, exams and events', href: '/studio', icon: LayoutDashboard, suggested: true, keywords: ['create', 'author', 'editor'] },
          { id: 'studio-published', label: 'Published Content', href: '/studio/published', icon: BookOpen, keywords: ['studio'] },
          { id: 'studio-review', label: 'My Review Queue', href: '/studio/review', icon: ClipboardCheck, keywords: ['studio', 'submissions'] },
          { id: 'studio-events', label: 'My Events', href: '/studio/events', icon: CalendarDays, keywords: ['studio', 'collaborations'] },
        );
      }
      if (showConsole) {
        items.push({ id: 'console', label: 'Console', subtitle: 'Platform administration', href: '/console', icon: ShieldCheck, suggested: true, keywords: ['admin'] });
      }
      sections.push({ heading: 'Creator & Admin', items });
    }

    if (showConsole) {
      const items: NavEntry[] = [];
      if (AuthorizationService.canManageChannels(user)) {
        items.push({ id: 'console-channels', label: 'Manage Channels', href: '/console/channels', icon: Tv, keywords: ['console', 'requests'] });
      }
      if (AuthorizationService.canAccessPlatformReviews(user)) {
        items.push({ id: 'console-reviews', label: 'Content Reviews', href: '/console/reviews', icon: FileClock, keywords: ['console', 'approve', 'reject'] });
      }
      if (AuthorizationService.canManageContent(user)) {
        items.push({ id: 'console-content', label: 'Content Manage', href: '/console/content-manage', icon: FolderKanban, keywords: ['console', 'categories', 'suspend'] });
      }
      if (AuthorizationService.canManageExams(user)) {
        items.push({ id: 'console-exams', label: 'Exam standards', href: '/console/exam-standards', icon: ClipboardCheck, keywords: ['console'] });
      }
      if (AuthorizationService.canViewPayments(user)) {
        items.push({ id: 'console-payments', label: 'Payments', href: '/console/payments', icon: Wallet, keywords: ['console', 'billing'] });
      }
      if (AuthorizationService.canManageInbox(user)) {
        items.push({ id: 'console-inbox', label: 'Inbox', href: '/console/inbox', icon: Inbox, keywords: ['console', 'reports', 'contact'] });
      }
      if (AuthorizationService.canManageRecognition(user)) {
        items.push({ id: 'console-recognition', label: 'Recognition & Badges', href: '/console/recognition', icon: BadgeCheck, keywords: ['console'] });
      }
      if (AuthorizationService.canManageHandles(user)) {
        items.push({ id: 'console-handles', label: 'Handle Appeals', href: '/console/handles', icon: AtSign, keywords: ['console', 'username'] });
      }
      if (AuthorizationService.canAccessIamConsole(user)) {
        items.push({ id: 'console-iam', label: 'IAM & Access', href: '/console/iam', icon: Users, keywords: ['console', 'users', 'roles', 'permissions'] });
      }
      if (items.length > 0) sections.push({ heading: 'Console', items });
    }

    sections.push({
      heading: 'Account & Settings',
      items: [
        { id: 'settings', label: 'Settings', href: '/settings', icon: Settings, suggested: true },
        { id: 'settings-appearance', label: 'Appearance', href: '/settings/appearance', icon: Palette, keywords: ['theme', 'dark mode'] },
        { id: 'settings-privacy', label: 'Privacy', href: '/settings/privacy', icon: Lock },
        { id: 'settings-security', label: 'Security', href: '/settings/security', icon: KeySquare, keywords: ['password', '2fa'] },
        { id: 'settings-payments', label: 'Payment Methods', href: '/settings/payments', icon: Wallet, keywords: ['billing'] },
      ],
    });

    return sections;
  }, [channelCount, singleChannel, showStudio, showConsole, user]);

  const visibleSections = useMemo(
    () =>
      learnerSections
        .map((section) => ({
          heading: section.heading,
          items: section.items.filter((item) => (hasQuery ? matches(item, debouncedQuery) : item.suggested)),
        }))
        .filter((section) => section.items.length > 0),
    [learnerSections, hasQuery, debouncedQuery],
  );

  const isSearching = hasQuery && (coursesLoading || eventsLoading);
  const hasAnyResults =
    visibleSections.length > 0 || (courses?.length ?? 0) > 0 || (eventResults?.content?.length ?? 0) > 0;

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search Arcade"
      description="Search courses, events and pages"
      className="top-[8%] sm:top-[12%] translate-y-0 w-[95vw] sm:max-w-2xl! md:max-w-3xl! gap-0 overflow-hidden rounded-3xl! border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-0 shadow-2xl"
      showCloseButton={false}
    >
      <Command shouldFilter={false} className="bg-transparent">
        {/* Top Input Header */}
        <div className="relative flex items-center gap-2.5 sm:gap-3 border-b border-slate-100 dark:border-slate-800/80 px-4 sm:px-6 py-4.5 bg-white dark:bg-slate-900">
          {/* Search Glass Doodle */}
          <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center select-none">
            <svg
              width="34"
              height="34"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Glass Rim */}
              <circle
                cx="15.5"
                cy="15.5"
                r="9"
                className="fill-slate-50 dark:fill-slate-800 stroke-slate-800 dark:stroke-slate-200"
                strokeWidth="2.2"
              />
              {/* Glass inner reflection stroke */}
              <path
                d="M11 12C12 10.2 14.2 9.2 16.5 9.5"
                className="stroke-[#27C5D8]"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              {/* Handle */}
              <path
                d="M22 22L29 29"
                className="stroke-slate-800 dark:stroke-slate-200"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              {/* Handle Grip accent */}
              <circle cx="28.5" cy="28.5" r="1.2" className="fill-amber-400" />
            </svg>
          </div>

          {/* Active Selected Topic Pill Chip */}
          {selectedTopic && (
            <div className="inline-flex items-center gap-1.5 rounded-tl-[1rem] rounded-br-[1rem] rounded-tr-xs rounded-bl-xs border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1 text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-100 shrink-0 select-none animate-in fade-in zoom-in-95 duration-150">
              <span>{selectedTopic}</span>
              <button
                type="button"
                onClick={removeTopic}
                className="flex size-4 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                aria-label={`Remove ${selectedTopic}`}
              >
                <X size={12} strokeWidth={2.4} />
              </button>
            </div>
          )}

          <CommandInput
            ref={inputRef}
            bare
            value={query}
            onValueChange={setQuery}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !query && selectedTopic) {
                removeTopic();
              }
            }}
            placeholder={selectedTopic ? 'Filter within topic…' : 'Search courses, events, settings, topics…'}
            autoFocus
            className="h-auto flex-1 border-0 bg-transparent p-0 text-[15px] sm:text-[16.5px] font-semibold text-slate-900 dark:text-white shadow-none outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal focus-visible:ring-0"
          />

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close search"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer"
            >
              <X size={16} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        <CommandList
          className="max-h-[65vh] min-h-[320px] overflow-x-hidden px-3 sm:px-4 py-3 bg-white dark:bg-slate-900 divide-y divide-slate-100/60 dark:divide-slate-800/60"
        >
          {isSearching && (
            <div className="flex items-center gap-2 px-3 py-3 text-xs font-semibold text-[#2962D6] dark:text-[#3B82F6]">
              <Loader2 size={15} className="animate-spin" /> Searching knowledge base…
            </div>
          )}

          {!hasQuery && (
            <div className="mb-3 px-2 pt-2 pb-1">
              <p className="mb-2.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Popular topics
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_TOPICS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => selectTopic(tag)}
                    className="inline-flex items-center gap-1.5 rounded-tl-[1rem] rounded-br-[1rem] rounded-tr-xs rounded-bl-xs border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-800/90 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-[#2962D6] dark:hover:border-[#3B82F6] hover:text-[#2962D6] dark:hover:text-[#3B82F6] hover:bg-[#2962D6]/5 dark:hover:bg-[#3B82F6]/10 transition-all cursor-pointer select-none"
                  >
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isSearching && !hasAnyResults && (
            <CommandEmpty className="flex flex-col items-center gap-2.5 py-16 text-center">
              <span className="flex h-13 w-13 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200/80 dark:border-slate-700 shadow-xs">
                <SearchX size={24} />
              </span>
              <span className="text-base font-bold text-slate-800 dark:text-white">No results for “{debouncedQuery}”</span>
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 max-w-xs">
                Try searching with a different keyword, course, event, or page title.
              </span>
            </CommandEmpty>
          )}

          {hasQuery && courses.length > 0 && (
            <CommandGroup heading="Courses">
              {courses.map((course) => (
                <CommandItem
                  key={course.id}
                  value={`course-${course.id}`}
                  onSelect={() => go(courseRoutes.landing(course.id))}
                  className="py-3 px-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer group"
                >
                  <div className="h-11 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                    <ContentArt seed={course.id} kind="COURSE" categoryId={course.categoryId} title={course.title} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#2962D6] dark:group-hover:text-[#3B82F6] transition-colors">{course.title}</span>
                    <span className="truncate text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                      {course.channel?.name ? `${course.channel.name} · ` : ''}{course.moduleCount || 0} modules
                    </span>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 px-2.5 py-0.5 text-[10.5px] font-bold">
                    Course
                  </span>
                  <ArrowRight
                    size={15}
                    className="shrink-0 text-slate-300 dark:text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-[#2962D6] dark:group-hover:text-[#3B82F6]"
                  />
                </CommandItem>
              ))}
              <CommandItem
                value="course-view-all"
                onSelect={() => go(`/search?q=${encodeURIComponent(debouncedQuery)}`)}
                className="py-2.5 px-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2962D6] dark:text-[#3B82F6]">
                  <ArrowRight size={15} />
                </div>
                <span className="text-[13.5px] font-bold text-[#2962D6] dark:text-[#3B82F6]">View all course results</span>
              </CommandItem>
            </CommandGroup>
          )}

          {hasQuery && (eventResults?.content?.length ?? 0) > 0 && (
            <CommandGroup heading="Events">
              {eventResults!.content.map((event) => (
                <CommandItem
                  key={event.id}
                  value={`event-${event.id}`}
                  onSelect={() => go(`/events/${event.slug || event.id}`)}
                  className="py-3 px-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer group"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 border border-violet-100 dark:border-violet-800/60">
                    <CalendarDays size={18} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{event.title}</span>
                    <span className="truncate text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                      {event.eventType || 'Event'} {event.deliveryMode ? `· ${event.deliveryMode}` : ''}
                    </span>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-violet-50 dark:bg-violet-950/60 px-2.5 py-0.5 text-[10.5px] font-bold text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/60">
                    Event
                  </span>
                  <ArrowRight
                    size={15}
                    className="shrink-0 text-slate-300 dark:text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-600 dark:group-hover:text-violet-400"
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {visibleSections.map((section) => (
            <CommandGroup key={section.heading} heading={section.heading}>
              {section.items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={() => go(item.href)}
                  className="py-3 px-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer group flex items-center gap-3.5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all group-hover:scale-105 group-hover:bg-[#2962D6]/10 dark:group-hover:bg-[#3B82F6]/20 group-hover:text-[#2962D6] dark:group-hover:text-[#3B82F6]">
                    <item.icon size={18} strokeWidth={2.2} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#2962D6] dark:group-hover:text-[#3B82F6] transition-colors">{item.label}</span>
                    {item.subtitle && (
                      <span className="truncate text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">{item.subtitle}</span>
                    )}
                  </div>
                  <ArrowRight
                    size={15}
                    className="shrink-0 text-slate-300 dark:text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-[#2962D6] dark:group-hover:text-[#3B82F6]"
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          ))}

          {hasQuery && (
            <CommandGroup heading="Explore">
              <CommandItem
                value="search-everything"
                onSelect={() => go(`/search?q=${encodeURIComponent(debouncedQuery)}`)}
                className="py-3 px-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-[#2962D6]/10 dark:group-hover:bg-[#3B82F6]/20 group-hover:text-[#2962D6] dark:group-hover:text-[#3B82F6] transition-colors">
                  <Search size={17} strokeWidth={2.2} />
                </div>
                <span className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">
                  Search everything for <span className="font-bold text-slate-900 dark:text-white">“{debouncedQuery}”</span>
                </span>
                <ArrowRight
                  size={15}
                  className="ml-auto shrink-0 text-slate-300 dark:text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-[#2962D6] dark:group-hover:text-[#3B82F6]"
                />
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
