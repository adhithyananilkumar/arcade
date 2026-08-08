'use client';

import { useState } from 'react';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Meh,
  ThumbsDown,
  Tag,
  CheckCircle2,
  CornerDownRight,
  Send,
  Filter,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export interface ReviewItem {
  id: string;
  learnerName: string;
  learnerAvatar: string;
  courseName: string;
  rating: number;
  date: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'CONSTRUCTIVE';
  reviewText: string;
  instructorResponse?: string;
}

const mockReviews: ReviewItem[] = [
  {
    id: 'rev-1',
    learnerName: 'Marcus Vance',
    learnerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    courseName: 'AI Agent Architecture & Tool Use Masterclass',
    rating: 5,
    date: '2 hours ago',
    sentiment: 'POSITIVE',
    reviewText:
      'Hands down the single best enterprise AI course I have taken! The hands-on labs with vector search and multi-agent coordination were immediately applicable to our engineering team.',
    instructorResponse:
      'Thank you Marcus! So glad the multi-agent labs resonated with your engineering workflow.',
  },
  {
    id: 'rev-2',
    learnerName: 'Sophia Lin',
    learnerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    courseName: 'Prompt Engineering & Context Window Optimization',
    rating: 5,
    date: '1 day ago',
    sentiment: 'POSITIVE',
    reviewText:
      'Extremely clear explanations and excellent benchmark datasets provided. Learned how to cut our token costs by 40% using prompt caching.',
  },
  {
    id: 'rev-3',
    learnerName: 'David K.',
    learnerAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80',
    courseName: 'Neural Networks from Scratch in Python',
    rating: 4,
    date: '3 days ago',
    sentiment: 'CONSTRUCTIVE',
    reviewText:
      'Great math breakdown in Module 3. Would love to see additional PyTorch GPU acceleration examples in the bonus section!',
  },
];

export function ReviewsFeedbackSection() {
  const [reviews, setReviews] = useState<ReviewItem[]>(mockReviews);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  const handleSendResponse = (id: string) => {
    if (!replyText[id]?.trim()) return;
    setReviews(
      reviews.map((r) =>
        r.id === id ? { ...r, instructorResponse: replyText[id] } : r,
      ),
    );
    toast.success('Instructor response posted');
    setActiveReplyId(null);
    setReplyText({ ...replyText, [id]: '' });
  };

  const ratingDistribution = [
    { stars: 5, percentage: 88, count: 3379 },
    { stars: 4, percentage: 8, count: 307 },
    { stars: 3, percentage: 2, count: 76 },
    { stars: 2, percentage: 1, count: 48 },
    { stars: 1, percentage: 1, count: 30 },
  ];

  const topics = ['Hands-on Labs', 'AI Code Assistant', 'Clear Explanations', 'Real Projects', 'Token Cost Reduction'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-black tracking-tight text-[#14142b]">
          Learner Reviews & Feedback Analysis
        </h2>
        <p className="text-xs font-semibold text-slate-500">
          Sentiment insights, ratings breakdown, and direct learner engagement
        </p>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 text-center">
          <p className="text-xs font-bold text-amber-700 uppercase">Average Rating</p>
          <p className="mt-1 text-3xl font-black text-[#14142b]">4.92</p>
          <div className="mt-1 flex items-center justify-center gap-0.5 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} className="fill-amber-400" />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/70 p-4 text-center">
          <p className="text-xs font-bold text-indigo-700 uppercase">Total Reviews</p>
          <p className="mt-1 text-3xl font-black text-[#14142b]">3,840</p>
          <p className="mt-1 text-[11px] font-semibold text-indigo-600">Across all courses</p>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4 text-center">
          <p className="text-xs font-bold text-emerald-700 uppercase flex items-center justify-center gap-1">
            <ThumbsUp size={13} /> Positive
          </p>
          <p className="mt-1 text-3xl font-black text-emerald-600">92%</p>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">3,532 reviews</p>
        </div>

        <div className="rounded-2xl border border-sky-200/80 bg-sky-50/70 p-4 text-center">
          <p className="text-xs font-bold text-sky-700 uppercase flex items-center justify-center gap-1">
            <Meh size={13} /> Neutral
          </p>
          <p className="mt-1 text-3xl font-black text-sky-600">5%</p>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">192 reviews</p>
        </div>

        <div className="rounded-2xl border border-rose-200/80 bg-rose-50/70 p-4 text-center">
          <p className="text-xs font-bold text-rose-700 uppercase flex items-center justify-center gap-1">
            <ThumbsDown size={13} /> Constructive
          </p>
          <p className="mt-1 text-3xl font-black text-rose-600">3%</p>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">116 reviews</p>
        </div>
      </div>

      {/* Breakdown Grid: Rating Bars & Mentioned Topics */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Rating Distribution Bars */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs lg:col-span-2 space-y-3">
          <h3 className="text-sm font-extrabold text-[#14142b]">Rating Distribution</h3>
          <div className="space-y-2.5">
            {ratingDistribution.map((dist) => (
              <div key={dist.stars} className="flex items-center gap-3 text-xs font-bold">
                <span className="w-12 text-slate-600 flex items-center gap-1">
                  {dist.stars} <Star size={12} className="fill-amber-400 text-amber-400" />
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${dist.percentage}%` }}
                  />
                </div>
                <span className="w-16 text-right text-slate-400 font-semibold">{dist.percentage}% ({dist.count})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Mentioned Topics */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-extrabold text-[#14142b] flex items-center gap-2">
            <Tag size={16} className="text-indigo-600" />
            Most Mentioned Topics
          </h3>
          <div className="flex flex-wrap gap-2 pt-1">
            {topics.map((topic) => (
              <span
                key={topic}
                className="rounded-xl border border-indigo-200/60 bg-indigo-50/70 px-3 py-1.5 text-xs font-bold text-indigo-700"
              >
                #{topic}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Review Items List */}
      <div className="space-y-4">
        <h3 className="text-sm font-extrabold text-[#14142b]">Recent Learner Reviews</h3>
        {reviews.map((rev) => (
          <motion.div
            key={rev.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={rev.learnerAvatar}
                  alt={rev.learnerName}
                  className="h-10 w-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-sm font-extrabold text-[#14142b]">{rev.learnerName}</h4>
                  <p className="text-[11px] font-semibold text-indigo-600">{rev.courseName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={13} className="fill-amber-400" />
                  ))}
                </div>
                <span className="text-[11px] font-semibold text-slate-400">{rev.date}</span>
              </div>
            </div>

            <p className="text-xs font-medium leading-relaxed text-slate-700 bg-slate-50 p-4 rounded-2xl">
              "{rev.reviewText}"
            </p>

            {/* Instructor Response Box */}
            {rev.instructorResponse ? (
              <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-xs">
                <CornerDownRight size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-indigo-900">Instructor Response</p>
                  <p className="mt-1 text-indigo-800/90 font-medium">{rev.instructorResponse}</p>
                </div>
              </div>
            ) : (
              <div>
                {activeReplyId === rev.id ? (
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Write a response..."
                      value={replyText[rev.id] || ''}
                      onChange={(e) => setReplyText({ ...replyText, [rev.id]: e.target.value })}
                      className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => handleSendResponse(rev.id)}
                      className="rounded-2xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                    >
                      Post
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveReplyId(rev.id)}
                    className="text-xs font-extrabold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <MessageSquare size={13} /> Respond to Learner
                  </button>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
