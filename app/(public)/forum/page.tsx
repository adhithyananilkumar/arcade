'use client';

import { useState, Suspense } from 'react';
import { PostCreateCard, FeedPostCard, LoadingSkeleton, EmptyState, useForumFeed } from "@/domains/community";
import { Sparkles, TrendingUp, Clock, Flame } from 'lucide-react';

const FEED_TABS = [
  { key: 'recent', label: 'Recent Discussions', icon: <Clock className="w-4 h-4" /> },
  { key: 'trending', label: 'Trending & Top', icon: <TrendingUp className="w-4 h-4" /> },
];

function ForumPageContent() {
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(0);
  const { data, isLoading } = useForumFeed(sort, page);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Banner / Header */}
      <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/10 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-2">
            <Flame className="w-4 h-4 text-orange-400" />
            Arcade Creator Community
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">
            Community Forum & Social Feed
          </h1>
          <p className="text-blue-100 text-sm max-w-xl font-normal leading-relaxed">
            Discover projects, ask questions, give reactions, and share knowledge with creators worldwide. Open for everyone to explore!
          </p>
        </div>
        {/* Decorative background circle */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* Post Creator Card */}
      <PostCreateCard />

      {/* Feed Tabs Bar */}
      <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          {FEED_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setSort(tab.key);
                setPage(0);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                sort === tab.key
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-neutral-800/80 text-slate-600 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        <div className="text-xs font-medium text-slate-400 dark:text-neutral-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Real-time community feed</span>
        </div>
      </div>

      {/* Posts Stream */}
      {isLoading ? (
        <LoadingSkeleton count={4} />
      ) : !data || data.content.length === 0 ? (
        <EmptyState
          title="No discussions yet"
          description="Be the first creator to start a conversation in this feed!"
          cta={{ label: 'Start a discussion above', href: '#' }}
        />
      ) : (
        <div className="space-y-4">
          {data.content.map((post) => (
            <FeedPostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-neutral-800">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-5 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-xs font-semibold text-slate-700 dark:text-neutral-200 disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-sm"
          >
            Previous Page
          </button>
          <span className="text-xs font-medium text-slate-500 dark:text-neutral-400">
            Page {page + 1} of {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={data.last}
            className="px-5 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-xs font-semibold text-slate-700 dark:text-neutral-200 disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-sm"
          >
            Next Page
          </button>
        </div>
      )}
    </div>
  );
}

export default function ForumPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-400">Loading community forum...</div>}>
      <ForumPageContent />
    </Suspense>
  );
}
