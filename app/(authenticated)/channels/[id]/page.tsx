'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Channel, ChannelContentItem, channelService } from '@/domains/channels';
import { toast } from 'sonner';
import { Tv, Settings, Loader2, ArrowLeft, BookOpen, Map, Wrench, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/infrastructure/auth/auth.store';

// ── Channel home — the public-facing "channel page" any user, staff member, or the owner
// lands on: branding + a YouTube/Instagram-style grid of everything this channel has actually
// published. Distinct from /manage, which is the owner/staff settings & staff-roster surface.

function TypeIcon({ type }: { type: string }) {
  if (type === 'ROADMAP') return <Map size={12} />;
  if (type === 'WORKSHOP') return <Wrench size={12} />;
  return <BookOpen size={12} />;
}

function ContentTile({ item }: { item: ChannelContentItem }) {
  const isCourse = item.type === 'COURSE';
  const inner = (
    <div className="group relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
      {item.coverImageUrl ? (
        <img
          src={item.coverImageUrl}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-300">
          <TypeIcon type={item.type} />
        </div>
      )}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100 p-3">
        <p className="text-white text-sm font-semibold line-clamp-2">{item.title}</p>
        {item.authorName && (
          <p className="text-white/70 text-xs mt-0.5 flex items-center gap-1">
            <User size={10} /> {item.authorName}
          </p>
        )}
      </div>
      <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
        <TypeIcon type={item.type} />
        {item.type === 'COURSE' ? 'Course' : item.type === 'ROADMAP' ? 'Roadmap' : 'Workshop'}
      </span>
    </div>
  );

  return isCourse ? (
    <Link href={`/courses/${item.id}`} className="block">
      {inner}
    </Link>
  ) : (
    <div className="cursor-default">{inner}</div>
  );
}

export default function ChannelHomePage() {
  const params = useParams();
  const router = useRouter();
  const channelId = params.id as string;
  const { user } = useAuthStore();

  const [channel, setChannel] = useState<Channel | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [items, setItems] = useState<ChannelContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!channelId) return;
    setLoading(true);
    Promise.all([
      channelService.getChannel(channelId),
      channelService.getMyChannelPermissions(channelId).catch((): string[] => []),
      channelService.getPublishedChannelContent(channelId).catch((): ChannelContentItem[] => []),
    ])
      .then(([channelData, perms, content]) => {
        setChannel(channelData);
        setPermissions(perms);
        setItems(content);
      })
      .catch(() => {
        toast.error('Failed to load channel');
        router.push('/');
      })
      .finally(() => setLoading(false));
  }, [channelId]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!channel) return null;

  const canManage =
    user?.id === channel.ownerId ||
    permissions.includes('ALL') ||
    permissions.includes('channel.settings.manage') ||
    permissions.includes('channel.staff.manage');

  return (
    <div className="w-full space-y-8 pb-12">
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      {/* Channel Banner & Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-100"
      >
        {channel.bannerUrl ? (
          <div className="h-48 w-full">
            <img src={channel.bannerUrl} alt={`${channel.name} banner`} className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="h-48 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        )}

        <div className="px-4 sm:px-8 pb-8">
          <div className="flex flex-col md:flex-row gap-6 md:items-end md:justify-between -mt-12 mb-6">
            <div className="flex flex-col md:flex-row gap-6 md:items-end flex-1">
              <div className="h-24 w-24 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-full border-4 border-white bg-indigo-50 flex items-center justify-center shadow-md">
                {channel.iconUrl ? (
                  <img src={channel.iconUrl} alt={channel.name} className="h-full w-full object-cover" />
                ) : (
                  <Tv size={48} className="text-indigo-300" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{channel.name}</h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 font-medium">
                  <span>{channel.ownerName}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{items.length} {items.length === 1 ? 'item' : 'items'}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{channel.isPersonal ? 'Personal Channel' : 'Organization Channel'}</span>
                </div>
              </div>
            </div>

            {canManage && (
              <div className="flex shrink-0 gap-3 mt-4 md:mt-0">
                <button
                  onClick={() => router.push(`/channels/${channelId}/manage`)}
                  className="flex items-center gap-2 rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-200"
                >
                  <Settings size={18} />
                  Manage Channel
                </button>
              </div>
            )}
          </div>

          {channel.description && (
            <div className="max-w-3xl">
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{channel.description}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Content grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-base font-semibold text-gray-800 mb-4">Content</h2>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center rounded-2xl border border-dashed border-gray-200">
            <BookOpen size={28} className="text-gray-300" />
            <p className="text-sm font-medium text-gray-500">No published content yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {items.map((item) => (
              <ContentTile key={item.id} item={item} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
