/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import {
  Channel,
  ChannelContentItem,
  ChannelSummary,
  channelService,
  useChannelCountsQuery,
  useChannelSummariesQuery,
  useInvalidateChannelAdmin,
} from "@/domains/channels";
import {
  Search,
  Check,
  X,
  Tv,
  ShieldOff,
  ShieldCheck,
  BookOpen,
  AlertTriangle,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  SlidersHorizontal,
  User,
  Building2,
  LayoutGrid,
  List,
  Calendar,
  FileText,
  UserCircle2,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from "@/domains/identity";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/design-system/ui/dialog';
import { cn } from '@/shared/utils/utils';
import { getAvatarUrl } from '@/shared/utils/avatar';

type StatusFilter = 'ALL' | 'PENDING' | 'ACTIVE' | 'SUSPENDED';
type TypeFilter = 'ALL' | 'PERSONAL' | 'ORGANIZATION';
type ViewMode = 'GRID' | 'TABLE';

const TYPE_OPTIONS = [
  { id: 'ALL', label: 'All Types', icon: SlidersHorizontal },
  { id: 'PERSONAL', label: 'Personal Channels', icon: User },
  { id: 'ORGANIZATION', label: 'Organization Channels', icon: Building2 },
];

export function PendingChannels() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const statusParam = searchParams.get('status')?.toUpperCase();
  const statusFilter: StatusFilter =
    statusParam === 'ALL'
      ? 'ALL'
      : statusParam === 'ACTIVE'
      ? 'ACTIVE'
      : statusParam === 'SUSPENDED'
      ? 'SUSPENDED'
      : 'PENDING';

  const typeParam = searchParams.get('type')?.toUpperCase();
  const typeFilter: TypeFilter =
    typeParam === 'PERSONAL'
      ? 'PERSONAL'
      : typeParam === 'ORGANIZATION'
      ? 'ORGANIZATION'
      : 'ALL';

  const [viewMode, setViewMode] = useState<ViewMode>('TABLE');
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const invalidateChannelAdmin = useInvalidateChannelAdmin();

  const channelIdParam = searchParams.get('channel') || null;
  const [selectedRow, setSelectedRow] = useState<ChannelSummary | null>(null);
  const selectedChannelId = channelIdParam || selectedRow?.id || null;

  const updateParams = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, val]) => {
      if (val === null) {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    });
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const setStatusFilter = (newStatus: StatusFilter) => {
    updateParams({
      status: newStatus === 'PENDING' ? null : newStatus.toLowerCase(),
      page: null,
    });
  };

  const setTypeFilter = (newType: TypeFilter) => {
    updateParams({
      type: newType === 'ALL' ? null : newType.toLowerCase(),
      page: null,
    });
  };

  const openChannelDetails = (channel: ChannelSummary) => {
    setSelectedRow(channel);
    updateParams({ channel: channel.id });
  };

  const closeChannelDetails = () => {
    setSelectedRow(null);
    updateParams({ channel: null });
  };

  const [searchQuery, setSearchQuery] = useState('');

  // Pagination. `page` stays 1-based for the existing controls; the API is 0-based.
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Debounced so typing in the search box does not issue a request per keystroke now that search
  // is served by the backend.
  const debouncedSearch = useDebouncedValue(searchQuery.trim(), 300);

  // The table is served one page at a time, filtered and searched in the database. All of that
  // used to happen in the browser over the full channel list — 2.5 MB for 4,042 rows plus 775 KB
  // of pending requests, to render eight.
  const {
    channels: pageChannels,
    totalElements,
    totalPages: serverTotalPages,
    isLoading: loading,
    isFetching,
  } = useChannelSummariesQuery({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    type: typeFilter === 'ALL' ? undefined : typeFilter,
    search: debouncedSearch || undefined,
    page: page - 1,
    size: pageSize,
  });

  // The stat tiles show every status at once, so they come from a grouped count rather than from
  // counting over a list that would then have to be complete.
  const counts = useChannelCountsQuery();

  // Dialog states
  const [suspendTarget, setSuspendTarget] = useState<ChannelSummary | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendForce, setSuspendForce] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<ChannelSummary | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
  const [channelContent, setChannelContent] = useState<ChannelContentItem[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [hardDeleteTarget, setHardDeleteTarget] = useState<ChannelSummary | null>(null);
  const [hardDeleteReason, setHardDeleteReason] = useState('');
  const [hardDeleteConfirmText, setHardDeleteConfirmText] = useState('');
  const [hardDeleteAcknowledged, setHardDeleteAcknowledged] = useState(false);
  const [hardDeleteSubmitting, setHardDeleteSubmitting] = useState(false);

  const { hasPermission } = usePermissions();
  const canApprove = hasPermission('platform.channels.manage');
  const canSuspend = hasPermission('platform.channels.manage');

  // Close type dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setTypeDropdownOpen(false);
      }
    }
    if (typeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [typeDropdownOpen]);

  // The drawer's full record, fetched for the one channel that is open. Cached by id, so
  // reopening a row the admin already looked at is instant.
  const { data: selectedChannel } = useQuery({
    queryKey: ['channel-detail', selectedChannelId],
    enabled: Boolean(selectedChannelId),
    queryFn: () => channelService.getChannel(selectedChannelId!),
    // Falls back to the row while the full record loads, so the drawer opens with the name, icon
    // and status already on screen instead of empty.
    placeholderData: selectedRow ? ({ ...selectedRow } as unknown as Channel) : undefined,
  });

  useEffect(() => {
    if (!selectedChannelId) {
      setChannelContent([]);
      return;
    }
    setContentLoading(true);
    channelService
      .getChannelContent(selectedChannelId)
      .then(setChannelContent)
      .catch(() => toast.error('Failed to load channel content'))
      .finally(() => setContentLoading(false));
  }, [selectedChannelId]);

  const handleAccept = async (id: string) => {
    try {
      await channelService.acceptChannelRequest(id);
      toast.success('Channel request accepted');
      invalidateChannelAdmin();
    } catch {
      toast.error('Failed to accept request');
    }
  };

  const openRejectDialog = (channel: ChannelSummary) => {
    setRejectTarget(channel);
    setRejectReason('');
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      toast.error('A reason is required to reject a channel request');
      return;
    }
    setRejectSubmitting(true);
    try {
      await channelService.deleteChannelRequest(rejectTarget.id, rejectReason.trim());
      toast.success('Channel request rejected — the owner has been notified');
      setRejectTarget(null);
      closeChannelDetails();
      invalidateChannelAdmin();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reject request');
    } finally {
      setRejectSubmitting(false);
    }
  };

  const openSuspendDialog = (channel: ChannelSummary) => {
    setSuspendTarget(channel);
    setSuspendReason('');
    setSuspendForce(false);
  };

  const confirmSuspend = async () => {
    if (!suspendTarget) return;
    if (!suspendReason.trim()) {
      toast.error('A reason is required to suspend a channel');
      return;
    }
    try {
      await channelService.suspendChannel(suspendTarget.id, suspendReason.trim(), suspendForce);
      toast.success(
        suspendForce
          ? 'Channel suspended — content unlisted immediately'
          : 'Channel suspended — content will be unlisted within 6 months'
      );
      setSuspendTarget(null);
      closeChannelDetails();
      invalidateChannelAdmin();
    } catch {
      toast.error('Failed to suspend channel');
    }
  };

  const openHardDeleteDialog = (channel: ChannelSummary) => {
    setHardDeleteTarget(channel);
    setHardDeleteReason('');
    setHardDeleteConfirmText('');
    setHardDeleteAcknowledged(false);
  };

  const confirmHardDelete = async () => {
    if (!hardDeleteTarget) return;
    if (!hardDeleteReason.trim()) {
      toast.error('A reason is required to permanently delete a channel');
      return;
    }
    if (hardDeleteConfirmText !== hardDeleteTarget.name) {
      toast.error('Type the channel name exactly to confirm');
      return;
    }
    if (!hardDeleteAcknowledged) {
      toast.error('You must acknowledge the consequences before proceeding');
      return;
    }
    setHardDeleteSubmitting(true);
    try {
      await channelService.hardDeleteChannel(hardDeleteTarget.id, hardDeleteReason.trim(), hardDeleteConfirmText);
      toast.success('Channel permanently deleted');
      setHardDeleteTarget(null);
      closeChannelDetails();
      invalidateChannelAdmin();
    } catch (err) {
      // The backend explains refusals (e.g. records that are kept permanently); show that reason.
      toast.error(err instanceof Error && err.message ? err.message : 'Failed to permanently delete channel');
    } finally {
      setHardDeleteSubmitting(false);
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      await channelService.reactivateChannel(id);
      toast.success('Channel reactivated');
      invalidateChannelAdmin();
    } catch {
      toast.error('Failed to reactivate channel');
    }
  };

  const paginatedChannels = pageChannels;
  const totalPages = serverTotalPages || 1;

  // Any filter change restarts at the first page — otherwise a narrower filter can leave the
  // table on a page that no longer exists.
  useEffect(() => {
    setPage(1);
  }, [statusFilter, typeFilter, debouncedSearch]);

  // Clean owner subtitle display helper
  const getOwnerSubtitle = (channel: ChannelSummary) => {
    if (channel.ownerUsername) return `@${channel.ownerUsername}`;
    if (channel.ownerEmail && !channel.ownerEmail.startsWith('owner-') && channel.ownerEmail.includes('@')) {
      return channel.ownerEmail;
    }
    return 'Channel Owner';
  };

  return (
    <div className="space-y-4">
      {/* Unified Enterprise Toolbar Dock */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-full border border-slate-200/80 bg-surface/80 p-1.5 shadow-xs backdrop-blur-md">
        {/* Status Filter Segmented Control */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'PENDING', label: 'Pending Requests', count: counts.pending },
            { id: 'ALL', label: 'All Channels', count: counts.total },
            { id: 'ACTIVE', label: 'Active', count: counts.active },
            { id: 'SUSPENDED', label: 'Suspended', count: counts.suspended },
          ].map((item) => {
            const isActive = statusFilter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setStatusFilter(item.id as any)}
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold tracking-tight transition-colors ${isActive
                    ? 'bg-slate-950 text-on-ink shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
              >
                <span>{item.label}</span>
                <span
                  className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${isActive
                      ? 'bg-on-ink/20 text-on-ink'
                      : 'bg-slate-200/80 text-slate-600'
                    }`}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Type Filter & View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Custom Type Filter Dropdown */}
          <div className="relative" ref={typeDropdownRef}>
            <button
              type="button"
              onClick={() => setTypeDropdownOpen((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-full border bg-surface px-3 py-1.5 text-xs font-semibold shadow-2xs transition-all ${typeDropdownOpen
                  ? 'border-slate-400 ring-2 ring-slate-100 text-slate-900'
                  : 'border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
            >
              <SlidersHorizontal size={13} className="text-slate-400" />
              <span>
                {typeFilter === 'ALL'
                  ? 'All Types'
                  : typeFilter === 'PERSONAL'
                    ? 'Personal'
                    : 'Organization'}
              </span>
              <ChevronDown
                size={13}
                className={`text-slate-400 transition-transform duration-200 ${typeDropdownOpen ? 'rotate-180 text-slate-700' : ''
                  }`}
              />
            </button>

            {typeDropdownOpen && (
              <div className="absolute left-0 top-full z-50 mt-1.5 min-w-[190px] rounded-2xl border border-slate-200/90 bg-surface p-1.5 shadow-[0_12px_30px_rgba(20,20,43,0.12)] backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-100">
                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Channel Type
                </div>
                <div className="space-y-0.5">
                  {TYPE_OPTIONS.map((option) => {
                    const isSelected = typeFilter === option.id;
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setTypeFilter(option.id as TypeFilter);
                          setTypeDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-colors ${isSelected
                            ? 'bg-slate-100 text-slate-900 font-bold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon size={13} className={isSelected ? 'text-slate-900' : 'text-slate-400'} />
                          <span>{option.label}</span>
                        </div>
                        {isSelected && <Check size={13} className="text-slate-900 stroke-[2.5]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input
              type="text"
              placeholder="Search channel or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-200/90 bg-surface py-1.5 pl-8 pr-7 text-xs font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* View Mode Switcher */}
          <div className="inline-flex items-center rounded-full border border-slate-200/90 bg-slate-100/80 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('GRID')}
              className={`flex size-7 items-center justify-center rounded-full transition-all ${viewMode === 'GRID'
                  ? 'bg-surface text-slate-900 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700'
                }`}
              title="Card Grid view"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`flex size-7 items-center justify-center rounded-full transition-all ${viewMode === 'TABLE'
                  ? 'bg-surface text-slate-900 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700'
                }`}
              title="List view"
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Cards or Table */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-surface py-20 text-center shadow-[0_2px_12px_rgba(20,20,43,0.03)]">
          <div className="flex flex-col items-center justify-center gap-2.5">
            <div className="size-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
            <span className="text-xs font-medium text-slate-500">Loading channels...</span>
          </div>
        </div>
      ) : paginatedChannels.length === 0 ? (
        <div className="py-20 px-6 text-center">
          <div className="flex flex-col items-center justify-center gap-2.5 max-w-sm mx-auto">
            <div className="mb-2 flex size-16 items-center justify-center rounded-3xl bg-gradient-to-b from-sky-50 via-indigo-50/80 to-sky-100/60 p-3 shadow-xs border border-sky-100/80 dark:from-sky-500/10 dark:to-indigo-500/15 dark:border-sky-500/20 dark:via-indigo-500/10">
              <Tv size={26} className="text-indigo-600 dark:text-indigo-400 stroke-[1.8]" />
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">No channels found</h3>
            <p className="text-xs font-medium leading-relaxed text-slate-500">
              {searchQuery || typeFilter !== 'ALL'
                ? 'No channels match the current search or type filter.'
                : statusFilter === 'PENDING'
                  ? 'No pending channel requests requiring review.'
                  : 'No channels found under this view.'}
            </p>
            {(searchQuery || typeFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('ALL');
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-xs font-bold text-on-ink shadow-xs transition-transform hover:scale-[1.02] active:scale-[0.98] hover:bg-slate-800"
              >
                <RotateCcw size={13} />
                <span>Reset filters</span>
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'GRID' ? (
        /* New Modern Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginatedChannels.map((channel) => {
            const isPending = channel.status === 'PENDING';
            const isActive = channel.status === 'ACTIVE';
            const isSuspended = channel.status === 'SUSPENDED';
            const isRejected = channel.status === 'REJECTED';

            return (
              <div
                key={channel.id}
                onClick={() => openChannelDetails(channel)}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-surface p-5 shadow-[0_2px_10px_rgba(20,20,43,0.03)] hover:border-slate-300 hover:shadow-[0_8px_24px_rgba(20,20,43,0.06)] hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                {/* Card Top: Avatar, Name, Badges */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200/90 text-slate-700 overflow-hidden shrink-0 border border-slate-200/80 shadow-2xs group-hover:scale-105 transition-transform font-bold text-sm">
                        {channel.iconUrl ? (
                          <img
                            src={getAvatarUrl(channel.iconUrl)}
                            alt={channel.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Tv size={18} className="text-slate-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors leading-snug dark:group-hover:text-blue-400">
                          {channel.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold border ${channel.isPersonal
                                ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-300'
                                : 'border-slate-200 bg-slate-50 text-slate-700'
                              }`}
                          >
                            {channel.isPersonal ? <User size={10} /> : <Building2 size={10} />}
                            {channel.isPersonal ? 'Personal' : 'Organization'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold border ${isActive
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300'
                          : isSuspended
                            ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300'
                            : isRejected
                              ? 'border-slate-200 bg-slate-100 text-slate-600'
                              : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300'
                        }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${isActive
                            ? 'bg-emerald-500'
                            : isSuspended
                              ? 'bg-rose-500'
                              : isRejected
                                ? 'bg-slate-400'
                                : 'bg-amber-500'
                          }`}
                      />
                      {channel.status || 'PENDING'}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[32px]">
                    {channel.description || 'No channel description provided.'}
                  </p>

                  {/* Owner & Date chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                    <div className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 border border-slate-200/60 max-w-[150px]">
                      <User size={11} className="text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-700 truncate">{channel.ownerName || 'Owner'}</span>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 border border-slate-200/60">
                      <Calendar size={11} className="text-slate-400 shrink-0" />
                      <span>
                        {channel.createdAt
                          ? new Date(channel.createdAt).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Action Buttons */}
                <div
                  className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1.5 flex-1">
                    {/* Pending Actions */}
                    {isPending && (
                      <>
                        {canApprove && (
                          <button
                            type="button"
                            onClick={() => handleAccept(channel.id)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-ink hover:bg-ink-hover px-3 py-1.5 text-xs font-semibold text-on-ink shadow-xs transition-all"
                            title="Approve channel"
                          >
                            <Check size={12} className="text-emerald-400" strokeWidth={3} />
                            <span>Approve</span>
                          </button>
                        )}
                        {canSuspend && (
                          <button
                            type="button"
                            onClick={() => openRejectDialog(channel)}
                            className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-surface px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors dark:border-rose-500/25 dark:text-rose-400 dark:hover:bg-rose-500/10 dark:hover:border-rose-500/40"
                            title="Reject channel"
                          >
                            <X size={12} strokeWidth={2.5} />
                            <span>Reject</span>
                          </button>
                        )}
                      </>
                    )}

                    {/* Active Actions */}
                    {isActive && (
                      <>
                        <a
                          href={`/channels/${channel.id}/manage`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-surface px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        >
                          <ExternalLink size={12} />
                          <span>Manage</span>
                        </a>
                        {canSuspend && (
                          <button
                            type="button"
                            onClick={() => openSuspendDialog(channel)}
                            className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-surface px-2 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors dark:border-rose-500/25 dark:text-rose-400 dark:hover:bg-rose-500/10"
                            title="Suspend channel"
                          >
                            <ShieldOff size={12} />
                            <span>Suspend</span>
                          </button>
                        )}
                      </>
                    )}

                    {/* Suspended Actions */}
                    {isSuspended && (
                      <>
                        {canSuspend && (
                          <button
                            type="button"
                            onClick={() => handleReactivate(channel.id)}
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                          >
                            <ShieldCheck size={12} />
                            <span>Reactivate</span>
                          </button>
                        )}
                        <a
                          href={`/channels/${channel.id}/manage`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-surface px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <ExternalLink size={12} />
                          <span>Manage</span>
                        </a>
                      </>
                    )}
                  </div>

                  {/* View Details Button */}
                  <button
                    type="button"
                    onClick={() => openChannelDetails(channel)}
                    className="inline-flex size-8 items-center justify-center rounded-xl border border-slate-200/90 bg-surface text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors shrink-0"
                    title="View details"
                  >
                    <Eye size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Modern Enterprise Data Table */
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-surface shadow-[0_4px_24px_-4px_rgba(20,20,43,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/75 backdrop-blur-xs text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-6 font-semibold">Channel</th>
                  <th className="py-3.5 px-4 font-semibold">Type</th>
                  <th className="py-3.5 px-4 font-semibold">Owner</th>
                  <th className="py-3.5 px-4 font-semibold">Submitted</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedChannels.map((channel) => {
                  const isPending = channel.status === 'PENDING';
                  const isActive = channel.status === 'ACTIVE';
                  const isSuspended = channel.status === 'SUSPENDED';
                  const isRejected = channel.status === 'REJECTED';
                  const ownerName = channel.ownerName || 'Owner';
                  const ownerInitial = (channel.ownerName || channel.name || 'O').charAt(0).toUpperCase();

                  return (
                    <tr
                      key={channel.id}
                      onClick={() => openChannelDetails(channel)}
                      className="group cursor-pointer hover:bg-slate-50/80 transition-all duration-150"
                    >
                      {/* Channel Column */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 via-slate-50 to-indigo-100/70 text-indigo-600 overflow-hidden shrink-0 border border-indigo-200/50 shadow-2xs group-hover:scale-105 group-hover:border-indigo-300 transition-all dark:from-indigo-500/10 dark:to-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/25 dark:group-hover:border-indigo-500/40">
                            {channel.iconUrl ? (
                              <img
                                src={getAvatarUrl(channel.iconUrl)}
                                alt={channel.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Tv size={17} className="text-indigo-600 dark:text-indigo-400" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-[260px]">
                            <p className="truncate text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight dark:group-hover:text-indigo-400">
                              {channel.name}
                            </p>
                            <p className="truncate text-[11px] text-slate-400 font-normal mt-0.5">
                              {channel.description || 'No description provided'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type Column */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${channel.isPersonal
                              ? 'border-sky-200/80 bg-sky-50 text-sky-700 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-300'
                              : 'border-purple-200/80 bg-purple-50 text-purple-700 dark:border-purple-500/25 dark:bg-purple-500/10 dark:text-purple-300'
                            }`}
                        >
                          {channel.isPersonal ? (
                            <User size={11} className="text-sky-500" />
                          ) : (
                            <Building2 size={11} className="text-purple-500" />
                          )}
                          {channel.isPersonal ? 'Personal' : 'Organization'}
                        </span>
                      </td>

                      {/* Owner Column */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5 min-w-0 max-w-[200px]">
                          <div className="flex size-7 items-center justify-center rounded-full bg-gradient-to-tr from-slate-100 to-slate-200/90 text-slate-700 font-bold text-[11px] border border-slate-200/80 shrink-0">
                            {ownerInitial}
                          </div>
                          <div className="min-w-0 truncate">
                            <p className="truncate text-xs font-semibold text-slate-800">
                              {ownerName}
                            </p>
                            <p className="truncate text-[10.5px] text-slate-400 font-mono">
                              {getOwnerSubtitle(channel)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Submitted Date Column */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                          <Calendar size={12} className="text-slate-400 shrink-0" />
                          <span>
                            {channel.createdAt
                              ? new Date(channel.createdAt).toLocaleDateString('en-US', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })
                              : '—'}
                          </span>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border ${isActive
                              ? 'border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300'
                              : isSuspended
                                ? 'border-rose-200/80 bg-rose-50 text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300'
                                : isRejected
                                  ? 'border-slate-200/80 bg-slate-100 text-slate-600'
                                  : 'border-amber-200/80 bg-amber-50 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300'
                            }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${isActive
                                ? 'bg-emerald-500'
                                : isSuspended
                                  ? 'bg-rose-500'
                                  : isRejected
                                    ? 'bg-slate-400'
                                    : 'bg-amber-500 animate-pulse'
                              }`}
                          />
                          {channel.status || 'PENDING'}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-6 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {isPending && (
                            <>
                              {canApprove && (
                                <button
                                  type="button"
                                  onClick={() => handleAccept(channel.id)}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-ink hover:bg-ink-hover px-3.5 py-1.5 text-xs font-semibold text-on-ink shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                                  title="Approve channel"
                                >
                                  <Check size={12} className="text-emerald-400" strokeWidth={3} />
                                  <span>Approve</span>
                                </button>
                              )}
                              {canSuspend && (
                                <button
                                  type="button"
                                  onClick={() => openRejectDialog(channel)}
                                  className="inline-flex items-center gap-1 rounded-xl border border-rose-200/90 bg-surface px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-300 shadow-2xs hover:scale-[1.02] active:scale-[0.98] transition-all dark:border-rose-500/25 dark:text-rose-400 dark:hover:bg-rose-500/10 dark:hover:border-rose-500/40"
                                  title="Reject channel"
                                >
                                  <X size={12} strokeWidth={2.5} />
                                  <span>Reject</span>
                                </button>
                              )}
                            </>
                          )}

                          {isActive && (
                            <>
                              <a
                                href={`/channels/${channel.id}/manage`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-surface px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
                              >
                                <ExternalLink size={12} />
                                <span>Manage</span>
                              </a>
                              {canSuspend && (
                                <button
                                  type="button"
                                  onClick={() => openSuspendDialog(channel)}
                                  className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-surface px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors shadow-2xs dark:border-rose-500/25 dark:text-rose-400 dark:hover:bg-rose-500/10"
                                  title="Suspend channel"
                                >
                                  <ShieldOff size={12} />
                                  <span>Suspend</span>
                                </button>
                              )}
                            </>
                          )}

                          {isSuspended && (
                            <>
                              {canSuspend && (
                                <button
                                  type="button"
                                  onClick={() => handleReactivate(channel.id)}
                                  className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                                  title="Reactivate channel"
                                >
                                  <ShieldCheck size={12} />
                                  <span>Reactivate</span>
                                </button>
                              )}
                              <a
                                href={`/channels/${channel.id}/manage`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-surface px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                              >
                                <ExternalLink size={12} />
                                <span>Manage</span>
                              </a>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => openChannelDetails(channel)}
                            className="inline-flex size-8 items-center justify-center rounded-xl border border-slate-200/90 bg-surface text-slate-400 hover:text-slate-800 hover:bg-slate-100 hover:border-slate-300 transition-all"
                            title="View channel details"
                          >
                            <Eye size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Clean Footer Pagination */}
      {totalElements > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-surface px-5 py-3 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 shadow-2xs">
          <div>
            Showing <span className="font-semibold text-slate-800">{(page - 1) * pageSize + 1}</span>–
            <span className="font-semibold text-slate-800">
              {Math.min(page * pageSize, totalElements)}
            </span>{' '}
            of <span className="font-semibold text-slate-800">{totalElements}</span> channels
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-surface px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={13} />
                <span>Prev</span>
              </button>
              <span className="px-2 text-xs font-semibold text-slate-700">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-surface px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next</span>
                <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal: Channel Details */}
      <Dialog open={Boolean(selectedChannelId)} onOpenChange={(open) => !open && closeChannelDetails()}>
        <DialogContent className="max-w-4xl lg:max-w-5xl w-[94vw] p-6 sm:p-8 max-h-[90vh] overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden rounded-2xl border border-slate-200 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">Channel Overview</DialogTitle>
          </DialogHeader>

          {selectedChannel ? (
            <div className="space-y-5 mt-2">
              {/* Channel Header Banner/Avatar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex size-13 items-center justify-center rounded-xl bg-surface text-slate-700 overflow-hidden shrink-0 border border-slate-200/80 shadow-2xs">
                    {selectedChannel.iconUrl ? (
                      <img
                        src={getAvatarUrl(selectedChannel.iconUrl)}
                        alt={selectedChannel.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Tv size={24} className="text-slate-500" />
                    )}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug truncate">
                      {selectedChannel.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium border border-slate-200 bg-surface text-slate-600">
                        {selectedChannel.isPersonal ? 'Personal' : 'Organization'}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium border ${selectedChannel.status === 'ACTIVE'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300'
                            : selectedChannel.status === 'SUSPENDED'
                              ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300'
                              : selectedChannel.status === 'REJECTED'
                                ? 'border-slate-200 bg-slate-100 text-slate-600'
                                : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300'
                          }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${selectedChannel.status === 'ACTIVE'
                              ? 'bg-emerald-500'
                              : selectedChannel.status === 'SUSPENDED'
                                ? 'bg-rose-500'
                                : selectedChannel.status === 'REJECTED'
                                  ? 'bg-slate-400'
                                  : 'bg-amber-500'
                            }`}
                        />
                        {selectedChannel.status || 'PENDING'}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedChannel.createdAt && (
                  <div className="text-left sm:text-right shrink-0">
                    <span className="block text-[11px] font-medium text-slate-400">Submitted</span>
                    <span className="text-xs font-medium text-slate-600">
                      {new Date(selectedChannel.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </span>
                  </div>
                )}
              </div>

              {/* Description & Purpose Side-by-Side on Desktop */}
              {(selectedChannel.description || selectedChannel.purpose) && (
                <div className={cn(
                  "grid gap-4",
                  selectedChannel.description && selectedChannel.purpose
                    ? "grid-cols-1 md:grid-cols-2"
                    : "grid-cols-1"
                )}>
                  {selectedChannel.description && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Description
                      </h4>
                      <p className="text-sm text-slate-700 leading-relaxed bg-surface p-3.5 rounded-xl border border-slate-200 min-h-[72px]">
                        {selectedChannel.description}
                      </p>
                    </div>
                  )}
                  {selectedChannel.purpose && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Purpose
                      </h4>
                      <p className="text-sm text-slate-700 leading-relaxed bg-surface p-3.5 rounded-xl border border-slate-200 min-h-[72px]">
                        {selectedChannel.purpose}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Suspension Reason */}
              {selectedChannel.status === 'SUSPENDED' && selectedChannel.suspensionReason && (
                <div className="space-y-1 bg-rose-50 p-3.5 rounded-xl border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/25">
                  <h4 className="text-xs font-semibold text-rose-800 flex items-center gap-1.5 dark:text-rose-200">
                    <AlertTriangle size={13} /> Suspension Reason
                  </h4>
                  <p className="text-xs text-rose-700 dark:text-rose-300">{selectedChannel.suspensionReason}</p>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedChannel.status === 'REJECTED' && selectedChannel.rejectionReason && (
                <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <AlertTriangle size={13} /> Rejection Reason
                  </h4>
                  <p className="text-xs text-slate-600">{selectedChannel.rejectionReason}</p>
                </div>
              )}

              {/* Applicant Details */}
              {selectedChannel.applicantProfile && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <UserCircle2 size={13} className="text-slate-400" /> Applicant Details
                  </h4>
                  <div className="rounded-xl border border-slate-200 bg-surface p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5 text-left">
                      <div>
                        <span className="block text-[11px] font-medium text-slate-500 mb-0.5">Full Name</span>
                        <span className="text-sm font-medium text-slate-900 break-words">
                          {selectedChannel.applicantProfile.fullName || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[11px] font-medium text-slate-500 mb-0.5">Email</span>
                        <span className="text-sm font-medium text-slate-900 break-all">
                          {selectedChannel.applicantProfile.email || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[11px] font-medium text-slate-500 mb-0.5">Phone</span>
                        <span className="text-sm font-medium text-slate-900">
                          {selectedChannel.applicantProfile.phoneNumber || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[11px] font-medium text-slate-500 mb-0.5">Date of Birth</span>
                        <span className="text-sm font-medium text-slate-900">
                          {selectedChannel.applicantProfile.dateOfBirth || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[11px] font-medium text-slate-500 mb-0.5">Gender</span>
                        <span className="text-sm font-medium text-slate-900 capitalize">
                          {selectedChannel.applicantProfile.gender ? selectedChannel.applicantProfile.gender.toLowerCase().replace(/_/g, ' ') : '—'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[11px] font-medium text-slate-500 mb-0.5">Nationality</span>
                        <span className="text-sm font-medium text-slate-900">
                          {selectedChannel.applicantProfile.nationality || '—'}
                        </span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="block text-[11px] font-medium text-slate-500 mb-0.5">Address</span>
                        <span className="text-sm font-medium text-slate-900 break-words leading-snug">
                          {[
                            selectedChannel.applicantProfile.address,
                            selectedChannel.applicantProfile.city,
                            selectedChannel.applicantProfile.state,
                            selectedChannel.applicantProfile.country,
                            selectedChannel.applicantProfile.pinCode,
                          ]
                            .filter(Boolean)
                            .join(', ') || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[11px] font-medium text-slate-500 mb-0.5">ID Proof Type</span>
                        <span className="text-sm font-medium text-slate-900">
                          {selectedChannel.applicantProfile.personalIdProofType || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[11px] font-medium text-slate-500 mb-0.5">ID Proof Number</span>
                        <span className="text-sm font-mono font-medium text-slate-900 tracking-tight">
                          {selectedChannel.applicantProfile.personalIdProofNumber || '—'}
                        </span>
                      </div>
                      {selectedChannel.applicantProfile.personalIdProofDocumentUrl && (
                        <div className="sm:col-span-2 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[11px] font-medium text-slate-500">ID Proof Document</span>
                          <a
                            href={selectedChannel.applicantProfile.personalIdProofDocumentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#205ca8] hover:text-[#184884] hover:underline transition-colors shrink-0 dark:text-[#7cbaff] dark:hover:text-[#87baff]"
                          >
                            <FileText size={14} className="text-slate-400" />
                            <span>View ID Proof Document</span>
                            <ExternalLink size={12} className="text-slate-400 ml-0.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Organization Details */}
              {!selectedChannel.isPersonal && selectedChannel.applicantProfile && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Building2 size={13} className="text-slate-400" /> Organization Details
                  </h4>
                  <div className="rounded-xl border border-slate-200 bg-surface p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5 text-left">
                      <div>
                        <span className="block text-[11px] font-medium text-slate-500 mb-0.5">Organization Name</span>
                        <span className="text-sm font-medium text-slate-900 break-words">
                          {selectedChannel.applicantProfile.organizationName || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[11px] font-medium text-slate-500 mb-0.5">Organization Type</span>
                        <span className="text-sm font-medium text-slate-900">
                          {selectedChannel.applicantProfile.organizationType || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[11px] font-medium text-slate-500 mb-0.5">Organization Email</span>
                        <span className="text-sm font-medium text-slate-900 break-all">
                          {selectedChannel.applicantProfile.organizationEmail || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[11px] font-medium text-slate-500 mb-0.5">Website</span>
                        <span className="text-sm font-medium text-slate-900 break-all">
                          {selectedChannel.applicantProfile.organizationWebsite ? (
                            <a
                              href={selectedChannel.applicantProfile.organizationWebsite.startsWith('http') ? selectedChannel.applicantProfile.organizationWebsite : `https://${selectedChannel.applicantProfile.organizationWebsite}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#205ca8] hover:underline inline-flex items-center gap-1 dark:text-[#7cbaff]"
                            >
                              {selectedChannel.applicantProfile.organizationWebsite}
                              <ExternalLink size={11} />
                            </a>
                          ) : '—'}
                        </span>
                      </div>
                      {selectedChannel.applicantProfile.organizationDescription && (
                        <div className="sm:col-span-2">
                          <span className="block text-[11px] font-medium text-slate-500 mb-0.5">Description</span>
                          <span className="text-sm text-slate-700 leading-relaxed">
                            {selectedChannel.applicantProfile.organizationDescription}
                          </span>
                        </div>
                      )}
                      <div className="sm:col-span-2">
                        <span className="block text-[11px] font-medium text-slate-500 mb-0.5">Address</span>
                        <span className="text-sm font-medium text-slate-900 break-words">
                          {selectedChannel.applicantProfile.organizationAddress || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[11px] font-medium text-slate-500 mb-0.5">Registration Number</span>
                        <span className="text-sm font-mono font-medium text-slate-900">
                          {selectedChannel.applicantProfile.organizationRegistrationNumber || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[11px] font-medium text-slate-500 mb-0.5">Role in Organization</span>
                        <span className="text-sm font-medium text-slate-900">
                          {selectedChannel.applicantProfile.roleInOrganization || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[11px] font-medium text-slate-500 mb-0.5">Proof Number</span>
                        <span className="text-sm font-mono font-medium text-slate-900">
                          {selectedChannel.applicantProfile.organizationProofNumber || '—'}
                        </span>
                      </div>
                      {selectedChannel.applicantProfile.organizationProofDocumentUrl && (
                        <div className="sm:col-span-2 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[11px] font-medium text-slate-500">Organization Proof Document</span>
                          <a
                            href={selectedChannel.applicantProfile.organizationProofDocumentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#205ca8] hover:text-[#184884] hover:underline transition-colors shrink-0 dark:text-[#7cbaff] dark:hover:text-[#87baff]"
                          >
                            <FileText size={14} className="text-slate-400" />
                            <span>View Organization Proof Document</span>
                            <ExternalLink size={12} className="text-slate-400 ml-0.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Owner Information Grid - 4 Columns on Desktop */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <User size={13} className="text-slate-400" /> Owner Details
                </h4>
                <div className="rounded-xl border border-slate-200 bg-surface p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3.5 text-left">
                    <div>
                      <span className="block text-[11px] font-medium text-slate-500 mb-0.5">Full Name</span>
                      <span className="text-sm font-medium text-slate-900 break-words">
                        {selectedChannel.ownerName || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[11px] font-medium text-slate-500 mb-0.5">Username</span>
                      <span className="text-sm font-medium text-slate-900">
                        {selectedChannel.ownerUsername ? `@${selectedChannel.ownerUsername}` : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[11px] font-medium text-slate-500 mb-0.5">Email</span>
                      <span className="text-sm font-medium text-slate-900 break-all">
                        {selectedChannel.ownerEmail || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[11px] font-medium text-slate-500 mb-0.5">Phone</span>
                      <span className="text-sm font-medium text-slate-900">
                        {selectedChannel.ownerPhone || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Channel Content Section - 2 Columns on Desktop */}
              {selectedChannel.status !== 'PENDING' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <BookOpen size={13} className="text-slate-400" /> Channel Content
                    </h4>
                    <span className="text-[10px] font-bold text-slate-500">
                      {channelContent.length} Items
                    </span>
                  </div>

                  {contentLoading ? (
                    <div className="py-3 text-center text-xs text-slate-400">Loading content items...</div>
                  ) : channelContent.length === 0 ? (
                    <p className="text-xs text-slate-400 py-1">No courses or roadmaps under this channel yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {channelContent.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 bg-surface p-2.5 rounded-lg border border-slate-200 text-xs"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate">{item.title}</p>
                            <p className="text-[10px] text-slate-400">{item.type}</p>
                          </div>
                          <span
                            className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded border ${item.status.toUpperCase() === 'PUBLISHED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/25'
                                : item.status.toUpperCase() === 'DRAFT'
                                  ? 'bg-slate-100 text-slate-600 border-slate-200'
                                  : item.status.toUpperCase() === 'REJECTED'
                                    ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/25'
                                    : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/25'
                              }`}
                          >
                            {item.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons in Modal */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                {selectedChannel.status === 'PENDING' && (
                  <div className="flex flex-wrap sm:flex-nowrap gap-2.5 justify-end">
                    {canSuspend && (
                      <button
                        type="button"
                        onClick={() => openRejectDialog(selectedChannel)}
                        className="px-5 py-2.5 bg-surface text-rose-700 rounded-lg hover:bg-rose-50 transition-colors font-medium text-xs border border-rose-200 dark:text-rose-300 dark:hover:bg-rose-500/10 dark:border-rose-500/25"
                      >
                        <X size={14} className="inline mr-1" /> Reject Request
                      </button>
                    )}
                    {canApprove && (
                      <button
                        type="button"
                        onClick={() => {
                          handleAccept(selectedChannel.id);
                          closeChannelDetails();
                        }}
                        className="px-6 py-2.5 bg-ink text-on-ink rounded-lg hover:bg-[#205ca8] transition-colors font-medium text-xs shadow-2xs"
                      >
                        <Check size={14} className="inline mr-1 text-emerald-400" /> Approve Channel
                      </button>
                    )}
                  </div>
                )}

                {canSuspend && selectedChannel.status === 'ACTIVE' && (
                  <div className="flex flex-wrap sm:flex-nowrap gap-2.5 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        closeChannelDetails();
                        openSuspendDialog(selectedChannel);
                      }}
                      className="px-5 py-2.5 bg-surface text-rose-700 rounded-lg hover:bg-rose-50 transition-colors font-medium text-xs border border-rose-200 dark:text-rose-300 dark:hover:bg-rose-500/10 dark:border-rose-500/25"
                    >
                      <ShieldOff size={14} className="inline mr-1" /> Suspend Channel
                    </button>
                    <a
                      href={`/channels/${selectedChannel.id}/manage`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2.5 bg-ink text-on-ink rounded-lg hover:bg-[#205ca8] transition-colors font-medium text-xs shadow-2xs inline-flex items-center gap-1.5"
                    >
                      <ExternalLink size={14} /> Open Studio Manage
                    </a>
                  </div>
                )}

                {canSuspend && selectedChannel.status === 'SUSPENDED' && (
                  <div className="flex gap-2.5 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        handleReactivate(selectedChannel.id);
                        closeChannelDetails();
                      }}
                      className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-xs shadow-2xs inline-flex items-center gap-1.5"
                    >
                      <ShieldCheck size={14} /> Reactivate Channel
                    </button>
                  </div>
                )}

                {/* Danger Zone */}
                {canSuspend && (selectedChannel.status === 'ACTIVE' || selectedChannel.status === 'SUSPENDED') && (
                  <div className="pt-2 border-t border-dashed border-rose-200 flex justify-end dark:border-rose-500/25">
                    <button
                      type="button"
                      onClick={() => {
                        closeChannelDetails();
                        openHardDeleteDialog(selectedChannel);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg transition-colors font-medium text-xs border border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/15 dark:border-rose-500/25"
                    >
                      <Trash2 size={13} /> Force Permanent Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="size-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent mx-auto mb-2.5" />
              <span className="text-xs font-medium text-slate-500">Loading channel details...</span>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: Suspend Dialog */}
      <Dialog open={!!suspendTarget} onOpenChange={(open) => !open && setSuspendTarget(null)}>
        <DialogContent className="max-w-md p-6 sm:p-7">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-rose-700 dark:text-rose-300">
              Suspend Channel
            </DialogTitle>
          </DialogHeader>

          {suspendTarget && (
            <div className="space-y-5 mt-3">
              <div>
                <span className="block text-[11px] font-medium text-slate-400">Target Channel</span>
                <p className="text-sm font-bold text-slate-900">{suspendTarget.name}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800" htmlFor="suspend-reason-modal">
                  Reason for Suspension (Visible to owner)
                </label>
                <textarea
                  id="suspend-reason-modal"
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder:text-slate-400"
                  placeholder="e.g. Terms violation, inappropriate content, identity dispute..."
                />
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-rose-200 bg-rose-50/50 cursor-pointer dark:border-rose-500/25 dark:bg-rose-500/10">
                <input
                  type="checkbox"
                  checked={suspendForce}
                  onChange={(e) => setSuspendForce(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-rose-600 rounded"
                />
                <span className="text-xs text-slate-700">
                  <span className="font-bold text-rose-700 dark:text-rose-300">Force immediate unlisting</span> — removes
                  channel contents immediately without a 6-month grace period.
                </span>
              </label>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={confirmSuspend}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors font-semibold text-xs shadow-sm cursor-pointer"
                >
                  {suspendForce ? 'Force Suspend' : 'Confirm Suspension'}
                </button>
                <button
                  type="button"
                  onClick={() => setSuspendTarget(null)}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: Reject Dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent className="max-w-md p-6 sm:p-7">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-rose-700 dark:text-rose-300">
              Reject Channel Request
            </DialogTitle>
          </DialogHeader>

          {rejectTarget && (
            <div className="space-y-5 mt-3">
              <div>
                <span className="block text-[11px] font-medium text-slate-400">Target Channel</span>
                <p className="text-sm font-bold text-slate-900">{rejectTarget.name}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800" htmlFor="reject-reason-modal">
                  Reason for Rejection (Visible to requester)
                </label>
                <textarea
                  id="reject-reason-modal"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder:text-slate-400"
                  placeholder="e.g. Name conflicts with an existing brand, incomplete description..."
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={confirmReject}
                  disabled={rejectSubmitting || !rejectReason.trim()}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors font-semibold text-xs shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {rejectSubmitting ? 'Rejecting...' : 'Reject Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setRejectTarget(null)}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: Hard Delete Dialog */}
      <Dialog open={!!hardDeleteTarget} onOpenChange={(open) => !open && setHardDeleteTarget(null)}>
        <DialogContent className="max-w-md p-6 sm:p-7">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-rose-700 dark:text-rose-300">
              Permanently Delete Channel
            </DialogTitle>
          </DialogHeader>

          {hardDeleteTarget && (
            <div className="space-y-4 mt-3">
              <div className="space-y-1.5 p-3.5 rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-500/25 dark:bg-rose-500/10">
                <p className="text-xs font-bold text-rose-800 dark:text-rose-200">Irreversible Action</p>
                <ul className="text-xs text-rose-700 space-y-1 list-disc list-inside dark:text-rose-300">
                  <li>Every course, roadmap, and workshop is deleted permanently.</li>
                  <li>Learners already enrolled in content lose access permanently.</li>
                  <li>Staff roles and permissions will be deleted.</li>
                </ul>
              </div>

              <div>
                <span className="block text-[11px] font-medium text-slate-400">Target Channel</span>
                <p className="text-sm font-bold text-slate-900">{hardDeleteTarget.name}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800" htmlFor="hard-delete-reason-modal">
                  Audit Reason (Mandatory)
                </label>
                <textarea
                  id="hard-delete-reason-modal"
                  value={hardDeleteReason}
                  onChange={(e) => setHardDeleteReason(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent transition-all placeholder:text-slate-400"
                  placeholder="e.g. Legal erasure request, GDPR compliance, severe fraudulent activity..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800" htmlFor="hard-delete-confirm-modal">
                  Type <span className="font-mono text-rose-700 select-all dark:text-rose-300">{hardDeleteTarget.name}</span> to confirm
                </label>
                <input
                  id="hard-delete-confirm-modal"
                  type="text"
                  value={hardDeleteConfirmText}
                  onChange={(e) => setHardDeleteConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent font-mono"
                  autoComplete="off"
                />
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-rose-200 bg-rose-50/50 cursor-pointer dark:border-rose-500/25 dark:bg-rose-500/10">
                <input
                  type="checkbox"
                  checked={hardDeleteAcknowledged}
                  onChange={(e) => setHardDeleteAcknowledged(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-rose-700 rounded"
                />
                <span className="text-xs text-slate-700">
                  I understand this permanently deletes the channel and all its content immediately.
                </span>
              </label>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={confirmHardDelete}
                  disabled={
                    hardDeleteSubmitting ||
                    hardDeleteConfirmText !== hardDeleteTarget.name ||
                    !hardDeleteAcknowledged ||
                    !hardDeleteReason.trim()
                  }
                  className="flex-1 inline-flex justify-center items-center px-4 py-2.5 bg-rose-700 text-white rounded-xl hover:bg-rose-800 transition-colors font-semibold text-xs shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {hardDeleteSubmitting ? 'Deleting...' : 'Delete Permanently'}
                </button>
                <button
                  type="button"
                  onClick={() => setHardDeleteTarget(null)}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
