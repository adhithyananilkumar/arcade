'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useWorkshopDiscovery } from '@/app/(authenticated)/studio/workshop/hooks/useWorkshopDiscovery';
import { Workshop, WorkshopType, DeliveryMode, Difficulty } from '@/app/(authenticated)/studio/workshop/types';

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
    <div className="min-h-screen bg-[#0a0d14] text-white py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Live & Hands-On Learning
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-gray-400">
            Workshop Discovery
          </h1>
          <p className="text-gray-400 text-base sm:text-lg">
            Explore live bootcamps, masterclasses, and intensive workshops hosted by expert instructors.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-[#121624] p-4 sm:p-6 rounded-2xl border border-gray-800/80 shadow-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <input
                type="text"
                placeholder="Search workshops by title, category, description, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#1a1f36] border border-gray-700/60 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-white text-xs bg-gray-800 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-3 px-3 bg-[#1a1f36] border border-gray-700/60 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-[#121624]">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full py-3 px-3 bg-[#1a1f36] border border-gray-700/60 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              >
                {types.map((t) => (
                  <option key={t.value} value={t.value} className="bg-[#121624]">
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[#121624] border border-gray-800 rounded-2xl p-5 space-y-4 animate-pulse">
                <div className="w-full h-44 bg-gray-800/60 rounded-xl" />
                <div className="h-4 bg-gray-800/60 rounded w-1/3" />
                <div className="h-6 bg-gray-800/60 rounded w-3/4" />
                <div className="h-4 bg-gray-800/60 rounded w-full" />
                <div className="h-10 bg-gray-800/60 rounded-xl w-full pt-2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-center space-y-4 max-w-xl mx-auto">
            <svg className="w-12 h-12 mx-auto text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-medium text-lg">{error}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-medium text-sm rounded-xl transition-all"
            >
              Try Again
            </button>
          </div>
        ) : workshops.length === 0 ? (
          <div className="bg-[#121624] border border-gray-800/80 p-12 rounded-2xl text-center space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-gray-800/60 text-gray-400 rounded-full flex items-center justify-center mx-auto text-2xl">
              🎓
            </div>
            <h3 className="text-xl font-bold text-white">No workshops available.</h3>
            <p className="text-gray-400 text-sm">
              {searchQuery || selectedCategory !== 'all' || selectedType !== 'all'
                ? 'No published workshops matched your search criteria. Try adjusting your filters.'
                : 'There are currently no published workshops in the system. Check back soon!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshops.map((workshop) => (
              <WorkshopCard key={workshop.id} workshop={workshop} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

function WorkshopCard({ workshop }: { workshop: Workshop }) {
  const isFree = workshop.price === 0 || !workshop.price;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-[#121624] border border-gray-800/80 hover:border-indigo-500/50 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl transition-all group"
    >
      <div>
        {/* Cover Image */}
        <div className="relative w-full h-44 bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-gray-900 overflow-hidden">
          {workshop.coverImageUrl ? (
            <img
              src={workshop.coverImageUrl}
              alt={workshop.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl opacity-30 select-none">
              🚀
            </div>
          )}

          {/* Price Badge */}
          <div className="absolute top-3 right-3 px-3 py-1 bg-black/70 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/10">
            {isFree ? 'FREE' : `${workshop.currency || '$'}${workshop.price}`}
          </div>

          {/* Workshop Type Badge */}
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-indigo-600/90 backdrop-blur-md rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white">
            {workshop.workshopType || 'WORKSHOP'}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          
          {/* Metadata Badges */}
          <div className="flex flex-wrap gap-2 text-[11px] font-medium text-gray-400">
            <span className="px-2 py-0.5 bg-gray-800/80 rounded border border-gray-700/50">
              {workshop.category}
            </span>
            <span className="px-2 py-0.5 bg-gray-800/80 rounded border border-gray-700/50">
              {workshop.deliveryMode || 'ONLINE'}
            </span>
            <span className="px-2 py-0.5 bg-gray-800/80 rounded border border-gray-700/50">
              {workshop.difficulty || 'BEGINNER'}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2">
            {workshop.title}
          </h3>

          {/* Description */}
          <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
            {workshop.description || 'No description provided.'}
          </p>

          {/* Tags */}
          {workshop.tags && workshop.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {workshop.tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="text-[10px] text-indigo-300/80 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer / CTA */}
      <div className="p-5 pt-0 border-t border-gray-800/40 flex items-center justify-between mt-4">
        <div className="text-xs text-gray-400">
          <span className="block text-[10px] text-gray-500 uppercase font-semibold">Language</span>
          <span className="font-medium text-gray-300">{workshop.language?.toUpperCase() || 'EN'}</span>
        </div>

        <Link
          href={`/workshop/${workshop.id}`}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5"
        >
          View Workshop
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </motion.div>
  );
}
