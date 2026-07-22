'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getWorkshopSummary, WorkshopSummary, deleteWorkshop } from '../api/dashboardApi';
import { format } from 'date-fns';

export default function SingleWorkshopDashboard() {
  const { id } = useParams();
  const router = useRouter();
  const [summary, setSummary] = useState<WorkshopSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadSummary(id as string);
    }
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
        router.push('/studio/workshop');
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-48 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="h-64 bg-zinc-100 dark:bg-zinc-800 rounded-xl"></div>
            <div className="h-64 bg-zinc-100 dark:bg-zinc-800 rounded-xl"></div>
          </div>
          <div className="space-y-6">
            <div className="h-96 bg-zinc-100 dark:bg-zinc-800 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) return <div className="p-8 text-center text-zinc-500">Workshop not found</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="h-32 md:h-48 bg-zinc-100 dark:bg-zinc-800 relative w-full overflow-hidden">
          {summary.coverImageUrl && (
            <img src={summary.coverImageUrl} alt={summary.title} className="object-cover w-full h-full" />
          )}
        </div>
        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-end -mt-12 md:-mt-16 relative">
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex-1 max-w-2xl">
            <div className="flex gap-2 items-center mb-2">
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {summary.status}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {summary.category} • {summary.workshopType}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              {summary.title || 'Untitled Workshop'}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Created {format(new Date(summary.createdAt), 'MMM d, yyyy')} • Last updated {format(new Date(summary.updatedAt), 'MMM d, yyyy')}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <Link 
              href={`/studio/workshop/new?id=${summary.id}`}
              className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium rounded-lg transition-colors flex items-center justify-center flex-1 md:flex-initial"
            >
              Edit Wizard
            </Link>
            <Link 
              href={`/workshops/preview/${summary.id}`}
              target="_blank"
              className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium rounded-lg transition-colors flex items-center justify-center flex-1 md:flex-initial"
            >
              Preview
            </Link>
            <button 
              onClick={handleDelete}
              className="px-4 py-2 border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-medium rounded-lg transition-colors flex items-center justify-center flex-1 md:flex-initial"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Visibility</div>
                <div className="font-medium text-zinc-900 dark:text-zinc-100">{summary.visibility || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Delivery Mode</div>
                <div className="font-medium text-zinc-900 dark:text-zinc-100">{summary.deliveryMode || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Language</div>
                <div className="font-medium text-zinc-900 dark:text-zinc-100">{summary.language || 'English'}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Status</div>
                <div className="font-medium text-zinc-900 dark:text-zinc-100">{summary.status}</div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">Statistics</h2>
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
          
          {/* Management Navigation */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">Management</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: 'Basic Information', step: 1, complete: summary.basicInfoComplete },
                { name: 'Schedule', step: 2, complete: summary.scheduleComplete },
                { name: 'Resources', step: 3, complete: summary.resourcesComplete },
                { name: 'Pricing', step: 4, complete: summary.pricingComplete },
                { name: 'Settings', step: 5, complete: summary.settingsComplete },
                { name: 'Review & Publish', step: 6, complete: summary.status === 'PUBLISHED' },
              ].map(item => (
                <Link 
                  key={item.name}
                  href={`/studio/workshop/new?id=${summary.id}&step=${item.step}`}
                  className="flex items-center justify-between p-3 border border-zinc-100 dark:border-zinc-800 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors group"
                >
                  <span className="font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">{item.name}</span>
                  {item.complete ? (
                    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Setup Progress */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Setup Progress</h2>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Completion</span>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{summary.completionPercentage}%</span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${summary.completionPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">Recent Activity</h2>
            <div className="relative border-l border-zinc-200 dark:border-zinc-700 ml-3 space-y-6 pb-2">
              {summary.recentActivity.map((log, idx) => (
                <div key={idx} className="relative pl-6">
                  <div className="absolute -left-1.5 mt-1.5 w-3 h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full border-2 border-white dark:border-zinc-900"></div>
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{log.action}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{log.description}</div>
                  <div className="text-xs text-zinc-400 dark:text-zinc-500">{format(new Date(log.timestamp), 'MMM d, yyyy h:mm a')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
