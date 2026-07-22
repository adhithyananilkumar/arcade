'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDashboardWorkshops, WorkshopPage, DashboardFilter, deleteWorkshop } from './api/dashboardApi';
import WorkshopCard from './components/dashboard/WorkshopCard';
import EmptyState from './components/dashboard/EmptyState';

export default function WorkshopDashboardPage() {
  const [workshops, setWorkshops] = useState<WorkshopPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DashboardFilter>({
    page: 0,
    size: 20,
    sortBy: 'createdAt',
    sortDir: 'desc'
  });
  const [currentTab, setCurrentTab] = useState('ALL');
  
  const loadWorkshops = async () => {
    setLoading(true);
    try {
      const data = await getDashboardWorkshops(filter);
      setWorkshops(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkshops();
  }, [filter]);

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    setFilter(prev => ({
      ...prev,
      status: tab === 'ALL' ? undefined : tab,
      page: 0
    }));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(prev => ({
      ...prev,
      search: e.target.value || undefined,
      page: 0
    }));
  };

  const handleDuplicate = async (id: string) => {
    try {
      await fetch(`/api/workshops/${id}/duplicate`, { method: 'POST' });
      loadWorkshops();
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await fetch(`/api/workshops/${id}/archive`, { method: 'PATCH' });
      loadWorkshops();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this workshop?')) {
      try {
        await deleteWorkshop(id);
        loadWorkshops();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const tabs = ['ALL', 'DRAFT', 'PUBLISHED', 'ARCHIVED', 'COMPLETED'];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Workshops</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage all your created workshops.</p>
        </div>
        <Link 
          href="/studio/workshop/new" 
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create Workshop
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800 mb-6 overflow-x-auto pb-px">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
              currentTab === tab 
                ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500' 
                : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-300'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-zinc-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
            placeholder="Search workshops by title..."
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Loading & Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-zinc-100 dark:bg-zinc-800 rounded-xl h-64 animate-pulse"></div>
          ))}
        </div>
      ) : workshops && workshops.content.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {workshops.content.map(workshop => (
            <WorkshopCard
              key={workshop.id}
              workshop={workshop}
              onDuplicate={handleDuplicate}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
