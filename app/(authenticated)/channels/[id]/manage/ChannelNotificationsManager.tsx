'use client';

import { useEffect, useState } from 'react';
import { Channel, ChannelAuditLogEntry, channelService } from '@/domains/channels';
import { Loader2, Bell, Shield, User, Video, Map, Wrench, Calendar, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/infrastructure/auth/auth.store';

interface Props {
  channel: Channel;
}

export function ChannelNotificationsManager({ channel }: Props) {
  const [logs, setLogs] = useState<ChannelAuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    channelService.getChannelAuditLog(channel.id)
      .then(setLogs)
      .catch((err: any) => toast.error(err.message || err.response?.data?.message || 'Failed to load notifications'))
      .finally(() => setLoading(false));
  }, [channel.id]);

  const getActionIcon = (action: string) => {
    if (action.includes('CONTENT') || action.includes('COURSE')) return <Video className="text-indigo-500" size={16} />;
    if (action.includes('ROADMAP')) return <Map className="text-emerald-500" size={16} />;
    if (action.includes('WORKSHOP') || action.includes('WEBINAR')) return <Wrench className="text-amber-500" size={16} />;
    if (action.includes('STAFF') || action.includes('ROLE')) return <Shield className="text-rose-500" size={16} />;
    if (action.includes('SETTING') || action.includes('UPDATE')) return <Settings className="text-slate-500" size={16} />;
    return <Bell className="text-blue-500" size={16} />;
  };

  const isSuperUser = user?.platformRoles?.some((r) => r.code === 'SUPER_ADMIN' || r.code === 'PLATFORM_MANAGER');
  const isOwner = user?.id === channel.ownerId;

  const filteredLogs = logs.filter((log) => {
    if (isSuperUser || isOwner) return true;
    
    // For regular users: only show logs where they are the actor.
    // (Note: ChannelAuditLog currently does not track content ownership directly,
    // so this guarantees they only see actions they performed or relate to them).
    return log.actorId === user?.id;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#14142b]">Channel Notifications & Activity</h2>
          <p className="text-sm text-slate-500">
            A log of administrative events and channel actions.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-1 shadow-[0_4px_20px_rgba(20,20,43,0.03)]">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 rounded-full bg-slate-50 p-4">
              <Bell className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-700">No notifications yet</h3>
            <p className="mt-1 text-sm text-slate-500">
              Activity in this channel will appear here.
            </p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 rounded-full bg-slate-50 p-4">
              <Bell className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-700">No recent activity found</h3>
            <p className="mt-1 text-sm text-slate-500">
              There are no notifications matching your permissions.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex gap-4 p-4 hover:bg-slate-50/50 transition-colors">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100">
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] text-slate-700">
                    <strong className="font-semibold text-slate-900">{log.actorName || 'System'}</strong>
                    {' '}{log.details || log.action.replace(/_/g, ' ').toLowerCase()}
                  </p>
                  <p className="mt-0.5 text-[11.5px] font-medium text-slate-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
