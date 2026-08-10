'use client';

import { useEffect, useState } from 'react';
import { Channel, ChannelAuditLogEntry, channelService } from '@/domains/channels';
import {
  Loader2,
  Bell,
  Shield,
  User,
  Video,
  Map,
  Wrench,
  Calendar,
  Settings,
  CheckCircle2,
  Clock,
  Activity,
  Sparkles,
} from 'lucide-react';
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
    channelService
      .getChannelAuditLog(channel.id)
      .then(setLogs)
      .catch((err: any) =>
        toast.error(err.message || err.response?.data?.message || 'Failed to load notifications'),
      )
      .finally(() => setLoading(false));
  }, [channel.id]);

  const getActionTheme = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('APPROVE') || act.includes('SUCCESS') || act.includes('PUBLISH')) {
      return {
        icon: <CheckCircle2 className="text-emerald-600" size={16} />,
        bg: 'bg-emerald-50 border-emerald-200/80',
        badgeBg: 'bg-emerald-100/80 text-emerald-800 border-emerald-200/60',
      };
    }
    if (act.includes('CONTENT') || act.includes('COURSE') || act.includes('VIDEO')) {
      return {
        icon: <Video className="text-indigo-600" size={16} />,
        bg: 'bg-indigo-50 border-indigo-200/80',
        badgeBg: 'bg-indigo-100/80 text-indigo-800 border-indigo-200/60',
      };
    }
    if (act.includes('ROADMAP')) {
      return {
        icon: <Map className="text-teal-600" size={16} />,
        bg: 'bg-teal-50 border-teal-200/80',
        badgeBg: 'bg-teal-100/80 text-teal-800 border-teal-200/60',
      };
    }
    if (act.includes('WORKSHOP') || act.includes('WEBINAR')) {
      return {
        icon: <Wrench className="text-amber-600" size={16} />,
        bg: 'bg-amber-50 border-amber-200/80',
        badgeBg: 'bg-amber-100/80 text-amber-800 border-amber-200/60',
      };
    }
    if (act.includes('STAFF') || act.includes('ROLE') || act.includes('SHIELD')) {
      return {
        icon: <Shield className="text-purple-600" size={16} />,
        bg: 'bg-purple-50 border-purple-200/80',
        badgeBg: 'bg-purple-100/80 text-purple-800 border-purple-200/60',
      };
    }
    if (act.includes('SETTING') || act.includes('UPDATE')) {
      return {
        icon: <Settings className="text-sky-600" size={16} />,
        bg: 'bg-sky-50 border-sky-200/80',
        badgeBg: 'bg-sky-100/80 text-sky-800 border-sky-200/60',
      };
    }
    return {
      icon: <Bell className="text-blue-600" size={16} />,
      bg: 'bg-blue-50 border-blue-200/80',
      badgeBg: 'bg-blue-100/80 text-blue-800 border-blue-200/60',
    };
  };

  const isSuperUser = user?.platformRoles?.some(
    (r) => r.code === 'SUPER_ADMIN' || r.code === 'PLATFORM_MANAGER',
  );
  const isOwner = user?.id === channel.ownerId;

  const filteredLogs = logs.filter((log) => {
    if (isSuperUser || isOwner) return true;
    return log.actorId === user?.id;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-700 text-white shadow-md">
            <Bell size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-0.5">
              <span>Channel Audit Log</span>
              <span className="inline-block h-1 w-1 rounded-full bg-indigo-400" />
              <span>Real-Time Activity</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#14142b] tracking-tight">
              Channel Notifications & Activity
            </h2>
          </div>
        </div>

        {filteredLogs.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-extrabold text-indigo-700 border border-indigo-200/70 shadow-2xs">
              {filteredLogs.length} Events Logged
            </span>
          </div>
        )}
      </div>

      {/* Audit Log Activity Feed Card */}
      <div className="space-y-3">
        {loading ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-12 flex flex-col items-center justify-center shadow-2xs">
            <Loader2 className="h-7 w-7 animate-spin text-indigo-600 mb-2" />
            <p className="text-xs font-bold text-slate-500">Loading channel audit activity...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-2xs">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs">
              <Bell className="h-6 w-6" />
            </div>
            <h3 className="text-base font-extrabold text-[#14142b]">No notifications yet</h3>
            <p className="mt-1 text-xs font-medium text-slate-500 max-w-sm mx-auto">
              Administrative actions, status updates, and staff events will automatically appear here.
            </p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-2xs">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-slate-50 text-slate-500 border border-slate-200/80 shadow-2xs">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-base font-extrabold text-[#14142b]">No recent activity found</h3>
            <p className="mt-1 text-xs font-medium text-slate-500 max-w-sm mx-auto">
              There are no notifications matching your staff access permissions.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => {
              const theme = getActionTheme(log.action);
              return (
                <div
                  key={log.id}
                  className="group relative rounded-2xl border border-slate-200/80 bg-gradient-to-r from-white via-white to-slate-50/50 p-4 shadow-[0_4px_15px_rgba(20,20,43,0.03)] hover:shadow-[0_8px_25px_rgba(79,70,229,0.08)] hover:border-indigo-200/90 transition-all duration-200 flex items-start gap-4 cursor-default"
                >
                  <div
                    className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl border shadow-2xs transition-transform duration-200 group-hover:scale-105 ${theme.bg}`}
                  >
                    {theme.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#14142b]">
                      <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-slate-900 border border-slate-200/60 font-black">
                        {log.actorName || 'System'}
                      </span>
                      <span className="text-slate-700 font-semibold">
                        {log.details || log.action.replace(/_/g, ' ').toLowerCase()}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-0.5 border border-slate-200/60 text-slate-500 font-bold">
                        <Clock size={11} className="text-slate-400" />
                        {new Date(log.createdAt).toLocaleString(undefined, {
                          month: 'numeric',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
