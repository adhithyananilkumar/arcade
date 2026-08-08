'use client';

import { useEffect, useState, Fragment } from 'react';
import Link from 'next/link';
import { api } from '@/infrastructure/http/api';
import { getDashboardWorkshops } from '@/app/(authenticated)/studio/workshop/api/dashboardApi';
import {
  Wrench,
  ArrowRight,
  Clock,
  Video,
  BookOpen,
  Search,
  Calendar,
  Plus,
  FolderOpen,
} from 'lucide-react';
import { channelService } from '@/domains/channels';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface UnifiedWorkshopDto {
  id: string;
  title: string;
  category: string;
  status: string;
  workshopType: string;
  coverImageUrl?: string | null;
  sessionsCount: number;
  resourcesCount: number;
  createdAt: string;
  updatedAt: string;
  isOwner: boolean;
  role?: string;
}

export default function UnifiedManagePage() {
  const [items, setItems] = useState<UnifiedWorkshopDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'OWNED' | 'COLLAB' | 'ARCHIVED'>('ALL');
  const [canCreate, setCanCreate] = useState(false);

  useEffect(() => {
    const loadAllWorkspaces = async () => {
      try {
        // Check if user has any owned channels
        const channels = await channelService.getMyChannels().catch(() => []);
        setCanCreate(channels.length > 0);

        // Fetch created/owned workshops
        const ownedRes = await getDashboardWorkshops({ size: 100 }).catch(() => ({ content: [] }));
        const ownedMapped: UnifiedWorkshopDto[] = (ownedRes.content || []).map(w => ({
          ...w,
          isOwner: true,
          role: 'OWNER'
        }));

        // Fetch collaborated workshops
        const collabRes = await api.get<any[]>('/api/workshops/my-collaborations').catch(() => []);
        const collabMapped: UnifiedWorkshopDto[] = collabRes.map(w => ({
          ...w,
          isOwner: false,
          role: w.collaboratorRole
        }));

        // Combine and sort by updatedAt descending, filtering out any duplicate IDs in collaborated workshops
        const ownedIds = new Set(ownedMapped.map(w => w.id));
        const uniqueCollab = collabMapped.filter(w => !ownedIds.has(w.id));

        const combined = [...ownedMapped, ...uniqueCollab].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        setItems(combined);
      } catch (err) {
        toast.error('Failed to load workspaces');
      } finally {
        setLoading(false);
      }
    };

    loadAllWorkspaces();
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? ''
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredItems = items.filter(item => {
    const title = item.title?.toLowerCase() || '';
    const category = item.category?.toLowerCase() || '';
    const query = searchQuery.toLowerCase().trim();

    const matchesSearch = title.includes(query) || category.includes(query);
    const matchesOwnership =
      activeFilter === 'ALL' ||
      (activeFilter === 'OWNED' && item.isOwner) ||
      (activeFilter === 'COLLAB' && !item.isOwner) ||
      (activeFilter === 'ARCHIVED' && (item.status === 'ARCHIVED' || item.status === 'ARCHIVE'));

    return matchesSearch && matchesOwnership;
  });

  // Calculate statistics
  const stats = {
    total: items.length,
    owned: items.filter(w => w.isOwner).length,
    collab: items.filter(w => !w.isOwner).length,
    sessions: items.reduce((sum, w) => sum + (w.sessionsCount || 0), 0),
    resources: items.reduce((sum, w) => sum + (w.resourcesCount || 0), 0)
  };

  // ─── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="px-6 py-8 md:px-10 max-w-7xl mx-auto space-y-6 animate-pulse min-h-screen bg-white">
        {/* Header skeleton */}
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 px-7 py-7 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-100" />
          <div className="space-y-2 flex-1">
            <div className="h-7 bg-slate-200 rounded-lg w-52" />
            <div className="h-3.5 bg-slate-100 rounded w-96" />
          </div>
        </div>
        {/* Stats row skeleton */}
        <div className="flex gap-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-8 bg-slate-100 rounded w-28" />
          ))}
        </div>
        {/* Content skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-36 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // ─── Main render ─────────────────────────────────────────────────────────────
  return (
    <div className="px-6 py-8 md:px-10 max-w-7xl mx-auto space-y-6 min-h-screen bg-white">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 px-7 py-6 flex flex-col sm:flex-row sm:items-center gap-5">
        {/* Left: icon + text */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="shrink-0 grid place-items-center w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600">
            <FolderOpen size={20} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h1 className="text-[30px] font-extrabold leading-tight tracking-tight text-slate-900">
              Manage Workspaces
            </h1>
            <p className="mt-1 text-sm text-slate-500 leading-relaxed max-w-[600px]">
              Create and edit workshops or webinars you own, or coordinate on projects you have been invited to co-manage.
            </p>
          </div>
        </div>
        {/* Right: primary action */}
        {canCreate && (
          <Link
            href="/studio/workshop/new"
            className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 px-4 py-2.5 text-sm font-semibold text-white transition-all self-start sm:self-center"
          >
            <Plus size={15} /> New Workspace
          </Link>
        )}
      </div>

      {/* ── Compact stats row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-y-4 sm:flex sm:flex-row sm:items-center sm:justify-between py-2 border-b border-slate-100 pb-5">
        {[
          { label: 'Workspaces',      value: stats.total    },
          { label: 'Created by me',   value: stats.owned    },
          { label: 'Collaborations',  value: stats.collab   },
          { label: 'Active sessions', value: stats.sessions },
          { label: 'Resources',       value: stats.resources},
        ].map((s, idx, arr) => (
          <Fragment key={s.label}>
            <div className="text-left flex items-baseline sm:items-center">
              <span className="text-[22px] font-extrabold text-slate-955 tabular-nums leading-none">{s.value}</span>
              <span className="ml-2 text-[14px] text-slate-500 font-medium whitespace-nowrap">{s.label}</span>
            </div>
            {idx < arr.length - 1 && (
              <div className="hidden sm:block w-px h-4 bg-slate-200 shrink-0" />
            )}
          </Fragment>
        ))}
      </div>

      {/* ── Filter toolbar ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200">
        {/* Tab filters */}
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-none">
          {[
            { id: 'ALL',      label: 'All' },
            { id: 'OWNED',    label: 'Owned' },
            { id: 'COLLAB',   label: 'Collaborated' },
            { id: 'ARCHIVED', label: 'Archived' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id as any)}
              className={`pb-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeFilter === f.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64 mb-4 sm:mb-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search workspaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <AnimatePresence mode="popLayout">
        {filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex flex-col items-center justify-center py-20 text-center space-y-4"
          >
            <div className="grid place-items-center w-12 h-12 rounded-xl bg-slate-50 text-slate-400">
              <FolderOpen size={24} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">No workspaces yet</p>
              <p className="mt-1.5 text-sm text-slate-400 max-w-sm leading-relaxed">
                {searchQuery || activeFilter !== 'ALL'
                  ? 'Try adjusting your filters or search criteria.'
                  : 'Create your first workshop or webinar to start managing your workspace.'}
              </p>
            </div>
            {!searchQuery && activeFilter === 'ALL' && (
              <Link
                href="/studio/workshop/new"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <Plus size={16} /> New Workspace
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => {
              const isWebinar = item.workshopType === 'WEBINAR';
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col sm:flex-row overflow-hidden rounded-xl border border-slate-200/80 bg-white hover:border-slate-350 transition-all group min-h-[140px]"
                >
                  {/* Left: Banner / Cover Section */}
                  <div className="w-full sm:w-[240px] shrink-0 bg-slate-100 relative overflow-hidden aspect-video sm:aspect-auto">
                    {item.coverImageUrl ? (
                      <img
                        src={item.coverImageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className={`h-full w-full flex items-center justify-center opacity-85 ${isWebinar
                          ? 'bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600'
                          : 'bg-gradient-to-tr from-orange-400 via-rose-500 to-purple-600'
                        }`}>
                        <span className="text-white/35 font-black text-2xl uppercase tracking-wider select-none">
                          {isWebinar ? 'Live' : 'Studio'}
                        </span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 flex gap-1.5">
                      <span className="inline-flex items-center text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border bg-white/95 text-slate-800 shadow-sm uppercase border-slate-100">
                        {item.status || 'Active'}
                      </span>
                    </div>

                    {/* Role Badge */}
                    <div className="absolute bottom-3 left-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-sm uppercase ${item.role === 'OWNER'
                          ? 'bg-amber-500 text-white border-amber-400'
                          : item.role === 'MANAGER'
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : item.role === 'EDITOR'
                              ? 'bg-indigo-600 text-white border-indigo-500'
                              : 'bg-slate-500 text-white border-slate-400'
                        }`}>
                        {item.role || 'Collaborator'}
                      </span>
                    </div>
                  </div>

                  {/* Right: Content details & Action */}
                  <div className="flex-1 p-5 flex flex-col justify-between sm:flex-row sm:items-center gap-5">
                    <div className="space-y-2.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase ${isWebinar
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-orange-50 text-orange-700 border-orange-200'
                          }`}>
                          {isWebinar ? <Video size={10} /> : <Wrench size={10} />} {item.workshopType}
                        </span>
                        {item.category && (
                          <span className="text-[11px] text-slate-400 font-semibold tracking-wide uppercase">
                            • {item.category}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                          <Clock size={11} /> Last updated {formatDate(item.updatedAt)}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition-colors truncate">
                        {item.title || 'Untitled Workspace'}
                      </h3>

                      {/* Stats Strip */}
                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400" />
                          <span>{item.sessionsCount || 0} Sessions</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BookOpen size={13} className="text-slate-400" />
                          <span>{item.resourcesCount || 0} Resources</span>
                        </div>
                      </div>
                    </div>

                    {/* Manage Link button */}
                    <div className="shrink-0 self-start sm:self-center">
                      <Link
                        href={`/studio/workshop/${item.id}`}
                        className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all shadow-sm active:scale-98"
                      >
                        Manage {isWebinar ? 'Webinar' : 'Workshop'} <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
