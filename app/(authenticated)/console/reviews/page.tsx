'use client';

import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { notFound } from 'next/navigation';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';
import { ReviewQueue } from './components/ReviewQueue';

import { useQuery } from '@tanstack/react-query';
import { ReviewApi } from '@/shared/api/review.api';
import { Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function PlatformReviewsPage() {
  const { user } = useAuthStore();
  
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['platform-reviews'],
    queryFn: ReviewApi.listPendingReviews
  });

  const reviews = reviewsData ? [...reviewsData].sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()) : [];

  if (!AuthorizationService.canReviewCourses(user)) {
    notFound();
  }

  const oldestReview = reviews.length > 0 ? reviews[0] : null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-8"
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Platform Reviews</h1>
        <p className="text-gray-500">Manage all course submissions for platform approval.</p>
      </div>
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <BookOpen size={20} />
            </div>
            <h3 className="font-semibold text-gray-700">Pending Reviews</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 ml-13">
            {isLoading ? "..." : reviews.length}
          </p>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock size={20} />
            </div>
            <h3 className="font-semibold text-gray-700">Oldest Submission</h3>
          </div>
          <p className="text-xl font-bold text-gray-900 ml-13 mt-1">
            {isLoading ? "..." : oldestReview ? formatDistanceToNow(new Date(oldestReview.submittedAt), { addSuffix: true }) : "N/A"}
          </p>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <AlertCircle size={20} />
            </div>
            <h3 className="font-semibold text-gray-700">Needs Attention</h3>
          </div>
          <p className="text-xl font-bold text-gray-900 ml-13 mt-1">
            {isLoading ? "..." : reviews.filter(r => new Date(r.submittedAt).getTime() < Date.now() - 3 * 24 * 60 * 60 * 1000).length} 
            <span className="text-sm font-normal text-gray-500 ml-2">({'>'} 3 days)</span>
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-indigo-200 bg-white p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <BookOpen size={120} className="text-indigo-600" />
        </div>
        <div className="relative z-10 mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen size={20} className="text-indigo-600" />
            Review Queue
          </h3>
          <p className="text-sm text-gray-500 mt-1">Review pending courses submitted by channels.</p>
        </div>
        <div className="relative z-10">
          <ReviewQueue />
        </div>
      </div>
    </motion.div>
  );
}
