'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/infrastructure/http/api';
import { getDashboardWorkshops } from '@/app/(authenticated)/studio/workshop/api/dashboardApi';
import {
  Wrench,
  ArrowRight,
  Clock,
  Video,
  BookOpen,
  Search,
  Layers,
  Calendar,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  LayoutDashboard,
  User,
  Plus
} from 'lucide-react';
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
  const router = useRouter();
  const [items, setItems] = useState<UnifiedWorkshopDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'OWNED' | 'COLLAB'>('ALL');


  useEffect(() => {
    const loadAllWorkspaces = async () => {
      try {
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
      (activeFilter === 'COLLAB' && !item.isOwner);

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

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse bg-[#F8FAFC]/50 min-h-screen">
        <div className="space-y-3">
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-2xl w-72" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-xl w-96" />
        </div>

        {/* KPI Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>

        {/* Content list skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 min-h-screen"
      style={{
        background: 'linear-gradient(180deg, #F1F5F9 0%, #F8FAFC 50%, #FFFFFF 100%)'
      }}
    >
      {/* Visual Header Panel */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-10 text-white shadow-xl md:px-12 md:py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-400 via-purple-600 to-slate-900" />
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-[11px] font-semibold tracking-wider text-indigo-300 uppercase">
            <ShieldCheck size={12} className="text-indigo-400" /> Management Dashboard
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-100 bg-clip-text text-transparent">
            Manage Workspaces
          </h1>
          <p className="text-[13px] md:text-sm text-slate-300 leading-relaxed max-w-lg">
            Create and edit workshops or webinars you own, or coordinate on projects you have been invited to co-manage.
          </p>
        </div>

        {/* Create Button */}
        <button
          onClick={() => router.push('/studio/workshop/new')}
          className="relative z-10 inline-flex items-center gap-2 rounded-xl bg-white hover:bg-slate-50 px-5 py-3 text-sm font-bold text-slate-900 shadow-lg active:scale-95 transition-all"
        >
          <Plus size={16} /> New Workspace
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          {
            label: 'Total Workspaces',
            value: stats.total,
            icon: Layers,
            tone: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400',
          },
          {
            label: 'Created By Me',
            value: stats.owned,
            icon: User,
            tone: 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400',
          },
          {
            label: 'Collaborations',
            value: stats.collab,
            icon: Wrench,
            tone: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400',
          },
          {
            label: 'Active Sessions',
            value: stats.sessions,
            icon: Calendar,
            tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400',
          },
          {
            label: 'Total Resources',
            value: stats.resources,
            icon: BookOpen,
            tone: 'bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400',
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="flex flex-col justify-between p-5 rounded-2xl border border-slate-200/80 bg-white/95 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`grid size-9 place-items-center rounded-xl ${kpi.tone}`}>
                <kpi.icon size={16} />
              </span>
            </div>
            <div>
              <p className="text-2xl font-black tabular-nums tracking-tight text-slate-800">
                {kpi.value}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                {kpi.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Control Bar: Filter and Search */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white/90 border border-slate-200/80 p-3.5 rounded-2xl shadow-sm">
        {/* Left Filters Group */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Ownership Filter */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'OWNED', label: 'Owned' },
              { id: 'COLLAB', label: 'Collaborated' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id as any)}
                className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeFilter === f.id
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>

        </div>

        {/* Search Field */}
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search workspaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Content Grid */}
      <AnimatePresence mode="popLayout">
        {filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-200 rounded-3xl bg-white/70 shadow-sm text-center"
          >
            <div className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
              <LayoutDashboard size={22} />
            </div>
            <p className="text-sm text-slate-700 font-bold">No workspaces found</p>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              {searchQuery || activeFilter !== 'ALL'
                ? 'Try adjusting your filters or search criteria.'
                : 'Create your first workshop or webinar using the "New Workspace" button above.'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const isWebinar = item.workshopType === 'WEBINAR';
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all group"
                >
                  {/* Banner / Cover Section */}
                  <div className="aspect-video w-full bg-slate-100 relative overflow-hidden">
                    {item.coverImageUrl ? (
                      <img
                        src={item.coverImageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className={`h-full w-full flex items-center justify-center opacity-80 ${isWebinar
                          ? 'bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600'
                          : 'bg-gradient-to-tr from-orange-400 via-rose-500 to-purple-600'
                        }`}>
                        <span className="text-white/35 font-black text-4xl uppercase tracking-wider select-none">
                          {isWebinar ? 'Live' : 'Studio'}
                        </span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3.5 right-3.5 flex gap-1.5">
                      <span className="inline-flex items-center text-[10px] font-extrabold px-3 py-1 rounded-full border bg-white/95 text-slate-800 shadow-sm uppercase border-slate-100">
                        {item.status || 'Active'}
                      </span>
                    </div>

                    {/* Role Badge */}
                    <div className="absolute bottom-3.5 left-3.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-3 py-1 rounded-full border shadow-sm uppercase ${item.role === 'OWNER'
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

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase ${isWebinar
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
                      </div>

                      <h3 className="font-bold text-slate-800 text-[15px] leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {item.title || 'Untitled Workspace'}
                      </h3>
                    </div>

                    <div className="space-y-2.5 pt-4 border-t border-slate-100">
                      {/* Stats Strip */}
                      <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400" />
                          <span>{item.sessionsCount || 0} Sessions</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BookOpen size={13} className="text-slate-400" />
                          <span>{item.resourcesCount || 0} Resources</span>
                        </div>
                      </div>

                      {/* Last updated */}
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                        <Clock size={12} className="text-slate-400" />
                        <span>Last updated {formatDate(item.updatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Link Footer */}
                  <div className="p-5 pt-0">
                    <button
                      onClick={() => router.push(`/studio/workshop/${item.id}`)}
                      className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-98"
                    >
                      Manage {isWebinar ? 'Webinar' : 'Workshop'} <ArrowRight size={13} />
                    </button>
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
