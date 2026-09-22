'use client';

import { useEffect, useMemo, useState } from 'react';
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
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';
import { useHasAnyChannel, useStudioAccess } from '@/domains/channels';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { usePublicCoursesPage } from '@/shared/hooks/usePublicCourses';
import { getPublishedEvents } from '@/app/(public)/events/api/event.service';
import { Dialog, DialogOverlay, DialogPortal } from '@/shared/design-system/ui/dialog';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';

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

  // Custom keyboard navigation manager
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const container = e.currentTarget;
      const items = Array.from(
        container.querySelectorAll<HTMLElement>('input, button[data-search-item="true"]')
      );
      if (items.length === 0) return;

      const activeElement = document.activeElement as HTMLElement;
      const currentIndex = items.indexOf(activeElement);

      let nextIndex = 0;
      if (e.key === 'ArrowDown') {
        nextIndex = currentIndex === -1 || currentIndex === items.length - 1 ? 0 : currentIndex + 1;
      } else {
        nextIndex = currentIndex === -1 || currentIndex === 0 ? items.length - 1 : currentIndex - 1;
      }

      items[nextIndex]?.focus();
      
      // Ensure the focused item scrolls into view nicely
      if (items[nextIndex].tagName !== 'INPUT') {
        items[nextIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  };

  const itemClassName = "group relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm outline-none select-none transition-all duration-150 focus-visible:bg-gradient-to-br focus-visible:from-violet-600 focus-visible:to-blue-600 focus-visible:shadow-md hover:bg-gradient-to-br hover:from-violet-600 hover:to-blue-600 hover:shadow-md";
  const groupClassName = "overflow-hidden px-1.5 py-2 text-foreground";
  const groupHeadingClassName = "px-2 pb-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-slate-400";
  const groupItemsClassName = "flex flex-col gap-0.5";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay 
          className="bg-white/55 dark:bg-black/55 z-[100]" 
          style={{ backdropFilter: 'blur(14px) saturate(110%)', WebkitBackdropFilter: 'blur(14px) saturate(110%)' }}
        />
        <DialogPrimitive.Popup
          className="fixed top-[10%] left-1/2 z-[100] grid w-[94vw] max-w-2xl -translate-x-1/2 gap-0 overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-0 shadow-[0_24px_70px_-12px_rgba(20,20,43,0.28)] outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
        >
          <div 
            className="flex size-full flex-col overflow-hidden bg-white text-slate-900"
            onKeyDown={handleKeyDown}
          >
            {/* Input Header */}
            <div className="relative flex items-center gap-3 border-b border-slate-100 px-5 py-4">
              <Search size={18} strokeWidth={2.2} className="shrink-0 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses, events, settings…"
                autoFocus
                className="h-auto flex-1 border-0 bg-transparent p-0 text-[15px] font-medium text-[#14142b] shadow-none outline-none placeholder:text-slate-400 placeholder:font-normal focus-visible:ring-0"
              />
              <kbd className="hidden shrink-0 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-1 text-[10px] font-semibold text-slate-400 sm:block">
                ESC
              </kbd>
            </div>

            {/* List Body */}
            <div className="max-h-[60vh] min-h-[280px] overflow-x-hidden overflow-y-auto px-2.5 py-2 outline-none no-scrollbar scroll-py-1">
              {isSearching && (
                <div className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-slate-400">
                  <Loader2 size={13} className="animate-spin" /> Searching…
                </div>
              )}

              {!isSearching && !hasAnyResults && (
                <div className="flex flex-col items-center gap-2.5 py-16 text-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                    <SearchX size={20} />
                  </span>
                  <span className="text-sm font-bold text-slate-700">No results for “{debouncedQuery}”</span>
                  <span className="text-xs font-medium text-slate-400">
                    Try a different course, event or page name.
                  </span>
                </div>
              )}

              {hasQuery && courses.length > 0 && (
                <div className={groupClassName}>
                  <div className={groupHeadingClassName}>Courses</div>
                  <div className={groupItemsClassName}>
                    {courses.map((course) => (
                      <button
                        key={course.id}
                        data-search-item="true"
                        tabIndex={0}
                        onClick={() => go(`/learn/${course.id}`)}
                        className={itemClassName}
                      >
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          {course.coverImageUrl ? (
                            <img src={course.coverImageUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-300">
                              <BookOpen size={16} />
                            </div>
                          )}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col text-left">
                          <span className="truncate text-[13.5px] font-bold text-[#14142b] transition-colors group-hover:text-white group-focus-visible:text-white">{course.title}</span>
                          <span className="truncate text-xs font-medium text-slate-400 transition-colors group-hover:text-blue-100 group-focus-visible:text-blue-100">
                            {course.authorName || 'Course'}
                          </span>
                        </div>
                        <ArrowRight size={14} className="shrink-0 text-slate-300 opacity-0 transition-all group-focus-visible:opacity-100 group-hover:opacity-100 group-hover:text-white group-focus-visible:text-white" />
                      </button>
                    ))}
                    <button
                      data-search-item="true"
                      tabIndex={0}
                      onClick={() => go(`/search?q=${encodeURIComponent(debouncedQuery)}`)}
                      className={itemClassName}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-[#4C6FFF] transition-colors group-hover:bg-white/20 group-hover:text-white group-focus-visible:bg-white/20 group-focus-visible:text-white">
                        <ArrowRight size={15} />
                      </div>
                      <span className="text-[13.5px] text-left font-bold text-[#4C6FFF] transition-colors group-hover:text-white group-focus-visible:text-white">View all course results</span>
                    </button>
                  </div>
                </div>
              )}

              {hasQuery && (eventResults?.content?.length ?? 0) > 0 && (
                <div className={groupClassName}>
                  <div className={groupHeadingClassName}>Events</div>
                  <div className={groupItemsClassName}>
                    {eventResults!.content.map((event) => (
                      <button
                        key={event.id}
                        data-search-item="true"
                        tabIndex={0}
                        onClick={() => go(`/events/${event.slug || event.id}`)}
                        className={itemClassName}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 transition-colors group-hover:bg-white/20 group-hover:text-white group-focus-visible:bg-white/20 group-focus-visible:text-white">
                          <CalendarDays size={16} />
                        </div>
                        <span className="truncate text-left text-[13.5px] font-bold text-[#14142b] transition-colors group-hover:text-white group-focus-visible:text-white">{event.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {visibleSections.map((section) => (
                <div key={section.heading} className={groupClassName}>
                  <div className={groupHeadingClassName}>{section.heading}</div>
                  <div className={groupItemsClassName}>
                    {section.items.map((item) => (
                      <button 
                        key={item.id} 
                        data-search-item="true"
                        tabIndex={0}
                        onClick={() => go(item.href)}
                        className={itemClassName}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 transition-colors group-hover:bg-white/20 group-hover:text-white group-focus-visible:bg-white/20 group-focus-visible:text-white">
                          <item.icon size={17} strokeWidth={2} />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col text-left">
                          <span className="truncate text-[13.5px] font-bold text-[#14142b] transition-colors group-hover:text-white group-focus-visible:text-white">{item.label}</span>
                          {item.subtitle && (
                            <span className="truncate text-xs font-medium text-slate-400 transition-colors group-hover:text-blue-100 group-focus-visible:text-blue-100">{item.subtitle}</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {hasQuery && (
                <div className={groupClassName}>
                  <div className={groupHeadingClassName}>Search</div>
                  <div className={groupItemsClassName}>
                    <button
                      data-search-item="true"
                      tabIndex={0}
                      onClick={() => go(`/search?q=${encodeURIComponent(debouncedQuery)}`)}
                      className={itemClassName}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 transition-colors group-hover:bg-white/20 group-hover:text-white group-focus-visible:bg-white/20 group-focus-visible:text-white">
                        <Search size={15} />
                      </div>
                      <span className="truncate text-left text-[13.5px] font-medium text-slate-500 transition-colors group-hover:text-white group-focus-visible:text-white">
                        Search everything for <span className="font-bold text-[#14142b] transition-colors group-hover:text-white group-focus-visible:text-white">“{debouncedQuery}”</span>
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-[11px] font-semibold text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <ArrowUp size={11} /> <ArrowDown size={11} /> Navigate
                </span>
                <span className="flex items-center gap-1">
                  <CornerDownLeft size={11} /> Select
                </span>
              </div>
              <span className="text-[#4C6FFF]">Arcade Search</span>
            </div>
          </div>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}
