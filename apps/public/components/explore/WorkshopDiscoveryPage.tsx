'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useWorkshopDiscovery } from '@/app/(authenticated)/studio/workshop/hooks/useWorkshopDiscovery';
import { Workshop, WorkshopType } from '@/app/(authenticated)/studio/workshop/types';

const THEMES = [
  { border: '#8B5CF6', bg: '#F5F3FF', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' }, // Purple - Code
  { border: '#3B82F6', bg: '#EFF6FF', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' }, // Blue - Layout
  { border: '#10B981', bg: '#ECFDF5', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' }, // Emerald - Calendar/Planning
  { border: '#EC4899', bg: '#FDF2F8', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' }, // Pink - Vision/AI
  { border: '#F59E0B', bg: '#FFFBEB', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }, // Amber - Chart/Stats
  { border: '#14B8A6', bg: '#F0FDFA', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4' }, // Teal - DB/Layers
];

export default function WorkshopDiscoveryPage() {
  const {
    workshops,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedType,
    setSelectedType,
    refetch
  } = useWorkshopDiscovery();

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'development', label: 'Development' },
    { value: 'design', label: 'Design' },
    { value: 'business', label: 'Business' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'ai', label: 'Artificial Intelligence' }
  ];

  const types = [
    { value: 'all', label: 'All Types' },
    { value: WorkshopType.WORKSHOP, label: 'Workshop' },
    { value: WorkshopType.BOOTCAMP, label: 'Bootcamp' },
    { value: WorkshopType.MASTERCLASS, label: 'Masterclass' },
    { value: WorkshopType.WEBINAR, label: 'Webinar' },
    { value: WorkshopType.AMA, label: 'AMA' }
  ];

  return (
    <div className="w-full bg-transparent font-sans pb-16 pt-2">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Subtle Filter Bar */}
        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by title, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 text-xs w-4 h-4 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-48 py-2.5 px-3 bg-gray-50 border border-transparent rounded-xl text-gray-700 text-sm focus:outline-none focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full md:w-40 py-2.5 px-3 bg-gray-50 border border-transparent rounded-xl text-gray-700 text-sm focus:outline-none focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
          >
            {types.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 h-56 space-y-4 shadow-sm animate-pulse flex flex-col justify-between">
                <div>
                  <div className="flex justify-between mb-4">
                    <div className="w-3/4 h-5 bg-gray-100 rounded-md" />
                    <div className="w-16 h-4 bg-gray-100 rounded-md" />
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-3 bg-gray-50 rounded-md" />
                    <div className="w-4/5 h-3 bg-gray-50 rounded-md" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="w-24 h-8 bg-gray-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-500 p-6 rounded-2xl text-center space-y-3 max-w-xl mx-auto border border-red-100">
            <p className="font-medium text-sm">{error}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 font-semibold text-xs rounded-lg transition-all"
            >
              Try Again
            </button>
          </div>
        ) : workshops.length === 0 ? (
          <div className="bg-white border border-gray-100 shadow-sm p-12 rounded-2xl text-center space-y-3 max-w-lg mx-auto">
            <h3 className="text-lg font-semibold text-gray-900">No bootcamps found</h3>
            <p className="text-gray-500 text-sm">
              {searchQuery || selectedCategory !== 'all' || selectedType !== 'all'
                ? 'Try adjusting your filters or search query.'
                : 'There are currently no published bootcamps in the system.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshops.map((workshop, idx) => (
              <WorkshopCard key={workshop.id} workshop={workshop} idx={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WorkshopCard({ workshop, idx }: { workshop: Workshop; idx: number }) {
  const theme = THEMES[idx % THEMES.length];
  // Calculate duration or fallback
  const duration = workshop.sessions ? `${workshop.sessions.length} Days` : 'Self-paced';

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-sm group"
      style={{
        border: '1px solid #F3F4F6',
        borderLeft: `6px solid ${theme.border}`,
        minHeight: '220px',
      }}
    >
      {/* Background Graphic */}
      <div 
        className="absolute bottom-4 left-4 opacity-10 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
        style={{ color: theme.border }}
      >
        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d={theme.icon} />
        </svg>
      </div>

      <div className="p-6 pb-2 z-10 flex-1 flex flex-col">
        {/* Top Header Row */}
        <div className="flex justify-between items-start gap-4 mb-3">
          <h3 className="text-[17px] font-bold text-gray-900 leading-tight">
            {workshop.title}
          </h3>
          <span className="text-xs font-semibold text-gray-500 whitespace-nowrap bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
            {duration}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-500 text-[13px] leading-relaxed line-clamp-3">
          {workshop.description || 'Build modern skills from architectural design to deployment.'}
        </p>
      </div>

      {/* Footer / CTA */}
      <div className="p-6 pt-4 flex justify-end z-10">
        <Link
          href={`/workshop/${workshop.id}`}
          className="px-5 py-1.5 font-semibold text-sm rounded-lg border transition-all flex items-center justify-center bg-white hover:shadow-md"
          style={{
            color: theme.border,
            borderColor: theme.border + '40', // 25% opacity hex
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.bg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
          }}
        >
          Register
        </Link>
      </div>
    </motion.div>
  );
}

