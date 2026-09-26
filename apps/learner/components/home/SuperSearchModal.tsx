'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { useHasAnyChannel, useStudioAccess } from '@/domains/channels';
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
export function SuperSearchModal({ open, onOpenChange, initialQuery = '' }: SuperSearchModalProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebouncedValue(query, 250);
  const hasQuery = debouncedQuery.trim().length > 0;

  useEffect(() => {
    if (open) setQuery(initialQuery);
  }, [open, initialQuery]);

  const hasChannels = useHasAnyChannel() ?? false;
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

    if (hasChannels) {
      sections.push({
        heading: 'Your Channel',
        items: [
          { id: 'my-channel', label: 'My Channel', subtitle: 'Manage your channel', href: '/manage-channels', icon: Tv, suggested: true },
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
      if (AuthorizationService.canReviewContent(user)) {
        items.push({ id: 'console-reviews', label: 'Content Reviews', href: '/console/reviews', icon: FileClock, keywords: ['console', 'approve', 'reject'] });
      }
      if (AuthorizationService.canManageContent(user)) {
        items.push({ id: 'console-content', label: 'Content Manage', href: '/console/content-manage', icon: FolderKanban, keywords: ['console', 'categories', 'suspend'] });
      }
      if (AuthorizationService.canManageExams(user)) {
        items.push({ id: 'console-exams', label: 'Exam Schedules', href: '/console/exam-schedules', icon: ClipboardCheck, keywords: ['console'] });
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
  }, [hasChannels, showStudio, showConsole, user]);

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
      className="top-[8%] sm:top-[12%] translate-y-0 w-[95vw] sm:max-w-2xl! md:max-w-3xl! gap-0 overflow-hidden rounded-2xl! sm:rounded-3xl! border border-slate-200/90 bg-white p-0 shadow-[0_30px_90px_-15px_rgba(20,20,43,0.22)]"
      showCloseButton={false}
    >
      <Command shouldFilter={false} style={{ backgroundColor: '#ffffff' }}>
        <div className="relative flex items-center gap-3.5 border-b border-slate-100/90 px-5 sm:px-6 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#4C6FFF]/10 text-[#4C6FFF]">
            <Search size={18} strokeWidth={2.2} />
          </div>
          <CommandInput
            bare
            value={query}
            onValueChange={setQuery}
            placeholder="Search courses, events, settings…"
            autoFocus
            className="h-auto flex-1 border-0 bg-transparent p-0 text-[15px] sm:text-[16px] font-medium text-[#14142b] shadow-none outline-none placeholder:text-slate-400 placeholder:font-normal focus-visible:ring-0"
          />
          {query.trim().length > 0 && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close search"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50/90 text-slate-400 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 transition-all cursor-pointer ml-1"
          >
            <X size={17} strokeWidth={2.2} />
          </button>
        </div>

        <CommandList
          style={{ backgroundColor: '#ffffff' }}
          className="max-h-[65vh] min-h-[300px] overflow-x-hidden px-3 sm:px-4 py-3"
        >
          {isSearching && (
            <div className="flex items-center gap-2 px-3 py-3 text-xs font-medium text-slate-400">
              <Loader2 size={14} className="animate-spin text-[#4C6FFF]" /> Searching…
            </div>
          )}

          {!hasQuery && (
            <div className="mb-2 px-1 pt-1">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <Sparkles size={12} className="text-[#4C6FFF]" />
                <span>Popular topics</span>
              </p>
              <div className="flex flex-wrap gap-1.5 pb-2">
                {[
                  'Web Development',
                  'Machine Learning',
                  'UI/UX Design',
                  'Cloud & DevOps',
                  'System Design',
                  'Python',
                  'Cybersecurity',
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setQuery(tag)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/70 bg-slate-50/90 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:border-[#4C6FFF]/40 hover:bg-[#4C6FFF]/5 hover:text-[#4C6FFF] transition-all cursor-pointer"
                  >
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isSearching && !hasAnyResults && (
            <CommandEmpty className="flex flex-col items-center gap-2.5 py-16 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-300 border border-slate-100">
                <SearchX size={22} />
              </span>
              <span className="text-sm font-bold text-slate-700">No results for “{debouncedQuery}”</span>
              <span className="text-xs font-medium text-slate-400">
                Try a different course, event or page name.
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
                  className="py-2.5"
                >
                  <div className="h-10 w-11 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200/60">
                    {course.coverImageUrl ? (
                      <img src={course.coverImageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 text-[#4C6FFF]">
                        <BookOpen size={16} />
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[13.5px] font-bold text-[#14142b]">{course.title}</span>
                    <span className="truncate text-xs font-medium text-slate-400">
                      {course.authorName || 'Instructor'} · {course.moduleCount || 0} modules
                    </span>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                    Course
                  </span>
                  <ArrowRight
                    size={14}
                    className="shrink-0 text-slate-300 opacity-0 transition-opacity group-data-selected/command-item:opacity-100"
                  />
                </CommandItem>
              ))}
              <CommandItem
                value="course-view-all"
                onSelect={() => go(`/search?q=${encodeURIComponent(debouncedQuery)}`)}
                className="py-2"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[#4C6FFF]">
                  <ArrowRight size={15} />
                </div>
                <span className="text-[13.5px] font-bold text-[#4C6FFF]">View all course results</span>
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
                  className="py-2.5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 border border-violet-100/80">
                    <CalendarDays size={18} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[13.5px] font-bold text-[#14142b]">{event.title}</span>
                    <span className="truncate text-xs font-medium text-slate-400">
                      {event.eventType || 'Event'} {event.deliveryMode ? `· ${event.deliveryMode}` : ''}
                    </span>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">
                    Event
                  </span>
                  <ArrowRight
                    size={14}
                    className="shrink-0 text-slate-300 opacity-0 transition-opacity group-data-selected/command-item:opacity-100"
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {visibleSections.map((section) => (
            <CommandGroup key={section.heading} heading={section.heading}>
              {section.items.map((item) => (
                <CommandItem key={item.id} value={item.id} onSelect={() => go(item.href)} className="py-2.5">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100/70 text-slate-600 transition-colors group-data-selected/command-item:bg-[#4C6FFF]/15 group-data-selected/command-item:text-[#4C6FFF]">
                    <item.icon size={17} strokeWidth={2} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[13.5px] font-bold text-[#14142b]">{item.label}</span>
                    {item.subtitle && (
                      <span className="truncate text-xs font-medium text-slate-400">{item.subtitle}</span>
                    )}
                  </div>
                  <ArrowRight
                    size={14}
                    className="shrink-0 text-slate-300 opacity-0 transition-opacity group-data-selected/command-item:opacity-100"
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          ))}

          {hasQuery && (
            <CommandGroup heading="Search">
              <CommandItem
                value="search-everything"
                onSelect={() => go(`/search?q=${encodeURIComponent(debouncedQuery)}`)}
                className="py-2.5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <Search size={15} />
                </div>
                <span className="truncate text-[13.5px] font-medium text-slate-500">
                  Search everything for <span className="font-bold text-[#14142b]">“{debouncedQuery}”</span>
                </span>
                <ArrowRight
                  size={14}
                  className="ml-auto shrink-0 text-slate-300 opacity-0 transition-opacity group-data-selected/command-item:opacity-100"
                />
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
