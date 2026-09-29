'use client';

import { useEffect, useMemo, useState } from 'react';
import { courseRoutes } from '@/shared/routes/content.routes';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Channel, ChannelContentItem, channelService } from '@/domains/channels';
import { toast } from 'sonner';
import {
  Tv,
  Settings,
  Loader2,
  ArrowLeft,
  ChevronRight,
  BookOpen,
  Wrench,
  User,
  Link as LinkIcon,
} from 'lucide-react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { getAvatarUrl } from '@/shared/utils/avatar';
import { ChannelDoodleBanner } from './manage/ChannelDoodleBanner';

// Public channel page — YouTube/Instagram-style published grid.

function TypeIcon({ type }: { type: string }) {
  if (type === 'WORKSHOP' || type === 'WEBINAR') return <Wrench size={12} />;
  return <BookOpen size={12} />;
}

function typeLabel(type: string) {
  if (type === 'WORKSHOP') return 'Event';
  if (type === 'WEBINAR') return 'Webinar';
  return 'Course';
}

function contentHref(item: ChannelContentItem) {
  const t = item.type?.toUpperCase();
  if (t === 'COURSE') return `/courses/${item.id}`;
  if (t === 'WORKSHOP' || t === 'WEBINAR') return courseRoutes.landing(item.id);
  return null;
}

function ContentTile({ item }: { item: ChannelContentItem }) {
  const href = contentHref(item);
  const inner = (
    <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-slate-100 sm:aspect-square">
      {item.coverImageUrl ? (
        <img
          src={item.coverImageUrl}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      ) : (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center"
          style={{
            background: 'linear-gradient(160deg, #EEF1F8 0%, #E4E8F2 100%)',
          }}
        >
          <span className="grid size-10 place-items-center rounded-xl bg-white/80 text-[#14142b]/50 shadow-sm">
            <TypeIcon type={item.type} />
          </span>
          <p className="line-clamp-2 text-[12px] font-bold text-[#14142b]/70">{item.title}</p>
        </div>
      )}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#14142b]/85 via-[#14142b]/20 to-transparent p-3 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
        <p className="line-clamp-2 text-[13px] font-bold text-white">{item.title}</p>
        {item.authorName && (
          <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-white/70">
            <User size={10} /> {item.authorName}
          </p>
        )}
      </div>
      <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-[#14142b]/70 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
        <TypeIcon type={item.type} />
        {typeLabel(item.type)}
      </span>
    </div>
  );

  if (!href) {
    return <div className="cursor-default">{inner}</div>;
  }

  return (
    <Link href={href} className="block outline-none transition-transform hover:-translate-y-0.5">
      {inner}
    </Link>
  );
}

type Filter = 'ALL' | 'COURSE' | 'WORKSHOP';

export default function ChannelHomePage() {
  const params = useParams();
  const router = useRouter();
  const channelId = params.id as string;
  const { user } = useAuthStore();

  const [channel, setChannel] = useState<Channel | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [items, setItems] = useState<ChannelContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('ALL');

  useEffect(() => {
    if (!channelId) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      channelService.getChannel(channelId),
      channelService.getMyChannelPermissions(channelId).catch((): string[] => []),
      channelService.getPublishedChannelContent(channelId).catch((): ChannelContentItem[] => []),
    ])
      .then(([channelData, perms, content]) => {
        if (cancelled) return;
        setChannel(channelData);
        setPermissions(perms);
        setItems(content);
      })
      .catch(() => {
        if (cancelled) return;
        toast.error('Failed to load channel');
        router.push('/manage-channels');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [channelId, router]);

  const filtered = useMemo(() => {
    if (filter === 'ALL') return items;
    if (filter === 'WORKSHOP') {
      return items.filter((i) => {
        const t = i.type?.toUpperCase();
        return t === 'WORKSHOP' || t === 'WEBINAR';
      });
    }
    return items.filter((i) => i.type?.toUpperCase() === filter);
  }, [items, filter]);

  const counts = useMemo(() => {
    let courses = 0;
    let workshops = 0;
    for (const i of items) {
      const t = i.type?.toUpperCase();
      if (t === 'COURSE') courses += 1;
      else if (t === 'WORKSHOP' || t === 'WEBINAR') workshops += 1;
    }
    return { courses, workshops, all: items.length };
  }, [items]);

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 40%, #FFFFFF 100%)' }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-[#14142b]" />
      </div>
    );
  }

  if (!channel) return null;

  const canManage =
    user?.id === channel.ownerId ||
    permissions.includes('ALL') ||
    permissions.includes('channel.settings.manage') ||
    permissions.includes('channel.staff.manage');

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: 'ALL', label: 'All', count: counts.all },
    { id: 'COURSE', label: 'Courses', count: counts.courses },
    { id: 'WORKSHOP', label: 'Events', count: counts.workshops },
  ];

  return (
    <div
      className="relative w-full min-h-screen"
      style={{
        background: 'linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 35%, #FFFFFF 70%)',
      }}
    >
      <div className="relative z-10 mx-auto w-full max-w-6xl space-y-6 px-5 pb-16 pt-32 sm:px-8 sm:pt-36">

        {/* Hero */}
        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_10px_32px_rgba(20,20,43,0.05)] dark:border-neutral-800 dark:bg-neutral-950">
          {/* Hero Banner with floating info */}
          <div className="relative group/banner w-full overflow-hidden bg-slate-900">
            <ChannelDoodleBanner
              bannerUrl={channel.bannerUrl}
              className="w-full h-56 sm:h-64 md:h-72 object-cover"
            />

            {/* Dark gradient overlay for text readability */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            {/* Floating identity & actions bar */}
            <div className="absolute bottom-0 inset-x-0 z-20 flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
              <div className="flex flex-col gap-3.5 sm:flex-row sm:items-end min-w-0">
                <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/90 bg-slate-900 text-white shadow-2xl backdrop-blur-md">
                  {channel.iconUrl ? (
                    <img
                      src={getAvatarUrl(channel.iconUrl)}
                      alt={channel.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Tv size={36} className="text-white" />
                  )}
                </div>

                <div className="min-w-0 space-y-1">
                  <h1 className="truncate text-2xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-3xl">
                    {channel.name}
                  </h1>
                  <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] font-semibold text-white/90">
                    <span className="drop-shadow">{channel.ownerName}</span>
                    <span className="text-white/40">·</span>
                    <span className="drop-shadow">
                      {items.length} {items.length === 1 ? 'published item' : 'published items'}
                    </span>
                    <span className="text-white/40">·</span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/15 backdrop-blur-md px-2.5 py-0.5 text-white shadow-xs">
                      {channel.isPersonal ? 'Personal' : 'Organization'}
                    </span>
                  </p>
                </div>
              </div>

              {canManage && (
                <Link
                  href={`/channels/${channelId}/manage`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 px-4 py-2 text-[12px] font-bold shadow-lg transition-all active:scale-95"
                >
                  <Settings size={14} />
                  Manage channel
                </Link>
              )}
            </div>
          </div>

          {(channel.description || (channel.socialLinks && channel.socialLinks.length > 0)) && (
            <div className="px-6 py-5 sm:px-7 space-y-4">
              {channel.description && (
                <p className="max-w-3xl whitespace-pre-wrap text-[13.5px] leading-relaxed text-slate-600 dark:text-neutral-300">
                  {channel.description}
                </p>
              )}

              {channel.socialLinks && channel.socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {channel.socialLinks.map((link, idx) => {
                    try {
                      const url = new URL(link);
                      const hostname = url.hostname.replace(/^www\./, '');
                      return (
                        <a
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
                        >
                          <LinkIcon size={12} />
                          {hostname}
                        </a>
                      );
                    } catch (e) {
                      return null;
                    }
                  })}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Content */}
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-xl font-bold tracking-tight text-[#14142b]">Content</h2>
            <div className="flex flex-wrap gap-1.5">
              {filters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                    filter === f.id
                      ? 'border-[#14142b] bg-[#14142b] text-white'
                      : 'border-slate-200 bg-white/90 text-slate-500 hover:border-slate-300 hover:text-[#14142b]'
                  }`}
                >
                  {f.label}
                  <span className={`ml-1.5 tabular-nums ${filter === f.id ? 'text-white/70' : 'text-slate-400'}`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-white/70 py-20 text-center">
              <BookOpen size={28} className="text-slate-300" />
              <p className="text-sm font-semibold text-[#14142b]">
                {items.length === 0 ? 'No published content yet' : 'Nothing in this filter'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
              {filtered.map((item) => (
                <ContentTile key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
