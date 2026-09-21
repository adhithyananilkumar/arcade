/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Channel, ChannelContentItem, channelService } from "@/domains/channels";
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
  Calendar 
} from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from "@/domains/identity";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/design-system/ui/dialog';

type StatusFilter = 'ALL' | 'PENDING' | 'ACTIVE' | 'SUSPENDED';
type TypeFilter = 'ALL' | 'PERSONAL' | 'ORGANIZATION';
type ViewMode = 'GRID' | 'TABLE';

const TYPE_OPTIONS = [
  { id: 'ALL', label: 'All Types', icon: SlidersHorizontal },
  { id: 'PERSONAL', label: 'Personal Channels', icon: User },
  { id: 'ORGANIZATION', label: 'Organization Channels', icon: Building2 },
];

export function PendingChannels() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('TABLE');
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const [pendingChannels, setPendingChannels] = useState<Channel[]>([]);
  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Dialog states
  const [suspendTarget, setSuspendTarget] = useState<Channel | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendForce, setSuspendForce] = useState(false);
  const [channelContent, setChannelContent] = useState<ChannelContentItem[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [hardDeleteTarget, setHardDeleteTarget] = useState<Channel | null>(null);
  const [hardDeleteReason, setHardDeleteReason] = useState('');
  const [hardDeleteConfirmText, setHardDeleteConfirmText] = useState('');
  const [hardDeleteAcknowledged, setHardDeleteAcknowledged] = useState(false);
  const [hardDeleteSubmitting, setHardDeleteSubmitting] = useState(false);

  const { hasPermission } = usePermissions();
  const canApprove = hasPermission('platform.channels.manage');
  const canSuspend = hasPermission('platform.channels.manage');

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const [pendingData, allData] = await Promise.all([
        channelService.getPendingRequests(),
        channelService.getAllChannels()
      ]);
      setPendingChannels(pendingData || []);
      setAllChannels(allData || []);
    } catch {
      toast.error('Failed to load channels');
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    if (!selectedChannel) {
      setChannelContent([]);
      return;
    }
    setContentLoading(true);
    channelService
      .getChannelContent(selectedChannel.id)
      .then(setChannelContent)
      .catch(() => toast.error('Failed to load channel content'))
      .finally(() => setContentLoading(false));
  }, [selectedChannel]);

  const handleAccept = async (id: string) => {
    try {
      await channelService.acceptChannelRequest(id);
      toast.success('Channel request accepted');
      fetchChannels();
    } catch {
      toast.error('Failed to accept request');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await channelService.deleteChannelRequest(id);
      toast.success('Channel request rejected');
      fetchChannels();
    } catch {
      toast.error('Failed to reject request');
    }
  };

  const openSuspendDialog = (channel: Channel) => {
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
      setSelectedChannel(null);
      fetchChannels();
    } catch {
      toast.error('Failed to suspend channel');
    }
  };

  const openHardDeleteDialog = (channel: Channel) => {
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
      setSelectedChannel(null);
      fetchChannels();
    } catch {
      toast.error('Failed to permanently delete channel');
    } finally {
      setHardDeleteSubmitting(false);
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      await channelService.reactivateChannel(id);
      toast.success('Channel reactivated');
      fetchChannels();
    } catch {
      toast.error('Failed to reactivate channel');
    }
  };

  // Combine and deduplicate channels list
  const channelPool = useMemo(() => {
    const map = new Map<string, Channel>();
    allChannels.forEach(c => map.set(c.id, c));
    pendingChannels.forEach(c => {
      map.set(c.id, { ...c, status: c.status || 'PENDING' });
    });
    return Array.from(map.values());
  }, [allChannels, pendingChannels]);

  // Metric counts
  const counts = useMemo(() => {
    const pending = pendingChannels.length;
    let active = 0;
    let suspended = 0;
    allChannels.forEach(c => {
      if (c.status === 'ACTIVE') active++;
      else if (c.status === 'SUSPENDED') suspended++;
    });
    return {
      pending,
      active,
      suspended,
      total: allChannels.length + pendingChannels.filter(p => !allChannels.some(a => a.id === p.id)).length
    };
  }, [allChannels, pendingChannels]);

  // Filtered list
  const filteredChannels = useMemo(() => {
    return channelPool.filter((c) => {
      if (statusFilter === 'PENDING' && c.status !== 'PENDING') return false;
      if (statusFilter === 'ACTIVE' && c.status !== 'ACTIVE') return false;
      if (statusFilter === 'SUSPENDED' && c.status !== 'SUSPENDED') return false;

      if (typeFilter === 'PERSONAL' && !c.isPersonal) return false;
      if (typeFilter === 'ORGANIZATION' && c.isPersonal) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = c.name?.toLowerCase().includes(q);
        const matchesOwner = c.ownerName?.toLowerCase().includes(q);
        const matchesUsername = c.ownerUsername?.toLowerCase().includes(q);
        const matchesEmail = c.ownerEmail?.toLowerCase().includes(q);
        const matchesDesc = c.description?.toLowerCase().includes(q);
        if (!matchesName && !matchesOwner && !matchesUsername && !matchesEmail && !matchesDesc) {
          return false;
        }
      }
      return true;
    });
  }, [channelPool, statusFilter, typeFilter, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, typeFilter, searchQuery]);

  const totalPages = Math.ceil(filteredChannels.length / pageSize) || 1;
  const paginatedChannels = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredChannels.slice(start, start + pageSize);
  }, [filteredChannels, page, pageSize]);

  // Clean owner subtitle display helper
  const getOwnerSubtitle = (channel: Channel) => {
    if (channel.ownerUsername) return `@${channel.ownerUsername}`;
    if (channel.ownerEmail && !channel.ownerEmail.startsWith('owner-') && channel.ownerEmail.includes('@')) {
      return channel.ownerEmail;
    }
    return 'Channel Owner';
  };

  return (
    <div className="space-y-4">
      {/* Sleek Enterprise Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Status Filter Segmented Control */}
        <div className="inline-flex items-center rounded-xl border border-slate-200/90 bg-slate-100/80 p-1 text-xs font-semibold text-slate-600 shadow-2xs">
          <button
            type="button"
            onClick={() => setStatusFilter('PENDING')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              statusFilter === 'PENDING'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <span>Pending Requests</span>
            <span
              className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                statusFilter === 'PENDING'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-200/80 text-slate-600'
              }`}
            >
              {counts.pending}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              statusFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <span>All Channels</span>
            <span
              className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                statusFilter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-200/80 text-slate-600'
              }`}
            >
              {counts.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('ACTIVE')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              statusFilter === 'ACTIVE'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <span>Active</span>
            <span
              className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                statusFilter === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200/80 text-slate-600'
              }`}
            >
              {counts.active}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('SUSPENDED')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              statusFilter === 'SUSPENDED'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <span>Suspended</span>
            <span
              className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                statusFilter === 'SUSPENDED'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-slate-200/80 text-slate-600'
              }`}
            >
              {counts.suspended}
            </span>
          </button>
        </div>

        {/* Search, Type Filter & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Custom Type Filter Dropdown */}
          <div className="relative" ref={typeDropdownRef}>
            <button
              type="button"
              onClick={() => setTypeDropdownOpen((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-1.5 text-xs font-semibold shadow-2xs transition-all ${
                typeDropdownOpen
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
                className={`text-slate-400 transition-transform duration-200 ${
                  typeDropdownOpen ? 'rotate-180 text-slate-700' : ''
                }`}
              />
            </button>

            {typeDropdownOpen && (
              <div className="absolute left-0 top-full z-50 mt-1.5 min-w-[190px] rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-[0_12px_30px_rgba(20,20,43,0.12)] backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-100">
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
                        className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-colors ${
                          isSelected
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
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search channel or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200/90 bg-white py-1.5 pl-8 pr-7 text-xs font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
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
          <div className="inline-flex items-center rounded-xl border border-slate-200/90 bg-slate-100/80 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('GRID')}
              className={`flex size-7 items-center justify-center rounded-lg transition-all ${
                viewMode === 'GRID'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Card Grid view"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`flex size-7 items-center justify-center rounded-lg transition-all ${
                viewMode === 'TABLE'
                  ? 'bg-white text-slate-900 shadow-xs'
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
        <div className="rounded-2xl border border-slate-200/80 bg-white py-20 text-center shadow-[0_2px_12px_rgba(20,20,43,0.03)]">
          <div className="flex flex-col items-center justify-center gap-2.5">
            <div className="size-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
            <span className="text-xs font-medium text-slate-500">Loading channels...</span>
          </div>
        </div>
      ) : paginatedChannels.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white py-16 text-center shadow-[0_2px_12px_rgba(20,20,43,0.03)]">
          <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Tv size={22} />
            </div>
            <p className="text-sm font-bold text-slate-800">No channels found</p>
            <p className="text-xs text-slate-500">
              {searchQuery || typeFilter !== 'ALL'
                ? 'No channels match the current search or type filter.'
                : statusFilter === 'PENDING'
                ? 'No pending channel requests requiring review.'
                : 'No channels found under this view.'}
            </p>
            {(searchQuery || typeFilter !== 'ALL' || statusFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('ALL');
                  setStatusFilter('ALL');
                }}
                className="mt-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Reset filters
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

            return (
              <div
                key={channel.id}
                onClick={() => setSelectedChannel(channel)}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_10px_rgba(20,20,43,0.03)] hover:border-slate-300 hover:shadow-[0_8px_24px_rgba(20,20,43,0.06)] hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                {/* Card Top: Avatar, Name, Badges */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200/90 text-slate-700 overflow-hidden shrink-0 border border-slate-200/80 shadow-2xs group-hover:scale-105 transition-transform font-bold text-sm">
                        {channel.iconUrl ? (
                          <img
                            src={channel.iconUrl}
                            alt={channel.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Tv size={18} className="text-slate-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors leading-snug">
                          {channel.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold border ${
                              channel.isPersonal
                                ? 'border-sky-200 bg-sky-50 text-sky-700'
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
                      className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold border ${
                        isActive
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : isSuspended
                          ? 'border-rose-200 bg-rose-50 text-rose-700'
                          : 'border-amber-200 bg-amber-50 text-amber-700'
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          isActive
                            ? 'bg-emerald-500'
                            : isSuspended
                            ? 'bg-rose-500'
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
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#14142b] hover:bg-[#232735] px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-all"
                            title="Approve channel"
                          >
                            <Check size={12} className="text-emerald-400" strokeWidth={3} />
                            <span>Approve</span>
                          </button>
                        )}
                        {canSuspend && (
                          <button
                            type="button"
                            onClick={() => handleReject(channel.id)}
                            className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors"
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
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        >
                          <ExternalLink size={12} />
                          <span>Manage</span>
                        </a>
                        {canSuspend && (
                          <button
                            type="button"
                            onClick={() => openSuspendDialog(channel)}
                            className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-white px-2 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
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
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
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
                    onClick={() => setSelectedChannel(channel)}
                    className="inline-flex size-8 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors shrink-0"
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
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_24px_-4px_rgba(20,20,43,0.04)]">
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
                  const ownerName = channel.ownerName || 'Owner';
                  const ownerInitial = (channel.ownerName || channel.name || 'O').charAt(0).toUpperCase();

                  return (
                    <tr
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel)}
                      className="group cursor-pointer hover:bg-slate-50/80 transition-all duration-150"
                    >
                      {/* Channel Column */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 via-slate-50 to-indigo-100/70 text-indigo-600 overflow-hidden shrink-0 border border-indigo-200/50 shadow-2xs group-hover:scale-105 group-hover:border-indigo-300 transition-all">
                            {channel.iconUrl ? (
                              <img
                                src={channel.iconUrl}
                                alt={channel.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Tv size={17} className="text-indigo-600" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-[260px]">
                            <p className="truncate text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
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
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
                            channel.isPersonal
                              ? 'border-sky-200/80 bg-sky-50 text-sky-700'
                              : 'border-purple-200/80 bg-purple-50 text-purple-700'
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
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border ${
                            isActive
                              ? 'border-emerald-200/80 bg-emerald-50 text-emerald-700'
                              : isSuspended
                              ? 'border-rose-200/80 bg-rose-50 text-rose-700'
                              : 'border-amber-200/80 bg-amber-50 text-amber-700'
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              isActive
                                ? 'bg-emerald-500'
                                : isSuspended
                                ? 'bg-rose-500'
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
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#14142b] hover:bg-[#232735] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                                  title="Approve channel"
                                >
                                  <Check size={12} className="text-emerald-400" strokeWidth={3} />
                                  <span>Approve</span>
                                </button>
                              )}
                              {canSuspend && (
                                <button
                                  type="button"
                                  onClick={() => handleReject(channel.id)}
                                  className="inline-flex items-center gap-1 rounded-xl border border-rose-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-300 shadow-2xs hover:scale-[1.02] active:scale-[0.98] transition-all"
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
                                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
                              >
                                <ExternalLink size={12} />
                                <span>Manage</span>
                              </a>
                              {canSuspend && (
                                <button
                                  type="button"
                                  onClick={() => openSuspendDialog(channel)}
                                  className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors shadow-2xs"
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
                                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                              >
                                <ExternalLink size={12} />
                                <span>Manage</span>
                              </a>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedChannel(channel)}
                            className="inline-flex size-8 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-400 hover:text-slate-800 hover:bg-slate-100 hover:border-slate-300 transition-all"
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
      {filteredChannels.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 shadow-2xs">
          <div>
            Showing <span className="font-semibold text-slate-800">{(page - 1) * pageSize + 1}</span>–
            <span className="font-semibold text-slate-800">
              {Math.min(page * pageSize, filteredChannels.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-800">{filteredChannels.length}</span> channels
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next</span>
                <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal: Channel Details */}
      <Dialog open={!!selectedChannel} onOpenChange={(open) => !open && setSelectedChannel(null)}>
        <DialogContent className="max-w-lg p-6 sm:p-7">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Channel Overview</DialogTitle>
          </DialogHeader>

          {selectedChannel && (
            <div className="space-y-6 mt-4">
              {/* Channel Header Banner/Avatar */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-white text-slate-800 overflow-hidden shrink-0 shadow-sm border border-slate-200/60">
                  {selectedChannel.iconUrl ? (
                    <img
                      src={selectedChannel.iconUrl}
                      alt={selectedChannel.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Tv size={26} />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    {selectedChannel.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                        selectedChannel.isPersonal
                          ? 'border-sky-200 bg-sky-50 text-sky-700'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      {selectedChannel.isPersonal ? 'Personal' : 'Organization'}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                        selectedChannel.status === 'ACTIVE'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : selectedChannel.status === 'SUSPENDED'
                          ? 'border-rose-200 bg-rose-50 text-rose-700'
                          : 'border-amber-200 bg-amber-50 text-amber-700'
                      }`}
                    >
                      {selectedChannel.status || 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedChannel.description && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Description
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/80">
                    {selectedChannel.description}
                  </p>
                </div>
              )}

              {/* Suspension Reason */}
              {selectedChannel.status === 'SUSPENDED' && selectedChannel.suspensionReason && (
                <div className="space-y-1 bg-rose-50 p-3.5 rounded-xl border border-rose-200">
                  <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                    <AlertTriangle size={13} /> Suspension Reason
                  </h4>
                  <p className="text-xs text-rose-700">{selectedChannel.suspensionReason}</p>
                </div>
              )}

              {/* Owner Information Grid */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Owner Details
                </h4>
                <div className="grid grid-cols-2 gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 text-xs">
                  <div>
                    <span className="block text-[10px] font-medium text-slate-400">Full Name</span>
                    <span className="font-semibold text-slate-800">{selectedChannel.ownerName}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-medium text-slate-400">Username</span>
                    <span className="font-semibold text-slate-800">
                      {selectedChannel.ownerUsername ? `@${selectedChannel.ownerUsername}` : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-medium text-slate-400">Email</span>
                    <span className="font-semibold text-slate-800 break-all">
                      {selectedChannel.ownerEmail || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-medium text-slate-400">Phone</span>
                    <span className="font-semibold text-slate-800">
                      {selectedChannel.ownerPhone || '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Channel Content Section */}
              {selectedChannel.status !== 'PENDING' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <BookOpen size={13} /> Channel Content
                    </h4>
                    <span className="text-[10px] font-bold text-slate-500">
                      {channelContent.length} Items
                    </span>
                  </div>

                  {contentLoading ? (
                    <div className="py-4 text-center text-xs text-slate-400">Loading content items...</div>
                  ) : channelContent.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2">No courses or roadmaps under this channel yet.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {channelContent.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 text-xs"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate">{item.title}</p>
                            <p className="text-[10px] text-slate-400">{item.type}</p>
                          </div>
                          <span
                            className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded border ${
                              item.status.toUpperCase() === 'PUBLISHED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : item.status.toUpperCase() === 'DRAFT'
                                ? 'bg-slate-100 text-slate-600 border-slate-200'
                                : item.status.toUpperCase() === 'REJECTED'
                                ? 'bg-rose-50 text-rose-600 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
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
              <div className="space-y-3 pt-4 border-t border-slate-200">
                {selectedChannel.status === 'PENDING' && (
                  <div className="flex gap-2">
                    {canApprove && (
                      <button
                        type="button"
                        onClick={() => {
                          handleAccept(selectedChannel.id);
                          setSelectedChannel(null);
                        }}
                        className="flex-1 inline-flex justify-center items-center gap-1.5 px-4 py-2.5 bg-[#14142b] text-white rounded-xl hover:bg-[#232735] transition-colors font-semibold text-xs shadow-sm"
                      >
                        <Check size={14} className="text-emerald-400" /> Approve Channel
                      </button>
                    )}
                    {canSuspend && (
                      <button
                        type="button"
                        onClick={() => {
                          handleReject(selectedChannel.id);
                          setSelectedChannel(null);
                        }}
                        className="flex-1 inline-flex justify-center items-center gap-1.5 px-4 py-2.5 bg-rose-50 text-rose-700 rounded-xl hover:bg-rose-100 transition-colors font-semibold text-xs border border-rose-200"
                      >
                        <X size={14} /> Reject Request
                      </button>
                    )}
                  </div>
                )}

                {canSuspend && selectedChannel.status === 'ACTIVE' && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedChannel(null);
                        openSuspendDialog(selectedChannel);
                      }}
                      className="flex-1 inline-flex justify-center items-center gap-1.5 px-4 py-2.5 bg-rose-50 text-rose-700 rounded-xl hover:bg-rose-100 transition-colors font-semibold text-xs border border-rose-200"
                    >
                      <ShieldOff size={14} /> Suspend Channel
                    </button>
                    <a
                      href={`/channels/${selectedChannel.id}/manage`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex justify-center items-center gap-1.5 px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-semibold text-xs shadow-sm"
                    >
                      <ExternalLink size={14} /> Open Studio Manage
                    </a>
                  </div>
                )}

                {canSuspend && selectedChannel.status === 'SUSPENDED' && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleReactivate(selectedChannel.id);
                        setSelectedChannel(null);
                      }}
                      className="flex-1 inline-flex justify-center items-center gap-1.5 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold text-xs shadow-sm"
                    >
                      <ShieldCheck size={14} /> Reactivate Channel
                    </button>
                  </div>
                )}

                {/* Danger Zone */}
                {canSuspend && (selectedChannel.status === 'ACTIVE' || selectedChannel.status === 'SUSPENDED') && (
                  <div className="pt-3 border-t border-dashed border-rose-200">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedChannel(null);
                        openHardDeleteDialog(selectedChannel);
                      }}
                      className="w-full inline-flex justify-center items-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl transition-colors font-semibold text-xs border border-rose-200"
                    >
                      <Trash2 size={13} /> Force Permanent Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: Suspend Dialog */}
      <Dialog open={!!suspendTarget} onOpenChange={(open) => !open && setSuspendTarget(null)}>
        <DialogContent className="max-w-md p-6 sm:p-7">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-rose-700 flex items-center gap-2">
              <ShieldOff size={18} /> Suspend Channel
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

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-rose-200 bg-rose-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={suspendForce}
                  onChange={(e) => setSuspendForce(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-rose-600 rounded"
                />
                <span className="text-xs text-slate-700">
                  <span className="font-bold text-rose-700">Force immediate unlisting</span> — removes
                  channel contents immediately without a 6-month grace period.
                </span>
              </label>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={confirmSuspend}
                  className="flex-1 inline-flex justify-center items-center gap-1.5 px-4 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors font-semibold text-xs shadow-sm"
                >
                  <ShieldOff size={14} /> {suspendForce ? 'Force Suspend' : 'Confirm Suspension'}
                </button>
                <button
                  type="button"
                  onClick={() => setSuspendTarget(null)}
                  className="flex-1 inline-flex justify-center items-center gap-1.5 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-semibold text-xs"
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
            <DialogTitle className="text-lg font-bold text-rose-700 flex items-center gap-2">
              <AlertTriangle size={18} /> Permanently Delete Channel
            </DialogTitle>
          </DialogHeader>

          {hardDeleteTarget && (
            <div className="space-y-4 mt-3">
              <div className="space-y-1.5 p-3.5 rounded-xl border border-rose-200 bg-rose-50">
                <p className="text-xs font-bold text-rose-800">Irreversible Action</p>
                <ul className="text-xs text-rose-700 space-y-1 list-disc list-inside">
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
                  Type <span className="font-mono text-rose-700 select-all">{hardDeleteTarget.name}</span> to confirm
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

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-rose-200 bg-rose-50/50 cursor-pointer">
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
                  className="flex-1 inline-flex justify-center items-center gap-1.5 px-4 py-2.5 bg-rose-700 text-white rounded-xl hover:bg-rose-800 transition-colors font-semibold text-xs shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 size={14} /> {hardDeleteSubmitting ? 'Deleting...' : 'Delete Permanently'}
                </button>
                <button
                  type="button"
                  onClick={() => setHardDeleteTarget(null)}
                  className="flex-1 inline-flex justify-center items-center gap-1.5 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-semibold text-xs"
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
