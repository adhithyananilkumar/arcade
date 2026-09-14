'use client';

import { useEffect, useState } from 'react';
import { Channel, ChannelAuditLogEntry, channelService } from '@/domains/channels';
import {
  Loader2,
  Bell,
  Shield,
  Video,
  Map,
  Wrench,
  Settings,
  CheckCircle2,
  Clock,
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

  const getActionTheme = (action: string, idx: number) => {
    const act = action.toUpperCase();

    // Bow & Ribbon Banner Cut Shapes matching reference image
    const shapes = [
      'rounded-l-2xl [clip-path:polygon(0_0,100%_0,calc(100%-24px)_50%,100%_100%,0_100%)]', // Inward V-Notch Bow Ribbon Tail
      'rounded-l-2xl [clip-path:polygon(0_0,calc(100%-24px)_0,100%_50%,calc(100%-24px)_100%,0_100%)]', // Pointed Chevron Ribbon Bow Tail
      '[clip-path:polygon(22px_0,calc(100%-22px)_0,100%_50%,calc(100%-22px)_100%,22px_100%,0_50%)]', // Double Symmetric Ribbon Banner Cut
    ];

    const currentShape = shapes[idx % shapes.length];

    if (act.includes('APPROVE') || act.includes('SUCCESS') || act.includes('PUBLISH')) {
      return {
        icon: <CheckCircle2 className="text-emerald-600 shrink-0" size={18} />,
        border: 'border border-emerald-200/90',
        shadow: 'shadow-[4px_-4px_0px_0px_#a7f3d0]',
        bg: 'bg-emerald-50/90 text-emerald-700 border border-emerald-200/80',
        cardBg: 'bg-gradient-to-r from-emerald-50/60 via-white to-emerald-100/50',
        badgeBg: 'bg-emerald-100/90 text-emerald-800 border border-emerald-200/80 font-bold',
        shape: currentShape,
        category: 'Approval Event',
      };
    }
    if (act.includes('DELETE') || act.includes('REMOVE') || act.includes('SUSPEND') || act.includes('REVOKE')) {
      return {
        icon: <Sparkles className="text-rose-600 shrink-0" size={18} />,
        border: 'border border-rose-200/90',
        shadow: 'shadow-[4px_-4px_0px_0px_#fecdd3]',
        bg: 'bg-rose-50/90 text-rose-700 border border-rose-200/80',
        cardBg: 'bg-gradient-to-r from-rose-50/60 via-white to-rose-100/50',
        badgeBg: 'bg-rose-100/90 text-rose-800 border border-rose-200/80 font-bold',
        shape: currentShape,
        category: 'Security Alert',
      };
    }
    if (act.includes('CONTENT') || act.includes('COURSE') || act.includes('VIDEO')) {
      return {
        icon: <Video className="text-blue-600 shrink-0" size={18} />,
        border: 'border border-blue-200/90',
        shadow: 'shadow-[4px_-4px_0px_0px_#bae6fd]',
        bg: 'bg-blue-50/90 text-blue-700 border border-blue-200/80',
        cardBg: 'bg-gradient-to-r from-blue-50/60 via-white to-blue-100/50',
        badgeBg: 'bg-blue-100/90 text-blue-800 border border-blue-200/80 font-bold',
        shape: currentShape,
        category: 'Content Update',
      };
    }
    if (act.includes('STAFF') || act.includes('ROLE') || act.includes('SHIELD')) {
      return {
        icon: <Shield className="text-purple-600 shrink-0" size={18} />,
        border: 'border border-purple-200/90',
        shadow: 'shadow-[4px_-4px_0px_0px_#e9d5ff]',
        bg: 'bg-purple-50/90 text-purple-700 border border-purple-200/80',
        cardBg: 'bg-gradient-to-r from-purple-50/60 via-white to-purple-100/50',
        badgeBg: 'bg-purple-100/90 text-purple-800 border border-purple-200/80 font-bold',
        shape: currentShape,
        category: 'Staff Policy',
      };
    }
    if (act.includes('SETTING') || act.includes('UPDATE')) {
      return {
        icon: <Settings className="text-sky-600 shrink-0" size={18} />,
        border: 'border border-sky-200/90',
        shadow: 'shadow-[4px_-4px_0px_0px_#bae6fd]',
        bg: 'bg-sky-50/90 text-sky-700 border border-sky-200/80',
        cardBg: 'bg-gradient-to-r from-sky-50/60 via-white to-sky-100/50',
        badgeBg: 'bg-sky-100/90 text-sky-800 border border-sky-200/80 font-bold',
        shape: currentShape,
        category: 'System Setting',
      };
    }

    const fallbackThemes = [
      {
        icon: <Bell className="text-blue-600 shrink-0" size={18} />,
        border: 'border border-blue-200/90',
        shadow: 'shadow-[4px_-4px_0px_0px_#bae6fd]',
        bg: 'bg-blue-50/90 text-blue-700 border border-blue-200/80',
        cardBg: 'bg-gradient-to-r from-blue-50/60 via-white to-blue-100/50',
        badgeBg: 'bg-blue-100/90 text-blue-800 border border-blue-200/80 font-bold',
        shape: currentShape,
        category: 'Activity Log',
      },
      {
        icon: <Bell className="text-amber-600 shrink-0" size={18} />,
        border: 'border border-amber-200/90',
        shadow: 'shadow-[4px_-4px_0px_0px_#fde68a]',
        bg: 'bg-amber-50/90 text-amber-800 border border-amber-200/80',
        cardBg: 'bg-gradient-to-r from-amber-50/60 via-white to-amber-100/50',
        badgeBg: 'bg-amber-100/90 text-amber-900 border border-amber-200/80 font-bold',
        shape: currentShape,
        category: 'Activity Log',
      },
      {
        icon: <Bell className="text-emerald-600 shrink-0" size={18} />,
        border: 'border border-emerald-200/90',
        shadow: 'shadow-[4px_-4px_0px_0px_#a7f3d0]',
        bg: 'bg-emerald-50/90 text-emerald-700 border border-emerald-200/80',
        cardBg: 'bg-gradient-to-r from-emerald-50/60 via-white to-emerald-100/50',
        badgeBg: 'bg-emerald-100/90 text-emerald-800 border border-emerald-200/80 font-bold',
        shape: currentShape,
        category: 'Activity Log',
      },
    ];
    return fallbackThemes[idx % fallbackThemes.length];
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-sky-600 to-slate-900 text-white shadow-xs">
            <Bell size={20} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#14142b] tracking-tight">
              Channel Notifications & Activity
            </h2>
          </div>
        </div>

        {filteredLogs.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-50/90 px-3.5 py-1.5 text-xs font-extrabold text-blue-700 border border-blue-200/80 shadow-2xs">
              {filteredLogs.length} Events Logged
            </span>
          </div>
        )}
      </div>

      {/* Audit Log Activity Feed Cards with Lighter Soft Pastel Bow Ribbon Shapes */}
      <div className="space-y-4">
        {loading ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-12 flex flex-col items-center justify-center shadow-2xs">
            <Loader2 className="h-7 w-7 animate-spin text-blue-600 mb-2" />
            <p className="text-xs font-extrabold text-slate-500">Loading channel audit activity...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-2xs">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
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
          <div className="space-y-4">
            {filteredLogs.map((log, idx) => {
              const theme = getActionTheme(log.action, idx);
              return (
                <div
                  key={log.id}
                  className={`group relative ${theme.shape} ${theme.border} ${theme.cardBg} p-4.5 sm:p-5 sm:pr-10 ${theme.shadow} transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 my-2 [filter:drop-shadow(0_4px_12px_rgba(20,20,43,0.04))]`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl border shadow-2xs ${theme.bg}`}>
                      {theme.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5 text-xs">
                        <span className={`rounded-lg px-2.5 py-1 text-xs border ${theme.badgeBg}`}>
                          {log.actorName || 'System'}
                        </span>
                        <span className="text-sm font-bold text-slate-800 truncate">
                          {log.details || log.action.replace(/_/g, ' ').toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dashed Ticket Break Divider Line */}
                  <div className="hidden md:block h-8 border-r-2 border-dashed border-slate-200/80" />

                  <div className="shrink-0 self-end md:self-center pr-2 sm:pr-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 border border-slate-200/80 text-xs font-bold text-slate-600 shadow-2xs">
                      <Clock size={13} className="text-slate-400" />
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
