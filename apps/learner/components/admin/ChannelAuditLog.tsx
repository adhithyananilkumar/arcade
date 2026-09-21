/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useChannelAuditLogQuery } from "@/domains/channels";
import { toast } from 'sonner';
import { 
  History, 
  Search, 
  RefreshCw, 
  Tv, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Check,
  X,
  SlidersHorizontal,
  ShieldCheck,
  ShieldOff,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

const ACTION_STYLES: Record<string, { badge: string; dot: string; icon: typeof CheckCircle2 }> = {
  APPROVED: {
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
    icon: CheckCircle2
  },
  REACTIVATED: {
    badge: 'border-teal-200 bg-teal-50 text-teal-700',
    dot: 'bg-teal-500',
    icon: ShieldCheck
  },
  SUSPENDED: {
    badge: 'border-rose-200 bg-rose-50 text-rose-700',
    dot: 'bg-rose-500',
    icon: ShieldOff
  },
  DELETION_APPROVED: {
    badge: 'border-rose-300 bg-rose-100/80 text-rose-800',
    dot: 'bg-rose-600',
    icon: AlertTriangle
  },
  DELETION_REQUESTED: {
    badge: 'border-amber-200 bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
    icon: AlertTriangle
  },
  DELETION_REJECTED: {
    badge: 'border-slate-200 bg-slate-50 text-slate-700',
    dot: 'bg-slate-400',
    icon: X
  },
};

const ACTION_OPTIONS = [
  { id: 'ALL', label: 'All Actions', dot: 'bg-slate-400' },
  { id: 'APPROVED', label: 'Channel Approved', dot: 'bg-emerald-500' },
  { id: 'REACTIVATED', label: 'Reactivated', dot: 'bg-teal-500' },
  { id: 'SUSPENDED', label: 'Suspended', dot: 'bg-rose-500' },
  { id: 'DELETION_APPROVED', label: 'Deletion Approved', dot: 'bg-rose-600' },
  { id: 'DELETION_REQUESTED', label: 'Deletion Requested', dot: 'bg-amber-500' },
  { id: 'DELETION_REJECTED', label: 'Deletion Rejected', dot: 'bg-slate-400' },
];

const ACTION_LABELS: Record<string, string> = {
  APPROVED: 'Channel Approved',
  REACTIVATED: 'Reactivated',
  SUSPENDED: 'Suspended',
  DELETION_APPROVED: 'Deletion Approved',
  DELETION_REQUESTED: 'Deletion Requested',
  DELETION_REJECTED: 'Deletion Rejected',
};

export function ChannelAuditLog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // A shared query, so the Refresh button below refetches through React Query rather than holding
  // its own copy of the list — and the panel costs nothing while it is the hidden tab.
  const { data: auditEntries, isLoading: loading, refetch: fetchLogs } = useChannelAuditLogQuery();
  const entries = auditEntries ?? [];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (actionFilter !== 'ALL' && entry.action !== actionFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesChannel = entry.channelName?.toLowerCase().includes(q);
        const matchesActor = entry.actorName?.toLowerCase().includes(q);
        const matchesDetails = entry.details?.toLowerCase().includes(q);
        const matchesAction = entry.action?.toLowerCase().includes(q);
        if (!matchesChannel && !matchesActor && !matchesDetails && !matchesAction) {
          return false;
        }
      }
      return true;
    });
  }, [entries, actionFilter, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [actionFilter, searchQuery]);

  const totalPages = Math.ceil(filteredEntries.length / pageSize) || 1;
  const paginatedEntries = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredEntries.slice(start, start + pageSize);
  }, [filteredEntries, page, pageSize]);

  const currentActionLabel = ACTION_OPTIONS.find((opt) => opt.id === actionFilter)?.label || 'All Actions';

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Action Filter & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Custom Styled Action Filter Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-1.5 text-xs font-semibold shadow-2xs transition-all ${
                dropdownOpen
                  ? 'border-slate-400 ring-2 ring-slate-100 text-slate-900'
                  : 'border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal size={13} className="text-slate-400" />
              <span>{currentActionLabel}</span>
              <ChevronDown
                size={13}
                className={`text-slate-400 transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180 text-slate-700' : ''
                }`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 top-full z-50 mt-1.5 min-w-[210px] rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-[0_12px_30px_rgba(20,20,43,0.12)] backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-100">
                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Filter by Action
                </div>
                <div className="space-y-0.5">
                  {ACTION_OPTIONS.map((option) => {
                    const isSelected = actionFilter === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setActionFilter(option.id);
                          setDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-slate-100 text-slate-900 font-bold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`size-2 rounded-full ${option.dot}`} />
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
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search channel or admin..."
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

          {/* Refresh Action */}
          <button
            type="button"
            onClick={() => { void fetchLogs(); }}
            title="Refresh audit log"
            className="flex size-8 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 shadow-2xs transition-colors"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-slate-800' : ''} />
          </button>
        </div>
      </div>

      {/* Main Table View */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_24px_-4px_rgba(20,20,43,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/75 backdrop-blur-xs text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-6 font-semibold">Channel</th>
                <th className="py-3.5 px-4 font-semibold">Action</th>
                <th className="py-3.5 px-4 font-semibold">Admin / Actor</th>
                <th className="py-3.5 px-4 font-semibold">Details / Notes</th>
                <th className="py-3.5 px-6 font-semibold text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="size-5 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                      <span className="text-xs font-medium text-slate-500">Loading audit trail...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <History size={20} />
                      </div>
                      <p className="text-sm font-bold text-slate-800">No audit events found</p>
                      <p className="text-xs text-slate-500">
                        {searchQuery || actionFilter !== 'ALL'
                          ? 'No logs match your current search or action filter.'
                          : 'No administrative actions recorded yet.'}
                      </p>
                      {(searchQuery || actionFilter !== 'ALL') && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setActionFilter('ALL');
                          }}
                          className="mt-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                        >
                          Reset filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedEntries.map((entry) => {
                  const style = ACTION_STYLES[entry.action] || {
                    badge: 'border-slate-200 bg-slate-50 text-slate-700',
                    dot: 'bg-slate-400',
                    icon: History
                  };

                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-slate-50/80 transition-all duration-150"
                    >
                      {/* Channel Column */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 via-slate-50 to-indigo-100/70 text-indigo-600 overflow-hidden shrink-0 border border-indigo-200/50 shadow-2xs font-bold text-sm">
                            {entry.channelName ? entry.channelName.charAt(0).toUpperCase() : <Tv size={16} className="text-indigo-600" />}
                          </div>
                          <span className="font-bold text-xs text-slate-900 truncate max-w-[220px]">
                            {entry.channelName || 'Unknown Channel'}
                          </span>
                        </div>
                      </td>

                      {/* Action Column */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border ${style.badge}`}
                        >
                          <span className={`size-1.5 rounded-full ${style.dot}`} />
                          {ACTION_LABELS[entry.action] || entry.action}
                        </span>
                      </td>

                      {/* Admin / Actor Column */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-slate-700">
                          <div className="flex size-7 items-center justify-center rounded-full bg-gradient-to-tr from-slate-100 to-slate-200/90 text-slate-700 font-bold text-[11px] border border-slate-200/80 shrink-0">
                            {(entry.actorName || 'A').charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-xs text-slate-800">
                            {entry.actorName || 'Owner (self-service)'}
                          </span>
                        </div>
                      </td>

                      {/* Details / Notes Column */}
                      <td className="py-4 px-4 max-w-[240px]">
                        <p className="truncate text-slate-500 font-normal text-xs" title={entry.details || undefined}>
                          {entry.details || '—'}
                        </p>
                      </td>

                      {/* Timestamp Column */}
                      <td className="py-4 px-6 text-right whitespace-nowrap text-slate-500 text-xs font-medium">
                        {entry.createdAt ? (
                          <div className="inline-flex items-center gap-1.5 text-slate-500 justify-end">
                            <Calendar size={12} className="text-slate-400 shrink-0" />
                            <span>
                              {new Date(entry.createdAt).toLocaleDateString('en-US', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                              {', '}
                              {new Date(entry.createdAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Clean Footer Pagination */}
        {filteredEntries.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-200/80 bg-slate-50/50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-800">{(page - 1) * pageSize + 1}</span>–
              <span className="font-semibold text-slate-800">
                {Math.min(page * pageSize, filteredEntries.length)}
              </span>{' '}
              of <span className="font-semibold text-slate-800">{filteredEntries.length}</span> audit logs
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
      </div>
    </div>
  );
}
