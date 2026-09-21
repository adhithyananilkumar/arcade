'use client';

import { useState, useEffect, useCallback } from 'react';
import { Channel, channelService, CreateChannelModal } from '@/domains/channels';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { Tv, Clock, CheckCircle, ChevronRight, Plus, Users, Crown, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

type Row = Channel & { relationship: 'OWNER' | 'STAFF' };

/**
 * Every channel the current user is part of — the ones they own (active or still awaiting
 * platform approval) and the organisation channels they staff. The backend already scopes each
 * list to what the caller may see, so nothing is filtered client-side.
 */
export function MyChannels() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { user } = useAuthStore();

  const fetchMyChannels = useCallback(async () => {
    try {
      setLoading(true);
      const [ownedChannels, pendingRequests, workspaces] = await Promise.all([
        channelService.getMyChannels(),
        channelService.getMyChannelRequests().catch((): Channel[] => []),
        channelService.getMyWorkspaces(),
      ]);

      const byId = new Map<string, Row>();
      [...ownedChannels, ...pendingRequests].forEach((c) => byId.set(c.id, { ...c, relationship: 'OWNER' }));
      workspaces.forEach((c) => {
        if (!byId.has(c.id)) byId.set(c.id, { ...c, relationship: 'STAFF' });
      });

      setRows(Array.from(byId.values()));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load your channels');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyChannels();
  }, [fetchMyChannels]);

  const ownsPersonalChannel = rows.some(
    (c) =>
      c.relationship === 'OWNER' &&
      c.isPersonal &&
      c.status !== 'SUSPENDED' &&
      c.status !== 'REJECTED'
  );

  const createButton = (
    <button
      type="button"
      onClick={() => setIsCreateOpen(true)}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
    >
      <Plus size={14} /> Create Channel
    </button>
  );

  if (loading) {
    return (
      <div className="space-y-3 py-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3.5 animate-pulse">
            <div className="h-12 w-12 rounded-xl bg-slate-100" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-1/3 rounded bg-slate-100" />
              <div className="h-3 w-1/5 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {rows.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
            <Tv size={22} className="text-slate-400" />
          </div>
          <h3 className="text-sm font-bold text-[#14142b]">No channels yet</h3>
          <p className="mt-1 mb-5 text-sm text-slate-400">
            A channel is where your content lives. Start with a personal channel, or an organisation channel if you work with a team.
          </p>
          {createButton}
        </div>
      ) : (
        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-slate-500">
              {rows.length} {rows.length === 1 ? 'channel' : 'channels'}
              {!ownsPersonalChannel && ' · you can still create a personal channel'}
            </p>
            {createButton}
          </div>
          <div className="divide-y divide-slate-100">
            {rows.map((channel) => (
              <div
                key={channel.id}
                className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-slate-500">
                    {channel.iconUrl ? (
                      <img src={channel.iconUrl} alt={channel.name} className="h-full w-full object-cover" />
                    ) : (
                      <Tv size={22} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="truncate text-[15px] font-bold text-[#14142b]">{channel.name}</h4>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-400">
                      {channel.status === 'PENDING' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-700">
                          <Clock size={11} /> Awaiting approval
                        </span>
                      ) : channel.status === 'SUSPENDED' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 font-semibold text-rose-700">
                          Suspended
                        </span>
                      ) : channel.status === 'REJECTED' ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-600"
                          title={channel.rejectionReason || undefined}
                        >
                          <XCircle size={11} /> Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
                          <CheckCircle size={11} /> Active
                        </span>
                      )}
                      <span>{channel.isPersonal ? 'Personal' : 'Organization'}</span>
                      <span className="inline-flex items-center gap-1">
                        {channel.relationship === 'OWNER' ? <Crown size={11} /> : <Users size={11} />}
                        {channel.relationship === 'OWNER' ? 'Owner' : 'Staff'}
                      </span>
                      {channel.status === 'PENDING' && channel.createdAt && (
                        <span>Requested {new Date(channel.createdAt).toLocaleDateString()}</span>
                      )}
                      {channel.status === 'REJECTED' && channel.rejectionReason && (
                        <span className="truncate max-w-[220px]">{channel.rejectionReason}</span>
                      )}
                    </p>
                  </div>
                </div>
                {channel.status !== 'PENDING' && channel.status !== 'REJECTED' && (
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
        </div>
      )}

      <CreateChannelModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchMyChannels}
      />
    </>
  );
}
