'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getWorkshopSummary, WorkshopSummary, deleteWorkshop } from '../api/dashboardApi';
import { WorkshopWizard } from '../components/wizard/WorkshopWizard';

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

type Tab = 'overview' | 'schedule' | 'pricing' | 'resources' | 'settings' | 'publish';

const TABS: { id: Tab; label: string; step: number }[] = [
  { id: 'overview',  label: 'Overview',          step: 0 },
  { id: 'schedule',  label: 'Schedule',           step: 1 },
  { id: 'pricing',   label: 'Pricing',            step: 2 },
  { id: 'resources', label: 'Resources',          step: 3 },
  { id: 'settings',  label: 'Settings',           step: 4 },
  { id: 'publish',   label: 'Review & Publish',   step: 5 },
];

export default function SingleWorkshopDashboard() {
  const { id } = useParams();
  const router = useRouter();
  const [summary, setSummary] = useState<WorkshopSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  useEffect(() => {
    if (id) loadSummary(id as string);
  }, [id]);

  const loadSummary = async (workshopId: string) => {
    setLoading(true);
    try {
      const data = await getWorkshopSummary(workshopId);
      setSummary(data);
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

  const activeTabData = TABS.find(t => t.id === activeTab)!;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="px-6 md:px-8 pt-6 pb-0">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/studio')}
                className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1"
              >
                ← Studio
              </button>
              <span className="text-zinc-300 dark:text-zinc-600">/</span>
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
              <Link
                href={`/studio/workshop/${summary.id}/edit`}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
              >
                ✏️ Edit Content
              </Link>
              <Link
                href={`/workshops/preview/${summary.id}`}
                target="_blank"
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium rounded-lg transition-colors"
              >
                Preview
              </Link>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-0 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="bg-gray-50 dark:bg-zinc-950 min-h-[calc(100vh-200px)]">
        {activeTab === 'overview' ? (
          <div className="p-6 md:p-8 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overview info */}
            <div className="lg:col-span-2 space-y-6">
              {summary.coverImageUrl && (
                <div className="rounded-xl overflow-hidden h-48 bg-zinc-200">
                  <img src={summary.coverImageUrl} alt={summary.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4">Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Visibility</div>
                    <div className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">{summary.visibility || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Delivery Mode</div>
                    <div className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">{summary.deliveryMode || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Language</div>
                    <div className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">{summary.language || 'English'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Type</div>
                    <div className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">{summary.workshopType || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4">Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Sessions</div>
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{summary.sessionsCount}</div>
                  </div>
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Resources</div>
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{summary.resourcesCount}</div>
                  </div>
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg opacity-50">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Registrations</div>
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">-</div>
                  </div>
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg opacity-50">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Revenue</div>
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">-</div>
                  </div>
                </div>
              </div>

              {/* Quick navigation to other tabs */}
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
                <div className="relative border-l border-zinc-200 dark:border-zinc-700 ml-3 space-y-4 pb-2">
                  {summary.recentActivity.map((log, idx) => (
                    <div key={idx} className="relative pl-6">
                      <div className="absolute -left-1.5 mt-1.5 w-3 h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full border-2 border-white dark:border-zinc-900" />
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{log.action}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{log.description}</div>
                      <div className="text-xs text-zinc-400 dark:text-zinc-500">
                        {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(log.timestamp))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Wizard steps embedded inline */
          <WorkshopWizard
            workshopId={id as string}
            initialStep={activeTabData.step}
          />
        )}
      </div>
    </div>
  );
}
