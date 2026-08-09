'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getWorkshopSummary, WorkshopSummary, deleteWorkshop } from '../api/dashboardApi';
import { updateWorkshop } from '../api/workshop';
import { toast } from 'sonner';
import { WorkshopWizard } from '../components/wizard/WorkshopWizard';
import RegisteredMembersPage from './participants/page';
import { WorkshopCollaboratorsManager } from '../components/wizard/review/WorkshopCollaboratorsManager';

import { api } from '@/infrastructure/http/api';
import { LayoutGrid, Tag, Settings, Users, UserCog } from 'lucide-react';

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatLanguage = (lang?: string) => {
  if (!lang) return 'EN';
  const l = lang.trim().toLowerCase();
  if (l === 'english') return 'EN';
  if (l === 'spanish') return 'ES';
  if (l === 'french') return 'FR';
  if (l === 'german') return 'DE';
  return l.substring(0, 2).toUpperCase();
};

type Tab = 'overview' | 'schedule' | 'pricing' | 'resources' | 'settings' | 'publish' | 'participants' | 'collaborators';

const TABS: { id: Tab; label: string; icon: React.ComponentType<any> }[] = [
  { id: 'overview',  label: 'Overview', icon: LayoutGrid },
  { id: 'pricing',   label: 'Pricing', icon: Tag },
  { id: 'settings',  label: 'Settings', icon: Settings },
  { id: 'participants', label: 'Manage Members', icon: Users },
  { id: 'collaborators', label: 'Collaborators', icon: UserCog },
];

const TAB_STEPS: Record<Tab, number> = {
  overview: 0,
  schedule: 1,
  pricing: 2,
  resources: -1, // Not implemented in Wizard yet
  settings: 3,
  publish: 4,
  participants: 6,
  collaborators: -1,
};

export default function SingleWorkshopDashboard() {
  const { id } = useParams();
  const router = useRouter();
  const [summary, setSummary] = useState<WorkshopSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [hasEditAccess, setHasEditAccess] = useState<boolean>(false);
  const [hasManageAccess, setHasManageAccess] = useState<boolean>(false);
  const [analytics, setAnalytics] = useState<{ totalRegistrations: number; totalRevenue: number } | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      // 1. Get presigned URL
      const { key, uploadUrl, publicUrl } = await api.post<any>('/api/media/presign', {
        fileName: file.name,
        contentType: file.type
      });

      // 2. Upload file via proxy
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadUrl', uploadUrl);

      const uploadRes = await fetch('/api/internal/media/upload', {
        method: 'POST',
        body: formData
      });
      if (!uploadRes.ok) throw new Error("Failed to upload file to storage");

      // 3. Register metadata
      await api.post('/api/media/metadata', {
        key,
        fileName: file.name,
        contentType: file.type,
        sizeBytes: file.size
      });

      // 4. Update workshop
      await updateWorkshop(id as string, { coverImageUrl: publicUrl });
      
      // Update local state summary
      setSummary(prev => prev ? { ...prev, coverImageUrl: publicUrl } : null);
      toast.success("Cover image updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploadingCover(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadSummary(id as string);
      api.get<boolean>(`/api/workshops/${id}/edit-access`)
        .then(res => setHasEditAccess(res))
        .catch(() => setHasEditAccess(false));
      api.get<boolean>(`/api/workshops/${id}/manage-access`)
        .then(res => setHasManageAccess(res))
        .catch(() => setHasManageAccess(false));
    }
  }, [id]);

  const allowedTabs = React.useMemo(() => {
    if (hasManageAccess) return TABS;
    return TABS.filter(t => t.id === 'overview');
  }, [hasManageAccess]);

  const loadSummary = async (workshopId: string) => {
    setLoading(true);
    try {
      const data = await getWorkshopSummary(workshopId);
      setSummary(data);
      try {
        const analyticsData = await api.get<any>(`/api/v1/workshops/${workshopId}/participants/analytics`);
        setAnalytics({
          totalRegistrations: analyticsData.totalRegistrations || 0,
          totalRevenue: analyticsData.totalRevenue || 0,
        });
      } catch (analyticsErr) {
        console.error('Failed to load workshop analytics:', analyticsErr);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this workshop?')) {
      try {
        await deleteWorkshop(id as string);
        router.push('/studio');
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-48 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-full" />
        <div className="h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-full" />
        <div className="h-96 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-full" />
      </div>
    );
  }

  if (!summary) return <div className="p-8 text-center text-zinc-500">Workshop not found</div>;

  const initialStep = TAB_STEPS[activeTab];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="px-6 md:px-8 pt-6 pb-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <Link href="/studio" className="hover:text-zinc-700 dark:hover:text-zinc-300">Studio</Link>
                <span>/</span>
                <span className="truncate max-w-[200px]">{summary.title || 'Workshop'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                  summary.status === 'PUBLISHED'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  {summary.status}
                </span>
                <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-xs">
                  {summary.title || 'Untitled Workshop'}
                </h1>
              </div>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              {hasEditAccess && (
                <>
                  <Link
                    href={`/studio/workshop/${summary.id}/edit`}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    ✏️ Edit Content
                  </Link>
                  {hasManageAccess && (
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </>
              )}
              <Link
                href={`/workshops/preview/${summary.id}`}
                target="_blank"
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium rounded-lg transition-colors"
              >
                Preview
              </Link>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-0 overflow-x-auto pb-4 mt-2">
            <div className="inline-flex items-center gap-1 rounded-full border border-zinc-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 p-1 shadow-[0_4px_14px_rgba(0,0,0,0.02)]">
              {allowedTabs.map(tab => {
                const active = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all whitespace-nowrap ${
                      active
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Icon size={16} className={active ? 'text-white' : 'text-zinc-400 dark:text-zinc-500'} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="bg-gray-50 dark:bg-zinc-950 min-h-[calc(100vh-200px)]">
        {activeTab === 'overview' ? (
          <div className="p-6 md:p-8 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overview info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cover Image / Thumbnail Section */}
              <div className="relative rounded-xl overflow-hidden h-48 bg-zinc-200 group border border-zinc-200 dark:border-zinc-800">
                {summary.coverImageUrl ? (
                  <img src={summary.coverImageUrl} alt={summary.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-zinc-400">
                    <svg className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-semibold">No cover image uploaded</span>
                  </div>
                )}

                {/* Edit overlay */}
                {hasManageAccess && (
                  <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                    {isUploadingCover ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="size-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span className="text-xs font-semibold">Uploading to R2...</span>
                      </div>
                    ) : (
                      <>
                        <svg className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-xs font-bold uppercase tracking-wider">{summary.coverImageUrl ? 'Change Cover' : 'Upload Cover'}</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      disabled={isUploadingCover}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4">Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">Visibility</div>
                    <div className="mt-1">
                      <span className="inline-flex items-center rounded-full bg-violet-50 dark:bg-violet-950/40 px-3 py-1 text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide">
                        {(summary.visibility || 'N/A').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">Delivery Mode</div>
                    <div className="mt-1">
                      <span className="inline-flex items-center rounded-full bg-violet-50 dark:bg-violet-950/40 px-3 py-1 text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide">
                        {(summary.deliveryMode || 'N/A').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">Language</div>
                    <div className="mt-1">
                      <span className="inline-flex items-center rounded-full bg-violet-50 dark:bg-violet-950/40 px-3 py-1 text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide">
                        {formatLanguage(summary.language)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">Type</div>
                    <div className="mt-1">
                      <span className="inline-flex items-center rounded-full bg-violet-50 dark:bg-violet-950/40 px-3 py-1 text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide">
                        {(summary.workshopType || 'N/A').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4">Statistics</h2>
                <div className={`grid gap-4 ${hasManageAccess ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3'}`}>
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Sessions</div>
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{summary.sessionsCount}</div>
                  </div>
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Resources</div>
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{summary.resourcesCount}</div>
                  </div>
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Registrations</div>
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{analytics ? analytics.totalRegistrations : 0}</div>
                  </div>
                  {hasManageAccess && (
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Revenue</div>
                      <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        ${analytics ? analytics.totalRevenue.toFixed(2) : '0.00'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick navigation to other tabs */}
              {hasManageAccess && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4">Complete Your Setup</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { tab: 'schedule' as Tab, name: 'Schedule & Sessions', complete: summary.scheduleComplete },
                      { tab: 'pricing' as Tab, name: 'Pricing', complete: summary.pricingComplete },
                      { tab: 'resources' as Tab, name: 'Resources', complete: summary.resourcesComplete },
                      { tab: 'settings' as Tab, name: 'Settings', complete: summary.settingsComplete },
                      { tab: 'publish' as Tab, name: 'Review & Publish', complete: summary.status === 'PUBLISHED' },
                    ].map(item => (
                      <button
                        key={item.tab}
                        onClick={() => setActiveTab(item.tab)}
                        className="flex items-center justify-between p-3 border border-zinc-100 dark:border-zinc-800 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors group text-left"
                      >
                        <span className="font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 text-sm">{item.name}</span>
                        {item.complete ? (
                          <svg className="h-5 w-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-zinc-300 dark:text-zinc-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-3">Setup Progress</h2>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Completion</span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{summary.completionPercentage}%</span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${summary.completionPercentage}%` }}
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4">Recent Activity</h2>
                <div className="relative border-l-2 border-violet-100 dark:border-violet-950/60 ml-3.5 space-y-6 pb-2">
                  {summary.recentActivity.map((log, idx) => (
                    <div key={idx} className="relative pl-6">
                      <div className="absolute -left-[5px] mt-1 w-2.5 h-2.5 bg-violet-600 rounded-full" />
                      <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-none">{log.action}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{log.description}</div>
                      <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                        {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(log.timestamp))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'participants' ? (
          <div className="p-6 md:p-8 max-w-7xl mx-auto h-[calc(100vh-250px)]">
            <RegisteredMembersPage />
          </div>
        ) : activeTab === 'collaborators' ? (
          <div className="p-6 md:p-8 max-w-7xl mx-auto h-[calc(100vh-250px)]">
            <WorkshopCollaboratorsManager workshopId={id as string} />
          </div>
        ) : (
          /* Wizard steps embedded inline */
          <WorkshopWizard
            key={activeTab}
            workshopId={id as string}
            initialStep={initialStep}
          />
        )}
      </div>
    </div>
  );
}
