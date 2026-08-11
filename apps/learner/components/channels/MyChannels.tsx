'use client';

import { useState, useEffect, useMemo } from 'react';
import { Channel, channelService } from '@/domains/channels';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const GRADIENT_BORDERS = [
  'from-purple-500 via-indigo-500 to-blue-500',
  'from-blue-500 via-cyan-400 to-teal-400',
  'from-pink-500 via-purple-500 to-indigo-500',
  'from-indigo-500 via-violet-500 to-purple-500',
  'from-teal-400 via-emerald-500 to-cyan-500',
  'from-purple-600 via-pink-500 to-rose-400',
];

export function MyChannels() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<'all' | 'personal' | 'organization'>('all');

  useEffect(() => {
    fetchMyChannels();
  }, []);

  const fetchMyChannels = async () => {
    try {
      setLoading(true);
      const [ownedChannels, workspaces] = await Promise.all([
        channelService.getMyChannels().catch(() => []),
        channelService.getMyWorkspaces().catch(() => []),
      ]);

      const allChannelsMap = new Map<string, Channel>();
      ownedChannels.forEach((c) => allChannelsMap.set(c.id, c));
      workspaces.forEach((c) => allChannelsMap.set(c.id, c));

      const allChannels = Array.from(allChannelsMap.values());
      setChannels(allChannels);
    } catch {
      toast.error('Failed to load your channels');
    } finally {
      setLoading(false);
    }
  };

  const personalChannel = useMemo(() => {
    return channels.find((c) => c.isPersonal);
  }, [channels]);

  const rawOrganizationChannels = useMemo(() => {
    return channels.filter((c) => !c.isPersonal);
  }, [channels]);

  const filteredOrganizationChannels = useMemo(() => {
    if (!searchQuery.trim()) return rawOrganizationChannels;
    const query = searchQuery.toLowerCase();
    return rawOrganizationChannels.filter((c) =>
      c.name.toLowerCase().includes(query)
    );
  }, [rawOrganizationChannels, searchQuery]);

  const allChannelsList = useMemo(() => {
    const list: Channel[] = [];
    if (personalChannel) {
      list.push(personalChannel);
    }
    list.push(...rawOrganizationChannels);

    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase();
    return list.filter((c) => c.name.toLowerCase().includes(query));
  }, [personalChannel, rawOrganizationChannels, searchQuery]);

  const getUserRole = (channel: Channel): string => {
    if (channel.ownerId === user?.id || channel.isPersonal) {
      return 'Owner';
    }
    if (user?.channelMemberships) {
      const membership = user.channelMemberships.find(
        (m) =>
          m.channelId === channel.id ||
          m.channelName?.toLowerCase() === channel.name?.toLowerCase()
      );
      if (membership?.roles && membership.roles.length > 0) {
        const roleNames = membership.roles.map(
          (r) => r.name?.toUpperCase() || r.code?.toUpperCase() || ''
        );
        if (roleNames.some((r) => r.includes('ADMIN'))) return 'Admin';
        if (roleNames.some((r) => r.includes('OWNER'))) return 'Owner';
        if (roleNames.some((r) => r.includes('STAFF'))) return 'Staff';
        return membership.roles[0].name || 'Member';
      }
    }
    return 'Member';
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <div className="h-3.5 w-28 animate-pulse rounded bg-slate-200/80" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-44 w-full animate-pulse rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-3.5 w-44 animate-pulse rounded bg-slate-200/80" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-slate-200/70" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-44 w-full animate-pulse rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs" />
            <div className="h-44 w-full animate-pulse rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs" />
            <div className="h-44 w-full animate-pulse rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ==================== TOP TOOLBAR (FILTER TABS & SEARCH SIDE-BY-SIDE) ==================== */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter Buttons (First) */}
        <div className="flex items-center gap-2">
          {(['all', 'personal', 'organization'] as const).map((filter) => {
            const isActive = channelFilter === filter;
            const label =
              filter === 'all'
                ? 'All'
                : filter === 'personal'
                ? 'Personal'
                : 'Organization';
            return (
              <button
                key={filter}
                onClick={() => setChannelFilter(filter)}
                className={`rounded-xl px-4 py-2 text-[13px] font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-purple-100 text-purple-800 border border-purple-200 font-bold shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-purple-50/70 hover:border-purple-200 hover:text-purple-700'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Search Input (Right of Buttons) */}
        <div className="relative w-full sm:w-72">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search channels..."
            className="w-full rounded-xl border-2 border-slate-300 bg-white pl-10 pr-4 py-2 text-[13px] font-medium text-slate-900 placeholder-slate-400 shadow-sm outline-none transition-all duration-200 hover:border-slate-400 focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-500/10"
          />
        </div>
      </div>

      {/* ==================== ALL CHANNELS VIEW (UNCLASSIFIED REGULAR CARDS) ==================== */}
      {channelFilter === 'all' && (
        <div>
          {allChannelsList.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {allChannelsList.map((channel, index) => {
                const role = getUserRole(channel);
                const gradient = GRADIENT_BORDERS[index % GRADIENT_BORDERS.length];
                return (
                  <div
                    key={channel.id}
                    onClick={() => router.push(`/channels/${channel.id}/manage`)}
                    className={`group cursor-pointer rounded-2xl p-[1px] bg-gradient-to-r ${gradient} shadow-xs transition-all duration-200 ease-out hover:-translate-y-[2px] hover:shadow-md`}
                  >
                    <div className="flex h-full flex-col justify-between rounded-[15px] bg-white p-5">
                      <div className="space-y-2">
                        <h3 className="text-[17px] font-bold text-[#14142b] transition-colors duration-200 group-hover:text-purple-700">
                          {channel.name}
                        </h3>
                        <div className="space-y-0.5 text-[13px] font-medium text-slate-500">
                          <p>Status: Active</p>
                          <p>Role: {role}</p>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center gap-1 text-[13px] font-semibold text-slate-600 transition-colors duration-200 group-hover:text-purple-600">
                        <span>Open channel</span>
                        <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[13px] text-slate-500 px-1">
              {searchQuery
                ? 'No channels match your search.'
                : 'You are not currently associated with any channels.'}
            </p>
          )}
        </div>
      )}

      {/* ==================== PERSONAL CHANNEL ONLY VIEW ==================== */}
      {channelFilter === 'personal' && (
        <section className="space-y-3">
          <div className="px-1">
            <h2 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Your Channel
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {personalChannel ? (
              <div
                onClick={() => router.push(`/channels/${personalChannel.id}/manage`)}
                className="group cursor-pointer rounded-2xl p-[1px] bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 shadow-xs transition-all duration-200 ease-out hover:-translate-y-[2px] hover:shadow-md"
              >
                <div className="flex h-full flex-col justify-between rounded-[15px] bg-white p-5">
                  <div className="space-y-2">
                    <h3 className="text-[17px] font-bold text-[#14142b] transition-colors duration-200 group-hover:text-purple-700">
                      {personalChannel.name}
                    </h3>
                    <div className="space-y-0.5 text-[13px] font-medium text-slate-500">
                      <p>Status: Active</p>
                      <p>Role: {getUserRole(personalChannel)}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-1 text-[13px] font-semibold text-slate-600 transition-colors duration-200 group-hover:text-purple-600">
                    <span>Open channel</span>
                    <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[13px] text-slate-500 px-1">You do not have a personal channel.</p>
            )}
          </div>
        </section>
      )}

      {/* ==================== ORGANIZATION CHANNELS ONLY VIEW ==================== */}
      {channelFilter === 'organization' && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <h2 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Organization Channels
            </h2>
            <span className="text-[11px] font-bold text-slate-400">
              {rawOrganizationChannels.length} channels
            </span>
          </div>

          {filteredOrganizationChannels.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredOrganizationChannels.map((channel, index) => {
                const role = getUserRole(channel);
                const gradient = GRADIENT_BORDERS[index % GRADIENT_BORDERS.length];
                return (
                  <div
                    key={channel.id}
                    onClick={() => router.push(`/channels/${channel.id}/manage`)}
                    className={`group cursor-pointer rounded-2xl p-[1px] bg-gradient-to-r ${gradient} shadow-xs transition-all duration-200 ease-out hover:-translate-y-[2px] hover:shadow-md`}
                  >
                    <div className="flex h-full flex-col justify-between rounded-[15px] bg-white p-5">
                      <div className="space-y-2">
                        <h3 className="text-[17px] font-bold text-[#14142b] transition-colors duration-200 group-hover:text-purple-700">
                          {channel.name}
                        </h3>
                        <div className="space-y-0.5 text-[13px] font-medium text-slate-500">
                          <p>Status: Active</p>
                          <p>Role: {role}</p>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center gap-1 text-[13px] font-semibold text-slate-600 transition-colors duration-200 group-hover:text-purple-600">
                        <span>Open channel</span>
                        <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[13px] text-slate-500 px-1">
              {searchQuery
                ? 'No organization channels match your search.'
                : 'You are not currently associated with any organization channels.'}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
