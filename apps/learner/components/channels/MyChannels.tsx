'use client';

import { useState, useEffect, useMemo } from 'react';
import { Channel, channelService } from '@/domains/channels';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { Tv, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export function MyChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchMyChannels();
  }, []);

  const isStaffUser = useMemo(() => {
    if (!user) return false;
    const hasStaffPlatformRole = user.platformRoles?.some(
      (r) => r.code?.toUpperCase() === 'STAFF' || r.name?.toUpperCase() === 'STAFF'
    );
    const hasStaffLegacyRole = user.roles?.some((r) =>
      typeof r === 'string'
        ? r.toUpperCase() === 'STAFF'
        : r.code?.toUpperCase() === 'STAFF' || r.name?.toUpperCase() === 'STAFF'
    );
    const hasStaffMembership = user.channelMemberships?.some((m) =>
      m.roles?.some(
        (r) =>
          r.code?.toUpperCase() === 'STAFF' ||
          r.name?.toUpperCase() === 'STAFF' ||
          r.name?.toLowerCase().includes('staff')
      )
    );
    return Boolean(hasStaffPlatformRole || hasStaffLegacyRole || hasStaffMembership);
  }, [user]);

  const displayedChannels = useMemo(() => {
    if (isStaffUser) {
      // Staff members only see personal channels and not organizational channels
      return channels.filter(
        (c) => c.isPersonal || c.type?.toUpperCase() === 'PERSONAL'
      );
    }
    return channels;
  }, [channels, isStaffUser]);

  const fetchMyChannels = async () => {
    try {
      setLoading(true);
      const [ownedChannels, workspaces] = await Promise.all([
        channelService.getMyChannels(),
        channelService.getMyWorkspaces(),
      ]);

      const allChannelsMap = new Map<string, Channel>();
      ownedChannels.forEach((c) => allChannelsMap.set(c.id, c));
      workspaces.forEach((c) => allChannelsMap.set(c.id, c));

      setChannels(Array.from(allChannelsMap.values()));
    } catch {
      toast.error('Failed to load your channels');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-center text-sm font-medium text-slate-400">
        Loading your channels…
      </div>
    );
  }

  if (displayedChannels.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
          <Tv size={22} className="text-slate-400" />
        </div>
        <h3 className="text-sm font-bold text-[#14142b]">No channels available</h3>
        <p className="mt-1 text-sm text-slate-400">
          {isStaffUser
            ? 'Personal channels associated with your account will appear here.'
            : 'Create your first channel from Settings to start publishing.'}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {displayedChannels.map((channel) => (
        <div
          key={channel.id}
          className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
        >
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-slate-500">
              {channel.iconUrl ? (
                <img
                  src={channel.iconUrl}
                  alt={channel.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Tv size={22} />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="truncate text-[15px] font-bold text-[#14142b]">{channel.name}</h4>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-400">
                {channel.status === 'PENDING' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-700">
                    <Clock size={11} /> Pending
                  </span>
                ) : channel.status === 'SUSPENDED' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 font-semibold text-rose-700">
                    Suspended
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
                    <CheckCircle size={11} /> Active
                  </span>
                )}
                <span>{channel.isPersonal ? 'Personal' : 'Organization'}</span>
              </p>
            </div>
          </div>
          {channel.status === 'ACTIVE' && (
            <Link
              href={`/channels/${channel.id}/manage`}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#14142b] px-3.5 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-[#232735]"
            >
              Dashboard
              <ChevronRight size={14} />
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
